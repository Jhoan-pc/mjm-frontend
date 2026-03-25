import { create } from 'zustand';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  tenant: null,
  loading: true,

  // Escucha cambios de Firebase en tiempo real
  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscamos el usuario en Firestore
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
          if (userDoc.exists()) {
             const userData = userDoc.data();
             // Buscamos la empresa (Tenant) asociada a este usuario
             const tenantDoc = await getDoc(doc(db, 'tenants', userData.tenantId));
             set({
               isAuthenticated: true,
               user: { id: firebaseUser.uid, ...userData },
               tenant: { id: tenantDoc.id, ...tenantDoc.data() },
               loading: false
             });
             return;
          }
        } catch (error) {
           console.warn("Aviso: Base de datos no configurada completamente (Fallo la lectura en Firestore). Cargando Tenant de respaldo.", error);
        }
        
        // Tenant de Respaldo por si su Firestore aún no tiene las colecciones creadas
        set({
          isAuthenticated: true,
          user: { id: firebaseUser.uid, email: firebaseUser.email, rol: 'admin' },
          tenant: {
            id: 't_backup',
            nombre_empresa: 'Empresa Demo (Firestore vacío)',
            logo_url: 'https://via.placeholder.com/150x50?text=EMPRESA+DEMO',
            color_institucional_principal: '#4f46e5', // Indigo
            color_institucional_secundario: '#4338ca'
          },
          loading: false
        });

      } else {
        set({ isAuthenticated: false, user: null, tenant: null, loading: false });
      }
    });
  },
  
  login: async (email, password) => {
    try {
      // Login de Emergencia/Simulado temporal (Por si aún no habilitan Auth)
      if (email === "admin@industrias.com" && password === "123456") {
          set({
            isAuthenticated: true,
            user: { id: 'mock1', email, rol: 'admin' },
            tenant: {
              id: 't1',
              nombre_empresa: 'Industrias Alfa (Habilitar Auth primero)',
              logo_url: 'https://via.placeholder.com/150x50?text=Industrias+Alfa',
              color_institucional_principal: '#0D9488',
              color_institucional_secundario: '#0F766E'
            }
          });
          return true;
      }

      // Autenticación Real contra Google Cloud Identity
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Firebase Login Error:", error);
      throw error;
    }
  },

  logout: async () => {
    // Si era el usuario simulado
    if (useAuthStore.getState().user?.id === 'mock1') {
       set({ isAuthenticated: false, user: null, tenant: null });
       return;
    }
    await signOut(auth);
  }
}));
