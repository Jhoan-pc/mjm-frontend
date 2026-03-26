import { create } from 'zustand';
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc,
  query, where, onSnapshot, serverTimestamp, orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── Mock Data para desarrollo sin Firestore configurado ───────────────────
const MOCK_INSTRUMENTS = [];

const MOCK_ACTIVITIES = [];

// ─── Store Principal ───────────────────────────────────────────────────────
export const useInventoryStore = create((set, get) => ({
  instruments: [],
  activities: [],
  selectedInstrument: null,
  loading: false,
  error: null,
  unsubActivities: null,
  unsubInstruments: null,

  loadActivities: (tenantId, isSuperAdmin = false) => {
    const { unsubActivities } = get();
    if (unsubActivities) unsubActivities();

    set({ loading: true });
    
    const q = isSuperAdmin
      ? query(collection(db, 'activities'), orderBy('fechaProgramada', 'asc'))
      : query(collection(db, 'activities'), where('tenantId', '==', tenantId), orderBy('fechaProgramada', 'asc'));

    const unsubscribe = onSnapshot(q, (snap) => {
      const activities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      set({ activities, loading: false });
    }, (error) => {
      console.warn('⚠️ Fallo onSnapshot con índice, usando fallback:', error.message);
      // Fallback: sin orderBy
      const qFallback = isSuperAdmin
        ? collection(db, 'activities')
        : query(collection(db, 'activities'), where('tenantId', '==', tenantId));
      
      onSnapshot(qFallback, (snap) => {
        const activities = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.fechaProgramada || '').localeCompare(b.fechaProgramada || ''));
        set({ activities, loading: false });
      });
    });

    set({ unsubActivities: unsubscribe });
  },

  // Cargar instrumentos por tenant
  loadInstruments: (tenantId, isSuperAdmin = false) => {
    const { unsubInstruments } = get();
    if (unsubInstruments) unsubInstruments();

    set({ loading: true });

    const q = isSuperAdmin
      ? query(collection(db, 'inventario_metrologico'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'inventario_metrologico'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snap) => {
      const instruments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      set({ instruments, loading: false });
    }, (error) => {
      console.warn('⚠️ Fallo onSnapshot en inventario:', error.message);
      const qFallback = isSuperAdmin
        ? collection(db, 'inventario_metrologico')
        : query(collection(db, 'inventario_metrologico'), where('tenantId', '==', tenantId));
      
      onSnapshot(qFallback, (snap) => {
        const instruments = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() || 0;
            const tb = b.createdAt?.toMillis?.() || 0;
            return tb - ta;
          });
        set({ instruments, loading: false });
      });
    });

    set({ unsubInstruments: unsubscribe });
  },

  // Seleccionar instrumento activo (Hoja de Vida)
  selectInstrument: (id) => {
    const inst = get().instruments.find(i => i.id === id);
    set({ selectedInstrument: inst || null });
  },

  // Agregar instrumento
  addInstrument: async (data, tenantId) => {
    const newId = `MJM-${new Date().getFullYear()}-${String(get().instruments.length + 1).padStart(3, '0')}`;
    const newInst = { ...data, id: `local-${Date.now()}`, codigoMJM: newId, tenantId, historial: [], createdAt: new Date().toISOString() };
    set(s => ({ instruments: [...s.instruments, newInst] }));
    try {
      await addDoc(collection(db, 'inventario_metrologico'), { ...newInst, createdAt: serverTimestamp() });
    } catch (e) { console.warn('Sin sync Firestore:', e.message); }
    return newInst;
  },

  // Agregar evento al historial de un instrumento (y persistir en Firestore)
  addHistorialEntry: async (instrumentId, entry) => {
    const newEntry = { ...entry, id: `h-${Date.now()}`, fecha: entry.fecha || new Date().toISOString().split('T')[0] };
    // Capturar historial ANTES de set() para evitar doble escritura
    const instBefore = get().instruments.find(i => i.id === instrumentId);
    const previousHistorial = instBefore?.historial || [];
    const updatedHistorial = [...previousHistorial, newEntry];
    // 1. Actualizar estado local
    set(s => ({
      instruments: s.instruments.map(i =>
        i.id === instrumentId ? { ...i, historial: updatedHistorial } : i
      ),
    }));
    // 2. Persistir en Firestore con la lista correcta (sin duplicado)
    try {
      await updateDoc(doc(db, 'inventario_metrologico', instrumentId), {
        historial: updatedHistorial,
        lastUpdate: serverTimestamp()
      });
    } catch (e) { console.error('Error guardando historial en Firestore:', e); }
  },

  // Recargar un instrumento fresco desde Firestore (para Hoja de Vida)
  getInstrumentFromFirestore: async (instrumentId) => {
    try {
      const snap = await getDoc(doc(db, 'inventario_metrologico', instrumentId));
      if (snap.exists()) {
        const freshInst = { id: snap.id, ...snap.data() };
        set(s => ({
          instruments: s.instruments.some(i => i.id === instrumentId)
            ? s.instruments.map(i => i.id === instrumentId ? freshInst : i)
            : [...s.instruments, freshInst]
        }));
        return freshInst;
      }
    } catch (e) { console.error('Error recargando instrumento:', e); }
    return null;
  },

  // Actividades y Kanban
  addActivity: async (activityData) => {
    try {
      const docRef = await addDoc(collection(db, 'activities'), {
        ...activityData,
        estado: 'todo',
        evidencias: [],
        archivada: false,
        createdAt: serverTimestamp()
      });
      const newAct = { ...activityData, id: docRef.id, estado: 'todo', evidencias: [], archivada: false };
      set(s => ({ activities: [...s.activities, newAct] }));
      return docRef.id;
    } catch (e) {
      console.error('Error guardando actividad en Firestore:', e);
      throw e;
    }
  },

  // Mover tarjeta en Kanban (ej: todo → in_progress)
  moveActivity: async (actId, newEstado) => {
    // 1. Actualizar local inmediatamente (optimistic UI)
    set(s => ({
      activities: s.activities.map(a => a.id === actId ? { ...a, estado: newEstado } : a)
    }));
    // 2. Persistir en Firestore
    try {
      await updateDoc(doc(db, 'activities', actId), {
        estado: newEstado,
        lastUpdate: serverTimestamp()
      });
    } catch (e) { console.error('Error moviendo actividad en Firestore:', e); }
  },

  // Cerrar actividad con datos de cierre (fecha, laboratorio, certificado, etc.)
  closeActivity: async (actId, closingData) => {
    const closingPayload = {
      estado: 'done',
      fechaRealizacion: closingData.fechaRealizacion || new Date().toISOString().split('T')[0],
      laboratorio: closingData.laboratorio || 'Interno MJM',
      certificado: closingData.certificado || 'N/A',
      observaciones: closingData.observaciones || '',
      evidencias: closingData.evidencias || [],
      closedAt: new Date().toISOString(),
    };
    // 1. Actualizar local inmediatamente
    set(s => ({
      activities: s.activities.map(a => a.id === actId ? { ...a, ...closingPayload } : a)
    }));
    // 2. Persistir el cierre en la colección 'activities'
    try {
      await updateDoc(doc(db, 'activities', actId), {
        ...closingPayload,
        closedAt: serverTimestamp()
      });
    } catch (e) { console.error('Error cerrando actividad en Firestore:', e); }
    // 3. Registrar entrada en el historial del instrumento
    const act = get().activities.find(a => a.id === actId);
    if (act?.instrumentId) {
      await get().addHistorialEntry(act.instrumentId, {
        tipo: act.tipo,
        fecha: closingPayload.fechaRealizacion,
        laboratorio: closingPayload.laboratorio,
        certificado: closingPayload.certificado,
        resultado: 'Completado',
        observaciones: closingPayload.observaciones
      });
    }
  },

  // Archivar actividad
  archiveActivity: async (actId) => {
    // 1. Actualizar local
    set(s => ({
      activities: s.activities.map(a => a.id === actId ? { ...a, archivada: true } : a)
    }));
    // 2. Persistir en Firestore
    try {
      await updateDoc(doc(db, 'activities', actId), {
        archivada: true,
        archivedAt: serverTimestamp()
      });
    } catch (e) { console.error('Error archivando actividad en Firestore:', e); }
  },
}));
