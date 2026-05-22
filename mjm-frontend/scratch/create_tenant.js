import { db } from '../src/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function createDeltaPruebasTenant() {
  const tenantData = {
    nombre_empresa: "DeltaPruebas",
    nit: "900.888.777-1",
    color_institucional_principal: "#78B7D0", // Nuestro azul metrológico
    color_institucional_secundario: "#1A202C", // Nuestro obsidian
    logo_url: "https://firebasestorage.googleapis.com/v0/b/mjm-core-bd.appspot.com/o/logos%2Fdelta_logo.png?alt=media",
    createdAt: serverTimestamp(),
    plan: "Premium",
    configuracion_iso: {
      norma_referencia: "ISO 10012:2026",
      auto_verificacion: true
    }
  };

  try {
    const docRef = await addDoc(collection(db, "tenants"), tenantData);
    console.log("✅ Tenant 'DeltaPruebas' creado con ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Error creando tenant:", e);
  }
}

createDeltaPruebasTenant();
