import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit } from "firebase/firestore";

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

async function run() {
  console.log("Checking Tenants...");
  const tSnap = await getDocs(collection(db, 'tenants'));
  tSnap.docs.forEach(d => console.log(`Tenant: ${d.id} - ${d.data().nombre_empresa}`));

  console.log("\nChecking Inventory (Top 5)...");
  const iSnap = await getDocs(collection(db, 'inventario_metrologico'), limit(5));
  iSnap.docs.forEach(d => console.log(`Item: ${d.id} - tenantId: ${d.data().tenantId} - ${d.data().nombre}`));
  
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
