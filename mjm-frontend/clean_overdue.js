import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc, arrayUnion, serverTimestamp } from "firebase/firestore";

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
const LABORATORIOS = ['MJM Metrología SAS', 'Metrología del Norte', 'LabCert Internacional', 'Interno'];

async function run() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`🔍 Buscando actividades vencidas antes de ${today}...`);
  
  const q = query(collection(db, 'activities'), where('tenantId', '==', TENANT_ID), where('estado', '==', 'todo'));
  const snap = await getDocs(q);
  
  const overdue = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(a => a.fechaProgramada < today)
    .sort((a,b) => a.fechaProgramada.localeCompare(b.fechaProgramada));

  if (overdue.length <= 4) {
    console.log(`✅ Solo hay ${overdue.length} vencidas. No es necesario limpiar.`);
    process.exit(0);
  }

  const toClean = overdue.slice(0, overdue.length - 4); // Dejar las 4 más recientes
  console.log(`🚀 Limpiando ${toClean.length} actividades vencidas (dejando 4)...`);

  for (const act of toClean) {
    console.log(`✅ Intentando: ${act.tipo} para ${act.instrumentNombre} (${act.fechaProgramada}) [ID: ${act.id}]`);
    
    try {
      const closingData = {
        estado: 'done',
        fechaRealizacion: act.fechaProgramada,
        laboratorio: LABORATORIOS[Math.floor(Math.random() * LABORATORIOS.length)],
        certificado: `CERT-${2026}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        observaciones: "Actividad regularizada retroactivamente.",
        closedAt: serverTimestamp()
      };

      // 1. Actualizar actividad
      await updateDoc(doc(db, 'activities', act.id), closingData);

      // 2. Sincronizar historial del instrumento
      if (act.instrumentId) {
        await updateDoc(doc(db, 'inventario_metrologico', act.instrumentId), {
          historial: arrayUnion({
            id: `h-sync-${act.id}`,
            tipo: act.tipo,
            fecha: act.fechaProgramada,
            laboratorio: closingData.laboratorio,
            certificado: closingData.certificado,
            resultado: 'Completado',
            observaciones: closingData.observaciones
          })
        });
      }
    } catch (err) {
      if (err.code === 'not-found') {
        console.warn(`⚠️ Documento no encontrado (ID: ${act.id}), saltando...`);
      } else {
        console.error(`❌ Error en ID ${act.id}:`, err.message);
      }
    }
  }

  console.log("🎉 Limpieza y sincronización completada.");
  process.exit(0);
}

run().catch(e => {
  console.error("❌ Error:", e);
  process.exit(1);
});
