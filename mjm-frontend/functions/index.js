const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { GoogleGenerativeAI } = require("@google/generative-ai");

initializeApp();
const db = getFirestore();

// Configuración de Gemini (Capa Gratuita)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * BOT METROLÓGICO MJM
 * Se dispara al subir un certificado (PDF) a la carpeta 'certificates/'
 */
exports.metrologyBotVerifier = onObjectFinalized({
  memory: "512MiB",
  timeoutSeconds: 120,
}, async (event) => {
  const fileBucket = event.data.bucket;
  const filePath = event.data.name; // Ej: certificates/tenant_001/activity_123.pdf

  // Solo procesamos PDFs en la carpeta de certificados
  if (!filePath.startsWith("certificates/") || !filePath.endsWith(".pdf")) return;

  const fileName = filePath.split("/").pop();
  const activityId = fileName.replace(".pdf", "");

  try {
    // 1. Obtener datos de la actividad
    const actDoc = await db.collection("activities").doc(activityId).get();
    if (!actDoc.exists) return;
    const activityData = actDoc.data();

    // 2. Obtener Tolerancia del Proceso del Instrumento asociado
    const instDoc = await db.collection("inventario_metrologico").doc(activityData.instrumentId).get();
    if (!instDoc.exists) return;
    const tolerance = instDoc.data().tolerancia_proceso;

    // 3. Extracción vía IA (Gemini)
    // NOTA: En un flujo real, aquí descargaríamos el archivo y usaríamos inlineData
    // Para esta versión, simulamos el prompt de extracción
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analiza este certificado metrológico y extrae el error máximo e incertidumbre. 
                    Responde SOLO en JSON: {"error": number, "incertidumbre": number}`;
    
    // Simulación de respuesta de IA (Para implementación real se requiere el stream del PDF)
    const result = await model.generateContent(prompt);
    const aiData = JSON.parse(result.response.text());

    // 4. LÓGICA MATEMÁTICA ISO 10012:2026
    const errorAbs = Math.abs(aiData.error);
    const incertidumbre = aiData.incertidumbre;
    const valorEvaluado = errorAbs + incertidumbre;
    
    const esConforme = valorEvaluado <= tolerance;
    const dictamen = esConforme ? "Conforme" : "No Conforme";

    // 5. Actualización en Tiempo Real
    const batch = db.batch();
    
    // Actualizar actividad
    batch.update(db.collection("activities").doc(activityId), {
      error_encontrado: aiData.error,
      incertidumbre_medicion: aiData.incertidumbre,
      declaracion_conformidad: dictamen,
      regla_decision: "Error + Incertidumbre <= Tolerancia",
      status: "done",
      verifiedAt: FieldValue.serverTimestamp()
    });

    // Actualizar instrumento (Hoja de Vida)
    batch.update(db.collection("inventario_metrologico").doc(activityData.instrumentId), {
      lastStatus: dictamen === "Conforme" ? "Vigente" : "Vencido/No Conforme",
      lastVerificationAt: FieldValue.serverTimestamp(),
      nextConfirmationDate: "Calculado según intervalo" 
    });

    await batch.commit();
    console.log(`Bot MJM: Verificación completada para ${activityId}. Resultado: ${dictamen}`);

  } catch (error) {
    console.error("Error en Metrology Bot:", error);
  }
});
