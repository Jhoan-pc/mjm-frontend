import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc, arrayUnion } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTxV6Z5aq8F3AvSf8K7to_uq0VrUG0RE0",
  authDomain: "mjm-core-bd.firebaseapp.com",
  projectId: "mjm-core-bd",
  storageBucket: "mjm-core-bd.firebasestorage.app",
  messagingSenderId: "481709719870",
  appId: "1:481709719870:web:2aa45c88d89b719d6bec6f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const TENANT_ID = "OUumulD5EqPIbuHXb1P1";

async function run() {
  console.log("🔍 Buscando actividades ejecutadas (done)...");
  const q = query(collection(db, 'activities'), where('tenantId', '==', TENANT_ID), where('estado', '==', 'done'));
  const activitiesSnap = await getDocs(q);
  
  if (activitiesSnap.empty) {
    console.log("⚠️ No hay actividades terminadas para sincronizar.");
    process.exit(0);
  }

  console.log(`✅ Encontradas ${activitiesSnap.size} actividades terminadas. Sincronizando historiales...`);

  // Agrupar por instrumento para hacer menos escrituras si fuera necesario, 
  // pero para 40 registros lo haremos uno a uno por seguridad.
  for (const actDoc of activitiesSnap.docs) {
    const act = actDoc.data();
    if (!act.instrumentId) continue;

    const historyEntry = {
      id: `h-${actDoc.id}`,
      tipo: act.tipo,
      fecha: act.fechaRealizacion || act.fechaProgramada,
      laboratorio: act.laboratorio || 'No especificado',
      certificado: act.certificado || 'N/A',
      resultado: 'Completado',
      observaciones: act.observaciones || ''
    };

    console.log(`📝 Sincronizando ${act.tipo} para ${act.instrumentNombre}...`);
    
    try {
      const instRef = doc(db, 'inventario_metrologico', act.instrumentId);
      // Usamos arrayUnion para no duplicar si ya existiera (aunque aquí las IDs son únicas)
      // O mejor, sobrescribimos el historial completo o añadimos. 
      // Para este caso de "poblar data", añadiremos al array.
      await updateDoc(instRef, {
        historial: arrayUnion(historyEntry)
      });
    } catch (e) {
      console.error(`❌ Error con instrumento ${act.instrumentId}:`, e.message);
    }
  }

  console.log("🎉 Sincronización completada. Las Hojas de Vida deberían estar pobladas.");
  process.exit(0);
}

run().catch(e => {
  console.error("❌ Error:", e);
  process.exit(1);
});
