import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExpectedActivities, calculateMetrologicalCheck, calculateNextRoutineDate } from '../src/utils/metrologyCore.js';

test('Metrology Core: Conformidad Metrológica según ISO 10012', async (t) => {
  await t.test('Caso 1: Lectura dentro de tolerancia debe ser Conforme', () => {
    // V_patron = 10.00, V_leido = 10.03, Tol = 0.05
    const result = calculateMetrologicalCheck({
      valorLeido: 10.03,
      valorPatron: 10.00,
      tolerancia: 0.05
    });

    assert.equal(result.errorVal, 0.03);
    assert.equal(result.consumoPct, 60);
    assert.equal(result.declaracion, 'Conforme');
  });

  await t.test('Caso 2: Lectura fuera de tolerancia debe ser No Conforme', () => {
    // V_patron = 10.00, V_leido = 10.07, Tol = 0.05
    const result = calculateMetrologicalCheck({
      valorLeido: 10.07,
      valorPatron: 10.00,
      tolerancia: 0.05
    });

    assert.equal(result.errorVal, 0.07);
    assert.equal(result.consumoPct, 140);
    assert.equal(result.declaracion, 'No Conforme');
  });

  await t.test('Caso 3: Error negativo dentro de tolerancia', () => {
    // V_patron = 50.00, V_leido = 49.98, Tol = 0.05
    const result = calculateMetrologicalCheck({
      valorLeido: 49.98,
      valorPatron: 50.00,
      tolerancia: 0.05
    });

    assert.equal(result.errorVal, -0.02);
    assert.equal(result.consumoPct, 40);
    assert.equal(result.declaracion, 'Conforme');
  });

  await t.test('Caso 4: Límite exacto de tolerancia es Conforme (100%)', () => {
    const result = calculateMetrologicalCheck({
      valorLeido: 10.05,
      valorPatron: 10.00,
      tolerancia: 0.05
    });

    assert.equal(result.errorVal, 0.05);
    assert.equal(result.consumoPct, 100);
    assert.equal(result.declaracion, 'Conforme');
    assert.equal(result.isCompliant, true);
    assert.equal(result.isGuardBandWarning, false);
  });

  await t.test('Caso 5: Evaluación con Incertidumbre (|E| + U <= EMP) es Conforme', () => {
    // V_patron = 10.00, V_leido = 10.02, Tol = 0.05, U = 0.02 -> |0.02| + 0.02 = 0.04 <= 0.05
    const result = calculateMetrologicalCheck({
      valorLeido: 10.02,
      valorPatron: 10.00,
      tolerancia: 0.05,
      incertidumbre: 0.02
    });

    assert.equal(result.errorVal, 0.02);
    assert.equal(result.incertidumbre, 0.02);
    assert.equal(result.totalDev, 0.04);
    assert.equal(result.consumoPct, 40);
    assert.equal(result.consumoTotalPct, 80);
    assert.equal(result.declaracion, 'Conforme');
    assert.equal(result.isCompliant, true);
    assert.equal(result.isGuardBandWarning, false);
  });

  await t.test('Caso 6: Incertidumbre empuja a Zona de Duda (|E| <= EMP pero |E| + U > EMP)', () => {
    // V_patron = 10.00, V_leido = 10.04, Tol = 0.05, U = 0.02 -> |0.04| + 0.02 = 0.06 > 0.05
    const result = calculateMetrologicalCheck({
      valorLeido: 10.04,
      valorPatron: 10.00,
      tolerancia: 0.05,
      incertidumbre: 0.02
    });

    assert.equal(result.errorVal, 0.04);
    assert.equal(result.totalDev, 0.06);
    assert.equal(result.consumoPct, 80);
    assert.equal(result.consumoTotalPct, 120);
    assert.equal(result.declaracion, 'Zona de Duda');
    assert.equal(result.isCompliant, false);
    assert.equal(result.isGuardBandWarning, true);
  });

  await t.test('Caso 7: Regla Simple con Incertidumbre (|E| <= EMP pero |E| + U > EMP)', () => {
    const result = calculateMetrologicalCheck({
      valorLeido: 10.04,
      valorPatron: 10.00,
      tolerancia: 0.05,
      incertidumbre: 0.02,
      reglaDecision: 'simple'
    });

    assert.equal(result.declaracion, 'Conforme');
    assert.equal(result.isCompliant, true);
    assert.equal(result.isGuardBandWarning, false);
  });

  await t.test('Caso 8: Error negativo con incertidumbre (|E| + U > EMP) en Zona de Duda', () => {
    // V_patron = 10.00, V_leido = 9.96, Tol = 0.05, U = 0.015 -> |-0.04| + 0.015 = 0.055 > 0.05
    const result = calculateMetrologicalCheck({
      valorLeido: 9.96,
      valorPatron: 10.00,
      tolerancia: 0.05,
      incertidumbre: 0.015
    });

    assert.equal(result.errorVal, -0.04);
    assert.equal(result.totalDev, 0.055);
    assert.equal(result.consumoPct, 80);
    assert.equal(result.consumoTotalPct, 110);
    assert.equal(result.declaracion, 'Zona de Duda');
    assert.equal(result.isCompliant, false);
    assert.equal(result.isGuardBandWarning, true);
  });

  await t.test('Caso 9: Error fuera de tolerancia con incertidumbre es No Conforme', () => {
    const result = calculateMetrologicalCheck({
      valorLeido: 10.06,
      valorPatron: 10.00,
      tolerancia: 0.05,
      incertidumbre: 0.01
    });

    assert.equal(result.errorVal, 0.06);
    assert.equal(result.declaracion, 'No Conforme');
    assert.equal(result.isCompliant, false);
    assert.equal(result.isGuardBandWarning, false);
  });

  await t.test('Caso 10: Instrumento de alta resolución (6 decimales) y tope de consumo a 999', () => {
    const result = calculateMetrologicalCheck({
      valorLeido: 1.000045,
      valorPatron: 1.000010,
      tolerancia: 0.000100,
      incertidumbre: 0.000020
    });

    assert.equal(result.errorVal, 0.000035);
    assert.equal(result.totalDev, 0.000055);
    assert.equal(result.consumoPct, 35);
    assert.equal(result.consumoTotalPct, 55);
    assert.equal(result.declaracion, 'Conforme');

    // Capping at 999 test
    const capped = calculateMetrologicalCheck({
      valorLeido: 20.0,
      valorPatron: 0.0,
      tolerancia: 0.01
    });
    assert.equal(capped.consumoPct, 999);
    assert.equal(capped.consumoTotalPct, 999);
  });
});

test('Metrology Core: Proyección a 5 Años de Actividades Operativas', async (t) => {
  await t.test('Genera 5 actividades de Calibración anuales con flag en la última', () => {
    const instrument = {
      nombre: 'Micrómetro Exterior Digital',
      codigoMJM: 'MJM-DIM-010',
      riesgo_operativo: 'Alta',
      rutinas: {
        calibracion: true,
        calibracion_fecha_inicial: '2026-09-01',
        calibracion_frecuencia: 12,
        calibracion_anos: 5
      }
    };

    const activities = buildExpectedActivities('tenant-corp-1', 'inst-001', instrument);

    assert.equal(activities.length, 5);
    assert.equal(activities[0].fechaProgramada, '2026-09-01');
    assert.equal(activities[0].tipo, 'Calibración');
    assert.equal(activities[0].priority, 'high');
    assert.equal(activities[0].is_last_of_5_years, undefined);

    assert.equal(activities[1].fechaProgramada, '2027-09-01');
    assert.equal(activities[2].fechaProgramada, '2028-09-01');
    assert.equal(activities[3].fechaProgramada, '2029-09-01');

    assert.equal(activities[4].fechaProgramada, '2030-09-01');
    assert.equal(activities[4].is_last_of_5_years, true);
  });

  await t.test('Asigna prioridad media a instrumentos con riesgo bajo/medio', () => {
    const instrument = {
      nombre: 'Cinta Métrica',
      codigoMJM: 'MJM-DIM-099',
      riesgo_operativo: 'Baja',
      rutinas: {
        calibracion: true,
        calibracion_fecha_inicial: '2026-10-15',
        calibracion_frecuencia: 12,
        calibracion_anos: 5
      }
    };

    const activities = buildExpectedActivities('tenant-corp-1', 'inst-099', instrument);
    assert.equal(activities.length, 5);
    assert.equal(activities[0].priority, 'medium');
  });

  await t.test('Genera cascada semestral (10 actividades en 5 años)', () => {
    const instrument = {
      nombre: 'Balanza de Precisión',
      codigoMJM: 'MJM-MAS-005',
      riesgo_operativo: 'Crítica',
      rutinas: {
        verificacion: true,
        verificacion_fecha_inicial: '2026-01-10',
        verificacion_frecuencia: 6,
        verificacion_anos: 5
      }
    };

    const activities = buildExpectedActivities('tenant-corp-1', 'inst-005', instrument);
    assert.equal(activities.length, 10);
    assert.equal(activities[0].tipo, 'Verificación');
    assert.equal(activities[0].priority, 'high');
    assert.equal(activities[9].is_last_of_5_years, true);
  });
});

test('Metrology Core: Cálculo Seguro de Fecha de Rutina (calculateNextRoutineDate)', async (t) => {
  await t.test('Avance regular de 12 meses', () => {
    assert.equal(calculateNextRoutineDate('2026-06-15', 12), '2027-06-15');
  });

  await t.test('Ajuste fin de mes desde 31 de enero en año no bisiesto (2026-01-31 + 1 mo -> 2026-02-28)', () => {
    assert.equal(calculateNextRoutineDate('2026-01-31', 1), '2026-02-28');
  });

  await t.test('Ajuste fin de mes desde 31 de enero en año bisiesto (2024-01-31 + 1 mo -> 2024-02-29)', () => {
    assert.equal(calculateNextRoutineDate('2024-01-31', 1), '2024-02-29');
  });

  await t.test('Ajuste fin de mes a mes de 30 días (2026-03-31 + 1 mo -> 2026-04-30)', () => {
    assert.equal(calculateNextRoutineDate('2026-03-31', 1), '2026-04-30');
  });

  await t.test('Avance trimestral con cambio de año (2026-11-30 + 3 mo -> 2027-02-28)', () => {
    assert.equal(calculateNextRoutineDate('2026-11-30', 3), '2027-02-28');
  });

  await t.test('Manejo seguro de entradas vacías o inválidas', () => {
    assert.equal(calculateNextRoutineDate(null), null);
    assert.equal(calculateNextRoutineDate(''), null);
    assert.equal(calculateNextRoutineDate('invalido'), null);
  });
});
