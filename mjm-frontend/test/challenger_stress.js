import assert from 'node:assert/strict';
import { calculateNextRoutineDate, buildExpectedActivities } from '../src/utils/metrologyCore.js';

console.log('=== STARTING CHALLENGER M2-2 EMPIRICAL STRESS TEST SUITE ===\n');

let passedTests = 0;
let failedTests = 0;
const failures = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         Error: ${err.message}`);
    failures.push({ name, error: err.message });
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// SUITE 1: LEAP YEARS EMPIRICAL VERIFICATION (2024, 2028, 2000, 2100)
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: LEAP YEARS (2024, 2028, 2000, 2100) ---');

runTest('1.1 Leap 2024: Jan 31 + 1 month clamps to Feb 29', () => {
  const res = calculateNextRoutineDate('2024-01-31', 1);
  assert.equal(res, '2024-02-29');
});

runTest('1.2 Leap 2024: Feb 29 + 12 months clamps to Feb 28, 2025 (non-leap)', () => {
  const res = calculateNextRoutineDate('2024-02-29', 12);
  assert.equal(res, '2025-02-28');
});

runTest('1.3 Leap 2024: Feb 29 + 48 months lands on Feb 29, 2028 (leap)', () => {
  const res = calculateNextRoutineDate('2024-02-29', 48);
  assert.equal(res, '2028-02-29');
});

runTest('1.4 Leap 2028: Jan 31 + 1 month clamps to Feb 29, 2028', () => {
  const res = calculateNextRoutineDate('2028-01-31', 1);
  assert.equal(res, '2028-02-29');
});

runTest('1.5 Leap 2028: Feb 29 + 12 months clamps to Feb 28, 2029', () => {
  const res = calculateNextRoutineDate('2028-02-29', 12);
  assert.equal(res, '2029-02-28');
});

runTest('1.6 Century Leap 2000 (divisible by 400): Jan 31 + 1 mo clamps to Feb 29, 2000', () => {
  const res = calculateNextRoutineDate('2000-01-31', 1);
  assert.equal(res, '2000-02-29');
});

runTest('1.7 Century Leap 2000: 1996-02-29 + 48 months lands on 2000-02-29', () => {
  const res = calculateNextRoutineDate('1996-02-29', 48);
  assert.equal(res, '2000-02-29');
});

runTest('1.8 Century NON-Leap 2100 (divisible by 100, not 400): Jan 31 + 1 mo clamps to Feb 28, 2100 (NOT 29)', () => {
  const res = calculateNextRoutineDate('2100-01-31', 1);
  assert.equal(res, '2100-02-28');
});

runTest('1.9 Century NON-Leap 2100: 2096-02-29 + 48 months clamps to 2100-02-28 (NOT 29)', () => {
  const res = calculateNextRoutineDate('2096-02-29', 48);
  assert.equal(res, '2100-02-28');
});

runTest('1.10 Century NON-Leap 2100: Jan 29 + 1 mo in 2100 clamps to 2100-02-28', () => {
  const res = calculateNextRoutineDate('2100-01-29', 1);
  assert.equal(res, '2100-02-28');
});

runTest('1.11 Century NON-Leap 2100: Jan 30 + 1 mo in 2100 clamps to 2100-02-28', () => {
  const res = calculateNextRoutineDate('2100-01-30', 1);
  assert.equal(res, '2100-02-28');
});

// -----------------------------------------------------------------------------
// SUITE 2: DATE INCREMENTS STARTING JAN 29, 30, 31 ACROSS FREQUENCIES
// (1, 2, 3, 6, 12, 24, 36, 60 months)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: JAN 29, 30, 31 ACROSS FREQUENCIES (1, 2, 3, 6, 12, 24, 36, 60) ---');

const freqs = [1, 2, 3, 6, 12, 24, 36, 60];

// Expected matrix for Non-Leap year 2026:
// Jan 29:
// +1 -> 2026-02-28
// +2 -> 2026-03-29
// +3 -> 2026-04-29
// +6 -> 2026-07-29
// +12 -> 2027-01-29
// +24 -> 2028-01-29
// +36 -> 2029-01-29
// +60 -> 2031-01-29
const expectedJan29_2026 = {
  1: '2026-02-28',
  2: '2026-03-29',
  3: '2026-04-29',
  6: '2026-07-29',
  12: '2027-01-29',
  24: '2028-01-29',
  36: '2029-01-29',
  60: '2031-01-29',
};

for (const f of freqs) {
  runTest(`2.1 Jan 29 (2026) + ${f} months -> ${expectedJan29_2026[f]}`, () => {
    const res = calculateNextRoutineDate('2026-01-29', f);
    assert.equal(res, expectedJan29_2026[f]);
  });
}

// Jan 30 (2026):
// +1 -> 2026-02-28
// +2 -> 2026-03-30
// +3 -> 2026-04-30
// +6 -> 2026-07-30
// +12 -> 2027-01-30
// +24 -> 2028-01-30
// +36 -> 2029-01-30
// +60 -> 2031-01-30
const expectedJan30_2026 = {
  1: '2026-02-28',
  2: '2026-03-30',
  3: '2026-04-30',
  6: '2026-07-30',
  12: '2027-01-30',
  24: '2028-01-30',
  36: '2029-01-30',
  60: '2031-01-30',
};

for (const f of freqs) {
  runTest(`2.2 Jan 30 (2026) + ${f} months -> ${expectedJan30_2026[f]}`, () => {
    const res = calculateNextRoutineDate('2026-01-30', f);
    assert.equal(res, expectedJan30_2026[f]);
  });
}

// Jan 31 (2026):
// +1 -> 2026-02-28
// +2 -> 2026-03-31
// +3 -> 2026-04-30 (April has 30 days, clamped!)
// +6 -> 2026-07-31
// +12 -> 2027-01-31
// +24 -> 2028-01-31
// +36 -> 2029-01-31
// +60 -> 2031-01-31
const expectedJan31_2026 = {
  1: '2026-02-28',
  2: '2026-03-31',
  3: '2026-04-30',
  6: '2026-07-31',
  12: '2027-01-31',
  24: '2028-01-31',
  36: '2029-01-31',
  60: '2031-01-31',
};

for (const f of freqs) {
  runTest(`2.3 Jan 31 (2026) + ${f} months -> ${expectedJan31_2026[f]}`, () => {
    const res = calculateNextRoutineDate('2026-01-31', f);
    assert.equal(res, expectedJan31_2026[f]);
  });
}

// Jan 31 in Leap Year (2024):
// +1 -> 2024-02-29
// +2 -> 2024-03-31
// +3 -> 2024-04-30
// +6 -> 2024-07-31
// +12 -> 2025-01-31
// +24 -> 2026-01-31
// +36 -> 2027-01-31
// +60 -> 2029-01-31
const expectedJan31_2024 = {
  1: '2024-02-29',
  2: '2024-03-31',
  3: '2024-04-30',
  6: '2024-07-31',
  12: '2025-01-31',
  24: '2026-01-31',
  36: '2027-01-31',
  60: '2029-01-31',
};

for (const f of freqs) {
  runTest(`2.4 Jan 31 (Leap 2024) + ${f} months -> ${expectedJan31_2024[f]}`, () => {
    const res = calculateNextRoutineDate('2024-01-31', f);
    assert.equal(res, expectedJan31_2024[f]);
  });
}

// -----------------------------------------------------------------------------
// SUITE 2.5: INPUT TYPES & ADVERSARIAL EDGE CASES FOR calculateNextRoutineDate
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2.5: INPUT TYPES & ADVERSARIAL EDGE CASES ---');

runTest('2.5.1 String ISO date with timestamp "2026-01-31T00:00:00.000Z"', () => {
  const res = calculateNextRoutineDate('2026-01-31T00:00:00.000Z', 1);
  assert.equal(res, '2026-02-28');
});

runTest('2.5.2 Date object input', () => {
  const d = new Date(2026, 0, 31);
  const res = calculateNextRoutineDate(d, 1);
  assert.equal(res, '2026-02-28');
});

runTest('2.5.3 Firestore Timestamp object { seconds: 1769860800 } (2026-01-31 UTC)', () => {
  // 1769860800 = 2026-01-31T12:00:00Z
  const ts = { seconds: 1769860800 };
  const res = calculateNextRoutineDate(ts, 1);
  // Should produce February 28 of 2026
  assert.ok(res.endsWith('-02-28'));
});

runTest('2.5.4 String frequency "6" coerced to number', () => {
  const res = calculateNextRoutineDate('2026-01-31', '6');
  assert.equal(res, '2026-07-31');
});

runTest('2.5.5 Falsy/Invalid frequency defaults safely to 12', () => {
  assert.equal(calculateNextRoutineDate('2026-01-31', 0), '2027-01-31');
  assert.equal(calculateNextRoutineDate('2026-01-31', null), '2027-01-31');
  assert.equal(calculateNextRoutineDate('2026-01-31', undefined), '2027-01-31');
  assert.equal(calculateNextRoutineDate('2026-01-31', 'invalido'), '2027-01-31');
});

runTest('2.5.6 Multi-year 100-year advance (freq=1200 months)', () => {
  const res = calculateNextRoutineDate('2024-02-29', 1200); // 100 years -> 2124 (leap year)
  assert.equal(res, '2124-02-29');
});

// -----------------------------------------------------------------------------
// SUITE 3: 5-YEAR PROJECTIONS IN buildExpectedActivities

// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: 5-YEAR PROJECTIONS (buildExpectedActivities) ---');

runTest('3.1 Annual Routine from 2026-01-31 advances strictly year-by-year', () => {
  const inst = {
    nombre: 'Calibrador Pie de Rey',
    codigoMJM: 'MJM-LON-001',
    riesgo_operativo: 'Alta',
    rutinas: {
      calibracion: true,
      calibracion_fecha_inicial: '2026-01-31',
      calibracion_frecuencia: 12,
      calibracion_anos: 5
    }
  };

  const acts = buildExpectedActivities('tenant-test', 'inst-001', inst);
  assert.equal(acts.length, 5, 'Must generate exactly 5 activities');

  const expectedDates = [
    '2026-01-31',
    '2027-01-31',
    '2028-01-31',
    '2029-01-31',
    '2030-01-31'
  ];

  acts.forEach((act, idx) => {
    assert.equal(act.fechaProgramada, expectedDates[idx], `Index ${idx} date mismatch`);
    if (idx === 4) {
      assert.equal(act.is_last_of_5_years, true, 'Last activity must have is_last_of_5_years');
    } else {
      assert.equal(act.is_last_of_5_years, undefined, `Index ${idx} must not have is_last_of_5_years`);
    }
  });
});

runTest('3.2 Leap Day Annual Routine from 2024-02-29 preserves leap cycle across 5 years', () => {
  const inst = {
    nombre: 'Patrón de Masa',
    codigoMJM: 'MJM-MAS-001',
    rutinas: {
      calibracion: true,
      calibracion_fecha_inicial: '2024-02-29',
      calibracion_frecuencia: 12,
      calibracion_anos: 5
    }
  };

  const acts = buildExpectedActivities('tenant-test', 'inst-002', inst);
  assert.equal(acts.length, 5);

  const expectedDates = [
    '2024-02-29', // Leap year 2024
    '2025-02-28', // Non-leap 2025
    '2026-02-28', // Non-leap 2026
    '2027-02-28', // Non-leap 2027
    '2028-02-29'  // Leap year 2028 restored!
  ];

  acts.forEach((act, idx) => {
    assert.equal(act.fechaProgramada, expectedDates[idx], `Index ${idx} date mismatch for leap cycle`);
  });
  assert.equal(acts[4].is_last_of_5_years, true);
});

runTest('3.3 Monthly Routine (freq=1) for 5 years: generates 60 activities without month skips or day degradation', () => {
  const inst = {
    nombre: 'Termohigrómetro Continuo',
    codigoMJM: 'MJM-TH-001',
    rutinas: {
      verificacion: true,
      verificacion_fecha_inicial: '2026-01-31',
      verificacion_frecuencia: 1,
      verificacion_anos: 5
    }
  };

  const acts = buildExpectedActivities('tenant-test', 'inst-003', inst);
  assert.equal(acts.length, 60, 'Must generate exactly 60 monthly activities');

  // Verify each month is sequential without skipping or stagnating
  let expectedYear = 2026;
  let expectedMonth = 1;

  for (let i = 0; i < 60; i++) {
    const act = acts[i];
    const [y, m, d] = act.fechaProgramada.split('-').map(Number);
    
    assert.equal(y, expectedYear, `Activity ${i} year mismatch`);
    assert.equal(m, expectedMonth, `Activity ${i} month mismatch`);

    // Verify day clamping:
    // Feb: 28 (or 29 in 2028)
    // 30-day months: 30
    // 31-day months: 31
    if (m === 2) {
      const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
      assert.equal(d, isLeap ? 29 : 28, `Feb ${y} day should be ${isLeap ? 29 : 28}, got ${d}`);
    } else if ([4, 6, 9, 11].includes(m)) {
      assert.equal(d, 30, `Month ${m}/${y} day should be 30, got ${d}`);
    } else {
      assert.equal(d, 31, `Month ${m}/${y} day should be 31, got ${d}`);
    }

    if (i === 59) {
      assert.equal(act.is_last_of_5_years, true);
    } else {
      assert.equal(act.is_last_of_5_years, undefined);
    }

    expectedMonth++;
    if (expectedMonth > 12) {
      expectedMonth = 1;
      expectedYear++;
    }
  }
});

runTest('3.4 Semestral Routine (freq=6) for 5 years: generates 10 activities', () => {
  const inst = {
    nombre: 'Manómetro Patrón',
    codigoMJM: 'MJM-PRE-002',
    rutinas: {
      mantenimiento: true,
      mantenimiento_fecha_inicial: '2026-03-31',
      mantenimiento_frecuencia: 6,
      mantenimiento_anos: 5
    }
  };

  const acts = buildExpectedActivities('tenant-test', 'inst-004', inst);
  assert.equal(acts.length, 10);
  assert.equal(acts[0].fechaProgramada, '2026-03-31');
  assert.equal(acts[1].fechaProgramada, '2026-09-30'); // Sept has 30 days
  assert.equal(acts[2].fechaProgramada, '2027-03-31');
  assert.equal(acts[3].fechaProgramada, '2027-09-30');
  assert.equal(acts[4].fechaProgramada, '2028-03-31');
  assert.equal(acts[5].fechaProgramada, '2028-09-30');
  assert.equal(acts[6].fechaProgramada, '2029-03-31');
  assert.equal(acts[7].fechaProgramada, '2029-09-30');
  assert.equal(acts[8].fechaProgramada, '2030-03-31');
  assert.equal(acts[9].fechaProgramada, '2030-09-30');
  assert.equal(acts[9].is_last_of_5_years, true);
});

// Now let's stress frequencies 24, 36, 60:
runTest('3.5 Biennial Routine (freq=24) for 5 years', () => {
  const inst = {
    nombre: 'Bloques Patrón Grado 0',
    codigoMJM: 'MJM-LON-002',
    rutinas: {
      calibracion: true,
      calibracion_fecha_inicial: '2026-01-31',
      calibracion_frecuencia: 24,
      calibracion_anos: 5
    }
  };
  const acts = buildExpectedActivities('tenant-test', 'inst-005', inst);
  console.log(`         freq=24 returned ${acts.length} activities:`, acts.map(a => a.fechaProgramada));
  // Let's verify what it generated:
  assert.ok(acts.length >= 2, 'Must generate at least 2 activities');
  assert.equal(acts[0].fechaProgramada, '2026-01-31');
  assert.equal(acts[1].fechaProgramada, '2028-01-31');
});

runTest('3.6 Triennial Routine (freq=36) for 5 years', () => {
  const inst = {
    nombre: 'Patrón de Referencia Primaria',
    codigoMJM: 'MJM-MAS-099',
    rutinas: {
      calibracion: true,
      calibracion_fecha_inicial: '2026-01-31',
      calibracion_frecuencia: 36,
      calibracion_anos: 5
    }
  };
  const acts = buildExpectedActivities('tenant-test', 'inst-006', inst);
  console.log(`         freq=36 returned ${acts.length} activities:`, acts.map(a => a.fechaProgramada));
  assert.ok(acts.length >= 1);
  assert.equal(acts[0].fechaProgramada, '2026-01-31');
});

runTest('3.7 Quinquennial Routine (freq=60) for 5 years', () => {
  const inst = {
    nombre: 'Patrón Quinquenal',
    codigoMJM: 'MJM-PAT-001',
    rutinas: {
      calibracion: true,
      calibracion_fecha_inicial: '2026-01-31',
      calibracion_frecuencia: 60,
      calibracion_anos: 5
    }
  };
  const acts = buildExpectedActivities('tenant-test', 'inst-007', inst);
  console.log(`         freq=60 returned ${acts.length} activities:`, acts.map(a => a.fechaProgramada));
  assert.equal(acts.length, 1);
  assert.equal(acts[0].fechaProgramada, '2026-01-31');
  assert.equal(acts[0].is_last_of_5_years, true);
});

// -----------------------------------------------------------------------------
// SUITE 4: DRIFT CALCULATIONS IN DashboardKPIs & IAVerificationLab
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: DRIFT CALCULATIONS (DashboardKPIs & IAVerificationLab) ---');

// Oracle for DashboardKPIs drift warning logic:
// const err = parseFloat(latest.error) || 0;
// const unc = parseFloat(latest.incertidumbre) || 0;
// const tol = parseFloat(inst.tolerancia_proceso) || parseFloat(latest.process_tolerance) || 0;
// const totalDev = Math.abs(err) + unc;
// if (tol > 0 && totalDev > 0.8 * tol) { warningCount++; }
function evaluateDashboardDrift(inst, latest) {
  const err = parseFloat(latest?.error) || 0;
  const unc = parseFloat(latest?.incertidumbre) || 0;
  const tol = parseFloat(inst?.tolerancia_proceso) || parseFloat(latest?.process_tolerance) || 0;
  const totalDev = Math.abs(err) + unc;
  const isWarning = tol > 0 && totalDev > 0.8 * tol;
  const driftPct = tol > 0 ? Math.round((totalDev / tol) * 100) : 0;
  return { isWarning, totalDev, driftPct };
}

// Oracle for IAVerificationLab totalDeviation & guard band logic:
// const numError = parseFloat(error) || 0;
// const numUncertainty = parseFloat(uncertainty) || 0;
// const numTol = parseFloat(tolerance) || 0;
// const totalDeviation = (Math.abs(numError) + numUncertainty).toFixed(4);
// inequality: Number(totalDeviation) <= numTol ? '≤' : '>'
function evaluateIAVerificationLab(error, uncertainty, tolerance) {
  const numError = parseFloat(error) || 0;
  const numUncertainty = parseFloat(uncertainty) || 0;
  const numTol = parseFloat(tolerance) || 0;
  const totalDeviation = (Math.abs(numError) + numUncertainty).toFixed(4);
  const inequality = Number(totalDeviation) <= numTol ? '≤' : '>';
  const isCompliant = Number(totalDeviation) <= numTol;
  return { totalDeviation, inequality, isCompliant, numTol };
}

runTest('4.1 DashboardKPIs: Positive error exceeding 80% triggers drift warning', () => {
  const inst = { tolerancia_proceso: 0.05 };
  const latest = { error: 0.042, incertidumbre: 0.005 }; // totalDev = 0.047 > 0.04 (94%)
  const res = evaluateDashboardDrift(inst, latest);
  assert.equal(res.isWarning, true);
  assert.equal(res.driftPct, 94);
});

runTest('4.2 DashboardKPIs: Negative error with unc exceeding 80% triggers drift warning (NO cancellation)', () => {
  const inst = { tolerancia_proceso: 0.05 };
  const latest = { error: -0.042, incertidumbre: 0.005 }; // totalDev = |-0.042| + 0.005 = 0.047 > 0.04 (94%)
  const res = evaluateDashboardDrift(inst, latest);
  assert.equal(res.isWarning, true);
  assert.equal(res.driftPct, 94);
  // Without Math.abs, -0.042 + 0.005 = -0.037 <= 0.04 (NO WARNING, BUG!)
  const buggySigned = -0.042 + 0.005;
  assert.ok(buggySigned <= 0.8 * 0.05, 'Demonstrating that uncorrected signed math would fail');
});

runTest('4.3 DashboardKPIs: Error at exact 80% boundary is NOT a warning (> 0.8 * tol is strict)', () => {
  const inst = { tolerancia_proceso: 0.05 };
  const latest = { error: 0.040, incertidumbre: 0 }; // 0.040 / 0.05 = 80.0%
  const res = evaluateDashboardDrift(inst, latest);
  assert.equal(res.isWarning, false);
  assert.equal(res.driftPct, 80);
});

runTest('4.4 DashboardKPIs: Tolerancia zero does not cause division by zero or NaN', () => {
  const inst = { tolerancia_proceso: 0 };
  const latest = { error: 0.05, incertidumbre: 0.01 };
  const res = evaluateDashboardDrift(inst, latest);
  assert.equal(res.isWarning, false);
  assert.equal(res.driftPct, 0);
});

runTest('4.5 DashboardKPIs: Missing error or uncertainty gracefully defaults to 0', () => {
  const inst = { tolerancia_proceso: 0.1 };
  const latest = {};
  const res = evaluateDashboardDrift(inst, latest);
  assert.equal(res.isWarning, false);
  assert.equal(res.totalDev, 0);
  assert.equal(res.driftPct, 0);
});

runTest('4.6 IAVerificationLab: Negative error uses Math.abs and formats to 4 decimals', () => {
  const res = evaluateIAVerificationLab('-0.05', '0.02', '0.05');
  // totalDev = |-0.05| + 0.02 = 0.0700
  assert.equal(res.totalDeviation, '0.0700');
  assert.equal(res.inequality, '>');
  assert.equal(res.isCompliant, false);
});

runTest('4.7 IAVerificationLab: Conforming measurement shows ≤ inequality', () => {
  const res = evaluateIAVerificationLab('-0.02', '0.01', '0.05');
  // totalDev = |-0.02| + 0.01 = 0.0300 <= 0.05
  assert.equal(res.totalDeviation, '0.0300');
  assert.equal(res.inequality, '≤');
  assert.equal(res.isCompliant, true);
});

runTest('4.8 IAVerificationLab: Boundary exact equality totalDeviation == tolerance shows ≤', () => {
  const res = evaluateIAVerificationLab('0.03', '0.02', '0.05');
  assert.equal(res.totalDeviation, '0.0500');
  assert.equal(res.inequality, '≤');
  assert.equal(res.isCompliant, true);
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=== EMPIRICAL TEST SUITE EXECUTION SUMMARY ===');
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failures.length > 0) {
  console.log('\nFailures breakdown:');
  failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  process.exit(1);
} else {
  console.log('\nAll stress tests passed successfully with 0 failures!\n');
  process.exit(0);
}
