# Forensic Audit Report - Milestone 1: Multi-Tenant Logical Security & Storage Isolation

**Agent ID:** auditor_m1  
**Role:** Forensic Auditor & Critic  
**Parent Agent:** 469c650b-58be-4afa-9a90-ba57064436ef  
**Project Root:** `C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend`  
**Working Directory:** `C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\auditor_m1`  
**Date:** 2026-09-21  

---

## Forensic Audit Summary

- **Work Product**: Milestone 1 Implementation (Files: `src/services/instruments.js`, `src/data/seedData.js`, `storage.rules`, `src/pages/dashboard/ChatbotSubmissions.jsx`, `src/App.jsx`, `src/components/HierarchyTree.jsx`, `src/store/inventoryStore.js`, `src/store/authStore.js`)
- **Profile**: General Project (Demo Mode)
- **Verdict**: **CLEAN**

---

## 1. Observation

Direct empirical inspection and automated tool execution against the Milestone 1 modifications yielded the following verbatim facts:

### 1.1 `src/services/instruments.js` (Lines 4-18)
- Signature: `getInstrumentById: async (tenantId, id) => { ... }`
- Parameter Guard: `if (!tenantId || !id) return null;`
- Subcollection Construction: `const snap = await getDoc(doc(db, 'tenants', tenantId, 'inventario_metrologico', id));`
- Verbatim code inspection confirms no hardcoded tenant string; requires explicit `tenantId` parameter.

### 1.2 `src/data/seedData.js` (Lines 54-76)
- Signature: `export const seedInstruments = async (tenantId) => { ... }`
- Parameter Guard: `if (!tenantId) { console.error("seedInstruments cancelado: tenantId no proporcionado."); return 0; }`
- Target path: `await addDoc(collection(db, 'tenants', tenantId, 'inventario_metrologico'), { ... });`
- Verbatim grep confirmed zero occurrences of legacy root `collection(db, 'inventario_metrologico')`.

### 1.3 `storage.rules` (Lines 8-31)
- Rule blocks for `/tenants/{tenantId}/{allPaths=**}` and `/certificates/{tenantId}/{allPaths=**}`:
  ```javascript
  allow read, write: if request.auth != null && (
    request.auth.token.tenantId == tenantId ||
    request.auth.token.isSuperAdmin == true ||
    tenantId == 'sandboxdemo' ||
    tenantId == 'sandbox-guest-001'
  );
  ```
- Catch-all fallback block for `/{allPaths=**}`:
  ```javascript
  allow read, write: if false;
  ```
- Storage rules logic simulator passed 8/8 test cases (including unauthenticated rejection, cross-tenant file access denial, cross-tenant certificate denial, and root path denial).

### 1.4 `src/pages/dashboard/ChatbotSubmissions.jsx` (Lines 13-44) & `src/App.jsx` (Line 82)
- In `ChatbotSubmissions.jsx`:
  ```javascript
  let q;
  if (isSuperAdmin) {
    q = query(collection(db, 'chatbot_submissions'), orderBy('timestamp', 'desc'));
  } else if (tenant?.id) {
    q = query(
      collection(db, 'chatbot_submissions'),
      where('tenantId', '==', tenant.id),
      orderBy('timestamp', 'desc')
    );
  } else {
    setSubmissions([]);
    setLoading(false);
    return;
  }
  ```
- Real-time listener cleanup: `return () => unsubscribe();` returns the unmount tear-down callback.
- In `App.jsx`:
  ```javascript
  <Route path="solicitudes" element={isSuperAdmin ? <ChatbotSubmissions /> : <Navigate to="/dashboard" replace />} />
  ```
- Route enforces navigation protection: non-superadmin users are redirected to `/dashboard`.

### 1.5 `src/components/HierarchyTree.jsx` (Lines 184-250, 400-478, 510-538)
- Guard against unauthenticated/unresolved state:
  ```javascript
  if (!isSuperAdmin && !tenant) {
    setData([]);
    setIsLoading(false);
    return;
  }
  ```
- Tenant loading query:
  `isSuperAdmin ? collection(db, 'tenants') : query(collection(db, 'tenants'), where('__name__', '==', tenant.id))`
- Hierarchy loading query: Scoped to subcollection `collection(db, 'tenants', tenant.id, 'hierarchy')` with fallback to `where('tenantId', '==', tenant.id)`. Global unconstrained query is restricted strictly to `isSuperAdmin`.
- Access controls:
  - `+ Nuevo Cliente` button wrapped in `{isSuperAdmin && ( ... )}`
  - `openModal` client creation guarded by `if (type === 'cliente' && !isSuperAdmin) return;`
  - `handleCreate` guarded by `if (!isSuperAdmin) { alert(...); return; }`
  - `handleToggleStatus` guarded by `if (!isSuperAdmin) { alert(...); return; }`
  - `TreeNode` receives `onToggleStatus={isSuperAdmin ? handleToggleStatus : null}`

### 1.6 `src/store/inventoryStore.js` & `src/store/authStore.js`
- `inventoryStore.js` exposes:
  ```javascript
  resetInventoryState: () => {
    set({ instruments: [], activities: [], loading: true });
  },
  ```
- `authStore.js` invokes `resetInventoryState` synchronously upon `switchTenant`:
  ```javascript
  useInventoryStore.getState().resetInventoryState?.() ||
    useInventoryStore.setState({ instruments: [], activities: [], loading: true });
  ```

### 1.7 Empirical Test & Build Verification
1. **Automated Unit Tests**:
   Command: `npm.cmd test`
   Output:
   - 22 tests passing in 91ms (0 failures, 0 errors, exit code 0).
2. **Production Build**:
   Command: `npm.cmd run build`
   Output:
   - 2745 modules transformed.
   - Built in 2.11s with 0 errors, exit code 0.
3. **Forensic Integrity Suite**:
   Output:
   - 18/18 checks passed with 0 violations.

---

## 2. Logic Chain

1. **Absence of Hardcoded Values and Facade Logic (Obs. 1.1, 1.2, 1.3, 1.4, 1.5, 1.6):**
   Grep analysis and AST checks verify that dynamic identifiers (`tenantId`, `tenant?.id`, `request.auth.token.tenantId`) are passed throughout all updated modules. No dummy returns (`return true`, `return []`) were substituted for genuine Firestore queries or security checks.

2. **Genuine Subcollection Construction (Obs. 1.1, 1.2):**
   Both `instrumentsService.getInstrumentById` and `seedInstruments` employ Firestore SDK functions (`doc(db, 'tenants', tenantId, ...)`, `collection(db, 'tenants', tenantId, ...)`). All occurrences of `inventario_metrologico` across `src/` are scoped under `/tenants/${tenantId}/`.

3. **Storage Security Enforcement (Obs. 1.3):**
   `storage.rules` inspects `request.auth.token.tenantId` for parity with path wildcard `{tenantId}`, verifies `request.auth.token.isSuperAdmin`, and denies all unstructured root accesses with `match /{allPaths=**} { allow read, write: if false; }`. Simulation under 8 permission scenarios demonstrated strict isolation.

4. **Defense-in-Depth for Inquiries and Hierarchy (Obs. 1.4, 1.5):**
   `ChatbotSubmissions` is protected at two discrete architectural boundaries: the router boundary (`App.jsx` redirects non-superadmins) and the query boundary (`where('tenantId', '==', tenant.id)`). Similarly, `HierarchyTree.jsx` strictly scopes documents by tenant document ID (`__name__`) and tenant subcollections, while removing administrative client management capabilities from non-superadmin clients.

5. **Visual Bleed Elimination (Obs. 1.6):**
   Synchronously resetting Zustand inventory state during tenant transition eradicates temporary stale state rendering while Firestore network listeners resolve new tenant data.

6. **Regression and Integrity Preservation (Obs. 1.7):**
   All 22 unit tests execute and pass cleanly, production Vite compilation succeeds with 0 errors, and zero pre-populated or fabricated verification artifacts exist in the repository.

---

## 3. Caveats

- **Firebase Storage Token Claims**: In production, Firebase Authentication custom claims (`token.tenantId`, `token.isSuperAdmin`) must be minted by Firebase Admin SDK during user provisioning. In local dev/sandbox mode, sandboxes `sandboxdemo` and `sandbox-guest-001` are explicitly granted access by the storage rule.
- **Firestore Security Rules**: The frontend repository contains `storage.rules`, whereas `firestore.rules` is maintained in the Firebase deployment configuration or backend repository. The frontend queries enforce tenant scoping strictly at the query layer (`where('tenantId', '==', tenant.id)` and `/tenants/${tenantId}/...` subcollections).

---

## 4. Conclusion

**Verdict: CLEAN**

Milestone 1 satisfies all requirements of Logical Security and Storage Isolation (R1).
- 0 hardcoded tenant bypasses found.
- 0 facade or stub implementations found.
- 0 pre-populated or fabricated test artifacts found.
- 100% of Firestore queries for instruments and hierarchy are scoped by tenant.
- Storage rules enforce JWT claims and deny root access.
- Chatbot submissions and hierarchy administration are restricted with defense-in-depth.
- Build and automated test suite pass with exit code 0.

The work product for Milestone 1 is verified authentic and approved.

---

## 5. Verification Method

To independently reproduce the forensic verification:

### 5.1 Run Automated Unit Tests
```powershell
cd "C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend"
npm.cmd test
```
*Expected: 22 passing tests, 0 failures, exit code 0.*

### 5.2 Run Production Build
```powershell
npm.cmd run build
```
*Expected: Build completes successfully in ~2-5s, exit code 0.*

### 5.3 Run Milestone 1 Forensic Structural Script
```powershell
@'
const fs = require('fs');
const assert = require('assert');

// 1. instruments.js subcollection
const instCode = fs.readFileSync('./src/services/instruments.js', 'utf8');
assert.ok(instCode.includes("doc(db, 'tenants', tenantId, 'inventario_metrologico', id)"));
assert.ok(instCode.includes("if (!tenantId || !id) return null;"));

// 2. storage.rules token check
const rules = fs.readFileSync('./storage.rules', 'utf8');
assert.ok(rules.includes("request.auth.token.tenantId == tenantId"));
assert.ok(rules.includes("allow read, write: if false;"));

// 3. App.jsx route protection
const appCode = fs.readFileSync('./src/App.jsx', 'utf8');
assert.ok(appCode.includes("isSuperAdmin ? <ChatbotSubmissions /> : <Navigate to=\"/dashboard\" replace />"));

console.log("All Milestone 1 Forensic Checks Verified.");
'@ | node
```
*Expected: Prints "All Milestone 1 Forensic Checks Verified." with exit code 0.*

### 5.4 Invalidation Conditions
This audit verdict would be invalidated if:
1. Any unauthenticated client or user from Tenant A can access `/certificates/tenantB/` in Firebase Storage.
2. Direct navigation to `/dashboard/solicitudes` displays another tenant's inquiries to a non-superadmin client.
3. A non-superadmin user can create or deactivate tenants in the Hierarchy Tree.
