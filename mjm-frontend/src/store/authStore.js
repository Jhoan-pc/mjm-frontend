import { create } from 'zustand';

// Simulated Firebase Tenant Read
export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  tenant: null,
  
  login: async (email, password) => {
    // Simulate API Call to Firebase
    return new Promise((resolve) => {
      setTimeout(() => {
        set({
          isAuthenticated: true,
          user: { id: 'u1', email, rol: 'admin' },
          tenant: {
            id: 't1',
            nombre_empresa: 'Industrias Alfa',
            logo_url: 'https://via.placeholder.com/150x50?text=Industrias+Alfa', // Simulated logo
            color_institucional_principal: '#0D9488', // Teal
            color_institucional_secundario: '#0F766E'
          }
        });
        resolve(true);
      }, 800);
    });
  },

  logout: () => {
    set({ isAuthenticated: false, user: null, tenant: null });
  }
}));
