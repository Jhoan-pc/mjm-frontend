import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

export const organizationsService = {
  getOrganization: async () => {
    try {
      // Intentamos obtener el tenantId del store de autenticación
      const { tenant } = useAuthStore.getState();
      
      if (tenant && tenant.id && tenant.id !== 't_backup') {
        const snap = await getDoc(doc(db, 'tenants', tenant.id));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() };
        }
      }
      
      // Fallback al tenant actual en el store (incluso si es el backup)
      return tenant || {
        id: 't_backup',
        nombre_empresa: 'MJM METROLOGÍA SAS',
        logo_url: '/src/assets/logo_mjm.jpg'
      };
    } catch (error) {
      console.error("Error in organizationsService.getOrganization:", error);
      return null;
    }
  }
};
