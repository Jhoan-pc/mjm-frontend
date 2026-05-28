import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle,
  Plus,
  Filter,
  MoreVertical,
  CheckCircle2,
  Settings,
  RefreshCw,
  X,
  Menu
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';

export default function Calendario() {
  const { activities, loadActivities } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (tenant?.id) {
      const unsubscribe = loadActivities(tenant.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [tenant?.id, loadActivities]);

  const days = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];
  const monthStrOnly = currentDate.toLocaleString('es-ES', { month: 'long' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Day of the week for the 1st (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  // Map Monday as 0, Tuesday as 1, ..., Sunday as 6
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Generate grid cells (empty offsets + actual days)
  const gridCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, key: `offset-${i}` });
    }
    for (let d = 1; d <= totalDays; d++) {
      const dayStr = String(d).padStart(2, '0');
      const monthStr = String(month + 1).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      cells.push({ day: d, dateStr, key: `day-${d}` });
    }
    return cells;
  }, [year, month, startOffset, totalDays]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Sidebar: upcoming events
  const upcomingEvents = useMemo(() => {
    return activities
      .filter(act => act.fechaProgramada >= todayStr && act.estado !== 'done' && act.estado !== 'archived')
      .sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada))
      .slice(0, 5);
  }, [activities, todayStr]);

  // Sidebar: Alertas Críticas stats
  const stats = useMemo(() => {
    const vencidos = activities.filter(act => act.estado === 'todo' && act.fechaProgramada < todayStr).length;
    const hoy = activities.filter(act => act.estado === 'todo' && act.fechaProgramada === todayStr).length;
    const enProceso = activities.filter(act => act.estado === 'doing').length;
    return { vencidos, hoy, enProceso };
  }, [activities, todayStr]);

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    setIsSidebarOpen(true);
  };

  const handleOpenGlobalSidebar = () => {
    setSelectedDate(null);
    setIsSidebarOpen(true);
  };

  return (
    <div className="relative flex flex-col h-full animate-in fade-in duration-500">
      
      {/* --- FLOATING BUTTON PARA ABRIR SIDEBAR --- */}
      <button 
        onClick={handleOpenGlobalSidebar}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[var(--primary)] text-[#1A202C] p-3 pl-4 rounded-l-2xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:pr-6 transition-all duration-300 flex flex-col items-center gap-3 group border border-l-white/20 border-y-white/20 animate-pulse"
      >
        <div className="bg-black/10 rounded-full p-1 animate-bounce mt-2 group-hover:animate-none">
           <ChevronLeft size={16} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          Ver Detalles
        </span>
      </button>

      {/* --- MAIN CALENDAR VIEW --- */}
      <div className="flex-1 space-y-8 w-full max-w-7xl mx-auto pb-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-black text-[var(--text-main)] text-4xl tracking-tighter uppercase">Cronograma</h1>
          </div>
        </header>

        <section className="premium-card p-8 bg-[var(--surface)]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-[var(--outline-color)]/20 gap-4">
            <h3 className="font-black text-[var(--text-main)] text-2xl uppercase tracking-tight flex items-center gap-2">
              {monthStrOnly} <span className="text-[var(--text-muted)] font-medium">{year}</span>
            </h3>
            
            <div className="flex items-center gap-1 bg-[var(--background)] p-1.5 rounded-xl border border-[var(--outline-color)]/30 shadow-inner">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-[var(--surface)] hover:shadow-sm rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                title="Mes Anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={handleToday}
                className="px-5 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-main)] hover:bg-[var(--surface)] hover:shadow-sm rounded-lg transition-all"
              >
                Hoy
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-[var(--surface)] hover:shadow-sm rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                title="Mes Siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {days.map(day => (
              <div key={day} className="py-2 text-center text-[10px] font-black text-[var(--text-muted)] tracking-[0.2em] opacity-60">
                {day}
              </div>
            ))}
            {gridCells.map((cell) => {
              if (cell.day === null) {
                return (
                  <div key={cell.key} className="bg-transparent min-h-[120px]" />
                );
              }

              const dayActivities = activities.filter(act => act.fechaProgramada === cell.dateStr);
              const isToday = cell.dateStr === todayStr;
              const isSelected = selectedDate === cell.dateStr;

              return (
                <div 
                  key={cell.key} 
                  onClick={() => handleDateClick(cell.dateStr)}
                  className={`min-h-[120px] p-3 rounded-2xl group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                    isToday 
                      ? 'bg-[var(--primary)]/5 border-[var(--primary)]/30 ring-1 ring-[var(--primary)]/20' 
                      : isSelected
                      ? 'bg-[var(--surface-alt)] border-[var(--primary)] shadow-md'
                      : 'bg-[var(--surface)] border-[var(--outline-color)]/20 hover:border-[var(--outline-color)]'
                  }`}
                >
                  <div className="flex justify-end mb-2">
                    <span className={`text-xs font-black transition-colors flex items-center justify-center w-7 h-7 rounded-full ${
                      isToday
                        ? 'bg-[var(--primary)] text-[#1A202C] shadow-md'
                        : isSelected
                        ? 'bg-[var(--text-main)] text-[var(--surface)]'
                        : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                    }`}>
                      {cell.day}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 overflow-y-auto flex-1 no-scrollbar flex flex-col justify-end">
                    {dayActivities.map(act => {
                      const vencido = act.estado === 'todo' && act.fechaProgramada < todayStr;
                      
                      let dotColor = 'bg-[var(--primary)]';
                      let bgColor = 'bg-[var(--primary)]/10 text-[var(--text-main)]';
                      
                      if (act.estado === 'done') {
                         dotColor = 'bg-emerald-500';
                         bgColor = 'bg-emerald-500/10 text-emerald-600';
                      } else if (act.estado === 'doing') {
                         dotColor = 'bg-[var(--tertiary)]';
                         bgColor = 'bg-[var(--tertiary)]/10 text-[var(--tertiary)]';
                      } else if (vencido) {
                         dotColor = 'bg-red-500';
                         bgColor = 'bg-red-500/10 text-red-500';
                      }

                      return (
                        <div 
                          key={act.id} 
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold leading-tight truncate border border-transparent hover:border-current/20 transition-colors ${bgColor}`}
                          title={`${act.instrumentNombre} (${act.codigoMJM}) - ${act.tipo}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
                          <span className="truncate">{act.codigoMJM || act.codigo || 'MJM-001'} • {act.tipo}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* --- SIDEBAR OVERLAY (DRAWER) --- */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[var(--surface)] shadow-2xl z-50 transform transition-transform duration-500 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex justify-between items-center p-6 border-b border-[var(--outline-color)]/20">
          <h3 className="font-black text-[var(--text-main)] text-2xl uppercase tracking-tighter flex items-center gap-2">
            <CalendarIcon size={24} className="text-[var(--primary)]" />
            {selectedDate ? `Eventos del ${selectedDate.split('-')[2]}/${selectedDate.split('-')[1]}` : 'Próximos 5 Eventos'}
          </h3>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-[var(--background)] rounded-full text-[var(--text-muted)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {(() => {
            const eventsToShow = selectedDate 
              ? activities.filter(act => act.fechaProgramada === selectedDate)
              : upcomingEvents;

            if (eventsToShow.length === 0) {
              return <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider text-center py-6">No hay eventos para mostrar</p>;
            }

            return eventsToShow.map((act) => {
              const parts = act.fechaProgramada.split('-');
              let dayNum = '--';
              let monthAbbr = '---';
              if (parts.length === 3) {
                const [y, m, d] = parts.map(Number);
                const dateObj = new Date(y, m - 1, d);
                dayNum = String(d).padStart(2, '0');
                monthAbbr = dateObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
              }

              return (
                <div key={act.id} className="flex gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-[var(--background)] transition-colors border border-transparent hover:border-[var(--outline-color)]/30 items-center">
                  <div className="flex-shrink-0 w-14 h-14 bg-[var(--background)] border border-[var(--outline-color)] rounded-2xl flex flex-col items-center justify-center group-hover:border-[var(--primary)] transition-colors shadow-sm bg-white">
                    <span className="text-sm font-black text-[var(--primary)] leading-none">{dayNum}</span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase mt-0.5">{monthAbbr}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-[var(--text-main)] truncate uppercase tracking-tight">{act.instrumentNombre}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                       <p className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                         <Clock size={12} className="opacity-50" /> {act.tipo}
                       </p>
                       <span className="px-2 py-0.5 bg-[var(--background)] text-[var(--text-main)] opacity-70 text-[9px] font-black rounded border border-[var(--outline-color)]/30">
                          {act.codigoMJM || act.codigo || 'MJM-001'}
                       </span>
                    </div>
                  </div>
                  <button className="text-[var(--text-muted)] hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={18} /></button>
                </div>
              );
            });
          })()}
        </div>

        {/* QUICK STATS IN SIDEBAR */}
        <div className="p-6 bg-[var(--sidebar-bg)] text-white shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
           <div className="flex items-center gap-3 mb-6">
              <AlertCircle size={22} className="text-[var(--tertiary)]" />
              <h4 className="font-black text-sm uppercase tracking-widest">Alertas Críticas</h4>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                 <span className="text-xs font-bold opacity-60">Vencimientos</span>
                 <span className={`${stats.vencidos > 0 ? 'bg-red-500 animate-pulse' : 'bg-neutral-600'} px-2.5 py-1 rounded text-xs font-black text-white`}>
                    {String(stats.vencidos).padStart(2, '0')}
                 </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                 <span className="text-xs font-bold opacity-60">Programados Hoy</span>
                 <span className="bg-[var(--primary)] px-2.5 py-1 rounded text-xs font-black text-[#1A202C]">
                    {String(stats.hoy).padStart(2, '0')}
                 </span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-xs font-bold opacity-60">En Proceso</span>
                 <span className="bg-[var(--tertiary)] px-2.5 py-1 rounded text-xs font-black text-[#1A202C]">
                    {String(stats.enProceso).padStart(2, '0')}
                 </span>
              </div>
           </div>
        </div>
      </aside>

    </div>
  );
}

function ChevronDown(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
}
