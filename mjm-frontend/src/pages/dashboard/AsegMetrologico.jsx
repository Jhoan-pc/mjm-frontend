import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp, 
  History, 
  ClipboardCheck, 
  SlidersHorizontal,
  Layers,
  X,
  Calendar,
  User,
  FileText,
  Check,
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  RefreshCw,
  Sparkles,
  Thermometer,
  Droplets,
  Compass
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useInventoryStore } from '../../store/inventoryStore';

// ─── COMPONENTE 1: MODAL DE NUEVA COMPROBACIÓN METROLÓGICA EN PISO ─────────────
const NewCheckModal = ({ 
  isOpen, 
  onClose, 
  instruments = [], 
  preselectedId = null,
  onSuccess 
}) => {
  const { tenant, user } = useAuthStore();
  const { recordPlantCheck } = useInventoryStore();

  const [selectedInstId, setSelectedInstId] = useState(preselectedId || (instruments[0]?.id || ''));
  const [patronNombre, setPatronNombre] = useState('Bloque Patrón Longitudinal Grado 1 (Cert. INM)');
  const [patronCert, setPatronCert] = useState('INM-CAL-2026-089');
  const [valorPatron, setValorPatron] = useState('');
  const [valorLeido, setValorLeido] = useState('');
  const [temperatura, setTemperatura] = useState('20.0');
  const [humedad, setHumedad] = useState('55');
  const [responsable, setResponsable] = useState(user?.nombre || 'Metrólogo de Planta');
  const [notas, setNotas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (preselectedId) {
      setSelectedInstId(preselectedId);
    } else if (instruments.length > 0 && !selectedInstId) {
      setSelectedInstId(instruments[0].id);
    }
  }, [preselectedId, instruments]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (firstInputRef.current) firstInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const selectedInst = useMemo(() => {
    return instruments.find(i => i.id === selectedInstId) || null;
  }, [instruments, selectedInstId]);

  // Patrones predeterminados según la magnitud del activo
  const patronSuggestions = useMemo(() => {
    const mag = (selectedInst?.magnitud || '').toLowerCase();
    if (mag.includes('masa') || mag.includes('peso')) {
      return [
        { nombre: 'Juego de Pesas Clase F1 (Cert. INM)', cert: 'INM-MASA-2026-112' },
        { nombre: 'Pesa Patrón Clase M1 500g (Trazable INM)', cert: 'CAL-REF-M1-045' },
        { nombre: 'Pesa Individual Inox Clase E2 200g', cert: 'INM-E2-2025-994' }
      ];
    }
    if (mag.includes('temp') || mag.includes('termo')) {
      return [
        { nombre: 'Termómetro Patrón Fluke 1524 / PT100', cert: 'INM-TEMP-2026-301' },
        { nombre: 'Termohigrómetro Patrón Calibrado Vaisala', cert: 'MET-TH-2026-014' },
        { nombre: 'Calibrador de Pozo Seco Fluke 9142', cert: 'INM-CAL-9142-88' }
      ];
    }
    if (mag.includes('presi')) {
      return [
        { nombre: 'Manómetro Digital Patrón Fluke 700G (0.05% FS)', cert: 'INM-PRES-2026-202' },
        { nombre: 'Bomba de Comparación Neumática Additel 916', cert: 'PAT-AD-916-033' },
        { nombre: 'Transductor de Presión Trazable Keller', cert: 'INM-PRES-2025-119' }
      ];
    }
    if (mag.includes('eléct') || mag.includes('elect')) {
      return [
        { nombre: 'Calibrador Multipropósito Fluke 5522A', cert: 'INM-ELEC-2026-550' },
        { nombre: 'Multímetro Patrón 8.5 Dígitos Keysight 3458A', cert: 'INM-VOLT-2025-001' },
        { nombre: 'Shunt de Corriente Patrón Cal-Ref', cert: 'SH-ELEC-2026-07' }
      ];
    }
    // Longitud / Dimensional por defecto
    return [
      { nombre: 'Bloque Patrón Longitudinal Grado 1 (Cert. INM)', cert: 'INM-CAL-2026-089' },
      { nombre: 'Juego de Bloques Mitutoyo Cerámica Grado 0', cert: 'MITU-G0-2025-77' },
      { nombre: 'Anillo Patrón Dimensional Cal-Ref 25.000 mm', cert: 'INM-RING-2026-012' }
    ];
  }, [selectedInst]);

  // Actualizar patrón por defecto al cambiar de equipo
  useEffect(() => {
    if (patronSuggestions.length > 0) {
      setPatronNombre(patronSuggestions[0].nombre);
      setPatronCert(patronSuggestions[0].cert);
    }
  }, [patronSuggestions]);

  // Cálculos en tiempo real de la medición en planta
  const calculations = useMemo(() => {
    const vP = parseFloat(valorPatron);
    const vL = parseFloat(valorLeido);
    const tol = parseFloat(selectedInst?.tolerancia_proceso) || 0.05;
    const unidad = selectedInst?.unidad_medida || 'mm';

    if (isNaN(vP) || isNaN(vL)) {
      return { errorVal: null, consumoPct: 0, declaracion: 'Pendiente', tol, unidad };
    }

    const errorVal = Number((vL - vP).toFixed(4));
    const consumoPct = tol > 0 ? Math.min(999, Math.round((Math.abs(errorVal) / tol) * 100)) : 0;
    const declaracion = Math.abs(errorVal) <= tol ? 'Conforme' : 'No Conforme';

    return { errorVal, consumoPct, declaracion, tol, unidad };
  }, [valorPatron, valorLeido, selectedInst]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstId) return alert('Seleccione un instrumento');
    if (calculations.errorVal === null) return alert('Ingrese el valor nominal del patrón y la lectura obtenida');

    setIsSubmitting(true);
    try {
      const result = await recordPlantCheck({
        tenantId: tenant?.id,
        instrumentId: selectedInstId,
        patronReferencia: patronNombre,
        patronCertificado: patronCert,
        valorPatron: Number(valorPatron),
        valorLeido: Number(valorLeido),
        unidadMedida: calculations.unidad,
        temperatura: Number(temperatura) || 20.0,
        humedad: Number(humedad) || 55,
        responsable,
        notas
      });

      if (result.success) {
        onSuccess && onSuccess(result);
        onClose();
      }
    } catch (err) {
      console.error('Error guardando comprobación:', err);
      alert('Error al registrar la comprobación en planta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-mjm-navy/10 dark:bg-[#f7931b]/20 flex items-center justify-center text-mjm-navy dark:text-[#f7931b]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-space font-bold text-slate-900 dark:text-white text-base leading-tight">
                Nueva Comprobación Metrológica en Planta
              </h3>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Protocolo Táctico ISO 10012:2003 & ISO/IEC 17025
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* 1. Selección de Activo */}
          <div>
            <label className="block font-mono text-[10.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-bold">
              1. Instrumento de Planta a Verificar *
            </label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:border-mjm-navy dark:focus:border-[#f7931b] transition-all"
            >
              {instruments.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.codigoMJM || inst.codigo || 'S/N'} — {inst.nombre} ({inst.marca || 'Genérica'} • Tol: ±{inst.tolerancia_proceso || 0.05} {inst.unidad_medida || 'mm'})
                </option>
              ))}
            </select>
          </div>

          {/* Ficha Resumen del Instrumento Seleccionado */}
          {selectedInst && (
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl flex items-center justify-between font-mono text-[11px]">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Tolerancia de Proceso (EMP):</span>{' '}
                <span className="font-bold text-slate-900 dark:text-white">±{selectedInst.tolerancia_proceso || 0.05} {selectedInst.unidad_medida || 'mm'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Ubicación:</span>{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{selectedInst.jerarquia?.planta || selectedInst.ubicacion || 'Planta General'}</span>
              </div>
            </div>
          )}

          {/* 2. Patrón de Referencia Trazable */}
          <div className="space-y-3">
            <label className="block font-mono text-[10.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              2. Patrón de Referencia Interno *
            </label>
            
            {/* Botones de sugerencias rápidas */}
            <div className="flex flex-wrap gap-1.5">
              {patronSuggestions.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => { setPatronNombre(p.nombre); setPatronCert(p.cert); }}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono border transition-all text-left ${
                    patronNombre === p.nombre 
                      ? 'bg-mjm-navy dark:bg-[#f7931b] text-white border-transparent font-bold shadow-sm' 
                      : 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {p.nombre}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Nombre / Descripción del Patrón:</span>
                <input
                  type="text"
                  value={patronNombre}
                  onChange={(e) => setPatronNombre(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  placeholder="Ej: Bloque Patrón 20.00 mm Grado 1"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Certificado / Trazabilidad:</span>
                <input
                  type="text"
                  value={patronCert}
                  onChange={(e) => setPatronCert(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  placeholder="Ej: INM-CAL-2026-089"
                />
              </div>
            </div>
          </div>

          {/* 3. Mediciones en Piso (Comparación Directa) */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3">
            <label className="block font-mono text-[10.5px] uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
              3. Ensayo de Medición en Gemba ({calculations.unidad}) *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono">Valor Nominal del Patrón (Vp):</span>
                <div className="relative mt-1">
                  <input
                    ref={firstInputRef}
                    type="number"
                    step="any"
                    value={valorPatron}
                    onChange={(e) => setValorPatron(e.target.value)}
                    className="w-full pl-3 pr-12 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white text-sm focus:border-mjm-navy dark:focus:border-[#f7931b]"
                    placeholder="ej. 20.000"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">
                    {calculations.unidad}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono">Lectura Obtenida en Instrumento (Vl):</span>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="any"
                    value={valorLeido}
                    onChange={(e) => setValorLeido(e.target.value)}
                    className="w-full pl-3 pr-12 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white text-sm focus:border-mjm-navy dark:focus:border-[#f7931b]"
                    placeholder="ej. 20.015"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">
                    {calculations.unidad}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Visual Gauge & Verdict */}
            {calculations.errorVal !== null && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700/80 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Error Calculado:</span>
                    <span className={`font-bold text-sm ${calculations.errorVal >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                      {calculations.errorVal > 0 ? `+${calculations.errorVal}` : calculations.errorVal} {calculations.unidad}
                    </span>
                  </div>
                  <div className="font-mono text-right">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">Consumo de Tolerancia:</span>{' '}
                    <span className="font-bold text-xs">{calculations.consumoPct}% MPE</span>
                  </div>
                </div>

                {/* Barra de Consumo Dinámica */}
                <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      calculations.consumoPct <= 75 
                        ? 'bg-emerald-500' 
                        : calculations.consumoPct <= 100 
                          ? 'bg-amber-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, calculations.consumoPct)}%` }}
                  />
                </div>

                {/* Veredicto de Conformidad ISO 10012 */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  calculations.declaracion === 'Conforme'
                    ? calculations.consumoPct <= 75
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold font-space text-xs">
                    {calculations.declaracion === 'Conforme' ? (
                      calculations.consumoPct <= 75 ? (
                        <>
                          <CheckCircle size={16} className="text-emerald-500" />
                          <span>APTO PARA USO — EN CONTROL METROLÓGICO</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} className="text-amber-500" />
                          <span>ALERTA PREVENTIVA — CERCA DEL LÍMITE DE TOLERANCIA</span>
                        </>
                      )
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-red-500" />
                        <span>NO CONFORME — RETIRAR DE LÍNEA DE PRODUCCIÓN</span>
                      </>
                    )}
                  </div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/60 dark:bg-black/40">
                    Regla: |Error| ≤ EMP
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Condiciones Ambientales y Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Thermometer size={11} /> Temperatura:
              </span>
              <div className="relative mt-1">
                <input
                  type="number"
                  step="0.1"
                  value={temperatura}
                  onChange={(e) => setTemperatura(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">°C</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Droplets size={11} /> Humedad Rel.:
              </span>
              <div className="relative mt-1">
                <input
                  type="number"
                  step="1"
                  value={humedad}
                  onChange={(e) => setHumedad(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <User size={11} /> Metrólogo / Operador:
              </span>
              <input
                type="text"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white text-xs"
                placeholder="Nombre del técnico"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-mono">Observaciones / Estado Físico del Equipo:</span>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white text-xs"
              placeholder="Ej: Superficie limpia, cero juego mecánico, repetibilidad adecuada."
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || calculations.errorVal === null}
              className={`px-5 py-2.5 rounded-xl text-white font-bold font-space text-xs shadow-md transition-all flex items-center gap-2 ${
                calculations.errorVal === null || isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : calculations.declaracion === 'Conforme'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                    : 'bg-red-600 hover:bg-red-700 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Guardando en BD...
                </>
              ) : (
                <>
                  <Check size={14} /> Registrar Comprobación en BD
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// ─── COMPONENTE 2: MODAL DE REGISTRO MAESTRO DE COMPROBACIONES EN PLANTA ────────
const MasterLogModal = ({ isOpen, onClose, instruments = [], activities = [] }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  // Recopilar todas las comprobaciones registradas
  const logs = useMemo(() => {
    const list = [];

    // 1. Del historial de cada instrumento
    instruments.forEach(inst => {
      const historial = inst.historial || [];
      historial.forEach(item => {
        if ((item.tipo || '').toLowerCase().includes('verificaci')) {
          list.push({
            id: `${inst.id}_${item.fecha}_${item.error || '0'}`,
            instrumentId: inst.id,
            instrumentNombre: inst.nombre,
            codigoMJM: inst.codigoMJM || inst.codigo || 'S/N',
            unidad: inst.unidad_medida || 'mm',
            tolerancia: inst.tolerancia_proceso || 0.05,
            ...item
          });
        }
      });
    });

    // 2. De las actividades de tipo Verificación completadas
    activities.forEach(act => {
      if ((act.tipo || '').toLowerCase().includes('verificaci') && act.estado === 'done') {
        const alreadyExists = list.some(l => l.instrumentId === act.instrumentId && l.fecha === (act.fechaRealizacion || act.fechaProgramada));
        if (!alreadyExists) {
          const inst = instruments.find(i => i.id === act.instrumentId);
          list.push({
            id: act.id,
            instrumentId: act.instrumentId,
            instrumentNombre: act.instrumentNombre || inst?.nombre || 'Instrumento',
            codigoMJM: act.codigoMJM || inst?.codigoMJM || 'S/N',
            unidad: inst?.unidad_medida || 'mm',
            tolerancia: inst?.tolerancia_proceso || 0.05,
            fecha: act.fechaRealizacion || act.fechaProgramada,
            patron_referencia: act.patron_referencia || act.laboratorio_ejecutor || 'Patrón Interno',
            error: act.error_encontrado !== undefined ? act.error_encontrado : act.error,
            declaracion_conformidad: act.declaracion_conformidad || 'Conforme',
            responsable: act.responsable || 'Metrólogo de Planta',
            notas: act.notas || act.observaciones || ''
          });
        }
      }
    });

    // Ordenar cronológicamente descendente
    list.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
    return list;
  }, [instruments, activities]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const q = filterQuery.toLowerCase();
      const matchText = (log.instrumentNombre || '').toLowerCase().includes(q) ||
                        (log.codigoMJM || '').toLowerCase().includes(q) ||
                        (log.patron_referencia || '').toLowerCase().includes(q) ||
                        (log.responsable || '').toLowerCase().includes(q);

      if (!matchText) return false;
      if (verdictFilter === 'CONFORME') return (log.declaracion_conformidad || '').toLowerCase() === 'conforme';
      if (verdictFilter === 'NO_CONFORME') return (log.declaracion_conformidad || '').toLowerCase().includes('no conforme');
      return true;
    });
  }, [logs, filterQuery, verdictFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-mjm-navy/10 dark:bg-[#f7931b]/20 flex items-center justify-center text-mjm-navy dark:text-[#f7931b]">
              <History size={20} />
            </div>
            <div>
              <h3 className="font-space font-bold text-slate-900 dark:text-white text-base leading-tight">
                Registro Maestro de Comprobaciones en Planta
              </h3>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Trazabilidad Histórica Inmutable • Total: {logs.length} comprobaciones registradas
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar Filtros */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Buscar por activo, código MJM, patrón o metrólogo..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setVerdictFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                verdictFilter === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Todos ({logs.length})
            </button>
            <button
              onClick={() => setVerdictFilter('CONFORME')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                verdictFilter === 'CONFORME'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              Conformes ({logs.filter(l => (l.declaracion_conformidad || '').toLowerCase() === 'conforme').length})
            </button>
            <button
              onClick={() => setVerdictFilter('NO_CONFORME')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                verdictFilter === 'NO_CONFORME'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}
            >
              No Conformes ({logs.filter(l => (l.declaracion_conformidad || '').toLowerCase().includes('no conforme')).length})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
              <ClipboardCheck size={32} className="mx-auto mb-2 opacity-40" />
              No se encontraron registros de comprobación con los filtros aplicados.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-zinc-700">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Código MJM</th>
                    <th className="py-2.5 px-3">Instrumento</th>
                    <th className="py-2.5 px-3">Patrón de Referencia</th>
                    <th className="py-2.5 px-3 text-right">Error Encontrado</th>
                    <th className="py-2.5 px-3 text-right">Tolerancia (EMP)</th>
                    <th className="py-2.5 px-3 text-center">Veredicto</th>
                    <th className="py-2.5 px-3">Metrólogo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono">
                  {filteredLogs.map((item, idx) => {
                    const isConforme = (item.declaracion_conformidad || 'Conforme').toLowerCase() === 'conforme';
                    const errNum = parseFloat(item.error !== undefined ? item.error : (item.error_encontrado || 0));
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {item.fecha || 'Sin fecha'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-mjm-navy dark:text-[#f7931b]">
                          {item.codigoMJM}
                        </td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white truncate max-w-[180px]">
                          {item.instrumentNombre}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                          {item.patron_referencia || 'Patrón Interno'}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${errNum >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                          {errNum > 0 ? `+${errNum}` : errNum} {item.unidad}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          ±{item.tolerancia} {item.unidad}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            isConforme 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' 
                              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
                          }`}>
                            {isConforme ? <Check size={10} /> : <AlertCircle size={10} />}
                            {isConforme ? 'Conforme' : 'No Conforme'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                          {item.responsable || 'Metrólogo'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex justify-between items-center text-xs">
          <span className="font-mono text-slate-400 text-[10px]">
            Conforme a NTC-ISO 10012:2003 • Cláusula 7.1.5.2 ISO 9001
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-mono text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── COMPONENTE 3: MODAL DE CARTA DE CONTROL DE DERIVA (SHEWHART / COMPARAR) ────
const TrendChartModal = ({ isOpen, onClose, instrument, onNewCheck }) => {
  if (!isOpen || !instrument) return null;

  const tol = parseFloat(instrument.tolerancia_proceso) || 0.05;
  const unidad = instrument.unidad_medida || 'mm';

  // Historial de comprobaciones del instrumento
  const checks = useMemo(() => {
    const raw = (instrument.historial || []).filter(h => (h.tipo || '').toLowerCase().includes('verificaci'));
    return raw.map((c, idx) => ({
      index: idx + 1,
      fecha: c.fecha || `Ensayo ${idx + 1}`,
      error: parseFloat(c.error !== undefined ? c.error : (c.error_encontrado || 0)),
      patron: c.patron_referencia || c.patron || 'Patrón Cal-Ref',
      conformidad: c.declaracion_conformidad || 'Conforme'
    })).reverse(); // Cronológico de antiguo a reciente
  }, [instrument]);

  const maxAbsError = useMemo(() => {
    if (checks.length === 0) return 0;
    return Math.max(...checks.map(c => Math.abs(c.error)));
  }, [checks]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-mjm-navy/10 dark:bg-[#f7931b]/20 text-mjm-navy dark:text-[#f7931b] rounded text-[9.5px] font-mono font-bold uppercase">
                {instrument.codigoMJM || instrument.codigo || 'MET-REF'}
              </span>
              <span className="text-xs font-mono text-slate-500">Serie: {instrument.serie || 'INTERNO'}</span>
            </div>
            <h3 className="font-space font-bold text-slate-900 dark:text-white text-lg mt-0.5">
              Carta de Control de Deriva Metrológica — {instrument.nombre}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Ficha Resumen de Tolerancia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Límite de Tolerancia (EMP)</p>
              <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                ±{tol} {unidad}
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Error Máximo Registrado</p>
              <p className={`text-base font-bold font-mono mt-0.5 ${maxAbsError > tol ? 'text-red-600' : 'text-emerald-600'}`}>
                {maxAbsError.toFixed(4)} {unidad}
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Comprobaciones Históricas</p>
              <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {checks.length} Ensayos
              </p>
            </div>
          </div>

          {/* Gráfico de Control Visual (Límites Shewhart) */}
          <div className="bg-slate-50 dark:bg-zinc-800/40 p-5 rounded-xl border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-space font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={15} className="text-[#f7931b]" />
                Comportamiento Temporal de Deriva (|Error| vs ±EMP)
              </h4>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-red-500">
                  <span className="w-2.5 h-0.5 bg-red-500 inline-block" /> Límite Tol (±{tol})
                </span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" /> Cero Nominal (0.00)
                </span>
              </div>
            </div>

            {checks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                <AlertCircle size={28} className="mx-auto mb-2 opacity-50" />
                No hay comprobaciones intermedias registradas para este activo aún.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Visual Representation of Points */}
                <div className="relative h-44 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 flex flex-col justify-between overflow-hidden">
                  
                  {/* Línea Superior (+EMP) */}
                  <div className="absolute top-4 left-0 right-0 border-t border-dashed border-red-400/80 dark:border-red-500/60 z-0">
                    <span className="absolute right-2 -top-2.5 text-[9px] font-mono text-red-500 bg-white dark:bg-zinc-900 px-1 font-bold">
                      +EMP: +{tol} {unidad}
                    </span>
                  </div>

                  {/* Línea Cero Nominal */}
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-t border-emerald-400/60 dark:border-emerald-500/60 z-0">
                    <span className="absolute right-2 -top-2.5 text-[9px] font-mono text-emerald-600 bg-white dark:bg-zinc-900 px-1 font-bold">
                      0.00 {unidad}
                    </span>
                  </div>

                  {/* Línea Inferior (-EMP) */}
                  <div className="absolute bottom-4 left-0 right-0 border-t border-dashed border-red-400/80 dark:border-red-500/60 z-0">
                    <span className="absolute right-2 -top-2.5 text-[9px] font-mono text-red-500 bg-white dark:bg-zinc-900 px-1 font-bold">
                      -EMP: -{tol} {unidad}
                    </span>
                  </div>

                  {/* Puntos de Comprobación */}
                  <div className="relative z-10 h-full flex items-center justify-around px-4">
                    {checks.map((item, idx) => {
                      // Calcular posición Y porcentual (0% en +tol, 50% en 0, 100% en -tol)
                      const clampedError = Math.max(-tol * 1.2, Math.min(tol * 1.2, item.error));
                      // Y: top is +tol (0%), center is 0 (50%), bottom is -tol (100%)
                      const pctFromTop = 50 - (clampedError / (tol * 1.2)) * 40;
                      const isOutOfTol = Math.abs(item.error) > tol;

                      return (
                        <div 
                          key={idx} 
                          className="flex flex-col items-center group relative cursor-pointer"
                          style={{ top: `${pctFromTop - 50}%` }}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-125 shadow-md flex items-center justify-center ${
                            isOutOfTol 
                              ? 'bg-red-500 border-white ring-2 ring-red-400' 
                              : 'bg-mjm-navy dark:bg-[#f7931b] border-white'
                          }`}>
                            <span className="w-1 h-1 bg-white rounded-full" />
                          </div>

                          {/* Tooltip Hover */}
                          <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-mono p-2 rounded-lg shadow-xl whitespace-nowrap z-30">
                            <p className="font-bold">{item.fecha}</p>
                            <p>Error: {item.error > 0 ? `+${item.error}` : item.error} {unidad}</p>
                            <p className="text-slate-400">Patrón: {item.patron}</p>
                          </div>

                          <span className="text-[9px] font-mono text-slate-500 mt-1">
                            {item.fecha.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabla Resumen de Ensayos del Instrumento */}
          {checks.length > 0 && (
            <div>
              <h4 className="font-mono text-[10.5px] uppercase tracking-wider text-slate-500 mb-2 font-bold">
                Historial de Ensayos de este Activo
              </h4>
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-800/80 font-mono text-[10px] text-slate-500">
                    <tr>
                      <th className="py-2 px-3">Fecha</th>
                      <th className="py-2 px-3">Patrón Usado</th>
                      <th className="py-2 px-3 text-right">Error Encontrado</th>
                      <th className="py-2 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono">
                    {checks.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold">{c.fecha}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{c.patron}</td>
                        <td className={`py-2 px-3 text-right font-bold ${c.error >= 0 ? 'text-blue-600' : 'text-purple-600'}`}>
                          {c.error > 0 ? `+${c.error}` : c.error} {unidad}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            Math.abs(c.error) <= tol 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            {Math.abs(c.error) <= tol ? 'Conforme' : 'No Conforme'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-xs hover:bg-slate-300 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onNewCheck && onNewCheck(instrument.id);
            }}
            className="px-4 py-2 bg-[#f7931b] hover:bg-[#e58212] text-white font-bold font-space text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Nueva Comprobación para este Activo
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── COMPONENTE PRINCIPAL: COMPROBACIÓN METROLÓGICA EN PLANTA ──────────────────
export default function ComprobacionMetrologica() {
  const { tenant, isSuperAdmin } = useAuthStore();
  const { instruments, activities, loadInstruments, loadActivities } = useInventoryStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [plantFilter, setPlantFilter] = useState('ALL');
  
  // Modales
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isMasterLogOpen, setIsMasterLogOpen] = useState(false);
  const [trendModalInst, setTrendModalInst] = useState(null);
  const [selectedInstForCheck, setSelectedInstForCheck] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  useEffect(() => {
    if (tenant) {
      const unsubInst = loadInstruments(tenant.id, isSuperAdmin);
      const unsubAct = loadActivities(tenant.id, isSuperAdmin);
      return () => {
        if (unsubInst) unsubInst();
        if (unsubAct) unsubAct();
      };
    }
  }, [tenant, isSuperAdmin, loadInstruments, loadActivities]);

  // Plantas disponibles para filtrado
  const availablePlants = useMemo(() => {
    const plants = new Set();
    instruments.forEach(i => {
      const p = i.jerarquia?.planta || i.ubicacion;
      if (p) plants.add(p);
    });
    return Array.from(plants);
  }, [instruments]);

  // Métricas reales y unificación de datos
  const verifData = useMemo(() => {
    const vActs = activities.filter(a => (a.tipo || '').toLowerCase().includes('verificaci'));
    
    // Todos los instrumentos con rutinas o que tengan actividades de verificación, o todo el inventario
    const targetInstruments = instruments.filter(i => !i.archivado);

    let totalEnControl = 0;
    let totalEjecutadasMes = 0;
    let totalAlertas = 0;
    let sumaConsumoTol = 0;
    let countEvaluadas = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    targetInstruments.forEach(inst => {
      // Buscar última comprobación realizada
      const historyCheck = (inst.historial || []).find(h => (h.tipo || '').toLowerCase().includes('verificaci'));
      const actCheck = vActs.find(a => a.instrumentId === inst.id && a.estado === 'done');
      const latestCheck = historyCheck || actCheck;

      if (latestCheck) {
        countEvaluadas++;
        const err = parseFloat(latestCheck.error !== undefined ? latestCheck.error : (latestCheck.error_encontrado || 0));
        const tol = parseFloat(inst.tolerancia_proceso) || 0.05;
        const pct = tol > 0 ? (Math.abs(err) / tol) * 100 : 0;
        sumaConsumoTol += pct;

        if (latestCheck.declaracion_conformidad === 'No Conforme' || inst.estado === 'Vencido') {
          totalAlertas++;
        } else {
          totalEnControl++;
        }
      } else {
        if (inst.estado === 'Vencido') {
          totalAlertas++;
        } else {
          totalEnControl++;
        }
      }

      // Verificaciones pendientes vencidas
      const hasOverduePending = vActs.some(a => 
        a.instrumentId === inst.id && 
        a.estado === 'todo' && 
        new Date(a.fechaProgramada) < new Date()
      );
      if (hasOverduePending && !totalAlertas) {
        totalAlertas++;
      }
    });

    // Ejecutadas en el mes corriente
    vActs.forEach(a => {
      if (a.estado === 'done') {
        const d = new Date(a.fechaRealizacion || a.finishedAt || a.fechaProgramada);
        if (!isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          totalEjecutadasMes++;
        }
      }
    });

    // Deriva Media Real (% de tolerancia consumida promedio)
    const derivaPromedio = countEvaluadas > 0 
      ? (sumaConsumoTol / countEvaluadas).toFixed(1) + '%' 
      : '0.0%';

    return {
      instruments: targetInstruments,
      activities: vActs,
      totalEnControl,
      ejecutadasMes: totalEjecutadasMes,
      alertas: totalAlertas,
      desviacionMedia: derivaPromedio
    };
  }, [instruments, activities]);

  // Filtrado de equipos
  const filteredInstruments = useMemo(() => {
    return verifData.instruments.filter(inst => {
      const q = searchTerm.toLowerCase();
      const matchSearch = (inst.nombre || '').toLowerCase().includes(q) ||
                          (inst.codigoMJM || inst.codigo || '').toLowerCase().includes(q) ||
                          (inst.serie || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (plantFilter !== 'ALL') {
        const p = inst.jerarquia?.planta || inst.ubicacion || '';
        if (p !== plantFilter) return false;
      }

      return true;
    });
  }, [verifData.instruments, searchTerm, plantFilter]);

  const handleOpenCheckForInstrument = (instId) => {
    setSelectedInstForCheck(instId);
    setIsCheckModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 selection:bg-[#f7931b]/20">
      
      {/* Toast de Éxito al Registrar */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 font-mono text-xs">
          <CheckCircle size={18} />
          <div>
            <p className="font-bold font-space">Comprobación Registrada Exitosamente</p>
            <p className="text-[10px] opacity-90">
              Error: {successToast.errorVal} {successToast.newCheckLog?.unidad} • {successToast.consumoPct}% MPE ({successToast.declaracion})
            </p>
          </div>
          <button onClick={() => setSuccessToast(null)} className="ml-2 opacity-80 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Industrial */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-1.5">
             <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono font-medium uppercase tracking-wider border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5">
               <ShieldCheck size={12} className="text-[#f7931b]" />
               Protocolo Táctico ISO 10012:2003
             </span>
             <span className="text-[10px] font-mono text-slate-400">• Cláusula 7.1.5.2 ISO 9001</span>
           </div>
           <h1 className="font-space font-bold text-slate-900 dark:text-white text-2xl md:text-3xl tracking-tight">
             Comprobación Metrológica <span className="text-mjm-navy dark:text-[#f7931b]">en Planta</span>
           </h1>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-normal leading-relaxed">
             Verificación periódica con patrones de referencia internos para asegurar la aptitud de uso y detectar desviaciones antes de la calibración formal.
           </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsMasterLogOpen(true)}
            className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <History size={14} className="text-slate-400" /> Registro Maestro
          </button>
          <button 
            onClick={() => {
              setSelectedInstForCheck(null);
              setIsCheckModalOpen(true);
            }}
            className="px-4 py-2 bg-mjm-navy hover:bg-[#1a3857] text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus size={15} /> Nueva Comprobación
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ClipboardCheck, label: 'En Control', val: verifData.totalEnControl, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { icon: CheckCircle, label: 'Ejecutadas (Mes)', val: verifData.ejecutadasMes, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { icon: TrendingUp, label: 'Consumo MPE Promedio', val: verifData.desviacionMedia, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { icon: AlertCircle, label: 'Alertas / Vencidos', val: verifData.alertas, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' }
        ].map((k, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex items-center gap-4 transition-all">
            <div className={`p-3 ${k.bg} ${k.color} rounded-lg shrink-0`}>
              <k.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">{k.label}</p>
              <p className="text-2xl font-bold font-space text-slate-900 dark:text-white leading-none tracking-tight">{k.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Toolbar & Filter by Plant */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Buscar por instrumento, código MJM o serie..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-mjm-navy dark:focus:border-[#f7931b] transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dropdown Filtro por Planta */}
        <div className="relative w-full sm:w-auto shrink-0">
          <select
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm focus:outline-none"
          >
            <option value="ALL">Todas las Plantas / Áreas ({instruments.length})</option>
            {availablePlants.map((plant, idx) => (
              <option key={idx} value={plant}>{plant}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Verification Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredInstruments.map((item) => {
          // Obtener la comprobación más reciente
          const historyCheck = (item.historial || []).find(h => (h.tipo || '').toLowerCase().includes('verificaci'));
          const actCheck = verifData.activities.find(a => a.instrumentId === item.id && a.estado === 'done');
          const lastVerif = historyCheck || actCheck;

          const nextVerif = verifData.activities.find(a => a.instrumentId === item.id && a.estado === 'todo');
          const isOverdue = item.estado === 'Vencido' || (nextVerif && new Date(nextVerif.fechaProgramada) < new Date());

          // Datos reales de tolerancia y error
          const tolVal = parseFloat(item.tolerancia_proceso) || 0.05;
          const unidadMedida = item.unidad_medida || 'mm';
          
          let errorVal = null;
          let consumptionPct = 0;

          if (lastVerif) {
            errorVal = parseFloat(lastVerif.error !== undefined ? lastVerif.error : (lastVerif.error_encontrado || 0));
            consumptionPct = tolVal > 0 ? Math.min(999, Math.round((Math.abs(errorVal) / tolVal) * 100)) : 0;
          }

          const hasChecks = lastVerif !== undefined && lastVerif !== null;

          return (
            <div 
              key={item.id} 
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Encabezado de la Ficha */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                        isOverdue 
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOverdue ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {isOverdue ? 'VENCIDO' : 'EN CONTROL'}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-mono font-medium border border-slate-200 dark:border-zinc-700">
                        {item.magnitud || 'General'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-space text-slate-900 dark:text-white group-hover:text-mjm-navy dark:group-hover:text-[#f7931b] transition-colors">
                      {item.nombre}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {item.codigoMJM || item.codigo || 'S/N'} <span className="text-slate-300 dark:text-zinc-700">•</span> Serie: {item.serie || 'INTERNO'}
                    </p>
                  </div>
                  
                  {/* Próxima Verificación */}
                  <div className="bg-slate-50 dark:bg-zinc-800/70 px-3.5 py-2.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 text-left sm:text-right shrink-0">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Próxima en Planta</p>
                    <div className="flex items-center sm:justify-end gap-1.5 text-slate-900 dark:text-white font-mono font-bold text-sm mt-0.5">
                      <Clock size={13} className="text-[#f7931b]" />
                      <span>{nextVerif?.fechaProgramada || 'Pte. Programar'}</span>
                    </div>
                  </div>
                </div>

                {/* Comparador Técnico MPE vs Error Real */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Patrón de Referencia</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {lastVerif?.patron_referencia || lastVerif?.patron || 'Patrón Interno Cal-Ref'}
                      </p>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                      Cert: {lastVerif?.certificado || 'Trazable INM'}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Error / MPE</span>
                      <span className={`text-[10px] font-mono font-semibold ${
                        consumptionPct <= 75 ? 'text-emerald-600 dark:text-emerald-400' : consumptionPct <= 100 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {hasChecks ? `${consumptionPct}% MPE` : 'Sin ensayos'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-baseline mb-2 font-mono">
                      <span className={`text-sm font-bold ${
                        !hasChecks ? 'text-slate-400 text-xs' : errorVal >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600'
                      }`}>
                        {hasChecks ? `${errorVal > 0 ? `+${errorVal}` : errorVal} ${unidadMedida}` : 'Pendiente comprobación'}
                      </span>
                      <span className="text-xs text-slate-400">Tol: ±{tolVal} {unidadMedida}</span>
                    </div>

                    {/* Barra de Consumo de Tolerancia */}
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          consumptionPct <= 75 ? 'bg-emerald-500' : consumptionPct <= 100 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${hasChecks ? Math.min(100, consumptionPct) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie de Tarjeta con Acciones Operativas */}
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <History size={13} /> Última: {lastVerif?.fecha || lastVerif?.fechaRealizacion || 'Sin registro'}
                </span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenCheckForInstrument(item.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    <Plus size={12} /> Comprobar
                  </button>
                  <button 
                    onClick={() => setTrendModalInst(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f7931b] hover:bg-[#e58212] text-white font-semibold text-xs rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Comparar <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Industrial Discreto */}
      <div className="pt-8 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600 text-[10px] font-mono tracking-wider uppercase">
        <span>ISO 10012:2003</span>
        <span>•</span>
        <span>MJM Metrología Digital Core</span>
      </div>

      {/* --- MODALES INYECTADOS --- */}
      <NewCheckModal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        instruments={instruments}
        preselectedId={selectedInstForCheck}
        onSuccess={(res) => setSuccessToast(res)}
      />

      <MasterLogModal
        isOpen={isMasterLogOpen}
        onClose={() => setIsMasterLogOpen(false)}
        instruments={instruments}
        activities={activities}
      />

      <TrendChartModal
        isOpen={Boolean(trendModalInst)}
        onClose={() => setTrendModalInst(null)}
        instrument={trendModalInst}
        onNewCheck={(id) => handleOpenCheckForInstrument(id)}
      />

    </div>
  );
}
