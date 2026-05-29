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
  Layers
} from 'lucide-react';

// --- MODAL DE CIERRE METROLÓGICO (Capa Freemium -> Premium) ---
const ClosureModal = ({ activity, onClose, onFinish }) => {
  const [file, setFile] = useState(null);
  const [laboratorio, setLaboratorio] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [patronReferencia, setPatronReferencia] = useState('');
  const [laboratorioTipo, setLaboratorioTipo] = useState('Acreditado');
  const [errorEncontrado, setErrorEncontrado] = useState('');
  const [incertidumbre, setIncertidumbre] = useState('');
  const [criterioTipo, setCriterioTipo] = useState('emp'); // 'emp' o 'tolerancia'
  const [criterioValor, setCriterioValor] = useState('');
  
  const getColombiaDate = () => {
    const d = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Bogota"}));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getColombiaDate();
  const isVencida = activity.fechaProgramada < todayStr;
  const [fechaEjecucion, setFechaEjecucion] = useState(todayStr);

  const parsedError = parseFloat(errorEncontrado);
  const parsedIncertidumbre = parseFloat(incertidumbre);
  const parsedCriterio = parseFloat(criterioValor);

  const compliance = useMemo(() => {
    if (isNaN(parsedError) || isNaN(parsedIncertidumbre) || isNaN(parsedCriterio)) {
      return 'No Evaluado';
    }
    return (parsedError + parsedIncertidumbre <= parsedCriterio) ? 'Conforme' : 'No Conforme';
  }, [parsedError, parsedIncertidumbre, parsedCriterio]);

  const handleFinish = async () => {
    setIsUploading(true);
    let certificado_url = null;
    
    if (file) {
      try {
        const tenantId = activity.tenantId || useAuthStore.getState().tenant?.id;
        const fileRef = ref(storage, `tenants/${tenantId}/actividades/${activity.id}/certificados/${file.name}`);
        await uploadBytes(fileRef, file);
        certificado_url = await getDownloadURL(fileRef);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    
    onFinish({ 
      laboratorio, 
      fecha_ejecucion: fechaEjecucion, 
      certificado_url,
      patron_referencia: patronReferencia || null,
      laboratorio_tipo: laboratorioTipo,
      error_encontrado: isNaN(parsedError) ? null : parsedError,
      incertidumbre: isNaN(parsedIncertidumbre) ? null : parsedIncertidumbre,
      criterio_tipo: criterioTipo,
      criterio_valor: isNaN(parsedCriterio) ? null : parsedCriterio,
      conformidad_metrologica: compliance
    });
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl border border-outline/20 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                 <CheckCircle size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-black text-secondary uppercase tracking-tight">Cierre de Actividad</h2>
              </div>
           </div>
           <button onClick={onClose} className="text-neutral hover:text-secondary"><X size={24} /></button>
        </div>

        <div className="space-y-6">
           <div className="bg-surface p-5 rounded-2xl border border-outline/10">
              <p className="text-[10px] font-black text-neutral uppercase mb-1">Activo a Intervenir</p>
              <p className="text-base font-bold text-secondary mb-1">{activity.instrumentNombre}</p>
              <p className="inline-block mt-2 px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black rounded-lg border border-[var(--primary)]/20">
                ID: {activity.codigo || activity.codigoMJM || 'Sin Código'}
              </p>
           </div>

           {isVencida && (
             <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <div>
                   <p className="text-xs font-black text-red-700 uppercase tracking-widest">Novedad: Tarea Vencida</p>
                   <p className="text-xs text-red-600 mt-1">Esta actividad expiró. La fecha de ejecución se ha fijado obligatoriamente a la fecha de hoy para reflejar el cierre tardío.</p>
                </div>
             </div>
           )}

           <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="label-sm text-neutral mb-2 block">Fecha de Ejecución</label>
                  <input 
                    type="text"
                    placeholder="AAAA-MM-DD"
                    value={fechaEjecucion}
                    onChange={e => setFechaEjecucion(e.target.value)}
                    disabled={isVencida}
                    className={`input-metrology w-full font-data tracking-wider ${isVencida ? 'opacity-60 cursor-not-allowed bg-neutral-100' : ''}`}
                  />
               </div>
               <div>
                  <label className="label-sm text-neutral mb-2 block">Ejecutó (Laboratorio)</label>
                  <input 
                    value={laboratorio} 
                    onChange={e => setLaboratorio(e.target.value)}
                    placeholder="Ej: Metrología Avanzada" 
                    className="input-metrology w-full" 
                  />
               </div>
           </div>

           {/* TRAZABILIDAD Y PATRÓN (OPCIONAL) */}
           <div className="bg-slate-50/50 p-5 rounded-2xl border border-outline/10 space-y-4">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Trazabilidad Metrológica (Opcional)</p>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="label-sm text-neutral mb-1.5 block">Patrón de Referencia</label>
                 <input 
                   value={patronReferencia} 
                   onChange={e => setPatronReferencia(e.target.value)}
                   placeholder="Ej: Bloques patrón grado 0" 
                   className="input-metrology w-full" 
                 />
               </div>
               <div>
                 <label className="label-sm text-neutral mb-1.5 block">Tipo de Laboratorio</label>
                 <div className="flex gap-2">
                   {['Acreditado', 'Trazable'].map((t) => (
                     <button
                       key={t}
                       type="button"
                       onClick={() => setLaboratorioTipo(t)}
                       className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                         laboratorioTipo === t
                           ? 'bg-[var(--primary)] border-transparent text-slate-900 shadow-sm'
                           : 'bg-white border-outline/20 text-neutral hover:bg-slate-50'
                       }`}
                     >
                       {t}
                     </button>
                   ))}
                 </div>
               </div>
             </div>
           </div>

           {/* CONFIRMACIÓN METROLÓGICA (OPCIONAL) */}
           <div className="bg-slate-50/50 p-5 rounded-2xl border border-outline/10 space-y-4">
             <div className="flex justify-between items-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Confirmación Metrológica ISO 10012 (Opcional)</p>
               {compliance !== 'No Evaluado' && (
                 <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${
                   compliance === 'Conforme' 
                     ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' 
                     : 'bg-red-50 text-red-600 border border-red-500/20'
                 }`}>
                   {compliance === 'Conforme' ? 'Cumple (Conforme)' : 'Desviación (No Conforme)'}
                 </span>
               )}
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="label-sm text-neutral mb-1.5 block">Error Máx. Encontrado</label>
                 <input 
                   type="number"
                   step="any"
                   value={errorEncontrado} 
                   onChange={e => setErrorEncontrado(e.target.value)}
                   placeholder="Ej: 0.002" 
                   className="input-metrology w-full" 
                 />
               </div>
               <div>
                 <label className="label-sm text-neutral mb-1.5 block">Incertidumbre (U)</label>
                 <input 
                   type="number"
                   step="any"
                   value={incertidumbre} 
                   onChange={e => setIncertidumbre(e.target.value)}
                   placeholder="Ej: 0.0005" 
                   className="input-metrology w-full" 
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="label-sm text-neutral mb-1.5 block">Criterio de Aceptación</label>
                 <div className="flex gap-2">
                   {[
                     { id: 'emp', label: 'EMP' },
                     { id: 'tolerancia', label: 'Tolerancia ±' }
                   ].map((c) => (
                     <button
                       key={c.id}
                       type="button"
                       onClick={() => setCriterioTipo(c.id)}
                       className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                         criterioTipo === c.id
                           ? 'bg-secondary text-white border-transparent shadow-sm'
                           : 'bg-white border-outline/20 text-neutral hover:bg-slate-50'
                       }`}
                     >
                       {c.label}
                     </button>
                   ))}
                 </div>
               </div>
               <div>
                 <label className="label-sm text-neutral mb-1.5 block">Valor del Límite</label>
                 <input 
                   type="number"
                   step="any"
                   value={criterioValor} 
                   onChange={e => setCriterioValor(e.target.value)}
                   placeholder="Ej: 0.005" 
                   className="input-metrology w-full" 
                 />
               </div>
             </div>
           </div>

           {/* DROPZONE PARA CERTIFICADO */}
           <div className="border-2 border-dashed border-outline/30 rounded-3xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer bg-surface/50 group">
              <input type="file" className="hidden" id="cert-upload" onChange={e => setFile(e.target.files[0])} />
              <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center">
                 <FileUp size={40} className="text-neutral group-hover:text-primary mb-4 transition-colors" />
                 {file ? (
                   <p className="text-xs font-bold text-emerald-600 truncate">{file.name}</p>
                 ) : (
                   <>
                    <p className="text-xs font-bold text-secondary">Cargar Soporte Documental</p>
                    <p className="text-[10px] text-neutral mt-1 uppercase tracking-widest">Formatos PDF, JPG (Max 10MB)</p>
                   </>
                 )}
              </label>
           </div>

           <div className="flex gap-4 pt-4">
              <button onClick={onClose} className="flex-1 btn-secondary py-4" disabled={isUploading}>Cancelar</button>
              <button 
                onClick={handleFinish}
                disabled={!file || !laboratorio || isUploading}
                className="flex-2 btn-primary py-4 px-10 shadow-xl shadow-primary/20 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isUploading ? (
                  <><RefreshCw size={18} className="animate-spin" /> SUBIENDO...</>
                ) : (
                  'FINALIZAR'
                )}
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

      <h4 className="font-bold text-[var(--text-main)] text-sm mb-1.5 leading-tight">{act.instrumentNombre || 'Instrumento Sin Nombre'}</h4>
      
      <div className="flex justify-between items-center text-xs font-black text-slate-800 dark:text-slate-100 mb-3">
        <span className="flex items-center gap-1.5 bg-[var(--primary)]/15 text-slate-800 dark:text-slate-100 px-2.5 py-1 rounded-lg border border-[var(--primary)]/30">
          <Clock size={14} className="text-[var(--primary)]" />
          <span>Vence: {act.fechaProgramada}</span>
        </span>
        <span>ID: {act.codigo || act.codigoMJM || 'Sin Código'}</span>
      </div>

      {act.declaracion_conformidad && (
        <div className={`mb-3 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
          <ShieldCheck size={10}/>
          {act.declaracion_conformidad}
        </div>
      )}

      {/* Altura #2 (Oculto por defecto en desktop, visible al hacer hover) */}
      <div className="transition-all duration-300 ease-in-out mt-3 xl:mt-0 xl:max-h-0 xl:opacity-0 xl:overflow-hidden xl:group-hover:max-h-20 xl:group-hover:opacity-100 xl:group-hover:mt-3">
        {act.estado === 'todo' && (
          <button 
            onClick={() => onStart(act.id)}
            className="w-full py-2.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-[#1A202C] text-[var(--primary)] rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-[var(--primary)]/20"
          >
            <Play size={10} fill="currentColor" /> Iniciar Actividad
          </button>
        )}

        {act.estado === 'doing' && (
          <button 
            onClick={() => onFinish(act)}
            className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-emerald-500/20"
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
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-4 md:mb-6 shrink-0">
        <div>
           <h1 className="font-black text-[var(--text-main)] text-2xl md:text-4xl tracking-tighter uppercase">Tablero de <span className="text-[var(--primary)] italic">Control</span></h1>
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
                  <div className={`w-3 h-3 rounded-full ${col.dotColor}`}></div>
                  <h3 className="text-sm md:text-base font-black text-[var(--text-main)] uppercase tracking-[0.15em]">{col.label}</h3>
                  <span className={`bg-[var(--surface)] px-2.5 py-0.5 rounded-full text-xs md:text-sm font-black border border-[var(--outline-color)] ${col.textColor} shadow-sm`}>
                    {grouped[col.id]?.length || 0}
                  </span>
                </div>
                <div className="relative group/tooltip">
                  <button className="p-1.5 hover:bg-white rounded-lg text-neutral/40 hover:text-[var(--primary)] transition-colors">
                     <Info size={16} />
                  </button>
                  <div className="absolute right-0 top-8 w-72 bg-[var(--sidebar-bg)] text-white text-xs p-4 rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/20 font-bold leading-relaxed">
                     {col.id === 'por_gestionar' && 'Actividades programadas desde el Lunes próximo hasta +30 días hacia el futuro.'}
                     {col.id === 'en_proceso' && 'El sprint actual: Actividades que deben ejecutarse esta semana (Lunes a Domingo).'}
                     {col.id === 'doing' && 'Actividades que has movido manualmente y se están ejecutando en este momento.'}
                     {col.id === 'vencidos' && 'Actividades que expiraron porque su fecha programada quedó en el pasado.'}
                  </div>
                </div>
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
               error_encontrado: data.error_encontrado,
               incertidumbre_medicion: data.incertidumbre,
               declaracion_conformidad: data.conformidad_metrologica,
               fecha_ejecucion: data.fecha_ejecucion,
               laboratorio_ejecutor: data.laboratorio,
               certificado_url: data.certificado_url,
               patron_referencia: data.patron_referencia,
               laboratorio_tipo: data.laboratorio_tipo,
               criterio_tipo: data.criterio_tipo,
               criterio_valor: data.criterio_valor
            });

            // Si es NO CONFORME, generar tarea correctiva automáticamente
            if (data.conformidad_metrologica === 'No Conforme') {
              const tenantId = closureAct.tenantId || tenant?.id;
              const nextWeekDate = new Date();
              nextWeekDate.setDate(nextWeekDate.getDate() + 7); // Plazo de 7 días
              const dateStr = nextWeekDate.toISOString().split('T')[0];

              addActivity({
                tenantId,
                instrumentId: closureAct.instrumentId,
                instrumentNombre: closureAct.instrumentNombre,
                codigoMJM: closureAct.codigoMJM || '',
                tipo: 'Mantenimiento',
                estado: 'todo',
                fechaProgramada: dateStr,
                priority: 'high',
                notas: `Generado automáticamente por desviación metrológica crítica detectada en calibración/verificación del activo. Tolerancia excedida.`
              });
            }

            setClosureAct(null);
          }}
        />
      )}

    </div>
  );
}
