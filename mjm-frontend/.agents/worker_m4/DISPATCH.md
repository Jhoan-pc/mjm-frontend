## 2026-09-21T22:40:57Z
You are Worker M4 (UI/UX Sticky Headers and Precision Layouts Worker).
Your working directory: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\worker_m4
Project root: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend
Authoritative specification: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\ORIGINAL_REQUEST.md
Full investigation report: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\explorer_survey_3\handoff.md
Project plan: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You MUST read ORIGINAL_REQUEST.md and explorer_survey_3/handoff.md first.

Your Task:
Implement Milestone 4: UI/UX Sticky Headers and Precision Layouts (R4)
1. `src/pages/dashboard/Inventario.jsx`:
   - Command Bar (line 1608): eliminate `mb-4` (use `mb-0`), enforce 100% opaque background `bg-[var(--surface)] dark:bg-[var(--surface)] border-b border-[var(--outline-color)]` (fixing dark mode `#070C18` vs table header `#151F33` color seam). Ensure `md:h-[52px]` is cleanly enforced.
   - PrecisionTableView (lines 372-386):
     - Replace `border-collapse` with `border-separate border-spacing-0` so table borders remain crisp upon scrolling.
     - Remove `rounded-tl-xl` and `rounded-tr-xl` from `th` elements so header corners are square (`rounded-none`), eliminating text bleeding through rounded corners.
     - Enforce 100% opaque background on `thead` and `th`: `bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] border-b border-[var(--outline-color)] z-20`.
     - Ensure the table container and header dock flush with 0px gap beneath the command bar. Wrap table in dedicated scroll container `max-h-[calc(100vh-210px)] overflow-auto` with `sticky top-0 z-20` on `thead` (or match command bar top offset) so scrolling is completely immune to viewport size.
2. `src/pages/dashboard/KanbanMetrologico.jsx`:
   - Header (line 438): Replace `bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md` with 100% opaque `bg-[var(--surface)] border border-[var(--outline-color)]` (or `bg-white dark:bg-[#101726]`).
   - Replace `rounded-2xl` with `rounded-b-2xl rounded-t-none` when docked at `top-0` to eliminate corner text bleed.
   - Remove `mb-4` or eliminate floating card gap.
3. `src/pages/dashboard/Calendario.jsx`:
   - Make the month navigation toolbar sticky: `sticky top-0 z-20 bg-[var(--surface)] border-b border-[var(--outline-color)] shadow-xs`.
   - Make weekday header row (`LU`, `MA`, `MI...`) sticky beneath it with `sticky top-[52px] z-20 bg-[var(--surface-alt)] border-b border-[var(--outline-color)] shadow-xs` with 100% opaque background.
4. `src/pages/dashboard/HojaDeVida.jsx`:
   - Routine/calibration history table (lines 616–626): wrap table in `max-h-[380px] overflow-auto` and add `sticky top-0 z-10 bg-[var(--surface-alt)] shadow-xs border-b border-[var(--outline-color)]` to `<thead>`.
5. `src/pages/dashboard/AsegMetrologico.jsx`:
   - In `MasterLogModal` (lines 643–664): add `sticky top-0 z-20 bg-slate-50 dark:bg-zinc-900 shadow-xs border-b border-slate-200 dark:border-zinc-700` to `<thead>`. Remove `dark:bg-zinc-800/80` (80% opacity) and enforce 100% opacity (`dark:bg-zinc-900`).
   - On the main view, make the search toolbar sticky with `sticky top-0 z-20 bg-[var(--surface)]`.
6. Verification:
   - Run `npm.cmd test` to confirm all 22 tests pass.
   - Run `npm.cmd run build` to confirm Vite compiles cleanly with exit code 0.

Document all changes, before/after comparisons, and verification outputs in:
`C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\worker_m4\handoff.md`.
Update your progress.md periodically.
When done, send a message back to parent (`469c650b-58be-4afa-9a90-ba57064436ef`).
