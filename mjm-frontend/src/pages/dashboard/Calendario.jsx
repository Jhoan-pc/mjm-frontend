import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { 
  ChevronLeft, ChevronRight, Plus, AlertTriangle, Wrench, ThumbsUp, Clock, 
  Search, X, Package, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const TIPOS_COLOR = {
  'Calibración':  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200' },
  'Verificación': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
  'Calificación': { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500',   border: 'border-teal-200' },
  'Mantenimiento':{ bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
};

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ─── Modal Nueva Actividad ─────────────────────────────────────────────────
const NuevaActividadModal = ({ instruments, onClose, onSave }) => {
  const [form, setForm] = useState({ instrumentId: '', tipo: 'Calibración', fechaProgramada: '', observaciones: '' });
  const set = (f, v) => setForm(p => ({...p, [f]: v}));
  const inst = instruments.find(i => i.id === form.instrumentId);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="bg-[#050b14] text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="font-black uppercase tracking-wider text-sm">Nueva Actividad</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={16}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Instrumento</label>
            <select value={form.instrumentId} onChange={e => { set('instrumentId', e.target.value); if(instruments.find(i=>i.id===e.target.value)?.rutinas?.length) set('tipo', instruments.find(i=>i.id===e.target.value).rutinas[0]); }}
              className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40">
              <option value="">Seleccionar...</option>
              {instruments.map(i => <option key={i.id} value={i.id}>{i.nombre} · {i.codigoMJM}</option>)}
            </select>
          </div>
          {inst && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Tipo de Rutina</label>
              <div className="flex flex-wrap gap-2">
                {(inst.rutinas || ['Calibración','Mantenimiento']).map(r => (
                  <button key={r} onClick={() => set('tipo', r)} className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${form.tipo===r ? 'bg-[#050b14] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{r}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Fecha Programada</label>
            <input type="date" value={form.fechaProgramada} onChange={e => set('fechaProgramada', e.target.value)} className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Observaciones</label>
            <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} rows={2} className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40 resize-none" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg">Cancelar</button>
          <button onClick={() => { if(!form.instrumentId || !form.fechaProgramada) return; onSave(form); onClose(); }}
            disabled={!form.instrumentId || !form.fechaProgramada}
            className="px-5 py-2 text-sm font-black uppercase tracking-wider bg-[#EE8C2C] text-white rounded-lg hover:bg-[#d47d22] disabled:opacity-40 transition shadow-md shadow-orange-200">
            Programar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Página Calendario / Planificador ─────────────────────────────────────
export default function Calendario() {
  const navigate = useNavigate();
  const { tenant, isSuperAdmin } = useAuthStore();
  const { activities, instruments, addActivity, loadInstruments, loadActivities } = useInventoryStore();

  // 🔄 Carga de Datos Reales (Instrumentos y Actividades)
  React.useEffect(() => {
    if (tenant) {
      loadInstruments(tenant.id, isSuperAdmin);
      loadActivities(tenant.id, isSuperAdmin);
    }
  }, [tenant, isSuperAdmin, loadInstruments, loadActivities]);

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const activitiesThisMonth = useMemo(() => {
    return activities.filter(a => {
      const d = new Date(a.fechaProgramada);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [activities, year, month]);

  const vencidas = activities.filter(a => {
    const d = new Date(a.fechaProgramada);
    return d < today && a.estado !== 'done';
  });

  const getActivitiesForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return activitiesThisMonth.filter(a => a.fechaProgramada === dateStr);
  };

  const dayActivities = selectedDay ? getActivitiesForDay(selectedDay) : [];

  // Construir cuadrilla del calendario
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="p-6 lg:p-10 space-y-10">
      {showModal && <NuevaActividadModal instruments={instruments} onClose={() => setShowModal(false)} onSave={(data) => { addActivity({ ...data, tenantId: tenant?.id, instrumentNombre: instruments.find(i=>i.id===data.instrumentId)?.nombre, codigoMJM: instruments.find(i=>i.id===data.instrumentId)?.codigoMJM, cliente: tenant?.nombre_empresa || 'Gestión Local', prioridad: 'Normal' }); }} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Planificador</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de actividades de aseguramiento metrológico</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#EE8C2C] text-white rounded-lg text-sm font-black uppercase tracking-wider hover:bg-[#d47d22] transition shadow-md shadow-orange-200">
          <Plus size={15}/> Nueva Actividad
        </button>
      </div>

      {/* Alertas Vencidas */}
      {vencidas.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle size={20} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-black text-red-700">{vencidas.length} actividad{vencidas.length > 1 ? 'es' : ''} vencida{vencidas.length > 1 ? 's' : ''} sin ejecutar</p>
            <p className="text-xs text-red-500 mt-0.5">{vencidas.map(a => a.instrumentNombre).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Calendario (Prioridad Principal) */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl shadow-mjm-navy/5 border border-mjm-navy/5 overflow-hidden">
          {/* Nav Mes */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition"><ChevronLeft size={18}/></button>
            <h2 className="text-base font-black text-gray-900 uppercase tracking-wider">{MESES[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition"><ChevronRight size={18}/></button>
          </div>
          {/* Días de semana */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">{d}</div>
            ))}
          </div>
          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7">
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-32 border-b border-r border-gray-50" />;
              const dayActs = getActivitiesForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;
              const hasVencidas = dayActs.some(a => a.estado !== 'done' && new Date(a.fechaProgramada) < today);
              return (
                <div key={day} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`h-32 border-b border-r border-gray-50 p-3 cursor-pointer transition-all ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1 ${isToday ? 'bg-[#050b14] text-white' : 'text-gray-600'}`}>{day}</div>
                  <div className="space-y-0.5">
                    {dayActs.slice(0, 3).map(a => {
                      const c = TIPOS_COLOR[a.tipo] || TIPOS_COLOR['Calibración'];
                      const isDone = a.estado === 'done';
                      const isOverdue = !isDone && new Date(a.fechaProgramada) < today;
                      
                      return (
                        <div key={a.id} className="group/act relative hover:z-[70]">
                          <div className={`text-[9px] font-black px-1.5 py-1 rounded truncate flex items-center justify-between gap-1 border ${isOverdue ? 'bg-red-50 text-red-700 border-red-200' : `${c.bg} ${c.text} ${c.border}`} transition-all hover:scale-[1.02] cursor-help`}>
                            <div className="flex items-center gap-1 truncate">
                              {isDone ? <CheckCircle2 size={10} className="text-green-500 shrink-0" /> : 
                               isOverdue ? <AlertCircle size={10} className="text-red-500 shrink-0" /> : 
                               <Clock size={10} className="text-blue-400 shrink-0" />}
                              <span className="truncate">{a.tipo}</span>
                            </div>
                          </div>
                          
                          {/* Premium Tooltip */}
                          <div className="invisible group-hover/act:visible opacity-0 group-hover/act:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#050b14] text-white p-3 rounded-xl shadow-2xl z-[60] transition-all duration-200 pointer-events-none border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                               <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-500/20 text-red-400' : isDone ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                 {isDone ? 'Ejecutada' : isOverdue ? 'Vencida' : 'Pendiente'}
                               </span>
                               <span className="text-[8px] font-mono text-white/40">{a.fechaProgramada}</span>
                            </div>
                            <h4 className="text-[10px] font-black leading-tight uppercase tracking-tight">{a.instrumentNombre}</h4>
                            <p className="text-[9px] font-mono text-mjm-orange mt-1">{a.codigoMJM}</p>
                            {isDone && a.certificado && (
                              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[7px] text-white/40 uppercase font-black">Certificado:</span>
                                <span className="text-[8px] font-mono text-white/80">{a.certificado}</span>
                              </div>
                            )}
                            {/* Flecha del tooltip */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#050b14]"></div>
                          </div>
                        </div>
                      );
                    })}
                    {dayActs.length > 3 && <div className="text-[9px] text-gray-400 font-bold px-1">+{dayActs.length - 3} más</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Lateral: Resumen e Información (Secundario) */}
        <div className="w-full xl:w-80 space-y-6">
          {/* Actividades del día seleccionado (PRIORIDAD) */}
          {selectedDay ? (
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-l-orange-500">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3">
                {DIAS_SEMANA[new Date(year, month, selectedDay).getDay()]} {selectedDay} de {MESES[month]}
              </h3>
              {dayActivities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4 italic">Sin actividades para este día</p>
              ) : (
                <div className="space-y-3">
                    {dayActivities.map(a => {
                      const c = TIPOS_COLOR[a.tipo] || TIPOS_COLOR['Calibración'];
                      const isDone = a.estado === 'done';
                      const isOverdue = !isDone && new Date(a.fechaProgramada) < today;

                      return (
                        <div key={a.id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white border ${isOverdue ? 'border-red-200 border-l-red-500' : isDone ? 'border-green-100 border-l-green-500' : `${c.border} border-l-blue-400`}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`text-[10px] font-black uppercase tracking-wider ${isOverdue ? 'text-red-600' : isDone ? 'text-green-600' : c.text}`}>
                              {a.tipo}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isDone ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-600'}`}>
                              {isDone ? <><CheckCircle2 size={8}/> Ejecutada</> : 
                               isOverdue ? <><AlertCircle size={8}/> Vencida</> : 
                               <><Clock size={8}/> Pendiente</>}
                            </div>
                          </div>
                          <p className="text-sm font-black text-gray-800 leading-tight">{a.instrumentNombre}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-1">{a.codigoMJM}</p>
                          {isDone && a.certificado && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Certificado:</span>
                              <span className="text-[10px] font-mono font-black text-mjm-navy">{a.certificado}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 text-center">
              <Clock className="mx-auto text-orange-300 mb-2" size={24} />
              <p className="text-xs font-bold text-orange-700">Selecciona un día en el calendario para ver el cronograma detallado.</p>
            </div>
          )}

          {/* Vencidas (URGENTE) */}
          {vencidas.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-l-red-500">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 mb-3 flex items-center gap-2"><AlertTriangle size={11}/> Pendientes Críticas</h3>
              <div className="space-y-3">
                {vencidas.slice(0,3).map(a => (
                  <div key={a.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-[11px] font-black text-red-700 truncate">{a.instrumentNombre}</p>
                    <p className="text-[10px] text-red-400 font-mono mt-0.5">{a.fechaProgramada}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen del mes (INFOGRAFÍA - CONSOLIDADO) */}
          <div className="bg-white rounded-2xl shadow-xl shadow-mjm-navy/5 p-6 border border-mjm-navy/5">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5">Carga de Trabajo Mensual</h3>
            <div className="space-y-4">
              {Object.entries(TIPOS_COLOR).map(([tipo, color]) => {
                const count = activitiesThisMonth.filter(a => a.tipo === tipo).length;
                const percentage = activitiesThisMonth.length > 0 ? (count / activitiesThisMonth.length) * 100 : 0;
                if (count === 0 && activitiesThisMonth.length > 0) return null;
                return (
                  <div key={tipo} className="group cursor-default">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${color.dot} shadow-sm border-2 border-white`}></div>
                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">{tipo}</span>
                      </div>
                      <span className="text-xs font-black text-gray-950">{count}</span>
                    </div>
                    {/* Barra de Progreso Mini */}
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                      <div 
                        className={`h-full ${color.dot} transition-all duration-700 ease-out`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Programadas</p>
                  <p className="text-2xl font-black text-mjm-navy">{activitiesThisMonth.length}</p>
                </div>
                <div className="bg-mjm-navy/5 p-2 rounded-lg">
                   <Package className="text-mjm-navy/20" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
