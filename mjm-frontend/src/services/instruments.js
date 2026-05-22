import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const instrumentsService = {
  getInstrumentById: async (id) => {
    try {
      const snap = await getDoc(doc(db, 'inventario_metrologico', id));
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
