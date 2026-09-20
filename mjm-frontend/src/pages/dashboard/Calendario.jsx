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
  Menu,
  Mail,
  Bell,
  Check,
  Loader2,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import { sendMetrologyEmailAlert } from '../../services/emailAlertService';
import ClosureModal from '../../components/dashboard/ClosureModal';

export default function Calendario() {
  const { activities, loadActivities, instruments, loadInstruments, addActivity, updateActivityStatus } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Estados para Modal de Nueva Actividad, Cierre y Alertas
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alertSuccessToast, setAlertSuccessToast] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [closureAct, setClosureAct] = useState(null);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const [newActivityForm, setNewActivityForm] = useState({
    instrumentId: '',
    tipo: 'Calibración',
    fechaProgramada: todayStr,
    priority: 'medium',
    responsable: '',
    notas: '',
    enviarEmail: true
  });

  useEffect(() => {
    if (tenant?.id) {
      const unsubAct = loadActivities(tenant.id);
      const unsubInst = loadInstruments(tenant.id);
      return () => {
        unsubAct && unsubAct();
        unsubInst && unsubInst();
      };
    }
  }, [tenant?.id, loadActivities, loadInstruments]);

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

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Eventos específicos del mes seleccionado
  const monthEvents = useMemo(() => {
    return activities
      .filter(act => act.fechaProgramada?.startsWith(monthPrefix) && act.estado !== 'archived')
      .sort((a, b) => (a.fechaProgramada || '').localeCompare(b.fechaProgramada || ''));
  }, [activities, monthPrefix]);

  // Alertas Críticas y métricas específicas del mes seleccionado
  const stats = useMemo(() => {
    const monthActs = activities.filter(act => act.fechaProgramada?.startsWith(monthPrefix) && act.estado !== 'archived');
    const vencidos = monthActs.filter(act => act.estado === 'todo' && act.fechaProgramada < todayStr).length;
    const hoy = monthActs.filter(act => act.estado === 'todo' && act.fechaProgramada === todayStr).length;
    const enProceso = monthActs.filter(act => act.estado === 'doing').length;
    const completadas = monthActs.filter(act => act.estado === 'done').length;
    // Todas las tareas pendientes del mes (no completadas)
    const pendientes = monthActs.filter(act => act.estado !== 'done').length;
    const totalMes = monthActs.length;
    return { vencidos, hoy, enProceso, completadas, pendientes, totalMes };
  }, [activities, monthPrefix, todayStr]);

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    setIsSidebarOpen(true);
  };

  const handleOpenGlobalSidebar = () => {
    setSelectedDate(null);
    setIsSidebarOpen(true);
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!newActivityForm.instrumentId) {
      alert("Por favor seleccione un instrumento de la planta.");
      return;
    }
    setIsSaving(true);
    try {
      const inst = instruments.find(i => i.id === newActivityForm.instrumentId);
      const actPayload = {
        tenantId: tenant?.id || 'sandboxdemo',
        instrumentId: newActivityForm.instrumentId,
        instrumentNombre: inst?.nombre || 'Instrumento',
        codigoMJM: inst?.codigo || inst?.codigoMJM || '',
        tipo: newActivityForm.tipo,
        fechaProgramada: newActivityForm.fechaProgramada,
        priority: newActivityForm.priority,
        responsable: newActivityForm.responsable,
        notas: newActivityForm.notas
      };

      await addActivity(actPayload);

      if (newActivityForm.enviarEmail) {
        try {
          const emailRes = await sendMetrologyEmailAlert({
            activity: actPayload,
            tenant,
            reason: 'manual_priority'
          });
          setAlertSuccessToast(`📧 ${emailRes.message || 'Alerta enviada correctamente'}`);
          setTimeout(() => setAlertSuccessToast(''), 5000);
        } catch (mailErr) {
          console.warn("Aviso al enviar alerta:", mailErr);
        }
      }

      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("Error al programar la actividad: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full animate-in fade-in duration-500 font-sans">
      
      {/* TOAST DE CONFIRMACIÓN DE ALERTA POR EMAIL */}
      {alertSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-sky-400/40 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Mail className="text-sky-400 animate-bounce" size={18} />
          <span className="text-xs font-bold font-inter">{alertSuccessToast}</span>
        </div>
      )}

      {/* --- MAIN CALENDAR VIEW --- */}
      <div className="flex-1 space-y-4 w-full max-w-7xl mx-auto pb-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="font-space font-bold text-[var(--text-main)] text-xl sm:text-2xl tracking-tight uppercase">
              Cronograma <span className="text-mjm-navy dark:text-[#f7931b]">Metrológico</span>
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider mt-0.5">
              Plan Anual de Calibración, Verificación y Mantenimiento
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleOpenGlobalSidebar}
              className={`btn-precision-secondary text-[11px] flex items-center gap-1.5 py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                stats.vencidos > 0 
                  ? 'border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10' 
                  : 'border-[var(--outline-color)]/30 hover:bg-[var(--surface-alt)]'
              }`}
              title="Abrir resumen de Agenda & Alertas Críticas"
            >
              <div className="relative flex items-center justify-center">
                <Bell size={13} className={stats.vencidos > 0 ? 'text-red-500' : 'text-[#f7931b]'} />
                {stats.vencidos > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <span className="font-space font-bold tracking-tight uppercase">Agenda & Alertas</span>
              {stats.pendientes > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold leading-none ${
                  stats.vencidos > 0
                    ? 'bg-red-500 text-white shadow-xs'
                    : 'bg-[var(--surface-alt)] text-[var(--text-main)] border border-[var(--outline-color)]/30'
                }`}>
                  {stats.pendientes}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setNewActivityForm({
                  instrumentId: instruments[0]?.id || '',
                  tipo: 'Calibración',
                  fechaProgramada: selectedDate || todayStr,
                  priority: 'medium',
                  responsable: '',
                  notas: '',
                  enviarEmail: true
                });
                setShowAddModal(true);
              }}
              className="btn-precision-primary text-[11px]"
            >
              <Plus size={14} />
              <span>+ Nueva Actividad</span>
            </button>
          </div>
        </header>

        <section className="premium-card p-4 sm:p-5 bg-[var(--surface)] shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-3 border-b border-[var(--outline-color)] gap-3">
            <h3 className="font-space font-bold text-[var(--text-main)] text-lg uppercase tracking-tight flex items-center gap-2">
              {monthStrOnly} <span className="text-[var(--text-muted)] font-mono font-medium">{year}</span>
            </h3>
            
            <div className="flex items-center gap-1 bg-[var(--background)] p-1 rounded-lg border border-[var(--outline-color)]">
              <button 
                onClick={handlePrevMonth}
                className="p-1 hover:bg-[var(--surface)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                title="Mes Anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleToday}
                className="px-3 py-1 text-[10px] font-space font-bold uppercase tracking-wider text-[var(--text-main)] hover:bg-[var(--surface)] rounded transition-all"
              >
                Hoy
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-[var(--surface)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                title="Mes Siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {days.map(day => (
              <div key={day} className="py-1.5 text-center text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] tracking-[0.15em] opacity-60">
                {day}
              </div>
            ))}
            {gridCells.map((cell) => {
              if (cell.day === null) {
                return (
                  <div key={cell.key} className="bg-transparent min-h-[92px]" />
                );
              }

              const dayActivities = activities.filter(act => act.fechaProgramada === cell.dateStr);
              const isToday = cell.dateStr === todayStr;
              const isSelected = selectedDate === cell.dateStr;

              return (
                <div 
                  key={cell.key} 
                  onClick={() => handleDateClick(cell.dateStr)}
                  className={`min-h-[92px] p-2 sm:p-2.5 rounded-xl group hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                    isToday 
                      ? 'bg-[var(--primary)]/5 border-[var(--primary)]/40 ring-1 ring-[var(--primary)]/20 shadow-sm' 
                      : isSelected
                      ? 'bg-[var(--surface-alt)] border-[var(--primary)] shadow-sm'
                      : 'bg-[var(--surface)] border-[var(--outline-color)]/20 hover:border-[var(--outline-color)]'
                  }`}
                >
                  <div className="flex justify-end mb-1">
                    <span className={`text-[11px] font-black transition-colors flex items-center justify-center w-6 h-6 rounded-md font-mono ${
                      isToday
                        ? 'bg-[var(--primary)] text-[#1A202C] shadow-sm'
                        : isSelected
                        ? 'bg-[var(--text-main)] text-[var(--surface)]'
                        : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                    }`}>
                      {cell.day}
                    </span>
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto flex-1 no-scrollbar flex flex-col justify-end">
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
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[8.5px] font-bold leading-tight truncate border border-transparent hover:border-current/20 transition-colors ${bgColor}`}
                          title={`${act.instrumentNombre} (${act.codigoMJM}) - ${act.tipo}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
                          <span className="truncate font-mono">{act.codigoMJM || act.codigo || 'MJM'}</span>
                          <span className="truncate opacity-75">· {act.tipo}</span>
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
          <h3 className="font-black text-[var(--text-main)] text-xl uppercase tracking-tighter flex items-center gap-2">
            <CalendarIcon size={22} className="text-[var(--primary)]" />
            {selectedDate 
              ? `Eventos del ${selectedDate.split('-')[2]}/${selectedDate.split('-')[1]}` 
              : `Agenda de ${monthStrOnly.charAt(0).toUpperCase() + monthStrOnly.slice(1)} ${year}`}
          </h3>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-[var(--background)] rounded-full text-[var(--text-muted)] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {(() => {
            const eventsToShow = selectedDate 
              ? activities.filter(act => act.fechaProgramada === selectedDate)
              : monthEvents;

            if (eventsToShow.length === 0) {
              return (
                <p className="text-[11px] font-medium text-[var(--text-muted)] text-center py-10 opacity-75">
                  No hay eventos programados en este periodo.
                </p>
              );
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

              const isSelectedAct = selectedActivity?.id === act.id;

              return (
                <div 
                  key={act.id} 
                  onClick={() => setSelectedActivity(isSelectedAct ? null : act)}
                  className={`p-3 rounded-xl transition-all border cursor-pointer ${
                    isSelectedAct 
                      ? 'bg-[var(--surface-alt)] border-[#f7931b] shadow-sm' 
                      : 'hover:bg-[var(--background)] border-transparent hover:border-[var(--outline-color)]/30'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-xl flex flex-col items-center justify-center group-hover:border-[var(--primary)] transition-colors shadow-sm bg-white dark:bg-zinc-800">
                      <span className="text-xs font-black text-[var(--primary)] leading-none font-mono">{dayNum}</span>
                      <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">{monthAbbr}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[var(--text-main)] truncate uppercase tracking-tight">{act.instrumentNombre}</h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                         <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                           <Clock size={11} className="opacity-50" /> {act.tipo}
                         </span>
                         <span className="px-1.5 py-0.5 bg-[var(--background)] text-[var(--text-main)] opacity-75 text-[9px] font-bold rounded border border-[var(--outline-color)]/20 font-mono">
                            {act.codigoMJM || act.codigo || 'MJM'}
                         </span>
                         <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                           act.estado === 'done' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                           act.estado === 'doing' ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20' :
                           'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                         }`}>
                           {act.estado === 'done' ? 'Completada' : act.estado === 'doing' ? 'En Proceso' : 'Pendiente'}
                         </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalle y Acciones Rápidas */}
                  {isSelectedAct && (
                    <div className="mt-3 pt-2.5 border-t border-[var(--outline-color)]/20 space-y-2 animate-in fade-in">
                      {act.notas && (
                        <p className="text-xs text-[var(--text-muted)] italic leading-relaxed bg-[var(--background)] p-2 rounded-lg border border-[var(--outline-color)]/20">
                          "{act.notas}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {act.estado !== 'doing' && act.estado !== 'done' && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await updateActivityStatus(act.id, 'doing');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            Iniciar
                          </button>
                        )}
                        {act.estado !== 'done' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setClosureAct(act);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Completar y Registrar Certificado Metrológico"
                          >
                            <CheckCircle2 size={13} /> Completar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* QUICK STATS IN SIDEBAR (Efecto Glass Azul Industrial) */}
        <div className="p-4 m-4 rounded-2xl text-white backdrop-blur-2xl border border-sky-400/30 shadow-[0_20px_50px_rgba(10,25,47,0.85),0_0_30px_rgba(56,189,248,0.2)] overflow-hidden bg-gradient-to-b from-[#14284b]/95 via-[#0d1d36]/95 to-[#091528]/95 relative before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.2),_transparent_70%)] before:pointer-events-none shrink-0">
           <div className="flex items-center gap-2.5 mb-3 border-b border-sky-400/20 pb-2.5 relative">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                 <AlertCircle size={15} />
              </div>
              <div>
                 <h4 className="font-space font-bold text-xs uppercase tracking-wider text-white">Alertas del Mes</h4>
                 <p className="text-[9px] font-inter text-sky-300/70 font-medium capitalize">{monthStrOnly} {year}</p>
              </div>
           </div>
           <div className="space-y-2 font-inter relative">
              <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors">
                 <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stats.vencidos > 0 ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-xs font-medium text-slate-200 capitalize">Vencimientos ({monthStrOnly})</span>
                 </div>
                 <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                   stats.vencidos > 0 
                     ? 'bg-red-500/25 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse' 
                     : 'bg-white/10 text-slate-300 border border-white/10'
                 }`}>
                    {String(stats.vencidos).padStart(2, '0')}
                 </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors">
                 <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stats.hoy > 0 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-xs font-medium text-slate-200">Programados Hoy</span>
                 </div>
                 <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                   stats.hoy > 0 
                     ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                     : 'bg-white/10 text-slate-300 border border-white/10'
                 }`}>
                    {String(stats.hoy).padStart(2, '0')}
                 </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors">
                 <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stats.enProceso > 0 ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-slate-500'}`} />
                    <span className="text-xs font-medium text-slate-200">En Proceso</span>
                 </div>
                 <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                   stats.enProceso > 0 
                     ? 'bg-sky-500/25 text-sky-300 border border-sky-500/50 shadow-[0_0_10px_rgba(56,189,248,0.3)]' 
                     : 'bg-white/10 text-slate-300 border border-white/10'
                 }`}>
                    {String(stats.enProceso).padStart(2, '0')}
                 </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    <span className="text-xs font-medium text-slate-200">Total Pendientes</span>
                 </div>
                 <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/25 text-amber-300 border border-amber-500/50">
                    {String(stats.pendientes).padStart(2, '0')}
                 </span>
              </div>
           </div>
        </div>
      </aside>

      {/* MODAL PROGRAMAR NUEVA ACTIVIDAD METROLÓGICA */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--surface)] text-[var(--text-main)] p-6 sm:p-7 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-[var(--outline-color)]/30">
            <div className="flex justify-between items-start mb-5 border-b border-[var(--outline-color)]/20 pb-3.5">
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text-main)] flex items-center gap-2">
                  <CalendarIcon className="text-[#f7931b]" size={20} />
                  <span>Programar Actividad Metrológica</span>
                </h3>
                <p className="text-[10px] font-mono font-medium uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                  Control Operativo & Aseguramiento ISO 10012
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4 font-inter">
              
              {/* Selección de Instrumento */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Activo / Instrumento a Intervenir *
                </label>
                <select
                  value={newActivityForm.instrumentId}
                  onChange={e => setNewActivityForm({ ...newActivityForm, instrumentId: e.target.value })}
                  className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[#f7931b] cursor-pointer"
                  required
                >
                  <option value="">-- Seleccionar Equipo de Planta --</option>
                  {instruments.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.codigo || i.codigoMJM || 'MET'} - {i.nombre} ({i.ubicacion || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Actividad y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Tipo de Rutina *
                  </label>
                  <select
                    value={newActivityForm.tipo}
                    onChange={e => setNewActivityForm({ ...newActivityForm, tipo: e.target.value })}
                    className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[#f7931b] cursor-pointer"
                  >
                    <option value="Calibración">Calibración</option>
                    <option value="Verificación">Verificación Intermedia</option>
                    <option value="Mantenimiento">Mantenimiento Preventivo / Correctivo</option>
                    <option value="Limpieza y Ajuste">Limpieza y Ajuste</option>
                    <option value="Calificación">Calificación de Desempeño</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Fecha Programada *
                  </label>
                  <input
                    type="date"
                    value={newActivityForm.fechaProgramada}
                    onChange={e => setNewActivityForm({ ...newActivityForm, fechaProgramada: e.target.value })}
                    className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[#f7931b]"
                    required
                  />
                </div>
              </div>

              {/* Prioridad y Responsable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Nivel de Prioridad
                  </label>
                  <select
                    value={newActivityForm.priority}
                    onChange={e => {
                      const prio = e.target.value;
                      setNewActivityForm({
                        ...newActivityForm,
                        priority: prio,
                        enviarEmail: prio === 'high' || prio === 'Crítica' ? true : newActivityForm.enviarEmail
                      });
                    }}
                    className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[#f7931b] cursor-pointer"
                  >
                    <option value="low">Baja / Rutinaria</option>
                    <option value="medium">Media / Estándar</option>
                    <option value="high">Alta / Crítica (Dispara Alerta)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Responsable / Laboratorio
                  </label>
                  <input
                    type="text"
                    value={newActivityForm.responsable}
                    onChange={e => setNewActivityForm({ ...newActivityForm, responsable: e.target.value })}
                    placeholder="Ej. Lab Externo / Técnico Interno"
                    className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[#f7931b]"
                  />
                </div>
              </div>

              {/* Instrucciones y Notas */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Instrucciones u Observaciones
                </label>
                <textarea
                  rows={2}
                  value={newActivityForm.notas}
                  onChange={e => setNewActivityForm({ ...newActivityForm, notas: e.target.value })}
                  placeholder="Detalles del procedimiento, tolerancias a inspeccionar o condiciones del equipo..."
                  className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-medium text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[#f7931b] leading-relaxed resize-none"
                />
              </div>

              {/* ALERTA POR EMAIL DESDE FIREBASE */}
              <div className="p-3 bg-sky-500/10 border border-sky-500/25 rounded-xl space-y-1.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newActivityForm.enviarEmail}
                    onChange={e => setNewActivityForm({ ...newActivityForm, enviarEmail: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                    <Mail size={13} className="text-sky-500" />
                    <span>Despachar alerta por email desde Firebase</span>
                  </span>
                </label>
                <p className="text-[10px] text-[var(--text-muted)] pl-6 leading-relaxed">
                  Destino: <strong className="text-sky-600 dark:text-sky-400 font-mono">{tenant?.email_alertas || tenant?.email_contacto || 'alertas@metrologia.com'}</strong>
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-precision-secondary py-2 px-4 text-xs font-bold uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-precision-primary py-2 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} /> Programar Actividad</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CIERRE METROLÓGICO (ISO 10012) */}
      {closureAct && (
        <ClosureModal 
          activity={closureAct} 
          onClose={() => setClosureAct(null)} 
          onFinish={async (data) => {
            await updateActivityStatus(closureAct.id, 'done', {
              error_encontrado: data.error_encontrado,
              incertidumbre_medicion: data.incertidumbre,
              declaracion_conformidad: data.conformidad_metrologica,
              fecha_ejecucion: data.fecha_ejecucion,
              laboratorio_ejecutor: data.laboratorio,
              certificado_url: data.certificado_url,
              certificado_numero: data.certificado_numero,
              patron_referencia: data.patron_referencia,
              laboratorio_tipo: data.laboratorio_tipo,
              criterio_tipo: data.criterio_tipo,
              criterio_valor: data.criterio_valor
            });

            // Si es NO CONFORME, generar tarea correctiva y disparar alerta automática en Firebase 'mail'
            if (data.conformidad_metrologica === 'No Conforme') {
              const tenantId = closureAct.tenantId || tenant?.id;
              const nextWeekDate = new Date();
              nextWeekDate.setDate(nextWeekDate.getDate() + 7); // Plazo de 7 días
              const dateStr = nextWeekDate.toISOString().split('T')[0];

              const correctiveAct = {
                tenantId,
                instrumentId: closureAct.instrumentId,
                instrumentNombre: closureAct.instrumentNombre,
                codigoMJM: closureAct.codigoMJM || '',
                tipo: 'Mantenimiento Correctivo',
                estado: 'todo',
                fechaProgramada: dateStr,
                priority: 'high',
                notas: `Desviación metrológica crítica (No Conforme) en ${closureAct.instrumentNombre}. Error: ${data.error_encontrado}, Incertidumbre: ${data.incertidumbre}. Tolerancia excedida.`
              };

              await addActivity(correctiveAct);

              try {
                await sendMetrologyEmailAlert({
                  activity: correctiveAct,
                  tenant,
                  reason: 'desviacion_no_conforme'
                });
              } catch (mailErr) {
                console.warn("Aviso al encolar alerta por no conformidad:", mailErr);
              }
            }

            setClosureAct(null);
            setSelectedActivity(null);
          }}
        />
      )}

    </div>
  );
}

function ChevronDown(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
}
