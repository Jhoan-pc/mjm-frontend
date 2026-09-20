import React, { useState, useMemo, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Info, 
  Calendar,
  MoreHorizontal,
  LayoutDashboard,
  Zap,
  ShieldCheck,
  Menu,
  Bell,
  Archive,
  ExternalLink,
  RefreshCw,
  Settings,
  MoreVertical,
  User,
  FileUp,
  X,
  Scale,
  Activity,
  Layers,
  Search
} from 'lucide-react';

import ClosureModal from '../../components/dashboard/ClosureModal';
import { sendMetrologyEmailAlert } from '../../services/emailAlertService';

const ActivityCard = ({ act, column, onStart, onFinish }) => {
  const isCritical = act.priority === 'high' || act.criticidad === 'Crítica' || act.criticidad === 'Alta';
  
  return (
    <article 
      draggable
      onDragStart={(e) => e.dataTransfer.setData('activityId', act.id)}
      className={`bg-[var(--surface)] border border-[var(--outline-color)]/30 rounded-xl p-3 shadow-sm relative overflow-hidden group hover:border-[var(--primary)]/50 transition-all duration-200 cursor-grab active:cursor-grabbing ${column === 'done' ? 'opacity-80' : column === 'archived' ? 'opacity-60 grayscale' : ''}`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${
        column === 'vencidos' ? 'bg-red-500' : 
        column === 'doing' ? 'bg-emerald-500' : 
        column === 'en_proceso' ? 'bg-orange-500' : 
        'bg-amber-500'
      }`} />
      {isCritical && <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />}
      
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--outline-color)]/20 ${
            column === 'vencidos' ? 'text-red-500' : 
            column === 'doing' ? 'text-emerald-500' : 
            column === 'en_proceso' ? 'text-orange-500' : 
            'text-amber-500'
          }`}>
            {act.tipo || 'INTERVENCIÓN'}
          </span>
          {act.estado === 'doing' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
        </div>
        <MoreVertical size={13} className="text-[var(--text-muted)] opacity-40 group-hover:opacity-100 transition-opacity" />
      </div>

      <h4 className="font-bold text-[var(--text-main)] text-xs mb-1.5 leading-snug line-clamp-1">{act.instrumentNombre || 'Instrumento Sin Nombre'}</h4>
      
      <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] mb-2">
        <span className="flex items-center gap-1 bg-[var(--primary)]/10 text-[var(--text-main)] px-2 py-0.5 rounded border border-[var(--primary)]/20 font-mono">
          <Clock size={11} className="text-[var(--primary)]" />
          <span>{act.fechaProgramada}</span>
        </span>
        <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[var(--surface-alt)] rounded border border-[var(--outline-color)]/20">{act.codigo || act.codigoMJM || 'MJM'}</span>
      </div>

      {act.declaracion_conformidad && (
        <div className={`mb-2 px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
          <ShieldCheck size={10}/>
          {act.declaracion_conformidad}
        </div>
      )}

      {/* Acciones de Tarjeta */}
      <div className="transition-all duration-200 ease-in-out mt-2 xl:mt-0 xl:max-h-0 xl:opacity-0 xl:overflow-hidden xl:group-hover:max-h-16 xl:group-hover:opacity-100 xl:group-hover:mt-2">
        {act.estado === 'todo' && (
          <button 
            onClick={() => onStart(act.id)}
            className="w-full py-1.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-[#1A202C] text-[var(--primary)] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-[var(--primary)]/20"
          >
            <Play size={10} fill="currentColor" /> Iniciar Actividad
          </button>
        )}

        {act.estado === 'doing' && (
          <button 
            onClick={() => onFinish(act)}
            className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-emerald-500/20"
          >
            <CheckCircle size={10} /> Finalizar Actividad
          </button>
        )}
      </div>
    </article>
  );
};

export default function KanbanMetrologico() {
  const { activities, loading, updateActivityStatus, loadActivities, addActivity } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [search, setSearch] = useState('');
  const [closureAct, setClosureAct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('por_gestionar');
  const boardRef = React.useRef(null);

  // Dynamic layout parent scroll prevention & padding adjustment
  useEffect(() => {
    const mainEl = document.querySelector('main.flex-1.overflow-y-auto');
    if (mainEl) {
      const originalOverflow = mainEl.style.overflow || '';
      const originalHeight = mainEl.style.height || '';
      const originalPadding = mainEl.style.padding || '';
      
      mainEl.style.overflow = 'hidden';
      mainEl.style.height = '100%';
      
      const handleResize = () => {
        if (window.innerWidth < 768) {
          mainEl.style.padding = '12px';
        } else if (window.innerWidth < 1024) {
          mainEl.style.padding = '24px';
        } else {
          mainEl.style.padding = '32px';
        }
      };
      
      window.addEventListener('resize', handleResize);
      handleResize();
      
      return () => {
        mainEl.style.overflow = originalOverflow;
        mainEl.style.height = originalHeight;
        mainEl.style.padding = originalPadding;
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const handleBoardScroll = (e) => {
    if (window.innerWidth >= 1280) return;
    const scrollLeft = e.target.scrollLeft;
    const clientWidth = e.target.clientWidth;
    if (clientWidth === 0) return;
    const activeIndex = Math.round(scrollLeft / clientWidth);
    const colIds = ['por_gestionar', 'en_proceso', 'doing', 'vencidos'];
    if (colIds[activeIndex] && colIds[activeIndex] !== activeTab) {
      setActiveTab(colIds[activeIndex]);
    }
  };

  const handleTabClick = (colId) => {
    setActiveTab(colId);
    const el = document.getElementById(`kanban-col-${colId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };


  useEffect(() => {
    if (tenant?.id) {
      const unsubscribe = loadActivities(tenant.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [tenant?.id, loadActivities]);

  const todayStr = useMemo(() => {
    const d = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Bogota"}));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const weekRange = useMemo(() => {
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Bogota"}));
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const mondayStart = new Date(now);
    mondayStart.setDate(now.getDate() + diffToMonday);
    
    const sundayEnd = new Date(mondayStart);
    sundayEnd.setDate(mondayStart.getDate() + 6);
    
    return {
      startStr: mondayStart.toISOString().split('T')[0],
      endStr: sundayEnd.toISOString().split('T')[0]
    };
  }, []);

  const nextManageRange = useMemo(() => {
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Bogota"}));
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + diffToMonday + 7);
    
    const end30Days = new Date(nextMonday);
    end30Days.setDate(nextMonday.getDate() + 30);
    
    return {
      startStr: nextMonday.toISOString().split('T')[0],
      endStr: end30Days.toISOString().split('T')[0]
    };
  }, []);

  const columns = [
    { id: 'por_gestionar', label: 'Por Gestionar', color: 'text-amber-500', dotColor: 'bg-amber-500', textColor: 'text-amber-500', activeTabClass: 'bg-amber-500 text-slate-900', icon: <Calendar size={14}/> },
    { id: 'en_proceso', label: 'Priorizar', color: 'text-orange-500', dotColor: 'bg-orange-500', textColor: 'text-orange-500', activeTabClass: 'bg-orange-500 text-white', icon: <Clock size={14}/> },
    { id: 'doing', label: 'En Proceso', color: 'text-emerald-500', dotColor: 'bg-emerald-500', textColor: 'text-emerald-500', activeTabClass: 'bg-emerald-500 text-white', icon: <Play size={14}/> },
    { id: 'vencidos', label: 'Vencidos', color: 'text-red-500', dotColor: 'bg-red-500', textColor: 'text-red-500', activeTabClass: 'bg-red-500 text-white', icon: <AlertCircle size={14}/> },
  ];

  const grouped = useMemo(() => {
    const s = search.toLowerCase();
    const matchesSearch = (a) => (a.instrumentNombre?.toLowerCase().includes(s) || a.codigoMJM?.toLowerCase().includes(s));
    
    return {
      por_gestionar: activities
         .filter(a => a.estado === 'todo' && a.fechaProgramada >= nextManageRange.startStr && a.fechaProgramada <= nextManageRange.endStr && matchesSearch(a))
         .sort((a,b) => a.fechaProgramada.localeCompare(b.fechaProgramada)),
      en_proceso: activities
         .filter(a => a.estado === 'todo' && a.fechaProgramada >= weekRange.startStr && a.fechaProgramada <= weekRange.endStr && matchesSearch(a))
         .sort((a,b) => a.fechaProgramada.localeCompare(b.fechaProgramada)),
      doing: activities
         .filter(a => a.estado === 'doing' && matchesSearch(a))
         .sort((a,b) => a.fechaProgramada.localeCompare(b.fechaProgramada)),
      vencidos: activities
         .filter(a => a.estado === 'todo' && a.fechaProgramada < todayStr && matchesSearch(a)) // Cambiado de weekRange.startStr a todayStr para reflejar vencimiento hoy a medianoche
         .sort((a,b) => a.fechaProgramada.localeCompare(b.fechaProgramada))
    };
  }, [activities, search, todayStr, weekRange, nextManageRange]);

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('activityId');
    const act = activities.find(a => a.id === id);
    if (!act) return;

    if (columnId === 'doing') {
      updateActivityStatus(id, 'doing');
    } else {
      // Solo permitimos moverla de vuelta a su columna de origen lógica (para no confundir al usuario)
      let correctCol = '';
      if (act.fechaProgramada < weekRange.startStr) correctCol = 'vencidos';
      else if (act.fechaProgramada >= weekRange.startStr && act.fechaProgramada <= weekRange.endStr) correctCol = 'en_proceso';
      else if (act.fechaProgramada >= nextManageRange.startStr && act.fechaProgramada <= nextManageRange.endStr) correctCol = 'por_gestionar';
      
      if (columnId === correctCol && act.estado === 'doing') {
         updateActivityStatus(id, 'todo');
      }
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* --- HEADER BOARD --- */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 shrink-0">
        <div>
           <h1 className="font-bold text-[var(--text-main)] text-xl sm:text-2xl tracking-tight uppercase">Tablero de <span className="text-[var(--primary)] italic">Control</span></h1>
           <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Flujo Operativo de Calibración & Mantenimiento</p>
        </div>
        <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={13} />
           <input 
             type="text"
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Filtrar por equipo o código..."
             className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--surface)] border border-[var(--outline-color)]/30 rounded-lg text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)] font-medium"
           />
        </div>
      </section>

      {/* --- MOBILE TABS (visible only on mobile) --- */}
      <div className="flex xl:hidden bg-[var(--surface-alt)] border border-[var(--outline-color)]/30 rounded-xl p-1 mb-3 justify-between items-center shrink-0">
        {columns.map(col => {
          const count = grouped[col.id]?.length || 0;
          const isActive = activeTab === col.id;
          const mobileLabels = {
            por_gestionar: 'Pendientes',
            en_proceso: 'Priorizar',
            doing: 'Proceso',
            vencidos: 'Vencidos'
          };
          return (
            <button
              key={col.id}
              onClick={() => handleTabClick(col.id)}
              className={`flex-1 flex flex-col items-center py-1.5 rounded-lg transition-all relative ${
                isActive 
                  ? `${col.activeTabClass} font-bold shadow-sm` 
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-center truncate w-full px-1">
                {mobileLabels[col.id]}
              </span>
              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full mt-0.5 border font-mono ${
                isActive 
                  ? 'bg-white/30 border-transparent text-current' 
                  : `bg-[var(--surface)] border-[var(--outline-color)]/20 ${col.textColor}`
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- KANBAN BOARD --- */}
      <main 
        ref={boardRef}
        onScroll={handleBoardScroll}
        className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth bg-transparent rounded-2xl p-0.5"
      >
        <div className="flex gap-3 md:gap-4 h-full">
          {columns.map(col => (
            <section 
              key={col.id} 
              id={`kanban-col-${col.id}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex-shrink-0 w-full xl:flex-1 xl:min-w-[240px] snap-center xl:snap-align-none flex flex-col h-full bg-[var(--surface-alt)] rounded-xl p-3 transition-colors border border-[var(--outline-color)]/20"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dotColor}`}></div>
                  <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">{col.label}</h3>
                  <span className={`bg-[var(--surface)] px-2 py-0.2 rounded text-[10px] font-bold font-mono border border-[var(--outline-color)]/20 ${col.textColor} shadow-xs`}>
                    {grouped[col.id]?.length || 0}
                  </span>
                </div>
                <div className="relative group/tooltip">
                  <button className="p-1 hover:bg-[var(--surface)] rounded-md text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                     <Info size={14} />
                  </button>
                  <div className="absolute right-0 top-7 w-64 bg-[var(--sidebar-bg)] text-white text-[11px] p-3 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 shadow-xl border border-white/20 font-medium leading-relaxed">
                     {col.id === 'por_gestionar' && 'Actividades programadas desde el Lunes próximo hasta +30 días hacia el futuro.'}
                     {col.id === 'en_proceso' && 'El sprint actual: Actividades que deben ejecutarse esta semana (Lunes a Domingo).'}
                     {col.id === 'doing' && 'Actividades que has movido manualmente y se están ejecutando en este momento.'}
                     {col.id === 'vencidos' && 'Actividades que expiraron porque su fecha programada quedó en el pasado.'}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto custom-scrollbar pr-1 pb-16">
                 {grouped[col.id]?.map(act => (
                   <ActivityCard 
                     key={act.id} 
                     act={act} 
                     column={col.id} 
                     onStart={(id) => updateActivityStatus(id, 'doing')}
                     onFinish={(act) => setClosureAct(act)}
                   />
                 ))}
                 
                 {(!grouped[col.id] || grouped[col.id].length === 0) && (
                   <div className="py-10 text-center text-[var(--text-muted)] opacity-30 flex flex-col items-center gap-2">
                       <Layers size={24} />
                       <span className="text-[9px] font-bold uppercase tracking-widest">Columna Vacía</span>
                   </div>
                 )}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* TOAST DE CONFIRMACIÓN DE REGISTRO */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/95 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/40 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="text-emerald-400" size={18} />
          <span className="text-xs font-bold font-inter">{toastMessage}</span>
        </div>
      )}

      {/* --- MODAL DE CIERRE --- */}
      {closureAct && (
        <ClosureModal 
          activity={closureAct} 
          onClose={() => setClosureAct(null)} 
          onFinish={async (data) => {
            try {
              const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== undefined)
              );
              await updateActivityStatus(closureAct.id, 'done', cleanData);

              // Si es NO CONFORME, generar tarea correctiva y disparar alerta automática en Firebase 'mail'
              if (data.conformidad_metrologica === 'No Conforme' || data.declaracion_conformidad === 'No Conforme') {
                const tenantId = closureAct.tenantId || tenant?.id;
                const nextWeekDate = new Date();
                nextWeekDate.setDate(nextWeekDate.getDate() + 7); // Plazo de 7 días
                const dateStr = nextWeekDate.toISOString().split('T')[0];

                const isMaint = (closureAct.tipo || '').toLowerCase().includes('mantenimiento');
                const failureDesc = isMaint 
                  ? `Falla técnica / Equipo No Operativo tras mantenimiento en ${closureAct.instrumentNombre}. Detalle: ${data.descripcion_trabajos || 'Equipo fuera de servicio'}.`
                  : `Desviación metrológica crítica (No Conforme) en ${closureAct.instrumentNombre}. Error: ${data.error_encontrado ?? 'N/A'}, Incertidumbre: ${data.incertidumbre ?? 'N/A'}. Tolerancia excedida.`;

                const correctiveAct = {
                  tenantId,
                  instrumentId: closureAct.instrumentId,
                  instrumentNombre: closureAct.instrumentNombre,
                  codigoMJM: closureAct.codigoMJM || '',
                  tipo: 'Mantenimiento Correctivo',
                  estado: 'todo',
                  fechaProgramada: dateStr,
                  priority: 'high',
                  notas: failureDesc
                };

                addActivity(correctiveAct);

                sendMetrologyEmailAlert({
                  activity: correctiveAct,
                  tenant,
                  reason: 'desviacion_no_conforme'
                }).catch(err => console.warn("Aviso al emitir alerta de correo:", err));
              }

              setToastMessage('✅ ¡Actividad registrada con éxito y guardada en la Hoja de Vida!');
              setTimeout(() => setToastMessage(''), 4500);
              setClosureAct(null);
            } catch (err) {
              console.error("Error al registrar actividad en Kanban:", err);
              throw err;
            }
          }}
        />
      )}

    </div>
  );
}
