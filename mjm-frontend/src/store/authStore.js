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
  isDarkMode: false,

  setSuperAdmin: (val) => set({ isSuperAdmin: val }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

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
      // --- BYPASS DE DESARROLLO: DELTAPRUEBAS SANDBOX ---
      if (email === "prueba@prueba.com" && password === "mjmmetrologia") {
          const { getDoc, doc } = await import('firebase/firestore');
          const { db } = await import('../config/firebase');
          
          const mockUser = { id: 'sandbox-dev-001', email, rol: 'admin', nombre: 'MJM Administrator' };
          
          // Consultar la BD real para el nombre y colores
          const tenantDoc = await getDoc(doc(db, 'tenants', 'deltapruebas-sandbox'));
          let tenantData = {
            id: 'deltapruebas-sandbox',
            nombre_empresa: 'DeltaPruebas Sandbox', // Fallback
            logo_url: 'https://firebasestorage.googleapis.com/v0/b/mjm-core-bd.firebasestorage.app/o/Logo%20final%20sin%20fondo.png?alt=media&token=34da8b1b-994a-4a37-8f3a-0fcbe1ab9eaf'.replace(/ /g, '%20'),
            color_institucional_principal: '#78B7D0',
            color_institucional_secundario: '#1A202C'
          };

          if (tenantDoc.exists()) {
            tenantData = { id: tenantDoc.id, ...tenantDoc.data() };
          }

          localStorage.setItem('mjm_mock_session', JSON.stringify({ user: mockUser, tenant: tenantData }));
          set({ isAuthenticated: true, user: mockUser, tenant: tenantData, loading: false });
          return true;
      }

      // Login de Emergencia/Simulado temporal
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
