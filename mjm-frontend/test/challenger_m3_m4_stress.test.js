// test/challenger_m3_m4_stress.test.js
import assert from 'node:assert/strict';
import path from 'node:path';

// Define browser environment mocks in main thread
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const mockLocal = new MockStorage();
const mockSession = new MockStorage();

Object.defineProperty(globalThis, 'localStorage', { value: mockLocal, configurable: true, writable: true });
Object.defineProperty(global, 'localStorage', { value: mockLocal, configurable: true, writable: true });
Object.defineProperty(globalThis, 'sessionStorage', { value: mockSession, configurable: true, writable: true });
Object.defineProperty(global, 'sessionStorage', { value: mockSession, configurable: true, writable: true });

if (!globalThis.document) {
  globalThis.document = {
    documentElement: {
      style: {
        setProperty: () => {},
        getPropertyValue: () => ''
      }
    },
    title: ''
  };
}

const { useInventoryStore } = await import('../src/store/inventoryStore.js');
const { useAuthStore } = await import('../src/store/authStore.js');

console.log('=== STARTING CHALLENGER M3 & M4 ADVERSARIAL STRESS TEST BATTERY ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

async function runStressTest(name, fn) {
  totalTests++;
  try {
    useInventoryStore.setState({
      activeSubscriptions: { instruments: null, activities: null },
      instruments: [],
      activities: [],
      loading: false
    });
    if (globalThis.__firestoreSpy) globalThis.__firestoreSpy.reset();
    if (globalThis.__authSpy) globalThis.__authSpy.reset();
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

// -----------------------------------------------------------------------------
// STRESS SUITE 1: RAPID ASYNCHRONOUS TENANT SWITCHING (100 CYCLES)
// -----------------------------------------------------------------------------
await runStressTest('S1. Rapid tenant switching stress (100 rapid consecutive switches)', async () => {
  const store = useInventoryStore.getState();
  const authStore = useAuthStore.getState();

  for (let i = 0; i < 100; i++) {
    const tenantId = `stress-tenant-${i % 5}`;
    store.loadInstruments(tenantId);
    store.loadActivities(tenantId);
    await authStore.switchTenant({ id: tenantId, nombre_empresa: `Stress Corp ${i}` });
  }

  // After 100 switches, verify exact state cleanup
  const currentInv = useInventoryStore.getState();
  assert.strictEqual(currentInv.activeSubscriptions.instruments, null);
  assert.strictEqual(currentInv.activeSubscriptions.activities, null);
  assert.deepStrictEqual(currentInv.instruments, []);
  assert.deepStrictEqual(currentInv.activities, []);

  // Check that all 200 listeners created were cleanly terminated
  const activeListeners = globalThis.__firestoreSpy.listenersCreated.filter(l => l.active);
  assert.strictEqual(activeListeners.length, 0, 'Zero orphaned listeners remaining in memory');
  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 200, 'All 200 subscriptions unsubscribed');
});

// -----------------------------------------------------------------------------
// STRESS SUITE 2: THROWING UNSUBSCRIBE TOLERANCE & RESILIENCE
// -----------------------------------------------------------------------------
await runStressTest('S2. Broken / throwing unsubscribe callbacks do not crash clearAllSubscriptions', () => {
  const store = useInventoryStore.getState();

  // Create a rogue subscription that throws an exception when called
  const throwingUnsub1 = () => { throw new Error('Simulated network disconnect failure'); };
  const normalUnsub2 = () => { globalThis.__unsubCalled = true; };
  globalThis.__unsubCalled = false;

  useInventoryStore.setState({
    activeSubscriptions: {
      instruments: throwingUnsub1,
      activities: normalUnsub2
    },
    instruments: [{ id: 'inst-1' }],
    activities: [{ id: 'act-1' }]
  });

  // Calling clearAllSubscriptions must NOT throw and must still clean remaining subscriptions and state
  assert.doesNotThrow(() => {
    store.clearAllSubscriptions();
  });

  assert.strictEqual(globalThis.__unsubCalled, true, 'Second subscription was still executed despite first throwing');
  const postState = useInventoryStore.getState();
  assert.strictEqual(postState.activeSubscriptions.instruments, null);
  assert.strictEqual(postState.activeSubscriptions.activities, null);
  assert.deepStrictEqual(postState.instruments, []);
  assert.deepStrictEqual(postState.activities, []);
});

// -----------------------------------------------------------------------------
// STRESS SUITE 3: RAPID ALTERNATION OF LOAD & CLEAR (50 ITERATIONS)
// -----------------------------------------------------------------------------
await runStressTest('S3. 50 rapid load & clear cycles maintain zero orphaned listeners', () => {
  const store = useInventoryStore.getState();

  for (let i = 0; i < 50; i++) {
    store.loadInstruments(`rapid-${i}`);
    store.loadActivities(`rapid-${i}`);
    store.clearAllSubscriptions();
  }

  const active = globalThis.__firestoreSpy.listenersCreated.filter(l => l.active);
  assert.strictEqual(active.length, 0, 'No active listeners remain after 50 cycles');
  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 100, 'All 100 listeners unsubscribed');
  assert.strictEqual(store.activeSubscriptions.instruments, null);
  assert.strictEqual(store.activeSubscriptions.activities, null);
});

// -----------------------------------------------------------------------------
// STRESS SUITE 4: CORRUPTED / UNDEFINED STORE STATE SURVIVAL
// -----------------------------------------------------------------------------
await runStressTest('S4. Corrupted activeSubscriptions structure is safely sanitized', () => {
  const store = useInventoryStore.getState();

  // Case A: activeSubscriptions is null
  useInventoryStore.setState({ activeSubscriptions: null });
  assert.doesNotThrow(() => store.clearAllSubscriptions());
  assert.strictEqual(useInventoryStore.getState().activeSubscriptions.instruments, null);

  // Case B: activeSubscriptions is undefined
  useInventoryStore.setState({ activeSubscriptions: undefined });
  assert.doesNotThrow(() => store.clearAllSubscriptions());
  assert.strictEqual(useInventoryStore.getState().activeSubscriptions.instruments, null);

  // Case C: activeSubscriptions has non-function values
  useInventoryStore.setState({ activeSubscriptions: { instruments: 'not-a-fn', activities: 12345 } });
  assert.doesNotThrow(() => store.clearAllSubscriptions());
  assert.strictEqual(useInventoryStore.getState().activeSubscriptions.instruments, null);
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=== ADVERSARIAL STRESS TEST SUMMARY ===');
console.log(`Total tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\nAll adversarial stress tests PASSED successfully with 0 memory leaks!');
  process.exit(0);
}
