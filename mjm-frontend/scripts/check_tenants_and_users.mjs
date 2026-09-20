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
  console.log("=== TENANTS EN FIRESTORE ===");
  try {
    const tenantsSnap = await getDocs(collection(db, "tenants"));
    console.log(`Total tenants: ${tenantsSnap.size}`);
    tenantsSnap.forEach(d => {
      console.log(`ID: ${d.id} =>`, JSON.stringify(d.data(), null, 2));
    });
  } catch (err) {
    console.error("Error reading tenants:", err.message);
  }

  console.log("\n=== USUARIOS EN FIRESTORE ===");
  try {
    const usersSnap = await getDocs(collection(db, "usuarios"));
    console.log(`Total usuarios: ${usersSnap.size}`);
    usersSnap.forEach(d => {
      console.log(`UID: ${d.id} =>`, JSON.stringify(d.data(), null, 2));
    });
  } catch (err) {
    console.error("Error reading usuarios:", err.message);
  }

  console.log("\n=== INSTRUMENTS COUNT BY TENANT ===");
  try {
    const instSnap = await getDocs(collection(db, "instrumentos"));
    console.log(`Total instrumentos: ${instSnap.size}`);
    const byTenant = {};
    instSnap.forEach(d => {
      const t = d.data().tenantId || 'sin_tenant';
      byTenant[t] = (byTenant[t] || 0) + 1;
    });
    console.log(byTenant);
  } catch (err) {
    console.error("Error reading instrumentos:", err.message);
  }
}

inspect().catch(console.error);
