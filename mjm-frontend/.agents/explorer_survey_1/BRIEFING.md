# BRIEFING — 2026-09-21T22:20:00Z

## Mission
Conduct a thorough, read-only investigation of Multi-Tenant Security & Isolation (R1) and React Lifecycle & Memory Leak Eradication (R3) in mjm-frontend, producing an evidence-backed handoff report.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Security & React Lifecycle Investigator
- Working directory: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\explorer_survey_1
- Original parent: 469c650b-58be-4afa-9a90-ba57064436ef
- Milestone: Architectural Audit & Defect Discovery (Survey Phase)

## 🔒 Key Constraints
- Read-only investigation — do NOT modify application source code
- Inspect all Firestore queries (`collection`, `query`, `where`) and Storage references for tenant isolation
- Inspect all `onSnapshot` subscriptions in Zustand stores and React components for memory leaks and cleanup
- Keep BRIEFING.md under ~100 lines; update progress.md as heartbeat

## Current Parent
- Conversation ID: 469c650b-58be-4afa-9a90-ba57064436ef
- Updated: 2026-09-21T22:20:00Z

## Investigation State
- **Explored paths**: `src/config/firebase.js`, `src/services/`, `src/store/`, `src/pages/dashboard/`, `src/layouts/DashboardLayout.jsx`, `src/components/HierarchyTree.jsx`, `src/components/dashboard/ClosureModal.jsx`, `storage.rules`, `functions/index.js`
- **Key findings**:
  1. R1: Unscoped queries to root `inventario_metrologico` in `instruments.js` and `seedData.js`.
  2. R1: `ChatbotSubmissions.jsx` queries all chatbot submissions globally; route `/dashboard/solicitudes` accessible by any tenant.
  3. R1: `HierarchyTree.jsx` queries all tenants and hierarchies if `tenant` is falsy; exposes tenant creation and status toggling to any user.
  4. R1: `storage.rules` only checks `request.auth != null`, allowing any authenticated user to access any other tenant's folder.
  5. R1: `functions/index.js` updates root `inventario_metrologico`.
  6. R1: In `inventoryStore.js` / `authStore.js`, switching tenant retains previous tenant instruments/activities in state (data ghosting/bleed).
  7. R3: `onAuthStateChanged` in `authStore.js` / `App.jsx` lacks unsubscribe cleanup in React useEffect.
  8. R3: Duplicate concurrent subscriptions to `activities` between `DashboardLayout` and page views (e.g. `KanbanMetrologico`, `Calendario`, `DashboardKPIs`, `AsegMetrologico`).
  9. R3: `HojaDeVidaPrint.jsx` attaches real-time `onSnapshot` listener to entire tenant inventory for single-item printing.
  10. R3: No centralized subscription lifecycle management in `inventoryStore.js`.
- **Unexplored areas**: None (full coverage of Firestore, Storage, and onSnapshot lifecycle).

## Key Decisions Made
- All findings verified against actual codebase lines and execution tests (`npm test`, `npm run build`).
- Compiling full 5-component report in `handoff.md`.

## Artifact Index
- DISPATCH.md — Initial user/parent dispatch instructions
- BRIEFING.md — Situational awareness and working memory
- progress.md — Liveness heartbeat and step status
- handoff.md — 5-component structured investigation report
