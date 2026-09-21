import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const cleanText = (text) => {
  if (!text) return '';
  // Limpia caracteres extraños de codificación comunes en Excel
  return text.replace(/├│/g, 'ó')
             .replace(/├í/g, 'á')
             .replace(/├⌐/g, 'é')
             .replace(/├¡/g, 'í')
             .replace(/├║/g, 'ú')
             .replace(/├▒/g, 'ñ')
             .replace(/├ô/g, 'Ó')
             .trim();
};
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import heroImage from '../../assets/login-hero.png';
import manometroIndustrial from '../../assets/manometro_industrial.jpeg';
import {
  Search, Plus, ChevronRight, ChevronDown, Eye,
  CheckCircle, Clock, AlertCircle, X, Building2, MapPin, Globe,
  Cpu, Layers, Wrench, ShieldCheck, Barcode, Tag,
  Activity, ArrowLeft, Image as ImageIcon, Check,
  AlertTriangle, Filter, Loader2, Archive, FileText, Lock, FileUp,
  LayoutGrid, List, ZoomIn, ExternalLink, Maximize2
} from 'lucide-react';

// --- ESTADO BADGE (METROLOGY PRECISION STYLE) ---
const EstadoBadge = ({ estado }) => {
  const config = {
    'Activo':             { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', icon: <CheckCircle size={11}/> },
    'Próximo Vencimiento':{ bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', icon: <Clock size={11}/> },
    'Vencido':            { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20', icon: <AlertCircle size={11}/> },
  };
  const c = config[estado] || config['Activo'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border} whitespace-nowrap`}>
      {c.icon} {estado}
    </span>
  );
};

// --- INDUSTRIAL WIZARD (Functional & Theme-Aware) ---
const IndustrialWizard = ({ onClose }) => {
  const { tenant } = useAuthStore();
  const { addInstrument } = useInventoryStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '', marca: '', modelo: '', serie: '', ubicacion: '',
    magnitud: 'Longitud', resolucion: '', capacidadMaxima: '',
    tolerancia_proceso: '', intervalo_confirmacion: '12', riesgo_operativo: 'Medio',
    codigoMJM: `MET-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    estado: 'Activo'
  });

  const steps = [
    { id: 1, title: 'Identificación', icon: <Tag size={18}/> },
    { id: 2, title: 'Especificaciones', icon: <Activity size={18}/> },
    { id: 3, title: 'Control ISO', icon: <ShieldCheck size={18}/> },
    { id: 4, title: 'Finalizar', icon: <CheckCircle size={18}/> },
  ];

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const nextStep = () => {
    if (step === 1 && !form.nombre) return alert('El nombre es obligatorio');
    setStep(s => Math.min(s + 1, 4));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleFinish = async () => {
    setLoading(true);
    try {
      await addInstrument({ ...form, tenantId: tenant.id });
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el activo');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1: return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
           <div>
             <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Nombre del Equipo</label>
             <input value={form.nombre} onChange={e => set('nombre', e.target.value)} className="input-metrology w-full bg-[var(--background)] text-[var(--text-main)] border-[var(--outline-color)]" placeholder="Ej: Micrómetro Digital" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Marca</label>
                <input value={form.marca} onChange={e => set('marca', e.target.value)} className="input-metrology w-full bg-[var(--background)] text-[var(--text-main)] border-[var(--outline-color)]" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Serie / ID</label>
                <input value={form.serie} onChange={e => set('serie', e.target.value)} className="input-metrology w-full bg-[var(--background)] text-[var(--text-main)] border-[var(--outline-color)]" />
              </div>
           </div>
           <div>
             <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Ubicación / Área</label>
             <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]" size={16} />
                <input value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} className="input-metrology w-full pl-12 bg-[var(--background)] text-[var(--text-main)] border-[var(--outline-color)]" placeholder="Laboratorio 04" />
             </div>
           </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
           <div>
             <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Magnitud Metrológica</label>
             <select value={form.magnitud} onChange={e => set('magnitud', e.target.value)} className="input-metrology w-full bg-[var(--background)] text-[var(--text-main)] border-[var(--outline-color)] appearance-none">
               {['Longitud', 'Temperatura', 'Presión', 'Masa', 'Volumen', 'Fuerza', 'Vibración'].map(m => <option key={m} value={m}>{m}</option>)}
             </select>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Resolución</label>
                <input value={form.resolucion} onChange={e => set('resolucion', e.target.value)} className="input-metrology w-full bg-[var(--background)] text-[var(--text-main)] border-[var(--outline-color)]" placeholder="0.001 mm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Capacidad Máx</label>
                <input value={form.capacidadMaxima} onChange={e => set('capacidadMaxima', e.target.value)} className="input-metrology w-full bg-[var(--background)] text-[var(--text-main)] border-[var(--outline-color)]" placeholder="25 mm" />
              </div>
           </div>
        </div>
      );
      case 3: return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
           <div className="bg-[var(--primary)]/10 p-4 rounded-2xl border border-[var(--primary)]/20">
              <p className="text-[9px] text-[var(--primary)] font-black uppercase tracking-[0.2em] italic">Módulo de Cumplimiento ISO 10012:2026</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Tolerancia Proceso</label>
                <input type="number" step="0.00001" value={form.tolerancia_proceso} onChange={e => set('tolerancia_proceso', e.target.value)} className="input-metrology w-full bg-[var(--background)] text-[var(--text-main)] border-[var(--outline-color)]" placeholder="0.005" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Intervalo (Meses)</label>
                <input type="number" value={form.intervalo_confirmacion} onChange={e => set('intervalo_confirmacion', e.target.value)} className="input-metrology w-full bg-[var(--background)] text-[var(--text-main)] border-[var(--outline-color)]" />
              </div>
           </div>
           <div>
             <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Riesgo Operativo</label>
             <div className="flex gap-2">
               {['Bajo', 'Medio', 'Alto'].map(r => (
                 <button key={r} onClick={() => set('riesgo_operativo', r)} className={`flex-1 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${form.riesgo_operativo === r ? 'bg-[#1A202C] text-white border-[#1A202C]' : 'bg-[var(--surface-alt)] border-[var(--outline-color)] text-[var(--text-muted)] hover:brightness-110'}`}>
                   {r}
                 </button>
               ))}
             </div>
           </div>
        </div>
      );
      case 4: return (
        <div className="text-center py-10 animate-in zoom-in duration-500">
           <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
              <ShieldCheck size={40} />
           </div>
           <h3 className="font-black text-[var(--text-main)] text-2xl uppercase tracking-tighter">¿Confirmar Registro?</h3>
           <p className="text-[var(--text-muted)] text-xs mt-3 px-12 leading-relaxed">Al confirmar, el activo {form.codigoMJM} será dado de alta en el inventario maestro con estado Activo.</p>
        </div>
      );
      default: return null;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-[var(--surface)] shadow-2xl rounded-2xl border border-[var(--outline-color)]/30 w-full max-w-xl overflow-hidden flex flex-col transition-colors duration-200">
          
          <div className="p-6 border-b border-[var(--outline-color)]/20 flex justify-between items-center bg-[var(--surface-alt)]">
             <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-[var(--primary)] text-[#1A202C] rounded-xl shadow-md shadow-[var(--primary)]/20"><Plus size={20}/></div>
                <div>
                   <h2 className="font-bold text-[var(--text-main)] text-base uppercase tracking-tight">Nuevo Activo</h2>
                   <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Registro de Activo Metrológico</p>
                </div>
             </div>
             <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg transition-colors"><X size={20}/></button>
          </div>

          <div className="flex justify-between px-6 py-4 bg-[var(--background)]/50 border-b border-[var(--outline-color)]/20">
             {steps.map(s => (
               <div 
                key={s.id} 
                onClick={() => setStep(s.id)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group/step"
               >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${step >= s.id ? 'bg-[var(--primary)] text-[#1A202C] shadow-sm shadow-[var(--primary)]/30' : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border border-[var(--outline-color)]/30 group-hover/step:border-[var(--primary)]'}`}>
                    {step > s.id ? <Check size={16}/> : s.icon}
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${step === s.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] opacity-50'}`}>{s.title}</span>
               </div>
             ))}
          </div>

          <div className="p-6 sm:p-7 flex-1 min-h-[300px]">{renderStep()}</div>

          <div className="p-5 sm:p-6 bg-[var(--surface-alt)] border-t border-[var(--outline-color)]/20 flex justify-between gap-3">
             <button onClick={prevStep} disabled={step === 1 || loading} className="btn-precision-secondary py-2 px-6 text-xs font-bold uppercase tracking-wider disabled:opacity-0">REGRESAR</button>
             {step < 4 ? (
               <button onClick={nextStep} className="btn-precision-primary py-2 px-8 text-xs font-bold uppercase tracking-wider">SIGUIENTE</button>
             ) : (
               <button 
                onClick={handleFinish} 
                disabled={loading}
                className="btn-precision-primary py-2 px-8 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
               >
                 {loading ? <Loader2 className="animate-spin" size={16}/> : 'FINALIZAR REGISTRO'}
               </button>
             )}
          </div>
       </div>
    </div>,
    document.body
  );
};

// --- MÓDULO: CARGA MASIVA EXCEL (CON DESCARGA DE PLANTILLA Y SUBIDA BLOQUEADA) ---
const BulkUploadModal = ({ onClose }) => {
  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.setAttribute("href", "/plantilla_carga_masiva_mjm.xlsx");
    link.setAttribute("download", "plantilla_carga_masiva_mjm.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-[var(--surface)] shadow-2xl rounded-2xl border border-[var(--outline-color)]/30 w-full max-w-lg overflow-hidden flex flex-col transition-colors duration-200">
          
          <div className="p-6 border-b border-[var(--outline-color)]/20 flex justify-between items-center bg-[var(--surface-alt)]">
             <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-[var(--primary)] text-[#1A202C] rounded-xl shadow-md shadow-[var(--primary)]/20"><FileText size={20}/></div>
                <div>
                   <h2 className="font-bold text-[var(--text-main)] text-base uppercase tracking-tight">Carga Masiva</h2>
                   <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Asistente de Importación Masiva</p>
                </div>
             </div>
             <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg transition-colors"><X size={20}/></button>
          </div>

          <div className="p-10 space-y-8 flex-1">
             <div className="space-y-3">
                <h3 className="font-outfit font-bold text-sm text-[var(--text-main)] uppercase tracking-wide">1. Descarga la plantilla estándar</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                   Descarga nuestra plantilla oficial estructurada en formato CSV/Excel con las columnas y formatos requeridos para la confirmación metrológica y auditoría ISO 10012.
                </p>
                <button 
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[var(--primary)] text-[#1A202C] font-inter font-black text-[10px] uppercase tracking-wider rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <FileText size={14} /> Descargar Plantilla Excel/CSV
                </button>
             </div>

             <div className="space-y-3 pt-6 border-t border-[var(--outline-color)]/20">
                <h3 className="font-outfit font-bold text-sm text-[var(--text-main)] uppercase tracking-wide">2. Sube tu archivo</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                   Carga el archivo completado para realizar la importación masiva directa de activos a la base de datos de tu planta.
                </p>
                
                {/* BLOCKED DROPZONE AREA */}
                <div className="relative border-2 border-dashed border-[var(--outline-color)]/40 rounded-2xl p-8 flex flex-col items-center justify-center bg-[var(--surface-alt)]/40 overflow-hidden group">
                   <div className="absolute inset-0 bg-[var(--surface)]/95 backdrop-blur-[4px] flex flex-col items-center justify-center text-center p-6 z-20">
                      <Lock size={28} className="text-amber-500 mb-2 animate-pulse" />
                      <p className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Subida deshabilitada temporalmente</p>
                      <p className="text-[9px] text-[var(--text-muted)] px-6">La carga automatizada de inventarios está desactivada en modo de pruebas.</p>
                   </div>
                   
                   <FileUp size={36} className="text-[var(--text-muted)]/20 mb-3" />
                   <span className="text-[10px] font-black text-[var(--text-muted)]/20 uppercase tracking-widest">Arrastra tu archivo aquí</span>
                </div>
             </div>
          </div>

          <div className="p-8 bg-[var(--surface-alt)] border-t border-[var(--outline-color)] flex justify-end">
             <button onClick={onClose} className="btn-secondary py-3 px-8 text-[10px] cursor-pointer">CERRAR WIZARD</button>
          </div>
       </div>
    </div>,
    document.body
  );
};

// --- INSTRUMENT CARD ---
const InstrumentCard = ({ inst, onNavigate }) => {
  const imgPlaceholder = manometroIndustrial;
  
  // Limpieza de caracteres extraños del Excel (Especialmente para DeltaSandbox)
  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/├│/g, 'ó')
      .replace(/├í/g, 'á')
      .replace(/├®/g, 'é')
      .replace(/├¡/g, 'í')
      .replace(/├║/g, 'ú')
      .replace(/├▒/g, 'ñ')
      .replace(/├ô/g, 'Ó')
      .replace(/\|ÔN/g, 'ÓN')
      .replace(/├ôN/g, 'ÓN');
  };

  return (
    <div 
      onClick={() => onNavigate(inst.id)}
      className="premium-card overflow-hidden group cursor-pointer flex flex-col h-full hover:translate-y-[-2px] hover:shadow-md transition-all duration-200"
    >
      <div className="h-32 relative overflow-hidden bg-[var(--surface-alt)] flex items-center justify-center p-2">
        <img 
          src={inst.imageUrl && !inst.imageUrl.includes('photo-1581091226825') ? inst.imageUrl : imgPlaceholder} 
          alt={inst.nombre} 
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent opacity-20 pointer-events-none" />
        
        {/* BADGE DE CÓDIGO */}
        <div className="absolute top-2.5 right-2.5">
          <span className="bg-[#0F172A]/90 dark:bg-black/90 backdrop-blur-md border border-white/10 text-white dark:text-[#f7931b] font-mono font-bold text-[9px] px-2.5 py-0.5 rounded-md tracking-wider uppercase shadow-xs">
            {inst.codigo || inst.codigoMJM || 'S/N'}
          </span>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
        <div>
           <h4 className="text-[var(--text-main)] font-space font-bold text-xs uppercase tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-[#f7931b] transition-colors">
             {cleanText(inst.nombre)}
           </h4>
           <p className="text-[9px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-0.5 flex items-center justify-between gap-1.5">
             <span className="truncate">{inst.marca || 'GENERIC'}</span>
             {inst.serie && <span className="font-mono text-[8.5px] text-[var(--text-main)] bg-[var(--surface-alt)] px-1.5 py-0.5 rounded border border-[var(--outline-color)] shrink-0">S/N: {inst.serie}</span>}
           </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="bg-[var(--background)] rounded-lg p-2 border border-[var(--outline-color)]">
            <p className="text-[7px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Magnitud</p>
            <p className="font-bold text-[var(--text-main)] truncate uppercase text-[9.5px]">{inst.magnitud || 'General'}</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-2 border border-[var(--outline-color)] text-right">
            <p className="text-[7px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Capacidad</p>
            <p className="font-mono font-bold text-[var(--text-main)] truncate text-[9.5px]">
              {inst.rango_max || inst.capacidadMaxima || '--'}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--outline-color)]/60 flex items-center justify-between">
           <EstadoBadge estado={inst.estado || inst.estado_operativo || 'Activo'} />
           <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] dark:group-hover:text-[#f7931b] transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};

// --- SWISS PRECISION TABLE VIEW (ALTA DENSIDAD) ---
const PrecisionTableView = ({ instruments, onSelect, onNavigateDetail }) => {
  return (
    <div className="max-h-[calc(100vh-210px)] overflow-auto rounded-xl border border-[var(--outline-color)] bg-[var(--surface)] shadow-xs">
      <table className="w-full text-left border-separate border-spacing-0 table-precision relative">
        <thead className="sticky top-0 z-20 bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] shadow-xs">
          <tr className="bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] border-b border-[var(--outline-color)] text-[var(--text-muted)]">
            <th className="sticky top-0 bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] px-3.5 py-2.5 text-left font-space text-[10px] font-bold uppercase tracking-wider z-20 border-b border-[var(--outline-color)] rounded-none whitespace-nowrap">Código / ID</th>
            <th className="sticky top-0 bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] px-3.5 py-2.5 text-left font-space text-[10px] font-bold uppercase tracking-wider z-20 border-b border-[var(--outline-color)] rounded-none whitespace-nowrap">Activo & Marca</th>
            <th className="sticky top-0 bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] px-3.5 py-2.5 text-center font-space text-[10px] font-bold uppercase tracking-wider z-20 border-b border-[var(--outline-color)] rounded-none whitespace-nowrap">Magnitud</th>
            <th className="sticky top-0 bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] px-3.5 py-2.5 text-center font-space text-[10px] font-bold uppercase tracking-wider z-20 border-b border-[var(--outline-color)] rounded-none whitespace-nowrap">Serie</th>
            <th className="sticky top-0 bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] px-3.5 py-2.5 text-left font-space text-[10px] font-bold uppercase tracking-wider z-20 border-b border-[var(--outline-color)] rounded-none whitespace-nowrap">Ubicación</th>
            <th className="sticky top-0 bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] px-3.5 py-2.5 text-right font-space text-[10px] font-bold uppercase tracking-wider z-20 border-b border-[var(--outline-color)] rounded-none whitespace-nowrap">Capacidad / Rango</th>
            <th className="sticky top-0 bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] px-3.5 py-2.5 text-center font-space text-[10px] font-bold uppercase tracking-wider z-20 border-b border-[var(--outline-color)] rounded-none whitespace-nowrap">Estado</th>
            <th className="sticky top-0 bg-[var(--surface-alt)] dark:bg-[var(--surface-alt)] px-3.5 py-2.5 text-right font-space text-[10px] font-bold uppercase tracking-wider z-20 border-b border-[var(--outline-color)] rounded-none whitespace-nowrap">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--outline-color)]/50 text-xs font-inter">
          {instruments.map((inst) => (
            <tr 
              key={inst.id}
              onClick={() => onSelect(inst.id)}
              className="hover:bg-[var(--surface-alt)]/60 transition-colors group cursor-pointer"
            >
              <td className="px-3.5 py-2 font-mono font-bold text-[11px] whitespace-nowrap">
                <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--outline-color)] text-mjm-navy dark:text-[#f7931b] group-hover:border-[#f7931b]/50 transition-colors">
                  {inst.codigo || inst.codigoMJM || 'S/N'}
                </span>
              </td>
              <td className="px-3.5 py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[var(--surface-alt)] border border-[var(--outline-color)]/50 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                    <img 
                      src={inst.imageUrl && !inst.imageUrl.includes('photo-1581091226825') ? inst.imageUrl : manometroIndustrial} 
                      alt="" 
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-main)] truncate max-w-[200px] sm:max-w-[280px] text-xs leading-tight">
                      {cleanText(inst.nombre)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                      {inst.marca || 'MJM'} {inst.modelo ? `• ${inst.modelo}` : ''}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-3.5 py-2 text-center whitespace-nowrap">
                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  {inst.magnitud || 'General'}
                </span>
              </td>
              <td className="px-3.5 py-2 text-center font-mono text-[10.5px] text-[var(--text-muted)] whitespace-nowrap">
                {inst.serie || '---'}
              </td>
              <td className="px-3.5 py-2 text-[var(--text-muted)] text-[11px] truncate max-w-[140px]">
                {inst.ubicacion || inst.jerarquia?.ubicacion || inst.jerarquia?.area || 'Planta'}
              </td>
              <td className="px-3.5 py-2 text-right font-mono text-[11px] text-[var(--text-main)] whitespace-nowrap">
                {inst.rango_max || inst.capacidadMaxima || '---'}
              </td>
              <td className="px-3.5 py-2 text-center whitespace-nowrap">
                <EstadoBadge estado={inst.estado || inst.estado_operativo || 'Activo'} />
              </td>
              <td className="px-3.5 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onNavigateDetail(inst.id)}
                    className="p-1.5 hover:bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-blue-600 dark:hover:text-[#f7931b] rounded transition-colors"
                    title="Ver Ficha Técnica Completa"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => window.open(`/dashboard/hoja-de-vida/print/${inst.id}`, '_blank')}
                    className="p-1.5 hover:bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-blue-600 dark:hover:text-[#f7931b] rounded transition-colors"
                    title="Imprimir Hoja de Vida ISO 10012"
                  >
                    <FileText size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- UNIT GROUPS ---
const UNIT_GROUPS = [
  {
    label: 'Eléctricas',
    units: [
      { value: 'V', label: 'V (Voltio)' },
      { value: 'mV', label: 'mV (Milivoltio)' },
      { value: 'kV', label: 'kV (Kilovoltio)' },
      { value: 'A', label: 'A (Amperio)' },
      { value: 'mA', label: 'mA (Miliamperio)' },
      { value: 'µA', label: 'µA (Microamperio)' },
      { value: 'Ω', label: 'Ω (Ohmio)' },
      { value: 'kΩ', label: 'kΩ (Kilohmio)' },
      { value: 'MΩ', label: 'MΩ (Megohmio)' },
      { value: 'Hz', label: 'Hz (Hercio)' },
      { value: 'kHz', label: 'kHz (Kilohercio)' },
      { value: 'MHz', label: 'MHz (Megahercio)' },
      { value: 'F', label: 'F (Faradio)' },
      { value: 'µF', label: 'µF (Microfaradio)' },
      { value: 'nF', label: 'nF (Nanofaradio)' },
      { value: 'pF', label: 'pF (Picofaradio)' }
    ]
  },
  {
    label: 'Presión',
    units: [
      { value: 'bar', label: 'bar (Bar)' },
      { value: 'mbar', label: 'mbar (Milibar)' },
      { value: 'psi', label: 'psi (Libra por pulgada cuadrada)' },
      { value: 'Pa', label: 'Pa (Pascal)' },
      { value: 'kPa', label: 'kPa (Kilopascal)' },
      { value: 'MPa', label: 'MPa (Megapascal)' },
      { value: 'kg/cm²', label: 'kg/cm² (Kilogramo por centímetro cuadrado)' },
      { value: 'atm', label: 'atm (Atmósfera)' },
      { value: 'mmHg', label: 'mmHg (Milímetro de mercurio)' },
      { value: 'inHg', label: 'inHg (Pulgada de mercurio)' },
      { value: 'mmH2O', label: 'mmH2O (Milímetro de agua)' }
    ]
  },
  {
    label: 'Torque',
    units: [
      { value: 'N·m', label: 'N·m (Newton metro)' },
      { value: 'mN·m', label: 'mN·m (Milinewton metro)' },
      { value: 'dN·m', label: 'dN·m (Decinewton metro)' },
      { value: 'lbf·ft', label: 'lbf·ft (Libra-fuerza pie)' },
      { value: 'lbf·in', label: 'lbf·in (Libra-fuerza pulgada)' },
      { value: 'ozf·in', label: 'ozf·in (Onza-fuerza pulgada)' },
      { value: 'kgf·cm', label: 'kgf·cm (Kilogramo-fuerza centímetro)' },
      { value: 'kgf·m', label: 'kgf·m (Kilogramo-fuerza metro)' }
    ]
  },
  {
    label: 'Masa',
    units: [
      { value: 'g', label: 'g (Gramo)' },
      { value: 'kg', label: 'kg (Kilogramo)' },
      { value: 'mg', label: 'mg (Miligramo)' },
      { value: 'lb', label: 'lb (Libra)' },
      { value: 'oz', label: 'oz (Onza)' },
      { value: 't', label: 't (Tonelada)' }
    ]
  },
  {
    label: 'Cantidad Sustancia',
    units: [
      { value: 'mol', label: 'mol (Mol)' },
      { value: 'mmol', label: 'mmol (Milimol)' }
    ]
  },
  {
    label: 'Temperatura',
    units: [
      { value: '°C', label: '°C (Grado Celsius)' },
      { value: '°F', label: '°F (Grado Fahrenheit)' },
      { value: 'K', label: 'K (Kelvin)' }
    ]
  },
  {
    label: 'Longitud',
    units: [
      { value: 'mm', label: 'mm (Milímetro)' },
      { value: 'µm', label: 'µm (Micrómetro)' },
      { value: 'cm', label: 'cm (Centímetro)' },
      { value: 'm', label: 'm (Metro)' },
      { value: 'in', label: 'in (Pulgada)' },
      { value: 'ft', label: 'ft (Pie)' }
    ]
  },
  {
    label: 'Otros',
    units: [
      { value: '%', label: '% (Porcentaje)' },
      { value: 'ppm', label: 'ppm (Partes por millón)' }
    ]
  }
];

const getShortSymbol = (uniStr) => {
  if (!uniStr) return '';
  const cleanUni = String(uniStr).trim();
  
  // Try direct match first
  for (const group of UNIT_GROUPS) {
    for (const u of group.units) {
      if (cleanUni.toLowerCase() === u.label.toLowerCase() || 
          cleanUni.toLowerCase() === u.value.toLowerCase()) {
        return u.value;
      }
    }
  }
  
  // Sort descending by length to match longest first
  const allUnits = UNIT_GROUPS.flatMap(g => g.units).sort((a, b) => b.value.length - a.value.length);
  for (const u of allUnits) {
    if (cleanUni.startsWith(u.value)) {
      return u.value;
    }
  }
  
  return cleanUni.split(' ')[0] || cleanUni;
};

const getFullLabel = (shortUni) => {
  if (!shortUni) return '';
  const cleanShort = String(shortUni).trim();
  for (const group of UNIT_GROUPS) {
    const found = group.units.find(u => u.value.toLowerCase() === cleanShort.toLowerCase());
    if (found) return found.label;
  }
  return shortUni;
};

// --- CUSTOM SEARCHABLE SELECT COMPONENT ---
const SearchableUnitSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return UNIT_GROUPS;
    const term = searchTerm.toLowerCase();
    return UNIT_GROUPS.map(group => {
      const filteredUnits = group.units.filter(
        u => u.value.toLowerCase().includes(term) || u.label.toLowerCase().includes(term)
      );
      return { ...group, units: filteredUnits };
    }).filter(group => group.units.length > 0);
  }, [searchTerm]);

  const displayVal = useMemo(() => {
    return value || '';
  }, [value]);

  return (
    <div ref={containerRef} className="relative w-[100px] flex-shrink-0">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
        }}
        className="w-full bg-white border border-[var(--primary)]/30 rounded-lg px-2 py-2 text-xs font-bold text-[var(--text-main)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all flex items-center justify-between cursor-pointer h-[38px]"
      >
        <span className="truncate">{displayVal || '(Sin)'}</span>
        <ChevronDown size={12} className="text-[var(--text-muted)] flex-shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col max-h-72 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar unidad..."
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 bg-white text-slate-800"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 max-h-56 p-1 space-y-2 custom-scrollbar bg-white">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-100 font-medium ${!value ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-slate-700'}`}
            >
              (Sin unidad)
            </button>
            {filteredGroups.map(group => (
              <div key={group.label} className="space-y-1">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 bg-slate-50/50 rounded">
                  {group.label}
                </div>
                {group.units.map(u => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => {
                      onChange(u.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-100 font-medium flex items-center justify-between ${value === u.value ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-black' : 'text-slate-700'}`}
                  >
                    <span className="truncate">{u.label}</span>
                    {value === u.value && <Check size={12} className="text-[var(--primary)]" />}
                  </button>
                ))}
              </div>
            ))}
            {filteredGroups.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-400">
                No se encontraron unidades
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- EDITABLE ITEM COMPONENT ---
const EditableItem = ({ label, field, icon, type = "text", hasUnit = false, isEditing, form, handleChange, options }) => {
  const parseValueAndUnit = (str) => {
    if (!str || str === 'N/A') return { val: '', uni: '' };
    const match = String(str).trim().match(/^([-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*(.*)$/);
    if (match) {
      return {
        val: match[1].replace(/\./g, ','),
        uni: match[2] || ''
      };
    }
    return { val: String(str).replace(/\./g, ','), uni: '' };
  };

  const { val, uni } = (hasUnit && form) ? parseValueAndUnit(form[field]) : { val: '', uni: '' };

  const handleNumericInput = (value) => {
    let clean = value.replace(/\./g, ','); // Convert dot to comma
    clean = clean.replace(/[^0-9,-]/g, ''); // Allow only digits, comma, and minus
    
    // Keep only first minus sign at start
    if (clean.includes('-')) {
      const isNegative = clean.startsWith('-');
      clean = (isNegative ? '-' : '') + clean.replace(/-/g, '');
    }
    
    // Keep only first comma
    const parts = clean.split(',');
    if (parts.length > 2) {
      clean = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limit to 12 digits (excluding sign and comma)
    let digitsOnly = '';
    let finalStr = '';
    if (clean.startsWith('-')) {
      finalStr += '-';
    }
    for (let char of clean) {
      if (char === '-') continue;
      if (char === ',') {
        if (!finalStr.includes(',')) {
          finalStr += ',';
        }
      } else {
        if (digitsOnly.length < 12) {
          digitsOnly += char;
          finalStr += char;
        }
      }
    }
    return finalStr;
  };

  const handleUnitSelectChange = (newShortUni) => {
    const fullLabel = getFullLabel(newShortUni);
    const combined = val.trim() ? `${val.trim()} ${fullLabel.trim()}`.trim() : 'N/A';
    handleChange(field, combined);
  };

  const handleValChange = (newVal) => {
    const shortUni = getShortSymbol(uni);
    const fullLabel = getFullLabel(shortUni);
    const combined = newVal.trim() ? `${newVal.trim()} ${fullLabel.trim()}`.trim() : 'N/A';
    handleChange(field, combined);
  };

  return (
    <div className="flex justify-between items-center py-3 border-b border-[var(--outline-color)]/10 group">
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{label}</p>
        {isEditing ? (
          hasUnit ? (
            <div className="flex gap-2 w-full items-center min-w-0">
              <input 
                type="text"
                value={val} 
                onChange={(e) => handleValChange(handleNumericInput(e.target.value))}
                className="flex-1 min-w-0 bg-white border border-[var(--primary)]/30 rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-main)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all h-[38px]"
                placeholder="0,0"
              />
              <SearchableUnitSelect
                value={getShortSymbol(uni)}
                onChange={handleUnitSelectChange}
              />
            </div>
          ) : options ? (
            <select
              value={(() => {
                const val = (form && form[field]) || '';
                const matched = options.find(o => o.toLowerCase() === val.toLowerCase());
                return matched || val;
              })()}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full bg-white border border-[var(--primary)]/30 rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-main)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all h-[38px] cursor-pointer"
            >
              <option value="">(Seleccionar)</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input 
              type={type}
              value={(form && form[field]) || ''} 
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full bg-white border border-[var(--primary)]/30 rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-main)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all h-[38px]"
              autoFocus={field === 'nombre'}
            />
          )
        ) : (
          <p className="text-sm font-bold text-[var(--text-main)] truncate">
            {(() => {
              const raw = (form && form[field]) || 'N/A';
              if (raw === 'N/A') return 'N/A';
              if (hasUnit) {
                return String(raw).replace(/\s*\([^)]*\)/g, '').trim();
              }
              return raw;
            })()}
          </p>
        )}
      </div>
      {!isEditing && icon && <div className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">{icon}</div>}
    </div>
  );
};

// --- INSTRUMENT DETAILS MODAL (TECHNICAL V3 + EDIT MODE) ---
const InstrumentDetailsModal = ({ instrumentId, onClose }) => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const { instruments, updateInstrument } = useInventoryStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [showGallery, setShowGallery] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setZoomedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const inst = instruments.find(i => i.id === instrumentId);

  // Inicializar el formulario solo cuando cambia el instrumento
  useEffect(() => {
    if (inst) {
      setForm({ ...inst });
    }
  }, [instrumentId]); 

  const minDateRestriction = new Date();
  minDateRestriction.setDate(minDateRestriction.getDate() - 30);
  const minDateStr = minDateRestriction.toISOString().split('T')[0];

  if (!inst || !form) return null;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleRutina = (rutinaKey) => {
    if (!isEditing) return;
    setForm(prev => {
      const isCurrentlyOn = prev.rutinas?.[rutinaKey];
      const willBeOn = !isCurrentlyOn;
      const today = new Date().toISOString().split('T')[0];
      
      const updatedRutinas = {
        ...(prev.rutinas || {}),
        [rutinaKey]: willBeOn
      };
      
      if (willBeOn && !updatedRutinas[`${rutinaKey}_fecha_inicial`]) {
        updatedRutinas[`${rutinaKey}_fecha_inicial`] = today;
      }
      
      return {
        ...prev,
        rutinas: updatedRutinas
      };
    });
  };

  const handleChangeRutinaFrecuencia = (rutinaKey, field, value) => {
    if (!isEditing) return;
    setForm(prev => ({
      ...prev,
      rutinas: {
        ...(prev.rutinas || {}),
        [`${rutinaKey}_${field}`]: value
      }
    }));
  };

  // Function handleHeredarRutinas was removed as per user request

  const handleArchive = async () => {
    if (!tenant) return;
    const confirmArchive = window.confirm(
      "Trazabilidad Normativa ISO 10012:\n\nPor requisito de control metrológico, los activos no se eliminan físicamente para preservar la cadena ininterrumpida de calibración e intervenciones técnicas.\n\n¿Desea confirmar el retiro de este instrumento del inventario activo y moverlo a histórico?"
    );
    if (!confirmArchive) return;
    
    const success = await updateInstrument(tenant.id, instrumentId, { archivado: true });
    if (success) {
      alert("El instrumento ha sido archivado correctamente preservando su historial técnico.");
      onClose();
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    setGalleryUploading(true);
    try {
      const fileName = `${Date.now()}_gallery_${file.name.replace(/\s+/g, '_')}`;
      const fileRef = ref(storage, `tenants/${tenant.id}/instrumentos/${instrumentId}/gallery/${fileName}`);
      
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      const updatedGallery = [...(form.gallery || []), downloadUrl];
      handleChange('gallery', updatedGallery);
      
      await updateInstrument(tenant.id, instrumentId, { gallery: updatedGallery });
    } catch (error) {
      console.error("Error subiendo foto de galería:", error);
      alert(`No se pudo subir la foto: ${error.message}`);
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleSetMainPhoto = async (photoUrl) => {
    if (!tenant) return;
    const oldMain = form.imageUrl;
    let updatedGallery = form.gallery ? form.gallery.filter(url => url !== photoUrl) : [];
    if (oldMain && !updatedGallery.includes(oldMain)) {
      updatedGallery = [oldMain, ...updatedGallery];
    }
    
    const updatedForm = {
      ...form,
      imageUrl: photoUrl,
      gallery: updatedGallery
    };
    
    setForm(updatedForm);
    await updateInstrument(tenant.id, instrumentId, { imageUrl: photoUrl, gallery: updatedGallery });
  };

  const handleDeletePhoto = async (photoUrl) => {
    if (!tenant) return;
    const confirmDelete = window.confirm("¿Está seguro de eliminar esta fotografía de la galería técnica?");
    if (!confirmDelete) return;

    const updatedGallery = form.gallery ? form.gallery.filter(url => url !== photoUrl) : [];
    const updatedForm = { ...form, gallery: updatedGallery };
    setForm(updatedForm);
    await updateInstrument(tenant.id, instrumentId, { gallery: updatedGallery });
  };

  const handleSave = async () => {
    if (!tenant) return;
    setSaving(true);
    const success = await updateInstrument(tenant.id, instrumentId, form);
    if (success) {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handlePhotoClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    console.log("Subiendo archivo a:", `tenants/${tenant.id}/instrumentos/${instrumentId}`);
    setUploading(true);
    try {
      // Usar un nombre único para evitar problemas de caché o permisos
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const fileRef = ref(storage, `tenants/${tenant.id}/instrumentos/${instrumentId}/${fileName}`);
      
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      console.log("Subida exitosa. URL:", downloadUrl);
      handleChange('imageUrl', downloadUrl);
    } catch (error) {
      console.error("Error crítico en Firebase Storage:", error.code, error.message);
      alert(`No se pudo subir la foto: ${error.message}. Verifica que tengas permisos de escritura en el bucket.`);
    } finally {
      setUploading(false);
    }
  };



  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-10 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-[#FAF8FF] w-full max-w-6xl max-h-[92vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative border border-white/20" onClick={(e) => e.stopPropagation()}>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <input type="file" ref={galleryInputRef} onChange={handleGalleryUpload} className="hidden" accept="image/*" />

        {/* HEADER SUPERIOR */}
        <header className="flex items-center justify-between px-10 py-6 border-b border-[var(--outline-color)]/20 bg-white/80 backdrop-blur-md z-20">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-3.5">
              <span className="text-[var(--text-muted)] font-black text-[9px] uppercase tracking-[0.2em]">Último Cambio: {new Date().toLocaleDateString()}</span>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-4 flex-wrap">
                <input 
                  value={form.nombre} 
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Nombre del Instrumento"
                  className="font-black text-[var(--text-main)] text-3xl uppercase tracking-tighter bg-white border-2 border-[var(--primary)]/20 rounded-xl px-4 py-1 outline-none focus:border-[var(--primary)] max-w-md"
                />
                <span className="px-4 py-2 bg-[#0B1326] text-[#f7931b] border border-[#f7931b]/40 font-mono font-black text-sm rounded-xl uppercase tracking-[0.15em] shadow-md">
                  {form.codigo || inst.codigo}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="font-black text-[var(--text-main)] text-3xl uppercase tracking-tighter leading-none">{form.nombre}</h1>
                <span className="px-4 py-2 bg-[#0B1326] text-[#f7931b] border border-[#f7931b]/40 font-mono font-black text-sm rounded-xl uppercase tracking-[0.15em] shadow-md">
                  {form.codigo || inst.codigo}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={uploading || saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isEditing ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--outline-color)]/30'} ${(uploading || saving) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {(uploading || saving) ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <Check size={18}/> : <Wrench size={18}/>)}
              {saving ? 'Guardando...' : (isEditing ? 'Confirmar y Guardar' : 'Editar Ficha')}
            </button>
            <div className="h-8 w-px bg-[var(--outline-color)]/30"></div>
            <button onClick={onClose} className="p-3 hover:bg-error/10 hover:text-error rounded-2xl transition-all text-[var(--text-muted)]">
               <X size={24}/>
            </button>
          </div>
        </header>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 relative overflow-hidden rounded-2xl h-[360px] group shadow-2xl bg-[#0B1326]">
              {/* IMAGEN DE FONDO DE LOGIN (NÍTIDA CON AJUSTE DE MEZCLA PARA ALTO CONTRASTE) */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={heroImage} 
                  alt="MJM Metrology Background" 
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B1326]/85 via-[#0B1326]/65 to-[#1E293B]/50" />
              </div>
              
              <div 
                className="absolute inset-0 z-10 opacity-75"
                style={{
                  backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.06) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
                  backgroundSize: '100% 100%, 24px 24px, 24px 24px'
                }}
              />

              <div className="absolute inset-0 z-20 flex items-center justify-between px-10 gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 text-[#D4AF37] mb-3 bg-[#D4AF37]/10 backdrop-blur-xl px-4 py-2 rounded-full border border-[#D4AF37]/20">
                     <ShieldCheck size={14}/>
                     <span className="font-black text-[8px] uppercase tracking-[0.3em]">PROCESO: {form.proceso || 'OPERATIVO'}</span>
                  </div>
                  
                  <h3 className="font-black text-white text-3xl uppercase tracking-tighter mb-2 leading-none">
                    {cleanText(form.nombre)}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Historial de rutinas
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 max-w-[320px]">
                    <div className="bg-[#1A202C]/65 border border-white/5 backdrop-blur-md p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 mb-1 uppercase tracking-widest">Marca</p>
                      {isEditing ? (
                        <input value={form.marca} onChange={e => handleChange('marca', e.target.value)} className="bg-transparent border-b border-[var(--primary)] text-white text-xs outline-none w-full" />
                      ) : (
                        <p className="text-xs font-black text-[#D4AF37] uppercase truncate">{form.marca || 'MITUTOYO'}</p>
                      )}
                    </div>
                    <div className="bg-[#1A202C]/65 border border-white/5 backdrop-blur-md p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 mb-1 uppercase tracking-widest">Modelo</p>
                      {isEditing ? (
                        <input value={form.modelo} onChange={e => handleChange('modelo', e.target.value)} className="bg-transparent border-b border-[var(--primary)] text-white text-xs outline-none w-full" />
                      ) : (
                        <p className="text-xs font-black text-white uppercase truncate">{form.modelo || 'S/N'}</p>
                      )}
                    </div>
                    <div className="bg-[#1A202C]/65 border border-white/5 backdrop-blur-md p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 mb-1 uppercase tracking-widest">Serial</p>
                      {isEditing ? (
                        <input value={form.serie} onChange={e => handleChange('serie', e.target.value)} className="bg-transparent border-b border-[var(--primary)] text-white text-xs outline-none w-full" />
                      ) : (
                        <p className="text-xs font-black text-[#D4AF37] uppercase truncate">{form.serie || 'S/N'}</p>
                      )}
                    </div>
                    <div className="bg-[#1A202C]/65 border border-white/5 backdrop-blur-md p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 mb-1 uppercase tracking-widest">Div. de escala</p>
                      {isEditing ? (
                        <input value={form.division_escala} onChange={e => handleChange('division_escala', e.target.value)} className="bg-transparent border-b border-[var(--primary)] text-white text-xs outline-none w-full" />
                      ) : (
                        <p className="text-xs font-black text-white uppercase truncate">
                          {form.division_escala ? String(form.division_escala).replace(/\s*\([^)]*\)/g, '').trim() : 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* IMAGEN PRINCIPAL (CLIC PARA SUBIR O VER AUMENTADA) */}
                {(() => {
                  const currentPhotoUrl = form.imageUrl && !form.imageUrl.includes('photo-1581091226825') 
                    ? form.imageUrl 
                    : manometroIndustrial;

                  return (
                    <div 
                      onClick={() => {
                        if (isEditing) {
                          handlePhotoClick();
                        } else {
                          setZoomedImage(currentPhotoUrl);
                        }
                      }}
                      className={`flex-shrink-0 w-44 h-44 bg-white rounded-[2rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-[#D4AF37]/35 overflow-hidden relative group/img transition-all flex items-center justify-center cursor-pointer hover:border-[#f7931b] hover:scale-105`}
                      title={isEditing ? "Haga clic para subir una nueva imagen" : "Haga clic para ver la imagen aumentada"}
                    >
                      <img 
                        className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover/img:scale-105" 
                        src={currentPhotoUrl} 
                        alt={form.nombre || "Instrumento"} 
                      />
                      {isEditing ? (
                        <div className="absolute inset-0 bg-[#0B1326]/75 flex flex-col items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                           <ImageIcon size={28} className="text-[#D4AF37] mb-2" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-center px-4 text-[#D4AF37]">Click para subir imagen</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-[#0B1326]/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity gap-1.5">
                           <ZoomIn size={26} className="text-[#f7931b] drop-shadow-md animate-in zoom-in-75 duration-200" />
                           <span className="text-[8.5px] font-black uppercase tracking-wider text-white bg-black/60 px-2.5 py-1 rounded-full border border-white/10 shadow-md">
                             Ver Aumentada
                           </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl p-5 border border-[var(--outline-color)] flex flex-col shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--outline-color)]/50">
                <h4 className="font-space font-bold text-sm text-[var(--text-main)] uppercase tracking-tight">Gestión de activo</h4>
                <Building2 size={16} className="text-[var(--primary)]"/>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <EditableItem label="País" field="jerarquia_pais" isEditing={false} form={{ jerarquia_pais: form.jerarquia?.pais || 'Colombia' }} icon={<Globe size={14}/>} />
                <EditableItem label="Planta" field="jerarquia_planta" isEditing={false} form={{ jerarquia_planta: form.jerarquia?.planta || 'Planta Principal' }} icon={<Building2 size={14}/>} />
                <EditableItem label="Área / Sección" field="jerarquia_area" isEditing={false} form={{ jerarquia_area: form.jerarquia?.area || 'Área General' }} icon={<Layers size={14}/>} />
                <EditableItem label="Ubicación Física" field="ubicacion" icon={<MapPin size={14}/>} isEditing={isEditing} form={form} handleChange={handleChange} />
                <EditableItem label="Magnitud" field="magnitud" icon={<Activity size={14}/>} isEditing={isEditing} form={form} handleChange={handleChange} />
                <EditableItem label="Estado de Operación" field="estado_funcional" icon={<ShieldCheck size={14}/>} isEditing={isEditing} form={form} handleChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-[var(--outline-color)] shadow-xs relative">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--primary)]/30 rounded-l-xl" />
               <h4 className="font-mono font-bold text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-4">Capacidad Operativa</h4>
               <div className="space-y-1">
                  <EditableItem label="Capacidad Mínima" field="rango_min" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Capacidad Máxima" field="rango_max" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Resolución" field="resolucion" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-[var(--outline-color)] shadow-xs relative">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--primary)]/30 rounded-l-xl" />
               <h4 className="font-mono font-bold text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-4">Parámetros Técnicos</h4>
               <div className="space-y-1">
                  <EditableItem label="Incertidumbre requerida" field="incertidumbre" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Criticidad" field="criticidad" isEditing={isEditing} form={form} handleChange={handleChange} options={['Alta', 'Media', 'Baja', 'Muy baja']} />
                  <EditableItem label="Tolerancia de proceso" field="tolerancia_proceso" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-[var(--outline-color)] shadow-xs relative">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--primary)]/30 rounded-l-xl" />
               <h4 className="font-mono font-bold text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-4">Control Metrológico</h4>
               <div className="space-y-1">
                  <EditableItem label="Frecuencia calibración (meses)" field="frecuencia_meses" type="number" isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Proceso Vinculado" field="proceso" isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Responsable" field="responsable" isEditing={isEditing} form={form} handleChange={handleChange} />
               </div>
            </div>
          </div>

          {/* GESTIÓN DE RUTINAS E HERENCIA */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[var(--outline-color)] overflow-hidden shadow-xs relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--primary)]" />
            <div className="px-6 py-3 bg-[var(--surface-alt)] flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--outline-color)] gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg"><Activity size={16}/></div>
                <h4 className="font-space font-bold text-sm text-[var(--text-main)] uppercase tracking-tight">Gestión de Rutinas</h4>
              </div>
              
              {/* Botón / Select de Herencia (Removed) */}
            </div>
            
            <div className="p-10">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { key: 'calibracion', label: 'Calibración' },
                   { key: 'verificacion', label: 'Verificación' },
                   { key: 'mantenimiento', label: 'Mantenimiento Preventivo' },
                   { key: 'calificacion', label: 'Calificación de Equipo' }
                 ].map(rutina => (
                   <div 
                     key={rutina.key}
                     className={`flex flex-col p-4 rounded-2xl border transition-all ${form.rutinas?.[rutina.key] ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'bg-[var(--surface-alt)] border-[var(--outline-color)]/30'}`}
                   >
                     <div 
                       onClick={() => handleToggleRutina(rutina.key)} 
                       className={`flex items-center justify-between ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                     >
                       <span className={`text-[10px] font-black uppercase tracking-widest ${form.rutinas?.[rutina.key] ? 'text-emerald-700 dark:text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                         {rutina.label}
                       </span>
                       {/* Toggle UI */}
                       <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${form.rutinas?.[rutina.key] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                         <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${form.rutinas?.[rutina.key] ? 'left-[22px]' : 'left-[2px]'}`} />
                       </div>
                     </div>
                     
                     {/* Inputs Frecuencia + Fecha Inicial + Años */}
                     <div className={`mt-3 pt-3 border-t border-[var(--outline-color)]/30 transition-all ${form.rutinas?.[rutina.key] ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="space-y-3">
                          {/* Row 1: Última Vez (Fecha de Inicio) */}
                          <div>
                            <label className="text-[6px] font-bold text-[var(--text-muted)] uppercase tracking-normal block mb-1 text-center whitespace-nowrap">Última Vez</label>
                            {isEditing ? (
                              <input 
                                type="date" 
                                min={minDateStr}
                                value={form.rutinas?.[`${rutina.key}_fecha_inicial`] || ''}
                                onChange={(e) => handleChangeRutinaFrecuencia(rutina.key, 'fecha_inicial', e.target.value)}
                                className="w-full bg-white border border-[var(--primary)]/30 rounded-lg px-2 py-1.5 text-xs font-black text-[var(--text-main)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-sm text-center"
                              />
                            ) : (
                              <p className="text-xs font-black text-[var(--text-main)] text-center">{form.rutinas?.[`${rutina.key}_fecha_inicial`] ? new Date(form.rutinas[`${rutina.key}_fecha_inicial`]).toISOString().split('T')[0] : 'N/A'}</p>
                            )}
                          </div>
                          
                          {/* Row 2: Meses & Años */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-[6px] font-bold text-[var(--text-muted)] uppercase tracking-normal block mb-1 text-center whitespace-nowrap">Frecuencia (meses)</label>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  min="1"
                                  value={form.rutinas?.[`${rutina.key}_frecuencia`] || ''}
                                  onChange={(e) => handleChangeRutinaFrecuencia(rutina.key, 'frecuencia', e.target.value)}
                                  className="w-full bg-white border border-[var(--primary)]/30 rounded-lg px-2 py-1.5 text-xs font-black text-[var(--text-main)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-sm text-center"
                                  placeholder="12"
                                />
                              ) : (
                                <p className="text-xs font-black text-[var(--text-main)] text-center">{form.rutinas?.[`${rutina.key}_frecuencia`] || 'N/A'}</p>
                              )}
                            </div>
                            <div className="flex-1">
                              <label className="text-[6px] font-bold text-[var(--text-muted)] uppercase tracking-normal block mb-1 text-center whitespace-nowrap">Duración (años)</label>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  min="1"
                                  max="20"
                                  value={form.rutinas?.[`${rutina.key}_anos`] || '5'}
                                  onChange={(e) => handleChangeRutinaFrecuencia(rutina.key, 'anos', e.target.value)}
                                  className="w-full bg-white border border-[var(--primary)]/30 rounded-lg px-2 py-1.5 text-xs font-black text-[var(--text-main)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-sm text-center"
                                  placeholder="5"
                                />
                              ) : (
                                <p className="text-xs font-black text-[var(--text-main)] text-center">{form.rutinas?.[`${rutina.key}_anos`] || '5'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="bg-white px-10 py-6 border-t border-[var(--outline-color)]/20 flex items-center justify-between z-20">
          <div className="flex gap-4">
            <button 
              onClick={() => {
                navigate(`/dashboard/inventario/${instrumentId}`);
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-mjm-navy hover:bg-[#1a3857] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-md"
            >
              <Eye size={18} className="text-[#f7931b]"/> Ver Expediente Completo
            </button>
            <button 
              onClick={() => setShowGallery(true)}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
            >
              <ImageIcon size={18}/> Ver Fotos
            </button>
            <button 
              onClick={handleArchive}
              className="flex items-center gap-2 px-6 py-3 border border-amber-500/40 text-amber-700 dark:text-amber-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
            >
              <Archive size={18}/> Archivar Activo
            </button>
          </div>
          <button 
            onClick={() => window.open(`/dashboard/inventario/imprimir/${instrumentId}`, '_blank')}
            className="flex items-center gap-3 px-10 py-4 bg-[#1A202C] text-white rounded-2xl font-black shadow-xl hover:translate-y-[-2px] hover:shadow-black/30 transition-all uppercase tracking-widest text-[10px]"
          >
            <Layers size={18}/> Imprimir Hoja de Vida Completa
          </button>
        </footer>

        {/* GALERÍA DE FOTOS MODAL */}
        {showGallery && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex flex-col p-8 sm:p-12 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-white font-black text-2xl uppercase tracking-tight">Galería de Fotos Técnicas</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Imágenes de detalle, placas y calibraciones del activo</p>
              </div>
              <button 
                onClick={() => setShowGallery(false)}
                className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                
                {/* Imagen Principal */}
                <div className="relative group rounded-2xl overflow-hidden bg-white border border-[#D4AF37]/50 aspect-square p-4 flex items-center justify-center shadow-lg">
                  <img 
                    src={form.imageUrl && !form.imageUrl.includes('photo-1581091226825') ? form.imageUrl : manometroIndustrial} 
                    alt="Principal" 
                    className="max-w-full max-h-full object-contain mix-blend-multiply" 
                  />
                  <div className="absolute top-3 left-3 bg-[#D4AF37] text-slate-900 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md">
                    Foto Principal
                  </div>
                </div>

                {/* Imágenes Secundarias de Galería */}
                {form.gallery && form.gallery.map((url, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden bg-white border border-white/10 aspect-square p-4 flex items-center justify-center shadow-lg transition-all hover:border-[var(--primary)]/50">
                    <img 
                      src={url} 
                      alt={`Galería ${idx}`} 
                      className="max-w-full max-h-full object-contain mix-blend-multiply" 
                    />
                    
                    {/* Controles al hacer Hover */}
                    <div className="absolute inset-0 bg-[#0B1326]/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-2">
                      <button 
                        onClick={() => setZoomedImage(url)}
                        className="bg-white hover:bg-slate-100 text-slate-900 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1 hover:scale-105 transition-all w-full max-w-[130px] justify-center"
                      >
                        <ZoomIn size={13} className="text-[#f7931b]" /> Ver Aumentada
                      </button>
                      <button 
                        onClick={() => handleSetMainPhoto(url)}
                        className="bg-mjm-navy text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md hover:brightness-110 active:scale-95 transition-all w-full max-w-[130px] justify-center"
                      >
                        Hacer Principal
                      </button>
                      <button 
                        onClick={() => handleDeletePhoto(url)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md hover:bg-red-700 active:scale-95 transition-all w-full max-w-[130px] justify-center"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}

                {/* Subir Nueva Foto Tarjeta */}
                <div 
                  onClick={() => galleryInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-primary/50 rounded-2xl flex flex-col items-center justify-center p-6 aspect-square cursor-pointer transition-colors bg-white/5 hover:bg-white/10 group"
                >
                  {galleryUploading ? (
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={32} className="text-slate-400 group-hover:text-primary mb-2 transition-colors" />
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest text-center transition-colors">Subir Foto</span>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* MODAL / LIGHTBOX DE FOTO AUMENTADA (FULL SCREEN) */}
        {zoomedImage && (
          <div 
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          >
            {/* Header del Lightbox */}
            <div 
              onClick={e => e.stopPropagation()} 
              className="w-full max-w-4xl flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-white"
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#0B1326] text-[#f7931b] border border-[#f7931b]/40 font-mono font-black text-xs rounded-lg uppercase tracking-wider">
                  {form?.codigo || inst?.codigo || 'MJM'}
                </span>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white tracking-tight truncate max-w-md">
                    {cleanText(form?.nombre) || 'Vista de Detalle Metrológico'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {form?.marca} {form?.modelo} • Serial: {form?.serie || 'S/N'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={zoomedImage} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-xs flex items-center gap-1.5 font-bold"
                  title="Abrir imagen en pestaña nueva"
                >
                  <ExternalLink size={15} />
                  <span className="hidden sm:inline text-[11px]">Original</span>
                </a>
                <button 
                  onClick={() => setZoomedImage(null)}
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
                src={zoomedImage} 
                alt="Foto Aumentada del Instrumento" 
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-105" 
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-3 font-mono">
              Haz clic afuera o pulsa <span className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Esc</span> para cerrar
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};


export default function Inventario() {
  const navigate = useNavigate();
  const { tenant, isSuperAdmin, isDemoMode, user } = useAuthStore();
  const { instruments, loading, loadInstruments } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const isDemo = Boolean(isDemoMode || user?.id === 'sandbox-dev-001' || tenant?.id === 'sandboxdemo');

  // Vista Lista (Tabla) por defecto para entornos operativos; Tarjetas para Demo sin preferencia previa
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('mjm_inventory_view_mode');
      if (saved === 'table' || saved === 'grid') return saved;
    } catch (e) {
      console.warn('Error al leer mjm_inventory_view_mode:', e);
    }
    return isDemo ? 'grid' : 'table';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('mjm_inventory_view_mode', mode);
    } catch (e) {
      console.warn('Error al guardar mjm_inventory_view_mode:', e);
    }
  };

  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Activo' | 'Próximo Vencimiento' | 'Vencido'

  React.useEffect(() => {
    if (tenant) {
      const unsub = loadInstruments(tenant.id, isSuperAdmin);
      return () => {
        if (unsub) unsub();
      };
    }
  }, [tenant, isSuperAdmin, loadInstruments]);

  // Conteos en vivo
  const counts = useMemo(() => {
    const nonArchived = instruments.filter(i => !i.archivado);
    const activos = nonArchived.filter(i => i.estado === 'Activo' || !i.estado).length;
    const proximos = nonArchived.filter(i => i.estado === 'Próximo Vencimiento').length;
    const vencidos = nonArchived.filter(i => i.estado === 'Vencido').length;
    return {
      total: nonArchived.length,
      activos,
      proximos,
      vencidos
    };
  }, [instruments]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return instruments.filter(i => {
      if (i.archivado) return false;
      
      // Filtro de Estado
      if (statusFilter !== 'ALL') {
        const actualStatus = i.estado || 'Activo';
        if (actualStatus !== statusFilter) return false;
      }

      // Filtro de Búsqueda
      return [i.nombre, i.codigo, i.codigoMJM, i.marca, i.serie, i.ubicacion, i.magnitud].some(f => 
        f != null && String(f).toLowerCase().includes(searchLower)
      );
    });
  }, [instruments, search, statusFilter]);

  return (
    <div className="w-full">
      
      {/* Header Compacto de Sección */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3.5 pt-3.5 sm:pt-5 animate-in fade-in duration-300">
        <div>
           <h1 className="font-space font-bold text-[var(--text-main)] text-xl sm:text-2xl tracking-tight uppercase leading-tight">
             Inventario <span className="text-mjm-navy dark:text-[#f7931b]">de Activos</span>
           </h1>
           <p className="text-[10.5px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
             Catálogo Central Metrológico &bull; NTC-ISO 10012:2003
           </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => setShowBulk(true)} 
            className="btn-precision-secondary py-1.5 px-3 text-[11px]"
            title="Importar catálogo masivo vía Excel"
          >
            <FileText size={13} /> Carga Masiva
          </button>
        </div>
      </div>

      {/* BARRA DE COMANDOS (Docked Flush al Topbar con 0px de brecha y 100% opacidad) */}
      <div className="sticky top-0 z-30 -mx-3.5 sm:-mx-5 lg:-mx-6 px-3.5 sm:px-5 lg:px-6 md:h-[52px] py-2 md:py-0 bg-[var(--surface)] dark:bg-[var(--surface)] border-b border-[var(--outline-color)] shadow-xs transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 mb-0">
         
         {/* Buscador Integrado */}
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por código, nombre, serie, marca..." 
              className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--surface)] border border-[var(--outline-color)]/30 rounded-lg text-[var(--text-main)] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all font-medium" 
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={12} />
              </button>
            )}
         </div>

         {/* Píldoras de Filtro Rápido */}
         <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: `Todos (${counts.total})`, dot: null },
              { id: 'Activo', label: `Vigentes (${counts.activos})`, dot: 'bg-emerald-500' },
              { id: 'Próximo Vencimiento', label: `Próximos (${counts.proximos})`, dot: 'bg-amber-500' },
              { id: 'Vencido', label: `Vencidos (${counts.vencidos})`, dot: 'bg-red-500' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`h-7 px-2.5 rounded-lg text-[10.5px] font-space font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-[var(--text-main)] text-[var(--surface)] shadow-xs'
                    : 'bg-[var(--surface)]/80 text-[var(--text-muted)] border border-[var(--outline-color)]/30 hover:bg-[var(--surface-alt)] hover:text-[var(--text-main)]'
                }`}
              >
                {f.dot && <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />}
                <span>{f.label}</span>
              </button>
            ))}
         </div>

         {/* Controles de Acción y Alternador de Vista */}
         <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <div className="flex items-center gap-0.5 bg-[var(--surface-alt)] p-0.5 rounded-lg border border-[var(--outline-color)]/30">
              <button
                onClick={() => handleViewModeChange('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[var(--surface)] text-[var(--primary)] shadow-xs font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Vista de Tabla de Precisión (Alta Densidad)"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--surface)] text-[var(--primary)] shadow-xs font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Vista en Cuadrícula (Tarjetas)"
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            <button 
              onClick={() => setShowWizard(true)} 
              className="btn-precision-primary py-1.5 px-3 text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 shadow-xs shrink-0"
              title="Registrar nuevo equipo"
            >
              <Plus size={13} /> Nuevo Activo
            </button>
         </div>

      </div>

      {/* ÁREA DE RESULTADOS */}
      <section className="pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--text-muted)] font-mono text-[9px] uppercase tracking-widest">Consultando Inventario...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)] opacity-60 bg-[var(--surface)] border border-[var(--outline-color)] rounded-xl">
             <AlertTriangle size={32} className="mb-2 text-amber-500" />
             <p className="font-space font-bold text-sm uppercase tracking-tight text-[var(--text-main)]">Sin resultados para la búsqueda</p>
             <p className="text-xs text-[var(--text-muted)] mt-0.5">Intenta con otros términos o limpia los filtros activos.</p>
          </div>
        ) : viewMode === 'table' ? (
          <PrecisionTableView 
            instruments={filtered} 
            onSelect={setSelectedId} 
            onNavigateDetail={(id) => navigate(`/dashboard/inventario/${id}`)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-4">
            {filtered.map(inst => (
              <InstrumentCard key={inst.id} inst={inst} onNavigate={setSelectedId} />
            ))}
          </div>
        )}
      </section>

      {showWizard && <IndustrialWizard onClose={() => setShowWizard(false)} />}
      
      {showBulk && <BulkUploadModal onClose={() => setShowBulk(false)} />}
      
      {/* DETALLE DEL INSTRUMENTO (MODAL TÉCNICO) */}
      {selectedId && (
        <InstrumentDetailsModal 
          instrumentId={selectedId} 
          onClose={() => setSelectedId(null)} 
        />
      )}
    </div>
  );
}

