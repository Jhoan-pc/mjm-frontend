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
  const { instruments, addInstrument, loading } = useInventoryStore();
  const { tenant, user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [magnitudFilter, setMagnitudFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const isAdmin = user?.rol === 'admin';

  const tenantInstruments = instruments.filter(i => !i.tenantId || i.tenantId === tenant?.id || tenant?.id === 'mjm_admin');

  const filtered = useMemo(() => {
    return tenantInstruments.filter(i => {
      const q = search.toLowerCase();
      const matchSearch = !search || [i.nombre, i.marca, i.modelo, i.serie, i.codigoInterno, i.magnitud].some(v => v?.toLowerCase().includes(q));
      const matchFilter = !activeFilter || Object.values(i.jerarquia || {}).includes(activeFilter);
      const matchMagnitud = !magnitudFilter || i.magnitud === magnitudFilter;
      const matchEstado = !estadoFilter || i.estado === estadoFilter;
      return matchSearch && matchFilter && matchMagnitud && matchEstado;
    });
  }, [tenantInstruments, search, activeFilter, magnitudFilter, estadoFilter]);

  const kpis = useMemo(() => {
    const total = tenantInstruments.length;
    const vigentes = tenantInstruments.filter(i => i.estado === 'Vigente').length;
    const proximos = tenantInstruments.filter(i => i.estado === 'Próximo Vencimiento').length;
    const vencidos = tenantInstruments.filter(i => i.estado === 'Vencido').length;
    return { total, vigentes, proximos, vencidos, pct: total ? Math.round((vigentes / total) * 100) : 0 };
  }, [tenantInstruments]);

  return (
    <div className="flex gap-6 h-full min-h-0">
      {showModal && <NuevoInstrumentoModal onClose={() => setShowModal(false)} onSave={(data) => addInstrument(data, tenant?.id)} />}

      {/* ── Sidebar Árbol Jerárquico ── */}
      <aside className="w-64 shrink-0 bg-white rounded-xl shadow-sm overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Jerarquía</h3>
          <p className="text-sm font-bold text-gray-700 mt-0.5">{tenant?.nombre_empresa}</p>
        </div>
        <div className="p-3 flex-1 overflow-y-auto">
          <HierarchyTree instruments={tenantInstruments} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>
      </aside>

      {/* ── Panel Principal ── */}
      <main className="flex-1 flex flex-col gap-4 min-w-0">
        {/* KPIs rápidos */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Equipos', value: kpis.total, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'Vigentes', value: kpis.vigentes, color: 'text-emerald-600', bg: 'bg-white' },
            { label: 'Próx. Vencimiento', value: kpis.proximos, color: 'text-amber-600', bg: 'bg-white' },
            { label: 'Vencidos', value: kpis.vencidos, color: 'text-red-600', bg: 'bg-white' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 shadow-sm`}>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</p>
              <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Barra Búsqueda y Acción */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, serie, código o magnitud..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              />
            </div>
            <select value={magnitudFilter} onChange={e => setMagnitudFilter(e.target.value)} className="bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400/40">
              <option value="">Todas las magnitudes</option>
              {['Longitud','Temperatura','Presión','Masa','Fuerza','Volumen','Caudal','Voltaje','Corriente','Vibración'].map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="bg-gray-50 border-0 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400/40">
              <option value="">Todos los estados</option>
              {['Vigente','Próximo Vencimiento','Vencido','En Reparación'].map(s => <option key={s}>{s}</option>)}
            </select>
            {isAdmin && (
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#EE8C2C] text-white rounded-lg text-sm font-black uppercase tracking-wider hover:bg-[#d47d22] transition shadow-md shadow-orange-200 shrink-0">
                <Plus size={15} /> Agregar
              </button>
            )}
          </div>
          {(activeFilter || search || magnitudFilter || estadoFilter) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Filtros activos:</span>
              {activeFilter && <span className="bg-orange-100 text-orange-700 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">{activeFilter}<button onClick={() => setActiveFilter(null)}><X size={10}/></button></span>}
              {magnitudFilter && <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">{magnitudFilter}<button onClick={() => setMagnitudFilter('')}><X size={10}/></button></span>}
              {estadoFilter && <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">{estadoFilter}<button onClick={() => setEstadoFilter('')}><X size={10}/></button></span>}
            </div>
          )}
        </div>

        {/* Tabla de Instrumentos */}
        <div className="bg-white rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {['Código MJM','Nombre / Modelo','Marca','Magnitud','Resolución','Capacidad','Criticidad','Estado Calibración','Próx. Vencimiento','Acción'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-16 text-gray-400 text-sm">No se encontraron instrumentos</td></tr>
                ) : filtered.map((inst, idx) => (
                  <tr key={inst.id} className={`border-t border-gray-50 hover:bg-orange-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 font-mono text-[11px] font-black text-gray-500">{inst.codigoMJM}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 text-[13px] leading-tight">{inst.nombre}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{inst.modelo} · {inst.codigoInterno}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{inst.marca}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{inst.magnitud}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-500">{inst.resolucion}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-500 whitespace-nowrap">{inst.capacidadMaxima}</td>
                    <td className="px-4 py-3"><CriticidadBadge criticidad={inst.criticidad} /></td>
                    <td className="px-4 py-3"><EstadoBadge estado={inst.estado} /></td>
                    <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap font-mono">{inst.proximaCalibracion}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/dashboard/inventario/${inst.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#050b14] text-white rounded-lg text-[11px] font-black uppercase tracking-wider hover:bg-gray-800 transition"
                      >
                        <Eye size={12} /> Ver HV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Mostrando <strong>{filtered.length}</strong> de <strong>{tenantInstruments.length}</strong> instrumentos</span>
          </div>
        </div>
      </main>
    </div>
  );
}
