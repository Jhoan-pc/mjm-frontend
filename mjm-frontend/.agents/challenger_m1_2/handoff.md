# Handoff Report - Challenger M1-2: Storage & RBAC Rule Challenger

**Agent:** challenger_m1_2  
**Parent Agent:** 469c650b-58be-4afa-9a90-ba57064436ef  
**Project Root:** `C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend`  
**Working Directory:** `C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\challenger_m1_2`  
**Verdict:** **APPROVE**  
**Date:** 2026-09-21  

---

## 1. Observation

Direct empirical inspection and automated harness testing of the brownfield codebase and Worker M1's modifications yielded the following direct observations:

### 1.1 `storage.rules` (Lines 1-32)
```javascript
1: rules_version = '2';
2: 
3: service firebase.storage {
4:   match /b/{bucket}/o {
5:     
6:     // Aislamiento Multi-Tenant Estricto (ISO/IEC 27001 & SDD Contrato)
7:     // Permite lectura y escritura únicamente en rutas encapsuladas por tenantId
8:     match /tenants/{tenantId}/{allPaths=**} {
9:       allow read, write: if request.auth != null && (
10:         request.auth.token.tenantId == tenantId ||
11:         request.auth.token.isSuperAdmin == true ||
12:         tenantId == 'sandboxdemo' ||
13:         tenantId == 'sandbox-guest-001'
14:       );
15:     }
16: 
17:     // Ruta de certificados por tenant (Compatibilidad trazabilidad INM)
18:     match /certificates/{tenantId}/{allPaths=**} {
19:       allow read, write: if request.auth != null && (
20:         request.auth.token.tenantId == tenantId ||
21:         request.auth.token.isSuperAdmin == true ||
22:         tenantId == 'sandboxdemo' ||
23:         tenantId == 'sandbox-guest-001'
24:       );
25:     }
26: 
27:     // Denegar cualquier acceso a rutas raíz o desestructuradas
28:     match /{allPaths=**} {
29:       allow read, write: if false;
30:     }
31:   }
32: }
```
- Line 1 specifies `rules_version = '2';`.
- Line 28 defines a global default deny `match /{allPaths=**} { allow read, write: if false; }`.
- Rules require `request.auth != null`, preventing all anonymous or unauthenticated access across all paths (including sandboxes).
- A user authenticated with `token.tenantId == 'tenantA'` trying to read or write `/tenants/tenantB/...` or `/certificates/tenantB/...` evaluates all 4 disjunction conditions to false:
  - `request.auth.token.tenantId == 'tenantB'` -> false
  - `request.auth.token.isSuperAdmin == true` -> false
  - `tenantId == 'sandboxdemo'` -> false
  - `tenantId == 'sandbox-guest-001'` -> false
  Access is strictly DENIED.

### 1.2 Route Protection in `src/App.jsx` (Lines 81-83)
```javascript
81:             {/* Otros módulos */}
82:             <Route path="solicitudes" element={isSuperAdmin ? <ChatbotSubmissions /> : <Navigate to="/dashboard" replace />} />
83:             <Route path="ia-lab" element={<IAVerificationLab />} />
```
- Line 42 binds `const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);`.
- For unprivileged users (`isSuperAdmin === false`), route `/dashboard/solicitudes` evaluates to `<Navigate to="/dashboard" replace />`, preventing `<ChatbotSubmissions />` from mounting.
- Defense-in-depth in `src/pages/dashboard/ChatbotSubmissions.jsx` (lines 16-28):
```javascript
16:     if (isSuperAdmin) {
17:       q = query(collection(db, 'chatbot_submissions'), orderBy('timestamp', 'desc'));
18:     } else if (tenant?.id) {
19:       q = query(
20:         collection(db, 'chatbot_submissions'),
21:         where('tenantId', '==', tenant.id),
22:         orderBy('timestamp', 'desc')
23:       );
24:     } else {
25:       setSubmissions([]);
26:       setLoading(false);
27:       return;
28:     }
```
Non-superadmin queries are strictly constrained to the user's `tenant.id`.

### 1.3 `switchTenant` State Purge in `src/store/authStore.js` (Lines 105-110) & `src/store/inventoryStore.js` (Lines 123-126)
In `authStore.js`:
```javascript
105:   switchTenant: async (newTenant) => {
106:     // 🛡️ Aislamiento Multi-Tenant: Limpiar inmediatamente estado de inventario
107:     // antes de consultar o renderizar datos del nuevo tenant para erradicar sangrado visual entre marcas
108:     useInventoryStore.getState().resetInventoryState?.() ||
109:       useInventoryStore.setState({ instruments: [], activities: [], loading: true });
```
In `inventoryStore.js`:
```javascript
123:   // 🧹 Purga de estado de inventario para alternancia segura de tenant (evita sangrado visual)
124:   resetInventoryState: () => {
125:     set({ instruments: [], activities: [], loading: true });
126:   },
```
The state purge is called **synchronously** before any asynchronous document fetching or tenant state mutation occurs.

### 1.4 Empirical Stress Test Results (`test/challenger_m1_2_empirical.js`)
Executed command: `node test/challenger_m1_2_empirical.js`  
Result:
```
=== STARTING CHALLENGER M1-2 EMPIRICAL SECURITY & RBAC AUDIT SUITE ===

--- SUITE 1: storage.rules ISOLATION & PRIVILEGE ESCALATION ---
  [PASS] 1.1 storage.rules syntax and rules_version check
  [PASS] 1.2 Cross-Tenant Isolation: Tenant A cannot read or write to Tenant B (/tenants/tenantB/...)
  [PASS] 1.3 Cross-Tenant Isolation: Tenant A cannot read or write to Tenant B (/certificates/tenantB/...)
  [PASS] 1.4 Tenant A legitimate access: Tenant A can read and write its own files
  [PASS] 1.5 SuperAdmin Access: SuperAdmin can read and write across any tenant
  [PASS] 1.6 Sandbox Demo Protection: Demo sandbox is accessible to authenticated users without leaking corporate tenants
  [PASS] 1.7 Unauthenticated Access: Unauthenticated callers cannot read or write to ANY path
  [PASS] 1.8 Path Traversal Resistance: Relative escapes resolve safely
  [PASS] 1.9 Root & Unstructured Path Protection: Access to root or other paths is denied
  [PASS] 1.10 Token Tampering Resistance: Missing or invalid token claims reject safely

--- SUITE 2: ROUTE PROTECTION (/dashboard/solicitudes in App.jsx) ---
  [PASS] 2.1 App.jsx contains guarded route for solicitudes
  [PASS] 2.2 Route Guard Decision Oracle rejects non-superadmin users
  [PASS] 2.3 Defense-in-depth: ChatbotSubmissions.jsx enforces tenant isolation in Firestore queries

--- SUITE 3: switchTenant STORE CLEARING ---
  [PASS] 3.1 inventoryStore.js defines resetInventoryState
  [PASS] 3.2 authStore.js imports useInventoryStore and triggers resetInventoryState on switchTenant
  [PASS] 3.3 Empirical simulation of switchTenant state transition

--- SUITE 4: DEFENSE-IN-DEPTH CONTROLS (HierarchyTree & instrumentsService) ---
  [PASS] 4.1 HierarchyTree.jsx scopes queries to tenant and blocks unauthorized tenant creation
  [PASS] 4.2 instrumentsService targets canonical subcollection with parameter guards
  [PASS] 4.3 seedData.js scopes writes to subcollection

=== EMPIRICAL TEST SUITE EXECUTION SUMMARY ===
Passed: 19
Failed: 0
```

### 1.5 Build & Test Pipeline Integrity
- `npm.cmd test`: 22/22 unit tests passing (0 failures).
- `npm.cmd run build`: Vite build completed in 2.16s with exit code 0 and 0 errors.

---

## 2. Logic Chain

1. **Privilege Escalation Vector Analysis**:
   - In `storage.rules`, path `/tenants/{tenantId}/{allPaths=**}` and `/certificates/{tenantId}/{allPaths=**}` evaluate `request.auth.token.tenantId == tenantId`.
   - When a token from Tenant A targets `/tenants/tenantB/...`, `tenantId` is `'tenantB'`. The evaluation `'tenantA' == 'tenantB'` is false.
   - Unless `token.isSuperAdmin === true`, the condition is completely unsatisfied and access is denied by the rules engine.
   - For sandboxes (`sandboxdemo`, `sandbox-guest-001`), authenticated users can access the sandbox space without having `token.tenantId == 'sandboxdemo'`. However, when a demo user attempts to access corporate tenant `corpB`, the sandbox exception clauses (`tenantId == 'sandboxdemo' || tenantId == 'sandbox-guest-001'`) evaluate to false because the target `tenantId` is `'corpB'`. Corporate tenant files remain completely isolated from sandbox users.
   - Relative path traversal (e.g. `/tenants/tenantA/../tenantB/doc.pdf`) is canonicalized by Firebase Storage to `/tenants/tenantB/doc.pdf` prior to match resolution, preventing path escape.

2. **Route Protection & Navigation Enforcement**:
   - In `App.jsx`, React Router evaluates `element={isSuperAdmin ? <ChatbotSubmissions /> : <Navigate to="/dashboard" replace />}`.
   - When any non-superadmin user (such as a client engineer or guest) navigates to `/dashboard/solicitudes`, the element renders `<Navigate to="/dashboard" replace />`, instantly aborting route mounting and redirecting the browser.
   - As an additional layer of defense-in-depth, if `<ChatbotSubmissions />` were ever mounted, its internal `useEffect` enforces `where('tenantId', '==', tenant.id)` on Firestore queries, ensuring zero cross-tenant lead exposure.

3. **Store Clearing & Eradication of Visual Data Bleeding**:
   - When switching tenants via `switchTenant(newTenant)`, `authStore.js` synchronously executes `useInventoryStore.getState().resetInventoryState?.()` before beginning any Firestore reads or updating the tenant identity.
   - `resetInventoryState` resets `instruments` and `activities` to empty arrays and sets `loading: true`.
   - This guarantees that between the moment a user initiates a tenant switch and the moment the new tenant's data arrives over the network, no remnants of the former company's equipment, activities, or calibration histories remain rendered on screen.

---

## 3. Caveats

- **Firebase Auth Custom Claims Assignment**: `storage.rules` depends on `request.auth.token.tenantId` and `request.auth.token.isSuperAdmin`. Real users provisioned in Firebase Authentication must have these custom claims assigned by the Firebase Admin SDK or Cloud Functions upon user creation. If a user is created in Firebase Auth without custom claims, they will be denied access to Storage until the claims are set.
- **Client-Side Storage vs Frontend Demo**: In frontend demo mode (`isDemoMode = true`), the application uses in-memory `sessionStorage` and does not invoke Firebase Auth or Storage APIs, so demo visitors operate in an isolated sandbox without generating network errors against `storage.rules`.

---

## 4. Conclusion

**Verdict: APPROVE**

The implementation by Worker M1 satisfies all requirements of Milestone 1 / R1:
1. `storage.rules` completely blocks cross-tenant access between Tenant A and Tenant B, restricts unauthenticated users, allows SuperAdmin oversight, and isolates demo sandboxes from corporate tenant data.
2. Route `/dashboard/solicitudes` in `App.jsx` reliably rejects non-superadmin users and redirects them to `/dashboard`.
3. `switchTenant` in `authStore.js` synchronously purges `useInventoryStore` state via `resetInventoryState`, eliminating visual bleeding across client sessions.
4. All 19 empirical security and RBAC tests pass with 0 failures, 22/22 unit tests pass, and the production build completes cleanly.

---

## 5. Verification Method

To independently reproduce and verify this verdict:

```powershell
# 1. Run the Challenger M1-2 empirical security and RBAC test suite
node test/challenger_m1_2_empirical.js

# 2. Run the full unit test suite
npm.cmd test

# 3. Run production build
npm.cmd run build
```

### Invalidation Conditions
This verdict would be invalidated if:
1. `node test/challenger_m1_2_empirical.js` reports any failing test cases.
2. An authenticated user belonging to Tenant A can read or write to `/tenants/tenantB/...` or `/certificates/tenantB/...` in Firebase Storage.
3. A client user can access or view chatbot submissions from other organizations on `/dashboard/solicitudes`.
4. Instruments or activities from Tenant A remain visible on the UI when switching to Tenant B during the loading state.
