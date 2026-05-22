import React, { useState, useMemo, useEffect } from 'react';
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
  Layers
} from 'lucide-react';

// --- MODAL DE CIERRE METROLÓGICO (Capa Freemium -> Premium) ---
const ClosureModal = ({ activity, onClose, onFinish }) => {
  const [file, setFile] = useState(null);
  const [laboratorio, setLaboratorio] = useState('');
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-outline/20 animate-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                 <CheckCircle size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-black text-secondary uppercase tracking-tight">Cierre de Actividad</h2>
                 <p className="text-[10px] font-bold text-neutral uppercase tracking-widest">Protocolo de Finalización Metrológica</p>
              </div>
           </div>
           <button onClick={onClose} className="text-neutral hover:text-secondary"><X size={24} /></button>
        </div>

        <div className="space-y-6">
           <div className="bg-surface p-4 rounded-2xl border border-outline/10">
              <p className="text-[10px] font-black text-neutral uppercase mb-1">Activo a Intervenir</p>
              <p className="text-sm font-bold text-secondary">{activity.instrumentNombre}</p>
              <p className="text-[10px] font-data text-primary mt-1">{activity.codigoMJM}</p>
           </div>

           <div>
              <label className="label-sm text-neutral mb-2 block">Laboratorio Ejecutor</label>
              <input 
                value={laboratorio} 
                onChange={e => setLaboratorio(e.target.value)}
                placeholder="Ej: Metrología Avanzada S.A.S" 
                className="input-metrology w-full" 
              />
           </div>

           {/* DROPZONE PARA CERTIFICADO */}
           <div className="border-2 border-dashed border-outline/30 rounded-3xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer bg-surface/50 group">
              <input type="file" className="hidden" id="cert-upload" onChange={e => setFile(e.target.files[0])} />
              <label htmlFor="cert-upload" className="cursor-pointer">
                 <FileUp size={40} className="mx-auto text-neutral group-hover:text-primary mb-4 transition-colors" />
                 {file ? (
                   <p className="text-xs font-bold text-emerald-600 truncate">{file.name}</p>
                 ) : (
                   <>
                    <p className="text-xs font-bold text-secondary">Cargar Certificado de Calibración</p>
                    <p className="text-[10px] text-neutral mt-1 uppercase tracking-widest">Formatos PDF, JPG (Max 10MB)</p>
                   </>
                 )}
              </label>
           </div>

           <div className="flex gap-4 pt-4">
              <button onClick={onClose} className="flex-1 btn-secondary py-4">Cancelar</button>
              <button 
                onClick={() => onFinish({ file, laboratorio })}
                disabled={!file || !laboratorio}
                className="flex-2 btn-primary py-4 px-10 shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                FINALIZAR Y VALIDAR IA
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const ActivityCard = ({ act, column, onStart, onFinish }) => {
  const isCritical = act.priority === 'high' || act.criticidad === 'Crítica' || act.criticidad === 'Alta';
  
  return (
    <article 
      draggable
      onDragStart={(e) => e.dataTransfer.setData('activityId', act.id)}
      className={`bg-[var(--surface)] border border-[var(--outline-color)] rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-[var(--primary)]/50 transition-all duration-300 cursor-grab active:cursor-grabbing ${column === 'done' ? 'opacity-80' : column === 'archived' ? 'opacity-60 grayscale' : ''}`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${
        column === 'vencidos' ? 'bg-red-500' : 
        column === 'doing' ? 'bg-emerald-500' : 
        column === 'en_proceso' ? 'bg-orange-500' : 
        'bg-amber-500'
      }`} />
      {isCritical && <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500" />}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded bg-[var(--surface-alt)] border border-[var(--outline-color)] ${
            column === 'vencidos' ? 'text-red-500' : 
            column === 'doing' ? 'text-emerald-500' : 
            column === 'en_proceso' ? 'text-orange-500' : 
            'text-amber-500'
          }`}>
            {act.tipo || 'INTERVENCIÓN'}
          </span>
          {act.estado === 'doing' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
        </div>
        <MoreVertical size={14} className="text-[var(--text-muted)] opacity-40 group-hover:opacity-100 transition-opacity" />
      </div>

      <h4 className="font-bold text-[var(--text-main)] text-sm mb-1 leading-tight">{act.instrumentNombre || 'Instrumento Sin Nombre'}</h4>
      <p className="font-data text-[10px] text-[var(--text-muted)] tracking-tighter mb-4">ID: {act.codigoMJM || 'MET-ID-000'}</p>

      {act.declaracion_conformidad && (
        <div className={`mb-4 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
          <ShieldCheck size={12}/>
          {act.declaracion_conformidad}
        </div>
      )}

      {/* Altura #2 (Oculto por defecto en desktop, visible al hacer hover) */}
      <div className="transition-all duration-300 ease-in-out xl:max-h-0 xl:opacity-0 xl:overflow-hidden xl:group-hover:max-h-60 xl:group-hover:opacity-100 xl:group-hover:mt-4">
        <div className="flex items-center justify-between pt-4 border-t border-[var(--outline-color)]">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                <User size={12} />
             </div>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <Clock size={12} />
            <span className="font-data text-[10px]">{act.fechaProgramada}</span>
          </div>
        </div>
        
        {act.estado === 'todo' && (
          <button 
            onClick={() => onStart(act.id)}
            className="mt-4 w-full py-2.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-[#1A202C] text-[var(--primary)] rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-[var(--primary)]/20"
          >
            <Play size={10} fill="currentColor" /> Iniciar Actividad
          </button>
        )}

        {act.estado === 'doing' && (
          <button 
            onClick={() => onFinish(act)}
            className="mt-4 w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-emerald-500/20"
          >
            <CheckCircle size={10} /> Finalizar Actividad
          </button>
        )}
      </div>
    </article>
  );
};

export default function KanbanMetrologico() {
  const { activities, loading, updateActivityStatus, loadActivities } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [search, setSearch] = useState('');
  const [closureAct, setClosureAct] = useState(null);
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
    return new Date().toISOString().split('T')[0];
  }, []);

  const weekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Start of current week (Sunday)
    const sundayStart = new Date(now);
    sundayStart.setDate(now.getDate() - day);
    sundayStart.setHours(0,0,0,0);
    
    // End of current week (Next Sunday)
    const sundayEnd = new Date(sundayStart);
    sundayEnd.setDate(sundayStart.getDate() + 7);
    sundayEnd.setHours(23,59,59,999);
    
    return {
      startStr: sundayStart.toISOString().split('T')[0],
      endStr: sundayEnd.toISOString().split('T')[0]
    };
  }, []);

  const next30DaysStr = useMemo(() => {
    const now = new Date();
    const next30 = new Date(now);
    next30.setDate(now.getDate() + 30);
    return next30.toISOString().split('T')[0];
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
      por_gestionar: activities.filter(a => a.estado === 'todo' && a.fechaProgramada > weekRange.endStr && a.fechaProgramada <= next30DaysStr && matchesSearch(a)),
      en_proceso: activities.filter(a => a.estado === 'todo' && a.fechaProgramada >= todayStr && a.fechaProgramada <= weekRange.endStr && matchesSearch(a)),
      doing: activities.filter(a => a.estado === 'doing' && matchesSearch(a)),
      vencidos: activities.filter(a => a.estado === 'todo' && a.fechaProgramada < todayStr && matchesSearch(a))
    };
  }, [activities, search, todayStr, weekRange, next30DaysStr]);

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('activityId');
    if (columnId === 'doing') {
      updateActivityStatus(id, 'doing');
    } else if (columnId === 'vencidos' || columnId === 'en_proceso' || columnId === 'por_gestionar') {
      updateActivityStatus(id, 'todo');
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* --- HEADER BOARD --- */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-4 md:mb-6 shrink-0">
        <div>
           <h1 className="font-black text-[var(--text-main)] text-2xl md:text-4xl tracking-tighter uppercase">Tablero de <span className="text-[var(--primary)] italic">Control</span></h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
           <button className="h-12 w-12 md:h-14 md:w-52 bg-[var(--primary)] text-[#1A202C] rounded-xl md:rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary)]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center shrink-0">
              <RefreshCw size={16} className="md:mr-2" /> <span className="hidden md:inline">Sincronizar</span>
           </button>
        </div>
      </section>

      {/* --- MOBILE TABS (visible only on mobile) --- */}
      <div className="flex xl:hidden bg-[var(--surface-alt)] border border-[var(--outline-color)] rounded-2xl p-1 mb-4 justify-between items-center shrink-0">
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
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all relative ${
                isActive 
                  ? `${col.activeTabClass} font-black shadow-md` 
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-center truncate w-full px-1">
                {mobileLabels[col.id]}
              </span>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full mt-1 border ${
                isActive 
                  ? 'bg-white/30 border-transparent text-current' 
                  : `bg-[var(--surface)] border-[var(--outline-color)] ${col.textColor}`
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
        className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth bg-background/50 rounded-[2.5rem] p-2"
      >
        <div className="flex gap-4 md:gap-gutter h-full">
          {columns.map(col => (
            <section 
              key={col.id} 
              id={`kanban-col-${col.id}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex-shrink-0 w-full xl:flex-1 xl:min-w-[240px] snap-center xl:snap-align-none flex flex-col h-full bg-surface-alt rounded-3xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></div>
                  <h3 className="text-xs md:text-sm font-black text-[var(--text-main)] uppercase tracking-[0.15em]">{col.label}</h3>
                  <span className={`bg-[var(--surface)] px-2.5 py-0.5 rounded-full text-xs font-black border border-[var(--outline-color)] ${col.textColor} shadow-sm`}>
                    {grouped[col.id]?.length || 0}
                  </span>
                </div>
                <button className="p-1.5 hover:bg-white rounded-lg text-neutral"><MoreHorizontal size={14} /></button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1 pb-20">
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
                   <div className="py-12 text-center text-neutral opacity-20 flex flex-col items-center gap-2">
                       <Layers size={32} />
                       <span className="text-[9px] font-bold uppercase tracking-widest">Columna Vacía</span>
                   </div>
                 )}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* --- MODAL DE CIERRE --- */}
      {closureAct && (
        <ClosureModal 
          activity={closureAct} 
          onClose={() => setClosureAct(null)} 
          onFinish={(data) => {
            updateActivityStatus(closureAct.id, 'done', {
               error_encontrado: 0.0001,
               incertidumbre_medicion: 0.0002,
               declaracion_conformidad: 'Conforme'
            });
            setClosureAct(null);
          }}
        />
      )}

    </div>
  );
}
