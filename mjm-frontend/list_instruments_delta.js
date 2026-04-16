import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

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

async function listInstruments() {
  const instSnap = await getDocs(query(collection(db, 'instruments'), where('tenantId', '==', 'OUumulD5EqPIbuHXb1P1')));
  instSnap.docs.forEach(d => console.log(d.data().nombre));
  process.exit(0);
}

listInstruments();
