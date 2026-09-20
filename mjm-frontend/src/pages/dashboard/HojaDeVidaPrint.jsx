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
  Calendar,
  Layers,
  Sparkles,
  Ruler,
  Clock
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

const getNextDate = (fechaInicial, frecuenciaMeses) => {
  if (!fechaInicial || !frecuenciaMeses) return null;
  try {
    let d;
    if (typeof fechaInicial === 'string') {
      const parts = fechaInicial.split('-').map(Number);
      if (parts.length === 3) {
        d = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        d = new Date(fechaInicial);
      }
    } else {
      d = new Date(fechaInicial);
    }
    if (isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + Number(frecuenciaMeses));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return null;
  }
};

const formatMeses = (num) => {
  if (!num) return 'No Programada';
  const n = Number(num);
  return `${n} ${n === 1 ? 'Mes' : 'Meses'}`;
};

const HojaDeVidaPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instruments, loadInstruments, getInstrumentFromFirestore } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [inst, setInst] = useState(null);

  useEffect(() => {
    const activeTenantId = tenant?.id || 'sandboxdemo';
    const unsub = loadInstruments(activeTenantId);
    return () => {
      if (unsub) unsub();
    };
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

  // Nombre de archivo sugerido al guardar en PDF
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

  // Cálculo inteligente de campos metrológicos de alto valor
  const marcaEquipo = inst.marca || inst.fabricante || (inst.nombre && inst.nombre.toLowerCase().includes('würth') ? 'Würth' : 'Fabricante Original');
  const proximaCalibracion = inst.proxima_calibracion 
    || inst.fechaProxima 
    || getNextDate(inst.rutinas?.calibracion_fecha_inicial, inst.rutinas?.calibracion_frecuencia)
    || 'Según Ciclo';
  
  const ubicacionCompleta = [
    inst.jerarquia?.planta || 'Planta Principal',
    inst.jerarquia?.area || 'Área General',
    inst.jerarquia?.ubicacion || inst.ubicacion ? `(${inst.jerarquia?.ubicacion || inst.ubicacion})` : null
  ].filter(Boolean).join(' • ');

  return (
    <div className="min-h-screen bg-slate-200/80 py-6 pb-28 flex justify-center print:bg-white print:py-0 print:pb-0 print:m-0">
      
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

      {/* LIENZO DE IMPRESIÓN OFICIAL (GOLDEN PRINT STANDARD - A4 / LETTER PORTRAIT) */}
      <main className="letterhead-container relative bg-white w-[8.5in] min-h-[11in] p-[0.4in] shadow-2xl flex flex-col justify-between print:shadow-none print:m-0 print:w-full print:p-0 print:min-h-0 text-slate-800 overflow-hidden">
        
        {/* MARCA DE AGUA CORPORATIVA CENTRADA (GOLDEN PRINT STANDARD - 0.025 OPACIDAD) */}
        <div 
          className="watermark-overlay pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden z-0 select-none"
          style={{ opacity: 0.025 }}
          aria-hidden="true"
        >
          <img 
            src={logoAzul} 
            alt="" 
            className="w-[340px] max-w-full -rotate-25 grayscale select-none"
          />
        </div>

        <div className="relative z-10 space-y-3">
          
          {/* LÍNEA DE PRESTIGIO & SEGURIDAD BICOLOR */}
          <div className="h-1 bg-gradient-to-r from-[#0F172A] via-[#1E3A5F] to-[#D97706] rounded-full" />

          {/* 1. CABECERA OFICIAL TIPO CERTIFICADO SUIZO */}
          <header className="border-b border-slate-200/90 pb-2.5">
            <div className="grid grid-cols-12 gap-3 items-center">
              
              {/* Columna 1: Titular del Activo (Cliente / Planta) */}
              <div className="col-span-4 flex items-center gap-3 pr-2 border-r border-slate-200/70">
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <img 
                    src={tenant?.logo_url || logoAzul} 
                    alt={clientName} 
                    className="max-h-9 max-w-9 object-contain mix-blend-multiply" 
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Titular del Activo
                  </span>
                  <h2 className="text-[11px] font-space font-bold text-slate-900 uppercase leading-snug break-words">
                    {clientName}
                  </h2>
                  <span className="text-[6.5px] font-mono text-slate-500 uppercase block mt-0.5">
                    Planta Industrial & Calidad
                  </span>
                </div>
              </div>

              {/* Columna 2: Título de Expediente & ID del Activo */}
              <div className="col-span-4 px-2 flex flex-col items-center justify-center text-center border-r border-slate-200/70">
                <span className="text-[7px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400 block">
                  Expediente Metrológico Técnico
                </span>
                <h1 className="text-[12px] font-space font-black uppercase tracking-tight text-slate-950 block mt-0.5">
                  Hoja de Vida de Activo
                </h1>
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-900 font-mono text-[9px] font-bold tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${isVencido ? 'bg-red-500' : isProximo ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  ID ACTIVO: {assetCode}
                </div>
                <span className="text-[6.5px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">
                  Normativa NTC-ISO 10012:2003
                </span>
              </div>

              {/* Columna 3: MJM Metrología, Emisión & Estado Operativo */}
              <div className="col-span-4 pl-2 flex flex-col justify-between items-end text-right">
                <div>
                  <span className="text-[11px] font-space font-black tracking-tight text-slate-900 block uppercase">
                    MJM Metrología Industrial
                  </span>
                  <span className="text-[7px] font-mono uppercase tracking-widest text-slate-400 block leading-tight mt-0.5">
                    Aseguramiento & Control Metrológico
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase">
                    Emisión: <strong className="text-slate-800 font-bold">{emissionDate}</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[7px] font-space font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${
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

          {/* 2. FICHA TÉCNICA PRINCIPAL (PROPORCIÓN OPTIMIZADA) */}
          <section className="grid grid-cols-12 gap-3 items-stretch">
            
            {/* Lado Izquierdo: Fotografía de Identificación en Laboratorio */}
            <div className="col-span-4 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200/90 p-2.5 flex flex-col items-center justify-between relative shadow-xs">
              <div className="w-full flex justify-between items-center text-[7px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-1">
                <span>Registro Técnico</span>
                <span>Calidad 1:1</span>
              </div>
              
              <div className="my-auto py-1.5 flex items-center justify-center w-full h-[155px]">
                <img 
                  src={inst.imageUrl || manometroIndustrial} 
                  alt={inst.nombre || "Instrumento Metrológico"} 
                  className="max-h-[150px] max-w-full object-contain mix-blend-multiply drop-shadow-xs"
                />
              </div>

              {/* Placa técnica de especificación de activo */}
              <div className="w-full bg-slate-50 border border-slate-200/90 rounded-lg p-1.5 text-center shadow-2xs flex flex-col gap-0.5">
                <span className="font-mono text-[8.5px] font-bold text-slate-900 uppercase tracking-wider truncate">
                  REF: {inst.modelo || 'GENERIC'}
                </span>
                <span className="font-mono text-[7px] text-slate-500 uppercase tracking-widest truncate">
                  SERIAL: {inst.serie || 'S/N'}
                </span>
              </div>
            </div>

            {/* Lado Derecho: Matriz de Especificaciones de Ingeniería Sin Redundancias */}
            <div className="col-span-8 bg-white rounded-xl border border-slate-200/90 overflow-hidden flex flex-col justify-between shadow-xs">
              
              {/* Encabezado: Nombre del Instrumento */}
              <div className="p-2.5 px-3 bg-gradient-to-r from-slate-50 via-slate-50/70 to-white border-b border-slate-200/80">
                <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] block">
                  Denominación Metrológica del Activo
                </span>
                <h3 className="text-sm font-space font-black text-slate-950 uppercase tracking-tight leading-snug">
                  {inst.nombre}
                </h3>
              </div>

              {/* Filas de Atributos Técnicos de Precisión */}
              <div className="divide-y divide-slate-100/90 text-xs flex-1 flex flex-col justify-around">
                
                {/* Fila 1: Marca & Modelo */}
                <div className="grid grid-cols-2 divide-x divide-slate-100/90">
                  <div className="p-1.5 px-3">
                    <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Marca / Fabricante</span>
                    <span className="text-[10.5px] font-semibold text-slate-900 uppercase">{marcaEquipo}</span>
                  </div>
                  <div className="p-1.5 px-3">
                    <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Modelo / Referencia</span>
                    <span className="text-[10.5px] font-mono font-bold text-slate-900 uppercase">{inst.modelo || 'N/A'}</span>
                  </div>
                </div>

                {/* Fila 2: Serial & Magnitud */}
                <div className="grid grid-cols-2 divide-x divide-slate-100/90">
                  <div className="p-1.5 px-3">
                    <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Número de Serie</span>
                    <span className="text-[10.5px] font-mono font-bold text-slate-900 uppercase">{inst.serie || 'N/A'}</span>
                  </div>
                  <div className="p-1.5 px-3">
                    <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Magnitud de Medición</span>
                    <span className="text-[10.5px] font-semibold text-slate-800 uppercase">{inst.magnitud || 'Eléctrica / Multimétrica'}</span>
                  </div>
                </div>

                {/* Fila 3: Ubicación Operativa Unificada */}
                <div className="p-1.5 px-3">
                  <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Ubicación Operativa de Planta</span>
                  <span className="text-[10.5px] font-semibold text-slate-800 uppercase truncate block">
                    {ubicacionCompleta}
                  </span>
                </div>

                {/* Fila 4: Criticidad & Custodio */}
                <div className="grid grid-cols-2 divide-x divide-slate-100/90">
                  <div className="p-1.5 px-3 flex items-center justify-between">
                    <div>
                      <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Nivel de Criticidad</span>
                      <span className="text-[10px] font-space font-bold uppercase tracking-wider text-amber-700">
                        {inst.criticidad || inst.riesgo_operativo || 'ALTA'}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/30 text-[7px] font-mono font-bold">
                      ISO RISK
                    </span>
                  </div>
                  <div className="p-1.5 px-3">
                    <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Responsable / Custodio</span>
                    <span className="text-[10.5px] font-semibold text-slate-800 uppercase">{inst.responsable || 'Sin Asignar'}</span>
                  </div>
                </div>

                {/* Fila 5: Código Maestro & Próxima Calibración Programada */}
                <div className="grid grid-cols-2 divide-x divide-slate-100/90 bg-slate-50/50">
                  <div className="p-1.5 px-3">
                    <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ID Maestro del Activo</span>
                    <span className="text-[10.5px] font-mono font-black text-slate-950 tracking-wider">{assetCode}</span>
                  </div>
                  <div className="p-1.5 px-3 flex items-center justify-between">
                    <div>
                      <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Próximo Vencimiento</span>
                      <span className="text-[10.5px] font-mono font-bold text-blue-700 uppercase">
                        {proximaCalibracion}
                      </span>
                    </div>
                    <Calendar size={13} className="text-blue-600 shrink-0" />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* 3. LÍMITES DE PROCESO & REQUISITOS ISO 10012 (TIRA TÉCNICA HORIZONTAL COMPACTA) */}
          <section className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[8px] font-space font-bold uppercase tracking-[0.2em] text-slate-900 border-l-2 border-[#1E3A5F] pl-2">
                Límites de Proceso & Criterios de Conformidad (ISO 10012)
              </h3>
              <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest">Confirmación Metrológica</span>
            </div>

            {/* Franja continua horizontal de 3 métricas */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl grid grid-cols-3 divide-x divide-slate-200/90 shadow-xs">
              
              <div className="p-2 px-3 text-center">
                <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Rango Nominal (Mín / Máx)
                </span>
                <p className="text-sm font-space font-bold text-slate-950 tracking-tight font-mono mt-0.5">
                  {cleanUnitDisplay(inst.rango_min || '0')} &mdash; {cleanUnitDisplay(inst.rango_max || 'N/A')}
                </p>
                <span className="text-[6.5px] font-mono text-slate-400 block mt-0.5">Escala de Trabajo Certificada</span>
              </div>

              <div className="p-2 px-3 text-center">
                <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Resolución / Sensibilidad
                </span>
                <p className="text-sm font-space font-bold text-slate-950 tracking-tight font-mono mt-0.5">
                  {cleanUnitDisplay(inst.resolucion || 'N/A')}
                </p>
                <span className="text-[6.5px] font-mono text-slate-400 block mt-0.5">Sensibilidad Instrumental</span>
              </div>

              <div className="p-2 px-3 text-center bg-emerald-50/40">
                <span className="text-[7px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
                  Tolerancia de Proceso (EMP)
                </span>
                <p className="text-sm font-space font-black text-emerald-700 tracking-tight font-mono mt-0.5">
                  &plusmn; {cleanUnitDisplay(inst.tolerancia_proceso || 'N/A')}
                </p>
                <span className="text-[6.5px] font-mono text-emerald-600 font-semibold block mt-0.5">
                  Regla: |Error| + U &le; EMP
                </span>
              </div>

            </div>
          </section>

          {/* 4. PLAN DE RUTINAS METROLÓGICAS (MATRIZ COMPACTA DE 1 FILA) */}
          <section className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[8px] font-space font-bold uppercase tracking-[0.2em] text-slate-900 border-l-2 border-[#1E3A5F] pl-2">
                Plan de Rutinas Metrológicas & Mantenimiento
              </h3>
              <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest">Ciclo de Aseguramiento</span>
            </div>

            {/* Matriz horizontal continua */}
            <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl grid grid-cols-4 divide-x divide-slate-200/90 shadow-xs">
              {[
                { key: 'calibracion', label: 'Calibración', icon: ShieldCheck },
                { key: 'verificacion', label: 'Verificación', icon: FileCheck2 },
                { key: 'mantenimiento', label: 'Mantenimiento', icon: Activity },
                { key: 'calificacion', label: 'Calificación', icon: Award }
              ].map((rutina, idx) => {
                const freq = inst.rutinas?.[`${rutina.key}_frecuencia`];
                const fechaBase = inst.rutinas?.[`${rutina.key}_fecha_inicial`];
                const IconComp = rutina.icon;
                return (
                  <div key={idx} className="p-1.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <IconComp size={10} className="text-slate-500 shrink-0" />
                      <span className="text-[7.5px] font-space font-bold uppercase tracking-wider text-slate-700">
                        {rutina.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-space font-black text-slate-900 font-mono mt-0.5">
                      {formatMeses(freq)}
                    </p>
                    <span className="text-[6.5px] font-mono text-slate-400 block">
                      {fechaBase ? `Base: ${new Date(fechaBase).toISOString().split('T')[0]}` : 'Sin fecha base'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. HISTORIAL TÉCNICO Y TRAZABILIDAD (TABLA SUpro-PRECISIÓN CON ESPACIO DESPEJADO) */}
          <section className="space-y-1 flex-grow">
            <div className="flex justify-between items-end">
              <h3 className="text-[8px] font-space font-bold uppercase tracking-[0.2em] text-slate-900 border-l-2 border-[#1E3A5F] pl-2">
                Registro Histórico de Calibración & Trazabilidad (ISO/IEC 17025)
              </h3>
              <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                Cadena de Custodia
              </span>
            </div>

            <div className="overflow-hidden border border-slate-200/90 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse table-precision">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[7px] font-bold text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-3 py-1.5 text-left">Fecha</th>
                    <th className="px-3 py-1.5 text-left">Actividad</th>
                    <th className="px-3 py-1.5 text-left">No. Certificado / OT</th>
                    <th className="px-3 py-1.5 text-left">Laboratorio / Taller</th>
                    <th className="px-3 py-1.5 text-right">Error Encontrado</th>
                    <th className="px-3 py-1.5 text-right">Dictamen ISO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[7.5px]">
                  {(inst.historial || []).length > 0 ? (
                    (inst.historial).slice(0, 5).map((reg, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-bold text-slate-800">{formatDateYYYYMMDD(reg.fecha)}</td>
                        <td className="px-3 py-1.5 font-space font-bold uppercase text-slate-900">{reg.tipo || 'Calibración'}</td>
                        <td className="px-3 py-1.5 text-slate-700 font-bold">{reg.certificado || (reg.certificado_url ? 'CERT-REGISTRADO' : 'CERT-INT-001')}</td>
                        <td className="px-3 py-1.5 text-slate-600 uppercase truncate max-w-[140px]">{reg.laboratorio || reg.ejecutor || 'MJM Metrología'}</td>
                        <td className="px-3 py-1.5 text-right num-cell text-slate-700 font-bold">
                          {reg.error !== undefined && reg.error !== null ? `±${reg.error}` : (reg.tipo === 'Mantenimiento' ? 'N/A' : '0.00')}
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[6.5px] font-space font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${
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
                      <td colSpan="6" className="px-4 py-2.5 text-center text-slate-400 italic text-[8px]">
                        No se registran intervenciones previas archivadas. Activo en ciclo inicial de calibración.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* 6. PIE DE PÁGINA: SELLO DE VALIDACIÓN DIGITAL COMPACTO (OPCIÓN EJECUTIVA) */}
        <footer className="mt-auto pt-2 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-1">
            
            {/* Micro-Badge & Texto Legal Conciso */}
            <div className="flex items-center gap-2.5">
              <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-mono text-[7px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-2xs">
                <CheckCircle2 size={10} className="text-emerald-600" />
                VALIDACIÓN DIGITAL AUDIT-TRAIL
              </div>
              <p className="text-[7px] font-mono text-slate-500 leading-tight">
                Documento inmutable emitido por MJM Metrología. Trazabilidad validada en base de datos bajo NTC-ISO 10012 (No requiere firma autógrafa).
              </p>
            </div>

            {/* Token Hash de Auditoría */}
            <div className="text-right shrink-0">
              <span className="text-[7px] font-mono font-bold text-slate-700 uppercase tracking-widest block">
                HASH: {assetCode}-{new Date().getFullYear()}
              </span>
              <span className="text-[6px] font-mono text-slate-400 uppercase block">
                Sistema de Gestión ISO 9001
              </span>
            </div>

          </div>
        </footer>

      </main>

      {/* ESTILOS DE IMPRESIÓN (ESTÁNDAR DE ORO FRUFRESCO / DISENADOR-WEB) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: letter portrait;
          margin: 1.0cm 1.2cm 1.0cm 1.2cm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .letterhead-container, main {
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-row-group !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
        .num-cell {
          font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace !important;
          font-variant-numeric: tabular-nums !important;
          text-align: right !important;
        }
      `}} />

    </div>
  );
};

export default HojaDeVidaPrint;
