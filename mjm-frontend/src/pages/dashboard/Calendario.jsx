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
  RefreshCw
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';

export default function Calendario() {
  const { activities, loadActivities } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (tenant?.id) {
      const unsubscribe = loadActivities(tenant.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [tenant?.id, loadActivities]);

  const days = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

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

  return (
    <div className="flex flex-col lg:flex-row h-full gap-gutter animate-in fade-in duration-500">
      
      {/* --- MAIN CALENDAR VIEW --- */}
      <div className="flex-1 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-1">MJM Metrology Planner</p>
            <h1 className="font-black text-[var(--text-main)] text-4xl tracking-tighter uppercase">Planificador</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleToday}
              className="flex-1 md:flex-none btn-secondary py-3 px-6 flex items-center justify-center gap-2"
            >
              <CalendarIcon size={16} /> VER HOY
            </button>
            <button className="flex-1 md:flex-none btn-primary py-3 px-8 flex items-center justify-center gap-2 shadow-xl shadow-[var(--primary)]/20">
              <Plus size={16} /> NUEVA CITA
            </button>
          </div>
        </header>

        <section className="premium-card p-8 bg-[var(--surface)]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black text-[var(--text-main)] text-xl capitalize tracking-tight flex items-center gap-3">
              {monthName} <ChevronDown size={18} className="text-[var(--primary)]" />
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-[var(--background)] rounded-lg border border-[var(--outline-color)] text-[var(--text-muted)] transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-[var(--background)] rounded-lg border border-[var(--outline-color)] text-[var(--text-muted)] transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-[var(--outline-color)]/20 border border-[var(--outline-color)]/20 rounded-2xl overflow-hidden">
            {days.map(day => (
              <div key={day} className="bg-[var(--surface-alt)] py-4 text-center text-[10px] font-black text-[var(--text-muted)] tracking-[0.2em]">
                {day}
              </div>
            ))}
            {gridCells.map((cell) => {
              if (cell.day === null) {
                return (
                  <div key={cell.key} className="bg-[var(--surface-alt)]/20 min-h-[120px] p-4 border border-[var(--outline-color)]/10" />
                );
              }

              const dayActivities = activities.filter(act => act.fechaProgramada === cell.dateStr);

              return (
                <div key={cell.key} className="bg-[var(--surface)] min-h-[120px] p-4 group hover:bg-[var(--surface-alt)] transition-colors cursor-pointer relative border border-[var(--outline-color)]/10 flex flex-col justify-between">
                  <span className="text-xs font-black text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">{cell.day}</span>
                  
                  <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {dayActivities.map(act => {
                      const vencido = act.estado === 'todo' && act.fechaProgramada < todayStr;
                      return (
                        <div 
                          key={act.id} 
                          className={`p-1.5 rounded text-[9px] font-bold leading-tight border-l-2 truncate ${
                            act.estado === 'done' 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' 
                              : act.estado === 'doing'
                              ? 'bg-[var(--tertiary)]/10 border-[var(--tertiary)] text-[var(--tertiary)]'
                              : vencido
                              ? 'bg-red-500/10 border-red-500 text-red-500'
                              : 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--text-main)]'
                          }`}
                          title={`${act.instrumentNombre} (${act.codigoMJM}) - ${act.tipo}`}
                        >
                          {act.codigoMJM || act.tipo}
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

      {/* --- SIDEBAR: PRÓXIMOS EVENTOS --- */}
      <aside className="w-full lg:w-96 space-y-6">
        <div className="premium-card p-8 bg-[var(--surface)] sticky top-0">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-[var(--text-main)] text-sm uppercase tracking-widest">Próximos 5 Eventos</h3>
            <button className="text-[10px] font-black text-[var(--primary)] uppercase hover:underline">Ver Todo</button>
          </div>

          <div className="space-y-6">
            {upcomingEvents.length === 0 ? (
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider text-center py-6">No hay próximos eventos</p>
            ) : (
              upcomingEvents.map((act) => {
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
                  <div key={act.id} className="flex gap-4 group cursor-pointer">
                    <div className="flex-shrink-0 w-12 h-12 bg-[var(--background)] border border-[var(--outline-color)] rounded-2xl flex flex-col items-center justify-center group-hover:border-[var(--primary)] transition-colors">
                      <span className="text-[10px] font-black text-[var(--primary)] leading-none">{dayNum}</span>
                      <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase">{monthAbbr}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-[var(--text-main)] truncate uppercase tracking-tight">{act.instrumentNombre}</h4>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] flex items-center gap-1 mt-1">
                        <Clock size={10} /> {act.tipo} • {act.codigoMJM}
                      </p>
                    </div>
                    <button className="text-[var(--text-muted)] hover:text-[var(--primary)]"><MoreVertical size={16} /></button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-[var(--outline-color)]/30 space-y-6">
             <div className="flex items-center gap-4 text-[var(--text-muted)]">
                <div className="w-10 h-10 bg-[var(--background)] rounded-xl flex items-center justify-center">
                   <RefreshCw size={18} className="opacity-40" />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest">Sincronización</p>
                   <p className="text-[10px] font-bold text-[var(--text-main)] opacity-60">Nube MJM-Sync v4.0 activa</p>
                </div>
             </div>
             <button className="w-full btn-secondary py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                Sincronizar Calendario
             </button>
          </div>
        </div>

        {/* QUICK STATS IN SIDEBAR */}
        <div className="premium-card p-8 bg-[var(--sidebar-bg)] text-white shadow-2xl">
           <div className="flex items-center gap-3 mb-6">
              <AlertCircle size={20} className="text-[var(--tertiary)]" />
              <h4 className="font-black text-xs uppercase tracking-widest">Alertas Críticas</h4>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                 <span className="text-[10px] font-bold opacity-60">Vencimientos</span>
                 <span className={`${stats.vencidos > 0 ? 'bg-red-500 animate-pulse' : 'bg-neutral-600'} px-2 py-0.5 rounded text-[10px] font-black text-white`}>
                    {String(stats.vencidos).padStart(2, '0')}
                 </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                 <span className="text-[10px] font-bold opacity-60">Programados Hoy</span>
                 <span className="bg-[var(--primary)] px-2 py-0.5 rounded text-[10px] font-black text-[#1A202C]">
                    {String(stats.hoy).padStart(2, '0')}
                 </span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold opacity-60">En Proceso</span>
                 <span className="bg-[var(--tertiary)] px-2 py-0.5 rounded text-[10px] font-black text-[#1A202C]">
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
