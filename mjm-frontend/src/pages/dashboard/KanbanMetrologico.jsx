import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Info, 
  Calendar,
  ShieldCheck,
  MoreVertical,
  Layers,
  Search,
  ArrowRight,
  ExternalLink,
  FileText,
  Check,
  Filter,
  Sparkles,
  X,
  Activity,
  Flame,
  CheckCircle,
  Wrench,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

import ClosureModal from '../../components/dashboard/ClosureModal';
import { sendMetrologyEmailAlert } from '../../services/emailAlertService';

// --- TIPO DE RUTINA BADGE ---
const RoutineBadge = ({ tipo }) => {
  const configs = {
    'Calibración': {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-500/30'
    },
    'Verificación': {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30'
    },
    'Mantenimiento': {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30'
    },
    'Calificación': {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-500/30'
    },
    'Mantenimiento Correctivo': {
      bg: 'bg-red-500/10 dark:bg-red-500/15',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-500/30'
    }
  };

  const c = configs[tipo] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/20'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      {tipo || 'INTERVENCIÓN'}
    </span>
  );
};

// --- TARJETA DE ACTIVIDAD KANBAN (INDUSTRIAL PRECISION) ---
const ActivityCard = ({ act, column, onStart, onFinish, onRevert }) => {
  const navigate = useNavigate();
  const isCritical = act.priority === 'high' || act.criticidad === 'Crítica' || act.criticidad === 'Alta';

  return (
    <article 
      draggable={column !== 'done'}
      onDragStart={(e) => {
        e.dataTransfer.setData('activityId', act.id);
        e.dataTransfer.setData('sourceColumn', column);
      }}
      className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200 relative group select-none ${
        column === 'done' 
          ? 'opacity-85 hover:border-emerald-500/40' 
          : 'cursor-grab active:cursor-grabbing hover:border-[var(--primary)]/60'
      }`}
    >
      {/* Barra lateral de acento de columna */}
      <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-xl ${
        column === 'vencidos' ? 'bg-red-500' : 
        column === 'doing' ? 'bg-emerald-500' : 
        column === 'en_proceso' ? 'bg-amber-500' : 
        column === 'done' ? 'bg-emerald-600' :
        'bg-blue-500'
      }`} />

      {/* Indicador de Criticidad Alta en esquina derecha */}
      {isCritical && (
        <div className="absolute top-0 right-0 w-1 h-full bg-red-500 rounded-r-xl" title="Activo de Criticidad Alta/Crítica" />
      )}
      
      {/* Encabezado de la Tarjeta */}
      <div className="flex justify-between items-start mb-2 pl-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <RoutineBadge tipo={act.tipo} />
          {column === 'doing' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              En Mesa
            </span>
          )}
        </div>
        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded border border-slate-200 dark:border-zinc-700">
          {act.codigo || act.codigoMJM || 'MJM'}
        </span>
      </div>

      {/* Nombre del Instrumento con enlace a Hoja de Vida */}
      <div className="pl-1.5 mb-2.5">
        <h4 
          onClick={() => act.instrumentId && navigate(`/dashboard/inventario/${act.instrumentId}`)}
          className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2 hover:text-[var(--primary)] transition-colors cursor-pointer flex items-center justify-between group/title"
          title="Ver Expediente Técnico en Hoja de Vida"
        >
          <span>{act.instrumentNombre || 'Instrumento Sin Nombre'}</span>
          <ExternalLink size={11} className="opacity-0 group-hover/title:opacity-100 text-slate-400 shrink-0 ml-1 transition-opacity" />
        </h4>
      </div>
      
      {/* Datos Clave: Fecha Programada / Ejecutada */}
      <div className="flex justify-between items-center text-[10px] pl-1.5 mb-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-[9.5px] border ${
          column === 'vencidos'
            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
        }`}>
          <Clock size={11} className={column === 'vencidos' ? 'text-red-500' : 'text-slate-400'} />
          <span>{act.fechaProgramada || 'Sin Fecha'}</span>
        </span>

        {isCritical && (
          <span className="text-[8.5px] font-bold text-red-600 dark:text-red-400 flex items-center gap-0.5">
            <Flame size={10} /> Crítica
          </span>
        )}
      </div>

      {/* Declaración de Conformidad si está realizada */}
      {act.declaracion_conformidad && (
        <div className={`mb-2.5 pl-1.5`}>
          <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
            act.declaracion_conformidad === 'Conforme'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
          }`}>
            <ShieldCheck size={10}/>
            {act.declaracion_conformidad}
          </span>
        </div>
      )}

      {/* Acciones de Tarjeta (100% Operable con 1 Clic o Touch) */}
      <div className="pt-2 pl-1.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
        {column !== 'doing' && column !== 'done' && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStart(act.id);
            }}
            className="flex-1 py-1.5 px-2.5 bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 rounded-lg font-bold text-[9.5px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-blue-500/20 cursor-pointer shadow-xs active:scale-95"
            title="Mover a la mesa de trabajo técnica (Doing)"
          >
            <Play size={10} fill="currentColor" /> Iniciar Actividad
          </button>
        )}

        {column === 'doing' && (
          <div className="flex-1 flex gap-1.5">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFinish(act);
              }}
              className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[9.5px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Abrir protocolo de cierre y adjuntar certificado"
            >
              <CheckCircle2 size={11} /> Finalizar / Certificar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRevert(act.id);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Regresar a pendientes"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        )}

        {column === 'done' && (
          <div className="w-full flex items-center justify-between text-[9px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
            <span className="inline-flex items-center gap-1">
              <CheckCircle size={11} /> Completada
            </span>
            <span className="text-slate-400 font-normal">
              {act.fecha_ejecucion || act.fechaRealizacion || 'Registrada'}
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

// --- COMPONENTE PRINCIPAL TABLERO KANBAN ---
export default function KanbanMetrologico() {
  const { activities, loading, updateActivityStatus, loadActivities, addActivity } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('Todos');
  const [showDoneColumn, setShowDoneColumn] = useState(false);
  const [closureAct, setClosureAct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('en_proceso');
  const boardRef = useRef(null);

  // Carga reactiva de actividades del tenant
  useEffect(() => {
    if (tenant?.id) {
      const unsubscribe = loadActivities(tenant.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [tenant?.id, loadActivities]);

  const todayStr = useMemo(() => {
    const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Rango de la semana actual (Lunes a Domingo)
  const weekRange = useMemo(() => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
    const day = now.getDay();
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

  // Rango del mes futuro (+30 días)
  const nextManageRange = useMemo(() => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
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

  // Definición de columnas
  const baseColumns = [
    { 
      id: 'por_gestionar', 
      label: 'Programadas (Mes)', 
      color: 'text-blue-500', 
      dotColor: 'bg-blue-500', 
      textColor: 'text-blue-600 dark:text-blue-400', 
      activeTabClass: 'bg-blue-500 text-white', 
      icon: <Calendar size={14} />,
      info: 'Actividades programadas para los próximos 30 días.'
    },
    { 
      id: 'en_proceso', 
      label: 'Semana en Curso', 
      color: 'text-amber-500', 
      dotColor: 'bg-amber-500', 
      textColor: 'text-amber-600 dark:text-amber-400', 
      activeTabClass: 'bg-amber-500 text-slate-900', 
      icon: <Clock size={14} />,
      info: 'Sprint operativo de esta semana (Lunes a Domingo).'
    },
    { 
      id: 'doing', 
      label: 'En Ejecución Técnica', 
      color: 'text-emerald-500', 
      dotColor: 'bg-emerald-500', 
      textColor: 'text-emerald-600 dark:text-emerald-400', 
      activeTabClass: 'bg-emerald-500 text-white', 
      icon: <Play size={14} />,
      info: 'Equipos actualmente en mesa de calibración o mantenimiento.'
    },
    { 
      id: 'vencidos', 
      label: 'Vencidas / Alerta', 
      color: 'text-red-500', 
      dotColor: 'bg-red-500', 
      textColor: 'text-red-600 dark:text-red-400', 
      activeTabClass: 'bg-red-500 text-white', 
      icon: <AlertCircle size={14} />,
      info: 'Actividades cuya fecha programada quedó en el pasado sin ejecutar.'
    },
  ];

  const columns = useMemo(() => {
    if (showDoneColumn) {
      return [
        ...baseColumns,
        {
          id: 'done',
          label: 'Cerradas Recientes',
          color: 'text-emerald-600',
          dotColor: 'bg-emerald-600',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          activeTabClass: 'bg-emerald-600 text-white',
          icon: <CheckCircle2 size={14} />,
          info: 'Actividades cerradas con certificado o reporte adjunto.'
        }
      ];
    }
    return baseColumns;
  }, [showDoneColumn]);

  // Agrupamiento y filtrado reactivo
  const grouped = useMemo(() => {
    const s = search.toLowerCase().trim();
    const filterFn = (a) => {
      const matchSearch = !s || (a.instrumentNombre?.toLowerCase().includes(s) || a.codigoMJM?.toLowerCase().includes(s));
      const matchType = selectedTypeFilter === 'Todos' || a.tipo === selectedTypeFilter;
      return matchSearch && matchType;
    };
    
    return {
      por_gestionar: activities
        .filter(a => a.estado === 'todo' && a.fechaProgramada >= nextManageRange.startStr && a.fechaProgramada <= nextManageRange.endStr && filterFn(a))
        .sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada)),
      en_proceso: activities
        .filter(a => a.estado === 'todo' && a.fechaProgramada >= weekRange.startStr && a.fechaProgramada <= weekRange.endStr && filterFn(a))
        .sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada)),
      doing: activities
        .filter(a => a.estado === 'doing' && filterFn(a))
        .sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada)),
      vencidos: activities
        .filter(a => a.estado === 'todo' && a.fechaProgramada < todayStr && filterFn(a))
        .sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada)),
      done: activities
        .filter(a => a.estado === 'done' && filterFn(a))
        .slice(0, 25)
    };
  }, [activities, search, selectedTypeFilter, todayStr, weekRange, nextManageRange]);

  // Totales para métricas
  const counts = useMemo(() => ({
    programadas: grouped.por_gestionar.length,
    semana: grouped.en_proceso.length,
    enEjecucion: grouped.doing.length,
    vencidas: grouped.vencidos.length,
    completadas: activities.filter(a => a.estado === 'done').length
  }), [grouped, activities]);

  // Drag & Drop Handler (Operabilidad Total)
  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('activityId');
    const act = activities.find(a => a.id === id);
    if (!act) return;

    if (targetColumnId === 'doing') {
      await updateActivityStatus(id, 'doing');
      setToastMessage(`🔧 ${act.instrumentNombre || 'Equipo'} pasado a Ejecución Técnica.`);
      setTimeout(() => setToastMessage(''), 3500);
    } else if (targetColumnId === 'done') {
      // Arrastrar a done abre directamente el modal de certificación
      setClosureAct(act);
    } else {
      // Devolver a estado 'todo'
      if (act.estado === 'doing') {
        await updateActivityStatus(id, 'todo');
        setToastMessage(`↩️ Actividad devuelta a estado pendiente.`);
        setTimeout(() => setToastMessage(''), 3500);
      }
    }
  };

  const handleBoardScroll = (e) => {
    if (window.innerWidth >= 1280) return;
    const scrollLeft = e.target.scrollLeft;
    const clientWidth = e.target.clientWidth;
    if (clientWidth === 0) return;
    const activeIndex = Math.round(scrollLeft / clientWidth);
    if (columns[activeIndex] && columns[activeIndex].id !== activeTab) {
      setActiveTab(columns[activeIndex].id);
    }
  };

  const handleTabClick = (colId) => {
    setActiveTab(colId);
    const el = document.getElementById(`kanban-col-${colId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">
      
      {/* --- FLOATING / FROSTED CONTROL TOOLBAR (Estándar Diseñador-Web) --- */}
      <header className="sticky top-0 z-30 mb-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3.5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-space font-bold text-slate-900 dark:text-white text-xl sm:text-2xl tracking-tight uppercase">
                Tablero Kanban <span className="text-[var(--primary)] dark:text-[#f7931b]">Operativo</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Interactivo en Vivo
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Control Táctico de WIP, Intervenciones en Taller & Cierres Metrológicos
            </p>
          </div>

          {/* Buscador y Toggle de Cerradas */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrar por equipo o código..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[var(--primary)] font-medium transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowDoneColumn(prev => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 border ${
                showDoneColumn 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              <CheckCircle2 size={14} />
              <span className="hidden sm:inline">Cerradas</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">{counts.completadas}</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros Rápidos por Rutina */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar pt-1 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mr-1 shrink-0 flex items-center gap-1">
              <Filter size={11} /> Tipo:
            </span>
            {['Todos', 'Calibración', 'Verificación', 'Mantenimiento', 'Calificación'].map((type) => {
              const active = selectedTypeFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all shrink-0 border ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-950 border-slate-900 dark:border-white shadow-xs'
                      : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Conteo de Estado Rápido */}
          <div className="hidden xl:flex items-center gap-3 text-[10px] font-mono text-slate-500 shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Mes: <strong>{counts.programadas}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Semana: <strong>{counts.semana}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> En Mesa: <strong>{counts.enEjecucion}</strong>
            </span>
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Vencidas: <strong>{counts.vencidas}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* --- MOBILE TABS NAVIGATION --- */}
      <div className="flex xl:hidden bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 mb-3 justify-between items-center shrink-0">
        {columns.map(col => {
          const count = (grouped[col.id] || []).length;
          const isActive = activeTab === col.id;
          return (
            <button
              key={col.id}
              onClick={() => handleTabClick(col.id)}
              className={`flex-1 flex flex-col items-center py-1.5 rounded-lg transition-all ${
                isActive 
                  ? `${col.activeTabClass} font-bold shadow-xs` 
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-center truncate w-full px-1">
                {col.label.split(' ')[0]}
              </span>
              <span className={`text-[8.5px] font-mono font-bold px-1.5 rounded-full mt-0.5 border ${
                isActive 
                  ? 'bg-white/30 border-transparent text-current' 
                  : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- KANBAN BOARD CONTAINER --- */}
      <main 
        ref={boardRef}
        onScroll={handleBoardScroll}
        className="flex-1 overflow-x-auto custom-scrollbar snap-x snap-mandatory scroll-smooth pb-4"
      >
        <div className="flex gap-4 h-full min-h-[550px]">
          {columns.map(col => {
            const items = grouped[col.id] || [];

            return (
              <section 
                key={col.id} 
                id={`kanban-col-${col.id}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.id)}
                className="w-full xl:w-80 flex-shrink-0 snap-center xl:snap-align-none flex flex-col h-full bg-slate-50/80 dark:bg-zinc-900/50 rounded-2xl p-3.5 border border-slate-200 dark:border-zinc-800/80 transition-colors shadow-xs"
              >
                {/* Header de Columna */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className="font-space text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {col.label}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 ${col.textColor} shadow-xs`}>
                      {items.length}
                    </span>
                  </div>

                  <div className="relative group/tooltip">
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <Info size={14} />
                    </button>
                    <div className="absolute right-0 top-7 w-60 bg-slate-900 text-white text-[10.5px] p-3 rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 shadow-xl border border-slate-700 font-medium leading-relaxed">
                      {col.info}
                    </div>
                  </div>
                </div>

                {/* Zona de Arrastre de Tarjetas */}
                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 pb-10">
                  {items.map(act => (
                    <ActivityCard 
                      key={act.id} 
                      act={act} 
                      column={col.id} 
                      onStart={(id) => updateActivityStatus(id, 'doing')}
                      onFinish={(act) => setClosureAct(act)}
                      onRevert={(id) => updateActivityStatus(id, 'todo')}
                    />
                  ))}
                  
                  {items.length === 0 && (
                    <div className="h-40 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-zinc-600">
                      <Layers size={22} className="opacity-40" />
                      <span className="text-[10px] font-mono uppercase tracking-wider">Sin actividades en este estado</span>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* TOAST DE NOTIFICACIÓN DE ESTADO */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900/95 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-400/40 backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={17} />
          <span className="text-xs font-bold font-inter">{toastMessage}</span>
        </div>
      )}

      {/* MODAL DE CIERRE METROLÓGICO (SUBIR CERTIFICADOS & ERROR) */}
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

              // Disparar acción correctiva si fue No Conforme
              if (data.conformidad_metrologica === 'No Conforme' || data.declaracion_conformidad === 'No Conforme') {
                const tenantId = closureAct.tenantId || tenant?.id;
                const nextWeekDate = new Date();
                nextWeekDate.setDate(nextWeekDate.getDate() + 7);
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

              setToastMessage('✅ ¡Intervención registrada y guardada en el historial del instrumento!');
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
