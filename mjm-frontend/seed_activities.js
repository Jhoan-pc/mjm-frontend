import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

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

const TIPOS = ['Calibración', 'Verificación', 'Mantenimiento', 'Calificación'];
const LABORATORIOS = ['MJM Metrología SAS', 'Metrología del Norte', 'LabCert Internacional', 'Interno'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function run() {
  console.log("🔍 Obteniendo instrumentos de Delta CoreTech...");
  const q = query(collection(db, 'inventario_metrologico'), where('tenantId', '==', TENANT_ID));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    console.error("❌ No se encontraron instrumentos para este tenant.");
    process.exit(1);
  }

  const instruments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`✅ ${instruments.length} instrumentos encontrados.`);

  console.log("🚀 Generando 40 actividades aleatorias...");
  
  const startDate = new Date(2025, 11, 1); // Diciembre 2025
  const today = new Date();
  
  for (let i = 0; i < 40; i++) {
    const inst = instruments[Math.floor(Math.random() * instruments.length)];
    const tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
    const date = randomDate(startDate, today.getTime() > startDate.getTime() ? today : new Date(2026, 2, 31));
    const dateStr = date.toISOString().split('T')[0];
    
    const isPast = date < today;
    const isDone = isPast && Math.random() > 0.2; // 80% de las pasadas están terminadas

    const activity = {
      tenantId: TENANT_ID,
      instrumentId: inst.id,
      instrumentNombre: inst.nombre,
      codigoMJM: inst.codigoMJM,
      tipo: tipo,
      fechaProgramada: dateStr,
      estado: isDone ? 'done' : (isPast ? 'todo' : 'todo'), // En el calendario, 'todo' vencido se ve rojo
      archivada: false,
      prioridad: Math.random() > 0.8 ? 'Crítica' : 'Normal',
      createdAt: serverTimestamp()
    };

    if (isDone) {
      activity.fechaRealizacion = dateStr;
      activity.laboratorio = LABORATORIOS[Math.floor(Math.random() * LABORATORIOS.length)];
      activity.certificado = `CERT-${2026}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
      activity.observaciones = "Actividad ejecutada satisfactoriamente según cronograma.";
      activity.closedAt = serverTimestamp();
    }

    await addDoc(collection(db, 'activities'), activity);
    console.log(`📌 [${i+1}/40] Creada ${tipo} para ${inst.nombre} (${dateStr}) - ${activity.estado}`);
  }

  console.log("🎉 ¡Data de prueba generada con éxito!");
  process.exit(0);
}

run().catch(e => {
  console.error("❌ Error:", e);
  process.exit(1);
});
