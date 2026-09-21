# Handoff Report - Worker M3: React Lifecycle & Memory Leak Eradication (Milestone 3)

**Agent:** Worker M3 (implementer, qa, specialist)  
**Date:** 2026-09-21  
**Project:** `mjm-frontend`  
**Milestone:** M3 (React Lifecycle and Memory Leak Eradication)  
**Target Path:** `.agents/worker_m3/handoff.md`  

---

## 1. Observation

Direct code observations across the repository identified specific memory leaks and orphaned listener hazards:

1. **`src/store/authStore.js` (Lines 153–157):**
   ```javascript
   initializeAuth: () => {
     onAuthStateChanged(auth, async (firebaseUser) => {
   ```
   `initializeAuth` did not return the `unsubscribe` function returned by `onAuthStateChanged`. Furthermore, `logout` and `switchTenant` did not invoke any cleanup on active Firestore listeners in `useInventoryStore`.

2. **`src/App.jsx` (Lines 44–46):**
   ```javascript
   useEffect(() => {
     initializeAuth();
   }, [initializeAuth]);
   ```
   The root authentication bootstrap hook mounted `initializeAuth()` without capturing its return value or declaring an unmount cleanup function (`return () => unsub()`). In React 19 / StrictMode and HMR cycles, this accumulated detached auth listeners.

3. **`src/store/inventoryStore.js` (Lines 129–159, 257–285):**
   ```javascript
   loadInstruments: (tenantId) => { ... return onSnapshot(q, ...); }
   loadActivities: (tenantId) => { ... return onSnapshot(q, ...); }
   ```
   The Zustand inventory store lacked centralized subscription tracking. Repeated calls or route switches opened concurrent listeners without closing previous active snapshots. No unified `clearAllSubscriptions` method existed to disconnect listeners on session termination.

4. **`src/pages/dashboard/HojaDeVidaPrint.jsx` (Lines 62, 66–72):**
   ```javascript
   const { instruments, loadInstruments, getInstrumentFromFirestore } = useInventoryStore();
   ...
   useEffect(() => {
     const activeTenantId = tenant?.id || 'sandboxdemo';
     const unsub = loadInstruments(activeTenantId);
     return () => {
       if (unsub) unsub();
     };
   }, [tenant, loadInstruments]);
   ```
   The single-equipment printable view subscribed to the entire tenant catalog via `loadInstruments` while already fetching the target instrument via `getInstrumentFromFirestore(id)`.

5. **Child Components (`KanbanMetrologico.jsx`, `Calendario.jsx`, `DashboardKPIs.jsx`, `AsegMetrologico.jsx`):**
   - `KanbanMetrologico.jsx` lines 240–245: executes `return () => unsubscribe && unsubscribe();`.
   - `Calendario.jsx` lines 57–66: executes `return () => { unsubAct && unsubAct(); unsubInst && unsubInst(); };`.
   - `DashboardKPIs.jsx` lines 13–22: executes `return () => { if (unsubInst) unsubInst(); if (unsubAct) unsubAct(); };`.
   - `AsegMetrologico.jsx` lines 983–992: executes `return () => { if (unsubInst) unsubInst(); if (unsubAct) unsubAct(); };`.
   All child components were audited to verify that their returned unsubscribe closures execute cleanly upon unmount.

---

## 2. Logic Chain

1. **Auth Unsubscribe Chain:**
   - `onAuthStateChanged(auth, callback)` returns an unsubscribe function.
   - Returning `return onAuthStateChanged(...)` in `authStore.initializeAuth` enables callers to receive that handle.
   - In `src/App.jsx`, `useEffect` captures `const unsub = initializeAuth();` and returns `() => { if (unsub) unsub(); }`, ensuring the auth observer is dismantled on root teardown or remount.

2. **Centralized Subscription Manager in `inventoryStore`:**
   - Adding `activeSubscriptions: { instruments: null, activities: null }` provides single-source-of-truth tracking for active Firestore listeners.
   - Before opening a new `onSnapshot` in `loadInstruments` or `loadActivities`, any prior subscription referenced in `activeSubscriptions` is executed and cancelled, preventing concurrent duplicate streams.
   - The newly generated `unsub` callback is saved into `activeSubscriptions` and returned to callers.
   - `clearAllSubscriptions` unregisters both active listeners, resets `activeSubscriptions` to null, and flushes `instruments: []` and `activities: []`.
   - In `authStore.js`, `logout` and `switchTenant` invoke `clearAllSubscriptions()`, guaranteeing zero data bleeding or orphaned background traffic across tenant boundaries.

3. **Print View Catalog Elimination:**
   - `HojaDeVidaPrint.jsx` renders an isolated technical dossier for a single asset ID (`useParams().id`).
   - Removing the `loadInstruments` subscription eliminates redundant network bandwidth and memory overhead without affecting single-equipment lookup through `getInstrumentFromFirestore(id)`.

---

## 3. Caveats

- **Firebase SDK Idempotency:** Invoking an `unsubscribe` callback more than once in the Firebase JS SDK is a safe no-op; nevertheless, all calls are wrapped in `try/catch` and references are nullified to prevent stale closures.
- **Demo Mode Isolation:** When running in sandbox/demo mode (`isDemoMode: true`), operations use session-scoped storage without Firestore listeners. Subscription cleanup logic remains fully functional and ready for live Firestore sessions.
- **No Refactoring Outside Scope:** Child views and layouts retain their existing UI behavior while benefiting from deduplicated listener handles managed by `inventoryStore`.

---

## 4. Conclusion

Milestone 3 requirements (R3) have been implemented and verified:
1. `src/store/authStore.js`: `initializeAuth` returns `onAuthStateChanged` unsubscribe callback; `logout` and `switchTenant` call `clearAllSubscriptions()`.
2. `src/App.jsx`: `AppRoutes` captures and unregisters the auth observer on unmount.
3. `src/store/inventoryStore.js`: Centralized `activeSubscriptions` tracking prevents concurrent orphaned listeners in `loadInstruments` and `loadActivities`; `clearAllSubscriptions()` provides clean session teardown.
4. `src/pages/dashboard/HojaDeVidaPrint.jsx`: Removed whole-catalog `loadInstruments` listener.
5. All audited child components properly clean up their subscriptions on unmount.
6. Verification tests passed with 100% compliance: 22/22 unit tests passing, production build succeeded in 1.83s with exit code 0.

---

## 5. Verification Method

To independently verify the implementation:

1. **Execute Unit Tests:**
   ```powershell
   npm.cmd test
   ```
   *Expected result:* 22 tests pass, 0 fail (exit code 0).

2. **Execute Production Build:**
   ```powershell
   npm.cmd run build
   ```
   *Expected result:* Vite build completes successfully, 2745 modules transformed, exit code 0.

3. **Inspect Code Changes:**
   - `src/store/authStore.js`: Verify line 155 returns `onAuthStateChanged` and lines 105, 487 invoke `clearAllSubscriptions`.
   - `src/App.jsx`: Verify lines 45–48 capture `unsub` and return cleanup function.
   - `src/store/inventoryStore.js`: Verify `activeSubscriptions`, `clearAllSubscriptions`, and listener replacement in `loadInstruments` / `loadActivities`.
   - `src/pages/dashboard/HojaDeVidaPrint.jsx`: Verify absence of `loadInstruments` subscription.
