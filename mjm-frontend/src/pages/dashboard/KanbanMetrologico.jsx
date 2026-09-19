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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--surface)] text-[var(--text-main)] rounded-2xl p-6 sm:p-7 w-full max-w-xl shadow-2xl border border-[var(--outline-color)]/30 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-5 pb-3.5 border-b border-[var(--outline-color)]/20">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                 <CheckCircle size={20} />
              </div>
              <div>
                 <h2 className="text-lg font-bold text-[var(--text-main)] uppercase tracking-tight">Cierre de Actividad</h2>
                 <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Protocolo de Certificación Metrológica</p>
              </div>
           </div>
           <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg transition-colors"><X size={20} /></button>
        </div>

        <div className="space-y-4">
           <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20">
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Activo a Intervenir</p>
              <p className="text-sm font-bold text-[var(--text-main)]">{activity.instrumentNombre}</p>
              <p className="inline-block mt-1.5 px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-mono font-bold rounded border border-[var(--primary)]/20">
                ID: {activity.codigo || activity.codigoMJM || 'Sin Código'}
              </p>
           </div>

           {isVencida && (
             <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/30 flex items-start gap-2.5">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <div>
                   <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Novedad: Tarea Vencida</p>
                   <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 leading-relaxed">Esta actividad expiró. La fecha de ejecución se ha fijado obligatoriamente a hoy para registrar el cierre extemporáneo.</p>
                </div>
             </div>
           )}

           <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Fecha de Ejecución</label>
                  <input 
                    type="text"
                    placeholder="AAAA-MM-DD"
                    value={fechaEjecucion}
                    onChange={e => setFechaEjecucion(e.target.value)}
                    disabled={isVencida}
                    className={`w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-mono font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)] ${isVencida ? 'opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-zinc-800' : ''}`}
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Ejecutó (Laboratorio)</label>
                  <input 
                    value={laboratorio} 
                    onChange={e => setLaboratorio(e.target.value)}
                    placeholder="Ej: Metrología Avanzada" 
                    className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                  />
               </div>
           </div>

           {/* TRAZABILIDAD Y PATRÓN (OPCIONAL) */}
           <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20 space-y-3">
             <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Trazabilidad Metrológica (Opcional)</p>
             <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Patrón de Referencia</label>
                 <input 
                   value={patronReferencia} 
                   onChange={e => setPatronReferencia(e.target.value)}
                   placeholder="Ej: Bloques patrón grado 0" 
                   className="w-full p-2 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                 />
               </div>
               <div>
                 <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Tipo de Laboratorio</label>
                 <div className="flex gap-2">
                   {['Acreditado', 'Trazable'].map((t) => (
                     <button
                       key={t}
                       type="button"
                       onClick={() => setLaboratorioTipo(t)}
                       className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                         laboratorioTipo === t
                           ? 'bg-[var(--primary)] border-transparent text-[#1A202C] shadow-sm'
                           : 'bg-[var(--background)] border-[var(--outline-color)]/30 text-[var(--text-muted)] hover:text-[var(--text-main)]'
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
           <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20 space-y-3">
             <div className="flex justify-between items-center">
               <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Confirmación Metrológica ISO 10012</p>
               {compliance !== 'No Evaluado' && (
                 <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                   compliance === 'Conforme' 
                     ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                     : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                 }`}>
                   {compliance === 'Conforme' ? 'Cumple (Conforme)' : 'Desviación (No Conforme)'}
                 </span>
               )}
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Error Máx. Encontrado</label>
                 <input 
                   type="number"
                   step="any"
                   value={errorEncontrado} 
                   onChange={e => setErrorEncontrado(e.target.value)}
                   placeholder="Ej: 0.002" 
                   className="w-full p-2 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                 />
               </div>
               <div>
                 <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Incertidumbre (U)</label>
                 <input 
                   type="number"
                   step="any"
                   value={incertidumbre} 
                   onChange={e => setIncertidumbre(e.target.value)}
                   placeholder="Ej: 0.0005" 
                   className="w-full p-2 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Criterio de Aceptación</label>
                 <div className="flex gap-2">
                   {[
                     { id: 'emp', label: 'EMP' },
                     { id: 'tolerancia', label: 'Tolerancia ±' }
                   ].map((c) => (
                     <button
                       key={c.id}
                       type="button"
                       onClick={() => setCriterioTipo(c.id)}
                       className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                         criterioTipo === c.id
                           ? 'bg-[var(--text-main)] text-[var(--surface)] border-transparent shadow-sm'
                           : 'bg-[var(--background)] border-[var(--outline-color)]/30 text-[var(--text-muted)] hover:text-[var(--text-main)]'
                       }`}
                     >
                       {c.label}
                     </button>
                   ))}
                 </div>
               </div>
               <div>
                 <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Valor del Límite</label>
                 <input 
                   type="number"
                   step="any"
                   value={criterioValor} 
                   onChange={e => setCriterioValor(e.target.value)}
                   placeholder="Ej: 0.005" 
                   className="w-full p-2 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                 />
               </div>
             </div>
           </div>

           {/* DROPZONE PARA CERTIFICADO */}
           <div className="border-2 border-dashed border-[var(--outline-color)]/30 rounded-xl p-5 text-center hover:border-[var(--primary)]/50 transition-all cursor-pointer bg-[var(--surface-alt)]/40 group">
              <input type="file" className="hidden" id="cert-upload" onChange={e => setFile(e.target.files[0])} />
              <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center">
                 <FileUp size={28} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] mb-2 transition-colors" />
                 {file ? (
                   <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">{file.name}</p>
                 ) : (
                   <>
                    <p className="text-xs font-bold text-[var(--text-main)]">Cargar Soporte Documental</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">Formatos PDF, JPG (Máx. 10MB)</p>
                   </>
                 )}
              </label>
           </div>

           <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 btn-precision-secondary py-2 text-xs font-bold uppercase tracking-wider" disabled={isUploading}>Cancelar</button>
              <button 
                onClick={handleFinish}
                disabled={!file || !laboratorio || isUploading}
                className="flex-2 btn-precision-primary py-2 px-6 text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isUploading ? (
                  <><RefreshCw size={15} className="animate-spin" /> SUBIENDO...</>
                ) : (
                  'FINALIZAR ACTIVIDAD'
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
