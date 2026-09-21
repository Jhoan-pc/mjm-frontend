/**
 * METROLOGY CORE MODULE (ISO 10012 / ISO/IEC 17025)
 * Motor puro de cálculos metrológicos y proyección de actividades operativas.
 * Arquitectura Limpia: Cero dependencias de estado o librerías de UI.
 */

export const buildExpectedActivities = (tenantId, instrumentId, instrumentData) => {
  const rutinas = instrumentData.rutinas || {};
  const routineKeys = ['calibracion', 'verificacion', 'mantenimiento', 'calificacion'];
  const routineLabels = {
    calibracion: 'Calibración',
    verificacion: 'Verificación',
    mantenimiento: 'Mantenimiento',
    calificacion: 'Calificación'
  };

  const expectedActivities = [];

  for (const key of routineKeys) {
    if (rutinas[key]) {
      const freqMonths = Number(rutinas[`${key}_frecuencia`]) || 12;
      const startDateStr = rutinas[`${key}_fecha_inicial`];
      if (!startDateStr) continue;

      const [year, month, day] = startDateStr.split('-').map(Number);
      const current = new Date(year, month - 1, day);
      
      const years = Number(rutinas[`${key}_anos`]) || 5;
      const count = Math.max(1, Math.floor((years * 12) / freqMonths));

      for (let i = 0; i < count; i++) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const dVal = String(current.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dVal}`;

        const isLast = (i === count - 1);

        const activityData = {
          tenantId,
          instrumentId,
          instrumentNombre: instrumentData.nombre || 'Instrumento',
          codigoMJM: instrumentData.codigo || instrumentData.codigoMJM || '',
          tipo: routineLabels[key],
          estado: 'todo',
          fechaProgramada: dateStr,
          priority: instrumentData.riesgo_operativo === 'Alta' || instrumentData.riesgo_operativo === 'Crítica' ? 'high' : 'medium',
        };

        if (isLast) {
          activityData.is_last_of_5_years = true;
        }

        expectedActivities.push(activityData);

        // Safe Date increment: calculate next occurrence relative to original start date
        const nextTargetMonth = (month - 1) + ((i + 1) * freqMonths);
        const nextDate = new Date(year, nextTargetMonth, day);
        if (nextDate.getDate() !== day) {
          nextDate.setDate(0);
        }
        current.setTime(nextDate.getTime());
      }
    }
  }

  return expectedActivities;
};

/**
 * Cálculo seguro de la siguiente fecha de rutina con protección contra rollover de fin de mes.
 * Si la fecha inicial es un día 31 y el mes de destino tiene menos días (p. ej. 28, 29 o 30),
 * se ajusta automáticamente al último día válido de dicho mes.
 *
 * @param {string|Date} startDateStr - Fecha inicial (formato YYYY-MM-DD o Date)
 * @param {number} freqMonths - Periodicidad en meses (por defecto 12)
 * @returns {string|null} - Fecha proyectada en formato YYYY-MM-DD, o null si es inválida
 */
export const calculateNextRoutineDate = (startDateStr, freqMonths = 12) => {
  if (!startDateStr) return null;
  try {
    let year, month, day;
    if (typeof startDateStr === 'string') {
      const cleanStr = startDateStr.split('T')[0];
      const parts = cleanStr.split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        [year, month, day] = parts;
      } else {
        const d = new Date(startDateStr);
        if (isNaN(d.getTime())) return null;
        year = d.getFullYear();
        month = d.getMonth() + 1;
        day = d.getDate();
      }
    } else if (startDateStr instanceof Date) {
      if (isNaN(startDateStr.getTime())) return null;
      year = startDateStr.getFullYear();
      month = startDateStr.getMonth() + 1;
      day = startDateStr.getDate();
    } else if (typeof startDateStr === 'object' && typeof startDateStr.seconds === 'number') {
      const d = new Date(startDateStr.seconds * 1000);
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    } else {
      const d = new Date(startDateStr);
      if (isNaN(d.getTime())) return null;
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    }

    const freq = Number(freqMonths) || 12;
    const nextTargetMonth = (month - 1) + freq;
    const nextDate = new Date(year, nextTargetMonth, day);
    if (nextDate.getDate() !== day) {
      nextDate.setDate(0); // Clamp al último día del mes destino si hubo overflow
    }
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dVal = String(nextDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${dVal}`;
  } catch (err) {
    return null;
  }
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
 * - Con Incertidumbre (U > 0):
 *     |Error| > EMP -> No Conforme
 *     |Error| + U > EMP -> reglaDecision === 'guard_band' ? 'Zona de Duda' : 'Conforme'
 *     de lo contrario -> Conforme
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
