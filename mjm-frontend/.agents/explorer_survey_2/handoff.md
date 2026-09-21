# Metrological Rigor (ISO 10012) & Verification Audit Report (R2 & R5)

**Agent**: Explorer 2 (Metrological Rigor & Verification)  
**Date**: 2026-09-21  
**Status**: Investigation Complete — Hard Handoff  
**Working Directory**: `.agents/explorer_survey_2`  
**Project Root**: `C:\Users\German Higuera\OneDrive\Documentos\Projects\mjm-frontend\mjm-frontend`  

---

## 1. Observation

### 1.1 Automated Test & Build Status (R5 Baseline)
Execution of test suite and Vite production compilation via terminal:

1. **`npm.cmd test`** (`node --test test/metrology.test.js`):
   - Command executed: `npm.cmd test`
   - Result: Exit code `0`.
   - Output:
     ```
     > mjm-frontend@1.0.0 test
     > node --test test/metrology.test.js

     ▶ Metrology Core: Conformidad Metrológica según ISO 10012
       ✔ Caso 1: Lectura dentro de tolerancia debe ser Conforme (0.4434ms)
       ✔ Caso 2: Lectura fuera de tolerancia debe ser No Conforme (0.0902ms)
       ✔ Caso 3: Error negativo dentro de tolerancia (0.0905ms)
       ✔ Caso 4: Límite exacto de tolerancia es Conforme (100%) (0.1716ms)
     ✔ Metrology Core: Conformidad Metrológica según ISO 10012 (2.1731ms)
     ▶ Metrology Core: Proyección a 5 Años de Actividades Operativas
       ✔ Genera 5 actividades de Calibración anuales con flag en la última (0.683ms)
       ✔ Asigna prioridad media a instrumentos con riesgo bajo/medio (0.1627ms)
       ✔ Genera cascada semestral (10 actividades en 5 años) (0.1544ms)
     ✔ Metrology Core: Proyección a 5 Años de Actividades Operativas (1.3987ms)
     ℹ tests 9 | suites 0 | pass 9 | fail 0 | cancelled 0 | skipped 0 | todo 0
     ℹ duration_ms 70.5603
     ```
   - Test suite currently contains only 9 tests in a single file `test/metrology.test.js`.

2. **`npm.cmd run build`** (`vite build`):
   - Command executed: `npm.cmd run build`
   - Result: Exit code `0` (built cleanly in 1.77s, 2745 modules transformed, 0 syntax/compilation errors).

---

### 1.2 Verbatim Code Observations

#### A. `src/pages/dashboard/IAVerificationLab.jsx` (Lines 47–51, 150–155, 186–190)
```javascript
47:   const numError = parseFloat(error) || 0;
48:   const numUncertainty = parseFloat(uncertainty) || 0;
49:   const numTol = parseFloat(tolerance) || 0;
50:   const totalDeviation = (numError + numUncertainty).toFixed(4);
```
In line 50, `totalDeviation` is computed as `(numError + numUncertainty)` without `Math.abs(numError)`.
In line 186-189:
```javascript
186:           {error} (Error) + {uncertainty} (Incertidumbre) = <span className="font-bold">{totalDeviation} {unit}</span> de Desviación Acumulada.
187:           <br />
188:           Criterio con Banda de Guarda: <span className="font-bold">{totalDeviation} {unit} {isAprobado ? '≤' : '>'} {tolerance} {unit}</span>
```
Contrastingly, in lines 151–154 of the same file (table calibration points):
```javascript
151:                 const errVal = Math.abs(parseFloat(p.error) || 0);
152:                 const uncVal = parseFloat(p.incertidumbre) || 0;
153:                 const tolVal = numTol || 0.001;
154:                 const isPointCompliant = (errVal + uncVal) <= tolVal;
```

#### B. `src/pages/dashboard/DashboardKPIs.jsx` (Lines 42–47, 174–180)
```javascript
42:           const err = parseFloat(latest.error) || 0;
43:           const unc = parseFloat(latest.incertidumbre) || 0;
44:           const tol = parseFloat(inst.tolerancia_proceso) || parseFloat(latest.process_tolerance) || 0;
45:           if (tol > 0 && (err + unc) > 0.8 * tol) {
46:             warningCount++;
47:           }
```
And:
```javascript
174:         const err = parseFloat(latest?.error) || 0;
175:         const unc = parseFloat(latest?.incertidumbre) || 0;
176:         const tol = parseFloat(inst.tolerancia_proceso) || parseFloat(latest?.process_tolerance) || 0;
177:         if (tol > 0 && (err + unc) > 0.8 * tol) {
178:           type = 'warning';
179:           desc = `Alerta de Deriva (${Math.round(((err + unc) / tol) * 100)}% del MPE)`;
180:         }
```
`err` is signed, not absolute value.

#### C. `src/utils/metrologyCore.js` (Lines 76–92)
```javascript
76: export const calculateMetrologicalCheck = ({ valorLeido, valorPatron, tolerancia }) => {
77:   const vPatron = Number(valorPatron) || 0;
78:   const tol = Number(tolerancia) > 0 ? Number(tolerancia) : 0.05;
79:   const vLeido = Number(valorLeido) || 0;
80:   const errorVal = Number((vLeido - vPatron).toFixed(4));
81:   const consumoPct = tol > 0 ? Math.min(999, Math.round((Math.abs(errorVal) / tol) * 100)) : 0;
82:   const declaracion = Math.abs(errorVal) <= tol ? 'Conforme' : 'No Conforme';
83: 
84:   return {
85:     vPatron,
86:     vLeido,
87:     errorVal,
88:     tol,
89:     consumoPct,
90:     declaracion
91:   };
92: };
```
1. `calculateMetrologicalCheck` does not accept `incertidumbre` ($U$).
2. Only Simple Acceptance ($|E| \le \text{EMP}$) is supported, missing Guard Band acceptance ($|E| + U \le \text{EMP}$) defined by ISO 10012 and JCGM 106:2012.
3. Hardcoded rounding to 4 decimals `toFixed(4)` truncates precision for high-resolution equipment (e.g. micrometers, analytical balances where tolerance is $\le 0.0001$).
4. Fallback `tol = Number(tolerancia) > 0 ? Number(tolerancia) : 0.05` silently replaces missing/invalid tolerance with `0.05` without indication.

#### D. `src/pages/dashboard/AsegMetrologico.jsx` (Lines 124–140)
```javascript
124:   const calculations = useMemo(() => {
125:     const vP = parseFloat(valorPatron);
126:     const vL = parseFloat(valorLeido);
127:     const tol = parseFloat(selectedInst?.tolerancia_proceso) || 0.05;
128:     const unidad = selectedInst?.unidad_medida || 'mm';
129: 
130:     if (isNaN(vP) || isNaN(vL)) {
131:       return { errorVal: null, consumoPct: 0, declaracion: 'Pendiente', tol, unidad };
132:     }
133: 
134:     const errorVal = Number((vL - vP).toFixed(4));
135:     const consumoPct = tol > 0 ? Math.min(999, Math.round((Math.abs(errorVal) / tol) * 100)) : 0;
136:     const declaracion = Math.abs(errorVal) <= tol ? 'Conforme' : 'No Conforme';
137: 
138:     return { errorVal, consumoPct, declaracion, tol, unidad };
139:   }, [valorPatron, valorLeido, selectedInst]);
```
`AsegMetrologico.jsx` duplicates the calculation logic instead of importing `calculateMetrologicalCheck` from `metrologyCore.js`.

#### E. 5-Year Routine Projections & Month-End Rollover
In `src/utils/metrologyCore.js` (lines 56–62):
```javascript
56:         // Safe Date increment: calculate next occurrence relative to original start date
57:         const nextTargetMonth = (month - 1) + ((i + 1) * freqMonths);
58:         const nextDate = new Date(year, nextTargetMonth, day);
59:         if (nextDate.getDate() !== day) {
60:           nextDate.setDate(0);
61:         }
62:         current.setTime(nextDate.getTime());
```
This was fixed in commit `ff20772` and advances cleanly year by year.
However, in `src/pages/dashboard/HojaDeVidaPrint.jsx` (lines 50–73):
```javascript
50: const getNextDate = (fechaInicial, frecuenciaMeses) => {
...
65:     d.setMonth(d.getMonth() + Number(frecuenciaMeses));
```
And `src/pages/dashboard/HojaDeVida.jsx` (lines 512, 516):
```javascript
512: const d = new Date(year, month + Number(inst.rutinas.calibracion_frecuencia), day);
```
Tested via Node CLI: `getNextDate('2026-01-31', 1)` outputs `'2026-03-03'` because JavaScript native `setMonth` on non-existent days (Feb 31) rolls over into March 3, jumping past February completely.

---

## 2. Logic Chain

1. **Premise 1 (ISO 10012 / JCGM 106:2012 / ISO 14253-1 Metrological Requirement)**:
   A measurement result consists of an estimated value (or error $E$) and an associated expanded uncertainty $U$ ($k=2$, ~95% confidence). Under a guarded acceptance rule, an instrument can only be declared **Conforme (Aprobado)** if the maximum absolute error plus its expanded uncertainty is within the Maximum Permissible Error (MPE / EMP):
   $$|E| + U \le \text{EMP}$$
   When $|E| \le \text{EMP}$ but $|E| + U > \text{EMP}$, the result lies in the **Zona de Duda (Indeterminación / Guard Band Warning)**.
   When $|E| > \text{EMP}$, the instrument is **No Conforme (Reprobado)**.

2. **Deduction from Observation A (`IAVerificationLab.jsx:50`)**:
   `totalDeviation = (numError + numUncertainty).toFixed(4)`
   Because `numError` retains its sign:
   If $E = -0.05\,\text{mm}$, $U = 0.02\,\text{mm}$, and $\text{EMP} = \pm 0.04\,\text{mm}$:
   - Current code: $totalDeviation = -0.05 + 0.02 = -0.03\,\text{mm}$.
   - UI display: `-0.03 mm ≤ 0.04 mm` (falsely approves the instrument).
   - Correct physics: $|E| + U = |-0.05| + 0.02 = 0.07\,\text{mm} > 0.04\,\text{mm}$ (Violates EMP; must be rejected or placed in doubt).
   - Therefore, omitting `Math.abs(numError)` in line 50 is a critical mathematical bug that produces false conformity approvals.

3. **Deduction from Observation B (`DashboardKPIs.jsx:45, 177`)**:
   In `(err + unc) > 0.8 * tol`:
   If $E = -0.04\,\text{mm}$, $U = 0.01\,\text{mm}$, $\text{tol} = 0.05\,\text{mm}$:
   - `err + unc` evaluates to $-0.03$, which is NOT $> 0.04$ ($0.8 \times 0.05$).
   - The system completely misses the drift alert.
   - Line 179 outputs: `Alerta de Deriva (-60% del MPE)`, a nonsensical negative percentage.
   - Therefore, `err` must be `Math.abs(err)`.

4. **Deduction from Observation C (`metrologyCore.js:76`)**:
   `calculateMetrologicalCheck` is the canonical pure metrology engine. If it does not accept `incertidumbre` ($U$), downstream consumers (such as `inventoryStore.js:recordPlantCheck` or future automated test runners) cannot perform ISO 10012 conformity evaluation with guard bands. Expanding the signature to accept optional `incertidumbre = 0` and returning both simple conformity and guarded decision will fulfill Requirement R2 while preserving 100% backwards compatibility for existing callers.

5. **Deduction from Observation D (`AsegMetrologico.jsx:124`)**:
   Maintaining inline calculations in React components violates Single Source of Truth (SSOT). When `metrologyCore.js` is updated, UI components with inline copies will diverge, leading to discrepancies between the live modal display and the recorded Firestore log.

6. **Deduction from Observation E (`HojaDeVidaPrint.jsx:65`)**:
   `d.setMonth(d.getMonth() + freq)` lacks month-end clamping (`setDate(0)`). When equipment is scheduled on the 31st of January, March, May, July, August, October, or December, adding 1, 2, or any odd number of months that lead into a 30-day or 28-day month produces date jumping. Exporting a shared `calculateNextRoutineDate` from `metrologyCore.js` resolves this uniformly.

---

## 3. Caveats

1. **Scope Boundary**: This was a read-only investigation. No production source files were directly modified in `src/`. All proposed changes are documented below with before/after snippets for the implementation phase.
2. **AI Provider Latency & Schema**: The Google Gemini 3.6 API in `geminiMetrologyService.js` already returns `error_maximo`, `incertidumbre`, `criterio_valor` (EMP), and `veredicto`. The prompt in `geminiMetrologyService.js` correctly specifies $|E| + U \le \text{EMP}$; the bug was exclusively in the client-side presentation rendering (`IAVerificationLab.jsx:50`).
3. **Database Migration Not Required**: Historical check logs stored in Firestore with fields `error`, `tolerancia`, and `consumo_mpe` remain valid and do not require backfilling, though any re-calculation will benefit from the enhanced formula.

---

## 4. Conclusion & Actionable Proposals

### 4.1 Summary of Defects Found

| ID | Location | Defect Description | Severity | Fix Complexity |
|---|---|---|---|---|
| **DEF-01** | `src/pages/dashboard/IAVerificationLab.jsx:50` | `totalDeviation = (numError + numUncertainty)` misses `Math.abs`, causing negative errors to cancel uncertainty and falsely pass. | **High (Metrological)** | 1 line |
| **DEF-02** | `src/pages/dashboard/IAVerificationLab.jsx:188` | Guard band criterion comparison string uses `isAprobado ? '≤' : '>'` rather than mathematical comparison `totalDeviation <= numTol`. | **Medium** | 1 line |
| **DEF-03** | `src/pages/dashboard/DashboardKPIs.jsx:45, 177, 179` | `(err + unc)` misses `Math.abs(err)`, suppressing drift warnings for negative errors and printing negative % MPE. | **High** | 4 lines |
| **DEF-04** | `src/utils/metrologyCore.js:76–92` | `calculateMetrologicalCheck` does not accept `incertidumbre` ($U$), evaluate $|E| + U \le \text{EMP}$, or support high-precision ($\ge 6$ decimal) standards. | **High (ISO 10012)** | Core update |
| **DEF-05** | `src/pages/dashboard/AsegMetrologico.jsx:124–140` | Inline formula duplication instead of importing `calculateMetrologicalCheck`. | **Medium (Architecture)** | Import & use |
| **DEF-06** | `src/pages/dashboard/HojaDeVidaPrint.jsx:50–73` & `HojaDeVida.jsx:505–518` | Month-end rollover on 31st dates skips February due to un-clamped `setMonth`. | **Medium** | Shared helper |
| **DEF-07** | `test/metrology.test.js` | Test suite missing test coverage for $|E| + U \le \text{EMP}$, negative error cancellation, high precision, and date edge cases. | **Medium (QA)** | 8 new tests |

---

### 4.2 Proposed Code Modifications (Before $\to$ After)

#### Proposed Fix 1: `src/pages/dashboard/IAVerificationLab.jsx`
**Target**: `src/pages/dashboard/IAVerificationLab.jsx`, Lines 47–51 and 188.

```diff
<<<< BEFORE
  const numError = parseFloat(error) || 0;
  const numUncertainty = parseFloat(uncertainty) || 0;
  const numTol = parseFloat(tolerance) || 0;
  const totalDeviation = (numError + numUncertainty).toFixed(4);
==== AFTER
  const numError = parseFloat(error) || 0;
  const numUncertainty = parseFloat(uncertainty) || 0;
  const numTol = parseFloat(tolerance) || 0;
  const totalDeviation = (Math.abs(numError) + numUncertainty).toFixed(4);
>>>>
```

And in line 188:
```diff
<<<< BEFORE
  Criterio con Banda de Guarda: <span className="font-bold">{totalDeviation} {unit} {isAprobado ? '≤' : '>'} {tolerance} {unit}</span>
==== AFTER
  Criterio con Banda de Guarda: <span className="font-bold">{totalDeviation} {unit} {Number(totalDeviation) <= numTol ? '≤' : '>'} {tolerance} {unit}</span>
>>>>
```

---

#### Proposed Fix 2: `src/pages/dashboard/DashboardKPIs.jsx`
**Target**: `src/pages/dashboard/DashboardKPIs.jsx`, Lines 42–47 and 174–180.

```diff
<<<< BEFORE
          const err = parseFloat(latest.error) || 0;
          const unc = parseFloat(latest.incertidumbre) || 0;
          const tol = parseFloat(inst.tolerancia_proceso) || parseFloat(latest.process_tolerance) || 0;
          if (tol > 0 && (err + unc) > 0.8 * tol) {
            warningCount++;
          }
==== AFTER
          const err = parseFloat(latest.error) || 0;
          const unc = parseFloat(latest.incertidumbre) || 0;
          const tol = parseFloat(inst.tolerancia_proceso) || parseFloat(latest.process_tolerance) || 0;
          const totalDev = Math.abs(err) + unc;
          if (tol > 0 && totalDev > 0.8 * tol) {
            warningCount++;
          }
>>>>
```

And in lines 174–180:
```diff
<<<< BEFORE
        const err = parseFloat(latest?.error) || 0;
        const unc = parseFloat(latest?.incertidumbre) || 0;
        const tol = parseFloat(inst.tolerancia_proceso) || parseFloat(latest?.process_tolerance) || 0;
        if (tol > 0 && (err + unc) > 0.8 * tol) {
          type = 'warning';
          desc = `Alerta de Deriva (${Math.round(((err + unc) / tol) * 100)}% del MPE)`;
        }
==== AFTER
        const err = parseFloat(latest?.error) || 0;
        const unc = parseFloat(latest?.incertidumbre) || 0;
        const tol = parseFloat(inst.tolerancia_proceso) || parseFloat(latest?.process_tolerance) || 0;
        const totalDev = Math.abs(err) + unc;
        if (tol > 0 && totalDev > 0.8 * tol) {
          type = 'warning';
          desc = `Alerta de Deriva (${Math.round((totalDev / tol) * 100)}% del MPE)`;
        }
>>>>
```

---

#### Proposed Fix 3: `src/utils/metrologyCore.js`
**Target**: `src/utils/metrologyCore.js`  
Add support for:
1. `calculateNextRoutineDate(startDateStr, freqMonths)` (Safe date increment reusable across components).
2. Enhanced `calculateMetrologicalCheck` supporting optional `incertidumbre` ($U$), guard band decision rules, 6-decimal precision, and dual consumption percentages.

```javascript
/**
 * Cálculo seguro de la siguiente fecha de rutina con protección contra rollover de fin de mes.
 */
export const calculateNextRoutineDate = (startDateStr, freqMonths = 12) => {
  if (!startDateStr) return null;
  const parts = String(startDateStr).split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [year, month, day] = parts;
  const freq = Number(freqMonths) || 12;
  const nextTargetMonth = (month - 1) + freq;
  const nextDate = new Date(year, nextTargetMonth, day);
  if (nextDate.getDate() !== day) {
    nextDate.setDate(0); // Clamp al último día válido del mes
  }
  const y = nextDate.getFullYear();
  const m = String(nextDate.getMonth() + 1).padStart(2, '0');
  const d = String(nextDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Cálculo del error sistemático, incertidumbre combinada y conformidad metrológica (ISO 10012 / JCGM 106)
 * Error = V_leido - V_patron
 * Desviación Total = |Error| + U
 * % Consumo de Tolerancia (Simple) = (|Error| / EMP) * 100
 * % Consumo de Tolerancia (Guard Band) = ((|Error| + U) / EMP) * 100
 *
 * Reglas de Decisión:
 * - Sin Incertidumbre (U = 0):
 *     |Error| <= EMP -> Conforme
 *     |Error| > EMP  -> No Conforme
 * - Con Incertidumbre (U > 0, Banda de Guarda):
 *     |Error| + U <= EMP -> Conforme (Aprobado en zona de seguridad)
 *     |Error| <= EMP && |Error| + U > EMP -> Zona de Duda (Indeterminación)
 *     |Error| > EMP -> No Conforme (Reprobado)
 */
export const calculateMetrologicalCheck = ({
  valorLeido,
  valorPatron,
  tolerancia,
  incertidumbre = 0,
  reglaDecision = 'guard_band'
}) => {
  const vPatron = Number(valorPatron) || 0;
  const tol = Number(tolerancia) > 0 ? Number(tolerancia) : 0.05;
  const vLeido = Number(valorLeido) || 0;
  const u = Number(incertidumbre) >= 0 ? Number(incertidumbre) : 0;

  // Precisión a 6 decimales para instrumentos de alta resolución (0.1 µm / 10 µg)
  const rawDiff = vLeido - vPatron;
  const errorVal = Number(rawDiff.toFixed(6));
  const absError = Math.abs(errorVal);
  const totalDev = Number((absError + u).toFixed(6));

  const consumoPct = tol > 0 ? Math.min(999, Math.round((absError / tol) * 100)) : 0;
  const consumoTotalPct = tol > 0 ? Math.min(999, Math.round((totalDev / tol) * 100)) : 0;

  let declaracion = 'Conforme';
  if (u > 0) {
    if (absError > tol) {
      declaracion = 'No Conforme';
    } else if (totalDev > tol) {
      declaracion = reglaDecision === 'guard_band' ? 'Zona de Duda' : 'Conforme';
    } else {
      declaracion = 'Conforme';
    }
  } else {
    declaracion = absError <= tol ? 'Conforme' : 'No Conforme';
  }

  return {
    vPatron,
    vLeido,
    errorVal,
    incertidumbre: u,
    totalDev,
    tol,
    consumoPct,
    consumoTotalPct,
    declaracion,
    isCompliant: declaracion === 'Conforme',
    isGuardBandWarning: declaracion === 'Zona de Duda'
  };
};
```

---

#### Proposed Fix 4: `src/pages/dashboard/AsegMetrologico.jsx`
**Target**: `src/pages/dashboard/AsegMetrologico.jsx`, Lines 31 and 124–140.

Import `calculateMetrologicalCheck` at top:
```javascript
import { calculateMetrologicalCheck } from '../../utils/metrologyCore';
```
And replace the duplicated `useMemo` in lines 124–140 with:
```javascript
  const calculations = useMemo(() => {
    const vP = parseFloat(valorPatron);
    const vL = parseFloat(valorLeido);
    const tol = parseFloat(selectedInst?.tolerancia_proceso) || 0.05;
    const unidad = selectedInst?.unidad_medida || 'mm';

    if (isNaN(vP) || isNaN(vL)) {
      return { errorVal: null, consumoPct: 0, declaracion: 'Pendiente', tol, unidad };
    }

    const res = calculateMetrologicalCheck({
      valorLeido: vL,
      valorPatron: vP,
      tolerancia: tol
    });

    return {
      errorVal: res.errorVal,
      consumoPct: res.consumoPct,
      declaracion: res.declaracion,
      tol: res.tol,
      unidad
    };
  }, [valorPatron, valorLeido, selectedInst]);
```

---

#### Proposed Fix 5: `src/pages/dashboard/HojaDeVidaPrint.jsx`
**Target**: `src/pages/dashboard/HojaDeVidaPrint.jsx`, Lines 50–73.
Import and delegate `getNextDate` to `calculateNextRoutineDate` from `metrologyCore.js`.

---

#### Proposed Fix 6: Enhanced Test Suite (`test/metrology.test.js`)
Add test cases for:
1. `Caso 5: Evaluación con Incertidumbre (|E| + U <= EMP) es Conforme`
2. `Caso 6: Incertidumbre empuja a Zona de Duda (|E| <= EMP pero |E| + U > EMP)`
3. `Caso 7: Error negativo con incertidumbre (|E| + U > EMP)`
4. `Caso 8: Instrumento de alta resolución (5 decimales)`
5. `Caso 9: Avance seguro de fecha desde 31 de enero no salta febrero`

---

## 5. Verification Method

### 5.1 Commands to Execute
Run the automated test runner and Vite build:
```powershell
npm.cmd test
npm.cmd run build
```

### 5.2 Specific Verification Checks
1. **Zero Test Regressions**: All 4 original ISO 10012 tests and 3 routine projection tests in `test/metrology.test.js` continue to pass with 0 failures.
2. **New Formula Tests Pass**:
   - `calculateMetrologicalCheck({ valorLeido: 10.02, valorPatron: 10.00, tolerancia: 0.05, incertidumbre: 0.02 })` $\implies$ `declaracion === 'Conforme'`, `totalDev === 0.04`.
   - `calculateMetrologicalCheck({ valorLeido: 9.96, valorPatron: 10.00, tolerancia: 0.05, incertidumbre: 0.015 })` $\implies$ `declaracion === 'Zona de Duda'`, `totalDev === 0.055`.
3. **Date Rollover Verified**:
   - `calculateNextRoutineDate('2026-01-31', 1)` $\implies$ `'2026-02-28'` (NOT `'2026-03-03'`).
   - `calculateNextRoutineDate('2024-01-31', 1)` $\implies$ `'2024-02-29'` (Leap year leap day).
4. **Clean Production Build**:
   `npm.cmd run build` exits with code 0 and bundles all modules cleanly.

### 5.3 Invalidation Conditions
- If any test in `test/metrology.test.js` fails.
- If `totalDeviation` in `IAVerificationLab.jsx` displays a negative number when error is negative.
- If Vite build outputs compilation errors or broken imports.
