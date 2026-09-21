import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileUp, 
  ShieldCheck, 
  Cpu, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  ArrowRight,
  FileText,
  Microscope,
  Database,
  Lock,
  X,
  Play,
  Activity,
  Layers,
  Wrench,
  ChevronDown,
  Sparkles,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { analyzeMetrologyCertificateWithGemini } from '../../services/geminiMetrologyService';

// --- SUB-COMPONENTE: COMPARADOR ISO & DICTAMEN TÉCNICO DE LA IA ---
const ISOComparator = ({ 
  error, 
  uncertainty, 
  tolerance, 
  unit, 
  veredicto, 
  riesgo, 
  dictamen_parrafo, 
  norma_referencia, 
  aptitud_de_uso, 
  puntos 
}) => {
  const isAprobado = veredicto === 'Conforme' || veredicto === 'Aprobado';
  const isDuda = veredicto === 'Zona de Duda' || veredicto?.toLowerCase().includes('duda');
  const numError = parseFloat(error) || 0;
  const numUncertainty = parseFloat(uncertainty) || 0;
  const numTol = parseFloat(tolerance) || 0;
  const totalDeviation = (numError + numUncertainty).toFixed(4);

  return (
    <div className="bg-[var(--surface)] border border-[var(--outline-color)]/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header con Veredicto Metrológico y Norma */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-[var(--outline-color)]/20">
        <div>
          <h3 className="text-xs font-mono font-bold text-[var(--text-main)] uppercase tracking-wider">
            Evaluación de Conformidad (ISO/IEC 17025 & JCGM 106)
          </h3>
          {norma_referencia && (
            <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
              Norma de Referencia: <span className="font-semibold text-[var(--text-main)]">{norma_referencia}</span>
            </p>
          )}
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-center self-start sm:self-auto shadow-sm ${
          isAprobado 
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
            : isDuda
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
        }`}>
          {isAprobado ? '✅ APROBADO (CONFORME)' : isDuda ? '⚠️ ZONA DE DUDA (GUARD BAND)' : '❌ REPROBADO (NO CONFORME)'}
        </span>
      </div>
      
      {/* 3 Métricas Clave */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
        <div className="p-3 rounded-xl bg-[var(--surface-alt)]/60 border border-[var(--outline-color)]/10 space-y-1">
          <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-70">Error Máx. Encontrado</p>
          <p className="text-base sm:text-lg font-black text-[var(--text-main)] font-mono">{error} {unit}</p>
        </div>
        
        <div className="p-3 rounded-xl bg-[var(--surface-alt)]/60 border border-[var(--outline-color)]/10 space-y-1">
          <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-70">Incertidumbre Máx. (U)</p>
          <p className="text-base sm:text-lg font-black text-[var(--text-muted)] font-mono">± {uncertainty} {unit}</p>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-alt)]/60 border border-[var(--outline-color)]/10 space-y-1">
          <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-70">Tolerancia Límite (EMP)</p>
          <p className="text-base sm:text-lg font-black text-[var(--text-main)] font-mono">± {tolerance} {unit}</p>
        </div>
      </div>

      {/* DICTAMEN TÉCNICO OFICIAL DE LA IA (Párrafo explicativo solicitado por el usuario) */}
      <div className={`p-4 sm:p-5 rounded-xl border text-left space-y-2.5 transition-all shadow-sm ${
        isAprobado 
          ? 'bg-emerald-500/[0.04] border-emerald-500/25' 
          : isDuda
          ? 'bg-amber-500/[0.04] border-amber-500/25'
          : 'bg-red-500/[0.04] border-red-500/25'
      }`}>
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#f7931b]" size={15} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-main)]">
              Dictamen Metrológico Formal (Análisis IA)
            </span>
          </div>
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--text-muted)] font-bold">
            Motor Gemini 3.6
          </span>
        </div>

        <p className="text-xs sm:text-[13px] text-[var(--text-main)] leading-relaxed font-sans">
          {dictamen_parrafo || riesgo}
        </p>

        {aptitud_de_uso && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono border-t border-black/5 dark:border-white/10">
            <span className="text-[var(--text-muted)] uppercase text-[10px] font-bold">Aptitud Operativa en Planta:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              isAprobado 
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                : isDuda 
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' 
                : 'bg-red-500/20 text-red-700 dark:text-red-300'
            }`}>
              {aptitud_de_uso}
            </span>
          </div>
        )}
      </div>

      {/* TABLA DE PUNTOS DE CALIBRACIÓN */}
      {puntos && puntos.length > 0 && (
        <div className="border border-[var(--outline-color)]/30 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-alt)] text-[8px] font-black text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--outline-color)]/25">
              <tr>
                <th className="p-3">Valor Nominal</th>
                <th className="p-3">Valor Patrón</th>
                <th className="p-3">Instrumento</th>
                <th className="p-3 text-right">Error Absoluto</th>
                <th className="p-3 text-right">Incertidumbre (U)</th>
                <th className="p-3 text-center">Conformidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-color)]/20 font-medium text-[var(--text-main)]">
              {puntos.map((p, i) => {
                const errVal = Math.abs(parseFloat(p.error) || 0);
                const uncVal = parseFloat(p.incertidumbre) || 0;
                const tolVal = numTol || 0.001;
                const isPointCompliant = (errVal + uncVal) <= tolVal;
                
                return (
                  <tr key={i} className={`hover:bg-[var(--surface-alt)]/50 ${!isPointCompliant ? 'bg-red-500/5' : ''}`}>
                    <td className="p-3 font-mono">{p.nominal} {unit}</td>
                    <td className="p-3 font-mono">{p.patron} {unit}</td>
                    <td className="p-3 font-mono">{p.instrumento} {unit}</td>
                    <td className={`p-3 text-right font-mono font-bold ${errVal > tolVal ? 'text-red-500' : ''}`}>
                      {p.error} {unit}
                    </td>
                    <td className="p-3 text-right font-mono text-[var(--text-muted)]">± {p.incertidumbre} {unit}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        isPointCompliant 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/10 shadow-sm'
                      }`}>
                        {isPointCompliant ? 'OK' : 'FUERA'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Análisis Matemático Guard Band */}
      <div className="bg-[var(--surface-alt)] p-4 rounded-xl border border-[var(--outline-color)]/20 space-y-2 text-left">
        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60">Análisis Matemático de Incertidumbre Combinada (JCGM 106:2012)</p>
        <p className="text-xs font-semibold text-[var(--text-main)] leading-relaxed">
          {error} (Error) + {uncertainty} (Incertidumbre) = <span className="font-bold">{totalDeviation} {unit}</span> de Desviación Acumulada.
          <br />
          Criterio con Banda de Guarda: <span className="font-bold">{totalDeviation} {unit} {isAprobado ? '≤' : '>'} {tolerance} {unit}</span>
        </p>
      </div>
    </div>
  );
};

export default function IAVerificationLab() {
  const { tenant, user, isDemoMode } = useAuthStore();
  const isDemo = isDemoMode || user?.id === 'sandbox-dev-001';
  const { instruments, addInstrument, updateInstrument, addActivity, loadInstruments } = useInventoryStore();
  const [status, setStatus] = useState('idle'); // idle, scanning, verified
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  
  // Estados para Modo Demo & Paywall Esmerilado
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ nombre: '', empresa: '', email: '', whatsapp: '' });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmittedSuccess, setLeadSubmittedSuccess] = useState(false);

  React.useEffect(() => {
    if (localStorage.getItem('mjm_demo_unlocked') === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  React.useEffect(() => {
    if (tenant?.id) {
      const unsub = loadInstruments(tenant.id);
      return () => {
        if (unsub) unsub();
      };
    }
  }, [tenant?.id, loadInstruments]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Por favor selecciona un archivo PDF de certificado metrológico válido.');
      return;
    }

    setSelectedFile(file);
    setPdfUrl(URL.createObjectURL(file));
    setStatus('scanning');
    setAnalysisError(null);
    
    try {
      // Llamada al motor real de IA de Google Gemini 3.6 Flash
      const realData = await analyzeMetrologyCertificateWithGemini(file);
      setParsedData(realData);
      setStatus('verified');
    } catch (err) {
      console.error("Error analizando certificado con Gemini:", err);
      setAnalysisError(err.message || "Error procesando el certificado con el motor de IA.");
      setStatus('error');
    }
  };

  const handleReset = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setStatus('idle');
    setSelectedFile(null);
    setPdfUrl(null);
    setParsedData(null);
    setAnalysisError(null);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      
      await addDoc(collection(db, 'leads_demo'), {
        nombre: leadForm.nombre,
        empresa: leadForm.empresa,
        email: leadForm.email,
        whatsapp: leadForm.whatsapp,
        instrumento: parsedData?.instrumento || 'Instrumento de Muestra',
        certificadoNombre: selectedFile?.name || 'Certificado Demo',
        veredicto: parsedData?.veredicto || 'Conforme',
        fecha: new Date().toISOString(),
        timestamp: serverTimestamp()
      });

      setIsUnlocked(true);
      setLeadSubmittedSuccess(true);
      setIsLeadModalOpen(false);
      localStorage.setItem('mjm_demo_unlocked', 'true');
    } catch (err) {
      console.warn("Aviso al registrar lead en Firestore:", err);
      setIsUnlocked(true);
      setLeadSubmittedSuccess(true);
      setIsLeadModalOpen(false);
      localStorage.setItem('mjm_demo_unlocked', 'true');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleSaveResults = async () => {
    if (isDemo && !isUnlocked) {
      setIsLeadModalOpen(true);
      return;
    }
    if (isDemo && isUnlocked) {
      alert(`Simulación exitosa: Parámetros del certificado vinculados virtualmente a la hoja de vida de ${parsedData.instrumento}.`);
      return;
    }
    if (!parsedData || !tenant) return;
    setIsSaving(true);
    
    try {
      let certificateUrl = '';
      if (selectedFile) {
        try {
          const fileRef = ref(storage, `tenants/${tenant.id}/certificates/${parsedData.serie}/${selectedFile.name}`);
          const uploadResult = await uploadBytes(fileRef, selectedFile);
          certificateUrl = await getDownloadURL(uploadResult.ref);
        } catch (storageErr) {
          console.error("Error uploading certificate PDF:", storageErr);
        }
      }

      const newCalibrationLog = {
        fecha: parsedData.calibrationDate || new Date().toISOString().split('T')[0],
        tipo: 'Calibración',
        laboratorio: parsedData.laboratorio || 'MJM IA Lab',
        error: parsedData.error_maximo || null,
        incertidumbre: parsedData.incertidumbre || null,
        certificado_url: certificateUrl || null,
        declaracion_conformidad: parsedData.veredicto || 'Conforme'
      };

      const existing = instruments.find(i => i.serie === parsedData.serie || i.codigoMJM === parsedData.serie);
      let instrumentId = existing?.id;
      let finalCode = existing?.codigoMJM || existing?.codigo || '';
      
      if (!existing) {
        let nextNum = 1;
        if (instruments.length > 0) {
          const numbers = instruments
            .map(i => {
              const match = (i.codigoMJM || i.codigo || '').match(/\d+/);
              return match ? parseInt(match[0]) : 0;
            })
            .filter(num => num > 0);
          if (numbers.length > 0) {
            nextNum = Math.max(...numbers) + 1;
          }
        }
        finalCode = `MJM-${nextNum.toString().padStart(3, '0')}`;
        
        const newInstData = {
          nombre: parsedData.instrumento,
          marca: parsedData.marca,
          modelo: parsedData.modelo,
          serie: parsedData.serie,
          codigo: finalCode,
          codigoMJM: finalCode,
          ubicacion: 'Área de Calidad (Auto-registro)',
          magnitud: parsedData.unidad === '°C' ? 'Temperatura' : parsedData.unidad === 'bar' ? 'Presión' : 'Longitud',
          resolucion: parsedData.unidad === '°C' ? '0.1 °C' : '0.001 mm',
          capacidadMaxima: parsedData.unidad === '°C' ? '100 °C' : '10 mm',
          tolerancia_proceso: parsedData.criterio_valor,
          intervalo_confirmacion: 12,
          riesgo_operativo: 'Alto',
          estado: parsedData.veredicto === 'Conforme' ? 'Activo' : 'Vencido',
          archivado: false,
          certificadoUrl: certificateUrl,
          historial: [newCalibrationLog],
          rutinas: {
            calibracion: true,
            calibracion_frecuencia: 12,
            calibracion_fecha_inicial: new Date().toISOString().split('T')[0],
            calibracion_anos: 5
          }
        };
        
        instrumentId = await addInstrument(tenant.id, newInstData);
        alert(`Instrumento registrado exitosamente en el Inventario Maestro (${finalCode}) con sus parámetros de calibración vinculados.`);
      } else {
        const currentHistorial = existing.historial || [];
        await updateInstrument(tenant.id, instrumentId, {
          tolerancia_proceso: parsedData.criterio_valor,
          estado: parsedData.veredicto === 'Conforme' ? 'Activo' : 'Vencido',
          certificadoUrl: certificateUrl,
          historial: [newCalibrationLog, ...currentHistorial]
        });
        alert(`Confirmación metrológica completada: Parámetros y certificado vinculados a la hoja de vida de ${finalCode}.`);
      }
      
      if (parsedData.veredicto === 'No Conforme') {
        const nextWeekDate = new Date();
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        const dateStr = nextWeekDate.toISOString().split('T')[0];
        
        await addActivity({
          tenantId: tenant.id,
          instrumentId: instrumentId,
          instrumentNombre: parsedData.instrumento,
          codigoMJM: finalCode,
          tipo: 'Mantenimiento',
          estado: 'todo',
          fechaProgramada: dateStr,
          priority: 'high',
          notas: `ACCIÓN CORRECTIVA ISO 10012: Calibración No Conforme. Error (${parsedData.error_maximo}) + Incertidumbre (${parsedData.incertidumbre}) supera tolerancia admisible de ±${parsedData.criterio_valor} ${parsedData.unidad}.`
        });
        alert(`Desviación Metrológica: Se ha programado automáticamente una orden de mantenimiento correctivo con plazo al ${dateStr}.`);
      }
      
      handleReset();
    } catch (err) {
      console.error(err);
      alert('Error al guardar los resultados.');
    } finally {
      setIsSaving(false);
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-3.5 sm:pt-5">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-1.5">
             <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono font-medium uppercase tracking-wider border border-slate-200 dark:border-zinc-700">
               Aseguramiento Metrológico Digital
             </span>
           </div>
           <h1 className="font-space font-bold text-slate-900 dark:text-white text-2xl md:text-3xl tracking-tight">
             Confirmación Metrológica <span className="text-mjm-navy dark:text-[#f7931b]">Automatizada</span>
           </h1>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-normal leading-relaxed">
             Extracción técnica de parámetros (Error Máximo, Incertidumbre U, Tolerancia de Proceso) y evaluación estricta de conformidad bajo ISO 10012.
           </p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm">
              <Cpu size={15} className="text-[#f7931b]" />
              <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200">Algoritmo ISO 10012 · Cl. 7.1</span>
           </div>
        </div>
      </header>
 
      {/* CUERPO DEL LAB */}
      <div className="grid grid-cols-12 gap-6 min-h-[560px]">
        
        {/* PANEL IZQUIERDO */}
        <section className={`col-span-12 ${status !== 'idle' ? 'lg:col-span-6' : 'lg:col-span-8'} flex flex-col gap-6 transition-all duration-500`}>
          {status === 'idle' ? (
            <div 
              onDragOver={onDragOver}
              onDrop={handleFileUpload}
              className="relative flex-1 bg-white dark:bg-zinc-900 border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-mjm-navy dark:hover:border-[#f7931b] transition-all duration-300 rounded-xl flex flex-col items-center justify-center overflow-hidden min-h-[460px] shadow-sm"
            >
              <input type="file" id="pdf-input" className="hidden" accept=".pdf" onChange={handleFileUpload} />
              <div className="relative z-20 text-center px-8 py-10 w-full flex flex-col items-center justify-center">
                <label htmlFor="pdf-input" className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-5 border border-slate-200 dark:border-zinc-700 group cursor-pointer hover:border-mjm-navy dark:hover:border-[#f7931b] transition-all shadow-sm">
                  <FileUp size={28} className="text-mjm-navy dark:text-[#f7931b] group-hover:scale-110 transition-transform" />
                </label>
                <h2 className="font-space font-bold text-slate-900 dark:text-white text-xl tracking-tight mb-2">Cargar Certificado de Calibración</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 max-w-sm mx-auto leading-relaxed">Arrastre el certificado emitido por el laboratorio (PDF) para ejecutar el cómputo de errores y dictamen de conformidad.</p>
                <label htmlFor="pdf-input" className="px-5 py-2.5 bg-mjm-navy hover:bg-[#1a3857] text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer">
                  Seleccionar Certificado PDF
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col shadow-sm h-full min-h-[550px] relative">
              <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-3">
                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText size={15} className="text-[#f7931b]" /> {selectedFile?.name}
                </span>
                <div className="flex items-center gap-2">
                  {pdfUrl && status === 'verified' && (
                    <button 
                      onClick={() => setIsPdfModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f7931b] hover:bg-[#e58212] text-white text-[11px] font-semibold rounded-md shadow-sm transition-all cursor-pointer"
                    >
                      <FileText size={13} /> Pantalla Completa
                    </button>
                  )}
                  {(status === 'verified' || status === 'error') && (
                    <button onClick={handleReset} className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md text-slate-400 hover:text-red-500 transition-all cursor-pointer" title="Reiniciar">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {status === 'scanning' ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-5">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="p-5 bg-slate-100 dark:bg-zinc-800 rounded-xl text-[#f7931b] shadow-sm">
                    <Microscope size={36} />
                  </motion.div>
                  <h3 className="text-sm font-space font-semibold text-slate-800 dark:text-slate-200 tracking-tight uppercase">Procesando Parámetros Metrológicos...</h3>
                  <div className="h-1.5 w-48 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3 }}
                      className="h-full bg-[#f7931b]" 
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 w-full h-[500px] overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <iframe 
                    src={pdfUrl} 
                    className="w-full h-full border-none" 
                    title="PDF Visor"
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* PANEL DERECHO */}
        <aside className={`col-span-12 ${status !== 'idle' ? 'lg:col-span-6' : 'lg:col-span-4'} flex flex-col gap-6 transition-all duration-500`}>
           
           {status === 'idle' ? (
             <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-slate-200 dark:border-zinc-800 h-full flex flex-col justify-between shadow-sm min-h-[460px]">
                 <div className="flex items-center gap-3 mb-5 border-b border-slate-100 dark:border-zinc-800 pb-4">
                     <div className="w-10 h-10 bg-mjm-navy text-white rounded-lg flex items-center justify-center shadow-sm">
                        <Cpu size={20} className="text-white" />
                     </div>
                    <div>
                       <h3 className="font-space font-bold text-slate-900 dark:text-white text-sm">Parámetros del Certificado</h3>
                       <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lectura Trazable de Certificado</p>
                    </div>
                 </div>

                 <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-40 gap-2 text-slate-400">
                    <FileText size={40} />
                    <p className="text-xs font-medium">Ningún certificado cargado aún</p>
                 </div>
                 
                 <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-800 rounded-lg text-slate-500 dark:text-slate-400">
                    <p className="text-[11px] leading-relaxed font-normal">
                       Los resultados estructurados de calibración (Error Máximo, Incertidumbre y veredicto ISO 10012) se visualizarán aquí una vez procesado el documento.
                    </p>
                 </div>
             </div>
           ) : status === 'error' ? (
             <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-red-200 dark:border-red-900/50 shadow-sm space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 pb-3.5 border-b border-red-100 dark:border-red-900/30">
                   <div className="w-10 h-10 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center shadow-sm">
                      <AlertCircle size={20} />
                   </div>
                   <div>
                      <h3 className="font-space font-bold text-red-700 dark:text-red-400 text-sm">Error en Confirmación Metrológica IA</h3>
                      <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Diagnóstico de Procesamiento</p>
                   </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 rounded-lg text-xs text-red-700 dark:text-red-300 leading-relaxed font-mono">
                   {analysisError || "No se pudo interpretar el archivo PDF o no contiene datos metrológicos legibles."}
                </div>
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-space"
                >
                  <RotateCcw size={14} />
                  <span>Reintentar con otro Certificado</span>
                </button>
             </div>
           ) : (
             <div className="space-y-5">
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
                     <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-mjm-navy text-white rounded-md shadow-sm flex items-center justify-center">
                           <Cpu size={16} className="text-white" />
                        </div>
                        <h3 className="font-space font-bold text-slate-900 dark:text-white text-sm">Parámetros del Certificado</h3>
                     </div>
                    {status === 'verified' && (
                      <button 
                        onClick={handleSaveResults} 
                        disabled={isSaving}
                        className="px-3.5 py-1.5 bg-mjm-navy hover:bg-[#1a3857] text-white text-[10px] font-semibold uppercase tracking-wider rounded-md shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isSaving ? 'Guardando...' : isDemo && !isUnlocked ? (
                          <>
                            <Sparkles size={12} className="text-[#f7931b]" />
                            <span>Desbloquear Análisis</span>
                          </>
                        ) : 'Confirmar e Integrar'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-xs font-medium">
                     {[
                       { label: 'Modelo / Referencia', val: parsedData?.modelo || 'N/A' },
                       { label: 'Laboratorio Emisor', val: parsedData?.laboratorio || 'N/A' },
                       { label: 'Acreditación Lab', val: parsedData?.laboratorio_tipo || 'N/A' },
                       { label: 'Instrumento', val: parsedData?.instrumento || 'N/A' },
                       { label: 'Serie / Serial', val: parsedData?.serie || 'N/A' },
                       { label: 'Patrón Utilizado', val: parsedData?.patron || 'N/A' },
                     ].map((insight, i) => (
                       <div key={i} className="min-w-0 border-b border-slate-100 dark:border-zinc-800/80 pb-2">
                          <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{insight.label}</p>
                          <p className={`text-xs font-semibold truncate ${status === 'verified' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-zinc-600'}`}>{insight.val}</p>
                       </div>
                     ))}
                  </div>
                </div>

                {status === 'verified' && parsedData && (
                  <div className="relative animate-in fade-in duration-500">
                      {/* MODO DEMO: ESMERILADO DE PROTECCIÓN TÁCTICA */}
                      {isDemo && !isUnlocked ? (
                        <div className="relative rounded-2xl overflow-hidden border border-[#f7931b]/30">
                           {/* Contenido con filtro de desenfoque sutil: texto y números perceptibles pero protegidos */}
                           <div className="filter blur-[3px] opacity-90 select-none pointer-events-none transition-all duration-700">
                              <ISOComparator 
                                error={parsedData.error_maximo} 
                                uncertainty={parsedData.incertidumbre} 
                                tolerance={parsedData.criterio_valor} 
                                unit={parsedData.unidad}
                                veredicto={parsedData.veredicto}
                                riesgo={parsedData.riesgo}
                                dictamen_parrafo={parsedData.dictamen_parrafo}
                                norma_referencia={parsedData.norma_referencia}
                                aptitud_de_uso={parsedData.aptitud_de_uso}
                                puntos={parsedData.puntos}
                              />
                           </div>

                           {/* Capa de Cristal Esmerilado (Velo translúcido con tarjeta flotante central) */}
                           <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-950/15 dark:bg-black/35 backdrop-blur-[1px]">
                              <div className="p-6 text-center bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-700/80 rounded-2xl shadow-2xl shadow-slate-950/25 max-w-sm w-full backdrop-blur-xl animate-in zoom-in-95 duration-200">
                                 <div className="w-11 h-11 rounded-xl bg-mjm-navy dark:bg-zinc-800 text-[#f7931b] flex items-center justify-center shadow-md border border-[#f7931b]/30 mx-auto mb-3">
                                    <Lock size={20} className="text-[#f7931b]" />
                                 </div>

                                 <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f7931b]/15 text-[#f7931b] border border-[#f7931b]/30 text-[9px] font-mono font-bold uppercase tracking-wider mb-2">
                                    <span>⚡ Cómputo ISO 10012 Procesado</span>
                                 </div>

                                 <h4 className="font-space font-bold text-slate-900 dark:text-white text-sm leading-tight mb-2">
                                    Matriz de Tolerancias y Dictamen Calculado
                                 </h4>

                                 <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-4 leading-relaxed font-normal">
                                    Los errores absolutos, la incertidumbre expandida (U) y la evaluación de aptitud han sido procesados. Ingrese sus datos para desbloquear el informe completo.
                                 </p>

                                 <button
                                   onClick={() => setIsLeadModalOpen(true)}
                                   className="w-full py-3 px-5 bg-[#f7931b] hover:bg-orange-500 active:scale-95 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer font-space"
                                 >
                                   <Sparkles size={14} />
                                   <span>DESBLOQUEAR ANÁLISIS COMPLETO</span>
                                 </button>
                              </div>
                           </div>
                        </div>
                     ) : (
                       <div>
                          {leadSubmittedSuccess && (
                            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                               <CheckCircle size={16} /> ¡Análisis Desbloqueado! Ahora puede examinar la matriz metrológica y tolerancias.
                            </div>
                          )}
                          <ISOComparator 
                            error={parsedData.error_maximo} 
                            uncertainty={parsedData.incertidumbre} 
                            tolerance={parsedData.criterio_valor} 
                            unit={parsedData.unidad}
                            veredicto={parsedData.veredicto}
                            riesgo={parsedData.riesgo}
                            dictamen_parrafo={parsedData.dictamen_parrafo}
                            norma_referencia={parsedData.norma_referencia}
                            aptitud_de_uso={parsedData.aptitud_de_uso}
                            puntos={parsedData.puntos}
                          />
                       </div>
                     )}
                  </div>
                )}
             </div>
           )}

        </aside>
      </div>

      {/* PDF Fullscreen Modal */}
      {isPdfModalOpen && pdfUrl && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-[#f7931b]" size={18} />
                <h3 className="font-space font-bold text-slate-900 dark:text-white text-xs tracking-wider uppercase">
                  Visor del Certificado de Calibración
                </h3>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-100 dark:bg-zinc-950 p-2 relative">
              <iframe 
                src={pdfUrl} 
                className="w-full h-full rounded-lg border border-slate-200 dark:border-zinc-800 shadow-inner"
                title="Visor de PDF Expandido"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CAPTURA DE LEADS CORPORATIVOS */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Header del Modal */}
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-mjm-navy text-[#f7931b] flex items-center justify-center shadow-md border border-white/10">
                       <Sparkles size={20} />
                    </div>
                    <div>
                       <h3 className="font-space font-bold text-slate-900 dark:text-white text-base">Desbloquear Análisis Metrológico</h3>
                       <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Acceso Instantáneo · Sin Costo de Licencia</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsLeadModalOpen(false)}
                   className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                 >
                    <X size={18} />
                 </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleLeadSubmit} className="p-6 space-y-4">
                 <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-normal">
                    Ingrese los datos de su planta o empresa para retirar el esmerilado de protección y visualizar la matriz de errores, incertidumbre expandida (U) y dictamen ISO 10012.
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo *</label>
                       <input 
                         type="text" 
                         required
                         placeholder="Ing. Carlos Rodríguez"
                         value={leadForm.nombre}
                         onChange={e => setLeadForm({ ...leadForm, nombre: e.target.value })}
                         className="w-full h-10 px-3.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-mjm-navy dark:focus:border-[#f7931b] text-slate-900 dark:text-white transition-colors"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Empresa / Planta Industrial *</label>
                       <input 
                         type="text" 
                         required
                         placeholder="Ej: Lácteos del Norte S.A."
                         value={leadForm.empresa}
                         onChange={e => setLeadForm({ ...leadForm, empresa: e.target.value })}
                         className="w-full h-10 px-3.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-mjm-navy dark:focus:border-[#f7931b] text-slate-900 dark:text-white transition-colors"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Correo Corporativo *</label>
                       <input 
                         type="email" 
                         required
                         placeholder="calidad@empresa.com"
                         value={leadForm.email}
                         onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                         className="w-full h-10 px-3.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-mjm-navy dark:focus:border-[#f7931b] text-slate-900 dark:text-white transition-colors"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp / Celular *</label>
                       <input 
                         type="tel" 
                         required
                         placeholder="+57 300 123 4567"
                         value={leadForm.whatsapp}
                         onChange={e => setLeadForm({ ...leadForm, whatsapp: e.target.value })}
                         className="w-full h-10 px-3.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-mjm-navy dark:focus:border-[#f7931b] text-slate-900 dark:text-white transition-colors"
                       />
                    </div>
                 </div>

                 <div className="pt-3 flex items-center justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsLeadModalOpen(false)}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                       Cerrar
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmittingLead}
                      className="px-5 py-2.5 rounded-lg bg-[#f7931b] hover:bg-orange-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 font-space"
                    >
                       {isSubmittingLead ? (
                         <>
                           <Loader2 className="animate-spin" size={14} />
                           <span>Verificando...</span>
                         </>
                       ) : (
                         <>
                           <Sparkles size={14} />
                           <span>Desbloquear Matriz Completa</span>
                         </>
                       )}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
