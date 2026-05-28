import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

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

async function check() {
  try {
    const snap = await getDocs(query(collection(db, 'tenants', 'deltapruebas-sandbox', 'inventario_metrologico'), limit(1)));
    if (snap.empty) {
      console.log("No instruments found in subcollection.");
    } else {
      console.log("Instrument found:", JSON.stringify(snap.docs[0].data(), null, 2));
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

check();
