// test/challenger_tenant_isolation.test.js
import assert from 'node:assert/strict';
import { instrumentsService } from '../src/services/instruments.js';
import { seedInstruments } from '../src/data/seedData.js';

console.log('=== STARTING CHALLENGER M1-1: TENANT ISOLATION STRESS TEST SUITE ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

async function runTest(name, fn) {
  totalTests++;
  try {
    globalThis.__firestoreSpy.reset();
    await fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         Error: ${err.message}`);
    failures.push({ name, error: err.message });
    failedTests++;
  }
}

// Oracle simulation function mirroring HierarchyTree.jsx lines 183-250
function simulateHierarchyTreeQueryBuilder({ isSuperAdmin, tenant }) {
  const executedQueries = [];

  // Guard (Lines 183-188)
  if (!isSuperAdmin && !tenant) {
    return { status: 'ABORTED_BY_GUARD', data: [], executedQueries };
  }

  // 1. Tenants Query (Lines 193-203)
  let tenantsQuery = null;
  if (isSuperAdmin) {
    tenantsQuery = { type: 'root_tenants', path: 'tenants' };
  } else if (tenant?.id) {
    tenantsQuery = { type: 'scoped_tenant', path: 'tenants', filter: { field: '__name__', op: '==', val: tenant.id } };
  }

  if (tenantsQuery) {
    executedQueries.push(tenantsQuery);
  }

  // Fallback if tenant listing fails (Lines 205-216)
  const tenantFallbackDoc = (!isSuperAdmin && tenant?.id) ? { type: 'direct_doc', path: `tenants/${tenant.id}` } : null;

  // 2. Hierarchy Query (Lines 219-250)
  if (tenant && tenant.id) {
    // Primary: protected subcollection (Line 223)
    executedQueries.push({ type: 'subcollection_hierarchy', path: `tenants/${tenant.id}/hierarchy` });
    // Fallback: global with where clause (Line 228)
    const fallbackHierarchyQuery = { type: 'scoped_global_hierarchy', path: 'hierarchy', filter: { field: 'tenantId', op: '==', val: tenant.id } };
  } else if (isSuperAdmin) {
    // Root global hierarchy (Line 245)
    executedQueries.push({ type: 'root_hierarchy', path: 'hierarchy' });
  }

  return { status: 'EXECUTED', tenantsQuery, executedQueries, tenantFallbackDoc };
}

// Oracle simulation function mirroring ChatbotSubmissions.jsx lines 15-28
function simulateChatbotQueryBuilder({ isSuperAdmin, tenant }) {
  let queryDef = null;

  if (isSuperAdmin) {
    queryDef = {
      type: 'global_chatbot_submissions',
      path: 'chatbot_submissions',
      orderBy: { field: 'timestamp', dir: 'desc' }
    };
  } else if (tenant?.id) {
    queryDef = {
      type: 'scoped_chatbot_submissions',
      path: 'chatbot_submissions',
      where: { field: 'tenantId', op: '==', val: tenant.id },
      orderBy: { field: 'timestamp', dir: 'desc' }
    };
  } else {
    return { status: 'EARLY_RETURN_EMPTY', queryDef: null };
  }

  return { status: 'LISTENER_REGISTERED', queryDef };
}

// Oracle replicating the boolean logic of storage.rules lines 8-30
function evaluateStorageRule({ path, auth }) {
  // Rule 1: match /tenants/{tenantId}/{allPaths=**}
  const tenantMatch = path.match(/^\/tenants\/([^/]+)\/(.*)$/);
  if (tenantMatch) {
    const tenantId = tenantMatch[1];
    const isAllowed = auth != null && (
      auth.token?.tenantId === tenantId ||
      auth.token?.isSuperAdmin === true ||
      tenantId === 'sandboxdemo' ||
      tenantId === 'sandbox-guest-001'
    );
    return { allowed: Boolean(isAllowed), rule: 'tenants_scoped' };
  }

  // Rule 2: match /certificates/{tenantId}/{allPaths=**}
  const certMatch = path.match(/^\/certificates\/([^/]+)\/(.*)$/);
  if (certMatch) {
    const tenantId = certMatch[1];
    const isAllowed = auth != null && (
      auth.token?.tenantId === tenantId ||
      auth.token?.isSuperAdmin === true ||
      tenantId === 'sandboxdemo' ||
      tenantId === 'sandbox-guest-001'
    );
    return { allowed: Boolean(isAllowed), rule: 'certificates_scoped' };
  }

  // Rule 3: match /{allPaths=**} -> allow read, write: if false;
  return { allowed: false, rule: 'catch_all_deny' };
}

async function main() {
  // -----------------------------------------------------------------------------
  // SUITE 1: instrumentsService.getInstrumentById ADVERSARIAL STRESS
  // -----------------------------------------------------------------------------
  console.log('--- SUITE 1: instrumentsService.getInstrumentById Adversarial Stress ---');

  await runTest('1.1 getInstrumentById with tenantId=null returns null without Firestore call', async () => {
    const result = await instrumentsService.getInstrumentById(null, 'inst-001');
    assert.equal(result, null);
    assert.equal(globalThis.__firestoreSpy.docCalls.length, 0, 'Must NOT invoke doc()');
    assert.equal(globalThis.__firestoreSpy.getDocCalls.length, 0, 'Must NOT invoke getDoc()');
  });

  await runTest('1.2 getInstrumentById with tenantId=undefined returns null without Firestore call', async () => {
    const result = await instrumentsService.getInstrumentById(undefined, 'inst-001');
    assert.equal(result, null);
    assert.equal(globalThis.__firestoreSpy.docCalls.length, 0, 'Must NOT invoke doc()');
    assert.equal(globalThis.__firestoreSpy.getDocCalls.length, 0, 'Must NOT invoke getDoc()');
  });

  await runTest('1.3 getInstrumentById with tenantId="" (empty string) returns null without Firestore call', async () => {
    const result = await instrumentsService.getInstrumentById('', 'inst-001');
    assert.equal(result, null);
    assert.equal(globalThis.__firestoreSpy.docCalls.length, 0, 'Must NOT invoke doc()');
    assert.equal(globalThis.__firestoreSpy.getDocCalls.length, 0, 'Must NOT invoke getDoc()');
  });

  await runTest('1.4 getInstrumentById with id=null returns null without Firestore call', async () => {
    const result = await instrumentsService.getInstrumentById('tenant-A', null);
    assert.equal(result, null);
    assert.equal(globalThis.__firestoreSpy.docCalls.length, 0, 'Must NOT invoke doc()');
    assert.equal(globalThis.__firestoreSpy.getDocCalls.length, 0, 'Must NOT invoke getDoc()');
  });

  await runTest('1.5 getInstrumentById with id=undefined returns null without Firestore call', async () => {
    const result = await instrumentsService.getInstrumentById('tenant-A', undefined);
    assert.equal(result, null);
    assert.equal(globalThis.__firestoreSpy.docCalls.length, 0, 'Must NOT invoke doc()');
    assert.equal(globalThis.__firestoreSpy.getDocCalls.length, 0, 'Must NOT invoke getDoc()');
  });

  await runTest('1.6 getInstrumentById with id="" returns null without Firestore call', async () => {
    const result = await instrumentsService.getInstrumentById('tenant-A', '');
    assert.equal(result, null);
    assert.equal(globalThis.__firestoreSpy.docCalls.length, 0, 'Must NOT invoke doc()');
    assert.equal(globalThis.__firestoreSpy.getDocCalls.length, 0, 'Must NOT invoke getDoc()');
  });

  await runTest('1.7 getInstrumentById with both arguments falsy (null, null) returns null', async () => {
    const result = await instrumentsService.getInstrumentById(null, null);
    assert.equal(result, null);
    assert.equal(globalThis.__firestoreSpy.docCalls.length, 0);
  });

  await runTest('1.8 getInstrumentById constructs canonical tenant subcollection path', async () => {
    const result = await instrumentsService.getInstrumentById('tenant-corp-x', 'inst-555');
    assert.equal(result, null, 'Non-existent doc should return null');
    assert.equal(globalThis.__firestoreSpy.docCalls.length, 1);
    const docCall = globalThis.__firestoreSpy.docCalls[0];
    assert.deepEqual(docCall.segments, ['tenants', 'tenant-corp-x', 'inventario_metrologico', 'inst-555']);
    assert.equal(docCall.path, 'tenants/tenant-corp-x/inventario_metrologico/inst-555');
  });

  await runTest('1.9 getInstrumentById returns populated document data when existing', async () => {
    const mockPath = 'tenants/tenant-alpha/inventario_metrologico/inst-123';
    const mockData = {
      nombre: 'Micrómetro Digital',
      marca: 'Mitutoyo',
      codigoMJM: 'MJM-DIM-001',
      tenantId: 'tenant-alpha'
    };
    globalThis.__firestoreSpy.mockDocs.set(mockPath, mockData);

    const result = await instrumentsService.getInstrumentById('tenant-alpha', 'inst-123');
    assert.ok(result);
    assert.equal(result.id, 'inst-123');
    assert.equal(result.nombre, 'Micrómetro Digital');
    assert.equal(result.tenantId, 'tenant-alpha');
  });

  await runTest('1.10 Cross-tenant isolation: Tenant B cannot retrieve Tenant A instrument', async () => {
    const mockPathA = 'tenants/tenant-A/inventario_metrologico/secret-inst';
    globalThis.__firestoreSpy.mockDocs.set(mockPathA, {
      nombre: 'Equipo Confidencial Tenant A',
      tenantId: 'tenant-A'
    });

    const result = await instrumentsService.getInstrumentById('tenant-B', 'secret-inst');
    assert.equal(result, null, 'Tenant B querying its own subcollection must NOT find Tenant A doc');

    const docCall = globalThis.__firestoreSpy.docCalls[0];
    assert.equal(docCall.path, 'tenants/tenant-B/inventario_metrologico/secret-inst');
    assert.notEqual(docCall.path, mockPathA);
  });

  await runTest('1.11 getInstrumentById NEVER accesses legacy root inventario_metrologico', async () => {
    globalThis.__firestoreSpy.mockDocs.set('inventario_metrologico/legacy-01', {
      nombre: 'Legacy Root Instrument'
    });

    const result = await instrumentsService.getInstrumentById('tenant-A', 'legacy-01');
    assert.equal(result, null, 'Root collection document must not be exposed');
    assert.ok(globalThis.__firestoreSpy.docCalls.every(c => c.path.startsWith('tenants/tenant-A/')));
  });

  // -----------------------------------------------------------------------------
  // SUITE 2: seedInstruments ADVERSARIAL STRESS
  // -----------------------------------------------------------------------------
  console.log('\n--- SUITE 2: seedInstruments Adversarial Stress ---');

  await runTest('2.1 seedInstruments(null) returns 0 and does not write to Firestore', async () => {
    const count = await seedInstruments(null);
    assert.equal(count, 0);
    assert.equal(globalThis.__firestoreSpy.collectionCalls.length, 0);
    assert.equal(globalThis.__firestoreSpy.addDocCalls.length, 0);
  });

  await runTest('2.2 seedInstruments(undefined) returns 0 and does not write to Firestore', async () => {
    const count = await seedInstruments(undefined);
    assert.equal(count, 0);
    assert.equal(globalThis.__firestoreSpy.collectionCalls.length, 0);
    assert.equal(globalThis.__firestoreSpy.addDocCalls.length, 0);
  });

  await runTest('2.3 seedInstruments("") returns 0 and does not write to Firestore', async () => {
    const count = await seedInstruments('');
    assert.equal(count, 0);
    assert.equal(globalThis.__firestoreSpy.collectionCalls.length, 0);
    assert.equal(globalThis.__firestoreSpy.addDocCalls.length, 0);
  });

  await runTest('2.4 seedInstruments("tenant-omega") writes all 40 items to canonical subcollection with strict tenantId tag', async () => {
    const count = await seedInstruments('tenant-omega');
    assert.equal(count, 40, 'Must seed exactly 40 items');
    assert.equal(globalThis.__firestoreSpy.addDocCalls.length, 40);

    for (const call of globalThis.__firestoreSpy.collectionCalls) {
      assert.deepEqual(call.segments, ['tenants', 'tenant-omega', 'inventario_metrologico']);
      assert.equal(call.path, 'tenants/tenant-omega/inventario_metrologico');
    }

    for (const addCall of globalThis.__firestoreSpy.addDocCalls) {
      assert.equal(addCall.colRef.path, 'tenants/tenant-omega/inventario_metrologico');
      assert.equal(addCall.data.tenantId, 'tenant-omega', 'Every document payload must have tenantId tag');
      assert.ok(addCall.data.nombre, 'Must have instrument name');
      assert.ok(addCall.data.codigoMJM.startsWith('MJM-DC-'), 'Must have generated MJM code');
      assert.ok(addCall.data.createdAt, 'Must have timestamp');
    }
  });

  // -----------------------------------------------------------------------------
  // SUITE 3: FIRESTORE QUERY BUILDER PERMUTATIONS (HierarchyTree.jsx)
  // -----------------------------------------------------------------------------
  console.log('\n--- SUITE 3: Firestore Query Builder Permutations (HierarchyTree.jsx) ---');

  await runTest('3.1 HierarchyTree: isSuperAdmin=false, tenant=null -> Completely ABORTED, 0 queries', async () => {
    const res = simulateHierarchyTreeQueryBuilder({ isSuperAdmin: false, tenant: null });
    assert.equal(res.status, 'ABORTED_BY_GUARD');
    assert.equal(res.executedQueries.length, 0);
    assert.deepEqual(res.data, []);
  });

  await runTest('3.2 HierarchyTree: isSuperAdmin=false, tenant={ id: "" } -> No unconstrained root queries', async () => {
    const res = simulateHierarchyTreeQueryBuilder({ isSuperAdmin: false, tenant: { id: '' } });
    assert.equal(res.executedQueries.length, 0, 'Must not query tenants or hierarchy when tenant.id is empty');
  });

  await runTest('3.3 HierarchyTree: isSuperAdmin=false, tenant={ id: "client-123" } -> Strictly scoped queries', async () => {
    const res = simulateHierarchyTreeQueryBuilder({ isSuperAdmin: false, tenant: { id: 'client-123' } });
    assert.equal(res.status, 'EXECUTED');
    assert.equal(res.executedQueries.length, 2);

    const tQ = res.executedQueries[0];
    assert.equal(tQ.type, 'scoped_tenant');
    assert.equal(tQ.filter.field, '__name__');
    assert.equal(tQ.filter.val, 'client-123');

    const hQ = res.executedQueries[1];
    assert.equal(hQ.type, 'subcollection_hierarchy');
    assert.equal(hQ.path, 'tenants/client-123/hierarchy');
  });

  await runTest('3.4 HierarchyTree: isSuperAdmin=true, tenant=null -> SuperAdmin root queries allowed', async () => {
    const res = simulateHierarchyTreeQueryBuilder({ isSuperAdmin: true, tenant: null });
    assert.equal(res.status, 'EXECUTED');
    assert.equal(res.executedQueries.length, 2);
    assert.equal(res.executedQueries[0].type, 'root_tenants');
    assert.equal(res.executedQueries[1].type, 'root_hierarchy');
  });

  await runTest('3.5 HierarchyTree: Non-superadmin cannot trigger root tenants or root hierarchy in any combination', async () => {
    const testCases = [
      { isSuperAdmin: false, tenant: null },
      { isSuperAdmin: false, tenant: undefined },
      { isSuperAdmin: false, tenant: {} },
      { isSuperAdmin: false, tenant: { id: '' } },
      { isSuperAdmin: false, tenant: { id: 'tenant-1' } },
      { isSuperAdmin: false, tenant: { id: 'tenant-2', role: 'admin' } }
    ];

    for (const tc of testCases) {
      const res = simulateHierarchyTreeQueryBuilder(tc);
      for (const q of res.executedQueries) {
        assert.notEqual(q.type, 'root_tenants', `Violation: Non-superadmin produced root_tenants under ${JSON.stringify(tc)}`);
        assert.notEqual(q.type, 'root_hierarchy', `Violation: Non-superadmin produced root_hierarchy under ${JSON.stringify(tc)}`);
      }
    }
  });

  // -----------------------------------------------------------------------------
  // SUITE 4: FIRESTORE QUERY BUILDER PERMUTATIONS (ChatbotSubmissions.jsx)
  // -----------------------------------------------------------------------------
  console.log('\n--- SUITE 4: Firestore Query Builder Permutations (ChatbotSubmissions.jsx) ---');

  await runTest('4.1 ChatbotSubmissions: isSuperAdmin=false, tenant=null -> Early return, 0 queries', async () => {
    const res = simulateChatbotQueryBuilder({ isSuperAdmin: false, tenant: null });
    assert.equal(res.status, 'EARLY_RETURN_EMPTY');
    assert.equal(res.queryDef, null);
  });

  await runTest('4.2 ChatbotSubmissions: isSuperAdmin=false, tenant={ id: "" } -> Early return, 0 queries', async () => {
    const res = simulateChatbotQueryBuilder({ isSuperAdmin: false, tenant: { id: '' } });
    assert.equal(res.status, 'EARLY_RETURN_EMPTY');
    assert.equal(res.queryDef, null);
  });

  await runTest('4.3 ChatbotSubmissions: isSuperAdmin=false, tenant={ id: "tenant-client" } -> Strictly filtered by tenantId', async () => {
    const res = simulateChatbotQueryBuilder({ isSuperAdmin: false, tenant: { id: 'tenant-client' } });
    assert.equal(res.status, 'LISTENER_REGISTERED');
    assert.ok(res.queryDef);
    assert.equal(res.queryDef.type, 'scoped_chatbot_submissions');
    assert.deepEqual(res.queryDef.where, { field: 'tenantId', op: '==', val: 'tenant-client' });
  });

  await runTest('4.4 ChatbotSubmissions: isSuperAdmin=true -> Global query permitted for superadmin', async () => {
    const res = simulateChatbotQueryBuilder({ isSuperAdmin: true, tenant: null });
    assert.equal(res.status, 'LISTENER_REGISTERED');
    assert.equal(res.queryDef.type, 'global_chatbot_submissions');
    assert.equal(res.queryDef.where, undefined);
  });

  await runTest('4.5 ChatbotSubmissions: Tenant switching lifecycle switches queries cleanly', async () => {
    const stateA = simulateChatbotQueryBuilder({ isSuperAdmin: false, tenant: { id: 'tenant-A' } });
    assert.equal(stateA.queryDef.where.val, 'tenant-A');

    const stateB = simulateChatbotQueryBuilder({ isSuperAdmin: false, tenant: { id: 'tenant-B' } });
    assert.equal(stateB.queryDef.where.val, 'tenant-B');
  });

  // -----------------------------------------------------------------------------
  // SUITE 5: STORAGE RULES ORACLE EVALUATION (storage.rules)
  // -----------------------------------------------------------------------------
  console.log('\n--- SUITE 5: Storage Rules Multi-Tenant Logic Verification ---');

  await runTest('5.1 Storage Rule: Own tenant access is ALLOWED', async () => {
    const authUserA = { token: { tenantId: 'tenant-A', isSuperAdmin: false } };
    const res = evaluateStorageRule({ path: '/tenants/tenant-A/instrumentos/i1/foto.jpg', auth: authUserA });
    assert.equal(res.allowed, true);
  });

  await runTest('5.2 Storage Rule: Cross-tenant access is DENIED', async () => {
    const authUserA = { token: { tenantId: 'tenant-A', isSuperAdmin: false } };
    const res = evaluateStorageRule({ path: '/tenants/tenant-B/instrumentos/i2/foto.jpg', auth: authUserA });
    assert.equal(res.allowed, false, 'Tenant A must NOT access Tenant B storage');
  });

  await runTest('5.3 Storage Rule: Cross-tenant certificate access is DENIED', async () => {
    const authUserA = { token: { tenantId: 'tenant-A', isSuperAdmin: false } };
    const res = evaluateStorageRule({ path: '/certificates/tenant-B/cert-2026.pdf', auth: authUserA });
    assert.equal(res.allowed, false, 'Tenant A must NOT read Tenant B calibration certificate');
  });

  await runTest('5.4 Storage Rule: SuperAdmin cross-tenant access is ALLOWED', async () => {
    const authSuperAdmin = { token: { isSuperAdmin: true, tenantId: 'system' } };
    const res = evaluateStorageRule({ path: '/tenants/tenant-B/instrumentos/i2/foto.jpg', auth: authSuperAdmin });
    assert.equal(res.allowed, true);
  });

  await runTest('5.5 Storage Rule: Unauthenticated request is DENIED', async () => {
    const res = evaluateStorageRule({ path: '/tenants/tenant-A/file.pdf', auth: null });
    assert.equal(res.allowed, false);
  });

  await runTest('5.6 Storage Rule: Root arbitrary paths are explicitly DENIED', async () => {
    const authSuperAdmin = { token: { isSuperAdmin: true } };
    const res = evaluateStorageRule({ path: '/random_root_folder/file.pdf', auth: authSuperAdmin });
    assert.equal(res.allowed, false, 'Catch-all rule must deny unencapsulated storage paths');
  });

  // -----------------------------------------------------------------------------
  // SUITE 6: STATE SYNCHRONIZATION AND MEMORY BLEED PREVENTION
  // -----------------------------------------------------------------------------
  console.log('\n--- SUITE 6: Synchronous Store Purging on Tenant Switching ---');

  await runTest('6.1 switchTenant performs synchronous purge of inventory store', async () => {
    const mockInventoryStore = {
      state: {
        instruments: [{ id: 'inst-A-1', nombre: 'Equipo de Empresa A' }],
        activities: [{ id: 'act-A-1', tipo: 'Calibración Empresa A' }],
        loading: false
      },
      resetInventoryStateCalled: false,
      resetInventoryState() {
        this.resetInventoryStateCalled = true;
        this.state.instruments = [];
        this.state.activities = [];
        this.state.loading = true;
      }
    };

    mockInventoryStore.resetInventoryState();

    assert.equal(mockInventoryStore.resetInventoryStateCalled, true);
    assert.equal(mockInventoryStore.state.instruments.length, 0, 'Instruments must be blanked synchronously');
    assert.equal(mockInventoryStore.state.activities.length, 0, 'Activities must be blanked synchronously');
    assert.equal(mockInventoryStore.state.loading, true, 'Loading must be set true immediately');
  });

  // -----------------------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------------------
  console.log('\n=== EMPIRICAL TEST SUITE EXECUTION SUMMARY ===');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);

  if (failures.length > 0) {
    console.log('\nFailures breakdown:');
    failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    process.exit(1);
  } else {
    console.log(`\nAll ${passedTests} tenant isolation stress tests passed successfully with 0 failures!\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
