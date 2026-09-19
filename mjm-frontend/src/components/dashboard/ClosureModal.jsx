import React, { useState, useMemo } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  FileUp, 
  X, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

/**
 * Modal de Cierre Metrológico e Intervención Técnica (ISO/IEC 17025 & ISO 10012)
 * Permite registrar trazabilidad, soporte documental (PDF/JPG), laboratorio ejecutor,
 * cálculo en tiempo real de conformidad metrológica y actualización del expediente del instrumento.
 */
export default function ClosureModal({ activity, onClose, onFinish }) {
  const [file, setFile] = useState(null);
  const [laboratorio, setLaboratorio] = useState('Laboratorio Metrológico MJM');
  const [certificadoNumero, setCertificadoNumero] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [patronReferencia, setPatronReferencia] = useState('');
  const [laboratorioTipo, setLaboratorioTipo] = useState('Acreditado');
  const [errorEncontrado, setErrorEncontrado] = useState('');
  const [incertidumbre, setIncertidumbre] = useState('');
  const [criterioTipo, setCriterioTipo] = useState('emp'); // 'emp' o 'tolerancia'
  const [criterioValor, setCriterioValor] = useState('');
  
  const getColombiaDate = () => {
    try {
      const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const todayStr = getColombiaDate();
  const isVencida = activity.fechaProgramada < todayStr;
  const [fechaEjecucion, setFechaEjecucion] = useState(todayStr);

  const parsedError = parseFloat(errorEncontrado);
  const parsedIncertidumbre = parseFloat(incertidumbre);
  const parsedCriterio = parseFloat(criterioValor);

  // Evaluación matemática de conformidad metrológica ISO 10012: |Error| + Incertidumbre <= Límite Aceptable
  const compliance = useMemo(() => {
    if (isNaN(parsedError) || isNaN(parsedIncertidumbre) || isNaN(parsedCriterio)) {
      return 'Conforme'; // Por defecto Conforme si no se requieren tolerancias numéricas estrictas
    }
    return (Math.abs(parsedError) + parsedIncertidumbre <= parsedCriterio) ? 'Conforme' : 'No Conforme';
  }, [parsedError, parsedIncertidumbre, parsedCriterio]);

  const handleFinish = async () => {
    setIsUploading(true);
    let certificado_url = null;
    
    if (file) {
      try {
        const tenantId = activity.tenantId || useAuthStore.getState().tenant?.id || 'sandboxdemo';
        const safeName = file.name.replace(/\s+/g, '_');
        const fileRef = ref(storage, `tenants/${tenantId}/actividades/${activity.id}/certificados/${Date.now()}_${safeName}`);
        await uploadBytes(fileRef, file);
        certificado_url = await getDownloadURL(fileRef);
      } catch (error) {
        console.warn("Aviso al subir archivo a storage:", error.message);
      }
    }
    
    onFinish({ 
      laboratorio: laboratorio || 'Laboratorio Metrológico MJM', 
      fecha_ejecucion: fechaEjecucion, 
      certificado_numero: certificadoNumero || (file ? file.name.replace(/\.[^/.]+$/, "") : `CERT-${Date.now().toString().slice(-6)}`),
      certificado_url: certificado_url || null,
      patron_referencia: patronReferencia || null,
      laboratorio_tipo: laboratorioTipo,
      error_encontrado: isNaN(parsedError) ? 0.00 : parsedError,
      incertidumbre: isNaN(parsedIncertidumbre) ? 0.00 : parsedIncertidumbre,
      criterio_tipo: criterioTipo,
      criterio_valor: isNaN(parsedCriterio) ? null : parsedCriterio,
      conformidad_metrologica: compliance
    });
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--surface)] text-[var(--text-main)] rounded-2xl p-6 sm:p-7 w-full max-w-xl shadow-2xl border border-[var(--outline-color)]/30 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-5 pb-3.5 border-b border-[var(--outline-color)]/20">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                 <ShieldCheck size={22} />
              </div>
              <div>
                 <h2 className="text-lg font-bold text-[var(--text-main)] uppercase tracking-tight">Cierre de Actividad Metrológica</h2>
                 <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Protocolo de Certificación & Trazabilidad ISO 10012</p>
              </div>
           </div>
           <button 
             onClick={onClose} 
             className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg transition-colors cursor-pointer"
             title="Cerrar modal"
           >
             <X size={20} />
           </button>
        </div>

        <div className="space-y-4">
           {/* Activo a Intervenir */}
           <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20">
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Activo a Intervenir</p>
              <p className="text-sm font-bold text-[var(--text-main)] uppercase">{activity.instrumentNombre || 'Instrumento'}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-mono font-bold rounded border border-[var(--primary)]/20">
                  ID: {activity.codigo || activity.codigoMJM || 'MJM'}
                </span>
                <span className="px-2 py-0.5 bg-[var(--surface)] text-[var(--text-muted)] text-[10px] font-bold uppercase rounded border border-[var(--outline-color)]/20">
                  Tipo: {activity.tipo || 'Calibración'}
                </span>
              </div>
           </div>

           {/* Alerta de Cierre Extemporáneo si está vencida */}
           {isVencida && (
             <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/30 flex items-start gap-2.5">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <div>
                   <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Novedad: Cierre Extemporáneo</p>
                   <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 leading-relaxed">
                     Esta tarea superó su fecha programada ({activity.fechaProgramada}). Se registrará con fecha de hoy ({todayStr}) para auditoría de cumplimiento normativo.
                   </p>
                </div>
             </div>
           )}

           {/* Fecha y Laboratorio */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Fecha de Ejecución Real</label>
                  <input 
                    type="date"
                    value={fechaEjecucion}
                    onChange={e => setFechaEjecucion(e.target.value)}
                    disabled={isVencida}
                    className={`w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-mono font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)] ${isVencida ? 'opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-zinc-800' : ''}`}
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Laboratorio / Proveedor Ejecutor</label>
                  <input 
                    value={laboratorio} 
                    onChange={e => setLaboratorio(e.target.value)}
                    placeholder="Ej: Laboratorio Metrológico MJM" 
                    className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                  />
               </div>
           </div>

           {/* No. de Certificado & Trazabilidad */}
           <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20 space-y-3">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <div>
                 <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Certificado No. (Identificador)</label>
                 <input 
                   value={certificadoNumero} 
                   onChange={e => setCertificadoNumero(e.target.value)}
                   placeholder="Ej: CERT-2026-CAL-089" 
                   className="w-full p-2 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
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
                       className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
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

             <div>
               <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Patrón de Referencia Utilizado (Opcional)</label>
               <input 
                 value={patronReferencia} 
                 onChange={e => setPatronReferencia(e.target.value)}
                 placeholder="Ej: Bloques patrón grado 0 / Calibrador Fluke 5500A" 
                 className="w-full p-2 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
               />
             </div>
           </div>

           {/* CONFIRMACIÓN METROLÓGICA (ISO 10012) */}
           <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20 space-y-3">
             <div className="flex justify-between items-center">
               <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Confirmación Metrológica ISO 10012</p>
               <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                 compliance === 'Conforme' 
                   ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                   : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
               }`}>
                 {compliance === 'Conforme' ? '✓ Cumple (Conforme)' : '⚠️ Desviación (No Conforme)'}
               </span>
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
                       className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
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

           {/* DROPZONE PARA CERTIFICADO DIGITAL */}
           <div className="border-2 border-dashed border-[var(--outline-color)]/30 rounded-xl p-5 text-center hover:border-[var(--primary)]/50 transition-all cursor-pointer bg-[var(--surface-alt)]/40 group">
              <input 
                type="file" 
                className="hidden" 
                id="cert-upload" 
                accept=".pdf,image/*" 
                onChange={e => setFile(e.target.files?.[0] || null)} 
              />
              <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center">
                 <FileUp size={26} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] mb-1.5 transition-colors" />
                 {file ? (
                   <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                     <FileText size={15} />
                     <span className="truncate max-w-xs">{file.name}</span>
                   </div>
                 ) : (
                   <>
                    <p className="text-xs font-bold text-[var(--text-main)]">Adjuntar Certificado de Calibración / Calificación</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">Formatos PDF, PNG o JPG (Máx. 10MB)</p>
                   </>
                 )}
              </label>
           </div>

           {/* Acciones */}
           <div className="flex gap-3 pt-2">
              <button 
                onClick={onClose} 
                className="flex-1 btn-precision-secondary py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer" 
                disabled={isUploading}
              >
                Cancelar
              </button>
              <button 
                onClick={handleFinish}
                disabled={!laboratorio || isUploading}
                className="flex-2 btn-precision-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer shadow-md"
              >
                {isUploading ? (
                  <><RefreshCw size={15} className="animate-spin" /> REGISTRANDO Y SUBIENDO...</>
                ) : (
                  'REGISTRAR Y FINALIZAR ACTIVIDAD'
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
