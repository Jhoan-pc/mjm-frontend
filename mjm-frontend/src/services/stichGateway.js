/**
 * Servicio Central de Orquestación (Stich)
 * 
 * Este archivo maneja todas las comunicaciones hacia fuera del ecosistema Firebase,
 * delegando tareas pesadas, integraciones con terceros, o generación de PDFs.
 */

const STICH_GATEWAY_URL = import.meta.env.VITE_STICH_WEBHOOK_URL || 'https://stitch.withgoogle.com/projects/5807624739754401010';
const STICH_API_KEY = import.meta.env.VITE_STICH_API_KEY || '';

export const stichService = {
  /**
   * Dispara el webhook para generar un reporte o PDF en la nube.
   * @param {Object} payload Datos necesarios para generar el PDF (ej. instrumentId).
   */
  async triggerPdfGeneration(payload) {
    try {
      const response = await fetch(`${STICH_GATEWAY_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STICH_API_KEY}`
        },
        body: JSON.stringify({
          action: 'pdf_generation',
          timestamp: new Date().toISOString(),
          data: payload,
        }),
      });

      if (!response.ok) throw new Error('Error al contactar al Gateway de Stich');
      return await response.json();
    } catch (error) {
      console.error('StichService: Falló la generación de PDF', error);
      throw error;
    }
  },

  /**
   * Dispara una alerta de calibración vencida a través de Stich.
   * @param {Object} payload Detalle de la calibración (ej. ID y fechas).
   */
  async notifyCalibrationDue(payload) {
    try {
      const response = await fetch(`${STICH_GATEWAY_URL}/alarms/calibration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Fallo en webhook de calibración');
      return await response.json();
    } catch (error) {
      console.error('StichService: Error enviando alerta', error);
      throw error;
    }
  }
};
