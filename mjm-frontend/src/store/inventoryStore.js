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
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from './authStore';

// ─── HELPER: GENERAR ACTIVIDADES A 5 AÑOS SEGÚN RUTINAS ────────────────────
export const buildExpectedActivities = (tenantId, instrumentId, instrumentData) => {
  const rutinas = instrumentData.rutinas || {};
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

        // Safe Date increment
        const expectedMonth = current.getMonth() + freqMonths;
        const targetDate = new Date(year, month - 1, day);
        targetDate.setMonth(expectedMonth);
        if (targetDate.getMonth() % 12 !== (expectedMonth % 12 + 12) % 12) {
          targetDate.setDate(0);
        }
        current.setTime(targetDate.getTime());
      }
    }
  }

  return expectedActivities;
};

// Sincronización real con Firestore (solo para SuperAdmin o Clientes reales)
const syncActivitiesInFirestore = async (tenantId, instrumentId, instrumentData) => {
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
    console.error("Error al obtener actividades previas:", err);
    return;
  }

  const expectedActivities = buildExpectedActivities(tenantId, instrumentId, instrumentData);

  try {
    const promises = [];
    for (const expected of expectedActivities) {
      const matchIndex = existingActivities.findIndex(act => 
        act.tipo === expected.tipo && act.fechaProgramada === expected.fechaProgramada
      );

      if (matchIndex >= 0) {
        const actId = existingActivities[matchIndex].id;
        promises.push(updateDoc(doc(db, 'activities', actId), {
          instrumentNombre: expected.instrumentNombre,
          codigoMJM: expected.codigoMJM,
          priority: expected.priority
        }));
        existingActivities.splice(matchIndex, 1);
      } else {
        promises.push(addDoc(collection(db, 'activities'), {
          ...expected,
          createdAt: new Date().toISOString()
        }));
      }
    }

    for (const leftover of existingActivities) {
      promises.push(deleteDoc(doc(db, 'activities', leftover.id)));
    }

    await Promise.all(promises);
  } catch (err) {
    console.error("Error al sincronizar actividades en Firestore:", err);
  }
};

// ─── HELPERS DE CAPA EFÍMERA (SESSION-SCOPED SANDBOX) ──────────────────────
const getEphemeralCustomInstruments = () => {
  try {
    return JSON.parse(sessionStorage.getItem('mjm_demo_custom_instruments') || '[]');
  } catch (_) {
    return [];
  }
};

const getEphemeralCustomActivities = () => {
  try {
    return JSON.parse(sessionStorage.getItem('mjm_demo_custom_activities') || '[]');
  } catch (_) {
    return [];
  }
};

const getEphemeralInstUpdates = () => {
  try {
    return JSON.parse(sessionStorage.getItem('mjm_demo_inst_updates') || '{}');
  } catch (_) {
    return {};
  }
};

const getEphemeralActUpdates = () => {
  try {
    return JSON.parse(sessionStorage.getItem('mjm_demo_act_updates') || '{}');
  } catch (_) {
    return {};
  }
};

// ─── ZUSTAND STORE ─────────────────────────────────────────────────────────
export const useInventoryStore = create((set, get) => ({
  instruments: [],
  activities: [],
  loading: false,

  // 🧹 Limpieza de toda la capa efímera al cerrar sesión
  resetDemoData: () => {
    sessionStorage.removeItem('mjm_demo_custom_instruments');
    sessionStorage.removeItem('mjm_demo_custom_activities');
    sessionStorage.removeItem('mjm_demo_inst_updates');
    sessionStorage.removeItem('mjm_demo_act_updates');
    set({ instruments: [], activities: [], loading: false });
  },

  // ─── CARGAR INSTRUMENTOS ───
  loadInstruments: (tenantId) => {
    set({ loading: true });
    const targetTenantId = tenantId || 'sandboxdemo';
    const isDemo = useAuthStore.getState().isDemoMode;

    const q = query(collection(db, 'tenants', targetTenantId, 'inventario_metrologico'));
    
    return onSnapshot(q, 
      (snapshot) => {
        let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Si estamos en Modo Demo, fusionar con la memoria efímera de sesión
        if (isDemo) {
          const customInsts = getEphemeralCustomInstruments();
          const instUpdates = getEphemeralInstUpdates();

          // Aplicar actualizaciones locales
          docs = docs.map(item => instUpdates[item.id] ? { ...item, ...instUpdates[item.id] } : item);

          // Agregar equipos creados en esta sesión
          docs = [...customInsts, ...docs];
        }

        set({ instruments: docs, loading: false });
      },
      (error) => {
        console.warn("Aviso: Error de lectura en Firestore, usando respaldo en memoria:", error.message);
        set({ loading: false });
      }
    );
  },

  // ─── OBTENER INSTRUMENTO INDIVIDUAL (HOJA DE VIDA) ───
  getInstrumentFromFirestore: async (id) => {
    // 1. Primero revisar en la memoria reactiva local (vital para equipos efímeros del demo)
    const local = get().instruments.find(i => i.id === id);
    if (local) return local;

    // 2. Si no está en memoria, consultar Firestore
    const tenantId = useAuthStore.getState().tenant?.id || 'sandboxdemo';
    try {
      const docRef = doc(db, 'tenants', tenantId, 'inventario_metrologico', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const instUpdates = getEphemeralInstUpdates();
        const data = { id: docSnap.id, ...docSnap.data() };
        return instUpdates[id] ? { ...data, ...instUpdates[id] } : data;
      }
    } catch (e) {
      console.error("Error al obtener instrumento desde Firestore:", e);
    }
    return null;
  },

  // ─── AGREGAR INSTRUMENTO ───
  addInstrument: async (tenantIdOrData, instrumentData) => {
    let tenantId;
    let data;
    if (typeof tenantIdOrData === 'string') {
      tenantId = tenantIdOrData;
      data = instrumentData || {};
    } else {
      data = tenantIdOrData || {};
      tenantId = data.tenantId || useAuthStore.getState().tenant?.id || 'sandboxdemo';
    }

    const isDemo = useAuthStore.getState().isDemoMode;

    // ⚡ MODO DEMO EFÍMERO: Guardar en memoria de sesión, NO escribir en Firestore
    if (isDemo) {
      const localId = `demo_inst_${Date.now()}`;
      const newInst = {
        id: localId,
        tenantId: 'sandboxdemo',
        ...data,
        tolerancia_proceso: Number(data.tolerancia_proceso) || 0,
        riesgo_operativo: data.riesgo_operativo || 'Media',
        intervalo_confirmacion: Number(data.intervalo_confirmacion) || 12,
        createdAt: new Date().toISOString(),
        lastStatus: 'Activo',
        isEphemeral: true
      };

      // Generar sus 5 años de actividades metrológicas en memoria
      const generatedActs = buildExpectedActivities('sandboxdemo', localId, newInst).map((act, idx) => ({
        id: `demo_act_${Date.now()}_${idx}`,
        ...act,
        createdAt: new Date().toISOString(),
        isEphemeral: true
      }));

      // Guardar en sessionStorage para sobrevivir navegaciones entre páginas
      try {
        const currentCustomInsts = getEphemeralCustomInstruments();
        sessionStorage.setItem('mjm_demo_custom_instruments', JSON.stringify([newInst, ...currentCustomInsts]));

        const currentCustomActs = getEphemeralCustomActivities();
        sessionStorage.setItem('mjm_demo_custom_activities', JSON.stringify([...generatedActs, ...currentCustomActs]));
      } catch (_) {}

      // Actualizar estado Zustand de inmediato
      set(state => ({
        instruments: [newInst, ...state.instruments],
        activities: [...generatedActs, ...state.activities]
      }));

      return localId;
    }

    // 🏢 MODO REAL (SuperAdmin MJM o Cliente): Guardar permanentemente en Firestore
    try {
      const docRef = await addDoc(collection(db, 'tenants', tenantId, 'inventario_metrologico'), {
        ...data,
        tolerancia_proceso: Number(data.tolerancia_proceso) || 0,
        riesgo_operativo: data.riesgo_operativo || 'Baja',
        intervalo_confirmacion: Number(data.intervalo_confirmacion) || 12,
        createdAt: serverTimestamp(),
        lastStatus: 'Activo'
      });

      await syncActivitiesInFirestore(tenantId, docRef.id, data);
      return docRef.id;
    } catch (e) {
      console.error("Error al agregar instrumento en Firestore:", e);
    }
  },

  // ─── CARGAR ACTIVIDADES (KANBAN & CRONOGRAMA) ───
  loadActivities: (tenantId) => {
    const targetTenantId = tenantId || 'sandboxdemo';
    const isDemo = useAuthStore.getState().isDemoMode;

    const q = query(
      collection(db, 'activities'), 
      where('tenantId', '==', targetTenantId)
    );
    
    return onSnapshot(q, 
      (snapshot) => {
        let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Si estamos en Modo Demo, fusionar con las actividades de sesión
        if (isDemo) {
          const customActs = getEphemeralCustomActivities();
          const actUpdates = getEphemeralActUpdates();

          docs = docs.map(act => actUpdates[act.id] ? { ...act, ...actUpdates[act.id] } : act);
          docs = [...customActs, ...docs];
        }

        set({ activities: docs });
      },
      (error) => {
        console.warn("Aviso: Error al cargar actividades en tiempo real:", error.message);
      }
    );
  },

  // ─── AGREGAR ACTIVIDAD MANUAL ───
  addActivity: async (activityData) => {
    const isDemo = useAuthStore.getState().isDemoMode;
    const targetTenantId = activityData.tenantId || useAuthStore.getState().tenant?.id || 'sandboxdemo';

    if (isDemo) {
      const localAct = {
        id: `demo_act_${Date.now()}`,
        ...activityData,
        tenantId: 'sandboxdemo',
        estado: 'todo',
        createdAt: new Date().toISOString(),
        isEphemeral: true
      };

      try {
        const customActs = getEphemeralCustomActivities();
        sessionStorage.setItem('mjm_demo_custom_activities', JSON.stringify([localAct, ...customActs]));
      } catch (_) {}

      set(state => ({ activities: [localAct, ...state.activities] }));
      return;
    }

    try {
      await addDoc(collection(db, 'activities'), {
        ...activityData,
        tenantId: targetTenantId,
        estado: 'todo',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding activity: ", e);
    }
  },

  // ─── ACTUALIZAR ESTADO DE ACTIVIDAD (EJECUCIÓN METROLÓGICA) ───
  updateActivityStatus: async (activityId, status, extraFields = null) => {
    const isDemo = useAuthStore.getState().isDemoMode;
    const updateData = { estado: status };
    if (extraFields) {
      Object.assign(updateData, extraFields);
    }
    if (status === 'done') {
      updateData.finishedAt = new Date().toISOString();
    }
    
    const activity = get().activities.find(a => a.id === activityId);
    const instrumentId = activity?.instrumentId;
    const tenantId = activity?.tenantId || useAuthStore.getState().tenant?.id || 'sandboxdemo';
    
    let newLog = null;
    if (status === 'done' && instrumentId) {
      const declaracion = updateData.declaracion_conformidad || updateData.conformidad_metrologica || 'Conforme';
      newLog = {
        fecha: updateData.fecha_ejecucion || new Date().toISOString().split('T')[0],
        tipo: activity?.tipo || 'Calibración',
        laboratorio: updateData.laboratorio_ejecutor || updateData.laboratorio || 'Laboratorio Metrológico MJM',
        error: updateData.error_encontrado !== undefined && updateData.error_encontrado !== null ? updateData.error_encontrado : 0.00,
        incertidumbre: updateData.incertidumbre_medicion !== undefined && updateData.incertidumbre_medicion !== null 
          ? updateData.incertidumbre_medicion 
          : (updateData.incertidumbre !== undefined && updateData.incertidumbre !== null ? updateData.incertidumbre : 0.00),
        certificado: updateData.certificado || updateData.certificado_numero || (updateData.certificado_url ? 'CERT-REGISTRADO' : 'CERT-INT-001'),
        certificado_url: updateData.certificado_url || null,
        declaracion_conformidad: declaracion,
        conformidad_metrologica: declaracion,
        patron_referencia: updateData.patron_referencia || null
      };
    }
    
    // ⚡ MODO DEMO EFÍMERO: Guardar ejecución en sesión
    if (isDemo) {
      try {
        const actUpdates = getEphemeralActUpdates();
        actUpdates[activityId] = { ...(actUpdates[activityId] || {}), ...updateData };
        sessionStorage.setItem('mjm_demo_act_updates', JSON.stringify(actUpdates));

        if (newLog && instrumentId) {
          const instUpdates = getEphemeralInstUpdates();
          const existingInst = get().instruments.find(i => i.id === instrumentId);
          const currentHistorial = existingInst?.historial || [];
          instUpdates[instrumentId] = {
            ...(instUpdates[instrumentId] || {}),
            historial: [newLog, ...currentHistorial],
            lastStatus: newLog.declaracion_conformidad === 'Conforme' ? 'Activo' : 'No Conforme'
          };
          sessionStorage.setItem('mjm_demo_inst_updates', JSON.stringify(instUpdates));
        }
      } catch (_) {}

      set(state => {
        const updatedActivities = state.activities.map(act => 
          act.id === activityId ? { ...act, ...updateData } : act
        );
        
        let updatedInstruments = state.instruments;
        if (newLog) {
          updatedInstruments = state.instruments.map(inst => {
            if (inst.id === instrumentId) {
              const currentHistorial = inst.historial || [];
              return {
                ...inst,
                historial: [newLog, ...currentHistorial],
                lastStatus: newLog.declaracion_conformidad === 'Conforme' ? 'Activo' : 'No Conforme'
              };
            }
            return inst;
          });
        }
        
        return {
          activities: updatedActivities,
          instruments: updatedInstruments
        };
      });
      return;
    }

    // 🏢 MODO REAL: Actualizar permanentemente en Firestore
    try {
      const actRef = doc(db, 'activities', activityId);
      await updateDoc(actRef, updateData);
      
      if (newLog && tenantId) {
        const instRef = doc(db, 'tenants', tenantId, 'inventario_metrologico', instrumentId);
        const instSnap = await getDoc(instRef);
        if (instSnap.exists()) {
          const currentHistorial = instSnap.data().historial || [];
          const newStatus = (newLog.declaracion_conformidad === 'Conforme' || newLog.conformidad_metrologica === 'Conforme') ? 'Activo' : 'No Conforme';
          await updateDoc(instRef, {
            historial: [newLog, ...currentHistorial],
            lastStatus: newStatus,
            estado: newStatus
          });
        }
      }

      // Sincronizar estado local en memoria de Zustand para reactividad instantánea en la UI
      set(state => ({
        activities: state.activities.map(act => act.id === activityId ? { ...act, ...updateData } : act),
        instruments: state.instruments.map(inst => {
          if (inst.id === instrumentId && newLog) {
            const currentHistorial = inst.historial || [];
            const newStatus = (newLog.declaracion_conformidad === 'Conforme' || newLog.conformidad_metrologica === 'Conforme') ? 'Activo' : 'No Conforme';
            return {
              ...inst,
              historial: [newLog, ...currentHistorial],
              lastStatus: newStatus,
              estado: newStatus
            };
          }
          return inst;
        })
      }));
    } catch (e) {
      console.warn("Aviso al actualizar en Firestore:", e.message);
    }
  },

  // ─── ACTUALIZAR INSTRUMENTO ───
  updateInstrument: async (tenantId, instrumentId, data) => {
    const isDemo = useAuthStore.getState().isDemoMode;

    if (isDemo) {
      try {
        const instUpdates = getEphemeralInstUpdates();
        instUpdates[instrumentId] = { ...(instUpdates[instrumentId] || {}), ...data };
        sessionStorage.setItem('mjm_demo_inst_updates', JSON.stringify(instUpdates));
      } catch (_) {}

      set(state => ({
        instruments: state.instruments.map(inst => 
          inst.id === instrumentId ? { ...inst, ...data } : inst
        )
      }));
      return true;
    }

    set({ loading: true });
    try {
      const docRef = doc(db, 'tenants', tenantId, 'inventario_metrologico', instrumentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      set(state => ({
        instruments: state.instruments.map(inst => 
          inst.id === instrumentId ? { ...inst, ...data } : inst
        ),
        loading: false
      }));

      if (data.rutinas || data.nombre || data.codigoMJM || data.codigo || data.riesgo_operativo) {
        const fullInst = await get().getInstrumentFromFirestore(instrumentId);
        if (fullInst) {
          await syncActivitiesInFirestore(tenantId, instrumentId, fullInst);
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
