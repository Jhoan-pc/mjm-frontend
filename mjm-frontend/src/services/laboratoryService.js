import { 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

// 🏢 Catálogo Base de Laboratorios y Proveedores de Servicio MJM
export const DEFAULT_LABORATORIES = [
  { id: 'lab-mjm', nombre: 'Laboratorio Metrológico MJM', tipo: 'Acreditado', especialidad: 'Multivariable (Longitud, Presión, Masa, Tª)' },
  { id: 'lab-fluke', nombre: 'Fluke Corporation / Fluke Biomedical', tipo: 'Acreditado', especialidad: 'Electricidad, Electrónica & Calibradores' },
  { id: 'lab-megger', nombre: 'Megger Colombia', tipo: 'Trazable', especialidad: 'Aislamiento y Pruebas Eléctricas' },
  { id: 'lab-skf', nombre: 'SKF / FAG Reliability Services', tipo: 'Taller', especialidad: 'Vibraciones, Alineación Láser & Monitoreo' },
  { id: 'lab-easylaser', nombre: 'Easy-Laser Alineación Industrial', tipo: 'Taller', especialidad: 'Alineación de Ejes & Geometría Láser' },
  { id: 'lab-flir', nombre: 'FLIR Systems Termografía', tipo: 'Acreditado', especialidad: 'Cámaras Térmicas e Infrarrojo' },
  { id: 'lab-adash', nombre: 'Adash Colombia', tipo: 'Taller', especialidad: 'Analizadores de Vibración Dinámica' },
  { id: 'lab-deltatrak', nombre: 'DeltaTrak Services', tipo: 'Acreditado', especialidad: 'Cadena de Frío, Data Loggers & Tª' },
  { id: 'lab-trumax', nombre: 'Trumax Metrología & Pesaje', tipo: 'Acreditado', especialidad: 'Básculas, Balanzas & Masas Patrón' },
  { id: 'lab-inm', nombre: 'Instituto Nacional de Metrología (INM)', tipo: 'Acreditado', especialidad: 'Custodia de Patrones Nacionales' },
  { id: 'lab-planta', nombre: 'Taller Técnico Interno de Planta', tipo: 'Taller', especialidad: 'Mantenimiento Mecánico y Eléctrico' }
];

const getEphemeralLabs = () => {
  try {
    return JSON.parse(sessionStorage.getItem('mjm_demo_custom_labs') || '[]');
  } catch (_) {
    return [];
  }
};

export const laboratoryService = {
  /**
   * Obtiene la lista de laboratorios y proveedores disponibles para el tenant.
   * Si la colección está vacía en Firestore, la inicializa con el catálogo base.
   */
  getLaboratories: async (tenantId) => {
    const targetTenantId = tenantId || useAuthStore.getState().tenant?.id || 'sandboxdemo';
    const isDemo = useAuthStore.getState().isDemoMode;

    if (isDemo) {
      const customLabs = getEphemeralLabs();
      return [...customLabs, ...DEFAULT_LABORATORIES];
    }

    try {
      const labsRef = collection(db, 'tenants', targetTenantId, 'laboratorios');
      const snap = await getDocs(labsRef);

      if (snap.empty) {
        // Sembrar catálogo inicial en Firestore para este tenant en segundo plano
        DEFAULT_LABORATORIES.forEach(async (lab) => {
          try {
            await addDoc(labsRef, {
              nombre: lab.nombre,
              tipo: lab.tipo,
              especialidad: lab.especialidad,
              createdAt: serverTimestamp()
            });
          } catch (_) {}
        });
        return DEFAULT_LABORATORIES;
      }

      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn("Aviso al consultar laboratorios de Firestore:", err.message);
      return DEFAULT_LABORATORIES;
    }
  },

  /**
   * Registra un nuevo laboratorio o taller ejecutor en base de datos.
   */
  addLaboratory: async (tenantId, labData) => {
    const targetTenantId = tenantId || useAuthStore.getState().tenant?.id || 'sandboxdemo';
    const isDemo = useAuthStore.getState().isDemoMode;

    const newLab = {
      nombre: labData.nombre.trim(),
      tipo: labData.tipo || 'Acreditado',
      especialidad: labData.especialidad || 'Metrología y Servicio Técnico'
    };

    if (isDemo) {
      const localId = `demo_lab_${Date.now()}`;
      const labWithId = { id: localId, ...newLab };
      const current = getEphemeralLabs();
      sessionStorage.setItem('mjm_demo_custom_labs', JSON.stringify([labWithId, ...current]));
      return labWithId;
    }

    try {
      const labsRef = collection(db, 'tenants', targetTenantId, 'laboratorios');
      const docRef = await addDoc(labsRef, {
        ...newLab,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...newLab };
    } catch (err) {
      console.error("Error al registrar laboratorio en Firestore:", err);
      return { id: `local_${Date.now()}`, ...newLab };
    }
  }
};
