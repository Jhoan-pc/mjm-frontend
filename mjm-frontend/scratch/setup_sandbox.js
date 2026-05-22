import { db } from '../src/firebase/config';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

async function setupSandbox() {
  console.log("🚀 Iniciando configuración de Sandbox MJM...");

  try {
    // 1. Crear el Tenant
    const tenantRef = await addDoc(collection(db, "tenants"), {
      nombre_empresa: "DeltaPruebas",
      nit: "900.888.777-SANDBOX",
      color_institucional_principal: "#78B7D0",
      color_institucional_secundario: "#1A202C",
      logo_url: "https://firebasestorage.googleapis.com/v0/b/mjm-core-bd.appspot.com/o/logos%2Fdelta_logo.png?alt=media",
      createdAt: serverTimestamp(),
      plan: "Premium (Sandbox)"
    });

    const tenantId = tenantRef.id;
    console.log("✅ Tenant 'DeltaPruebas' creado con ID:", tenantId);

    // 2. Preparar el documento de Usuario (Vínculo)
    // NOTA: El ID del documento debe coincidir con el UID que genere Firebase Auth
    // Por ahora lo dejamos como una referencia para crear manualmente
    console.log("---------------------------------------------------------");
    console.log("👉 PRÓXIMO PASO MANUAL:");
    console.log("1. Ve a tu consola de Firebase > Authentication.");
    console.log("2. Crea el usuario: prueba@prueba.com / mjmmetrologia");
    console.log("3. Copia el 'UID' que le asigne Firebase.");
    console.log("4. Crea un documento en la colección 'users' con ese UID como ID.");
    console.log("5. El documento debe tener este campo:");
    console.log(JSON.stringify({
      email: "prueba@prueba.com",
      nombre: "Operador Sandbox",
      tenantId: tenantId,
      rol: "admin"
    }, null, 2));
    console.log("---------------------------------------------------------");

  } catch (e) {
    console.error("❌ Error en la configuración:", e);
  }
}

setupSandbox();
