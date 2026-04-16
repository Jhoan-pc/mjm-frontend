import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

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

async function checkAndDelete() {
  console.log("🔍 Buscando SKU MJM-2026-001 (con guiones)...");
  const q = query(collection(db, 'inventario_metrologico'), where('codigoMJM', '==', 'MJM-2026-001'));
  const snap = await getDocs(q);
  
  if (!snap.empty) {
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'inventario_metrologico', d.id));
      console.log(`✅ Eliminado: ${d.id}`);
    }
  } else {
    console.log("❌ No se encontró MJM-2026-001.");
    
    console.log("🔍 Buscando SKU MJM 2026 001 (con espacios)...");
    const q2 = query(collection(db, 'inventario_metrologico'), where('codigoMJM', '==', 'MJM 2026 001'));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
       for (const d of snap2.docs) {
        await deleteDoc(doc(db, 'inventario_metrologico', d.id));
        console.log(`✅ Eliminado (espacios): ${d.id}`);
      }
    } else {
        console.log("❌ Tampoco se encontró con espacios.");
    }
  }
  process.exit(0);
}

checkAndDelete();
