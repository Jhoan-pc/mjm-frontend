import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";

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
const TENANT_ID = "OUumulD5EqPIbuHXb1P1"; // Real Delta CoreTech ID

async function run() {
  console.log("🧹 Limpiando datos de prueba previos (t1)...");
  const oldNodes = await getDocs(query(collection(db, 'hierarchy'), where('tenantId', '==', 't1')));
  for (const n of oldNodes.docs) {
    await deleteDoc(doc(db, 'hierarchy', n.id));
  }
  console.log(`🗑️ Eliminados ${oldNodes.size} nodos de prueba.`);

  console.log("🚀 Iniciando saneamiento REAL para Delta CoreTech...");

  // 1. Crear Jerarquía Base
  const pais = "Colombia";
  const planta1 = "Planta Producción Bogotá";
  const planta2 = "Laboratorio Central Metrológico";
  
  const areas1 = ["Envasado Térmico", "Almacenamiento Crítico", "Mantenimiento Preventivo"];
  const areas2 = ["Control de Calidad", "Recepción y Despacho", "Área de Certificación"];

  // Crear Nodo País
  const paisRef = await addDoc(collection(db, 'hierarchy'), {
    name: pais, type: 'pais', parentId: TENANT_ID, tenantId: TENANT_ID, createdAt: serverTimestamp()
  });
  console.log(`✅ Creado País: ${pais}`);

  // Crear Plantas
  const p1Ref = await addDoc(collection(db, 'hierarchy'), {
    name: planta1, type: 'planta', parentId: paisRef.id, tenantId: TENANT_ID, createdAt: serverTimestamp()
  });
  const p2Ref = await addDoc(collection(db, 'hierarchy'), {
    name: planta2, type: 'planta', parentId: paisRef.id, tenantId: TENANT_ID, createdAt: serverTimestamp()
  });
  console.log(`✅ Creadas plantas: ${planta1}, ${planta2}`);

  // Crear Áreas
  const areaIds1 = [];
  for (const a of areas1) {
    const ref = await addDoc(collection(db, 'hierarchy'), {
      name: a, type: 'area', parentId: p1Ref.id, tenantId: TENANT_ID, createdAt: serverTimestamp()
    });
    areaIds1.push({ id: ref.id, name: a });
  }
  const areaIds2 = [];
  for (const a of areas2) {
    const ref = await addDoc(collection(db, 'hierarchy'), {
      name: a, type: 'area', parentId: p2Ref.id, tenantId: TENANT_ID, createdAt: serverTimestamp()
    });
    areaIds2.push({ id: ref.id, name: a });
  }
  console.log(`✅ Creadas 6 áreas técnicas.`);

  // 2. Mapear Instrumentos
  const q = query(collection(db, 'inventario_metrologico'), where('tenantId', '==', TENANT_ID));
  const snap = await getDocs(q);
  console.log(`📦 Encontrados ${snap.size} instrumentos. Iniciando mapeo masivo...`);

  let count = 0;
  const allAreas = [
    ...areaIds1.map(a => ({ ...a, planta: planta1 })),
    ...areaIds2.map(a => ({ ...a, planta: planta2 }))
  ];

  for (const itemDoc of snap.docs) {
    const area = allAreas[count % allAreas.length];
    
    await updateDoc(doc(db, 'inventario_metrologico', itemDoc.id), {
      jerarquia: {
        pais: pais,
        planta: area.planta,
        area: area.name,
        proceso: 'Proceso Industrial',
        ubicacion: 'Línea de Producción Sector A'
      },
      hierarchyId: area.id,
      lastUpdate: serverTimestamp()
    });
    count++;
  }

  console.log(`🎉 ¡Saneamiento completado! ${count} instrumentos organizados en la nueva estructura.`);
  process.exit(0);
}

run().catch(e => {
  console.error("❌ Error fatal:", e);
  process.exit(1);
});
