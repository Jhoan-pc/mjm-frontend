import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTxV6Z5aq8F3AvSf8K7to_uq0VrUG0RE0",
  authDomain: "mjm-core-bd.firebaseapp.com",
  projectId: "mjm-core-bd",
  storageBucket: "mjm-core-bd.firebasestorage.app",
  messagingSenderId: "481709719870",
  appId: "1:481709719870:web:2aa45c88d89b719d6bec6f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const passwords = ["mjm2026*", "mjmmaster2026", "mjmmetrologia", "123456", "Mjm2026*"];

async function checkAuth() {
  for (const pw of passwords) {
    try {
      const cred = await signInWithEmailAndPassword(auth, "admin@mjm.com", pw);
      console.log(`¡Autenticado con éxito en Firebase Auth con password: ${pw}! UID: ${cred.user.uid}`);
      
      const userDoc = await getDoc(doc(db, "usuarios", cred.user.uid));
      if (userDoc.exists()) {
        console.log("Documento en usuarios:", JSON.stringify(userDoc.data(), null, 2));
      } else {
        console.log("No existe documento en 'usuarios' para el UID:", cred.user.uid);
      }

      console.log("\n--- Buscando instrumentos ---");
      const instSnap = await getDocs(collection(db, "instrumentos"));
      console.log(`Total instrumentos: ${instSnap.size}`);
      const byTenant = {};
      instSnap.forEach(d => {
        const t = d.data().tenantId || d.data().tenant_id || 'sin_tenant';
        byTenant[t] = (byTenant[t] || 0) + 1;
      });
      console.log("Instrumentos por tenant:", byTenant);
      return;
    } catch (err) {
      // Intenta el siguiente password
    }
  }
  console.log("Ninguna de las contraseñas probadas funcionó en Firebase Auth directa.");
}

checkAuth().catch(console.error);
