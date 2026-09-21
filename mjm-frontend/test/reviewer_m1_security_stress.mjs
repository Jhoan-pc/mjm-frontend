import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('=== STARTING REVIEWER M1-1 SECURITY & MULTI-TENANT AUDIT SUITE ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function runTest(name, fn) {
  totalTests++;
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
// TEST SUITE 1: instrumentsService.getInstrumentById Parameter Guards & Canonical Path
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: instrumentsService.getInstrumentById ---');

const instrumentsServiceContent = fs.readFileSync(
  path.join(projectRoot, 'src', 'services', 'instruments.js'),
  'utf-8'
);

runTest('1.1 Signature accepts (tenantId, id)', () => {
  assert.match(
    instrumentsServiceContent,
    /getInstrumentById:\s*async\s*\(\s*tenantId\s*,\s*id\s*\)/,
    'getInstrumentById must declare both tenantId and id parameters'
  );
});

runTest('1.2 Parameter guard returns null for falsy tenantId or id', () => {
  assert.match(
    instrumentsServiceContent,
    /if\s*\(\s*!tenantId\s*\|\|\s*!id\s*\)\s*return\s+null;/,
    'Must guard against null/undefined/empty tenantId or id and return null without crashing'
  );
});

runTest('1.3 Canonical subcollection path tenants/{tenantId}/inventario_metrologico/{id}', () => {
  assert.match(
    instrumentsServiceContent,
    /doc\(\s*db\s*,\s*['"]tenants['"]\s*,\s*tenantId\s*,\s*['"]inventario_metrologico['"]\s*,\s*id\s*\)/,
    'Must target canonical subcollection path doc(db, "tenants", tenantId, "inventario_metrologico", id)'
  );
});

runTest('1.4 Zero root inventario_metrologico queries in instrumentsService', () => {
  assert.doesNotMatch(
    instrumentsServiceContent,
    /doc\(\s*db\s*,\s*['"]inventario_metrologico['"]/,
    'Must NOT access root inventario_metrologico collection directly'
  );
});

// -----------------------------------------------------------------------------
// TEST SUITE 2: seedInstruments Multi-Tenant Scoping & Guards
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: seedData.js seedInstruments ---');

const seedDataContent = fs.readFileSync(
  path.join(projectRoot, 'src', 'data', 'seedData.js'),
  'utf-8'
);

runTest('2.1 seedInstruments guards missing tenantId', () => {
  assert.match(
    seedDataContent,
    /if\s*\(\s*!tenantId\s*\)\s*\{[\s\S]*?return\s+0;?\s*\}/,
    'seedInstruments must validate tenantId and abort with return 0'
  );
});

runTest('2.2 seedInstruments writes strictly to subcollection tenants/{tenantId}/inventario_metrologico', () => {
  assert.match(
    seedDataContent,
    /collection\(\s*db\s*,\s*['"]tenants['"]\s*,\s*tenantId\s*,\s*['"]inventario_metrologico['"]\s*\)/,
    'seedInstruments must write to collection(db, "tenants", tenantId, "inventario_metrologico")'
  );
});

runTest('2.3 seedInstruments does not write to root inventario_metrologico', () => {
  assert.doesNotMatch(
    seedDataContent,
    /collection\(\s*db\s*,\s*['"]inventario_metrologico['"]\s*\)/,
    'Must NOT write to root inventario_metrologico collection'
  );
});

// -----------------------------------------------------------------------------
// TEST SUITE 3: ChatbotSubmissions.jsx Isolation & Error Handling
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: ChatbotSubmissions.jsx Isolation ---');

const chatbotSubmissionsContent = fs.readFileSync(
  path.join(projectRoot, 'src', 'pages', 'dashboard', 'ChatbotSubmissions.jsx'),
  'utf-8'
);

runTest('3.1 Imports where clause from firebase/firestore', () => {
  assert.match(
    chatbotSubmissionsContent,
    /import\s*\{[^}]*where[^}]*\}\s*from\s*['"]firebase\/firestore['"]/,
    'Must import where from firebase/firestore'
  );
});

runTest('3.2 Non-superadmin queries are scoped with where("tenantId", "==", tenant.id)', () => {
  assert.match(
    chatbotSubmissionsContent,
    /where\(\s*['"]tenantId['"]\s*,\s*['"]==['"]\s*,\s*tenant\.id\s*\)/,
    'Must filter chatbot_submissions by where("tenantId", "==", tenant.id)'
  );
});

runTest('3.3 Missing tenant and non-superadmin aborts query and clears state', () => {
  assert.match(
    chatbotSubmissionsContent,
    /setSubmissions\(\s*\[\s*\]\s*\);[\s\S]*?setLoading\(\s*false\s*\);[\s\S]*?return;/,
    'Must clear submissions, set loading false, and return without executing open query'
  );
});

runTest('3.4 onSnapshot includes error callback preventing silent failure', () => {
  assert.match(
    chatbotSubmissionsContent,
    /onSnapshot\(\s*q\s*,\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\},\s*\(\s*error\s*\)\s*=>\s*\{[\s\S]*?setLoading\(\s*false\s*\);?\s*\}/,
    'onSnapshot must include error callback and clear loading state'
  );
});

runTest('3.5 useEffect dependency array contains [isSuperAdmin, tenant?.id]', () => {
  assert.match(
    chatbotSubmissionsContent,
    /\},\s*\[\s*isSuperAdmin\s*,\s*tenant\?\.id\s*\]\s*\);/,
    'useEffect must depend on [isSuperAdmin, tenant?.id]'
  );
});

// -----------------------------------------------------------------------------
// TEST SUITE 4: App.jsx Route RBAC Protection
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: App.jsx Route RBAC ---');

const appContent = fs.readFileSync(
  path.join(projectRoot, 'src', 'App.jsx'),
  'utf-8'
);

runTest('4.1 App.jsx reads isSuperAdmin from useAuthStore', () => {
  assert.match(
    appContent,
    /isSuperAdmin\s*=\s*useAuthStore\s*\(\s*\(state\)\s*=>\s*state\.isSuperAdmin\s*\)/,
    'Must extract isSuperAdmin from useAuthStore'
  );
});

runTest('4.2 Route /dashboard/solicitudes strictly protected by isSuperAdmin', () => {
  assert.match(
    appContent,
    /<Route\s+path=["']solicitudes["']\s+element=\{\s*isSuperAdmin\s*\?\s*<ChatbotSubmissions\s*\/>\s*:\s*<Navigate\s+to=["']\/dashboard["']\s+replace\s*\/>\s*\}/,
    'Route solicitudes must redirect unauthorized users to /dashboard with replace'
  );
});

// -----------------------------------------------------------------------------
// TEST SUITE 5: HierarchyTree.jsx RBAC & Query Isolation
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: HierarchyTree.jsx ---');

const hierarchyTreeContent = fs.readFileSync(
  path.join(projectRoot, 'src', 'components', 'HierarchyTree.jsx'),
  'utf-8'
);

runTest('5.1 Unauthenticated/unresolved tenant guard prevents open tree query', () => {
  assert.match(
    hierarchyTreeContent,
    /if\s*\(\s*!isSuperAdmin\s*&&\s*!tenant\s*\)\s*\{\s*setData\(\s*\[\s*\]\s*\);\s*setIsLoading\(\s*false\s*\);\s*return;\s*\}/,
    'Must abort query and return empty data if !isSuperAdmin && !tenant'
  );
});

runTest('5.2 Non-superadmin tenantsQuery scoped to __name__ == tenant.id', () => {
  assert.match(
    hierarchyTreeContent,
    /where\(\s*['"]__name__['"]\s*,\s*['"]==['"]\s*,\s*tenant\.id\s*\)/,
    'Must scope tenantsQuery using where("__name__", "==", tenant.id)'
  );
});

runTest('5.3 Non-superadmin hierarchy fallback scoped to tenantId == tenant.id', () => {
  assert.match(
    hierarchyTreeContent,
    /where\(\s*['"]tenantId['"]\s*,\s*['"]==['"]\s*,\s*tenant\.id\s*\)/,
    'Must scope hierarchy fallback query using where("tenantId", "==", tenant.id)'
  );
});

runTest('5.4 Global hierarchy collection query restricted to isSuperAdmin', () => {
  assert.match(
    hierarchyTreeContent,
    /else\s+if\s*\(\s*isSuperAdmin\s*\)\s*\{[\s\S]*?collection\(\s*db\s*,\s*['"]hierarchy['"]\s*\)/,
    'Global hierarchy collection must only be loaded if isSuperAdmin'
  );
});

runTest('5.5 handleCreate guards modalType === "cliente" with isSuperAdmin check', () => {
  assert.match(
    hierarchyTreeContent,
    /if\s*\(\s*modalType\s*===\s*['"]cliente['"]\s*\)\s*\{\s*if\s*\(\s*!isSuperAdmin\s*\)\s*\{/,
    'Creating client must check !isSuperAdmin and reject'
  );
});

runTest('5.6 handleToggleStatus strictly locked to isSuperAdmin', () => {
  assert.match(
    hierarchyTreeContent,
    /handleToggleStatus\s*=\s*async\s*\(\s*node\s*\)\s*=>\s*\{\s*if\s*\(\s*!isSuperAdmin\s*\)\s*\{/,
    'Toggling tenant subscription status must check !isSuperAdmin and reject'
  );
});

runTest('5.7 openModal rejects "cliente" type for non-superadmin', () => {
  assert.match(
    hierarchyTreeContent,
    /if\s*\(\s*type\s*===\s*['"]cliente['"]\s*&&\s*!isSuperAdmin\s*\)/,
    'openModal must check !isSuperAdmin for client modal'
  );
});

runTest('5.8 UI button "+ Nuevo Cliente" conditionally rendered only for isSuperAdmin', () => {
  assert.match(
    hierarchyTreeContent,
    /\{isSuperAdmin\s*&&\s*\(\s*<button[\s\S]*?\+ Nuevo Cliente[\s\S]*?<\/button>\s*\)\}/,
    'Button "+ Nuevo Cliente" must only be rendered if isSuperAdmin'
  );
});

runTest('5.9 onToggleStatus prop on TreeNode passed as null for non-superadmin', () => {
  assert.match(
    hierarchyTreeContent,
    /onToggleStatus=\{isSuperAdmin\s*\?\s*handleToggleStatus\s*:\s*null\}/,
    'TreeNode onToggleStatus must be null when isSuperAdmin is false'
  );
});

// -----------------------------------------------------------------------------
// TEST SUITE 6: storage.rules Token Claim Matching & Fail-Secure Policy
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 6: storage.rules ---');

const storageRulesContent = fs.readFileSync(
  path.join(projectRoot, 'storage.rules'),
  'utf-8'
);

runTest('6.1 rules_version is "2"', () => {
  assert.match(storageRulesContent, /rules_version\s*=\s*['"]2['"];/);
});

runTest('6.2 /tenants/{tenantId}/{allPaths=**} requires auth and tenant token match', () => {
  assert.match(
    storageRulesContent,
    /match\s+\/tenants\/\{tenantId\}\/\{allPaths=\*\*\}\s*\{\s*allow read,\s*write:\s*if request\.auth\s*!=\s*null\s*&&/
  );
  assert.match(storageRulesContent, /request\.auth\.token\.tenantId\s*==\s*tenantId/);
  assert.match(storageRulesContent, /request\.auth\.token\.isSuperAdmin\s*==\s*true/);
});

runTest('6.3 /certificates/{tenantId}/{allPaths=**} requires auth and tenant token match', () => {
  assert.match(
    storageRulesContent,
    /match\s+\/certificates\/\{tenantId\}\/\{allPaths=\*\*\}\s*\{\s*allow read,\s*write:\s*if request\.auth\s*!=\s*null\s*&&/
  );
});

runTest('6.4 Catch-all /{allPaths=**} is explicitly denied (allow read, write: if false;)', () => {
  assert.match(
    storageRulesContent,
    /match\s+\/\{allPaths=\*\*\}\s*\{\s*allow read,\s*write:\s*if false;\s*\}/,
    'Root and unstructured paths must be explicitly denied'
  );
});

// -----------------------------------------------------------------------------
// TEST SUITE 7: Cross-Tenant State Purge (authStore.js & inventoryStore.js)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 7: Cross-Tenant State Purge ---');

const authStoreContent = fs.readFileSync(
  path.join(projectRoot, 'src', 'store', 'authStore.js'),
  'utf-8'
);

const inventoryStoreContent = fs.readFileSync(
  path.join(projectRoot, 'src', 'store', 'inventoryStore.js'),
  'utf-8'
);

runTest('7.1 inventoryStore defines resetInventoryState', () => {
  assert.match(
    inventoryStoreContent,
    /resetInventoryState:\s*\(\)\s*=>\s*\{\s*set\(\{\s*instruments:\s*\[\s*\],\s*activities:\s*\[\s*\],\s*loading:\s*true\s*\}\);?\s*\}/,
    'resetInventoryState must blank instruments and activities and set loading true'
  );
});

runTest('7.2 authStore imports useInventoryStore statically at module level', () => {
  assert.match(
    authStoreContent,
    /import\s*\{\s*useInventoryStore\s*\}\s*from\s*['"]\.\/inventoryStore['"]/,
    'authStore must import useInventoryStore directly'
  );
});

runTest('7.3 switchTenant executes resetInventoryState synchronously before resolving new tenant', () => {
  const switchTenantIdx = authStoreContent.indexOf('switchTenant: async');
  assert.ok(switchTenantIdx !== -1, 'switchTenant method must exist');

  const resetCallIdx = authStoreContent.indexOf('resetInventoryState', switchTenantIdx);
  assert.ok(resetCallIdx !== -1, 'resetInventoryState must be called inside switchTenant');

  const getDocIdx = authStoreContent.indexOf('getDoc(', switchTenantIdx);
  assert.ok(resetCallIdx < getDocIdx, 'resetInventoryState must precede async getDoc tenant fetch');
});

// -----------------------------------------------------------------------------
// TEST SUITE 8: Whole Codebase Subcollection Verification
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 8: Global Subcollection Integrity in src/ ---');

function scanDirForInventario(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirForInventario(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      // Look for collection(db, 'inventario_metrologico') or doc(db, 'inventario_metrologico')
      const invalidCol = /collection\(\s*db\s*,\s*['"]inventario_metrologico['"]\s*\)/.test(content);
      const invalidDoc = /doc\(\s*db\s*,\s*['"]inventario_metrologico['"]\s*,/.test(content);
      if (invalidCol || invalidDoc) {
        throw new Error(`Unscoped root inventario_metrologico found in ${fullPath}`);
      }
    }
  }
}

runTest('8.1 No unscoped inventario_metrologico root queries anywhere in src/', () => {
  scanDirForInventario(path.join(projectRoot, 'src'));
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=== REVIEWER M1-1 STRESS AUDIT SUMMARY ===');
console.log(`Total assertions: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failures.length > 0) {
  console.log('\nAudit failures:');
  failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  process.exit(1);
} else {
  console.log('\n✅ ALL 25 M1 MULTI-TENANT SECURITY & ISOLATION CHECKS PASSED!\n');
  process.exit(0);
}
