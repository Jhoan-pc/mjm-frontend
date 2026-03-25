import { create } from 'zustand';
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, where, onSnapshot, serverTimestamp, orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── Mock Data para desarrollo sin Firestore configurado ───────────────────
const MOCK_INSTRUMENTS = [
  {
    id: 'inst-001', codigoMJM: 'MJM-2024-001', tenantId: 't1',
    nombre: 'Micrómetro Digital', marca: 'Mitutoyo', modelo: '293-340-30',
    serie: 'MT-00192', codigoInterno: 'MC-LAB-01', resolucion: '0.001 mm',
    capacidadMaxima: '25 mm', magnitud: 'Longitud', criticidad: 'Alta',
    anioAdquisicion: 2022, proveedor: 'Instrumentación Técnica SAS',
    accesorios: 'Estuche, certificado', ubicacion: 'Laboratorio A / Área de Metrología / Banco 3',
    jerarquia: { cliente: 't1', pais: 'Colombia', planta: 'Bogotá Norte', area: 'Calidad', proceso: 'Metrología', ubicacion: 'Banco 3' },
    estado: 'Vigente', proximaCalibracion: '2025-06-15', ultimaCalibracion: '2024-12-15',
    rutinas: ['Calibración', 'Verificación'],
    historial: [
      { id: 'h1', tipo: 'Calibración', fecha: '2024-12-15', laboratorio: 'CERTLAB S.A.S', certificado: 'CL-2024-4521', resultado: 'Aprobado', observaciones: 'Dentro de tolerancias' },
      { id: 'h2', tipo: 'Calibración', fecha: '2024-06-10', laboratorio: 'CERTLAB S.A.S', certificado: 'CL-2024-3210', resultado: 'Aprobado', observaciones: '' },
    ]
  },
  {
    id: 'inst-002', codigoMJM: 'MJM-2024-002', tenantId: 't1',
    nombre: 'Calibrador de Presión Digital', marca: 'Fluke', modelo: '700G29',
    serie: 'FL-88432', codigoInterno: 'PR-SIS-07', resolucion: '0.01 kPa',
    capacidadMaxima: '2000 kPa', magnitud: 'Presión', criticidad: 'Crítica',
    anioAdquisicion: 2021, proveedor: 'MJM SAS', accesorios: 'Adaptadores NPT',
    ubicacion: 'Sala de Compresores / Proceso Principal / Pt-12',
    jerarquia: { cliente: 't1', pais: 'Colombia', planta: 'Bogotá Norte', area: 'Producción', proceso: 'Compresión', ubicacion: 'Pt-12' },
    estado: 'Próximo Vencimiento', proximaCalibracion: '2025-04-01', ultimaCalibracion: '2024-10-01',
    rutinas: ['Calibración', 'Mantenimiento'],
    historial: [
      { id: 'h3', tipo: 'Mantenimiento', fecha: '2024-11-20', laboratorio: 'Interno MJM', certificado: 'N/A', resultado: 'Completado', observaciones: 'Limpieza y ajuste de cero' },
    ]
  },
  {
    id: 'inst-003', codigoMJM: 'MJM-2023-005', tenantId: 't1',
    nombre: 'Termómetro de Infrarrojos', marca: 'HIOKI', modelo: 'FT3701',
    serie: 'HI-21053', codigoInterno: 'TMP-PR-03', resolucion: '0.1 °C',
    capacidadMaxima: '1000 °C', magnitud: 'Temperatura', criticidad: 'Normal',
    anioAdquisicion: 2023, proveedor: 'Instrumentación Técnica SAS', accesorios: '',
    ubicacion: 'Horno 2 / Área Thermal / Sensor 01',
    jerarquia: { cliente: 't1', pais: 'Colombia', planta: 'Bogotá Sur', area: 'Termofluidos', proceso: 'Tratamiento Térmico', ubicacion: 'Sensor 01' },
    estado: 'Vencido', proximaCalibracion: '2025-01-30', ultimaCalibracion: '2024-07-30',
    rutinas: ['Calibración', 'Verificación', 'Calificación'],
    historial: []
  },
  {
    id: 'inst-004', codigoMJM: 'MJM-2024-010', tenantId: 't1',
    nombre: 'Balanza Analítica', marca: 'Mettler Toledo', modelo: 'ME204',
    serie: 'MT-A-66101', codigoInterno: 'BAL-LAB-02', resolucion: '0.0001 g',
    capacidadMaxima: '220 g', magnitud: 'Masa', criticidad: 'Alta',
    anioAdquisicion: 2024, proveedor: 'Mettler Toledo Colombia', accesorios: 'Pesas certificadas F1',
    ubicacion: 'Laboratorio Fisicoquímico / Área Pesaje / Mesa 2',
    jerarquia: { cliente: 't1', pais: 'Colombia', planta: 'Bogotá Norte', area: 'Calidad', proceso: 'Control Fisicoquímico', ubicacion: 'Mesa 2' },
    estado: 'Vigente', proximaCalibracion: '2026-01-10', ultimaCalibracion: '2025-01-10',
    rutinas: ['Calibración'],
    historial: []
  }
];

const MOCK_ACTIVITIES = [
  { id: 'act-001', instrumentId: 'inst-002', instrumentNombre: 'Calibrador de Presión Digital', codigoMJM: 'MJM-2024-002', tipo: 'Calibración', cliente: 'Industrias Alfa', fechaProgramada: '2025-04-01', estado: 'todo', prioridad: 'Alta', evidencias: [], observaciones: '' },
  { id: 'act-002', instrumentId: 'inst-001', instrumentNombre: 'Micrómetro Digital', codigoMJM: 'MJM-2024-001', tipo: 'Verificación', cliente: 'Industrias Alfa', fechaProgramada: '2025-04-10', estado: 'todo', prioridad: 'Normal', evidencias: [], observaciones: '' },
  { id: 'act-003', instrumentId: 'inst-003', instrumentNombre: 'Termómetro de Infrarrojos', codigoMJM: 'MJM-2023-005', tipo: 'Calibración', cliente: 'Industrias Alfa', fechaProgramada: '2025-03-28', estado: 'doing', prioridad: 'Crítica', evidencias: [], observaciones: 'En proceso con laboratorio externo' },
  { id: 'act-004', instrumentId: 'inst-004', instrumentNombre: 'Balanza Analítica', codigoMJM: 'MJM-2024-010', tipo: 'Calibración', cliente: 'Industrias Alfa', fechaProgramada: '2025-03-15', estado: 'done', prioridad: 'Alta', evidencias: ['foto1.jpg'], observaciones: 'Calibración exitosa sin ajuste requerido', fechaRealizacion: '2025-03-15', archivada: false },
];

// ─── Store Principal ───────────────────────────────────────────────────────
export const useInventoryStore = create((set, get) => ({
  instruments: MOCK_INSTRUMENTS,
  activities: MOCK_ACTIVITIES,
  selectedInstrument: null,
  loading: false,
  error: null,

  // Cargar instrumentos por tenant
  loadInstruments: async (tenantId) => {
    set({ loading: true });
    try {
      const q = query(collection(db, 'instruments'), where('tenantId', '==', tenantId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const instruments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        set({ instruments, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (e) {
      console.warn('Usando datos mock:', e.message);
      set({ loading: false });
    }
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
      await addDoc(collection(db, 'instruments'), { ...newInst, createdAt: serverTimestamp() });
    } catch (e) { console.warn('Sin sync Firestore:', e.message); }
    return newInst;
  },

  // Agregar evento al historial de un instrumento
  addHistorialEntry: async (instrumentId, entry) => {
    const newEntry = { ...entry, id: `h-${Date.now()}`, fecha: entry.fecha || new Date().toISOString().split('T')[0] };
    set(s => ({
      instruments: s.instruments.map(i =>
        i.id === instrumentId ? { ...i, historial: [...(i.historial || []), newEntry] } : i
      ),
      selectedInstrument: s.selectedInstrument?.id === instrumentId
        ? { ...s.selectedInstrument, historial: [...(s.selectedInstrument.historial || []), newEntry] }
        : s.selectedInstrument
    }));
  },

  // Actividades y Kanban
  addActivity: (activityData) => {
    const newAct = { ...activityData, id: `act-${Date.now()}`, estado: 'todo', evidencias: [], archivada: false };
    set(s => ({ activities: [...s.activities, newAct] }));
  },

  moveActivity: (actId, newEstado) => {
    set(s => ({
      activities: s.activities.map(a => a.id === actId ? { ...a, estado: newEstado } : a)
    }));
  },

  closeActivity: (actId, closingData) => {
    set(s => ({
      activities: s.activities.map(a =>
        a.id === actId ? { ...a, estado: 'done', ...closingData } : a
      )
    }));
    // Registrar en historial del instrumento
    const act = get().activities.find(a => a.id === actId);
    if (act) {
      get().addHistorialEntry(act.instrumentId, {
        tipo: act.tipo, fecha: closingData.fechaRealizacion,
        laboratorio: closingData.laboratorio || 'Interno MJM',
        certificado: closingData.certificado || 'N/A',
        resultado: 'Completado', observaciones: closingData.observaciones
      });
    }
  },

  archiveActivity: (actId) => {
    set(s => ({
      activities: s.activities.map(a => a.id === actId ? { ...a, archivada: true } : a)
    }));
  },
}));
