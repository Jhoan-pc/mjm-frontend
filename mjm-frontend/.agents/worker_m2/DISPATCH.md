## 2026-09-21T22:17:12Z
You are Worker M2 (Metrological Rigor & ISO 10012 Implementation).
Your working directory: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\worker_m2
Project root: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend
Authoritative specification: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\ORIGINAL_REQUEST.md
Full investigation report to follow: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\explorer_survey_2\handoff.md
Project plan: C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You MUST read ORIGINAL_REQUEST.md and explorer_survey_2/handoff.md first.

Your Task:
Implement Milestone 2: Metrological Algorithmic Rigor (ISO 10012)
1. `src/utils/metrologyCore.js`:
   - Enhance `calculateMetrologicalCheck({ valorLeido, valorPatron, tolerancia, incertidumbre = 0, reglaDecision = 'guard_band' })`
     - Accept optional `incertidumbre` ($U$).
     - Calculate signed error: `errorVal = Number((vLeido - vPatron).toFixed(6))`
     - Calculate absolute error: `absError = Math.abs(errorVal)`
     - Calculate total deviation: `totalDev = Number((absError + u).toFixed(6))`
     - Calculate consumption percentages: `consumoPct = (|errorVal| / tol) * 100`, `consumoTotalPct = (totalDev / tol) * 100` (capped at 999)
     - Decision rules:
       If $u > 0$:
         if `absError > tol` -> 'No Conforme'
         else if `totalDev > tol` -> reglaDecision === 'guard_band' ? 'Zona de Duda' : 'Conforme'
         else -> 'Conforme'
       If $u === 0$:
         `absError <= tol ? 'Conforme' : 'No Conforme'`
     - Return object with: `vPatron`, `vLeido`, `errorVal`, `incertidumbre: u`, `totalDev`, `tol`, `consumoPct`, `consumoTotalPct`, `declaracion`, `isCompliant: declaracion === 'Conforme'`, `isGuardBandWarning: declaracion === 'Zona de Duda'`.
   - Implement and export `calculateNextRoutineDate(startDateStr, freqMonths = 12)` with safe month-end day clamping so adding months from a 31st date clamps to the last valid day of target month (e.g. '2026-01-31' + 1 mo -> '2026-02-28', leap year '2024-01-31' + 1 mo -> '2024-02-29').
2. `src/pages/dashboard/IAVerificationLab.jsx`:
   - Fix line 50: `totalDeviation = (Math.abs(numError) + numUncertainty).toFixed(4)`
   - Fix line 188: `Number(totalDeviation) <= numTol ? '≤' : '>'`
3. `src/pages/dashboard/DashboardKPIs.jsx`:
   - Lines 42-47 and 174-180: Use `const totalDev = Math.abs(err) + unc; if (tol > 0 && totalDev > 0.8 * tol)` and `desc = 'Alerta de Deriva (' + Math.round((totalDev / tol) * 100) + '% del MPE)'`
4. `src/pages/dashboard/AsegMetrologico.jsx`:
   - Import `calculateMetrologicalCheck` from `../../utils/metrologyCore` and use it in `useMemo` (lines 124–140) eliminating duplicated logic.
5. `src/pages/dashboard/HojaDeVidaPrint.jsx` & `src/pages/dashboard/HojaDeVida.jsx`:
   - Use `calculateNextRoutineDate` to replace unsafe `setMonth` date increments.
6. Run Verification:
   - Run `npm.cmd test` and verify that all tests pass.
   - Run `npm.cmd run build` and verify that Vite builds cleanly with exit code 0.

Document your changes, verified build/test outputs, and before/after comparisons in `C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend\.agents\worker_m2\handoff.md`.
Update your `progress.md` before and after each step.
When finished, send a message back to parent (`469c650b-58be-4afa-9a90-ba57064436ef`) with summary and handoff path.
