import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

async function populate() {
  try {
    const snap = await getDocs(collection(db, 'tenants', 'deltapruebas-sandbox', 'inventario_metrologico'));
    console.log(`Found ${snap.size} instruments. Updating hierarchies...`);
    
    let count = 0;
    for (const d of snap.docs) {
      const data = d.data();
      const instId = d.id;
      
      const procesoVal = data.proceso || 'OPERATIVO';
      const ubicacionVal = data.ubicacion || 'LABORATORIO 1';
      
      const jerarquia = {
        pais: 'Colombia',
        planta: 'Planta Principal',
        area: 'Área General',
        proceso: procesoVal,
        ubicacion: ubicacionVal
      };
      
      await updateDoc(doc(db, 'tenants', 'deltapruebas-sandbox', 'inventario_metrologico', instId), {
        jerarquia: jerarquia
      });
      count++;
    }
    console.log(`Successfully updated ${count} instruments with standard hierarchy.`);
  } catch (e) {
    console.error("Error updating instruments:", e);
  }
  process.exit(0);
}

populate();
