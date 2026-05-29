import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Printer, 
  Edit3, 
  Info, 
  MapPin, 
  User, 
  Calendar, 
  Tag, 
  Barcode, 
  Activity, 
  LineChart, 
  ChevronRight,
  History,
  CheckCircle2,
  AlertCircle,
  FileText,
  Ruler,
  ArrowLeft,
  X
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';

const cleanUnitDisplay = (val) => {
  if (!val || val === 'N/A') return 'N/A';
  return String(val).replace(/\s*\([^)]*\)/g, '').trim();
};

const formatDateYYYYMMDD = (dateVal) => {
  if (!dateVal || dateVal === 'N/A') return 'N/A';
  try {
    if (typeof dateVal === 'string') {
      const match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }
    let d;
    if (dateVal && typeof dateVal === 'object' && typeof dateVal.seconds === 'number') {
      d = new Date(dateVal.seconds * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return String(dateVal);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return String(dateVal);
  }
};

export default function HojaDeVida() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instruments, loading, getInstrumentFromFirestore } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [inst, setInst] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfModalUrl, setPdfModalUrl] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const found = instruments.find(i => i.id === id);
      if (found) {
        setInst(found);
      } else {
        const fresh = await getInstrumentFromFirestore(id);
        setInst(fresh);
      }
    };
    loadData();
  }, [id, instruments, getInstrumentFromFirestore]);

  if (loading || !inst) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-label-caps text-on-surface-variant animate-pulse">Consultando Expediente Metrológico...</p>
        </div>
      </div>
    );
  }

  const isVigente = inst.estado !== 'Vencido';
  const imgPlaceholder = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-surface pb-24 lg:pb-12 animate-in fade-in duration-700">
      
      {/* --- HEADER SECTOR --- */}
      <section className="px-container-padding pt-2 mb-6">
        {/* Volver al inventario (izquierda) y Badges (derecha) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-outline-variant/10">
          <button 
            onClick={() => navigate('/dashboard/inventario')}
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-black uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Volver al Inventario
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full font-label-caps text-[10px] border font-bold ${
                isVigente ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {isVigente ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                {inst.estado?.toUpperCase() || 'ESTADO DESCONOCIDO'}
              </span>
              <span className="text-xs text-on-surface-variant/60 font-mono">ID: {inst.codigoMJM || inst.codigo || 'S/N'}</span>
            </div>
            
            <div className="w-[1px] h-4 bg-outline-variant/30 hidden sm:block" />
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.open(`/dashboard/inventario/imprimir/${inst.id}`, '_blank')}
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
              >
                <Printer size={14} /> Imprimir
              </button>
              <button className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors">
                <Edit3 size={14} /> Editar
              </button>
            </div>
          </div>
        </div>

        {/* Nombre del Instrumento */}
        <h1 className="font-display text-4xl font-black text-on-surface tracking-tight leading-tight">
          {inst.nombre}
        </h1>
      </section>

      {/* --- BENTO GRID CANVAS --- */}
      <div className="px-container-padding grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Profile Card (Large) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow group">
          <div className="md:w-1/3 aspect-square md:aspect-auto relative bg-surface-container overflow-hidden">
            <img 
              src={inst.imageUrl || imgPlaceholder} 
              alt={inst.nombre} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
          </div>
          <div className="flex-1 p-stack-lg flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-headline-lg text-primary">Perfil Principal del Instrumento</h2>
                <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-0.5">Datos Generales e Identificación</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-stack-lg gap-x-stack-md">
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">MARCA</p>
                <p className="font-headline-md text-on-surface">{inst.marca || 'N/A'}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">MODELO</p>
                <p className="font-headline-md text-on-surface">{inst.modelo || 'N/A'}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">PAÍS</p>
                <p className="font-headline-md text-on-surface">{inst.jerarquia?.pais || 'Colombia'}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">PLANTA</p>
                <p className="font-headline-md text-on-surface">{inst.jerarquia?.planta || 'Planta Principal'}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">ÁREA / SECCIÓN</p>
                <p className="font-headline-md text-on-surface">{inst.jerarquia?.area || 'Área General'}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">UBICACIÓN FÍSICA</p>
                <p className="font-headline-md text-on-surface">{inst.jerarquia?.ubicacion || inst.ubicacion || 'N/A'}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">RESPONSABLE</p>
                <p className="font-headline-md text-on-surface uppercase">{inst.responsable || 'Sin Asignar'}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">FECHA DE REGISTRO</p>
                <p className="font-headline-md text-on-surface">{formatDateYYYYMMDD(inst.createdAt)}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">ID DEL ACTIVO</p>
                <p className="font-headline-md text-primary font-black tracking-wider">{inst.codigoMJM || inst.codigo || 'S/N'}</p>
              </div>
            </div>
            {/* Calibration Alert */}
            <div className="mt-stack-lg p-stack-md bg-surface-container border border-outline-variant rounded-xl flex items-center gap-stack-md">
              <AlertCircle className="text-tertiary" size={20} />
              <p className="text-[13px] text-on-surface-variant">
                Próxima intervención programada para el <span className="text-tertiary font-bold">
                  {inst.rutinas?.calibracion && inst.rutinas?.calibracion_fecha_inicial && inst.rutinas?.calibracion_frecuencia 
                    ? (() => {
                        const parts = String(inst.rutinas.calibracion_fecha_inicial).split('-');
                        if (parts.length === 3) {
                          const year = Number(parts[0]);
                          const month = Number(parts[1]) - 1;
                          const day = Number(parts[2]);
                          const d = new Date(year, month + Number(inst.rutinas.calibracion_frecuencia), day);
                          return formatDateYYYYMMDD(d);
                        }
                        const d = new Date(inst.rutinas.calibracion_fecha_inicial);
                        d.setMonth(d.getMonth() + Number(inst.rutinas.calibracion_frecuencia));
                        return formatDateYYYYMMDD(d);
                      })()
                    : 'N/A'
                  }
                </span>. Asegure condiciones ambientales.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Attributes (Small Grid) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-stack-md">
          {[
            { label: 'Serial', val: inst.serie || 'N/A', icon: <Barcode size={18}/> },
            { label: 'Criticidad', val: inst.criticidad || 'N/A', icon: <AlertCircle size={18}/> },
            { label: 'Resolución', val: cleanUnitDisplay(inst.resolucion || 'N/A'), icon: <Activity size={18}/>, highlight: true },
            { label: 'Div. de Escala', val: cleanUnitDisplay(inst.division_escala || 'N/A'), icon: <Activity size={18}/>, highlight: true },
            { label: 'Capacidad Mínima', val: cleanUnitDisplay(inst.rango_min || 'N/A'), icon: <LineChart size={18}/> },
            { label: 'Capacidad Máxima', val: cleanUnitDisplay(inst.rango_max || 'N/A'), icon: <LineChart size={18}/> },
          ].map((attr, idx) => (
            <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-stack-md flex flex-col justify-between shadow-sm hover:border-primary/40 transition-colors">
              <div className="text-primary opacity-60 mb-stack-sm">{attr.icon}</div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1 uppercase">{attr.label}</p>
                <p className={`font-data-lg text-on-surface truncate ${attr.highlight ? 'text-primary font-bold' : ''}`}>
                  {attr.val}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Process Requirements (ISO 10012) */}
        <div className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-2xl p-stack-lg shadow-sm">
          <div className="flex items-center gap-stack-sm mb-stack-lg">
            <Ruler className="text-primary" size={24} />
            <h3 className="font-headline-md text-on-surface">Requisitos del Proceso y Conformidad (ISO 10012)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
            {[
              { label: 'Tolerancia del Proceso', val: cleanUnitDisplay(inst.tolerancia_proceso || 'N/A'), info: 'Mínimo error permitido por el proceso.' },
              { label: 'Incertidumbre Requerida', val: cleanUnitDisplay(inst.incertidumbre || 'N/A'), info: 'Capacidad de medición instalada requerida.' },
              { label: 'Control Metrológico', val: inst.proceso || 'OPERATIVO', info: 'Proceso vinculado al instrumento.' },
            ].map((req, idx) => (
              <div key={idx} className="bg-surface-container-low p-stack-md rounded-xl border-l-4 border-primary">
                <p className="font-label-caps text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider">{req.label}</p>
                <p className="font-data-lg text-primary font-bold text-xl">{req.val}</p>
                <p className="text-[11px] text-on-surface-variant/60 mt-1">{req.info}</p>
              </div>
            ))}
          </div>
          <div className="mt-stack-lg p-unit bg-primary/5 border border-primary/10 rounded-lg text-center">
            <p className="font-label-caps text-primary text-[10px] tracking-[0.2em]">ARQUITECTURA COMPATIBLE CON ISO/IEC 17025 & ISO 10012</p>
          </div>
        </div>

        {/* Rutinas Programadas */}
        <div className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-2xl p-stack-lg shadow-sm">
          <div className="flex items-center gap-stack-sm mb-stack-lg">
            <Calendar className="text-primary" size={24} />
            <h3 className="font-headline-md text-on-surface">Rutinas Programadas</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
             {[
               { key: 'calibracion', label: 'Calibración' },
               { key: 'verificacion', label: 'Verificación' },
               { key: 'mantenimiento', label: 'Mantenimiento' },
               { key: 'calificacion', label: 'Calificación' }
             ].map((rutina, idx) => {
                if (!inst.rutinas?.[rutina.key]) return null;
                return (
                  <div key={idx} className="bg-surface-container-low p-stack-md rounded-xl border-l-4 border-emerald-500">
                    <p className="font-label-caps text-[10px] text-emerald-600 mb-1 uppercase tracking-wider">{rutina.label}</p>
                    <p className="font-data-md text-on-surface font-bold">Frecuencia: {inst.rutinas[`${rutina.key}_frecuencia`] || 'N/A'} meses</p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-1">
                      Base: {formatDateYYYYMMDD(inst.rutinas[`${rutina.key}_fecha_inicial`])}
                    </p>
                  </div>
                );
             })}
             {(!inst.rutinas || !Object.keys(inst.rutinas).some(k => ['calibracion','verificacion','mantenimiento','calificacion'].includes(k) && inst.rutinas[k])) && (
                <div className="col-span-full text-on-surface-variant opacity-60 text-sm italic">
                  No hay rutinas programadas activas para este equipo.
                </div>
             )}
          </div>
        </div>

        {/* Event History Table */}
        <div className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden mb-12">
          <div className="p-stack-lg flex justify-between items-center border-b border-outline-variant/50">
            <div className="flex items-center gap-stack-sm">
              <History className="text-primary" size={22} />
              <h3 className="font-headline-md text-on-surface">Historial de rutinas</h3>
            </div>
            <button className="text-primary font-bold text-xs uppercase tracking-widest hover:underline transition-all">Ver Historial Completo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/50 text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest">
                <tr>
                  <th className="px-stack-lg py-4">Fecha</th>
                  <th className="px-stack-lg py-4">Descripción de la Actividad</th>
                  <th className="px-stack-lg py-4">Tipo</th>
                  <th className="px-stack-lg py-4">Estado</th>
                  <th className="px-stack-lg py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-body-md text-sm">
                {(inst.historial || []).slice(0, 5).map((log, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-stack-lg py-4 font-data-md">{formatDateYYYYMMDD(log.fecha)}</td>
                    <td className="px-stack-lg py-4 font-medium text-on-surface">{log.tipo} - {log.laboratorio || 'MJM Internal'}</td>
                    <td className="px-stack-lg py-4">
                      <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
                        {log.tipo}
                      </span>
                    </td>
                    <td className="px-stack-lg py-4">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 size={14} /> Aprobado
                      </span>
                    </td>
                     <td className="px-stack-lg py-4 text-right">
                      {log.certificado_url || log.certificadoUrl ? (
                        <button 
                          onClick={() => {
                            setPdfModalUrl(log.certificado_url || log.certificadoUrl);
                            setIsPdfModalOpen(true);
                          }}
                          className="p-2 text-primary hover:text-primary-dark transition-colors"
                          title="Ver Certificado PDF"
                        >
                          <FileText size={18} />
                        </button>
                      ) : (
                        <span className="p-2 text-on-surface-variant/20 cursor-not-allowed" title="Sin PDF Adjunto">
                          <FileText size={18} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!inst.historial || inst.historial.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-stack-lg py-12 text-center text-on-surface-variant opacity-40 italic">
                      No se registran eventos previos para este instrumento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* PDF Fullscreen Modal Overlay */}
      {isPdfModalOpen && pdfModalUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-350">
          <div className="bg-white rounded-3xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-350">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-[#f7931b]" size={20} />
                <h3 className="font-outfit font-bold text-secondary text-sm tracking-wider uppercase">
                  Visor Completo del Certificado
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPdfModalOpen(false);
                  setPdfModalUrl('');
                }}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
                title="Cerrar Visor"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 bg-slate-100 p-2 relative">
              <iframe 
                src={pdfModalUrl} 
                className="w-full h-full rounded-2xl border border-slate-200 shadow-inner"
                title="Visor de PDF Expandido"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
