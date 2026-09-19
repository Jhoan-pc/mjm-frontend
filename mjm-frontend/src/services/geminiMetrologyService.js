// src/services/geminiMetrologyService.js
// Cliente de Inteligencia Artificial Metrológica para MJM Asesorías Integrales
// Basado en el motor Google Gemini 3.6 Flash (Arquitectura Centinela GovTech)
// Conexión multimodal nativa para análisis de certificados de calibración en PDF

const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function getGeminiApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY || "";
  return key.trim();
}

export function getGeminiModel() {
  return import.meta.env.VITE_GEMINI_MODEL || "gemini-3.6-flash";
}

const FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

/**
 * Convierte un objeto File/Blob a Base64 puro (sin prefijo data:application/pdf;base64,)
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error("Error leyendo archivo como texto"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Envía un certificado PDF a Google Gemini para extracción de datos y dictamen metrológico formal.
 * @param {File} file Archivo PDF del certificado
 * @param {string} [customKey] Opcional: Clave API personalizada
 * @returns {Promise<Object>} Datos estructurados y dictamen
 */
export async function analyzeMetrologyCertificateWithGemini(file, customKey = null) {
  const apiKey = customKey || getGeminiApiKey();

  if (!apiKey) {
    throw new Error("No se ha configurado la clave de API de Google Gemini (VITE_GEMINI_API_KEY en .env.local).");
  }

  // 1. Convertir PDF a Base64
  const base64Pdf = await fileToBase64(file);

  // 2. Definir el System Prompt de Auditoría Metrológica ISO/IEC 17025 & JCGM 106
  const prompt = `Actúa como un Auditor Metrológico Senior bajo las normas ISO/IEC 17025:2017, ISO 10012, y las directrices de la guía JCGM 106:2012 e ISO 14253-1.

Analiza minuciosamente el certificado de calibración adjunto en formato PDF.

Debes extraer todos los datos y realizar una evaluación técnica cuantitativa estricta:

1. IDENTIFICACIÓN DEL INSTRUMENTO:
   - instrumento: Nombre técnico del instrumento (ej. Manómetro analógico, Termómetro digital, Termohigrómetro, Pie de rey, Comparador de carátula, Torquímetro, Pesa patrón, Pinza voltiamperimétrica, etc.)
   - marca: Fabricante del instrumento
   - modelo: Modelo del equipo
   - serie: Número de serie / Serial
   - rango: Rango o intervalo de medición con unidades
   - resolucion: División de escala o resolución con unidades
   - unidad: Unidad principal de medida (ej. psi, bar, °C, %HR, mm, N·m, lbf·ft, mg, g, A, V)
   - laboratorio: Nombre del laboratorio emisor
   - laboratorio_tipo: "Acreditado" o "Trazable"
   - certificado_numero: Número oficial del certificado
   - fecha_calibracion: Fecha en formato YYYY-MM-DD (o como aparezca)
   - patron: Patrón o patrones utilizados para la calibración

2. PUNTOS DE CALIBRACIÓN:
   - Extrae todos los puntos de la tabla de calibración (o al menos los 5 a 10 puntos clave):
     * nominal: Valor nominal o de consigna (string o número)
     * patron: Lectura del patrón de referencia (string o número)
     * instrumento: Lectura promedio del instrumento calibrado (string o número)
     * error: Error de indicación o sesgo (instrumento - patron o el indicado en tabla)
     * incertidumbre: Incertidumbre expandida U reportada (k=2)

3. CONFRONTACIÓN Y REGLA DE DECISIÓN METROLÓGICA:
   - Identifica la norma técnica internacional o estándar aplicable al equipo:
     * Manómetros: ASME B40.100 (Grado B: ±3% extremos, ±2% centro; Grado A: ±2% extremos, ±1% centro; Grado 1A: ±1% FS).
     * Pesas/Masas: OIML R 111-1 (Clase F1, F2, M1, etc.).
     * Pie de rey: JIS B 7507 / DIN 862 (ej. ±0.02 mm para 150 mm con res. 0.01 mm).
     * Comparadores de carátula: JIS B 7503.
     * Torquímetros: ISO 6789-1 Tipo II Clase A (±4% del valor medido para herramientas > 10 N·m).
     * Termómetros/Sensores: ASTM E230 / IEC 60584 / IEC 60751 o tolerancias estándar industriales de proceso (±0.5°C o ±1.0°C).
     * Termohigrómetros: Tolerancia del fabricante/proceso (±0.5°C, ±3% a 5% HR).
     * Si el certificado contiene un dictamen explícito del laboratorio (ej. "No cumple" o "Cumple"), respeta prioritariamente dicha declaración.
   - Aplica la regla de decisión metrológica:
     * Si el certificado dice explícitamente "No Cumple" -> "No Conforme" (Reprobado).
     * Si |Error Máx| > EMP -> "No Conforme" (Reprobado).
     * Si |Error Máx| <= EMP pero |Error Máx| + U > EMP -> "Zona de Duda" (Riesgo Compartido / Indeterminación por banda de guarda).
     * Si |Error Máx| + U <= EMP -> "Conforme" (Aprobado).

4. DICTAMEN TÉCNICO FORMAL:
   - veredicto: "Conforme", "No Conforme" o "Zona de Duda".
   - dictamen_parrafo: Un párrafo formal de extensión corta a media (entre 4 y 7 líneas) redactado con total solvencia técnica metrológica, explicando:
     * Nombre, marca y serial del equipo analizado.
     * El peor error de medición encontrado, en qué punto ocurrió y qué porcentaje o magnitud representa frente a la escala o valor medido.
     * La norma técnica o estándar de referencia contra el que se contrastó y el valor del Error Máximo Permisible (EMP).
     * El veredicto técnico final (Aprobado / Reprobado / En Zona de Duda).
     * Recomendación u orientación operativa clara para la planta (ej. apto para uso sin restricciones, requiere mantenimiento/ajuste de cero, o no apto para procesos regulados).

Genera EXCLUSIVAMENTE una respuesta en formato JSON con la siguiente estructura exacta:
{
  "instrumento": "...",
  "marca": "...",
  "modelo": "...",
  "serie": "...",
  "rango": "...",
  "resolucion": "...",
  "unidad": "...",
  "laboratorio": "...",
  "laboratorio_tipo": "Acreditado",
  "certificado_numero": "...",
  "fecha_calibracion": "...",
  "patron": "...",
  "error_maximo": "...",
  "incertidumbre_maxima": "...",
  "norma_referencia": "...",
  "emp_normativo": "...",
  "veredicto": "Conforme",
  "dictamen_parrafo": "...",
  "aptitud_de_uso": "Apto para uso / No apto para uso / Uso condicionado con corrección",
  "puntos": [
    {
      "nominal": "...",
      "patron": "...",
      "instrumento": "...",
      "error": "...",
      "incertidumbre": "..."
    }
  ]
}
Sin bloques de código markdown, responde únicamente el objeto JSON crudo.`;

  let lastError = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await fetch(`${GEMINI_ENDPOINT_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64Pdf
                  }
                },
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Error HTTP ${response.status} en modelo ${model}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("El modelo no devolvió contenido de texto.");
      }

      // Limpiar posibles backticks markdown si el modelo los incluyó
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsedData = JSON.parse(cleanJson);

      // Normalizar campos para compatibilidad con el UI de IAVerificationLab
      return {
        instrumento: parsedData.instrumento || 'Instrumento de Medición',
        marca: parsedData.marca || 'Sin especificar',
        modelo: parsedData.modelo || 'Sin especificar',
        serie: parsedData.serie || 'S/N',
        rango: parsedData.rango || '',
        resolucion: parsedData.resolucion || '',
        unidad: parsedData.unidad || '',
        laboratorio: parsedData.laboratorio || 'Laboratorio Metrológico',
        laboratorio_tipo: parsedData.laboratorio_tipo || 'Acreditado',
        certificado_numero: parsedData.certificado_numero || 'N/A',
        fecha_calibracion: parsedData.fecha_calibracion || '',
        calibrationDate: parsedData.fecha_calibracion || '',
        patron: parsedData.patron || 'Patrón Nacional/Internacional Trazable',
        error_maximo: String(parsedData.error_maximo || '0'),
        incertidumbre: String(parsedData.incertidumbre_maxima || parsedData.incertidumbre || '0'),
        norma_referencia: parsedData.norma_referencia || 'ISO/IEC 17025:2017 / JCGM 106:2012',
        criterio_tipo: 'emp',
        criterio_valor: String(parsedData.emp_normativo || '0'),
        veredicto: parsedData.veredicto || 'Conforme',
        riesgo: parsedData.dictamen_parrafo || 'Evaluación de conformidad metrológica procesada.',
        dictamen_parrafo: parsedData.dictamen_parrafo || '',
        aptitud_de_uso: parsedData.aptitud_de_uso || (parsedData.veredicto === 'Conforme' ? 'Apto para uso' : 'No apto para uso'),
        puntos: Array.isArray(parsedData.puntos) ? parsedData.puntos : []
      };

    } catch (err) {
      console.warn(`[GeminiMetrology] Falló intento con modelo ${model}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`No se pudo procesar el certificado con Google Gemini: ${lastError?.message || 'Error desconocido'}`);
}
