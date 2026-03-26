import { create } from 'zustand';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  tenant: null,
  loading: true,
  isSuperAdmin: true,

  setSuperAdmin: (val) => set({ isSuperAdmin: val }),

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
            nombre_empresa: 'Delta CoreTech',
            logo_url: 'https://placehold.co/200x60/050b14/white?text=DELTA+CORETECH',
            color_institucional_principal: '#234c74', // Azul MJM Corp
            color_institucional_secundario: '#f7931b' // Naranja MJM
          },
          loading: false
        });

      } else {
        // Firebase dice que no hay sesión real — pero puede haber sesión mock guardada
        const mockSession = localStorage.getItem('mjm_mock_session');
        if (mockSession) {
          try {
            const session = JSON.parse(mockSession);
            set({ isAuthenticated: true, user: session.user, tenant: session.tenant, loading: false });
            return;
          } catch (_) {
            localStorage.removeItem('mjm_mock_session');
          }
        }
        set({ isAuthenticated: false, user: null, tenant: null, loading: false });
      }
    });
  },
  
  login: async (email, password) => {
    try {
      // Login de Emergencia/Simulado temporal (Por si aún no habilitan Auth)
      if (email === "admin@industrias.com" && password === "123456") {
          const mockUser = { id: 'mock1', email, rol: 'admin' };
          const mockTenant = {
            id: 'OUumulD5EqPIbuHXb1P1',
            nombre_empresa: 'Delta CoreTech',
            logo_url: 'https://placehold.co/200x60/050b14/white?text=DELTA+CORETECH',
            color_institucional_principal: '#234c74',
            color_institucional_secundario: '#f7931b'
          };
          // Persistir en localStorage para sobrevivir F5
          localStorage.setItem('mjm_mock_session', JSON.stringify({ user: mockUser, tenant: mockTenant }));
          set({ isAuthenticated: true, user: mockUser, tenant: mockTenant });
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
    // Limpiar sesión mock si existe
    localStorage.removeItem('mjm_mock_session');
    // Si era el usuario simulado
    if (useAuthStore.getState().user?.id === 'mock1') {
       set({ isAuthenticated: false, user: null, tenant: null });
       return;
    }
    await signOut(auth);
  }
}));
