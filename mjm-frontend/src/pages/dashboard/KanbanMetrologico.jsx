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
  Search,
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
  const progress = act.progreso || (act.estado === 'doing' ? 65 : 0);
  
  return (
    <article 
      draggable
      onDragStart={(e) => e.dataTransfer.setData('activityId', act.id)}
      className={`bg-[var(--surface)] border border-[var(--outline-color)] rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-[var(--primary)]/50 transition-all duration-300 cursor-grab active:cursor-grabbing ${column === 'done' ? 'opacity-80' : column === 'archived' ? 'opacity-60 grayscale' : ''}`}
    >
      {isCritical && <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500" />}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded bg-[var(--surface-alt)] border border-[var(--outline-color)] ${column === 'vencidos' ? 'text-red-500' : column === 'doing' ? 'text-[var(--tertiary)]' : 'text-[var(--primary)]'}`}>
            {act.tipo || 'INTERVENCIÓN'}
          </span>
          {act.estado === 'doing' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--tertiary)] animate-pulse" />}
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

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--outline-color)]">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <User size={12} />
           </div>
           {act.estado === 'doing' && <span className="text-[10px] text-[var(--primary)] font-black">{progress}%</span>}
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
      
      {act.estado === 'doing' && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant">
           <div className="h-full bg-[var(--tertiary)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}
    </article>
  );
};

export default function KanbanMetrologico() {
  const { activities, loading, updateActivityStatus, loadActivities } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [search, setSearch] = useState('');
  const [closureAct, setClosureAct] = useState(null);

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
    { id: 'por_gestionar', label: 'Por Gestionar', color: 'text-primary', icon: <Calendar size={14}/> },
    { id: 'en_proceso', label: 'En Proceso', color: 'text-[var(--tertiary)]', icon: <Clock size={14}/> },
    { id: 'doing', label: 'Doing', color: 'text-emerald-600', icon: <Play size={14}/> },
    { id: 'vencidos', label: 'Vencidos', color: 'text-red-500', icon: <AlertCircle size={14}/> },
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
      <section className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-1">MJM Operational Engine</p>
           <h1 className="font-black text-[var(--text-main)] text-4xl tracking-tighter uppercase">Tablero de <span className="text-[var(--primary)] italic">Control</span></h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
           {/* Buscador Premium */}
           <div className="relative flex-1 md:w-80 group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrar por equipo o ID..." 
                className="w-full h-14 pl-14 pr-6 bg-[var(--surface-alt)] border border-[var(--outline-color)] rounded-2xl outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/5 transition-all text-[var(--text-main)] font-medium placeholder:text-[var(--text-muted)]/50"
              />
           </div>
           
           <button className="h-14 px-8 bg-[var(--primary)] text-[#1A202C] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary)]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3">
              <RefreshCw size={18} /> Sincronizar
           </button>
        </div>
      </section>

      {/* --- KANBAN BOARD --- */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar bg-background/50 rounded-[2.5rem] p-2">
        <div className="flex gap-gutter h-full">
          {columns.map(col => (
            <section 
              key={col.id} 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex-shrink-0 w-[300px] lg:w-[320px] flex flex-col h-full bg-surface-alt rounded-3xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.id === 'doing' ? 'bg-[var(--tertiary)]' : col.id === 'vencidos' ? 'bg-red-500' : 'bg-primary'}`}></div>
                  <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em]">{col.label}</h3>
                  <span className="bg-[var(--surface)] px-2.5 py-0.5 rounded-full text-[10px] font-black border border-[var(--outline-color)] text-[var(--primary)] shadow-sm">
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
