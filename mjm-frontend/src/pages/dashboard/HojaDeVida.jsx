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
  X,
  ZoomIn,
  ExternalLink
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import manometroIndustrial from '../../assets/manometro_industrial.jpeg';

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

const EditInstrumentModal = ({ inst, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: inst.nombre || '',
    marca: inst.marca || '',
    modelo: inst.modelo || '',
    serie: inst.serie || '',
    codigoMJM: inst.codigoMJM || inst.codigo || '',
    magnitud: inst.magnitud || 'Longitud',
    unidad_medida: inst.unidad_medida || 'mm',
    tolerancia_proceso: inst.tolerancia_proceso || 0.05,
    resolucion: inst.resolucion || '',
    rango_min: inst.rango_min || '',
    rango_max: inst.rango_max || '',
    intervalo_confirmacion: inst.intervalo_confirmacion || 12,
    riesgo_operativo: inst.riesgo_operativo || inst.criticidad || 'Media',
    estado: inst.estado || 'Activo',
    ubicacion: inst.jerarquia?.ubicacion || inst.ubicacion || '',
    planta: inst.jerarquia?.planta || 'Planta Principal',
    area: inst.jerarquia?.area || 'Área General',
    responsable: inst.responsable || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...formData,
        tolerancia_proceso: Number(formData.tolerancia_proceso) || 0.05,
        intervalo_confirmacion: Number(formData.intervalo_confirmacion) || 12,
        criticidad: formData.riesgo_operativo,
        jerarquia: {
          ...(inst.jerarquia || {}),
          planta: formData.planta,
          area: formData.area,
          ubicacion: formData.ubicacion
        }
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-xs">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-mjm-navy/10 text-mjm-navy dark:text-[#f7931b] flex items-center justify-center">
              <Edit3 size={17} />
            </div>
            <div>
              <h3 className="font-space font-bold text-slate-900 dark:text-white text-base leading-tight">
                Editar Ficha Técnica del Activo
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                {inst.codigoMJM || inst.codigo || 'S/N'} • {inst.nombre}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Nombre del Equipo *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={e => setFormData({ ...formData, marca: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Modelo / Referencia</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Número de Serie</label>
              <input
                type="text"
                value={formData.serie}
                onChange={e => setFormData({ ...formData, serie: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Código / Tag MJM</label>
              <input
                type="text"
                value={formData.codigoMJM}
                onChange={e => setFormData({ ...formData, codigoMJM: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Tolerancia de Proceso (EMP)</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={formData.tolerancia_proceso}
                  onChange={e => setFormData({ ...formData, tolerancia_proceso: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">
                  {formData.unidad_medida}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Unidad de Medida</label>
              <input
                type="text"
                value={formData.unidad_medida}
                onChange={e => setFormData({ ...formData, unidad_medida: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
                placeholder="ej: mm, kg, °C, bar"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Resolución Metrológica</label>
              <input
                type="text"
                value={formData.resolucion}
                onChange={e => setFormData({ ...formData, resolucion: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
                placeholder="ej: 0.01 mm, 0.1 °C"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Capacidad Mínima</label>
              <input
                type="text"
                value={formData.rango_min}
                onChange={e => setFormData({ ...formData, rango_min: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
                placeholder="ej: 0"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Capacidad Máxima</label>
              <input
                type="text"
                value={formData.rango_max}
                onChange={e => setFormData({ ...formData, rango_max: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
                placeholder="ej: 150 mm"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Planta / Fábrica</label>
              <input
                type="text"
                value={formData.planta}
                onChange={e => setFormData({ ...formData, planta: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Área / Sección</label>
              <input
                type="text"
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
                placeholder="ej: Mecanizado CNC, Calidad"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Ubicación Física Específica</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Responsable / Custodio</label>
              <input
                type="text"
                value={formData.responsable}
                onChange={e => setFormData({ ...formData, responsable: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Criticidad / Riesgo Operativo</label>
              <select
                value={formData.riesgo_operativo}
                onChange={e => setFormData({ ...formData, riesgo_operativo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Estado Operativo</label>
              <select
                value={formData.estado}
                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-bold"
              >
                <option value="Activo">Activo / Operativo</option>
                <option value="En Calibración">En Calibración</option>
                <option value="Vencido">Vencido</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
                <option value="De Baja">De Baja</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-mjm-navy hover:bg-[#1a3857] text-white font-bold rounded-xl flex items-center gap-2 shadow-md"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default function HojaDeVida() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instruments, loading, getInstrumentFromFirestore, updateInstrument } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [inst, setInst] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfModalUrl, setPdfModalUrl] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  const imgPlaceholder = manometroIndustrial;

  return (
    <div className="min-h-screen bg-surface pb-24 lg:pb-12 animate-in fade-in duration-700">
      
      {/* --- HEADER SECTOR --- */}
      <section className="px-container-padding pt-3.5 sm:pt-5 mb-6">
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
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
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
          <div 
            onClick={() => setIsZoomOpen(true)}
            className="md:w-1/3 aspect-square md:aspect-auto relative bg-surface-container overflow-hidden cursor-pointer group/photo"
            title="Haga clic para ver la fotografía aumentada"
          >
            <img 
              src={inst.imageUrl && !inst.imageUrl.includes('photo-1581091226825') && !inst.imageUrl.includes('photo-1581091226825') ? inst.imageUrl : imgPlaceholder} 
              alt={inst.nombre} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white">
              <ZoomIn size={26} className="text-[#f7931b] drop-shadow-md animate-in zoom-in-75 duration-200" />
              <span className="text-[9px] font-black uppercase tracking-wider bg-black/60 px-2.5 py-1 rounded-full border border-white/10 shadow-md">
                Ver Aumentada
              </span>
            </div>
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
            { label: 'Criticidad', val: inst.criticidad || inst.riesgo_operativo || 'N/A', icon: <AlertCircle size={18}/> },
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
        {/* Event History Table */}
        <div className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-3.5 flex justify-between items-center border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <History className="text-primary" size={18} />
              <h3 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">Historial de Rutinas & Calibraciones</h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">Total: {inst.historial?.length || 0} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[var(--surface-alt)] text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-2.5 text-left">Fecha</th>
                  <th className="px-4 py-2.5 text-left">Descripción de la Actividad</th>
                  <th className="px-4 py-2.5 text-center">Tipo</th>
                  <th className="px-4 py-2.5 text-center">Dictamen</th>
                  <th className="px-4 py-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-xs">
                {(inst.historial || []).slice(0, 10).map((log, idx) => (
                  <tr key={idx} className="hover:bg-[var(--surface-alt)]/50 transition-colors group">
                    <td className="px-4 py-2.5 font-mono text-[var(--text-main)]">{formatDateYYYYMMDD(log.fecha)}</td>
                    <td className="px-4 py-2.5 font-medium text-[var(--text-main)]">{log.tipo} - {log.laboratorio || 'MJM Metrología'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--text-muted)] text-[9px] font-mono font-bold uppercase border border-[var(--outline-color)]/20">
                        {log.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        <CheckCircle2 size={13} /> {log.conformidad_metrologica || log.declaracion_conformidad || 'Conforme'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {log.certificado_url || log.certificadoUrl ? (
                        <button 
                          onClick={() => {
                            setPdfModalUrl(log.certificado_url || log.certificadoUrl);
                            setIsPdfModalOpen(true);
                          }}
                          className="p-1 text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1 text-[10px] font-bold"
                          title="Ver Certificado PDF"
                        >
                          <FileText size={15} /> Ver PDF
                        </button>
                      ) : (
                        <span className="p-1 text-on-surface-variant/30 cursor-not-allowed text-[10px]" title="Sin PDF Adjunto">
                          Sin Adjunto
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!inst.historial || inst.historial.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-on-surface-variant/40 italic">
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

      {/* Modal de Edición de Datos del Instrumento */}
      {isEditModalOpen && inst && (
        <EditInstrumentModal
          inst={inst}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (updatedData) => {
            const activeTenantId = tenant?.id || 'sandboxdemo';
            await updateInstrument(activeTenantId, inst.id, updatedData);
            setInst(prev => ({ ...prev, ...updatedData }));
            setIsEditModalOpen(false);
          }}
        />
      )}

      {/* Lightbox Visor de Fotografía Aumentada */}
      {isZoomOpen && inst && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Header del Lightbox */}
          <div 
            onClick={e => e.stopPropagation()} 
            className="w-full max-w-4xl flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-white"
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#0B1326] text-[#f7931b] border border-[#f7931b]/40 font-mono font-black text-xs rounded-lg uppercase tracking-wider">
                {inst.codigoMJM || inst.codigo || 'MJM'}
              </span>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-white tracking-tight truncate max-w-md">
                  {inst.nombre || 'Fotografía de Alta Resolución del Activo'}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {inst.marca} {inst.modelo} • Serial: {inst.serie || 'S/N'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={inst.imageUrl && !inst.imageUrl.includes('photo-1581091226825') ? inst.imageUrl : imgPlaceholder} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-xs flex items-center gap-1.5 font-bold"
                title="Abrir imagen original"
              >
                <ExternalLink size={15} />
                <span className="hidden sm:inline text-[11px]">Original</span>
              </a>
              <button 
                onClick={() => setIsZoomOpen(false)}
                className="p-2 bg-white/10 hover:bg-red-500/80 text-white rounded-xl transition-all"
                title="Cerrar (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Contenedor de la Imagen Aumentada */}
          <div 
            onClick={e => e.stopPropagation()} 
            className="relative max-w-4xl max-h-[75vh] w-full flex items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <img 
              src={inst.imageUrl && !inst.imageUrl.includes('photo-1581091226825') ? inst.imageUrl : imgPlaceholder} 
              alt={inst.nombre || "Fotografía ampliada"} 
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-105" 
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-3 font-mono">
            Haz clic afuera o pulsa <span className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Esc</span> para cerrar
          </p>
        </div>
      )}
    </div>
  );
}
