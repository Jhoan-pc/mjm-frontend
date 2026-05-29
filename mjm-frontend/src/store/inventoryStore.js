import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc,
  query, 
  where, 
  onSnapshot,
  orderBy,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from './authStore';

const generateActivitiesForInstrument = async (tenantId, instrumentId, instrumentData) => {
  const rutinas = instrumentData.rutinas || {};
  
  // 1. Fetch all existing 'todo' activities for this instrument (by instrumentId to avoid composite index errors)
  let existingActivities = [];
  try {
    const q = query(
      collection(db, 'activities'),
      where('instrumentId', '==', instrumentId)
    );
    const snap = await getDocs(q);
    existingActivities = snap.docs
      .filter(docSnap => docSnap.data().estado === 'todo' && docSnap.data().tenantId === tenantId)
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.error("Error fetching old activities (sync aborted to prevent duplicates):", err);
    return;
  }

  // 2. Generate expected activities based on current routines
  const routineKeys = ['calibracion', 'verificacion', 'mantenimiento', 'calificacion'];
  const routineLabels = {
    calibracion: 'Calibración',
    verificacion: 'Verificación',
    mantenimiento: 'Mantenimiento',
    calificacion: 'Calificación'
  };

  const expectedActivities = [];

  for (const key of routineKeys) {
    if (rutinas[key]) {
      const freqMonths = Number(rutinas[`${key}_frecuencia`]) || 12;
      const startDateStr = rutinas[`${key}_fecha_inicial`];
      if (!startDateStr) continue;

      const [year, month, day] = startDateStr.split('-').map(Number);
      const current = new Date(year, month - 1, day);
      
      const years = Number(rutinas[`${key}_anos`]) || 5;
      const count = Math.max(1, Math.floor((years * 12) / freqMonths));

      for (let i = 0; i < count; i++) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const dVal = String(current.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dVal}`;

        const isLast = (i === count - 1);

        const activityData = {
          tenantId,
          instrumentId,
          instrumentNombre: instrumentData.nombre || 'Instrumento',
          codigoMJM: instrumentData.codigo || instrumentData.codigoMJM || '',
          tipo: routineLabels[key],
          estado: 'todo',
          fechaProgramada: dateStr,
          priority: instrumentData.riesgo_operativo === 'Alta' || instrumentData.riesgo_operativo === 'Crítica' ? 'high' : 'medium',
        };

        if (isLast) {
          activityData.is_last_of_5_years = true;
        }

        expectedActivities.push(activityData);

        // Safe Date increment to handle month overflow and leap years
        const expectedMonth = current.getMonth() + freqMonths;
        const targetDate = new Date(year, month - 1, day);
        targetDate.setMonth(expectedMonth);
        // If date overflowed (e.g., March 31 + 1 month became May 1), snap back to end of correct month
        if (targetDate.getMonth() % 12 !== (expectedMonth % 12 + 12) % 12) {
          targetDate.setDate(0); // set to last day of previous month
        }
        current.setTime(targetDate.getTime());
      }
    }
  }

  // 3. Sync Logic (Create new, update existing, delete obsolete)
  try {
    const promises = [];
    
    for (const expected of expectedActivities) {
      // Find matching existing activity
      const matchIndex = existingActivities.findIndex(act => 
        act.tipo === expected.tipo && act.fechaProgramada === expected.fechaProgramada
      );

      if (matchIndex >= 0) {
        // Update existing to sync names/IDs just in case they changed
        const actId = existingActivities[matchIndex].id;
        promises.push(updateDoc(doc(db, 'activities', actId), {
          instrumentNombre: expected.instrumentNombre,
          codigoMJM: expected.codigoMJM,
          priority: expected.priority
        }));
        // Remove from list so it doesn't get deleted
        existingActivities.splice(matchIndex, 1);
      } else {
        // Create new
        promises.push(addDoc(collection(db, 'activities'), {
          ...expected,
          createdAt: new Date().toISOString()
        }));
      }
    }

    // 4. Delete remaining 'todo' activities that are no longer expected
    for (const leftover of existingActivities) {
      promises.push(deleteDoc(doc(db, 'activities', leftover.id)));
    }

    await Promise.all(promises);
  } catch (err) {
    console.error("Error during activities sync:", err);
  }
};

export const useInventoryStore = create((set, get) => ({
  instruments: [],
  activities: [],
  loading: false,

  // --- INSTRUMENTOS ---
  loadInstruments: (tenantId) => {
    set({ loading: true });
    // Ruta corregida para Multi-Tenant: tenants/ID/inventario_metrologico
    const q = query(collection(db, 'tenants', tenantId, 'inventario_metrologico'));
    
    // 🛡️ Snapshot con manejo de errores para el Sandbox
    return onSnapshot(q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set({ instruments: docs, loading: false });
      },
      (error) => {
        console.warn("🔔 Nota: Usando datos de respaldo (Sandbox Mode)", error.message);
        // Si falla la base de datos real, cargamos ejemplos para no dejar la pantalla en blanco
        set({ 
          instruments: [
            { id: 'm1', nombre: 'Micrómetro Digital', codigoMJM: 'MET-MD-001', estado: 'Activo', marca: 'Mitutoyo', tenantId },
            { id: 'm2', nombre: 'Pie de Rey', codigoMJM: 'MET-PR-042', estado: 'Vencido', marca: 'Mahr', tenantId },
            { id: 'm3', nombre: 'Manómetro de Patrón', codigoMJM: 'MET-MN-009', estado: 'Activo', marca: 'Wika', tenantId },
          ], 
          loading: false 
        });
      }
    );
  },

  getInstrumentFromFirestore: async (id) => {
    const tenantId = useAuthStore.getState().tenant?.id;
    if (!tenantId) return null;
    try {
      const docRef = doc(db, 'tenants', tenantId, 'inventario_metrologico', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (e) {
      console.error("Error getting instrument from firestore:", e);
    }
    return null;
  },

  addInstrument: async (tenantIdOrData, instrumentData) => {
    let tenantId;
    let data;
    if (typeof tenantIdOrData === 'string') {
      tenantId = tenantIdOrData;
      data = instrumentData || {};
    } else {
      data = tenantIdOrData || {};
      tenantId = data.tenantId || useAuthStore.getState().tenant?.id;
    }

    try {
      const docRef = await addDoc(collection(db, 'tenants', tenantId, 'inventario_metrologico'), {
        ...data,
        tolerancia_proceso: Number(data.tolerancia_proceso) || 0,
        riesgo_operativo: data.riesgo_operativo || 'Baja',
        intervalo_confirmacion: data.intervalo_confirmacion || 12,
        createdAt: serverTimestamp(),
        lastStatus: 'Nuevo'
      });

      // Auto-schedule 5 years of activities
      await generateActivitiesForInstrument(tenantId, docRef.id, data);

      return docRef.id;
    } catch (e) {
      console.error("Error adding instrument: ", e);
    }
  },

  // --- ACTIVIDADES (KANBAN) ---
  loadActivities: (tenantId) => {
    const q = query(
      collection(db, 'activities'), 
      where('tenantId', '==', tenantId)
    );
    
    return onSnapshot(q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set({ activities: docs });
      },
      (error) => {
        console.warn("🔔 Nota: Cargando Tablero Demo (Sandbox)", error.message);
        set({ 
          activities: [
            { id: 'a1', instrumentNombre: 'Micrómetro Digital', codigoMJM: 'MET-MD-001', estado: 'todo', tipo: 'Calibración', fechaProgramada: '2026-06-15', tenantId },
            { id: 'a2', instrumentNombre: 'Manómetro de Patrón', codigoMJM: 'MET-MN-009', estado: 'doing', tipo: 'Mantenimiento', fechaProgramada: '2026-05-20', progreso: 45, tenantId },
            { id: 'a3', instrumentNombre: 'Termómetro Infrarrojo', codigoMJM: 'MET-TI-012', estado: 'done', tipo: 'Verificación', fechaProgramada: '2026-05-10', declaracion_conformidad: 'Conforme', tenantId },
          ]
        });
      }
    );
  },

  addActivity: async (activityData) => {
    try {
      await addDoc(collection(db, 'activities'), {
        ...activityData,
        estado: 'todo',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding activity: ", e);
    }
  },

  // Actualización con Lógica Metrológica
  updateActivityStatus: async (activityId, status, extraFields = null) => {
    const updateData = { estado: status };
    if (extraFields) {
      Object.assign(updateData, extraFields);
    }
    if (status === 'done') {
      updateData.finishedAt = new Date().toISOString();
    }
    
    try {
      const actRef = doc(db, 'activities', activityId);
      await updateDoc(actRef, updateData);
    } catch (e) {
      console.warn("🔔 Store: Actualizando estado de actividad localmente (Sandbox Mode)", e.message);
      set(state => ({
        activities: state.activities.map(act => 
          act.id === activityId ? { ...act, ...updateData } : act
        )
      }));
    }
  },

  // --- ACTUALIZAR INSTRUMENTO (PERSISTENCIA) ---
  updateInstrument: async (tenantId, instrumentId, data) => {
    set({ loading: true });
    try {
      const docRef = doc(db, 'tenants', tenantId, 'inventario_metrologico', instrumentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      // Actualizar estado local (Reactividad inmediata)
      set(state => ({
        instruments: state.instruments.map(inst => 
          inst.id === instrumentId ? { ...inst, ...data } : inst
        ),
        loading: false
      }));

      // Auto-schedule if routines or identifying info changed
      if (data.rutinas || data.nombre || data.codigoMJM || data.codigo || data.riesgo_operativo) {
        const fullInst = await get().getInstrumentFromFirestore(instrumentId);
        if (fullInst) {
          await generateActivitiesForInstrument(tenantId, instrumentId, fullInst);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error updating instrument:", error);
      set({ loading: false });
      return false;
    }
  }
}));
