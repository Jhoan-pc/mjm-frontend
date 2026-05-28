import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import {
  Search, Plus, ChevronRight, ChevronDown, Eye,
  CheckCircle, Clock, AlertCircle, X, Building2, MapPin, Globe,
  Cpu, Layers, Wrench, ShieldCheck, Barcode, Tag,
  Activity, ArrowLeft, Image as ImageIcon, Check,
  AlertTriangle, Filter, Loader2, Archive
} from 'lucide-react';

// --- ESTADO BADGE (METROLOGY PRECISION STYLE) ---
const EstadoBadge = ({ estado }) => {
  const config = {
    'Activo':             { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', icon: <CheckCircle size={12}/> },
    'Próximo Vencimiento':{ bg: 'bg-[var(--tertiary)]/10', text: 'text-[var(--tertiary)]', border: 'border-[var(--tertiary)]/20', icon: <Clock size={12}/> },
    'Vencido':            { bg: 'bg-error/10', text: 'text-error', border: 'border-error/20', icon: <AlertCircle size={12}/> },
  };
  const c = config[estado] || config['Activo'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${c.bg} ${c.text} ${c.border}`}>
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
       <div className="bg-[var(--surface)] shadow-2xl rounded-[2.5rem] border border-[var(--outline-color)] w-full max-w-xl overflow-hidden flex flex-col transition-colors duration-500">
          
          <div className="p-8 border-b border-[var(--outline-color)] flex justify-between items-center bg-[var(--surface-alt)]">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-[var(--primary)] text-[#1A202C] rounded-2xl shadow-lg shadow-[var(--primary)]/20"><Plus size={24}/></div>
                <div>
                   <h2 className="font-black text-[var(--text-main)] text-xl uppercase tracking-tight">Nuevo Activo</h2>
                   <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">Master Inventory Unit</p>
                </div>
             </div>
             <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><X size={24}/></button>
          </div>

          <div className="flex justify-between px-10 py-6 bg-[var(--background)]/50 border-b border-[var(--outline-color)]">
             {steps.map(s => (
               <div 
                key={s.id} 
                onClick={() => setStep(s.id)}
                className="flex flex-col items-center gap-2 cursor-pointer group/step"
               >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-[var(--primary)] text-[#1A202C] shadow-lg shadow-[var(--primary)]/30' : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border border-[var(--outline-color)] group-hover/step:border-[var(--primary)]'}`}>
                    {step > s.id ? <Check size={20}/> : s.icon}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${step === s.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] opacity-50'}`}>{s.title}</span>
               </div>
             ))}
          </div>

          <div className="p-10 flex-1 min-h-[350px]">{renderStep()}</div>

          <div className="p-10 bg-[var(--surface-alt)] border-t border-[var(--outline-color)] flex justify-between gap-4">
             <button onClick={prevStep} disabled={step === 1 || loading} className="btn-secondary py-4 px-8 disabled:opacity-0">REGRESAR</button>
             {step < 4 ? (
               <button onClick={nextStep} className="btn-primary py-4 px-12">SIGUIENTE</button>
             ) : (
               <button 
                onClick={handleFinish} 
                disabled={loading}
                className="btn-primary bg-[#1A202C] text-white py-4 px-12 shadow-xl shadow-black/20 flex items-center gap-3"
               >
                 {loading ? <Loader2 className="animate-spin" size={20}/> : 'FINALIZAR REGISTRO'}
               </button>
             )}
          </div>
       </div>
    </div>
  );
};

// --- INSTRUMENT CARD ---
const InstrumentCard = ({ inst, onNavigate }) => {
  const imgPlaceholder = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800";
  
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
      className="premium-card overflow-hidden group cursor-pointer flex flex-col h-full hover:scale-[1.02] transition-all"
    >
      <div className="h-44 relative overflow-hidden bg-[var(--surface-alt)]">
        <img src={inst.imageUrl || imgPlaceholder} alt={inst.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent opacity-40" />
        
        {/* BADGE DE CÓDIGO (INTENSE DARK GLASS EFFECT WITH PRIMARY TEXT) */}
        <div className="absolute top-4 right-4">
          <span className="bg-[#1A202C]/90 backdrop-blur-xl border border-[var(--primary)]/30 text-[var(--primary)] font-black text-[10px] px-4 py-1.5 rounded-xl shadow-xl shadow-[#1A202C]/10 tracking-[0.2em] uppercase transition-all group-hover:bg-[var(--primary)] group-hover:text-[#1A202C] group-hover:scale-105 group-hover:shadow-[var(--primary)]/30">
            {inst.codigo || inst.codigoMJM || 'S/N'}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div>
           <h4 className="text-[var(--text-main)] font-black text-sm uppercase tracking-tight truncate">
             {cleanText(inst.nombre)}
           </h4>
           <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{inst.marca || 'GENERIC MANUFACTURER'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--background)] rounded-2xl p-3 border border-[var(--outline-color)]">
            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Magnitud</p>
            <p className="text-[10px] font-black text-[var(--primary)] truncate uppercase tracking-tighter">{inst.magnitud}</p>
          </div>
          <div className="bg-[var(--background)] rounded-2xl p-3 border border-[var(--outline-color)] text-right">
            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Capacidad</p>
            <p className="text-[10px] font-data text-[var(--text-main)] truncate tracking-tighter">
              {inst.rango_max || inst.capacidadMaxima || '--'}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--outline-color)]/30">
           <EstadoBadge estado={inst.estado || inst.estado_operativo || 'Activo'} />
           <ChevronRight size={18} className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
        </div>
      </div>
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
      "¡Cumplimiento de la norma ISO 10012!\n\nLos activos metrológicos no se eliminan físicamente del sistema para conservar la trazabilidad histórica de calibraciones e intervenciones técnicas.\n\n¿Confirmas que deseas archivar este activo y retirarlo del inventario activo?"
    );
    if (!confirmArchive) return;
    
    const success = await updateInstrument(tenant.id, instrumentId, { archivado: true });
    if (success) {
      alert("El activo ha sido archivado correctamente para garantizar la trazabilidad normativa.");
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



  return (
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
                <span className="px-4 py-2 bg-[#1A202C] text-[var(--primary)] border border-[var(--primary)]/30 font-black text-sm rounded-xl uppercase tracking-[0.2em] shadow-lg">
                  {form.codigo || inst.codigo}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="font-black text-[var(--text-main)] text-3xl uppercase tracking-tighter leading-none">{form.nombre}</h1>
                <span className="px-4 py-2 bg-[#1A202C] text-[var(--primary)] border border-[var(--primary)]/30 font-black text-sm rounded-xl uppercase tracking-[0.2em] shadow-lg">
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
            <div className="lg:col-span-7 relative overflow-hidden rounded-[2.5rem] h-[360px] group shadow-2xl bg-[#0B1326]">
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

                {/* IMAGEN PRINCIPAL (CLIC PARA SUBIR) */}
                <div 
                  onClick={handlePhotoClick}
                  className={`flex-shrink-0 w-44 h-44 bg-white rounded-[2rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-[#D4AF37]/35 overflow-hidden relative group/img transition-all flex items-center justify-center ${isEditing ? 'cursor-pointer hover:border-[var(--primary)] hover:scale-105' : ''}`}
                >
                  <img className="max-w-full max-h-full object-contain mix-blend-multiply" src={form.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500"} alt="Inst" />
                  {isEditing && (
                    <div className="absolute inset-0 bg-[#0B1326]/75 flex flex-col items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                       <ImageIcon size={28} className="text-[#D4AF37] mb-2" />
                       <span className="text-[8px] font-black uppercase tracking-widest text-center px-4 text-[#D4AF37]">Click para subir imagen</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 border border-[var(--outline-color)]/30 flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-xl text-[var(--text-main)] uppercase tracking-tighter">Gestión de activo</h4>
                <Building2 size={20} className="text-[var(--primary)]"/>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <EditableItem label="País" field="jerarquia_pais" isEditing={false} form={{ jerarquia_pais: form.jerarquia?.pais || 'Colombia' }} icon={<Globe size={14}/>} />
                <EditableItem label="Planta" field="jerarquia_planta" isEditing={false} form={{ jerarquia_planta: form.jerarquia?.planta || 'Planta Principal' }} icon={<Building2 size={14}/>} />
                <EditableItem label="Área / Sección" field="jerarquia_area" isEditing={false} form={{ jerarquia_area: form.jerarquia?.area || 'Área General' }} icon={<Layers size={14}/>} />
                <EditableItem label="Ubicación Física" field="ubicacion" icon={<MapPin size={14}/>} isEditing={isEditing} form={form} handleChange={handleChange} />
                <EditableItem label="Magnitud" field="magnitud" icon={<Activity size={14}/>} isEditing={isEditing} form={form} handleChange={handleChange} />
                <EditableItem label="Estado de Operación" field="estado_funcional" icon={<ShieldCheck size={14}/>} isEditing={isEditing} form={form} handleChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-[var(--outline-color)]/20 shadow-sm relative">
               <div className="absolute top-0 left-0 w-2 h-full bg-[var(--primary)]/10" />
               <h4 className="font-black text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6">Capacidad Operativa</h4>
               <div className="space-y-2">
                  <EditableItem label="Capacidad Mínima" field="rango_min" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Capacidad Máxima" field="rango_max" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Resolución" field="resolucion" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
               </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-[var(--outline-color)]/20 shadow-sm relative">
               <div className="absolute top-0 left-0 w-2 h-full bg-[var(--primary)]/10" />
               <h4 className="font-black text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6">Parámetros Técnicos</h4>
               <div className="space-y-2">
                  <EditableItem label="Incertidumbre requerida" field="incertidumbre" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Criticidad" field="criticidad" isEditing={isEditing} form={form} handleChange={handleChange} options={['Alta', 'Media', 'Baja', 'Muy baja']} />
                  <EditableItem label="Tolerancia de proceso" field="tolerancia_proceso" hasUnit={true} isEditing={isEditing} form={form} handleChange={handleChange} />
               </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-[var(--outline-color)]/20 shadow-sm relative">
               <div className="absolute top-0 left-0 w-2 h-full bg-[var(--primary)]/10" />
               <h4 className="font-black text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6">Control Metrológico</h4>
               <div className="space-y-2">
                  <EditableItem label="Frecuencia calibración (meses)" field="frecuencia_meses" type="number" isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Proceso Vinculado" field="proceso" isEditing={isEditing} form={form} handleChange={handleChange} />
                  <EditableItem label="Responsable" field="responsable" isEditing={isEditing} form={form} handleChange={handleChange} />
               </div>
            </div>
          </div>

          {/* GESTIÓN DE RUTINAS E HERENCIA */}
          <div className="bg-white rounded-[2.5rem] border border-[var(--outline-color)]/30 overflow-hidden shadow-lg relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-[var(--primary)]" />
            <div className="px-10 py-6 bg-[var(--surface-alt)] flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--outline-color)]/30 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl"><Activity size={20}/></div>
                <h4 className="font-black text-xl text-[var(--text-main)] uppercase tracking-tighter">Gestión de Rutinas</h4>
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
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[#1A202C] rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-md"
            >
              <Eye size={18}/> Ver Expediente Completo
            </button>
            <button 
              onClick={() => setShowGallery(true)}
              className="flex items-center gap-2 px-6 py-3 border border-[var(--outline-color)] text-[var(--text-muted)] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--surface-alt)] transition-all"
            >
              <ImageIcon size={18}/> Ver Fotos
            </button>
            <button 
              onClick={handleArchive}
              className="flex items-center gap-2 px-6 py-3 border border-amber-600/30 text-amber-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500/5 transition-all"
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
                    src={form.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500"} 
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
                    <div className="absolute inset-0 bg-[#0B1326]/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <button 
                        onClick={() => handleSetMainPhoto(url)}
                        className="bg-primary text-[#1A202C] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md hover:brightness-110 active:scale-95 transition-all"
                      >
                        Hacer Principal
                      </button>
                      <button 
                        onClick={() => handleDeletePhoto(url)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md hover:bg-red-700 active:scale-95 transition-all"
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
      </div>
    </div>
  );
};


export default function Inventario() {
  const { tenant, isSuperAdmin } = useAuthStore();
  const { instruments, loading, loadInstruments } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  React.useEffect(() => {
    if (tenant) loadInstruments(tenant.id, isSuperAdmin);
  }, [tenant, isSuperAdmin, loadInstruments]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return instruments.filter(i => 
      !i.archivado && 
      [i.nombre, i.codigo, i.marca, i.serie].some(f => 
        f != null && String(f).toLowerCase().includes(searchLower)
      )
    );
  }, [instruments, search]);

  return (
    <div className="space-y-gutter animate-in fade-in duration-500">
      
      {/* Search & Actions */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
         <div className="flex-1 space-y-6">
            <div>
               <h1 className="font-black text-[var(--text-main)] text-4xl tracking-tighter uppercase">Inventario <span className="text-[var(--primary)] italic">de Activos</span></h1>
            </div>
            <div className="relative group w-full">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
               <input 
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por ID, Nombre o Marca..." 
                className="w-full bg-[var(--surface)] border border-[var(--outline-color)] rounded-2xl pl-14 pr-8 py-5 text-[var(--text-main)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] transition-all shadow-sm font-medium" />
            </div>
         </div>
         <div className="flex gap-4 pb-1 shrink-0">
            <button onClick={() => setShowWizard(true)} className="btn-primary py-4 px-10 shadow-xl shadow-[var(--primary)]/20"><Plus size={20}/> Nuevo Activo</button>
         </div>
      </section>

      {/* Main Grid */}
      <section className="pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-lg shadow-[var(--primary)]/20" />
            <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando Laboratorio...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-[var(--text-muted)] opacity-30">
             <AlertTriangle size={64} className="mb-4" />
             <p className="font-black text-xl uppercase tracking-tighter">No se encontraron resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {filtered.map(inst => (
              <InstrumentCard key={inst.id} inst={inst} onNavigate={setSelectedId} />
            ))}
          </div>
        )}
      </section>

      {showWizard && <IndustrialWizard onClose={() => setShowWizard(false)} />}
      
      {/* DETALLE DEL INSTRUMENTO (MODAL NUEVO) */}
      {selectedId && (
        <InstrumentDetailsModal 
          instrumentId={selectedId} 
          onClose={() => setSelectedId(null)} 
        />
      )}
    </div>
  );
}

