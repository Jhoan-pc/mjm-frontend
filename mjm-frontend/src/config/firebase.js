import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase para "MJM Sistema 2026"
// Estas variables deben venir del entorno para mayor seguridad en producción
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBTxV6Z5aq8F3AvSf8K7to_uq0VrUG0RE0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mjm-core-bd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mjm-core-bd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mjm-core-bd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "481709719870",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:481709719870:web:2aa45c88d89b719d6bec6f"
};

// Inicializar la aplicación
const app = initializeApp(firebaseConfig);

// Instanciar los servicios requeridos
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
