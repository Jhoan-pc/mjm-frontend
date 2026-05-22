import { db } from '../src/config/firebase.js';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

async function setupSandbox() {
  console.log("🚀 Iniciando creación de DeltaPruebas Sandbox...");

  const tenantId = "deltapruebas-sandbox";
  
  // 1. Crear el Tenant
  const tenantRef = doc(db, 'tenants', tenantId);
  await setDoc(tenantRef, {
    nombre_empresa: "DeltaPruebas (Sandbox)",
    nit: "900.888.777-SANDBOX",
    color_institucional_principal: "#78B7D0",
    color_institucional_secundario: "#1A202C",
    createdAt: serverTimestamp(),
    plan: "Premium-Sandbox"
  });
  console.log("✅ Tenant 'deltapruebas-sandbox' creado.");

  // 2. Crear el perfil de usuario (Vincular)
  // Nota: Deberás reemplazar 'TEMPORAL_UID' por el UID real después de crear el usuario en Auth
  // O puedes crear el documento una vez tengas el UID.
  console.log("⚠️  IMPORTANTE: Una vez crees el usuario prueba@prueba.com en la pestaña Authentication,");
  console.log("    avísame para vincular su UID exacto a este tenant.");
}

setupSandbox().catch(console.error);
