import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { laboratoryService, DEFAULT_LABORATORIES } from '../../services/laboratoryService';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  FileUp, 
  X, 
  FileText, 
  ShieldCheck,
  Wrench,
  Plus,
  Building2,
  Check,
  Award,
  Search,
  ChevronDown,
  AlertTriangle,
  Calendar,
  Hash,
  Paperclip,
  Trash2,
  CheckCircle2
} from 'lucide-react';

/**
 * Modal Dinámico de Cierre Metrológico e Intervención Técnica (ISO/IEC 17025 & ISO 10012)
 * Se adapta automáticamente según el tipo de actividad:
 *  - MANTENIMIENTO: Reporte técnico, OT, trabajos realizados y estado operativo (sin campos metrológicos innecesarios).
 *  - CALIBRACIÓN / VERIFICACIÓN: Protocolo metrológico estricto (Error, Incertidumbre U, EMP y Certificado).
 *  - CALIFICACIÓN: Protocolo IQ/OQ/PQ y dictamen de idoneidad.
 * Incluye catálogo de Laboratorios/Proveedores en BD con creación inmediata en vivo.
 */
export default function ClosureModal({ activity, onClose, onFinish }) {
  const { tenant } = useAuthStore();
  const tenantId = activity?.tenantId || tenant?.id || 'sandboxdemo';

  // Detección del tipo de intervención
  const tipoNorm = (activity?.tipo || '').toLowerCase();
  const isMantenimiento = tipoNorm.includes('mantenimiento');
  const isCalificacion = tipoNorm.includes('calificaci');
  const isMetrologica = !isMantenimiento && !isCalificacion; // Calibración o Verificación

  // Estados Comunes
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [laboratorio, setLaboratorio] = useState('Laboratorio Metrológico MJM');

  // Catálogo de Laboratorios y Creación Rápida
  const [laboratoriesList, setLaboratoriesList] = useState(DEFAULT_LABORATORIES);
  const [isCreatingLab, setIsCreatingLab] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabTipo, setNewLabTipo] = useState(isMantenimiento ? 'Taller' : 'Acreditado');
  const [isSavingLab, setIsSavingLab] = useState(false);

  // Estados para Buscador / Combobox
  const [labSearch, setLabSearch] = useState('Laboratorio Metrológico MJM');
  const [isLabDropdownOpen, setIsLabDropdownOpen] = useState(false);
  const labDropdownRef = useRef(null);

  // Cerrar popover al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (labDropdownRef.current && !labDropdownRef.current.contains(e.target)) {
        setIsLabDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar catálogo de laboratorios desde BD
  useEffect(() => {
    let isMounted = true;
    laboratoryService.getLaboratories(tenantId).then((labs) => {
      if (isMounted && labs && labs.length > 0) {
        setLaboratoriesList(labs);
      }
    });
    return () => { isMounted = false; };
  }, [tenantId]);

  // Fecha de Ejecución
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
  const [formError, setFormError] = useState('');

  // ─── CAMPOS ESPECÍFICOS PARA MANTENIMIENTO ───────────────────────
  const [reporteOT, setReporteOT] = useState('');
  const [descripcionTrabajos, setDescripcionTrabajos] = useState('');
  const [estadoOperativo, setEstadoOperativo] = useState('Operativo'); // 'Operativo' | 'En Observación' | 'No Operativo'

  // ─── CAMPOS ESPECÍFICOS PARA CALIFICACIÓN ────────────────────────
  const [protocoloNumero, setProtocoloNumero] = useState('');
  const [etapaCalificacion, setEtapaCalificacion] = useState('OQ'); // 'IQ' | 'OQ' | 'PQ'
  const [resultadoCalificacion, setResultadoCalificacion] = useState('Aprobado');

  // ─── CAMPOS ESPECÍFICOS PARA CALIBRACIÓN / VERIFICACIÓN ──────────
  const [certificadoNumero, setCertificadoNumero] = useState('');
  const [patronReferencia, setPatronReferencia] = useState('');
  const [laboratorioTipo, setLaboratorioTipo] = useState('Acreditado');
  const [errorEncontrado, setErrorEncontrado] = useState('');
  const [incertidumbre, setIncertidumbre] = useState('');
  const [criterioTipo, setCriterioTipo] = useState('emp'); // 'emp' o 'tolerancia'
  const [criterioValor, setCriterioValor] = useState('');

  const parsedError = parseFloat(errorEncontrado);
  const parsedIncertidumbre = parseFloat(incertidumbre);
  const parsedCriterio = parseFloat(criterioValor);

  // Evaluación matemática de conformidad metrológica ISO 10012: |Error| + Incertidumbre <= Límite Aceptable
  const compliance = useMemo(() => {
    if (isNaN(parsedError) || isNaN(parsedIncertidumbre) || isNaN(parsedCriterio)) {
      return 'Conforme';
    }
    return (Math.abs(parsedError) + parsedIncertidumbre <= parsedCriterio) ? 'Conforme' : 'No Conforme';
  }, [parsedError, parsedIncertidumbre, parsedCriterio]);

  // Filtrado reactivo en tiempo real por nombre, tipo o especialidad
  const filteredLabs = useMemo(() => {
    const query = (labSearch || '').trim().toLowerCase();
    if (!query) return laboratoriesList;
    return laboratoriesList.filter(l => 
      (l.nombre || '').toLowerCase().includes(query) || 
      (l.tipo && l.tipo.toLowerCase().includes(query)) ||
      (l.especialidad && l.especialidad.toLowerCase().includes(query))
    );
  }, [laboratoriesList, labSearch]);

  const exactMatchExists = useMemo(() => {
    const query = (labSearch || '').trim().toLowerCase();
    if (!query) return false;
    return laboratoriesList.some(l => (l.nombre || '').toLowerCase() === query);
  }, [laboratoriesList, labSearch]);

  const handleSelectLab = (lab) => {
    setLaboratorio(lab.nombre);
    setLabSearch(lab.nombre);
    if (lab.tipo) setLaboratorioTipo(lab.tipo);
    setIsLabDropdownOpen(false);
  };

  const handleQuickAddLab = async (nameToCreate) => {
    const cleanName = (nameToCreate || labSearch).trim();
    if (!cleanName) return;
    setIsSavingLab(true);
    try {
      const created = await laboratoryService.addLaboratory(tenantId, {
        nombre: cleanName,
        tipo: isMantenimiento ? 'Taller' : 'Acreditado'
      });
      setLaboratoriesList(prev => [created, ...prev]);
      setLaboratorio(created.nombre);
      setLabSearch(created.nombre);
      if (created.tipo) setLaboratorioTipo(created.tipo);
      setIsLabDropdownOpen(false);
      setIsCreatingLab(false);
    } catch (err) {
      console.error("Error al registrar laboratorio:", err);
    } finally {
      setIsSavingLab(false);
    }
  };

  // Manejador para crear un nuevo laboratorio en BD en caliente
  const handleCreateNewLab = async (e) => {
    e.preventDefault();
    if (!newLabName.trim()) return;
    setIsSavingLab(true);
    try {
      const created = await laboratoryService.addLaboratory(tenantId, {
        nombre: newLabName.trim(),
        tipo: newLabTipo
      });
      setLaboratoriesList(prev => [created, ...prev]);
      setLaboratorio(created.nombre);
      setLabSearch(created.nombre);
      if (created.tipo) setLaboratorioTipo(created.tipo);
      setNewLabName('');
      setIsCreatingLab(false);
    } catch (err) {
      console.error("Error al registrar laboratorio:", err);
    } finally {
      setIsSavingLab(false);
    }
  };

  // Finalizar y despachar resultado con validación preventiva e informe de errores
  const handleFinish = async () => {
    setFormError('');

    // 1. Verificación exhaustiva de campos requeridos
    const missingFields = [];
    const activeLab = (laboratorio || labSearch || '').trim();
    if (!activeLab) {
      missingFields.push('Laboratorio o Taller Técnico ejecutor');
    }
    if (!fechaEjecucion) {
      missingFields.push('Fecha de Ejecución');
    }

    if (isMantenimiento) {
      if (!descripcionTrabajos.trim()) {
        missingFields.push('Descripción de trabajos realizados o repuestos');
      }
    } else if (isCalificacion) {
      if (!protocoloNumero.trim() && !file) {
        missingFields.push('Número de Protocolo o adjuntar soporte');
      }
    } else {
      // Calibración / Verificación
      if (!certificadoNumero.trim() && !file) {
        missingFields.push('Número de Certificado o adjuntar soporte');
      }
      if (isNaN(parsedError)) {
        missingFields.push('Error Máximo Encontrado (numérico)');
      }
      if (isNaN(parsedIncertidumbre)) {
        missingFields.push('Incertidumbre de Medición U (numérica)');
      }
      if (isNaN(parsedCriterio)) {
        missingFields.push('Valor del Límite de Aceptación / EMP (numérico)');
      }
    }

    if (missingFields.length > 0) {
      setFormError(`Por favor complete los siguientes campos obligatorios para guardar: ${missingFields.join(', ')}.`);
      return;
    }

    setIsUploading(true);
    try {
      let certificado_url = null;

      if (file) {
        try {
          const safeName = file.name.replace(/\s+/g, '_');
          const fileRef = ref(storage, `tenants/${tenantId}/actividades/${activity.id}/soportes/${Date.now()}_${safeName}`);
          await uploadBytes(fileRef, file);
          certificado_url = await getDownloadURL(fileRef);
        } catch (error) {
          console.warn("Aviso al subir archivo a storage:", error.message);
        }
      }

      if (isMantenimiento) {
        // 🛠️ PAYLOAD LIMPIO DE MANTENIMIENTO TÉCNICO
        await onFinish({
          laboratorio: activeLab || 'Taller Técnico Interno de Planta',
          proveedor_ejecutor: activeLab || 'Taller Técnico Interno de Planta',
          laboratorio_ejecutor: activeLab || 'Taller Técnico Interno de Planta',
          fecha_ejecucion: fechaEjecucion,
          reporte_ot: reporteOT || (file ? file.name.replace(/\.[^/.]+$/, "") : `OT-${Date.now().toString().slice(-6)}`),
          certificado_numero: reporteOT || (file ? file.name.replace(/\.[^/.]+$/, "") : `OT-${Date.now().toString().slice(-6)}`),
          certificado: reporteOT || (file ? file.name.replace(/\.[^/.]+$/, "") : `OT-${Date.now().toString().slice(-6)}`),
          certificado_url: certificado_url || null,
          descripcion_trabajos: descripcionTrabajos,
          estado_operativo: estadoOperativo,
          declaracion_conformidad: estadoOperativo === 'No Operativo' ? 'No Conforme' : 'Conforme',
          conformidad_metrologica: estadoOperativo === 'No Operativo' ? 'No Conforme' : 'Conforme'
        });
      } else if (isCalificacion) {
        // 📋 PAYLOAD DE CALIFICACIÓN DE EQUIPO (IQ / OQ / PQ)
        await onFinish({
          laboratorio: activeLab || 'Laboratorio Metrológico MJM',
          laboratorio_ejecutor: activeLab || 'Laboratorio Metrológico MJM',
          proveedor_ejecutor: activeLab || 'Laboratorio Metrológico MJM',
          fecha_ejecucion: fechaEjecucion,
          certificado_numero: protocoloNumero || `PROT-${Date.now().toString().slice(-6)}`,
          certificado: protocoloNumero || `PROT-${Date.now().toString().slice(-6)}`,
          certificado_url: certificado_url || null,
          etapa_calificacion: etapaCalificacion,
          resultado_calificacion: resultadoCalificacion,
          declaracion_conformidad: resultadoCalificacion === 'Aprobado' ? 'Conforme' : 'No Conforme',
          conformidad_metrologica: resultadoCalificacion === 'Aprobado' ? 'Conforme' : 'No Conforme'
        });
      } else {
        // ⚖️ PAYLOAD DE PROTOCOLO METROLÓGICO RIGUROSO (CALIBRACIÓN / VERIFICACIÓN ISO 10012)
        await onFinish({
          laboratorio: activeLab || 'Laboratorio Metrológico MJM',
          laboratorio_ejecutor: activeLab || 'Laboratorio Metrológico MJM',
          proveedor_ejecutor: activeLab || 'Laboratorio Metrológico MJM',
          fecha_ejecucion: fechaEjecucion,
          certificado_numero: certificadoNumero || (file ? file.name.replace(/\.[^/.]+$/, "") : `CERT-${Date.now().toString().slice(-6)}`),
          certificado: certificadoNumero || (file ? file.name.replace(/\.[^/.]+$/, "") : `CERT-${Date.now().toString().slice(-6)}`),
          certificado_url: certificado_url || null,
          patron_referencia: patronReferencia || null,
          laboratorio_tipo: laboratorioTipo,
          error_encontrado: isNaN(parsedError) ? 0.00 : parsedError,
          incertidumbre: isNaN(parsedIncertidumbre) ? 0.00 : parsedIncertidumbre,
          incertidumbre_medicion: isNaN(parsedIncertidumbre) ? 0.00 : parsedIncertidumbre,
          criterio_tipo: criterioTipo,
          criterio_valor: isNaN(parsedCriterio) ? null : parsedCriterio,
          declaracion_conformidad: compliance,
          conformidad_metrologica: compliance
        });
      }
    } catch (err) {
      console.error("Error al registrar actividad en ClosureModal:", err);
      setFormError(`No fue posible guardar la actividad en base de datos: ${err.message || 'Error de conexión'}. Verifique la información e intente nuevamente.`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--surface)] text-[var(--text-main)] rounded-3xl w-full max-w-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-[var(--outline-color)]/50 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* ENCABEZADO ELEGANTE INDUSTRIAL */}
        <div className="flex justify-between items-center p-5 sm:p-6 pb-4 border-b border-[var(--outline-color)]/20 shrink-0 bg-[var(--surface)]">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm relative overflow-hidden ${
              isMantenimiento 
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : isCalificacion
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}>
              {isMantenimiento ? <Wrench size={22} /> : isCalificacion ? <Award size={22} /> : <ShieldCheck size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-space font-bold text-[var(--text-main)] uppercase tracking-tight">
                  {isMantenimiento 
                    ? 'Cierre de Mantenimiento' 
                    : isCalificacion 
                    ? 'Calificación de Equipo' 
                    : 'Cierre de Actividad Metrológica'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                  isMantenimiento 
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : isCalificacion
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {isMantenimiento ? 'Técnico' : isCalificacion ? 'IQ/OQ/PQ' : 'ISO 10012'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider mt-0.5">
                {isMantenimiento 
                  ? 'Registro de Servicio Operativo, Repuestos y Estado en Planta' 
                  : isCalificacion
                  ? 'Protocolo de Idoneidad y Validación de Desempeño Operativo'
                  : 'Certificado de Calibración, Incertidumbre y Evaluación de Tolerancia'}
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO CON SCROLL SUAVE */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* BANNER DEL ACTIVO INTERVENIDO */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--surface-alt)] via-[var(--surface)] to-[var(--surface-alt)] border border-[var(--outline-color)]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0 px-2.5 py-1 bg-[var(--primary)]/10 text-[var(--primary)] font-mono text-xs font-bold rounded-lg border border-[var(--primary)]/20 shadow-xs">
                {activity.codigoMJM || activity.codigo || 'MJM'}
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Activo de Planta</p>
                <h4 className="text-xs sm:text-sm font-space font-bold text-[var(--text-main)] truncate uppercase">
                  {activity.instrumentNombre || 'Instrumento Metrológico'}
                </h4>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                isMantenimiento 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
                  : isCalificacion
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' 
                  : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
              }`}>
                {isMantenimiento ? <Wrench size={11} /> : <ShieldCheck size={11} />}
                {activity.tipo || 'Calibración'}
              </span>
            </div>
          </div>

          {/* ALERTA DE CIERRE EXTEMPORÁNEO (SI APLICA) */}
          {isVencida && (
            <div className="bg-amber-500/10 dark:bg-amber-500/15 p-3 rounded-2xl border border-amber-500/30 flex items-start gap-2.5">
              <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Cierre Extemporáneo Registrado
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 leading-relaxed font-medium">
                  Fecha programada original: <strong className="font-mono">{activity.fechaProgramada}</strong>. Se asentará con fecha real de hoy para auditoría y trazabilidad ISO.
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN 1: PARÁMETROS GENERALES DE EJECUCIÓN */}
          <div className="bg-[var(--surface-alt)]/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-[var(--outline-color)]/25 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[var(--outline-color)]/20 pb-2">
              <span className="text-[10px] font-space font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Calendar size={13} className="text-[var(--primary)]" /> Parámetros de Ejecución
              </span>
              <span className="text-[9px] font-mono text-[var(--text-muted)]">Campos Obligatorios *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Fecha de Ejecución Real */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                  Fecha de Ejecución Real *
                </label>
                <div className="relative">
                  <input 
                    type="date"
                    value={fechaEjecucion}
                    onChange={e => setFechaEjecucion(e.target.value)}
                    disabled={isVencida}
                    className={`w-full h-10 px-3 bg-[var(--background)] border border-[var(--outline-color)]/40 rounded-xl text-xs font-mono font-semibold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all ${isVencida ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-zinc-800' : ''}`}
                    required
                  />
                </div>
              </div>

              {/* Proveedor / Laboratorio Ejecutor */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {isMantenimiento ? 'Taller / Proveedor Ejecutor *' : 'Laboratorio Metrológico *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingLab(!isCreatingLab)}
                    className="text-[10px] text-[var(--primary)] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    {isCreatingLab ? '← Catálogo' : '+ Registrar nuevo'}
                  </button>
                </div>

                {!isCreatingLab ? (
                  /* COMBOBOX DE LABORATORIOS / PROVEEDORES */
                  <div className="relative" ref={labDropdownRef}>
                    <div className="relative flex items-center">
                      <Search size={14} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" />
                      <input
                        type="text"
                        value={labSearch}
                        onChange={(e) => {
                          setLabSearch(e.target.value);
                          setLaboratorio(e.target.value);
                          setIsLabDropdownOpen(true);
                        }}
                        onFocus={() => setIsLabDropdownOpen(true)}
                        placeholder={isMantenimiento ? "Buscar taller técnico o marca..." : "Buscar laboratorio metrológico..."}
                        className="w-full h-10 pl-8 pr-14 bg-[var(--background)] border border-[var(--outline-color)]/40 rounded-xl text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all shadow-xs"
                      />
                      <div className="absolute right-2.5 flex items-center gap-1">
                        {labSearch && (
                          <button
                            type="button"
                            onClick={() => { 
                              setLabSearch(''); 
                              setLaboratorio(''); 
                              setIsLabDropdownOpen(true); 
                            }}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-full transition-colors cursor-pointer"
                            title="Limpiar búsqueda"
                          >
                            <X size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsLabDropdownOpen(!isLabDropdownOpen)}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                        >
                          <ChevronDown size={14} className={`transition-transform duration-200 ${isLabDropdownOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* POPOVER CON RESULTADOS */}
                    {isLabDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[var(--surface)] border border-[var(--outline-color)]/40 rounded-2xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-[var(--outline-color)]/10 animate-in fade-in zoom-in-95 duration-150">
                        {filteredLabs.length > 0 ? (
                          filteredLabs.map((lab) => {
                            const isSelected = laboratorio === lab.nombre;
                            return (
                              <div
                                key={lab.id || lab.nombre}
                                onClick={() => handleSelectLab(lab)}
                                className={`p-2.5 sm:p-3 hover:bg-[var(--surface-alt)] cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                                  isSelected ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : ''
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-semibold truncate text-[var(--text-main)]">{lab.nombre}</p>
                                    {lab.tipo && (
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                        lab.tipo === 'Acreditado' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                                        lab.tipo === 'Trazable' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30' :
                                        'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                      }`}>
                                        {lab.tipo}
                                      </span>
                                    )}
                                  </div>
                                  {lab.especialidad && (
                                    <p className="text-[9.5px] text-[var(--text-muted)] truncate mt-0.5">{lab.especialidad}</p>
                                  )}
                                </div>
                                {isSelected && (
                                  <Check size={14} className="text-[var(--primary)] shrink-0" />
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-3 text-center text-xs text-[var(--text-muted)]">
                            No hay coincidencias para "<span className="font-semibold text-[var(--text-main)]">{labSearch}</span>".
                          </div>
                        )}

                        {/* CREAR Y GUARDAR EN BD SI NO EXISTE */}
                        {labSearch.trim() && !exactMatchExists && (
                          <div 
                            onClick={() => handleQuickAddLab(labSearch)}
                            className="p-3 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border-t border-[var(--primary)]/30 cursor-pointer flex items-center gap-2 text-[var(--primary)] transition-colors"
                          >
                            <div className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                              <Plus size={12} />
                            </div>
                            <span className="text-[11px] font-bold truncate">
                              {isSavingLab ? 'Guardando en BD...' : `+ Registrar "${labSearch}" en el catálogo`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* FORMULARIO DE REGISTRO MANUAL */
                  <div className="p-3 bg-[var(--surface-alt)] border border-[var(--primary)]/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <input
                      type="text"
                      value={newLabName}
                      onChange={(e) => setNewLabName(e.target.value)}
                      placeholder="Nombre del nuevo laboratorio o taller..."
                      className="w-full h-9 px-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      autoFocus
                    />
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={newLabTipo}
                        onChange={(e) => setNewLabTipo(e.target.value)}
                        className="text-[10px] h-8 px-2 bg-[var(--background)] border border-[var(--outline-color)]/20 rounded-lg font-medium text-[var(--text-muted)]"
                      >
                        <option value="Acreditado">Acreditado (ISO 17025)</option>
                        <option value="Trazable">Trazable</option>
                        <option value="Taller">Taller Técnico de Marca</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleCreateNewLab}
                        disabled={!newLabName.trim() || isSavingLab}
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-space font-bold uppercase tracking-wider flex items-center gap-1 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition-all"
                      >
                        {isSavingLab ? <RefreshCw size={11} className="animate-spin" /> : <Plus size={11} />}
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: FORMULARIO ESPECÍFICO SEGÚN TIPO */}
          {/* 🛠️ A. MANTENIMIENTO TÉCNICO */}
          {isMantenimiento && (
            <div className="bg-[var(--surface-alt)]/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-[var(--outline-color)]/25 space-y-3.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[var(--outline-color)]/20 pb-2">
                <span className="text-[10px] font-space font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Wrench size={13} className="text-amber-500" /> Registro de Servicio & Estado Operativo
                </span>
                <span className="text-[9px] font-mono text-[var(--text-muted)]">Hoja de Vida</span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                  No. de Reporte de Servicio / Orden de Trabajo (OT)
                </label>
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input 
                    value={reporteOT} 
                    onChange={e => setReporteOT(e.target.value)}
                    placeholder="Ej: OT-2026-MANT-042 o REP-SERV-881" 
                    className="w-full h-10 pl-8 pr-3 bg-[var(--background)] border border-[var(--outline-color)]/40 rounded-xl text-xs font-mono text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                  Descripción de Trabajos Efectuados & Repuestos *
                </label>
                <textarea
                  rows={3}
                  value={descripcionTrabajos}
                  onChange={e => setDescripcionTrabajos(e.target.value)}
                  placeholder="Detalle los trabajos efectuados (ej: Limpieza ultrasónica de contactos, ajuste mecánico de selectores, reemplazo de batería 9V, verificación de continuidad)..."
                  className="w-full p-3 bg-[var(--background)] border border-[var(--outline-color)]/40 rounded-xl text-xs text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] leading-relaxed resize-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                  Estado Operativo Resultante en Planta *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'Operativo', label: 'Operativo', desc: '100% Apto para producción', activeBorder: 'border-emerald-500/50 ring-1 ring-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', dotActive: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
                    { id: 'En Observación', label: 'En Observación', desc: 'Funcional con advertencia', activeBorder: 'border-amber-500/50 ring-1 ring-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300', dotActive: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
                    { id: 'No Operativo', label: 'No Operativo', desc: 'Fuera de servicio / Bloqueado', activeBorder: 'border-red-500/50 ring-1 ring-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300', dotActive: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' }
                  ].map((item) => {
                    const isSelected = estadoOperativo === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEstadoOperativo(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                          isSelected 
                            ? `${item.activeBorder} shadow-xs` 
                            : 'bg-[var(--background)] border-[var(--outline-color)]/30 text-[var(--text-muted)] hover:border-slate-300 dark:hover:border-slate-700 hover:text-[var(--text-main)]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold font-space uppercase tracking-tight">{item.label}</span>
                          <span className={`w-2.5 h-2.5 rounded-full transition-all ${isSelected ? item.dotActive : 'bg-slate-300 dark:bg-slate-700'}`} />
                        </div>
                        <p className="text-[9.5px] opacity-80 leading-snug">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 📋 B. CALIFICACIÓN DE EQUIPOS */}
          {isCalificacion && (
            <div className="bg-[var(--surface-alt)]/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-[var(--outline-color)]/25 space-y-3.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[var(--outline-color)]/20 pb-2">
                <span className="text-[10px] font-space font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Award size={13} className="text-purple-500" /> Protocolo de Calificación (IQ / OQ / PQ)
                </span>
                <span className="text-[9px] font-mono text-[var(--text-muted)]">Validación Farmacéutica/Industrial</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                    Protocolo No. / Identificador *
                  </label>
                  <input 
                    value={protocoloNumero} 
                    onChange={e => setProtocoloNumero(e.target.value)}
                    placeholder="Ej: PROT-IQ-OQ-2026-01" 
                    className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--outline-color)]/40 rounded-xl text-xs font-mono text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                    Etapa de Calificación *
                  </label>
                  <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                    {['IQ', 'OQ', 'PQ'].map((stage) => {
                      const isSelected = etapaCalificacion === stage;
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => setEtapaCalificacion(stage)}
                          className={`flex-1 py-1.5 text-xs font-space font-bold rounded-lg transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600/50' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          {stage}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                  Dictamen Final de Calificación *
                </label>
                <div className="flex gap-2.5">
                  {[
                    { id: 'Aprobado', label: 'Aprobado', activeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20', dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
                    { id: 'No Aprobado', label: 'No Aprobado', activeClass: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/40 shadow-xs ring-1 ring-red-500/20', dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' }
                  ].map((item) => {
                    const isSelected = resultadoCalificacion === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setResultadoCalificacion(item.id)}
                        className={`flex-1 py-2.5 text-xs font-space font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isSelected 
                            ? item.activeClass
                            : 'bg-[var(--background)] border-[var(--outline-color)]/30 text-[var(--text-muted)] hover:border-slate-300 dark:hover:border-slate-700 hover:text-[var(--text-main)]'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full transition-all ${isSelected ? item.dotClass : 'bg-slate-300 dark:bg-slate-700'}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ⚖️ C. CALIBRACIÓN / VERIFICACIÓN (ISO 10012) */}
          {isMetrologica && (
            <div className="bg-[var(--surface-alt)]/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-[var(--outline-color)]/25 space-y-3.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[var(--outline-color)]/20 pb-2">
                <span className="text-[10px] font-space font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-500" /> Trazabilidad & Certificado Metrológico
                </span>
                <span className="text-[9px] font-mono text-[var(--text-muted)]">NTC-ISO/IEC 17025</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                    No. de Certificado *
                  </label>
                  <input 
                    value={certificadoNumero} 
                    onChange={e => setCertificadoNumero(e.target.value)}
                    placeholder="Ej: CERT-2026-CAL-089" 
                    className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--outline-color)]/40 rounded-xl text-xs font-mono text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                    Acreditación del Laboratorio
                  </label>
                  <div className="flex gap-1 p-1 h-10 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                    {['Acreditado', 'Trazable'].map((t) => {
                      const isSelected = laboratorioTipo === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setLaboratorioTipo(t)}
                          className={`flex-1 h-full text-xs font-space font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600/50'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                  Patrón de Referencia Utilizado (Opcional)
                </label>
                <input 
                  value={patronReferencia} 
                  onChange={e => setPatronReferencia(e.target.value)}
                  placeholder="Ej: Calibrador Multifunción Fluke 5500A / Bloques Patrón Grado 0" 
                  className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--outline-color)]/40 rounded-xl text-xs text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]" 
                />
              </div>

              {/* CONFIRMACIÓN METROLÓGICA ISO 10012 */}
              <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--outline-color)]/30 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-wider">
                      Evaluación Matemática de Conformidad (ISO 10012)
                    </p>
                    <p className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5">
                      Fórmula: |Error| + Incertidumbre (U) ≤ Criterio Aceptación (EMP)
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border shadow-xs ${
                    compliance === 'Conforme' 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                      : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                  }`}>
                    {compliance === 'Conforme' ? '✓ Conforme (Apto)' : '⚠️ No Conforme (Desviado)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9.5px] font-medium text-[var(--text-muted)] mb-1 block">Error Máximo *</label>
                    <input 
                      type="number"
                      step="any"
                      value={errorEncontrado} 
                      onChange={e => setErrorEncontrado(e.target.value)}
                      placeholder="Ej: 0.002" 
                      className="w-full h-9 px-2.5 bg-[var(--surface)] border border-[var(--outline-color)]/40 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-medium text-[var(--text-muted)] mb-1 block">Incertidumbre U *</label>
                    <input 
                      type="number"
                      step="any"
                      value={incertidumbre} 
                      onChange={e => setIncertidumbre(e.target.value)}
                      placeholder="Ej: 0.0005" 
                      className="w-full h-9 px-2.5 bg-[var(--surface)] border border-[var(--outline-color)]/40 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-medium text-[var(--text-muted)] mb-1 block">EMP / Tolerancia *</label>
                    <input 
                      type="number"
                      step="any"
                      value={criterioValor} 
                      onChange={e => setCriterioValor(e.target.value)}
                      placeholder="Ej: 0.005" 
                      className="w-full h-9 px-2.5 bg-[var(--surface)] border border-[var(--outline-color)]/40 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: DROPZONE PARA EVIDENCIA DIGITAL (PDF / FOTO) */}
          <div className="p-4 rounded-2xl bg-[var(--surface-alt)]/30 border-2 border-dashed border-[var(--outline-color)]/40 hover:border-[var(--primary)]/60 transition-all cursor-pointer group">
            <input 
              type="file" 
              className="hidden" 
              id="cert-upload" 
              accept=".pdf,image/*" 
              onChange={e => setFile(e.target.files?.[0] || null)} 
            />
            <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center justify-center">
              {file ? (
                <div className="flex items-center justify-between w-full p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold font-mono truncate max-w-sm">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="p-1 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                    title="Remover archivo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-2">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--outline-color)]/40 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:scale-105 transition-all shadow-xs mb-2">
                    <FileUp size={20} />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-main)]">
                    {isMantenimiento 
                      ? 'Adjuntar Reporte Técnico / Factura / Soporte de Mantenimiento' 
                      : isCalificacion
                      ? 'Adjuntar Protocolo Firmado de Calificación'
                      : 'Adjuntar Certificado de Calibración / Verificación Digital'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 uppercase tracking-wider">
                    Formatos PDF, PNG o JPG (Máx. 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>

        </div>

        {/* PIE DE PÁGINA: ALERTAS Y BOTONES DE ACCIÓN */}
        <div className="p-4 sm:p-5 border-t border-[var(--outline-color)]/20 bg-[var(--surface)] space-y-3 shrink-0">
          {/* ALERTA VISUAL DE DATOS FALTANTES O ERROR */}
          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-xs">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-500 animate-pulse" />
              <div className="flex-1">
                <p className="font-bold uppercase tracking-wider text-[10px] mb-0.5 text-red-700 dark:text-red-300">
                  Atención: Información Incompleta
                </p>
                <p className="font-medium leading-relaxed">{formError}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setFormError('')} 
                className="p-1 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors cursor-pointer"
                title="Cerrar advertencia"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose} 
              className="flex-1 btn-precision-secondary h-11 text-xs font-space font-bold uppercase tracking-wider cursor-pointer rounded-xl" 
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleFinish}
              disabled={isUploading}
              className="flex-2 btn-precision-primary h-11 px-6 text-xs font-space font-bold uppercase tracking-wider disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer shadow-md rounded-xl transition-all"
            >
              {isUploading ? (
                <><RefreshCw size={15} className="animate-spin" /> REGISTRANDO Y GUARDANDO...</>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>REGISTRAR Y FINALIZAR ACTIVIDAD</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
