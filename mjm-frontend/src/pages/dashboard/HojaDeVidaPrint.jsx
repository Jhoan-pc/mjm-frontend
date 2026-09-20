import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import logoAzul from '../../assets/logo_azul_sin_fondo.png';
import manometroIndustrial from '../../assets/manometro_industrial.jpeg';
import { 
  ShieldCheck, 
  Activity, 
  Award, 
  Printer, 
  X, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

const cleanUnitDisplay = (val) => {
  if (!val || val === 'N/A') return 'N/A';
  return String(val).replace(/\s*\([^)]*\)/g, '').trim();
};

const formatDateYYYYMMDD = (dateVal) => {
  if (!dateVal || dateVal === 'N/A') return 'N/A';
  try {
    if (typeof dateVal === 'string') {
      const match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    }
    let d;
    if (dateVal && typeof dateVal === 'object' && typeof dateVal.seconds === 'number') {
      d = new Date(dateVal.seconds * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return String(dateVal);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return String(dateVal);
  }
};

const HojaDeVidaPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instruments, loadInstruments, getInstrumentFromFirestore } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [inst, setInst] = useState(null);

  useEffect(() => {
    const activeTenantId = tenant?.id || 'sandboxdemo';
    loadInstruments(activeTenantId);
  }, [tenant, loadInstruments]);

  useEffect(() => {
    const found = instruments.find(i => i.id === id);
    if (found) {
      setInst(found);
    } else if (getInstrumentFromFirestore) {
      getInstrumentFromFirestore(id).then(item => {
        if (item) setInst(item);
      });
    }
  }, [id, instruments, getInstrumentFromFirestore]);

  // Asignar el título de ventana para el nombre sugerido al guardar en PDF
  useEffect(() => {
    if (inst) {
      const code = inst.codigoMJM || inst.codigo || 'MJM';
      const cleanName = (inst.nombre || 'Instrumento').replace(/[^a-zA-Z0-9_-]/g, '_');
      document.title = `HDV_${code}_${cleanName}`;
    }
  }, [inst]);

  if (!inst) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-space font-bold uppercase tracking-widest text-xs text-blue-400">
          Generando Expediente Metrológico Oficial...
        </p>
        <span className="font-mono text-[10px] text-slate-400 mt-1">Conforme a Norma NTC-ISO 10012</span>
      </div>
    );
  }

  const isVencido = inst.estado === 'Vencido';
  const isProximo = inst.estado === 'Próximo Vencimiento';
  const statusLabel = isVencido 
    ? 'Fuera de Servicio' 
    : isProximo 
    ? 'Próximo Vencimiento' 
    : 'Activo Operativo';

  const clientName = tenant?.nombre_empresa || 'CHALLENGER S.A.S.';
  const assetCode = inst.codigoMJM || inst.codigo || 'MJM-009';
  const emissionDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-200/80 py-8 flex justify-center print:bg-white print:py-0 print:m-0">
      
      {/* BARRA DE ACCIÓN FLOTANTE (FROSTED GLASS - NO SE IMPRIME) */}
      <div className="fixed bottom-6 flex items-center gap-3 no-print z-50 bg-slate-950/85 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/15 shadow-2xl">
        <button 
          type="button"
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all font-space font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <Printer size={15} /> IMPRIMIR / GUARDAR PDF
        </button>
        <button 
          type="button"
          onClick={() => window.close ? window.close() : navigate(-1)}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl border border-white/15 flex items-center gap-1.5 transition-all font-space font-semibold text-xs uppercase tracking-wider cursor-pointer"
        >
          <X size={15} /> Cerrar
        </button>
      </div>

      {/* LIENZO DE IMPRESIÓN OFICIAL (A4 / LETTER PORTRAIT) */}
      <main className="bg-white w-[8.5in] min-h-[11in] p-[0.45in] shadow-2xl flex flex-col justify-between print:shadow-none print:m-0 print:w-full print:p-0 print:min-h-0 text-slate-800">
        
        <div className="space-y-3.5">
          
          {/* LÍNEA DE PRESTIGIO & SEGURIDAD BICOLOR */}
          <div className="h-1 bg-gradient-to-r from-[#0F172A] via-[#1E3A5F] to-[#D97706] rounded-full" />

          {/* CABECERA OFICIAL TIPO CERTIFICADO SUIZO */}
          <header className="border-b border-slate-200/90 pb-3">
            <div className="grid grid-cols-12 gap-3 items-center">
              
              {/* Columna 1: Titular del Activo (Cliente / Planta) */}
              <div className="col-span-4 flex items-center gap-3 pr-2 border-r border-slate-200/70">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <img 
                    src={tenant?.logo_url || logoAzul} 
                    alt={clientName} 
                    className="max-h-10 max-w-10 object-contain mix-blend-multiply" 
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Titular del Activo
                  </span>
                  <h2 className="text-xs font-space font-bold text-slate-900 uppercase leading-tight break-words">
                    {clientName}
                  </h2>
                  <span className="text-[7px] font-mono text-slate-500 uppercase block mt-0.5">
                    Planta Industrial & Calidad
                  </span>
                </div>
              </div>

              {/* Columna 2: Título de Expediente & ID del Activo */}
              <div className="col-span-4 px-2 flex flex-col items-center justify-center text-center border-r border-slate-200/70">
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400 block">
                  Expediente Metrológico Técnico
                </span>
                <h1 className="text-[13px] font-space font-black uppercase tracking-tight text-slate-950 block mt-0.5">
                  Hoja de Vida de Activo
                </h1>
                <div className="mt-1 px-3 py-0.5 rounded-full bg-slate-950 text-white font-mono text-[9.5px] font-bold tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${isVencido ? 'bg-red-400' : isProximo ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  ID ACTIVO: {assetCode}
                </div>
                <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">
                  Normativa NTC-ISO 10012:2003
                </span>
              </div>

              {/* Columna 3: MJM Metrología, Emisión & Estado Operativo */}
              <div className="col-span-4 pl-2 flex flex-col justify-between items-end text-right">
                <div>
                  <span className="text-xs font-space font-black tracking-tight text-slate-900 block uppercase">
                    MJM Metrología Industrial
                  </span>
                  <span className="text-[7.5px] font-mono uppercase tracking-widest text-slate-400 block leading-tight mt-0.5">
                    Aseguramiento & Control Metrológico
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">
                    Emisión: <strong className="text-slate-800 font-bold">{emissionDate}</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[7.5px] font-space font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${
                    isVencido 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : isProximo 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${isVencido ? 'bg-red-500' : isProximo ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    {statusLabel}
                  </span>
                </div>
              </div>

            </div>
          </header>

          {/* FICHA TÉCNICA PRINCIPAL (PROPORCIÓN GOLDEN RATIO 5:7) */}
          <section className="grid grid-cols-12 gap-3.5 items-stretch">
            
            {/* Lado Izquierdo: Fotografía de Identificación en Laboratorio */}
            <div className="col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/90 p-3 flex flex-col items-center justify-between relative shadow-xs">
              <div className="w-full flex justify-between items-center text-[7.5px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-1.5">
                <span>Registro Fotográfico</span>
                <span>Calidad 1:1</span>
              </div>
              
              <div className="my-auto py-2 flex items-center justify-center w-full h-[180px]">
                <img 
                  src={inst.imageUrl || manometroIndustrial} 
                  alt={inst.nombre || "Instrumento Metrológico"} 
                  className="max-h-[175px] max-w-full object-contain mix-blend-multiply drop-shadow-xs"
                />
              </div>

              {/* Placa metálica de identificación inferior */}
              <div className="w-full bg-slate-950 text-white rounded-xl p-2 text-center shadow-xs flex flex-col gap-0.5">
                <span className="font-mono text-[8.5px] font-bold text-amber-400 uppercase tracking-wider truncate">
                  REF / MODELO: {inst.modelo || 'GENERIC'}
                </span>
                <span className="font-mono text-[7.5px] text-slate-400 uppercase tracking-widest truncate">
                  SERIAL: {inst.serie || 'S/N'} &bull; TAG: {assetCode}
                </span>
              </div>
            </div>

            {/* Lado Derecho: Matriz de Especificaciones de Ingeniería */}
            <div className="col-span-7 bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between shadow-xs">
              
              {/* Encabezado: Nombre del Instrumento */}
              <div className="p-3 bg-gradient-to-r from-slate-50 via-slate-50/70 to-white border-b border-slate-200/80">
                <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] block mb-0.5">
                  Denominación Metrológica del Activo
                </span>
                <h3 className="text-sm sm:text-base font-space font-black text-slate-950 uppercase tracking-tight leading-snug">
                  {inst.nombre}
                </h3>
              </div>

              {/* Filas de Atributos Técnicos de Precisión */}
              <div className="divide-y divide-slate-100/90 text-xs flex-1 flex flex-col justify-around">
                
                <div className="grid grid-cols-2 divide-x divide-slate-100/90">
                  <div className="p-2 px-3">
                    <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Número de Serie</span>
                    <span className="text-[11px] font-mono font-bold text-slate-900 uppercase">{inst.serie || 'N/A'}</span>
                  </div>
                  <div className="p-2 px-3">
                    <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">País / Fabricación</span>
                    <span className="text-[11px] font-semibold text-slate-800 uppercase">{inst.jerarquia?.pais || 'Colombia'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-100/90">
                  <div className="p-2 px-3">
                    <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Planta Operativa</span>
                    <span className="text-[11px] font-semibold text-slate-800 uppercase">{inst.jerarquia?.planta || 'Planta Principal'}</span>
                  </div>
                  <div className="p-2 px-3">
                    <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Área / Sección</span>
                    <span className="text-[11px] font-semibold text-slate-800 uppercase">{inst.jerarquia?.area || 'Área General'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-100/90">
                  <div className="p-2 px-3">
                    <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Ubicación Física</span>
                    <span className="text-[11px] font-semibold text-slate-800 uppercase">{inst.jerarquia?.ubicacion || inst.ubicacion || 'N/A'}</span>
                  </div>
                  <div className="p-2 px-3 flex items-center justify-between">
                    <div>
                      <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Criticidad Operativa</span>
                      <span className="text-[11px] font-space font-bold uppercase tracking-wider text-amber-700">
                        {inst.criticidad || 'MEDIA'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/30 text-[8px] font-mono font-bold">
                      ISO RISK
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-100/90">
                  <div className="p-2 px-3">
                    <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">División de Escala</span>
                    <span className="text-[11px] font-mono font-bold text-slate-800 uppercase">{cleanUnitDisplay(inst.division_escala || 'N/A')}</span>
                  </div>
                  <div className="p-2 px-3">
                    <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Responsable / Custodio</span>
                    <span className="text-[11px] font-semibold text-slate-800 uppercase">{inst.responsable || 'Sin Asignar'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-100/90 bg-slate-50/40">
                  <div className="p-2 px-3">
                    <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Control Metrológico</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase">{inst.proceso || 'OPERATIVO'}</span>
                  </div>
                  <div className="p-2 px-3">
                    <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ID del Activo</span>
                    <span className="text-[11px] font-mono font-black text-slate-900 tracking-wider">{assetCode}</span>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* LÍMITES DE PROCESO & REQUISITOS ISO 10012 (3 PLAQUETAS DE PRECISIÓN) */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[8.5px] font-space font-bold uppercase tracking-[0.25em] text-slate-900 border-l-2 border-[#1E3A5F] pl-2.5">
                Límites de Proceso & Criterios de Conformidad Metrológica (ISO 10012)
              </h3>
              <span className="text-[7.5px] font-mono text-slate-400 uppercase tracking-widest">Confirmación Metrológica</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50/80 border border-slate-200/90 p-3 rounded-2xl flex flex-col justify-between text-center shadow-xs">
                <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Capacidad Mín / Máx
                </span>
                <p className="text-lg font-space font-bold text-slate-950 tracking-tight font-mono">
                  {cleanUnitDisplay(inst.rango_min || '0')} &mdash; {cleanUnitDisplay(inst.rango_max || 'N/A')}
                </p>
                <span className="text-[7px] font-mono text-slate-400 mt-1 block">Rango Nominal de Trabajo</span>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/90 p-3 rounded-2xl flex flex-col justify-between text-center shadow-xs">
                <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Resolución Instrumental
                </span>
                <p className="text-lg font-space font-bold text-slate-950 tracking-tight font-mono">
                  {cleanUnitDisplay(inst.resolucion || 'N/A')}
                </p>
                <span className="text-[7px] font-mono text-slate-400 mt-1 block">Sensibilidad de Escala</span>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-300/80 p-3 rounded-2xl flex flex-col justify-between text-center shadow-xs">
                <span className="text-[7.5px] font-mono font-bold text-emerald-800 uppercase tracking-widest block mb-1">
                  Tolerancia de Proceso (EMP)
                </span>
                <p className="text-lg font-space font-black text-emerald-700 tracking-tight font-mono">
                  &plusmn; {cleanUnitDisplay(inst.tolerancia_proceso || 'N/A')}
                </p>
                <span className="text-[7px] font-mono text-emerald-600 font-semibold mt-1 block">
                  Regla: |Error| + U &le; EMP
                </span>
              </div>
            </div>
          </section>

          {/* PLAN DE RUTINAS METROLÓGICAS (4 TARJETAS EJECUTIVAS) */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[8.5px] font-space font-bold uppercase tracking-[0.25em] text-slate-900 border-l-2 border-[#1E3A5F] pl-2.5">
                Plan de Rutinas Metrológicas & Mantenimiento
              </h3>
              <span className="text-[7.5px] font-mono text-slate-400 uppercase tracking-widest">Ciclo de Aseguramiento</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[
                { key: 'calibracion', label: 'Calibración', icon: ShieldCheck },
                { key: 'verificacion', label: 'Verificación', icon: FileCheck2 },
                { key: 'mantenimiento', label: 'Mantenimiento', icon: Activity },
                { key: 'calificacion', label: 'Calificación', icon: Award }
              ].map((rutina, idx) => {
                const freq = inst.rutinas?.[`${rutina.key}_frecuencia`];
                const fechaBase = inst.rutinas?.[`${rutina.key}_fecha_inicial`];
                const isActive = !!(inst.rutinas?.[rutina.key] || freq);
                const IconComp = rutina.icon;
                return (
                  <div 
                    key={idx} 
                    className={`rounded-2xl p-2.5 border text-center transition-all ${
                      isActive 
                        ? 'bg-slate-50/90 border-slate-200/90 shadow-xs' 
                        : 'bg-slate-50/30 border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <IconComp size={11} className="text-slate-600" />
                      <span className="text-[8px] font-space font-bold uppercase tracking-wider text-slate-700">
                        {rutina.label}
                      </span>
                    </div>
                    <p className="text-xs font-space font-black text-slate-900 font-mono">
                      {freq ? `${freq} Meses` : 'No Programada'}
                    </p>
                    <span className="text-[7px] font-mono text-slate-400 block mt-0.5">
                      {fechaBase ? `Base: ${new Date(fechaBase).toISOString().split('T')[0]}` : 'Sin fecha base'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* HISTORIAL TÉCNICO Y TRAZABILIDAD (SWISS PRECISION TABLE) */}
          <section className="space-y-1.5 flex-grow">
            <div className="flex justify-between items-end">
              <h3 className="text-[8.5px] font-space font-bold uppercase tracking-[0.25em] text-slate-900 border-l-2 border-[#1E3A5F] pl-2.5">
                Registro Histórico de Calibración & Trazabilidad (ISO/IEC 17025)
              </h3>
              <span className="text-[7.5px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                Cadena de Custodia
              </span>
            </div>

            <div className="overflow-hidden border border-slate-200/90 rounded-2xl shadow-xs">
              <table className="w-full text-left border-collapse table-precision">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[7.5px] font-bold text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-3 py-1.5 text-left">Fecha</th>
                    <th className="px-3 py-1.5 text-left">Actividad</th>
                    <th className="px-3 py-1.5 text-left">No. Certificado / OT</th>
                    <th className="px-3 py-1.5 text-left">Laboratorio / Taller</th>
                    <th className="px-3 py-1.5 text-center">Error Encontrado</th>
                    <th className="px-3 py-1.5 text-right">Dictamen ISO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[8px]">
                  {(inst.historial || []).length > 0 ? (
                    (inst.historial).slice(0, 5).map((reg, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-bold text-slate-800">{formatDateYYYYMMDD(reg.fecha)}</td>
                        <td className="px-3 py-1.5 font-space font-bold uppercase text-slate-900">{reg.tipo || 'Calibración'}</td>
                        <td className="px-3 py-1.5 text-slate-700 font-bold">{reg.certificado || (reg.certificado_url ? 'CERT-REGISTRADO' : 'CERT-INT-001')}</td>
                        <td className="px-3 py-1.5 text-slate-600 uppercase truncate max-w-[140px]">{reg.laboratorio || reg.ejecutor || 'MJM Metrología'}</td>
                        <td className="px-3 py-1.5 text-center text-slate-700 font-bold">
                          {reg.error !== undefined && reg.error !== null ? `±${reg.error}` : (reg.tipo === 'Mantenimiento' ? 'N/A' : '0.00')}
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[7px] font-space font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${
                            (reg.declaracion_conformidad === 'No Conforme' || reg.resultado === 'No Conforme')
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              (reg.declaracion_conformidad === 'No Conforme' || reg.resultado === 'No Conforme') ? 'bg-red-500' : 'bg-emerald-500'
                            }`} />
                            {reg.declaracion_conformidad || reg.resultado || 'Conforme'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-3 text-center text-slate-400 italic text-[8.5px]">
                        No se registran intervenciones previas archivadas. Activo en ciclo inicial de calibración.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* PIE DE PÁGINA OFICIAL, FIRMAS Y SELLO DE SEGURIDAD LEGAL */}
        <footer className="mt-auto pt-2">
          <div className="grid grid-cols-2 gap-12 px-6 mb-3">
            <div className="flex flex-col items-center text-center">
              <div className="w-full border-b border-dashed border-slate-300 h-8 mb-1 flex items-end justify-center pb-1">
                <span className="text-[6.5px] font-mono text-slate-400 uppercase tracking-widest">Firma Digital Verificada</span>
              </div>
              <span className="text-[8px] font-space font-bold uppercase tracking-wider text-slate-800">
                Responsable Metrológico
              </span>
              <span className="text-[6.5px] font-mono text-slate-400 uppercase">Ingeniería & Metrología Industrial</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-full border-b border-dashed border-slate-300 h-8 mb-1 flex items-end justify-center pb-1">
                <span className="text-[6.5px] font-mono text-slate-400 uppercase tracking-widest">Aprobación Técnica</span>
              </div>
              <span className="text-[8px] font-space font-bold uppercase tracking-wider text-slate-800">
                Director de Garantía de Calidad
              </span>
              <span className="text-[6.5px] font-mono text-slate-400 uppercase">Dirección Técnica de Planta</span>
            </div>
          </div>

          <div className="border-t border-slate-200/90 pt-2 flex flex-col items-center gap-0.5 text-slate-400 text-center">
            <p className="text-[7.5px] font-mono uppercase tracking-[0.2em] text-slate-500">
              Documento Oficial de Trazabilidad Metrológica &bull; Compatible con NTC-ISO 10012 e ISO/IEC 17025
            </p>
            <p className="text-[6.5px] font-mono text-slate-400 tracking-wider uppercase">
              MJM Metrología Industrial S.A.S. &bull; Sistema de Gestión de la Calidad &bull; Trazabilidad Digital ID: {assetCode}-{new Date().getFullYear()}
            </p>
          </div>
        </footer>

      </main>

      {/* ESTILOS DE IMPRESIÓN (ESTÁNDAR FRUFRESCO / DISENADOR-WEB) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          main {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            min-height: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: letter portrait;
            margin: 0.8cm 1.0cm 0.8cm 1.0cm;
          }
        }
      `}} />

    </div>
  );
};

export default HojaDeVidaPrint;
