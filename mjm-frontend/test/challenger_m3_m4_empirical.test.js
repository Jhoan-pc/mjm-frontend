// test/challenger_m3_m4_empirical.test.js
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocal,
  configurable: true,
  writable: true
});
Object.defineProperty(global, 'localStorage', {
  value: mockLocal,
  configurable: true,
  writable: true
});
Object.defineProperty(globalThis, 'sessionStorage', {
  value: mockSession,
  configurable: true,
  writable: true
});
Object.defineProperty(global, 'sessionStorage', {
  value: mockSession,
  configurable: true,
  writable: true
});

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

console.log('=== STARTING CHALLENGER M3 & M4 EMPIRICAL LIFECYCLE & UI AUDIT SUITE ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

async function runTest(name, fn) {
  totalTests++;
  try {
    // Reset stores and spies between tests for strict test isolation
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

const projectRoot = path.resolve(process.cwd());

// -----------------------------------------------------------------------------
// SUITE 1: REACT LIFECYCLE & MEMORY LEAK ERADICATION (MILESTONE 3)
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: REACT LIFECYCLE & MEMORY LEAK ERADICATION (R3) ---');

await runTest('1.1 Store initialization: activeSubscriptions tracking exists', () => {
  const store = useInventoryStore.getState();
  assert.ok(store.activeSubscriptions, 'activeSubscriptions object must be defined');
  assert.strictEqual(store.activeSubscriptions.instruments, null, 'instruments sub initially null');
  assert.strictEqual(store.activeSubscriptions.activities, null, 'activities sub initially null');
});

await runTest('1.2 loadInstruments: creates active listener and tracks it in activeSubscriptions', () => {
  const store = useInventoryStore.getState();
  const unsub = store.loadInstruments('tenant-alpha');

  assert.strictEqual(typeof unsub, 'function', 'loadInstruments must return an unsubscribe function');
  assert.strictEqual(globalThis.__firestoreSpy.listenersCreated.length, 1, 'Exactly 1 listener created');
  assert.strictEqual(globalThis.__firestoreSpy.listenersCreated[0].active, true, 'Listener must be active');
  assert.strictEqual(useInventoryStore.getState().activeSubscriptions.instruments, unsub, 'Store must reference unsub');
});

await runTest('1.3 loadInstruments: consecutive calls cancel previous listener before attaching new one', () => {
  const store = useInventoryStore.getState();
  const unsub1 = store.loadInstruments('tenant-alpha');
  const listenerRecord1 = globalThis.__firestoreSpy.listenersCreated[0];
  assert.strictEqual(listenerRecord1.active, true, 'First listener starts active');

  // Second call replaces first
  const unsub2 = store.loadInstruments('tenant-beta');
  assert.strictEqual(listenerRecord1.active, false, 'First listener was cancelled on replacement');
  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 1, '1 unsubscribe execution recorded');
  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions[0].id, listenerRecord1.id);

  const listenerRecord2 = globalThis.__firestoreSpy.listenersCreated[1];
  assert.strictEqual(listenerRecord2.active, true, 'Second listener is active');
  assert.strictEqual(useInventoryStore.getState().activeSubscriptions.instruments, unsub2, 'Store references unsub2');

  // Third call replaces second
  const unsub3 = store.loadInstruments('tenant-gamma');
  assert.strictEqual(listenerRecord2.active, false, 'Second listener cancelled on third call');
  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 2, '2 unsubscribe executions recorded');

  // Clean up
  unsub3();
});

await runTest('1.4 loadActivities: consecutive calls cancel previous listener before attaching new one', () => {
  const store = useInventoryStore.getState();
  const unsubAct1 = store.loadActivities('tenant-alpha');
  const recordAct1 = globalThis.__firestoreSpy.listenersCreated[0];
  assert.strictEqual(recordAct1.active, true, 'First activities listener starts active');

  const unsubAct2 = store.loadActivities('tenant-beta');
  assert.strictEqual(recordAct1.active, false, 'First activities listener cancelled on replacement');
  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 1, 'Unsubscribe executed for Act1');

  const recordAct2 = globalThis.__firestoreSpy.listenersCreated[1];
  assert.strictEqual(recordAct2.active, true, 'Second activities listener is active');
  assert.strictEqual(useInventoryStore.getState().activeSubscriptions.activities, unsubAct2);

  unsubAct2();
});

await runTest('1.5 clearAllSubscriptions: tears down all active listeners, nullifies handles, and flushes data', () => {
  const store = useInventoryStore.getState();

  // Populate data and start listeners
  store.loadInstruments('tenant-test-1');
  store.loadActivities('tenant-test-1');

  useInventoryStore.setState({
    instruments: [{ id: 'mock-1', nombre: 'Manómetro' }],
    activities: [{ id: 'act-1', tipo: 'Calibración' }]
  });

  const stateBefore = useInventoryStore.getState();
  assert.strictEqual(stateBefore.instruments.length, 1);
  assert.strictEqual(stateBefore.activities.length, 1);
  assert.ok(stateBefore.activeSubscriptions.instruments);
  assert.ok(stateBefore.activeSubscriptions.activities);
  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 0);

  // Execute full teardown
  store.clearAllSubscriptions();

  const stateAfter = useInventoryStore.getState();
  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 2, 'Both listeners unsubscribed');
  assert.strictEqual(stateAfter.activeSubscriptions.instruments, null, 'Instruments handle reset to null');
  assert.strictEqual(stateAfter.activeSubscriptions.activities, null, 'Activities handle reset to null');
  assert.deepStrictEqual(stateAfter.instruments, [], 'Instruments array flushed to []');
  assert.deepStrictEqual(stateAfter.activities, [], 'Activities array flushed to []');
  assert.strictEqual(stateAfter.loading, false, 'Loading reset to false');
});

await runTest('1.6 clearAllSubscriptions: idempotent when called multiple times or with null subscriptions', () => {
  const store = useInventoryStore.getState();
  // Call on empty state
  store.clearAllSubscriptions();
  assert.doesNotThrow(() => {
    store.clearAllSubscriptions();
    store.clearAllSubscriptions();
  });
});

await runTest('1.7 authStore.logout: triggers clearAllSubscriptions and destroys ephemeral session', async () => {
  const invStore = useInventoryStore.getState();
  invStore.loadInstruments('tenant-logout-test');
  invStore.loadActivities('tenant-logout-test');
  useInventoryStore.setState({ instruments: [{ id: 'i1' }], activities: [{ id: 'a1' }] });

  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 0);

  // Invoke logout
  await useAuthStore.getState().logout();

  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 2, 'Logout invoked unsub on both listeners');
  const invState = useInventoryStore.getState();
  assert.strictEqual(invState.activeSubscriptions.instruments, null);
  assert.strictEqual(invState.activeSubscriptions.activities, null);
  assert.deepStrictEqual(invState.instruments, []);
  assert.deepStrictEqual(invState.activities, []);
});

await runTest('1.8 authStore.switchTenant: triggers clearAllSubscriptions and resetInventoryState', async () => {
  const invStore = useInventoryStore.getState();
  invStore.loadInstruments('tenant-switch-test');
  useInventoryStore.setState({ instruments: [{ id: 'switch-inst' }] });

  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 0);

  // Perform tenant switch
  await useAuthStore.getState().switchTenant({ id: 'tenant-target-new', nombre_empresa: 'Target Corp' });

  assert.strictEqual(globalThis.__firestoreSpy.unsubExecutions.length, 1, 'switchTenant invoked unsub');
  const invState = useInventoryStore.getState();
  assert.strictEqual(invState.activeSubscriptions.instruments, null);
  assert.deepStrictEqual(invState.instruments, []);
});

await runTest('1.9 authStore.initializeAuth: returns unsubscribe function from onAuthStateChanged', () => {
  const unsub = useAuthStore.getState().initializeAuth();
  assert.strictEqual(typeof unsub, 'function', 'initializeAuth must return an unsubscribe handle');
  assert.strictEqual(globalThis.__authSpy.onAuthStateChangedCalls.length, 1, 'onAuthStateChanged invoked');
  assert.strictEqual(globalThis.__authSpy.unsubCalls, 0);

  // Teardown
  unsub();
  assert.strictEqual(globalThis.__authSpy.unsubCalls, 1, 'Auth observer teardown executed');
});

await runTest('1.10 HojaDeVidaPrint.jsx: verify elimination of redundant catalog subscription', () => {
  const filePath = path.join(projectRoot, 'src', 'pages', 'dashboard', 'HojaDeVidaPrint.jsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.ok(!content.includes('loadInstruments'), 'HojaDeVidaPrint must NOT import or call loadInstruments');
  assert.ok(content.includes('getInstrumentFromFirestore'), 'HojaDeVidaPrint must use single-asset retrieval');
});

await runTest('1.11 App.jsx: verify root useEffect captures and executes auth cleanup', () => {
  const filePath = path.join(projectRoot, 'src', 'App.jsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.ok(content.includes('const unsub = initializeAuth();'), 'App.jsx must capture return value of initializeAuth');
  assert.ok(content.includes('return () => {'), 'App.jsx must return an unmount cleanup function');
  assert.ok(content.includes('if (unsub) unsub();'), 'App.jsx cleanup must call unsub()');
});


// -----------------------------------------------------------------------------
// SUITE 2: UI LAYOUT, STICKY HEADERS & PRECISION STYLING (MILESTONE 4)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: UI LAYOUT, STICKY HEADERS & TABLE PRECISION (R4) ---');

const inventarioPath = path.join(projectRoot, 'src', 'pages', 'dashboard', 'Inventario.jsx');
const inventarioCode = fs.readFileSync(inventarioPath, 'utf8');

await runTest('2.1 Inventario.jsx: Command bar has sticky top-0 and mb-0 (0px gap)', () => {
  const commandBarMatch = inventarioCode.match(/sticky\s+top-0\s+z-30[^>]*mb-0/);
  assert.ok(commandBarMatch, 'Command bar must declare sticky top-0 z-30 with mb-0');
  assert.ok(commandBarMatch[0].includes('bg-[var(--surface)]'), 'Command bar must use var(--surface) opaque background');
  assert.ok(commandBarMatch[0].includes('dark:bg-[var(--surface)]'), 'Command bar dark mode must use var(--surface) opaque background');
  assert.ok(!commandBarMatch[0].includes('mb-4'), 'Command bar must NOT contain mb-4');
});

await runTest('2.2 Inventario.jsx: 0px gap between command bar and PrecisionTableView', () => {
  const resultsCommentIndex = inventarioCode.indexOf('{/* ÁREA DE RESULTADOS */}');
  assert.ok(resultsCommentIndex > 0, 'Results area comment found');

  const nextSectionIndex = inventarioCode.indexOf('<section', resultsCommentIndex);
  const sectionTag = inventarioCode.substring(nextSectionIndex, nextSectionIndex + 40);

  // Section has only pb-10, no top margin or top padding before PrecisionTableView
  assert.ok(!sectionTag.includes('mt-'), 'Section must not introduce top margin');
  assert.ok(!sectionTag.includes('pt-'), 'Section must not introduce top padding');
  assert.ok(sectionTag.includes('pb-10'), 'Section defines only bottom padding');
});

await runTest('2.3 Inventario.jsx: PrecisionTableView has self-contained max-h scroll container', () => {
  const containerMatch = inventarioCode.match(/max-h-\[calc\(100vh-210px\)\]\s+overflow-auto/);
  assert.ok(containerMatch, 'PrecisionTableView must use max-h-[calc(100vh-210px)] overflow-auto wrapper');
});

await runTest('2.4 Inventario.jsx: Table uses border-separate and border-spacing-0', () => {
  const tableMatch = inventarioCode.match(/<table[^>]*class(?:Name)?="([^"]*)"/);
  assert.ok(tableMatch, 'Table element must be present in PrecisionTableView');
  const classes = tableMatch[1];
  assert.ok(classes.includes('border-separate'), 'Table must specify border-separate');
  assert.ok(classes.includes('border-spacing-0'), 'Table must specify border-spacing-0');
  assert.ok(!classes.includes('border-collapse'), 'Table must NOT use border-collapse');
});

await runTest('2.5 Inventario.jsx: thead and all th elements use sticky top-0 and rounded-none', () => {
  const theadMatch = inventarioCode.match(/<thead[^>]*class(?:Name)?="([^"]*)"/);
  assert.ok(theadMatch, 'thead must exist');
  assert.ok(theadMatch[1].includes('sticky top-0 z-20'), 'thead must have sticky top-0 z-20');
  assert.ok(theadMatch[1].includes('bg-[var(--surface-alt)]'), 'thead must have 100% opaque surface-alt background');

  // Match only <th ...> elements using word boundary
  const thMatches = [...inventarioCode.matchAll(/<th\b[^>]*class(?:Name)?="([^"]*)"/g)];
  assert.strictEqual(thMatches.length, 8, `Expected exactly 8 column headers in PrecisionTableView, found ${thMatches.length}`);

  for (const match of thMatches) {
    const cls = match[1];
    assert.ok(cls.includes('sticky top-0'), 'Every th must be sticky top-0');
    assert.ok(cls.includes('rounded-none'), 'Every th must declare rounded-none');
    assert.ok(!cls.includes('rounded-tl'), 'No th can have rounded-tl');
    assert.ok(!cls.includes('rounded-tr'), 'No th can have rounded-tr');
    assert.ok(cls.includes('bg-[var(--surface-alt)]'), 'Every th must have opaque bg-[var(--surface-alt)]');
  }
});

await runTest('2.6 KanbanMetrologico.jsx: sticky top-0, mb-0, rounded-b-2xl rounded-t-none, 100% opaque', () => {
  const kanbanPath = path.join(projectRoot, 'src', 'pages', 'dashboard', 'KanbanMetrologico.jsx');
  const kanbanCode = fs.readFileSync(kanbanPath, 'utf8');

  const headerMatch = kanbanCode.match(/<header[^>]*class(?:Name)?="([^"]*)"/);
  assert.ok(headerMatch, 'Kanban header must exist');
  const cls = headerMatch[1];

  assert.ok(cls.includes('sticky top-0 z-30'), 'Kanban header must be sticky top-0 z-30');
  assert.ok(cls.includes('mb-0'), 'Kanban header must have mb-0 (no floating gap)');
  assert.ok(cls.includes('rounded-b-2xl rounded-t-none'), 'Kanban header must have square top and rounded-b-2xl');
  assert.ok(cls.includes('bg-[var(--surface)]'), 'Kanban header must use 100% opaque bg-[var(--surface)]');
  assert.ok(!cls.includes('/95'), 'Kanban header must not use /95 translucent opacity');
  assert.ok(!cls.includes('backdrop-blur'), 'Kanban header must not rely on backdrop-blur transparency');
});

await runTest('2.7 Calendario.jsx: Month bar (top-0) and Weekday bar (top-[52px]) flush docking', () => {
  const calPath = path.join(projectRoot, 'src', 'pages', 'dashboard', 'Calendario.jsx');
  const calCode = fs.readFileSync(calPath, 'utf8');

  // Month navigation bar
  assert.ok(calCode.includes('sticky top-0 z-20 bg-[var(--surface)]'), 'Month bar sticky top-0 z-20 with surface bg');
  assert.ok(calCode.includes('md:h-[52px]'), 'Month bar fixed height of 52px');

  // Weekday row
  assert.ok(calCode.includes('sticky top-[52px] z-20 bg-[var(--surface-alt)]'), 'Weekday row docked flush at top-[52px]');
  assert.ok(calCode.includes('border-b border-[var(--outline-color)]'), 'Dividing border between bars');
});

await runTest('2.8 HojaDeVida.jsx: Routine history table has max-h container, sticky thead, and border-separate', () => {
  const hdvPath = path.join(projectRoot, 'src', 'pages', 'dashboard', 'HojaDeVida.jsx');
  const hdvCode = fs.readFileSync(hdvPath, 'utf8');

  assert.ok(hdvCode.includes('max-h-[380px] overflow-auto'), 'History table has max-h-[380px] scroll container');
  assert.ok(hdvCode.includes('border-separate border-spacing-0'), 'Table uses border-separate border-spacing-0');
  assert.ok(hdvCode.includes('sticky top-0 z-10 bg-[var(--surface-alt)]'), 'thead has sticky top-0 z-10');
});

await runTest('2.9 AsegMetrologico.jsx: MasterLogModal sticky header uses 100% opaque dark:bg-zinc-900', () => {
  const asegPath = path.join(projectRoot, 'src', 'pages', 'dashboard', 'AsegMetrologico.jsx');
  const asegCode = fs.readFileSync(asegPath, 'utf8');

  // Correctly locate MasterLogModal definition (lines ~560-700)
  const masterLogStart = asegCode.indexOf('const MasterLogModal =');
  assert.ok(masterLogStart > 0, 'MasterLogModal found');
  const masterLogEnd = asegCode.indexOf('</table', masterLogStart);
  const masterLogSection = asegCode.substring(masterLogStart, masterLogEnd);

  assert.ok(masterLogSection.includes('border-separate border-spacing-0'), 'MasterLogModal table uses border-separate');
  assert.ok(masterLogSection.includes('sticky top-0 z-20 bg-slate-50 dark:bg-zinc-900'), 'MasterLogModal thead sticky top-0 with dark:bg-zinc-900');
  assert.ok(!masterLogSection.includes('dark:bg-zinc-800/80'), 'MasterLogModal removed 80% opacity dark:bg-zinc-800/80');

  // Main search bar
  assert.ok(asegCode.includes('sticky top-0 z-20 bg-[var(--surface)]'), 'Main search toolbar has sticky top-0 z-20 bg-[var(--surface)]');
});

await runTest('2.10 Global absence of translucent background utility classes on sticky headers', () => {
  const auditedFiles = [
    'src/pages/dashboard/Inventario.jsx',
    'src/pages/dashboard/KanbanMetrologico.jsx',
    'src/pages/dashboard/Calendario.jsx',
    'src/pages/dashboard/HojaDeVida.jsx',
    'src/pages/dashboard/AsegMetrologico.jsx'
  ];

  for (const relPath of auditedFiles) {
    const fullPath = path.join(projectRoot, relPath);
    const code = fs.readFileSync(fullPath, 'utf8');

    // Find all elements containing 'sticky'
    const stickyLines = code.split('\n').filter(line => line.includes('sticky'));
    for (const line of stickyLines) {
      assert.ok(!line.includes('bg-white/95'), `${relPath}: sticky line must not contain bg-white/95: ${line.trim()}`);
      assert.ok(!line.includes('dark:bg-zinc-950/95'), `${relPath}: sticky line must not contain dark:bg-zinc-950/95: ${line.trim()}`);
      assert.ok(!line.includes('dark:bg-zinc-800/80'), `${relPath}: sticky line must not contain dark:bg-zinc-800/80: ${line.trim()}`);
      assert.ok(!line.includes('/95'), `${relPath}: sticky line must not contain /95: ${line.trim()}`);
      assert.ok(!line.includes('/80'), `${relPath}: sticky line must not contain /80: ${line.trim()}`);
    }
  }
});

await runTest('2.11 CheckHistoryModal (AsegMetrologico line 909): observe non-sticky table header opacity', () => {
  const asegPath = path.join(projectRoot, 'src', 'pages', 'dashboard', 'AsegMetrologico.jsx');
  const asegCode = fs.readFileSync(asegPath, 'utf8');

  // Identify CheckHistoryModal thead
  const checkSection = asegCode.substring(asegCode.indexOf('Historial de Ensayos de este Activo'), asegCode.indexOf('</table', asegCode.indexOf('Historial de Ensayos de este Activo')));
  // Verify it does NOT declare sticky (non-sticky header)
  assert.ok(!checkSection.includes('sticky'), 'CheckHistoryModal is a non-sticky regular table header');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=== EMPIRICAL TEST EXECUTION SUMMARY ===');
console.log(`Total tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests > 0) {
  console.error('\nFAILURES:');
  failures.forEach(f => console.error(` - ${f.name}: ${f.error}`));
  process.exit(1);
} else {
  console.log('\nAll empirical tests for M3 & M4 PASSED successfully with 0 failures!');
  process.exit(0);
}
