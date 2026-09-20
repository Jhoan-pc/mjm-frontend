import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTxV6Z5aq8F3AvSf8K7to_uq0VrUG0RE0",
  authDomain: "mjm-core-bd.firebaseapp.com",
  projectId: "mjm-core-bd",
  storageBucket: "mjm-core-bd.firebasestorage.app",
  messagingSenderId: "481709719870",
  appId: "1:481709719870:web:2aa45c88d89b719d6bec6f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspect() {
  const tenants = ["OUumulD5EqPIbuHXb1P1", "deltapruebas-sandbox"];
  for (const t of tenants) {
    try {
      const snap = await getDocs(collection(db, "tenants", t, "inventario_metrologico"));
      console.log(`Tenant ${t}: ${snap.size} instrumentos`);
      snap.forEach(d => {
        const item = d.data();
        console.log(`  - [${item.codigoMJM || item.codigo || d.id}] ${item.nombre} (Serie: ${item.serie})`);
      });
    } catch (err) {
      console.error(`Error reading ${t}:`, err.message);
    }
  }
}

inspect().catch(console.error);
