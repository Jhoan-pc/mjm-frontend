## 2026-09-21T22:36:48Z
You are Worker M3 (React Lifecycle & Memory Leak Eradication Worker).
Your working directory: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\worker_m3
Project root: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend
Authoritative specification: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\ORIGINAL_REQUEST.md
Investigation report: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\explorer_survey_1\handoff.md
Project plan: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You MUST read ORIGINAL_REQUEST.md and explorer_survey_1/handoff.md first.

Your Task:
Implement Milestone 3: React Lifecycle and Memory Leak Eradication (R3)
1. `src/store/authStore.js`:
   - In `initializeAuth`, return `onAuthStateChanged(auth, ...)` so callers can cleanly unsubscribe.
   - In `logout`, call `useInventoryStore.getState().clearAllSubscriptions?.()`.
   - In `switchTenant`, call `useInventoryStore.getState().clearAllSubscriptions?.()`.
2. `src/App.jsx`:
   - In `AppRoutes`, capture `const unsub = initializeAuth();` inside `useEffect` and return `() => { if (unsub) unsub(); }`.
3. `src/store/inventoryStore.js`:
   - Add centralized subscription tracking:
     `activeSubscriptions: { instruments: null, activities: null },`
   - In `loadInstruments`: if `activeSubscriptions.instruments` exists, call it first before opening a new onSnapshot listener. Store the new unsubscribe callback in `activeSubscriptions.instruments`.
   - In `loadActivities`: if `activeSubscriptions.activities` exists, call it first before opening a new onSnapshot listener. Store the new unsubscribe callback in `activeSubscriptions.activities`.
   - Implement `clearAllSubscriptions: () => { ... }`: executes active unsubs, nullifies them, and resets store arrays (`instruments: [], activities: []`).
4. `src/pages/dashboard/HojaDeVidaPrint.jsx`:
   - Remove lines 88-96 (`loadInstruments(activeTenantId)` subscription). The print view only prints a single instrument, which is already accurately loaded by `getInstrumentFromFirestore(id)`.
5. Review child components (`KanbanMetrologico.jsx`, `Calendario.jsx`, `DashboardKPIs.jsx`, `AsegMetrologico.jsx`):
   - Verify every `onSnapshot` / `loadActivities` subscription properly executes its returned cleanup function on unmount, preventing orphaned listeners.
6. Verification:
   - Run `npm.cmd test` and verify that all 22 tests pass.
   - Run `npm.cmd run build` and verify that Vite compiles cleanly with exit code 0.

Write your handoff report to:
`C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\worker_m3\handoff.md`.
Update your progress.md periodically.
When done, send a message back to parent (`469c650b-58be-4afa-9a90-ba57064436ef`).
