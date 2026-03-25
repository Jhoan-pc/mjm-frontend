import React, { useState } from 'react';
import { Calendar as CalendarIcon, Filter, Plus, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, Image as ImageIcon, MessageSquare, MoreVertical, Archive, LayoutKanban, Calendar } from 'lucide-react';

const mockActivities = [
  { id: 1, instrument: 'MJM-INS-001', name: 'Micrómetro Digital', type: 'Calibración', client: 'Industrias Alfa', status: 'To Do', dueDate: '2024-03-28' },
  { id: 2, instrument: 'MJM-INS-004', name: 'Termómetro IR', type: 'Verificación', client: 'Bayer S.A.', status: 'Doing', dueDate: '2024-03-25' },
  { id: 3, instrument: 'MJM-INS-012', name: 'Balanza Analítica', type: 'Mantenimiento', client: 'Laboratorios Eléctricos', status: 'Done', dueDate: '2024-03-20' },
  { id: 4, instrument: 'MJM-INS-088', name: 'Manómetro Wika', type: 'Calibración', client: 'Industrias Alfa', status: 'To Do', dueDate: '2024-03-15', overdue: true },
];

export default function Planner() {
  const [view, setView] = useState('kanban'); // 'kanban' or 'calendar'
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const KanbanColumn = ({ title, status, items }) => (
    <div className="flex-1 flex flex-col min-w-[300px] h-full bg-[#f8f9fa] rounded-3xl p-6 border border-gray-100">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${status === 'To Do' ? 'bg-mjm-orange' : status === 'Doing' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
             <h3 className="text-sm font-black text-mjm-navy uppercase tracking-widest">{title}</h3>
          </div>
          <span className="text-[10px] font-black text-gray-400 bg-white px-2 py-1 rounded-full shadow-sm">{items.length}</span>
       </div>

       <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
          {items.map(item => (
            <div 
              key={item.id} 
              className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative cursor-pointer ${item.overdue ? 'border-l-4 border-l-red-500' : ''}`}
              onClick={() => {
                if (status === 'Doing') {
                  setSelectedActivity(item);
                  setShowClosureModal(true);
                }
              }}
            >
               <div className="flex items-center justify-between mb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <span className={item.overdue ? 'text-red-500' : ''}>{item.overdue ? 'Vencido' : item.dueDate}</span>
                  <div className={`px-2 py-0.5 rounded ${item.type === 'Calibración' ? 'bg-orange-50 text-mjm-orange' : 'bg-blue-50 text-blue-500'}`}>
                    {item.type}
                  </div>
               </div>
               
               <p className="text-sm font-black text-mjm-navy uppercase tracking-tight mb-1">{item.name}</p>
               <p className="text-[10px] text-gray-500 font-bold mb-4">{item.client} / {item.instrument}</p>

               <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-mjm-navy flex items-center justify-center text-[8px] text-white border-2 border-white font-bold">MJ</div>
                     <div className="w-6 h-6 rounded-full bg-mjm-orange flex items-center justify-center text-[8px] text-white border-2 border-white font-bold">AL</div>
                  </div>
                  {status === 'Done' ? (
                    <button className="text-gray-300 hover:text-mjm-navy transition-colors">
                       <Archive size={16} />
                    </button>
                  ) : (
                    <button className="text-gray-300 group-hover:text-mjm-navy transition-colors">
                       <MoreVertical size={16} />
                    </button>
                  )}
               </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl h-32 flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest">
               Sin Actividades
            </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="flex bg-[#f8f9fa] h-full overflow-hidden flex-col">
      
      {/* Planner Header */}
      <header className="p-8 bg-white border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 z-20 shadow-sm">
         <div className="flex items-center gap-6">
            <div>
               <h1 className="text-2xl font-black text-mjm-navy uppercase tracking-tighter">Planificador Metrológico</h1>
               <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-mjm-orange font-black uppercase tracking-widest">Actividades Semanales</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Marzo 2024</span>
               </div>
            </div>
            
            <div className="h-10 w-px bg-gray-100 mx-2"></div>
            
            <div className="flex bg-gray-50 p-1 rounded-xl shadow-inner border border-gray-100">
               <button 
                 onClick={() => setView('kanban')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'kanban' ? 'bg-mjm-navy text-white shadow-md' : 'text-gray-400 hover:bg-white'}`}
               >
                  <LayoutKanban size={16} />
                  Kanban
               </button>
               <button 
                 onClick={() => setView('calendar')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-mjm-navy text-white shadow-md' : 'text-gray-400 hover:bg-white'}`}
               >
                  <CalendarIcon size={16} />
                  Calendario
               </button>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all">
               <Filter size={20} />
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-mjm-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-mjm-orange/20 hover:scale-105 transition-all active:scale-95">
               <Plus size={18} strokeWidth={3} />
               Nueva Actividad
            </button>
         </div>
      </header>

      {/* Main View Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 md:p-10 scrollbar-hide">
         {view === 'kanban' ? (
           <div className="flex h-full gap-8 min-w-[1000px]">
              <KanbanColumn title="Pendientes (Mes)" status="To Do" items={mockActivities.filter(a => a.status === 'To Do')} />
              <KanbanColumn title="En Proceso (Semana)" status="Doing" items={mockActivities.filter(a => a.status === 'Doing')} />
              <KanbanColumn title="Completadas" status="Done" items={mockActivities.filter(a => a.status === 'Done')} />
           </div>
         ) : (
           <div className="w-full h-full bg-white rounded-[40px] shadow-xl border border-gray-100 p-10 flex flex-col items-center justify-center text-gray-300">
              <CalendarIcon size={64} className="mb-6 opacity-20" />
              <p className="text-xl font-black text-mjm-navy/20 uppercase tracking-widest">Vista de Calendario en Construcción</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-2">Integrando Moto de Eventos Cíclicos</p>
           </div>
         )}
      </div>

      {/* Closure / Evidence Modal */}
      {showClosureModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-mjm-navy/40 backdrop-blur-md" onClick={() => setShowClosureModal(false)}></div>
           <div className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl relative z-70 border border-white/50 overflow-hidden flex flex-col">
              <div className="p-10 bg-mjm-navy text-white flex items-center justify-between shrink-0">
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">Cerrar Actividad</h2>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{selectedActivity?.name} / {selectedActivity?.instrument}</p>
                 </div>
                 <button onClick={() => setShowClosureModal(false)} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white">
                    <AlertCircle size={20} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Evidencia Fotográfica (Máx 3)</label>
                    <div className="grid grid-cols-3 gap-4">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:border-mjm-orange group transition-all cursor-pointer">
                            <ImageIcon size={24} className="text-gray-300 group-hover:text-mjm-orange transition-colors" />
                            <span className="text-[8px] font-black mt-2 text-gray-400 group-hover:text-mjm-orange uppercase">Subir Foto</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Observaciones Técnicas</label>
                    <textarea 
                      placeholder="Indique hallazgos, desviaciones o comentarios finales..."
                      className="w-full h-32 p-6 bg-gray-50 border-0 rounded-2xl text-mjm-navy text-sm font-medium focus:ring-2 focus:ring-mjm-orange placeholder:text-gray-300 transition-all"
                    ></textarea>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Realización</label>
                       <input type="date" className="w-full p-4 bg-gray-50 border-0 rounded-xl text-xs font-bold text-mjm-navy" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Técnico Responsable</label>
                       <select className="w-full p-4 bg-gray-50 border-0 rounded-xl text-xs font-bold text-mjm-navy appearance-none">
                          <option>Martin J. Madrigal</option>
                          <option>Auxiliar Técnico 1</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t border-gray-100 flex gap-4 shrink-0">
                 <button 
                   onClick={() => setShowClosureModal(false)}
                   className="flex-1 py-5 bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-[20px] hover:bg-gray-200"
                 >
                    Cancelar
                 </button>
                 <button className="flex-1 py-5 bg-mjm-orange text-white text-[10px] font-black uppercase tracking-widest rounded-[20px] shadow-xl shadow-mjm-orange/30 hover:scale-105 active:scale-95 transition-all">
                    Finalizar y Archivar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
