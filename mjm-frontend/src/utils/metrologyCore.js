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
 * Cálculo del error sistemático, consumo de tolerancia y conformidad metrológica (ISO 10012)
 * Error = V_leido - V_patron
 * % Consumo = (|Error| / EMP) * 100
 * Declaración: Conforme si |Error| <= EMP, de lo contrario No Conforme
 */
export const calculateMetrologicalCheck = ({ valorLeido, valorPatron, tolerancia }) => {
  const vPatron = Number(valorPatron) || 0;
  const tol = Number(tolerancia) > 0 ? Number(tolerancia) : 0.05;
  const vLeido = Number(valorLeido) || 0;
  const errorVal = Number((vLeido - vPatron).toFixed(4));
  const consumoPct = tol > 0 ? Math.min(999, Math.round((Math.abs(errorVal) / tol) * 100)) : 0;
  const declaracion = Math.abs(errorVal) <= tol ? 'Conforme' : 'No Conforme';

  return {
    vPatron,
    vLeido,
    errorVal,
    tol,
    consumoPct,
    declaracion
  };
};
