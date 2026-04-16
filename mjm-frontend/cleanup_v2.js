import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";

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

const targetTenantId = 'OUumulD5EqPIbuHXb1P1'; // Delta CoreTech

async function runCleanup() {
  console.log("🚀 Iniciando limpieza y simulación (Inventario Metrologico Fix)...");

  // 1. Eliminar SKU MJM 2026 001
  const skuQuery = query(collection(db, 'inventario_metrologico'), where('codigoMJM', '==', 'MJM 2026 001'));
  const skuSnap = await getDocs(skuQuery);
  
  if (!skuSnap.empty) {
    for (const d of skuSnap.docs) {
      await deleteDoc(doc(db, 'inventario_metrologico', d.id));
      console.log(`✅ Eliminado SKU: ${d.id} (MJM 2026 001)`);
    }
  } else {
    console.log("ℹ️ SKU MJM 2026 001 no encontrado o ya eliminado.");
  }

  // 2. Seleccionar equipos para Comprobación Metrológica (en planta)
  const instSnap = await getDocs(query(collection(db, 'inventario_metrologico'), where('tenantId', '==', targetTenantId)));
  const instruments = instSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Filtrar algunos equipos estratégicos
  const selected = instruments.filter(i => 
    i.nombre.toLowerCase().includes('termómetro') || 
    i.nombre.toLowerCase().includes('balanza') || 
    i.nombre.toLowerCase().includes('micrómetro') ||
    i.nombre.toLowerCase().includes('osciloscopio') ||
    i.nombre.toLowerCase().includes('frecuencímetro')
  ).slice(0, 6);

  console.log(`📡 Seleccionados ${selected.length} equipos para comprobación en planta.`);

  const today = new Date();
  
  for (const inst of selected) {
    const verificationDate = new Date();
    verificationDate.setDate(today.getDate() - 15);

    const activity = {
      tenantId: targetTenantId,
      instrumentId: inst.id,
      instrumentNombre: inst.nombre,
      codigoMJM: inst.codigoMJM,
      tipo: 'Verificación',
      prioridad: inst.prioridad || 'Alta',
      estado: 'done',
      fechaProgramada: verificationDate.toISOString().split('T')[0],
      fechaRealizacion: verificationDate.toISOString().split('T')[0],
      laboratorio: 'INTERNO (MJM PLANTA)',
      certificado: `VER-INT-${Math.floor(Math.random() * 9000) + 1000}`,
      observaciones: 'Comprobación satisfactoria con patrón de referencia interno. Desviación dentro de límites.',
      evidencias: []
    };

    await addDoc(collection(db, 'activities'), activity);
    console.log(`✅ Actividad de Verificación creada para: ${inst.nombre}`);

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + 15);

    await addDoc(collection(db, 'activities'), {
      ...activity,
      estado: 'todo',
      fechaProgramada: nextDate.toISOString().split('T')[0],
      fechaRealizacion: null,
      laboratorio: null,
      certificado: null,
      observaciones: 'Próxima comprobación periódica en planta.'
    });
  }

  console.log("✨ Simulación completada.");
  process.exit(0);
}

runCleanup().catch(err => {
  console.error(err);
  process.exit(1);
});
