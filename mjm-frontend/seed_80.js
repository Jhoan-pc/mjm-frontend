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
const TENANT_ID = "OUumulD5EqPIbuHXb1P1";

const INSTRUMENTS_SEED = [
  { nombre: 'Calibrador Pie de Rey Digital', marca: 'Mitutoyo', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '150 mm', criticidad: 'Alta' },
  { nombre: 'Micrómetro de Exteriores', marca: 'Starrett', magnitud: 'Longitud', resolucion: '0.001 mm', capacidadMax: '25 mm', criticidad: 'Alta' },
  { nombre: 'Reloj Comparador Digital', marca: 'Mahr', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '12.5 mm', criticidad: 'Media' },
  { nombre: 'Bloques Patrón', marca: 'Gagemaker', magnitud: 'Longitud', resolucion: 'Grado 0', capacidadMax: '100 mm', criticidad: 'Alta' },
  { nombre: 'Medidor de Espesores', marca: 'Olympus', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '500 mm', criticidad: 'Alta' },
  { nombre: 'Altímetro Digital', marca: 'Trimos', magnitud: 'Longitud', resolucion: '0.001 mm', capacidadMax: '400 mm', criticidad: 'Alta' },
  { nombre: 'Escuadra de Combinación', marca: 'Starrett', magnitud: 'Longitud', resolucion: '0.5 mm', capacidadMax: '300 mm', criticidad: 'Baja' },
  { nombre: 'Flexómetro Global Plus', marca: 'Stanley', magnitud: 'Longitud', resolucion: '1 mm', capacidadMax: '8 m', criticidad: 'Baja' },
  { nombre: 'Gramil Digital', marca: 'Mitutoyo', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '300 mm', criticidad: 'Media' },
  { nombre: 'Calibrador de Altura', marca: 'Fowler', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '600 mm', criticidad: 'Alta' },
  { nombre: 'Pirómetro Infrarrojo', marca: 'Fluke', magnitud: 'Temperatura', resolucion: '0.1 °C', capacidadMax: '650 °C', criticidad: 'Alta' },
  { nombre: 'Cámara Termográfica', marca: 'FLIR', magnitud: 'Temperatura', resolucion: '0.05 °C', capacidadMax: '550 °C', criticidad: 'Alta' },
  { nombre: 'Termómetro IR Laser', marca: 'Testo', magnitud: 'Temperatura', resolucion: '0.1 °C', capacidadMax: '600 °C', criticidad: 'Media' },
  { nombre: 'Pirómetro Alta Velocidad', marca: 'Raytek', magnitud: 'Temperatura', resolucion: '1 °C', capacidadMax: '3000 °C', criticidad: 'Alta' },
  { nombre: 'Módulo Temp IR', marca: 'Fluke', magnitud: 'Temperatura', resolucion: '0.1 °C', capacidadMax: '150 °C', criticidad: 'Baja' },
  { nombre: 'Termómetro IR Sonda K', marca: 'Amprobe', magnitud: 'Temperatura', resolucion: '0.1 °C', capacidadMax: '1250 °C', criticidad: 'Media' },
  { nombre: 'Escaner Temp Lineal', marca: 'LumaSense', magnitud: 'Temperatura', resolucion: '0.5 °C', capacidadMax: '950 °C', criticidad: 'Alta' },
  { nombre: 'Transmisor IR Fijo', marca: 'Extech', magnitud: 'Temperatura', resolucion: '0.1 °C', capacidadMax: '2200 °C', criticidad: 'Alta' },
  { nombre: 'Cronómetro Digital', marca: 'Traceable', magnitud: 'Tiempo', resolucion: '0.01 s', capacidadMax: '24 h', criticidad: 'Alta' },
  { nombre: 'Frecuencímetro', marca: 'Keysight', magnitud: 'Tiempo', resolucion: '0.001 Hz', capacidadMax: '350 MHz', criticidad: 'Alta' },
  { nombre: 'Acelerómetro VIB', marca: 'Brüel & Kjær', magnitud: 'Vibración', resolucion: '0.01 m/s²', capacidadMax: '500 m/s²', criticidad: 'Alta' },
  { nombre: 'Analizador VIB', marca: 'Fluke', magnitud: 'Vibración', resolucion: '0.1 mm/s', capacidadMax: '1000 Hz', criticidad: 'Alta' }
];

async function run() {
  console.log("🧹 Limpiando inventario previo...");
  const oldInst = await getDocs(query(collection(db, 'inventario_metrologico'), where('tenantId', '==', TENANT_ID)));
  for (const d of oldInst.docs) await deleteDoc(doc(db, 'inventario_metrologico', d.id));
  console.log(`🗑️ Eliminados ${oldInst.size} instrumentos.`);

  console.log("📂 Recuperando áreas de la jerarquía...");
  const areasSnap = await getDocs(query(collection(db, 'hierarchy'), where('tenantId', '==', TENANT_ID), where('type', '==', 'area')));
  const areas = areasSnap.docs.map(d => ({ id: d.id, name: d.data().name }));
  
  // Encontrar nombres de plantas para los padres
  const plantsSnap = await getDocs(query(collection(db, 'hierarchy'), where('tenantId', '==', TENANT_ID), where('type', '==', 'planta')));
  const plantsMap = {};
  plantsSnap.docs.forEach(d => plantsMap[d.id] = d.data().name);

  // Mapear áreas a sus plantas
  const areasWithPlants = areasSnap.docs.map(d => ({
    id: d.id,
    name: d.data().name,
    planta: plantsMap[d.data().parentId]
  }));

  console.log("🚀 Inyectando 80 instrumentos saneados...");
  let count = 0;
  for (let i = 0; i < 80; i++) {
    const seed = INSTRUMENTS_SEED[i % INSTRUMENTS_SEED.length];
    const area = areasWithPlants[i % areasWithPlants.length];
    
    await addDoc(collection(db, 'inventario_metrologico'), {
      ...seed,
      tenantId: TENANT_ID,
      codigoMJM: `MJM-DC-${String(i+1).padStart(3, '0')}`,
      estado: i % 10 === 0 ? 'Vencido' : i % 7 === 0 ? 'Próximo Vencimiento' : 'Vigente',
      proximaCalibracion: '2025-08-15',
      jerarquia: {
        pais: 'Colombia',
        planta: area.planta,
        area: area.name,
        proceso: 'Proceso Industrial MJM',
        ubicacion: `Estación Delta-${(i % 5) + 1}`
      },
      hierarchyId: area.id,
      createdAt: serverTimestamp()
    });
    count++;
    if (count % 20 === 0) console.log(`📦 Procesados ${count}/80...`);
  }

  console.log("🎉 ¡Éxito! 80 instrumentos creados y vinculados a la jerarquía.");
  process.exit(0);
}

run().catch(console.error);
