import { create } from 'zustand';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  tenant: null,
  allTenants: [],
  loading: true,
  isSuperAdmin: false,
  isDarkMode: false,
  isDemoMode: false,

  setSuperAdmin: (val) => set({ isSuperAdmin: val }),
  setDemoMode: (val) => set({ isDemoMode: val }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  // 🔄 Cargar todos los tenants (exclusivo para SuperAdmin)
  fetchAllTenants: async () => {
    try {
      const snap = await getDocs(collection(db, 'tenants'));
      let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Garantizar que sandboxdemo aparezca siempre en la lista del SuperAdmin
      if (!list.some(t => t.id === 'sandboxdemo')) {
        list.unshift({
          id: 'sandboxdemo',
          nombre_empresa: 'MJM Demo Sandbox (Vitrina Comercial)',
          nit: 'NIT-DEMO-2026',
          color_institucional_principal: '#234c74',
          color_institucional_secundario: '#f7931b',
          logo_url: 'https://firebasestorage.googleapis.com/v0/b/mjm-core-bd.firebasestorage.app/o/Logo%20final%20sin%20fondo.png?alt=media&token=34da8b1b-994a-4a37-8f3a-0fcbe1ab9eaf',
          suscripcion_activa: true,
          is_sandbox: true
        });
      }

      set({ allTenants: list });
      return list;
    } catch (err) {
      console.warn("Aviso al cargar lista completa de tenants:", err.message);
      return [];
    }
  },

  // 🔀 Alternar de Tenant en caliente (SuperAdmin Switcher)
  switchTenant: async (tenantId) => {
    const { allTenants } = get();
    let selected = allTenants.find((t) => t.id === tenantId);

    if (!selected) {
      try {
        const snap = await getDoc(doc(db, 'tenants', tenantId));
        if (snap.exists()) {
          selected = { id: snap.id, ...snap.data() };
        }
      } catch (err) {
        console.error("Error al buscar tenant para switch:", err);
      }
    }

    if (selected) {
      set({ tenant: selected });

      // Actualizar sesión persistida si es sesión local
      const mockSession = localStorage.getItem('mjm_mock_session');
      if (mockSession) {
        try {
          const parsed = JSON.parse(mockSession);
          parsed.tenant = selected;
          localStorage.setItem('mjm_mock_session', JSON.stringify(parsed));
        } catch (_) {}
      }

      // Actualizar variables CSS de marca
      const root = document.documentElement;
      if (selected.color_institucional_principal) {
        root.style.setProperty('--primary', selected.color_institucional_principal);
      }
      if (selected.color_institucional_secundario) {
        root.style.setProperty('--secondary', selected.color_institucional_secundario);
      }
    }
  },

  // 🛡️ Inicialización de sesión y escucha de Firebase en tiempo real
  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const isSuper =
              userData.rol === 'superadmin' ||
              userData.rol === 'sys_admin' ||
              userData.isSuperAdmin === true ||
              firebaseUser.email === 'admin@mjm.com' ||
              firebaseUser.email === 'proyectos@asesoriasmjm.com';

            let tenantData = null;
            let allTenantsList = [];

            if (isSuper) {
              try {
                const snap = await getDocs(collection(db, 'tenants'));
                allTenantsList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
              } catch (_) {}
            }

            if (userData.tenantId) {
              const tenantDoc = await getDoc(doc(db, 'tenants', userData.tenantId));
              if (tenantDoc.exists()) {
                tenantData = { id: tenantDoc.id, ...tenantDoc.data() };
              }
            }

            if (!tenantData && allTenantsList.length > 0) {
              tenantData = allTenantsList[0];
            }

            set({
              isAuthenticated: true,
              user: { id: firebaseUser.uid, ...userData },
              tenant: tenantData || {
                id: 't_backup',
                nombre_empresa: 'MJM Metrología',
                color_institucional_principal: '#234c74',
                color_institucional_secundario: '#f7931b',
              },
              allTenants: allTenantsList,
              isSuperAdmin: isSuper,
              isDemoMode: false,
              loading: false,
            });
            return;
          }
        } catch (error) {
          console.warn("Fallo lectura de usuario en Firestore. Cargando respaldo:", error);
        }

        // Respaldo para usuario autenticado sin documento en 'usuarios'
        set({
          isAuthenticated: true,
          user: { id: firebaseUser.uid, email: firebaseUser.email, rol: 'cliente_admin' },
          tenant: {
            id: 't_backup',
            nombre_empresa: 'Delta CoreTech',
            logo_url: 'https://placehold.co/200x60/050b14/white?text=DELTA+CORETECH',
            color_institucional_principal: '#234c74',
            color_institucional_secundario: '#f7931b',
          },
          allTenants: [],
          isSuperAdmin: false,
          isDemoMode: false,
          loading: false,
        });
      } else {
        // Sesión local / demo mock
        const mockSession = localStorage.getItem('mjm_mock_session');
        if (mockSession) {
          try {
            const session = JSON.parse(mockSession);
            const isDemo =
              session.isDemoMode ||
              session.user?.rol === 'demo' ||
              session.user?.id === 'sandbox-guest-001' ||
              session.user?.id === 'sandbox-dev-001';

            const isSuper =
              !isDemo &&
              (session.isSuperAdmin === true ||
                session.user?.rol === 'superadmin' ||
                session.user?.rol === 'sys_admin');

            set({
              isAuthenticated: true,
              user: session.user,
              tenant: session.tenant,
              allTenants: session.allTenants || [],
              isSuperAdmin: isSuper,
              isDemoMode: isDemo,
              loading: false,
            });

            if (isSuper && (!session.allTenants || session.allTenants.length === 0)) {
              get().fetchAllTenants();
            }
            return;
          } catch (_) {
            localStorage.removeItem('mjm_mock_session');
          }
        }

        set({
          isAuthenticated: false,
          user: null,
          tenant: null,
          allTenants: [],
          isSuperAdmin: false,
          isDemoMode: false,
          loading: false,
        });
      }
    });
  },

  // 🔑 Inicio de sesión
  login: async (email, password) => {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();

      // ─── 1. ACCESO DEMO SANDBOX ───
      if (cleanEmail === 'prueba@prueba.com' && password === 'mjmmetrologia') {
        return await get().loginDemo();
      }

      // ─── 2. ACCESO ADMINISTRADOR PRINCIPAL MJM (Master Bypass / Dev) ───
      if (
        (cleanEmail === 'admin@mjm.com' || cleanEmail === 'master@mjm.com' || cleanEmail === 'proyectos@asesoriasmjm.com') &&
        (password === 'mjm2026*' || password === 'mjmmaster2026' || password === 'mjmmetrologia')
      ) {
        let allTenants = [];
        try {
          const snap = await getDocs(collection(db, 'tenants'));
          allTenants = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (_) {}

        const activeTenant = allTenants.length > 0 ? allTenants[0] : {
          id: 'sandboxdemo',
          nombre_empresa: 'MJM Demo Sandbox (Vitrina)',
          color_institucional_principal: '#234c74',
          color_institucional_secundario: '#f7931b'
        };

        const superUser = {
          id: 'mjm-superadmin-001',
          email: cleanEmail,
          nombre: 'Administrador General MJM',
          rol: 'superadmin'
        };

        const session = {
          user: superUser,
          tenant: activeTenant,
          allTenants,
          isSuperAdmin: true,
          isDemoMode: false
        };

        localStorage.setItem('mjm_mock_session', JSON.stringify(session));
        set({
          isAuthenticated: true,
          user: superUser,
          tenant: activeTenant,
          allTenants,
          isSuperAdmin: true,
          isDemoMode: false,
          loading: false
        });
        return true;
      }

      // ─── 3. ACCESO CLIENTE AISLADO (Test Bypass / Dev) ───
      if (cleanEmail === 'admin@industrias.com' && password === '123456') {
        let clientTenant = {
          id: 'OUumulD5EqPIbuHXb1P1',
          nombre_empresa: 'Delta CoreTech',
          nit: '900123456',
          logo_url: 'https://placehold.co/200x60/050b14/white?text=DELTA+CORETECH',
          color_institucional_principal: '#234c74',
          color_institucional_secundario: '#f7931b',
          suscripcion_activa: true
        };

        try {
          const snap = await getDoc(doc(db, 'tenants', 'OUumulD5EqPIbuHXb1P1'));
          if (snap.exists()) {
            clientTenant = { id: snap.id, ...snap.data() };
          }
        } catch (_) {}

        const clientUser = {
          id: 'client-user-001',
          email: cleanEmail,
          nombre: 'Ingeniero de Calidad (Delta CoreTech)',
          rol: 'cliente_admin',
          tenantId: 'OUumulD5EqPIbuHXb1P1'
        };

        const session = {
          user: clientUser,
          tenant: clientTenant,
          allTenants: [],
          isSuperAdmin: false,
          isDemoMode: false
        };

        localStorage.setItem('mjm_mock_session', JSON.stringify(session));
        set({
          isAuthenticated: true,
          user: clientUser,
          tenant: clientTenant,
          allTenants: [],
          isSuperAdmin: false,
          isDemoMode: false,
          loading: false
        });
        return true;
      }

      // ─── 4. AUTENTICACIÓN REAL FIREBASE CLOUD IDENTITY ───
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const userDoc = await getDoc(doc(db, 'usuarios', cred.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isSuper =
          userData.rol === 'superadmin' ||
          userData.rol === 'sys_admin' ||
          userData.isSuperAdmin === true ||
          cleanEmail === 'admin@mjm.com' ||
          cleanEmail === 'proyectos@asesoriasmjm.com';

        let tenantData = null;
        let allTenants = [];

        if (isSuper) {
          try {
            const snap = await getDocs(collection(db, 'tenants'));
            allTenants = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          } catch (_) {}
        }

        if (userData.tenantId) {
          const tenantDoc = await getDoc(doc(db, 'tenants', userData.tenantId));
          if (tenantDoc.exists()) {
            tenantData = { id: tenantDoc.id, ...tenantDoc.data() };
            if (tenantData.suscripcion_activa === false && !isSuper) {
              await signOut(auth);
              throw new Error('Esta cuenta corporativa se encuentra suspendida por vencimiento de suscripción. Comuníquese con Asesorías Integrales MJM.');
            }
          }
        }

        if (!tenantData && allTenants.length > 0) {
          tenantData = allTenants[0];
        }

        set({
          isAuthenticated: true,
          user: { id: cred.user.uid, ...userData },
          tenant: tenantData || {
            id: 't_backup',
            nombre_empresa: 'MJM Metrología',
            color_institucional_principal: '#234c74',
            color_institucional_secundario: '#f7931b'
          },
          allTenants,
          isSuperAdmin: isSuper,
          isDemoMode: false,
          loading: false
        });
        return true;
      }

      return true;
    } catch (error) {
      console.error("Firebase Login Error:", error);
      throw error;
    }
  },

  // 🚀 Acceso Directo Modo Demo (Landing Page & Pruebas Efímeras)
  loginDemo: async () => {
    try {
      const tenantData = {
        id: 'sandboxdemo',
        nombre_empresa: 'MJM Demo Sandbox (Vitrina Comercial)',
        nit: 'NIT-DEMO-2026',
        logo_url: 'https://firebasestorage.googleapis.com/v0/b/mjm-core-bd.firebasestorage.app/o/Logo%20final%20sin%20fondo.png?alt=media&token=34da8b1b-994a-4a37-8f3a-0fcbe1ab9eaf',
        color_institucional_principal: '#234c74',
        color_institucional_secundario: '#f7931b',
        suscripcion_activa: true,
        is_sandbox: true
      };

      const demoUser = {
        id: 'sandbox-guest-001',
        email: 'invitado@demometrologia.com',
        nombre: 'Visitante Demo',
        rol: 'demo'
      };

      const session = {
        user: demoUser,
        tenant: tenantData,
        allTenants: [],
        isDemoMode: true,
        isSuperAdmin: false
      };

      localStorage.setItem('mjm_mock_session', JSON.stringify(session));
      set({
        isAuthenticated: true,
        user: demoUser,
        tenant: tenantData,
        allTenants: [],
        isDemoMode: true,
        isSuperAdmin: false,
        loading: false
      });

      // Inyectar colores corporativos
      const root = document.documentElement;
      root.style.setProperty('--primary', tenantData.color_institucional_principal);
      root.style.setProperty('--secondary', tenantData.color_institucional_secundario);

      return true;
    } catch (err) {
      console.error("Error en loginDemo:", err);
      throw err;
    }
  },

  // 🚪 Cerrar Sesión (Destruye datos efímeros para siempre)
  logout: async () => {
    localStorage.removeItem('mjm_mock_session');

    // 🧹 Purgar inmediatamente la memoria efímera del Sandbox
    try {
      const { useInventoryStore } = await import('./inventoryStore');
      useInventoryStore.getState().resetDemoData();
    } catch (_) {}

    set({
      isAuthenticated: false,
      user: null,
      tenant: null,
      allTenants: [],
      isDemoMode: false,
      isSuperAdmin: false,
      loading: false
    });
    try {
      await signOut(auth);
    } catch (_) {}
  }
}));
