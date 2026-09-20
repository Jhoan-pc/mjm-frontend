import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

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

async function testUpdate() {
  try {
    await updateDoc(doc(db, "tenants", "deltapruebas-sandbox"), {
      nombre_empresa: "Asesorías Integrales MJM",
      color_institucional_principal: "#234c74",
      color_institucional_secundario: "#f7931b"
    });
    console.log("¡Actualizado exitosamente nombre_empresa en Firestore a 'Asesorías Integrales MJM'!");
  } catch (err) {
    console.error("No se pudo actualizar directamente:", err.message);
  }
}

testUpdate();
