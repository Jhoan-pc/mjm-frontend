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
  AlertTriangle
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
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--surface)] text-[var(--text-main)] rounded-2xl p-6 sm:p-7 w-full max-w-xl shadow-2xl border border-[var(--outline-color)]/30 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Encabezado Dinámico según tipo de actividad */}
        <div className="flex justify-between items-start mb-5 pb-3.5 border-b border-[var(--outline-color)]/20">
           <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isMantenimiento 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : isCalificacion
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                 {isMantenimiento ? <Wrench size={22} /> : isCalificacion ? <Award size={22} /> : <ShieldCheck size={22} />}
              </div>
              <div>
                 <h2 className="text-lg font-bold text-[var(--text-main)] uppercase tracking-tight">
                   {isMantenimiento 
                     ? 'Cierre de Mantenimiento Técnico' 
                     : isCalificacion 
                     ? 'Cierre de Calificación de Equipo' 
                     : 'Cierre de Actividad Metrológica'}
                 </h2>
                 <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                   {isMantenimiento 
                     ? 'Orden de Trabajo & Registro de Servicio Operativo' 
                     : isCalificacion
                     ? 'Protocolo de Calificación e Idoneidad (IQ/OQ/PQ)'
                     : 'Protocolo de Certificación & Trazabilidad ISO 10012'}
                 </p>
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
           {/* Resumen del Activo a Intervenir */}
           <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20">
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Activo a Intervenir</p>
              <p className="text-sm font-bold text-[var(--text-main)] uppercase">{activity.instrumentNombre || 'Instrumento'}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-mono font-bold rounded border border-[var(--primary)]/20">
                  ID: {activity.codigo || activity.codigoMJM || 'MJM'}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                  isMantenimiento 
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    : isCalificacion
                    ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                    : 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                }`}>
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
                     Esta tarea superó su fecha programada ({activity.fechaProgramada}). Se registrará con fecha de hoy ({todayStr}) para auditoría y trazabilidad.
                   </p>
                </div>
             </div>
           )}

           {/* Fecha de Ejecución Real y Selector Inteligente de Laboratorio / Proveedor */}
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {isMantenimiento ? 'Proveedor / Taller Ejecutor' : 'Laboratorio Ejecutor'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingLab(!isCreatingLab)}
                      className="text-[10px] text-[var(--primary)] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {isCreatingLab ? 'Seleccionar existente' : '+ Registrar nuevo'}
                    </button>
                  </div>

                  {!isCreatingLab ? (
                    /* 🔍 BUSCADOR INTELIGENTE / COMBOBOX DE LABORATORIOS */
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
                          placeholder={isMantenimiento ? "Buscar proveedor o taller técnico..." : "Buscar o filtrar laboratorio..."}
                          className="w-full pl-8 pr-16 p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all shadow-xs"
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

                      {/* POPOVER DESPLEGABLE CON RESULTADOS FILTRADOS */}
                      {isLabDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[var(--surface)] border border-[var(--outline-color)]/30 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-[var(--outline-color)]/10 animate-in fade-in zoom-in-95 duration-150">
                          {filteredLabs.length > 0 ? (
                            filteredLabs.map((lab) => {
                              const isSelected = laboratorio === lab.nombre;
                              return (
                                <div
                                  key={lab.id || lab.nombre}
                                  onClick={() => handleSelectLab(lab)}
                                  className={`p-2.5 hover:bg-[var(--surface-alt)] cursor-pointer flex items-center justify-between gap-2 transition-colors ${
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

                          {/* OPCIÓN DIRECTA DE CREAR Y REGISTRAR EN BD SI NO EXISTE */}
                          {labSearch.trim() && !exactMatchExists && (
                            <div 
                              onClick={() => handleQuickAddLab(labSearch)}
                              className="p-2.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border-t border-[var(--primary)]/30 cursor-pointer flex items-center gap-2 text-[var(--primary)] transition-colors"
                            >
                              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                                <Plus size={12} />
                              </div>
                              <span className="text-[11px] font-bold truncate">
                                {isSavingLab ? 'Guardando en BD...' : `+ Registrar "${labSearch}" en BD`}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* FORMULARIO MANUAL DE CREACIÓN DETALLADA */
                    <div className="p-2.5 bg-[var(--surface-alt)] border border-[var(--primary)]/30 rounded-lg space-y-2 animate-in fade-in duration-200">
                      <input
                        type="text"
                        value={newLabName}
                        onChange={(e) => setNewLabName(e.target.value)}
                        placeholder="Nombre del nuevo laboratorio/taller..."
                        className="w-full p-2 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded text-xs font-semibold text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        autoFocus
                      />
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={newLabTipo}
                          onChange={(e) => setNewLabTipo(e.target.value)}
                          className="text-[10px] p-1.5 bg-[var(--background)] border border-[var(--outline-color)]/20 rounded font-medium text-[var(--text-muted)]"
                        >
                          <option value="Acreditado">Acreditado (ISO 17025)</option>
                          <option value="Trazable">Trazable</option>
                          <option value="Taller">Taller Técnico / Autorizado</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleCreateNewLab}
                          disabled={!newLabName.trim() || isSavingLab}
                          className="px-3 py-1.5 bg-[var(--primary)] text-[#1A202C] rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {isSavingLab ? <RefreshCw size={10} className="animate-spin" /> : <Plus size={10} />}
                          Guardar en BD
                        </button>
                      </div>
                    </div>
                  )}
               </div>
           </div>

           {/* ─── CASO 1: FORMULARIO ESPECÍFICO DE MANTENIMIENTO TÉCNICO ─── */}
           {isMantenimiento && (
             <div className="space-y-3 animate-in fade-in duration-300">
               <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20 space-y-3">
                 <div>
                   <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                     No. de Reporte de Servicio / Orden de Trabajo (OT)
                   </label>
                   <input 
                     value={reporteOT} 
                     onChange={e => setReporteOT(e.target.value)}
                     placeholder="Ej: OT-2026-MANT-042 o REP-SERV-881" 
                     className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                   />
                 </div>

                 <div>
                   <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                     Descripción de Trabajos Realizados & Repuestos
                   </label>
                   <textarea
                     rows={3}
                     value={descripcionTrabajos}
                     onChange={e => setDescripcionTrabajos(e.target.value)}
                     placeholder="Detalle los trabajos efectuados (ej. Limpieza de conectores, ajuste de selectores, reemplazo de fusible/batería 9V, lubricación de componentes móviles)..."
                     className="w-full p-2.5 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)] leading-relaxed resize-none"
                   />
                 </div>

                 <div>
                   <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                     Estado Operativo Resultante del Equipo
                   </label>
                   <div className="grid grid-cols-3 gap-2">
                     {[
                       { id: 'Operativo', label: 'Operativo', desc: '100% Apto para uso', color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
                       { id: 'En Observación', label: 'En Observación', desc: 'Funcional con detalle', color: 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10' },
                       { id: 'No Operativo', label: 'Requiere Calibración', desc: 'Intervención mayor', color: 'text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10' }
                     ].map((item) => (
                       <button
                         key={item.id}
                         type="button"
                         onClick={() => setEstadoOperativo(item.id)}
                         className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                           estadoOperativo === item.id 
                             ? `${item.color} ring-1 ring-current shadow-xs` 
                             : 'bg-[var(--background)] border-[var(--outline-color)]/20 text-[var(--text-muted)] hover:text-[var(--text-main)]'
                         }`}
                       >
                         <p className="text-xs font-bold leading-tight">{item.label}</p>
                         <p className="text-[9px] opacity-75 mt-0.5 truncate">{item.desc}</p>
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* ─── CASO 2: FORMULARIO ESPECÍFICO DE CALIFICACIÓN (IQ/OQ/PQ) ─── */}
           {isCalificacion && (
             <div className="space-y-3 animate-in fade-in duration-300">
               <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20 space-y-3">
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                       Protocolo No. / Identificador
                     </label>
                     <input 
                       value={protocoloNumero} 
                       onChange={e => setProtocoloNumero(e.target.value)}
                       placeholder="Ej: PROT-IQ-OQ-2026-01" 
                       className="w-full p-2 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                       Etapa de Calificación
                     </label>
                     <div className="flex gap-1.5">
                       {['IQ', 'OQ', 'PQ'].map((stage) => (
                         <button
                           key={stage}
                           type="button"
                           onClick={() => setEtapaCalificacion(stage)}
                           className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                             etapaCalificacion === stage 
                               ? 'bg-purple-600 text-white border-transparent' 
                               : 'bg-[var(--background)] border-[var(--outline-color)]/20 text-[var(--text-muted)]'
                           }`}
                         >
                           {stage}
                         </button>
                       ))}
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                     Dictamen de Calificación
                   </label>
                   <div className="flex gap-2">
                     {['Aprobado', 'No Aprobado'].map((res) => (
                       <button
                         key={res}
                         type="button"
                         onClick={() => setResultadoCalificacion(res)}
                         className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                           resultadoCalificacion === res 
                             ? (res === 'Aprobado' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white')
                             : 'bg-[var(--background)] border-[var(--outline-color)]/20 text-[var(--text-muted)]'
                         }`}
                       >
                         {res}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* ─── CASO 3: FORMULARIO RIGUROSO METROLÓGICO (CALIBRACIÓN / VERIFICACIÓN ISO 10012) ─── */}
           {isMetrologica && (
             <div className="space-y-3 animate-in fade-in duration-300">
               {/* No. de Certificado & Trazabilidad */}
               <div className="bg-[var(--surface-alt)] p-3.5 rounded-xl border border-[var(--outline-color)]/20 space-y-3">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Certificado No. (Identificador)</label>
                     <input 
                       value={certificadoNumero} 
                       onChange={e => setCertificadoNumero(e.target.value)}
                       placeholder="Ej: CERT-2026-CAL-089" 
                       className="w-full p-2 bg-[var(--background)] border border-[var(--outline-color)]/30 rounded-lg text-xs font-mono text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]" 
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Tipo de Laboratorio</label>
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
                   <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Patrón de Referencia Utilizado (Opcional)</label>
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
             </div>
           )}

           {/* DROPZONE PARA SOPORTE DIGITAL (PDF / FOTO) */}
           <div className="border-2 border-dashed border-[var(--outline-color)]/30 rounded-xl p-4 sm:p-5 text-center hover:border-[var(--primary)]/50 transition-all cursor-pointer bg-[var(--surface-alt)]/40 group">
              <input 
                type="file" 
                className="hidden" 
                id="cert-upload" 
                accept=".pdf,image/*" 
                onChange={e => setFile(e.target.files?.[0] || null)} 
              />
              <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center">
                 <FileUp size={24} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] mb-1 transition-colors" />
                 {file ? (
                   <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                     <FileText size={15} />
                     <span className="truncate max-w-xs">{file.name}</span>
                   </div>
                 ) : (
                   <>
                    <p className="text-xs font-bold text-[var(--text-main)]">
                      {isMantenimiento 
                        ? 'Adjuntar Reporte Técnico / OT / Factura de Mantenimiento' 
                        : isCalificacion
                        ? 'Adjuntar Protocolo Firmado de Calificación'
                        : 'Adjuntar Certificado de Calibración / Verificación'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">Formatos PDF, PNG o JPG (Máx. 10MB)</p>
                   </>
                 )}
              </label>
           </div>

            {/* ALERTA VISUAL DE DATOS FALTANTES O ERROR AL GUARDAR */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-500 animate-pulse" />
                <div className="flex-1">
                  <p className="font-bold uppercase tracking-wider text-[10px] mb-0.5 text-red-700 dark:text-red-300">
                    Atención: Datos Incompletos o No Válidos
                  </p>
                  <p className="font-medium leading-relaxed">{formError}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFormError('')} 
                  className="p-1 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                  title="Cerrar advertencia"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-2">
               <button 
                 type="button"
                 onClick={onClose} 
                 className="flex-1 btn-precision-secondary py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer" 
                 disabled={isUploading}
               >
                 Cancelar
               </button>
               <button 
                 type="button"
                 onClick={handleFinish}
                 disabled={isUploading}
                 className="flex-2 btn-precision-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer shadow-md"
               >
                 {isUploading ? (
                   <><RefreshCw size={15} className="animate-spin" /> REGISTRANDO Y GUARDANDO...</>
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
