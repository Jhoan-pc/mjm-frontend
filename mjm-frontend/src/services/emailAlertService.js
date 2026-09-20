import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

/**
 * Genera el cuerpo HTML enriquecido para la alerta por correo electrónico
 */
const buildEmailTemplate = ({ activity, tenant, reason }) => {
  const empresaNombre = tenant?.nombre_empresa || 'MJM Metrología';
  const colorPrimario = tenant?.color_institucional_principal || '#234c74';
  const colorSecundario = tenant?.color_institucional_secundario || '#f7931b';
  
  const priorityColor = 
    activity.priority === 'high' || activity.priority === 'Crítica' || activity.priority === 'Alta'
      ? '#ef4444' 
      : activity.priority === 'medium' || activity.priority === 'Media'
        ? '#f59e0b'
        : '#10b981';

  const priorityLabel = (activity.priority || 'Normal').toUpperCase();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Alerta Metrológica MJM</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              
              <!-- HEADER CON IDENTIDAD CORPORATIVA -->
              <tr>
                <td style="background-color: ${colorPrimario}; padding: 30px; text-align: left;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: ${colorSecundario}; display: block; margin-bottom: 6px;">
                          Control Metrológico ISO 10012
                        </span>
                        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                          ${empresaNombre}
                        </h1>
                      </td>
                      <td align="right" valign="middle">
                        <span style="display: inline-block; background-color: rgba(255,255,255,0.15); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.25);">
                          Alerta Activa
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- BANNER DE PRIORIDAD -->
              <tr>
                <td style="background-color: #f8fafc; padding: 18px 30px; border-bottom: 1px solid #e2e8f0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size: 13px; font-weight: 600; color: #334155;">
                        Tipo de Notificación: <span style="color: #0f172a; font-weight: 700;">${activity.tipo || 'Intervención Metrológica'}</span>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; background-color: ${priorityColor}15; color: ${priorityColor}; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; border: 1px solid ${priorityColor}40;">
                          PRIORIDAD: ${priorityLabel}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CONTENIDO PRINCIPAL -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                    El Sistema de Gestión Metrológica ha emitido un requerimiento de atención operativa para el siguiente equipo de su planta:
                  </p>

                  <!-- FICHA TÉCNICA DEL EQUIPO -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; width: 40%;">
                        Instrumento / Activo:
                      </td>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; color: #0f172a;">
                        ${activity.instrumentNombre || 'Instrumento no especificado'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                        Código Metrológico MJM:
                      </td>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; font-family: monospace; color: ${colorPrimario};">
                        ${activity.codigoMJM || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                        Fecha Programada Límite:
                      </td>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; color: #0f172a;">
                        ${activity.fechaProgramada || 'Sin Fecha Asignada'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 20px; font-size: 12px; color: #64748b;">
                        Instrucciones / Observaciones:
                      </td>
                      <td style="padding: 14px 20px; font-size: 12px; color: #334155; line-height: 1.5;">
                        ${activity.notas || 'Se requiere coordinar calibración o mantenimiento conforme a la norma ISO 10012.'}
                      </td>
                    </tr>
                  </table>

                  <!-- ACCIÓN RECOMENDADA -->
                  <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #166534;">
                      <strong>Acción Requerida en Planta:</strong> Verifique el estado físico del equipo, asegure su trazabilidad y gestione la orden de trabajo desde el tablero operativo.
                    </p>
                  </div>

                  <!-- BOTÓN DE ACCESO DIRECTO -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="http://localhost:3005/dashboard/calendario" target="_blank" style="display: inline-block; background-color: ${colorSecundario}; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(247,147,27,0.3);">
                          Ver Actividad en el Sistema &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- FOOTER DE CONFORMIDAD -->
              <tr>
                <td style="background-color: #0f172a; padding: 25px 30px; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8;">
                    MJM Digital Core &bull; Aseguramiento Metrológico Industrial
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #64748b;">
                    Este correo se envía automáticamente al buzón de alertas configurado para ${empresaNombre}.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Despachador de Alertas por Email desde Firebase
 * 
 * Encola el mensaje en la colección 'mail' de Firestore (estándar Trigger Email)
 * y almacena una bitácora en la colección 'historial_alertas' del tenant.
 */
export const sendMetrologyEmailAlert = async ({ activity, tenant, reason = 'manual' }) => {
  const isDemo = useAuthStore.getState().isDemoMode;
  const currentTenant = tenant || useAuthStore.getState().tenant;
  
  // Destinatario: Correo específico de alertas del tenant, o el correo de contacto como fallback
  const recipient = 
    currentTenant?.email_alertas?.trim() || 
    currentTenant?.email_contacto?.trim() || 
    'alertas@metrologia.com';

  const subject = `[ALERTA METROLÓGICA] ${activity.tipo || 'Actividad'} - ${activity.instrumentNombre || 'Equipo'} (${activity.codigoMJM || 'S/N'})`;
  const htmlContent = buildEmailTemplate({ activity, tenant: currentTenant, reason });

  // 1. MODO DEMO: Simular en memoria reactiva sin escribir en Firestore
  if (isDemo) {
    const demoAlert = {
      id: `demo_mail_${Date.now()}`,
      to: recipient,
      subject,
      activityId: activity.id,
      activityTipo: activity.tipo,
      fechaEnvio: new Date().toISOString(),
      estado: 'enviado_simulado',
      tenantId: 'sandboxdemo'
    };

    try {
      const prev = JSON.parse(sessionStorage.getItem('mjm_demo_email_alerts') || '[]');
      sessionStorage.setItem('mjm_demo_email_alerts', JSON.stringify([demoAlert, ...prev]));
    } catch (_) {}

    return {
      success: true,
      simulated: true,
      recipient,
      message: `Alerta enviada (Simulación Demo) a ${recipient}`
    };
  }

  // 2. MODO REAL: Escribir en la colección 'mail' de Firestore (Firebase Trigger Email)
  try {
    const mailDoc = await addDoc(collection(db, 'mail'), {
      to: [recipient],
      message: {
        subject,
        text: `Alerta Metrológica: Se requiere ${activity.tipo} para ${activity.instrumentNombre} (${activity.codigoMJM || ''}) con fecha límite ${activity.fechaProgramada || ''}. Notas: ${activity.notas || ''}`,
        html: htmlContent
      },
      tenantId: currentTenant?.id || 'sin_tenant',
      activityId: activity.id || null,
      instrumentId: activity.instrumentId || null,
      reason,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    // 3. Registrar bitácora histórica en el tenant
    if (currentTenant?.id) {
      try {
        await addDoc(collection(db, 'tenants', currentTenant.id, 'historial_alertas'), {
          mailDocId: mailDoc.id,
          destinatario: recipient,
          subject,
          tipoActividad: activity.tipo,
          instrumento: activity.instrumentNombre,
          codigoMJM: activity.codigoMJM || '',
          fechaProgramada: activity.fechaProgramada || '',
          prioridad: activity.priority || 'medium',
          createdAt: serverTimestamp()
        });
      } catch (histErr) {
        console.warn("Aviso al registrar historial de alerta:", histErr);
      }
    }

    return {
      success: true,
      simulated: false,
      recipient,
      mailDocId: mailDoc.id,
      message: `Alerta encolada exitosamente en Firebase hacia ${recipient}`
    };
  } catch (error) {
    console.error("Error al encolar alerta de correo en Firebase:", error);
    throw error;
  }
};
