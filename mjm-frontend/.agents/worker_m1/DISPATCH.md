# Worker M1 Dispatch Log

## 2026-09-21T22:25:12Z
You are Worker M1 (Multi-Tenant Security & Isolation Implementation).
Your working directory: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\worker_m1
Project root: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend
Authoritative specification: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\ORIGINAL_REQUEST.md
Investigation report: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\explorer_survey_1\handoff.md
Project plan: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You MUST read ORIGINAL_REQUEST.md and explorer_survey_1/handoff.md first.

Your Task:
Implement Milestone 1: Multi-Tenant Logical Security & Isolation (R1)
1. `src/services/instruments.js`:
   - Update `getInstrumentById(tenantId, id)` to query the canonical tenant subcollection `doc(db, 'tenants', tenantId, 'inventario_metrologico', id)` instead of the root collection. Guard against missing/undefined `tenantId` or `id`.
2. `src/data/seedData.js`:
   - In `seedInstruments(tenantId)`, ensure documents are written to the tenant subcollection `collection(db, 'tenants', tenantId, 'inventario_metrologico')` instead of root `inventario_metrologico`.
3. `src/pages/dashboard/ChatbotSubmissions.jsx`:
   - Scope submissions queries: If the user is not superadmin, query with `where('tenantId', '==', tenant?.id)`.
4. `src/App.jsx`:
   - Protect `/dashboard/solicitudes` route so only `isSuperAdmin` can access it (`isSuperAdmin ? <ChatbotSubmissions /> : <Navigate to="/dashboard" replace />`). Ensure `isSuperAdmin` is properly retrieved from `useAuthStore`.
5. `src/components/HierarchyTree.jsx`:
   - Guard queries so non-superadmins NEVER list all tenants or all hierarchies. If `!isSuperAdmin && !tenant`, do not execute open root queries.
   - Guard tenant creation (`+ Nuevo Cliente`) and `handleToggleStatus` so only `isSuperAdmin` can execute them.
6. `storage.rules`:
   - Strengthen rules for `/tenants/{tenantId}/{allPaths=**}` and `/certificates/{tenantId}/{allPaths=**}`: require `request.auth != null && (request.auth.token.tenantId == tenantId || request.auth.token.isSuperAdmin == true || tenantId == 'sandboxdemo' || tenantId == 'sandbox-guest-001')`.
7. `src/store/authStore.js` and `src/store/inventoryStore.js`:
   - In `switchTenant(newTenant)` in `authStore.js`, immediately reset/clear `useInventoryStore` state (`instruments: [], activities: [], loading: true`) before fetching the new tenant data so that equipment of one tenant never bleeds visually under another tenant's branding.
8. Verification:
   - Run `npm.cmd test` and verify that all 22 tests pass.
   - Run `npm.cmd run build` and verify that Vite builds cleanly with exit code 0.

Document all changes, before/after diffs, and verification commands in:
`C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\worker_m1\handoff.md`.
Update your progress.md periodically.
When done, send a message back to parent (`469c650b-58be-4afa-9a90-ba57064436ef`).
