import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExpectedActivities, calculateMetrologicalCheck } from '../src/utils/metrologyCore.js';

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
