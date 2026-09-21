import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const instrumentsService = {
  getInstrumentById: async (tenantId, id) => {
    try {
      if (!tenantId || !id) return null;
      const snap = await getDoc(doc(db, 'tenants', tenantId, 'inventario_metrologico', id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error in instrumentsService.getInstrumentById:", error);
      throw error;
    }
  }
};
