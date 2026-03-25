import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import { useReactToPrint } from 'react-to-print';
import {
  ArrowLeft, Printer, Download, CalendarPlus, CheckCircle, Clock,
  XCircle, Wrench, AlertTriangle, FileText, ClipboardList, Settings2,
  Calendar, Plus, X, RefreshCw
} from 'lucide-react';

// ─── Estado Badge ──────────────────────────────────────────────────────────
const EstadoBadge = ({ estado, size = 'md' }) => {
  const config = {
    'Vigente':            { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    'Próximo Vencimiento':{ bg: 'bg-amber-100',   text: 'text-amber-700',   icon: Clock },
    'Vencido':            { bg: 'bg-red-100',      text: 'text-red-700',     icon: XCircle },
    'En Reparación':      { bg: 'bg-gray-100',     text: 'text-gray-600',    icon: Wrench },
  };
  const c = config[estado] || config['Vigente'];
  const Icon = c.icon;
  const sizeClass = size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-2 rounded-lg font-black uppercase tracking-wider ${c.bg} ${c.text} ${sizeClass}`}>
      <Icon size={size === 'lg' ? 16 : 12} />
      {estado}
    </span>
  );
};

// ─── Modal Programar Evento ────────────────────────────────────────────────
const ProgramarEventoModal = ({ instrument, onClose, onSave }) => {
  const [form, setForm] = useState({
    tipo: 'Calibración', laboratorio: '', fechaInicio: '', frecuenciaNum: 6,
    frecuenciaUnidad: 'meses', repeticiones: 4, observaciones: ''
  });
  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const { activities, addActivity } = useInventoryStore();

  const handleSave = () => {
    // Generar actividades cíclicas
    let fecha = new Date(form.fechaInicio);
    for (let i = 0; i < form.repeticiones; i++) {
      if (i > 0) {
        if (form.frecuenciaUnidad === 'meses') fecha.setMonth(fecha.getMonth() + parseInt(form.frecuenciaNum));
        if (form.frecuenciaUnidad === 'dias') fecha.setDate(fecha.getDate() + parseInt(form.frecuenciaNum));
        if (form.frecuenciaUnidad === 'años') fecha.setFullYear(fecha.getFullYear() + parseInt(form.frecuenciaNum));
      }
      addActivity({
        instrumentId: instrument.id,
        instrumentNombre: instrument.nombre,
        codigoMJM: instrument.codigoMJM,
        cliente: instrument.jerarquia?.cliente || 'Cliente',
        tipo: form.tipo,
        laboratorio: form.laboratorio,
        fechaProgramada: new Date(fecha).toISOString().split('T')[0],
        prioridad: instrument.criticidad === 'Crítica' ? 'Alta' : instrument.criticidad || 'Normal',
        observaciones: form.observaciones,
        ciclo: { total: form.repeticiones, numero: i + 1 }
      });
    }
    onSave?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="bg-[#050b14] text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider">Programar Evento</h2>
            <p className="text-[11px] text-white/50 mt-0.5">{instrument?.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={18}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Tipo de Rutina</label>
            <div className="grid grid-cols-2 gap-2">
              {(instrument?.rutinas || ['Calibración','Verificación','Calificación','Mantenimiento']).map(r => (
                <button key={r} onClick={() => set('tipo', r)}
                  className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${form.tipo === r ? 'bg-[#050b14] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Fecha Inicio</label>
              <input type="date" value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Laboratorio</label>
              <input value={form.laboratorio} onChange={e => set('laboratorio', e.target.value)} placeholder="Opcional" className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Frecuencia de Repetición</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Cada</span>
              <input type="number" value={form.frecuenciaNum} onChange={e => set('frecuenciaNum', e.target.value)} className="w-16 bg-gray-50 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400/40" min="1" />
              <select value={form.frecuenciaUnidad} onChange={e => set('frecuenciaUnidad', e.target.value)} className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40">
                <option value="dias">Días</option>
                <option value="meses">Meses</option>
                <option value="años">Años</option>
              </select>
              <span className="text-sm text-gray-500">×</span>
              <input type="number" value={form.repeticiones} onChange={e => set('repeticiones', e.target.value)} className="w-16 bg-gray-50 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400/40" min="1" max="20" />
              <span className="text-sm text-gray-500">veces</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Se crearán <strong>{form.repeticiones} actividades</strong> en el planificador</p>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Observaciones</label>
            <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} rows={2} className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40 resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg">Cancelar</button>
          <button onClick={handleSave} disabled={!form.fechaInicio} className="px-6 py-2 text-sm font-black uppercase tracking-wider bg-[#EE8C2C] text-white rounded-lg hover:bg-[#d47d22] disabled:opacity-40 transition shadow-md shadow-orange-200">
            Programar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Contenido Imprimible (Hoja de Vida) ───────────────────────────────────
const PrintableHV = React.forwardRef(({ instrument, tenant }, ref) => (
  <div ref={ref} className="print-only p-8 max-w-4xl mx-auto font-sans">
    {/* Header */}
    <div className="flex items-center justify-between mb-8 pb-6 border-b-4 border-[#050b14]">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Hoja de Vida Metrológica</div>
        <h1 className="text-2xl font-black text-[#050b14] leading-tight">{instrument?.nombre}</h1>
        <div className="text-sm text-gray-500 font-mono mt-1">{instrument?.codigoMJM} · {instrument?.codigoInterno}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{tenant?.nombre_empresa}</div>
        <div className="text-[11px] text-gray-400 mt-1">Generado: {new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}</div>
        <div className="mt-2 inline-block bg-[#050b14] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">{instrument?.estado}</div>
      </div>
    </div>

    {/* Datos Técnicos */}
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        ['Marca', instrument?.marca], ['Modelo', instrument?.modelo], ['N° Serie', instrument?.serie],
        ['Magnitud', instrument?.magnitud], ['Resolución', instrument?.resolucion], ['Cap. Máxima', instrument?.capacidadMaxima],
        ['Criticidad', instrument?.criticidad], ['Año Adquisición', instrument?.anioAdquisicion], ['Proveedor', instrument?.proveedor],
      ].map(([label, val]) => (
        <div key={label} className="bg-gray-50 p-3 rounded">
          <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</div>
          <div className="text-sm font-bold text-gray-800 mt-1">{val || '—'}</div>
        </div>
      ))}
    </div>

    {/* Historial */}
    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 pt-4 border-t border-gray-200">Historial de Actividades Metrológicas</h2>
    <table className="w-full text-sm mb-8">
      <thead>
        <tr className="bg-[#050b14] text-white">
          {['Fecha', 'Tipo', 'Laboratorio', 'N° Certificado', 'Resultado', 'Observaciones'].map(h => (
            <th key={h} className="text-left px-3 py-2 text-[9px] font-black uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(instrument?.historial || []).length === 0 ? (
          <tr><td colSpan={6} className="text-center py-6 text-gray-400 text-sm">Sin registros en el historial</td></tr>
        ) : (instrument?.historial || []).map((h, i) => (
          <tr key={h.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-3 py-2 font-mono text-xs">{h.fecha}</td>
            <td className="px-3 py-2 font-bold">{h.tipo}</td>
            <td className="px-3 py-2">{h.laboratorio}</td>
            <td className="px-3 py-2 font-mono text-xs">{h.certificado}</td>
            <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${h.resultado === 'Aprobado' || h.resultado === 'Completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{h.resultado}</span></td>
            <td className="px-3 py-2 text-gray-500">{h.observaciones}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Firma */}
    <div className="grid grid-cols-2 gap-16 mt-12 pt-4">
      {['Realizó', 'Verificó / Aprobó'].map(label => (
        <div key={label}>
          <div className="border-t-2 border-gray-300 pt-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</div>
            <div className="text-xs text-gray-500 mt-1">Nombre: ___________________________</div>
            <div className="text-xs text-gray-500 mt-1">Cargo: ____________________________</div>
            <div className="text-xs text-gray-500 mt-1">Fecha: _____________________________</div>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-8 text-center text-[9px] text-gray-300 font-black uppercase tracking-[0.3em]">Asesorías Integrales MJM · Sistema de Aseguramiento Metrológico</div>
  </div>
));
PrintableHV.displayName = 'PrintableHV';

// ─── Página Hoja de Vida ───────────────────────────────────────────────────
export default function HojaDeVida() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instruments, selectInstrument, selectedInstrument, addHistorialEntry } = useInventoryStore();
  const { tenant } = useAuthStore?.() || {};
  const [showProgramar, setShowProgramar] = useState(false);
  const [showAddHistorial, setShowAddHistorial] = useState(false);
  const [historialForm, setHistorialForm] = useState({ tipo: 'Calibración', fecha: '', laboratorio: '', certificado: '', resultado: 'Aprobado', observaciones: '' });
  const printRef = useRef();
  const inst = instruments.find(i => i.id === id) || selectedInstrument;

  useEffect(() => { selectInstrument(id); }, [id]);

  const handlePrint = useReactToPrint({ content: () => printRef.current, documentTitle: `HV_${inst?.codigoMJM}` });

  if (!inst) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center">
        <AlertTriangle size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-bold">Instrumento no encontrado</p>
        <button onClick={() => navigate('/dashboard/inventario')} className="mt-4 text-sm text-orange-600 font-bold hover:underline">← Volver al Inventario</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {showProgramar && <ProgramarEventoModal instrument={inst} onClose={() => setShowProgramar(false)} />}
      <div style={{ display: 'none' }}><PrintableHV ref={printRef} instrument={inst} tenant={tenant} /></div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/dashboard/inventario')} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 mt-1">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded">{inst.codigoMJM}</span>
              <EstadoBadge estado={inst.estado} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mt-2 leading-tight">{inst.nombre}</h1>
            <p className="text-sm text-gray-500 mt-1">{inst.marca} {inst.modelo} · Código Interno: <strong>{inst.codigoInterno}</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowProgramar(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#EE8C2C] text-white rounded-lg text-sm font-black uppercase tracking-wider hover:bg-[#d47d22] transition shadow-md shadow-orange-200">
            <CalendarPlus size={15} /> Programar
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 bg-[#050b14] text-white rounded-lg text-sm font-black uppercase tracking-wider hover:bg-gray-800 transition">
            <Printer size={15} /> Imprimir HV
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-3 gap-6">
        {/* Columna Izquierda: Ficha Técnica */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4 flex items-center gap-2"><Settings2 size={12}/> Ficha Técnica</h2>
            <div className="space-y-3">
              {[
                ['Marca', inst.marca], ['Modelo', inst.modelo], ['N° Serie', inst.serie],
                ['Cod. Interno', inst.codigoInterno], ['Magnitud', inst.magnitud],
                ['Resolución', inst.resolucion], ['Cap. Máxima', inst.capacidadMaxima],
                ['Criticidad', inst.criticidad], ['Año Adquisición', inst.anioAdquisicion],
                ['Proveedor', inst.proveedor], ['Accesorios', inst.accesorios || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 shrink-0">{k}</span>
                  <span className="text-sm text-gray-800 font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4 flex items-center gap-2"><ClipboardList size={12}/> Ubicación</h2>
            <div className="space-y-2">
              {Object.entries(inst.jerarquia || {}).filter(([,v]) => v).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-300 shrink-0"></span>
                  <span className="text-[10px] font-black text-gray-400 uppercase w-20 shrink-0">{k}</span>
                  <span className="text-sm text-gray-700 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rutinas */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">Rutinas Aplicables</h2>
            <div className="flex flex-wrap gap-2">
              {(inst.rutinas || []).map(r => (
                <span key={r} className="bg-[#050b14] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">{r}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Historial */}
        <div className="col-span-2 space-y-4">
          {/* Próximas Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0"><CheckCircle size={22} className="text-green-600" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Última Calibración</p>
                <p className="text-lg font-black text-gray-900 mt-0.5 font-mono">{inst.ultimaCalibracion || '—'}</p>
              </div>
            </div>
            <div className={`bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 ${inst.estado === 'Vencido' ? 'ring-2 ring-red-200' : ''}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${inst.estado === 'Vencido' ? 'bg-red-100' : 'bg-amber-100'}`}>
                <Calendar size={22} className={inst.estado === 'Vencido' ? 'text-red-600' : 'text-amber-600'} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Próxima Calibración</p>
                <p className={`text-lg font-black mt-0.5 font-mono ${inst.estado === 'Vencido' ? 'text-red-600' : 'text-gray-900'}`}>{inst.proximaCalibracion || '—'}</p>
              </div>
            </div>
          </div>

          {/* Historial de Actividades */}
          <div className="bg-white rounded-xl shadow-sm flex-1">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 flex items-center gap-2"><FileText size={12}/> Historial de Actividades Metrológicas</h2>
              <button onClick={() => setShowAddHistorial(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider bg-[#050b14] text-white rounded-lg hover:bg-gray-800 transition">
                <Plus size={12}/> Registrar
              </button>
            </div>

            {/* Formulario de entrada manual de historial */}
            {showAddHistorial && (
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Tipo</label>
                    <select value={historialForm.tipo} onChange={e => setHistorialForm(f => ({...f, tipo: e.target.value}))} className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40">
                      {['Calibración','Verificación','Calificación','Mantenimiento'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Fecha</label>
                    <input type="date" value={historialForm.fecha} onChange={e => setHistorialForm(f => ({...f, fecha: e.target.value}))} className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
                  </div>
                  <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Resultado</label>
                    <select value={historialForm.resultado} onChange={e => setHistorialForm(f => ({...f, resultado: e.target.value}))} className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40">
                      {['Aprobado','No Conforme','Completado'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Laboratorio</label>
                    <input value={historialForm.laboratorio} onChange={e => setHistorialForm(f => ({...f, laboratorio: e.target.value}))} className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
                  </div>
                  <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">N° Certificado</label>
                    <input value={historialForm.certificado} onChange={e => setHistorialForm(f => ({...f, certificado: e.target.value}))} className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
                  </div>
                  <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Observaciones</label>
                    <input value={historialForm.observaciones} onChange={e => setHistorialForm(f => ({...f, observaciones: e.target.value}))} className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => setShowAddHistorial(false)} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                  <button onClick={() => { addHistorialEntry(id, historialForm); setShowAddHistorial(false); setHistorialForm({ tipo: 'Calibración', fecha: '', laboratorio: '', certificado: '', resultado: 'Aprobado', observaciones: '' }); }}
                    className="px-4 py-1.5 text-xs font-black uppercase bg-[#EE8C2C] text-white rounded-lg hover:bg-[#d47d22] transition">
                    Guardar
                  </button>
                </div>
              </div>
            )}

            {/* Tabla de historial */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {['Fecha','Tipo','Laboratorio','Certificado','Resultado','Observaciones'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(inst.historial || []).length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Sin registros en el historial<br/><span className="text-xs">Registre la primera actividad con el botón "Registrar"</span></td></tr>
                  ) : [...(inst.historial || [])].sort((a,b) => b.fecha?.localeCompare(a.fecha)).map((h, i) => (
                    <tr key={h.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition">
                      <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap text-gray-600">{h.fecha}</td>
                      <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{h.tipo}</td>
                      <td className="px-4 py-3 text-gray-500">{h.laboratorio}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{h.certificado}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${h.resultado === 'Aprobado' || h.resultado === 'Completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{h.resultado}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-[12px]">{h.observaciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
