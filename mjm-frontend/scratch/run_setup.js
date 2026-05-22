import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

async function setupSandbox() {
  console.log("🚀 Iniciando creación de DeltaPruebas Sandbox en Firestore...");

  const tenantId = "deltapruebas-sandbox";
  
  // 1. Crear el Tenant
  const tenantRef = doc(db, 'tenants', tenantId);
  await setDoc(tenantRef, {
    nombre_empresa: "DeltaPruebas (MJM Sandbox)",
    nit: "900.888.777-SANDBOX",
    color_institucional_principal: "#78B7D0",
    color_institucional_secundario: "#1A202C",
    createdAt: serverTimestamp(),
    plan: "Premium-Sandbox",
    logo_url: "" 
  });
  console.log("✅ Documento 'tenants/deltapruebas-sandbox' creado con éxito.");

  console.log("\n--- SIGUIENTES PASOS ---");
  console.log("1. Ve a Firebase Authentication y crea el usuario: prueba@prueba.com");
  console.log("2. Copia el UID del nuevo usuario.");
  console.log("3. Pégalo aquí en el chat para que yo termine de vincularlo al tenant.");
}

setupSandbox().catch(err => {
  console.error("❌ Error en el setup:", err);
});
