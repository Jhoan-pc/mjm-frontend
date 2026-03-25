import React, { useState, useMemo } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Archive, CheckCircle, Clock, Eye, X, Upload, Image, ArrowRight } from 'lucide-react';

const TIPOS_COLOR = {
  'Calibración':  { bg: 'bg-blue-50',   border: 'border-blue-200', text: 'text-blue-700', tag: 'bg-blue-100' },
  'Verificación': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', tag: 'bg-purple-100' },
  'Calificación': { bg: 'bg-teal-50',   border: 'border-teal-200', text: 'text-teal-700', tag: 'bg-teal-100' },
  'Mantenimiento':{ bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', tag: 'bg-orange-100' },
};

const PRIORIDAD_COLOR = {
  'Crítica': 'bg-red-100 text-red-700',
  'Alta':    'bg-orange-100 text-orange-700',
  'Normal':  'bg-gray-100 text-gray-600',
  'Baja':    'bg-green-100 text-green-700',
};

// ─── Modal de Cierre de Actividad ─────────────────────────────────────────
const CierreModal = ({ activity, onClose, onSave }) => {
  const [form, setForm] = useState({
    fechaRealizacion: new Date().toISOString().split('T')[0],
    laboratorio: '', certificado: '', observaciones: '', evidencias: []
  });
  const set = (f, v) => setForm(p => ({...p, [f]: v}));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - form.evidencias.length);
    const readers = files.map(file => new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res({ name: file.name, dataUrl: ev.target.result });
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(imgs => setForm(f => ({ ...f, evidencias: [...f.evidencias, ...imgs].slice(0,3) })));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#050b14] text-white px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <div className="text-[10px] text-white/50 font-black uppercase tracking-wider">Cerrar Actividad</div>
            <h2 className="text-sm font-black mt-0.5">{activity?.instrumentNombre}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={16}/></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Fecha de Realización</label>
              <input type="date" value={form.fechaRealizacion} onChange={e => set('fechaRealizacion', e.target.value)} className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"/>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Laboratorio</label>
              <input value={form.laboratorio} onChange={e => set('laboratorio', e.target.value)} placeholder="Ej: CERTLAB SAS" className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"/>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">N° Certificado / Informe</label>
            <input value={form.certificado} onChange={e => set('certificado', e.target.value)} placeholder="Opcional" className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"/>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Observaciones y Resultados</label>
            <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} rows={3} className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/40" placeholder="Describe el resultado de la actividad..." />
          </div>
          {/* Carga de Evidencias */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Evidencia Fotográfica (máx. 3 fotos)</label>
            <div className="grid grid-cols-3 gap-2">
              {form.evidencias.map((ev, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                  <img src={ev.dataUrl} alt={ev.name} className="w-full h-full object-cover" />
                  <button onClick={() => setForm(f => ({...f, evidencias: f.evidencias.filter((_,j) => j!==i)}))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"><X size={10}/></button>
                </div>
              ))}
              {form.evidencias.length < 3 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition">
                  <Image size={20} className="text-gray-300 mb-1" />
                  <span className="text-[10px] text-gray-400 font-bold">Agregar</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            {form.evidencias.length > 0 && <p className="text-[10px] text-gray-400 mt-1">{form.evidencias.length}/3 fotos cargadas</p>}
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg">Cancelar</button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="px-6 py-2 text-sm font-black uppercase tracking-wider bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md shadow-emerald-200">
            <div className="flex items-center gap-2"><CheckCircle size={14}/> Completar</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Tarjeta Kanban ─────────────────────────────────────────────────────────
const KanbanCard = ({ activity, onMove, onClose, onArchive, navigate }) => {
  const c = TIPOS_COLOR[activity.tipo] || TIPOS_COLOR['Calibración'];
  const isVencida = new Date(activity.fechaProgramada) < new Date() && activity.estado !== 'done';
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow ${isVencida ? 'border-red-200' : 'border-gray-100'}`}>
      {isVencida && (
        <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-wider">
          <AlertTriangle size={11}/> Vencida
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${c.tag} ${c.text}`}>{activity.tipo}</span>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${PRIORIDAD_COLOR[activity.prioridad] || PRIORIDAD_COLOR['Normal']}`}>{activity.prioridad}</span>
      </div>
      <div>
        <p className="text-sm font-black text-gray-900 leading-tight">{activity.instrumentNombre}</p>
        <p className="text-[11px] font-mono text-gray-400 mt-0.5">{activity.codigoMJM}</p>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={11} className="text-gray-400" />
        <span className="text-[11px] text-gray-500 font-mono">{activity.fechaProgramada}</span>
      </div>
      {activity.observaciones && (
        <p className="text-[11px] text-gray-400 line-clamp-2">{activity.observaciones}</p>
      )}
      {/* Evidencias */}
      {activity.evidencias?.length > 0 && (
        <div className="flex gap-1">
          {activity.evidencias.map((ev, i) => (
            <img key={i} src={ev.dataUrl || ev} alt="Evidencia" className="w-10 h-10 rounded object-cover border border-gray-100" />
          ))}
        </div>
      )}
      {/* Acciones */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <button onClick={() => navigate(`/dashboard/inventario/${activity.instrumentId}`)}
          className="flex items-center gap-1 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-wider transition">
          <Eye size={11}/> HV
        </button>
        {activity.estado === 'todo' && (
          <button onClick={() => onMove(activity.id, 'doing')} className="flex items-center gap-1 ml-auto text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-wider transition">
            Iniciar <ArrowRight size={11}/>
          </button>
        )}
        {activity.estado === 'doing' && (
          <button onClick={() => onClose(activity)} className="flex items-center gap-1 ml-auto text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider transition">
            Completar <CheckCircle size={11}/>
          </button>
        )}
        {activity.estado === 'done' && !activity.archivada && (
          <button onClick={() => onArchive(activity.id)} className="flex items-center gap-1 ml-auto text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-wider transition">
            Archivar <Archive size={11}/>
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Columna Kanban ─────────────────────────────────────────────────────────
const KanbanColumn = ({ title, activities, color, count, children, icon: Icon }) => (
  <div className="flex flex-col bg-gray-50 rounded-xl flex-1 min-w-0 min-h-0">
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-sm ${color}`}></div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-700 flex-1">{title}</h3>
        <span className="bg-white text-gray-600 text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">{count}</span>
      </div>
    </div>
    <div className="p-3 space-y-3 overflow-y-auto flex-1">
      {children}
      {count === 0 && (
        <div className="text-center py-12 text-gray-300">
          <div className="text-3xl mb-2">○</div>
          <p className="text-xs font-bold uppercase tracking-wider">Sin actividades</p>
        </div>
      )}
    </div>
  </div>
);

// ─── Página Principal Kanban ───────────────────────────────────────────────
export default function KanbanMetrologico() {
  const navigate = useNavigate();
  const { activities, moveActivity, closeActivity, archiveActivity } = useInventoryStore();
  const [closingActivity, setClosingActivity] = useState(null);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const active = activities.filter(a => !a.archivada);
  const archived = activities.filter(a => a.archivada);

  const todo = active.filter(a => a.estado === 'todo');
  const doing = active.filter(a => a.estado === 'doing');
  const done = active.filter(a => a.estado === 'done');

  // "Doing" sugiere las de esta semana
  const doingThisWeek = doing.filter(a => {
    const d = new Date(a.fechaProgramada);
    return d >= startOfWeek && d <= endOfWeek;
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      {closingActivity && (
        <CierreModal activity={closingActivity} onClose={() => setClosingActivity(null)}
          onSave={(data) => closeActivity(closingActivity.id, data)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tablero de Actividades</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión operacional de rutinas metrológicas</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Pendientes</p>
            <p className="text-xl font-black text-gray-900">{todo.length}</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">En Curso</p>
            <p className="text-xl font-black text-blue-600">{doing.length}</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Completadas</p>
            <p className="text-xl font-black text-emerald-600">{done.length}</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Archivadas</p>
            <p className="text-xl font-black text-gray-400">{archived.length}</p>
          </div>
        </div>
      </div>

      {/* Tablero */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* TO DO - Actividades del Mes */}
        <KanbanColumn title="Por Hacer · Este Mes" color="bg-gray-400" count={todo.length}>
          {todo.map(a => (
            <KanbanCard key={a.id} activity={a} onMove={moveActivity} onClose={setClosingActivity} onArchive={archiveActivity} navigate={navigate} />
          ))}
        </KanbanColumn>

        {/* DOING - Esta semana */}
        <KanbanColumn title="En Progreso · Esta Semana" color="bg-blue-500" count={doing.length}>
          {doing.map(a => (
            <KanbanCard key={a.id} activity={a} onMove={moveActivity} onClose={setClosingActivity} onArchive={archiveActivity} navigate={navigate} />
          ))}
        </KanbanColumn>

        {/* DONE */}
        <KanbanColumn title="Completadas" color="bg-emerald-500" count={done.length}>
          {done.map(a => (
            <KanbanCard key={a.id} activity={a} onMove={moveActivity} onClose={setClosingActivity} onArchive={archiveActivity} navigate={navigate} />
          ))}
        </KanbanColumn>
      </div>

      {/* Archivadas */}
      {archived.length > 0 && (
        <div className="shrink-0">
          <details className="bg-white rounded-xl shadow-sm">
            <summary className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 cursor-pointer flex items-center gap-2 hover:text-gray-600 transition">
              <Archive size={12}/> {archived.length} actividades archivadas
            </summary>
            <div className="px-5 pb-4 grid grid-cols-4 gap-3">
              {archived.map(a => (
                <div key={a.id} className="bg-gray-50 rounded-lg p-3 opacity-60">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{a.tipo} · {a.fechaRealizacion || a.fechaProgramada}</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5 truncate">{a.instrumentNombre}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
