import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import {
  Search, Plus, ChevronRight, ChevronDown, Eye, AlertTriangle,
  CheckCircle, Clock, XCircle, Filter, X, Building2, MapPin,
  Cpu, Layers, Workflow, Wrench
} from 'lucide-react';

// ─── Estado Badge ──────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }) => {
  const config = {
    'Vigente':            { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle },
    'Próximo Vencimiento':{ bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',   icon: Clock },
    'Vencido':            { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500',     icon: XCircle },
    'En Reparación':      { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',    icon: Wrench },
  };
  const c = config[estado] || config['Vigente'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {estado}
    </span>
  );
};

// ─── Criticidad Badge ──────────────────────────────────────────────────────
const CriticidadBadge = ({ criticidad }) => {
  const map = {
    'Crítica': 'bg-red-100 text-red-700',
    'Alta':    'bg-orange-100 text-orange-700',
    'Normal':  'bg-blue-100 text-blue-700',
    'Baja':    'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${map[criticidad] || map['Normal']}`}>
      {criticidad}
    </span>
  );
};

// ─── Árbol Jerárquico ──────────────────────────────────────────────────────
const HierarchyTree = ({ instruments, activeFilter, onFilterChange }) => {
  const [expanded, setExpanded] = useState({});
  
  // Construir árbol desde jerarquías de los instrumentos
  const tree = useMemo(() => {
    const root = {};
    instruments.forEach(inst => {
      const j = inst.jerarquia || {};
      const keys = [j.planta, j.area, j.proceso, j.ubicacion].filter(Boolean);
      let node = root;
      keys.forEach((key, idx) => {
        if (!node[key]) node[key] = { _children: {}, _count: 0 };
        node[key]._count++;
        if (idx === keys.length - 1) node[key]._hasInstruments = true;
        node = node[key]._children;
      });
    });
    return root;
  }, [instruments]);

  const toggle = (path) => setExpanded(e => ({ ...e, [path]: !e[path] }));

  const renderNode = (nodes, depth = 0, pathPrefix = '') => {
    const icons = [Building2, Layers, Workflow, MapPin, Cpu];
    const Icon = icons[Math.min(depth, icons.length - 1)];
    return Object.entries(nodes).map(([key, val]) => {
      const path = `${pathPrefix}/${key}`;
      const isExpanded = expanded[path];
      const hasChildren = Object.keys(val._children || {}).length > 0;
      const isActive = activeFilter === key;
      return (
        <div key={path}>
          <button
            onClick={() => { toggle(path); onFilterChange(isActive ? null : key); }}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left transition-all text-sm group ${isActive ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown size={13} className="shrink-0 opacity-60" /> : <ChevronRight size={13} className="shrink-0 opacity-40" />
            ) : <span className="w-3.5" />}
            <Icon size={13} className="shrink-0" />
            <span className="truncate flex-1 font-medium">{key}</span>
            <span className={`text-[10px] font-black rounded px-1.5 py-0.5 ${isActive ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>{val._count}</span>
          </button>
          {isExpanded && hasChildren && (
            <div>{renderNode(val._children, depth + 1, path)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-0.5">
      <button onClick={() => onFilterChange(null)} className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${!activeFilter ? 'bg-[#050b14] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
        <Layers size={13} />
        <span className="flex-1 text-left">Todos los Equipos</span>
        <span className={`text-[10px] font-black rounded px-1.5 py-0.5 ${!activeFilter ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{instruments.length}</span>
      </button>
      {renderNode(tree)}
    </div>
  );
};

// ─── Componente Tarjeta de Instrumento (Premium) ──────────────────────────
const InstrumentCard = ({ inst, onNavigate }) => {
  // Mapa de imágenes técnicas por magnitud para realismo
  const imageMap = {
    'Longitud':    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800',
    'Temperatura': 'https://images.unsplash.com/photo-1510218830377-0e9d01d49650?auto=format&fit=crop&q=80&w=800',
    'Presión':     'https://images.unsplash.com/photo-1581093450021-4a7360e9a6ad?auto=format&fit=crop&q=80&w=800',
    'Masa':        'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800',
    'Default':     'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
  };

  const img = inst.imageUrl || imageMap[inst.magnitud] || imageMap['Default'];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-mjm-navy/5 overflow-hidden group hover:shadow-2xl hover:shadow-mjm-orange/10 transition-all transform hover:-translate-y-2 flex flex-col h-full border-t-4 border-t-mjm-orange/20">
      {/* Header con Imagen */}
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={inst.nombre} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className="bg-[#050b14] text-white font-mono text-[10px] px-3 py-1 rounded-full border border-white/20 uppercase tracking-widest shadow-lg">
            {inst.codigoMJM}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <CriticidadBadge criticidad={inst.criticidad} />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-black uppercase text-sm tracking-tighter truncate">{inst.nombre}</p>
        </div>
      </div>

      {/* Cuerpo de Datos */}
      <div className="p-6 flex-1 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Marca / Modelo</span>
            <p className="text-xs font-bold text-mjm-navy truncate">{inst.marca || 'N/A'} · {inst.modelo || '--'}</p>
          </div>
          <div className="space-y-1 border-l border-gray-100 pl-4">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Magnitud</span>
            <p className="text-xs font-black text-mjm-orange uppercase">{inst.magnitud}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 bg-gray-50/50 -mx-6 px-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Resolución</span>
            <p className="text-xs font-mono font-bold text-gray-600">{inst.resolucion || '--'}</p>
          </div>
          <div className="space-y-1 border-l border-gray-200 pl-4">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Capacidad Max</span>
            <p className="text-xs font-mono font-bold text-gray-600 truncate">{inst.capacidadMaxima || inst.capacidadMax || '--'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Estado</span>
            <EstadoBadge estado={inst.estado} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Próx. Vencimiento</span>
            <span className="text-xs font-mono font-black text-mjm-navy bg-mjm-navy/5 px-2 py-1 rounded">{inst.proximaCalibracion || '--'}</span>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={() => onNavigate(inst.id)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#050b14] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200 group/btn"
          >
            <Eye size={14} className="group-hover/btn:scale-125 transition-transform" /> Ver Hoja de Vida
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Nuevo Instrumento ────────────────────────────────────────────────
const NuevoInstrumentoModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre: '', marca: '', modelo: '', serie: '', codigoInterno: '',
    resolucion: '', capacidadMaxima: '', magnitud: 'Longitud', criticidad: 'Normal',
    anioAdquisicion: new Date().getFullYear(), proveedor: '', accesorios: '',
    jerarquia: { pais: 'Colombia', planta: '', area: '', proceso: '', ubicacion: '' },
    rutinas: [],
  });
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setJ = (field, val) => setForm(f => ({ ...f, jerarquia: { ...f.jerarquia, [field]: val } }));
  const toggleRutina = (r) => setForm(f => ({
    ...f, rutinas: f.rutinas.includes(r) ? f.rutinas.filter(x => x !== r) : [...f.rutinas, r]
  }));

  const MAGNITUDES = ['Longitud', 'Temperatura', 'Presión', 'Masa', 'Fuerza', 'Volumen', 'Caudal', 'Humedad', 'Voltaje', 'Corriente', 'Resistencia', 'Vibración', 'Torque', 'Tiempo'];
  const RUTINAS = ['Calibración', 'Verificación', 'Calificación', 'Mantenimiento'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#050b14] text-white px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider">Nuevo Instrumento</h2>
            <p className="text-[11px] text-white/50 mt-0.5">Complete los datos técnicos del equipo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X size={18}/></button>
        </div>
        <div className="p-6 space-y-6">
          {/* Identificación */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Identificación del Equipo</h3>
            <div className="grid grid-cols-2 gap-3">
              {[['nombre','Nombre del Instrumento',''],['marca','Marca',''],['modelo','Modelo',''],['serie','N° de Serie',''],['codigoInterno','Código Interno Cliente',''],['proveedor','Proveedor / Fabricante','']].map(([f,l]) => (
                <div key={f} className={f==='nombre' ? 'col-span-2' : ''}>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">{l}</label>
                  <input value={form[f]} onChange={e => set(f, e.target.value)} className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
                </div>
              ))}
            </div>
          </section>
          {/* Características Técnicas */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Características Técnicas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Magnitud</label>
                <select value={form.magnitud} onChange={e => set('magnitud', e.target.value)} className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50">
                  {MAGNITUDES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Criticidad</label>
                <select value={form.criticidad} onChange={e => set('criticidad', e.target.value)} className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50">
                  {['Crítica','Alta','Normal','Baja'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Resolución</label>
                <input value={form.resolucion} onChange={e => set('resolucion', e.target.value)} placeholder="Ej: 0.001 mm" className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Capacidad Máxima</label>
                <input value={form.capacidadMaxima} onChange={e => set('capacidadMaxima', e.target.value)} placeholder="Ej: 25 mm" className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Año Adquisición</label>
                <input type="number" value={form.anioAdquisicion} onChange={e => set('anioAdquisicion', e.target.value)} className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Accesorios (opcional)</label>
                <input value={form.accesorios} onChange={e => set('accesorios', e.target.value)} className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
              </div>
            </div>
          </section>
          {/* Jerarquía */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Jerarquía de Ubicación</h3>
            <div className="grid grid-cols-2 gap-3">
              {[['planta','Planta'],['area','Área'],['proceso','Proceso'],['ubicacion','Ubicación Física']].map(([f,l]) => (
                <div key={f}>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">{l}</label>
                  <input value={form.jerarquia[f]} onChange={e => setJ(f, e.target.value)} className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
                </div>
              ))}
            </div>
          </section>
          {/* Rutinas */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Rutinas Aplicables</h3>
            <div className="flex flex-wrap gap-2">
              {RUTINAS.map(r => (
                <button key={r} onClick={() => toggleRutina(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${form.rutinas.includes(r) ? 'bg-[#050b14] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {r}
                </button>
              ))}
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition">Cancelar</button>
          <button onClick={() => { onSave(form); onClose(); }} className="px-6 py-2.5 text-sm font-black uppercase tracking-wider bg-[#EE8C2C] text-white rounded-lg hover:bg-[#d47d22] transition shadow-lg shadow-orange-200">
            Registrar Instrumento
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Página Principal Inventario ───────────────────────────────────────────
export default function Inventario() {
  const navigate = useNavigate();
  const { tenant, isSuperAdmin, user } = useAuthStore();
  const { instruments, loadInstruments, addInstrument, loading } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [magnitudFilter, setMagnitudFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const isAdmin = user?.rol === 'admin';

  // 🔄 Carga de Datos Reales
  React.useEffect(() => {
    if (tenant) loadInstruments(tenant.id, isSuperAdmin);
  }, [tenant, isSuperAdmin, loadInstruments]);

  const displayedInstruments = instruments; 

  const filtered = useMemo(() => {
    return displayedInstruments.filter(i => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q || [
        // Identificación
        i.nombre, i.marca, i.modelo, i.serie,
        i.codigoMJM, i.codigoInterno,
        // Características técnicas
        i.magnitud, i.resolucion, i.capacidadMax, i.capacidadMaxima,
        i.criticidad, i.estado,
        // Adquisición y origen
        i.proveedor, i.accesorios,
        String(i.anioAdquisicion ?? ''),
        // Jerarquía operativa
        ...(i.jerarquia ? Object.values(i.jerarquia) : []),
        // Ubicación plana (retrocompatibilidad)
        i.ubicacion,
      ].some(v => v?.toString().toLowerCase().includes(q));
      const matchFilter = !activeFilter || Object.values(i.jerarquia || {}).includes(activeFilter);
      const matchMagnitud = !magnitudFilter || i.magnitud === magnitudFilter;
      const matchEstado = !estadoFilter || i.estado === estadoFilter;
      return matchSearch && matchFilter && matchMagnitud && matchEstado;
    });
  }, [displayedInstruments, search, activeFilter, magnitudFilter, estadoFilter]);

  const kpis = useMemo(() => {
    const total = displayedInstruments.length;
    const vigentes = displayedInstruments.filter(i => i.estado === 'Vigente').length;
    const proximos = displayedInstruments.filter(i => i.estado === 'Próximo Vencimiento').length;
    const vencidos = displayedInstruments.filter(i => i.estado === 'Vencido').length;
    return { total, vigentes, proximos, vencidos, pct: total ? Math.round((vigentes / total) * 100) : 0 };
  }, [displayedInstruments]);

  return (
    <div className="flex gap-6 h-full min-h-0 bg-[#f8f9fa] p-6 lg:p-10">
      {showModal && <NuevoInstrumentoModal onClose={() => setShowModal(false)} onSave={(data) => addInstrument(data, tenant?.id)} />}

      {/* ── Sidebar Árbol Jerárquico ── */}
      <aside className="w-72 shrink-0 bg-white rounded-2xl shadow-xl shadow-mjm-navy/5 overflow-hidden flex flex-col border border-mjm-navy/5">
        <div className="p-6 bg-mjm-navy text-white">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Estructura Operativa</h3>
          <p className="text-lg font-black tracking-tighter truncate">{tenant?.nombre_empresa}</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <HierarchyTree instruments={displayedInstruments} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>
      </aside>

      {/* ── Panel Principal ── */}
      <main className="flex-1 flex flex-col gap-6 min-w-0">
        {/* KPIs rápidos */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Total Equipos', value: kpis.total, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'Vigentes', value: kpis.vigentes, color: 'text-emerald-600', bg: 'bg-white' },
            { label: 'Próx. Vencimiento', value: kpis.proximos, color: 'text-amber-600', bg: 'bg-white' },
            { label: 'Vencidos', value: kpis.vencidos, color: 'text-red-600', bg: 'bg-white' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-6 shadow-xl shadow-mjm-navy/5 border border-mjm-navy/5`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
              <p className={`text-4xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Barra Búsqueda y Acción */}
        <div className="bg-white rounded-2xl shadow-xl shadow-mjm-navy/5 p-6 border border-mjm-navy/5">
          <div className="flex flex-col xl:flex-row xl:items-center gap-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, código, marca, modelo, serie, proveedor, área, criticidad..."
                className="w-full pl-12 pr-10 py-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-4 focus:ring-orange-400/10 transition-all border border-transparent focus:border-orange-400/20"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <select value={magnitudFilter} onChange={e => setMagnitudFilter(e.target.value)} className="bg-gray-50 border border-mjm-navy/5 rounded-xl px-5 py-4 text-sm font-bold text-gray-600 focus:outline-none focus:ring-4 focus:ring-orange-400/10">
                <option value="">Magnitudes</option>
                {['Longitud','Temperatura','Temperatura Infraroja','Presión','Masa','Fuerza','Volumen','Caudal','Voltaje','Corriente','Resistencia','Vibración','Torque','Tiempo','Tiempo y Frecuencia','Humedad'].map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="bg-gray-50 border border-mjm-navy/5 rounded-xl px-5 py-4 text-sm font-bold text-gray-600 focus:outline-none focus:ring-4 focus:ring-orange-400/10">
                <option value="">Estados</option>
                {['Vigente','Próximo Vencimiento','Vencido','En Reparación'].map(s => <option key={s}>{s}</option>)}
              </select>
              {isAdmin && (
                <button onClick={() => setShowModal(true)} className="flex items-center gap-3 px-8 py-4 bg-[#EE8C2C] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#d47d22] transition shadow-xl shadow-orange-200 shrink-0">
                  <Plus size={18} /> Nuevo Equipo
                </button>
              )}
            </div>
          </div>
          {(activeFilter || search || magnitudFilter || estadoFilter) && (
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Filtros:</span>
              <div className="flex flex-wrap gap-2">
                {activeFilter && <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2 border border-orange-200">{activeFilter}<button onClick={() => setActiveFilter(null)}><X size={12}/></button></span>}
                {magnitudFilter && <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2 border border-blue-200">{magnitudFilter}<button onClick={() => setMagnitudFilter('')}><X size={12}/></button></span>}
                {estadoFilter && <span className="bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2 border border-gray-200">{estadoFilter}<button onClick={() => setEstadoFilter('')}><X size={12}/></button></span>}
              </div>
            </div>
          )}
        </div>

        {/* Galería de Instrumentos en Tarjetas */}
        <div className="flex-1 overflow-y-auto pb-10">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-mjm-navy uppercase tracking-tighter">Sin resultados</h3>
              <p className="text-sm text-gray-400 mt-2 font-medium max-w-xs mx-auto">No encontramos instrumentos que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-8">
              {filtered.map((inst) => (
                <InstrumentCard 
                  key={inst.id} 
                  inst={inst} 
                  onNavigate={(id) => navigate(`/dashboard/inventario/${id}`)} 
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-mjm-navy p-4 rounded-xl flex items-center justify-between text-white/50 text-[10px] font-black uppercase tracking-widest border border-white/5">
          <span>Mostrando <strong>{filtered.length}</strong> de <strong>{displayedInstruments.length}</strong> instrumentos</span>
          <span>GESTIÓN METROLÓGICA V2.0</span>
        </div>
      </main>
    </div>
  );
}
