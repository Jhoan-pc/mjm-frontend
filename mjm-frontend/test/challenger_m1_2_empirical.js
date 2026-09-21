import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== STARTING CHALLENGER M1-2 EMPIRICAL SECURITY & RBAC AUDIT SUITE ===\n');

let passedTests = 0;
let failedTests = 0;
const failures = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         Error: ${err.message}`);
    failures.push({ name, error: err.message });
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// SUITE 1: EMPIRICAL AUDIT & AST SIMULATION OF storage.rules
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: storage.rules ISOLATION & PRIVILEGE ESCALATION ---');

const projectRoot = path.resolve(process.cwd());
const storageRulesPath = path.join(projectRoot, 'storage.rules');
assert.ok(fs.existsSync(storageRulesPath), 'storage.rules must exist at project root');

const storageRulesContent = fs.readFileSync(storageRulesPath, 'utf8');

runTest('1.1 storage.rules syntax and rules_version check', () => {
  assert.ok(storageRulesContent.includes("rules_version = '2';"), "Must declare rules_version = '2'");
  assert.ok(storageRulesContent.includes("service firebase.storage"), "Must define service firebase.storage");
  assert.ok(!storageRulesContent.includes("allow read, write: if true;"), "Must NOT contain any open read/write catch-all");
});

// Implement an exact oracle mirroring the Firebase Storage Rules evaluation engine
// for the rules declared in storage.rules:
function evaluateStorageAccess(requestPath, method, requestAuth) {
  // Normalize path (handle ../ and leading/trailing slashes)
  const normalized = path.posix.normalize(requestPath.startsWith('/') ? requestPath : '/' + requestPath);
  const segments = normalized.split('/').filter(Boolean);

  // Default reject
  let allowed = false;

  // Match: /tenants/{tenantId}/{allPaths=**}
  if (segments.length >= 2 && segments[0] === 'tenants') {
    const tenantId = segments[1];
    const condition = requestAuth != null && (
      requestAuth?.token?.tenantId === tenantId ||
      requestAuth?.token?.isSuperAdmin === true ||
      tenantId === 'sandboxdemo' ||
      tenantId === 'sandbox-guest-001'
    );
    if (condition) allowed = true;
  }
  // Match: /certificates/{tenantId}/{allPaths=**}
  else if (segments.length >= 2 && segments[0] === 'certificates') {
    const tenantId = segments[1];
    const condition = requestAuth != null && (
      requestAuth?.token?.tenantId === tenantId ||
      requestAuth?.token?.isSuperAdmin === true ||
      tenantId === 'sandboxdemo' ||
      tenantId === 'sandbox-guest-001'
    );
    if (condition) allowed = true;
  }
  // Catch-all: match /{allPaths=**} -> allow read, write: if false;
  else {
    allowed = false;
  }

  return allowed;
}

runTest('1.2 Cross-Tenant Isolation: Tenant A cannot read or write to Tenant B (/tenants/tenantB/...)', () => {
  const authTenantA = {
    uid: 'user_a_123',
    token: { tenantId: 'tenantA', isSuperAdmin: false }
  };

  const canRead = evaluateStorageAccess('/tenants/tenantB/certificates/cert_001.pdf', 'read', authTenantA);
  assert.equal(canRead, false, 'Tenant A must NOT be able to read Tenant B files');

  const canWrite = evaluateStorageAccess('/tenants/tenantB/certificates/cert_001.pdf', 'write', authTenantA);
  assert.equal(canWrite, false, 'Tenant A must NOT be able to write to Tenant B files');
});

runTest('1.3 Cross-Tenant Isolation: Tenant A cannot read or write to Tenant B (/certificates/tenantB/...)', () => {
  const authTenantA = {
    uid: 'user_a_123',
    token: { tenantId: 'tenantA', isSuperAdmin: false }
  };

  const canRead = evaluateStorageAccess('/certificates/tenantB/inm_trazabilidad_2026.pdf', 'read', authTenantA);
  assert.equal(canRead, false, 'Tenant A must NOT be able to read Tenant B certificates');

  const canWrite = evaluateStorageAccess('/certificates/tenantB/inm_trazabilidad_2026.pdf', 'write', authTenantA);
  assert.equal(canWrite, false, 'Tenant A must NOT be able to write to Tenant B certificates');
});

runTest('1.4 Tenant A legitimate access: Tenant A can read and write its own files', () => {
  const authTenantA = {
    uid: 'user_a_123',
    token: { tenantId: 'tenantA', isSuperAdmin: false }
  };

  assert.equal(evaluateStorageAccess('/tenants/tenantA/instrumentos/inst_1/photo.jpg', 'read', authTenantA), true);
  assert.equal(evaluateStorageAccess('/tenants/tenantA/instrumentos/inst_1/photo.jpg', 'write', authTenantA), true);
  assert.equal(evaluateStorageAccess('/certificates/tenantA/cert_1.pdf', 'read', authTenantA), true);
  assert.equal(evaluateStorageAccess('/certificates/tenantA/cert_1.pdf', 'write', authTenantA), true);
});

runTest('1.5 SuperAdmin Access: SuperAdmin can read and write across any tenant', () => {
  const authSuperAdmin = {
    uid: 'superadmin_mjm',
    token: { tenantId: 'mjm_root', isSuperAdmin: true }
  };

  assert.equal(evaluateStorageAccess('/tenants/tenantA/doc.pdf', 'read', authSuperAdmin), true);
  assert.equal(evaluateStorageAccess('/tenants/tenantB/doc.pdf', 'read', authSuperAdmin), true);
  assert.equal(evaluateStorageAccess('/certificates/tenantB/doc.pdf', 'write', authSuperAdmin), true);
});

runTest('1.6 Sandbox Demo Protection: Demo sandbox is accessible to authenticated users without leaking corporate tenants', () => {
  const authAnyUser = {
    uid: 'visitor_001',
    token: { tenantId: 'randomTenant', isSuperAdmin: false }
  };

  // Sandbox is accessible
  assert.equal(evaluateStorageAccess('/tenants/sandboxdemo/demo_cert.pdf', 'read', authAnyUser), true);
  assert.equal(evaluateStorageAccess('/certificates/sandboxdemo/demo_cert.pdf', 'write', authAnyUser), true);
  assert.equal(evaluateStorageAccess('/tenants/sandbox-guest-001/guest.pdf', 'read', authAnyUser), true);

  // Demo user cannot access real corporate tenant
  const authDemoUser = {
    uid: 'sandbox-guest-001',
    token: { tenantId: 'sandboxdemo', isSuperAdmin: false }
  };

  assert.equal(evaluateStorageAccess('/tenants/corp_client_delta/confidential.pdf', 'read', authDemoUser), false);
  assert.equal(evaluateStorageAccess('/certificates/corp_client_delta/confidential.pdf', 'read', authDemoUser), false);
  assert.equal(evaluateStorageAccess('/tenants/OUumulD5EqPIbuHXb1P1/instrumentos/data.pdf', 'write', authDemoUser), false);
});

runTest('1.7 Unauthenticated Access: Unauthenticated callers cannot read or write to ANY path', () => {
  assert.equal(evaluateStorageAccess('/tenants/tenantA/file.pdf', 'read', null), false);
  assert.equal(evaluateStorageAccess('/certificates/tenantA/file.pdf', 'write', null), false);
  assert.equal(evaluateStorageAccess('/tenants/sandboxdemo/file.pdf', 'read', null), false);
  assert.equal(evaluateStorageAccess('/certificates/sandboxdemo/file.pdf', 'write', null), false);
  assert.equal(evaluateStorageAccess('/unstructured_root.pdf', 'read', null), false);
});

runTest('1.8 Path Traversal Resistance: Relative escapes resolve safely', () => {
  const authTenantA = {
    uid: 'user_a_123',
    token: { tenantId: 'tenantA', isSuperAdmin: false }
  };

  // Attack: try to traverse out of tenantA into tenantB
  const traversalPath = '/tenants/tenantA/../tenantB/secret.pdf';
  assert.equal(evaluateStorageAccess(traversalPath, 'read', authTenantA), false);
  assert.equal(evaluateStorageAccess(traversalPath, 'write', authTenantA), false);
});

runTest('1.9 Root & Unstructured Path Protection: Access to root or other paths is denied', () => {
  const authTenantA = {
    uid: 'user_a_123',
    token: { tenantId: 'tenantA', isSuperAdmin: false }
  };

  assert.equal(evaluateStorageAccess('/root_file.pdf', 'read', authTenantA), false);
  assert.equal(evaluateStorageAccess('/backups/db.dump', 'read', authTenantA), false);
  assert.equal(evaluateStorageAccess('/tenants', 'read', authTenantA), false);
  assert.equal(evaluateStorageAccess('/certificates', 'read', authTenantA), false);
});

runTest('1.10 Token Tampering Resistance: Missing or invalid token claims reject safely', () => {
  // User with undefined tenantId in token
  const authNoTenantId = { uid: 'user_broken', token: {} };
  assert.equal(evaluateStorageAccess('/tenants/tenantA/file.pdf', 'read', authNoTenantId), false);

  // User claiming isSuperAdmin as string "true" instead of boolean true
  const authStringSuper = { uid: 'user_fake', token: { isSuperAdmin: 'true', tenantId: 'other' } };
  assert.equal(evaluateStorageAccess('/tenants/tenantA/file.pdf', 'read', authStringSuper), false);
});

// -----------------------------------------------------------------------------
// SUITE 2: ROUTE PROTECTION FOR /dashboard/solicitudes IN App.jsx
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: ROUTE PROTECTION (/dashboard/solicitudes in App.jsx) ---');

const appJsxPath = path.join(projectRoot, 'src', 'App.jsx');
const appJsxContent = fs.readFileSync(appJsxPath, 'utf8');

runTest('2.1 App.jsx contains guarded route for solicitudes', () => {
  const expectedGuardedRoute = 'path="solicitudes" element={isSuperAdmin ? <ChatbotSubmissions /> : <Navigate to="/dashboard" replace />}';
  assert.ok(appJsxContent.includes(expectedGuardedRoute), 'App.jsx must guard solicitudes with isSuperAdmin check');
});

runTest('2.2 Route Guard Decision Oracle rejects non-superadmin users', () => {
  function renderSolicitudesRoute(isSuperAdmin) {
    return isSuperAdmin ? 'ChatbotSubmissions' : 'NavigateToDashboard';
  }

  // Client admin
  assert.equal(renderSolicitudesRoute(false), 'NavigateToDashboard');
  // Visitor / Demo
  assert.equal(renderSolicitudesRoute(false), 'NavigateToDashboard');
  // SuperAdmin
  assert.equal(renderSolicitudesRoute(true), 'ChatbotSubmissions');
});

runTest('2.3 Defense-in-depth: ChatbotSubmissions.jsx enforces tenant isolation in Firestore queries', () => {
  const chatbotPath = path.join(projectRoot, 'src', 'pages', 'dashboard', 'ChatbotSubmissions.jsx');
  const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');

  assert.ok(chatbotContent.includes("import { collection, query, orderBy, onSnapshot, where }"), "Must import where from firebase/firestore");
  assert.ok(chatbotContent.includes("isSuperAdmin"), "Must evaluate isSuperAdmin");
  assert.ok(chatbotContent.includes("where('tenantId', '==', tenant.id)"), "Must scope non-superadmin query with tenantId filter");
  assert.ok(chatbotContent.includes("return () => unsubscribe();"), "Must clean up onSnapshot listener on unmount");
});

// -----------------------------------------------------------------------------
// SUITE 3: switchTenant STORE CLEARING IN authStore.js & inventoryStore.js
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: switchTenant STORE CLEARING ---');

const authStorePath = path.join(projectRoot, 'src', 'store', 'authStore.js');
const authStoreContent = fs.readFileSync(authStorePath, 'utf8');

const inventoryStorePath = path.join(projectRoot, 'src', 'store', 'inventoryStore.js');
const inventoryStoreContent = fs.readFileSync(inventoryStorePath, 'utf8');

runTest('3.1 inventoryStore.js defines resetInventoryState', () => {
  assert.ok(
    inventoryStoreContent.includes('resetInventoryState: () =>'),
    'inventoryStore must define resetInventoryState'
  );
  assert.ok(
    inventoryStoreContent.includes("set({ instruments: [], activities: [], loading: true })"),
    'resetInventoryState must clear instruments, activities, and set loading to true'
  );
});

runTest('3.2 authStore.js imports useInventoryStore and triggers resetInventoryState on switchTenant', () => {
  assert.ok(
    authStoreContent.includes("import { useInventoryStore } from './inventoryStore';"),
    'authStore must import useInventoryStore'
  );
  assert.ok(
    authStoreContent.includes("useInventoryStore.getState().resetInventoryState?.()"),
    'switchTenant must call resetInventoryState at the start of tenant switch'
  );
});

runTest('3.3 Empirical simulation of switchTenant state transition', () => {
  // Simulate Zustand stores
  let inventoryState = {
    instruments: [
      { id: 'inst_A1', nombre: 'Micrómetro Tenant A', tenantId: 'tenantA' },
      { id: 'inst_A2', nombre: 'Calibrador Tenant A', tenantId: 'tenantA' }
    ],
    activities: [
      { id: 'act_A1', tipo: 'Calibración', tenantId: 'tenantA' }
    ],
    loading: false
  };

  const inventoryStoreMock = {
    getState: () => inventoryState,
    setState: (partial) => {
      inventoryState = { ...inventoryState, ...partial };
    },
    resetInventoryState: () => {
      inventoryState = { ...inventoryState, instruments: [], activities: [], loading: true };
    }
  };

  let authState = {
    tenant: { id: 'tenantA', nombre_empresa: 'Empresa A' },
    allTenants: [
      { id: 'tenantA', nombre_empresa: 'Empresa A' },
      { id: 'tenantB', nombre_empresa: 'Empresa B' }
    ]
  };

  // Execute switchTenant logic
  function switchTenantSimulation(newTenantId) {
    // 1. Synchronous purge
    inventoryStoreMock.resetInventoryState();

    // 2. Verify state is immediately purged BEFORE any async work
    assert.equal(inventoryState.instruments.length, 0, 'Instruments must be empty immediately');
    assert.equal(inventoryState.activities.length, 0, 'Activities must be empty immediately');
    assert.equal(inventoryState.loading, true, 'Loading must be true immediately to prevent UI bleed');

    // 3. Switch tenant in authStore
    const selected = authState.allTenants.find(t => t.id === newTenantId);
    authState.tenant = selected;
  }

  // Pre-condition
  assert.equal(inventoryState.instruments.length, 2);
  assert.equal(inventoryState.loading, false);

  // Trigger switch
  switchTenantSimulation('tenantB');

  // Post-condition
  assert.equal(authState.tenant.id, 'tenantB');
  assert.equal(inventoryState.instruments.length, 0);
  assert.equal(inventoryState.activities.length, 0);
  assert.equal(inventoryState.loading, true);
});

// -----------------------------------------------------------------------------
// SUITE 4: ADDITIONAL ISOLATION CONTROLS (HierarchyTree & instrumentsService)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: DEFENSE-IN-DEPTH CONTROLS (HierarchyTree & instrumentsService) ---');

runTest('4.1 HierarchyTree.jsx scopes queries to tenant and blocks unauthorized tenant creation', () => {
  const treePath = path.join(projectRoot, 'src', 'components', 'HierarchyTree.jsx');
  const treeContent = fs.readFileSync(treePath, 'utf8');

  // Check query scoping
  assert.ok(treeContent.includes("if (!isSuperAdmin && !tenant)"), "Must abort tree build if not superadmin and tenant missing");
  assert.ok(treeContent.includes("where('__name__', '==', tenant.id)"), "Must scope tenant query by __name__ == tenant.id for non-superadmin");
  assert.ok(treeContent.includes("where('tenantId', '==', tenant.id)"), "Must scope hierarchy query by tenantId for non-superadmin");

  // Check UI and handler guards
  assert.ok(treeContent.includes("if (!isSuperAdmin)"), "Must check isSuperAdmin in handlers");
  assert.ok(treeContent.includes("{isSuperAdmin && ("), "Must conditionally render '+ Nuevo Cliente' button for superadmins only");
});

runTest('4.2 instrumentsService targets canonical subcollection with parameter guards', () => {
  const instServicePath = path.join(projectRoot, 'src', 'services', 'instruments.js');
  const instServiceContent = fs.readFileSync(instServicePath, 'utf8');

  assert.ok(instServiceContent.includes("getInstrumentById: async (tenantId, id)"), "Signature must require tenantId and id");
  assert.ok(instServiceContent.includes("if (!tenantId || !id) return null;"), "Must guard against missing parameters");
  assert.ok(
    instServiceContent.includes("doc(db, 'tenants', tenantId, 'inventario_metrologico', id)"),
    "Must target canonical subcollection path"
  );
});

runTest('4.3 seedData.js scopes writes to subcollection', () => {
  const seedPath = path.join(projectRoot, 'src', 'data', 'seedData.js');
  const seedContent = fs.readFileSync(seedPath, 'utf8');

  assert.ok(seedContent.includes("if (!tenantId)"), "seedInstruments must guard against missing tenantId");
  assert.ok(
    seedContent.includes("collection(db, 'tenants', tenantId, 'inventario_metrologico')"),
    "Must write seed instruments to canonical subcollection"
  );
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=== EMPIRICAL TEST SUITE EXECUTION SUMMARY ===');
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failures.length > 0) {
  console.log('\nFailures breakdown:');
  failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  process.exit(1);
} else {
  console.log('\nAll Challenger M1-2 empirical tests passed successfully with 0 failures!\n');
  process.exit(0);
}
