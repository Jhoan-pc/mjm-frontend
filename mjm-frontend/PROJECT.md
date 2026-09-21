# Project: mjm-frontend Multidimensional Audit & Remediation (ISO 10012)

## Architecture
- Framework: React 19 + Vite 6 + Tailwind CSS 4 + Zustand + Firebase (Firestore / Storage / Auth)
- Security Model: Multi-tenant hierarchical isolation (`tenants/{tenantId}/...`) with Role-Based Access Control (SuperAdmin, Admin, Técnico, Invitado)
- Metrology Engine: ISO 10012:2003 / JCGM 106:2012 / OIML D28 standard conformity and calibration tracking
- State & Lifecycle Management: Zustand stores (`authStore.js`, `inventoryStore.js`, `contentStore.js`) with deterministic `onSnapshot` subscription lifecycles

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Multi-Tenant Firestore Subcollection Scoping | Ensure all queries target `tenants/{tenantId}/inventario_metrologico` instead of root collections | M1 | Survey (Explorer 1, SEC-01) |
| 2 | Chatbot Submissions Isolation & Access Control | Restrict `/dashboard/solicitudes` and `chatbot_submissions` queries to authorized tenant/SuperAdmin | M1 | Survey (Explorer 1, SEC-02) |
| 3 | Firebase Storage Multi-Tenant Isolation Rules | Restrict bucket paths `tenants/{tenantId}/**` and `certificates/{tenantId}/**` strictly to matching tenant token | M1 | Survey (Explorer 1, SEC-03) |
| 4 | HierarchyTree Tenant Safeguards | Prevent query fallback to all tenants when tenant is uninitialized; restrict tenant creation/suspension to SuperAdmin | M1 | Survey (Explorer 1, SEC-04) |
| 5 | Cross-Tenant State Purge on Switch | Purge inventoryStore immediately upon `switchTenant` to prevent transient data leakage | M1 | Survey (Explorer 1, SEC-05) |
| 6 | ISO 10012 Guard Band Metrological Engine | Expand `calculateMetrologicalCheck` to evaluate $|E| + U \le \text{EMP}$, 6-decimal precision, and guard bands | M2 | Survey (Explorer 2, DEF-04) |
| 7 | IAVerificationLab Absolute Error Calculation | Fix `totalDeviation = (Math.abs(numError) + numUncertainty)` and comparison operator | M2 | Survey (Explorer 2, DEF-01, DEF-02) |
| 8 | DashboardKPIs Absolute Error in Drift Alerts | Fix `Math.abs(err) + unc` in drift monitoring and % MPE calculation | M2 | Survey (Explorer 2, DEF-03) |
| 9 | Single Source of Truth in AsegMetrologico | Use `calculateMetrologicalCheck` from `metrologyCore.js` instead of duplicate local math | M2 | Survey (Explorer 2, DEF-05) |
| 10 | Safe Date Increment with Month-End Protection | Implement and share `calculateNextRoutineDate` to prevent 31st date skipping February | M2 | Survey (Explorer 2, DEF-06) |
| 11 | Auth Observer Cleanup on Unmount | Return `unsubscribe` from `initializeAuth()` and clean up in `App.jsx` `useEffect` | M3 | Survey (Explorer 1, LEAK-01) |
| 12 | Centralized Subscription Manager in inventoryStore | Implement `clearAllSubscriptions` in `inventoryStore.js` and call on logout and tenant switch | M3 | Survey (Explorer 1, LEAK-04) |
| 13 | Elimination of Redundant Concurrent Subscriptions | Avoid duplicate `loadActivities` subscriptions between parent layout and child route views | M3 | Survey (Explorer 1, LEAK-02) |
| 14 | HojaDeVidaPrint Targeted Single-Doc Query | Eliminate full catalog subscription in single-instrument print view | M3 | Survey (Explorer 1, LEAK-03) |
| 15 | Inventario 0px Gap Sticky Command Bar & Table Header | Dock toolbar and `thead` with 0px gap, 100% opaque backgrounds, and 0px corner bleed | M4 | Survey (Explorer 3, R4) |
| 16 | KanbanMetrologico 100% Opaque Sticky Toolbar | Remove 95% opacity transparency bleed, fix corner bleed, and dock flush with board | M4 | Survey (Explorer 3, R4) |
| 17 | Calendario Sticky Toolbar & Weekday Headers | Keep month navigation bar and weekday header row pinned at top on scroll | M4 | Survey (Explorer 3, R4) |
| 18 | HojaDeVida Routine Table Sticky Header | Pin routine/calibration history table `thead` inside scrollable section | M4 | Survey (Explorer 3, R4) |
| 19 | AsegMetrologico MasterLogModal Sticky & Opaque Header | Pin modal table header at top with 100% opaque surface, removing 80% opacity bleed | M4 | Survey (Explorer 3, R4) |
| 20 | Automated Unit Test Suite Expansion | Add comprehensive unit tests for ISO 10012 uncertainty, negative errors, date rollovers | M5 | Survey (Explorer 2, R5) |
| 21 | Full Test Suite & Production Build Verification | Ensure 100% tests pass (`npm test`) and Vite production build succeeds (`npm run build`) | M5 | Survey (Explorer 2, R5) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Multi-Tenant Security & Isolation | Firestore subcollections, storage.rules, ChatbotSubmissions, HierarchyTree, tenant state purge | none | DONE (22/22 tests pass, build 0, clean audit) |
| M2 | Metrological Algorithmic Rigor (ISO 10012) | metrologyCore.js (\|E\|+U<=EMP, date rollover), IAVerificationLab, DashboardKPIs, AsegMetrologico | none | DONE (22/22 tests pass, build 0, clean audit) |
| M3 | React Lifecycle & Memory Leak Eradication | authStore, inventoryStore subscription manager, App unmount cleanup, HojaDeVidaPrint | M1 | DONE (22/22 tests pass, build 0, clean audit) |
| M4 | UI/UX Sticky Headers & Precision Layouts | Inventario 0px gap, Kanban opacity, Calendario, HojaDeVida, AsegMetrologico MasterLogModal | none | DONE (22/22 tests pass, build 0, clean audit) |
| M5 | Automated Verification & Adversarial Hardening | Comprehensive unit tests in test/metrology.test.js, npm test, npm run build verification | M1, M2, M3, M4 | DONE (22/22 tests pass, build 0, clean audit) |

## Interface Contracts

### `src/utils/metrologyCore.js`
- `calculateMetrologicalCheck({ valorLeido, valorPatron, tolerancia, incertidumbre = 0, reglaDecision = 'guard_band' })`:
  Returns:
  ```javascript
  {
    vPatron: number,
    vLeido: number,
    errorVal: number,       // Signed error (6 decimals)
    incertidumbre: number,  // Expanded uncertainty U
    totalDev: number,       // |errorVal| + U (6 decimals)
    tol: number,            // EMP
    consumoPct: number,     // (|errorVal| / tol) * 100
    consumoTotalPct: number,// (totalDev / tol) * 100
    declaracion: 'Conforme' | 'No Conforme' | 'Zona de Duda',
    isCompliant: boolean,
    isGuardBandWarning: boolean
  }
  ```
- `calculateNextRoutineDate(startDateStr: string, freqMonths: number = 12)`:
  Returns ISO string `YYYY-MM-DD` clamped to valid month-end day (e.g. '2026-01-31' + 1 mo -> '2026-02-28').

### `src/store/inventoryStore.js`
- `clearAllSubscriptions()`:
  Cancels any active listeners for instruments and activities, resets state to empty/safe baseline.

### `src/store/authStore.js`
- `initializeAuth()`:
  Returns `unsubscribe: () => void`.

## Code Layout
- `src/utils/metrologyCore.js`: Core metrological calculation routines & date calculations
- `src/store/authStore.js`: Authentication state, session handling, tenant context
- `src/store/inventoryStore.js`: Instruments, activities, plant verification logs, listener lifecycle
- `src/services/instruments.js`: Service layer for instrument Firestore operations
- `src/components/HierarchyTree.jsx`: Multi-tenant organization tree
- `src/pages/dashboard/`:
  - `Inventario.jsx`: Main equipment inventory grid and table
  - `IAVerificationLab.jsx`: Calibration certificate IA extraction and metrological verification lab
  - `DashboardKPIs.jsx`: Real-time operational metrology indicators and drift warnings
  - `AsegMetrologico.jsx`: In-plant routine checks and verification logs modal
  - `Calendario.jsx`: Metrological calibration and maintenance scheduling
  - `KanbanMetrologico.jsx`: Operational activity workflow board
  - `HojaDeVida.jsx` & `HojaDeVidaPrint.jsx`: Technical passport and printable certificate view
  - `ChatbotSubmissions.jsx`: Commercial and technical assistance incoming requests
- `storage.rules`: Firebase Cloud Storage authorization rules
- `test/metrology.test.js`: Automated unit test suite run via `node --test`
