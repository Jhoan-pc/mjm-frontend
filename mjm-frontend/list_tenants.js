import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
  const tSnap = await getDocs(collection(db, 'tenants'));
  tSnap.docs.forEach(d => {
    console.log(`ID: ${d.id} | Name: ${d.data().nombre_empresa}`);
  });
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
