import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Wrench, ThumbsUp, Clock, Search, X } from 'lucide-react';

const TIPOS_COLOR = {
  'Calibración':  { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Verificación': { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  'Calificación': { bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-500' },
  'Mantenimiento':{ bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
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
  const { activities, instruments, addActivity } = useInventoryStore();
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
    <div className="space-y-6">
      {showModal && <NuevaActividadModal instruments={instruments} onClose={() => setShowModal(false)} onSave={(data) => { addActivity({ ...data, instrumentNombre: instruments.find(i=>i.id===data.instrumentId)?.nombre, codigoMJM: instruments.find(i=>i.id===data.instrumentId)?.codigoMJM, cliente: 'Industrias Alfa', prioridad: 'Normal' }); }} />}

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

      <div className="grid grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
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
              if (!day) return <div key={`empty-${idx}`} className="h-24 border-b border-r border-gray-50" />;
              const dayActs = getActivitiesForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;
              const hasVencidas = dayActs.some(a => a.estado !== 'done' && new Date(a.fechaProgramada) < today);
              return (
                <div key={day} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`h-24 border-b border-r border-gray-50 p-2 cursor-pointer transition-all ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1 ${isToday ? 'bg-[#050b14] text-white' : 'text-gray-600'}`}>{day}</div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayActs.slice(0, 2).map(a => {
                      const c = TIPOS_COLOR[a.tipo] || TIPOS_COLOR['Calibración'];
                      return (
                        <div key={a.id} className={`text-[9px] font-black px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${c.bg} ${c.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`}></span>
                          {a.tipo}
                        </div>
                      );
                    })}
                    {dayActs.length > 2 && <div className="text-[9px] text-gray-400 font-bold px-1">+{dayActs.length - 2} más</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Lateral: Actividades del día / Resumen */}
        <div className="col-span-1 space-y-4">
          {/* Resumen del mes */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3">Resumen del Mes</h3>
            <div className="space-y-2">
              {Object.entries(TIPOS_COLOR).map(([tipo, color]) => {
                const count = activitiesThisMonth.filter(a => a.tipo === tipo).length;
                return (
                  <div key={tipo} className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-sm ${color.dot}`}></span>
                    <span className="text-sm font-medium text-gray-600 flex-1">{tipo}</span>
                    <span className="text-sm font-black text-gray-900">{count}</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-100 pt-2 mt-1 flex items-center justify-between">
                <span className="text-sm font-black text-gray-700">Total</span>
                <span className="text-lg font-black text-[#050b14]">{activitiesThisMonth.length}</span>
              </div>
            </div>
          </div>

          {/* Actividades del día seleccionado */}
          {selectedDay && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3">
                {DIAS_SEMANA[new Date(year, month, selectedDay).getDay()]} {selectedDay} de {MESES[month]}
              </h3>
              {dayActivities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sin actividades</p>
              ) : dayActivities.map(a => {
                const c = TIPOS_COLOR[a.tipo] || TIPOS_COLOR['Calibración'];
                return (
                  <div key={a.id} className={`p-3 rounded-lg mb-2 ${c.bg}`}>
                    <div className={`text-[10px] font-black uppercase tracking-wider ${c.text} mb-1`}>{a.tipo}</div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">{a.instrumentNombre}</p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">{a.codigoMJM}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Vencidas */}
          {vencidas.length > 0 && !selectedDay && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 mb-3 flex items-center gap-2"><AlertTriangle size={11}/> Sin ejecutar</h3>
              <div className="space-y-2">
                {vencidas.slice(0,5).map(a => (
                  <div key={a.id} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-red-700 truncate">{a.instrumentNombre}</p>
                      <p className="text-[10px] text-red-400 font-mono">{a.fechaProgramada}</p>
                    </div>
                    <span className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">{a.tipo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
