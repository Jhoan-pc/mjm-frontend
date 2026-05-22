import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck, Clock, MapPin, Activity, AlertTriangle, Building2, Smartphone as ImageIcon } from 'lucide-react';

const HojaDeVidaPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instruments, loadInstruments } = useInventoryStore();
  const { tenant } = useAuthStore();
  const [inst, setInst] = useState(null);

  useEffect(() => {
    // Asegurar que los instrumentos estén cargados para el tenant actual o el sandbox
    const activeTenantId = tenant?.id || 'deltapruebas-sandbox';
    loadInstruments(activeTenantId);
  }, [tenant]);

  useEffect(() => {
    const found = instruments.find(i => i.id === id);
    if (found) {
      setInst(found);
      // Lanzar impresión automáticamente después de renderizar
      setTimeout(() => {
        // window.print();
      }, 1000);
    }
  }, [id, instruments]);

  if (!inst) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-[var(--primary)]">Generando Reporte Metrológico...</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-10 flex justify-center print:bg-white print:py-0">
      
      {/* Botones de control flotantes (No se imprimen) */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 no-print z-50 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-2xl">
        <button 
          onClick={() => window.print()}
          className="bg-[#1A202C] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all font-black text-[9px] uppercase tracking-widest"
        >
          <Activity size={16} /> IMPRIMIR DOCUMENTO
        </button>
        <button 
          onClick={() => window.close()}
          className="bg-white text-slate-500 px-5 py-3 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2 hover:bg-slate-50 transition-all font-black text-[9px] uppercase tracking-widest"
        >
          CERRAR VISTA
        </button>
      </div>

      {/* CANVAS DE IMPRESIÓN (A4 / Letter) */}
      <main className="bg-white w-[8.5in] min-h-[11in] p-[0.4in] shadow-2xl flex flex-col gap-5 print:shadow-none print:m-0 print:w-full print:p-[0.3in] print:min-h-screen text-slate-800">
        
        {/* CABECERA TIPO CERTIFICADO - 3 COLUMNAS COMPACTAS */}
        <header className="border border-slate-300 rounded-xl overflow-hidden text-[9px] font-mono text-slate-500">
          <div className="grid grid-cols-12 divide-x divide-slate-300">
            {/* Columna 1: Propietario / Cliente (Izquierda) */}
            <div className="col-span-4 p-3 flex flex-col justify-center h-20 bg-slate-50/5">
              <div className="flex items-center gap-3">
                {tenant?.logo_url ? (
                  <img src={tenant.logo_url} alt={tenant.nombre_empresa} className="h-10 max-h-12 object-contain mix-blend-multiply" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                )}
                <span className="text-[12px] font-black text-slate-800 uppercase truncate max-w-[150px]">{tenant?.nombre_empresa || 'CHALLENGER SAS'}</span>
              </div>
            </div>

            {/* Columna 2: Tipo de Doc y ID del Activo (Centro - Centrado X e Y) */}
            <div className="col-span-4 p-3 flex flex-col justify-center items-center text-center h-20 bg-white">
              <span className="font-bold text-slate-800 tracking-wider block uppercase text-[10px]">Hoja de Vida de Activo</span>
              <span className="text-[9px] font-bold text-[#0B1326] tracking-wide block uppercase mt-1">ID ACTIVO: {inst.codigo || inst.codigoMJM || 'N/A'}</span>
            </div>

            {/* Columna 3: MJM Metrología, Emisión y Estado (Derecha) */}
            <div className="col-span-4 p-3 flex flex-col justify-between h-20 text-right items-end bg-slate-50/5">
              <div>
                <span className="font-bold text-slate-800 tracking-wider block">MJM METROLOGÍA</span>
                <span className="text-[7px] text-slate-400 uppercase tracking-widest block leading-tight mt-0.5">Control Metrológico</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] text-slate-400 uppercase font-mono">
                  EMISIÓN: <span className="font-bold text-slate-600">{new Date().toISOString().split('T')[0]}</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider border ${
                  inst.estado === 'Vencido' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : inst.estado === 'Próximo Vencimiento' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {inst.estado || 'Activo'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* INFO TÉCNICA PRINCIPAL */}
        <section className="grid grid-cols-12 gap-8 items-stretch">
          <div className="col-span-5 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative flex items-center justify-center min-h-[240px]">
             <img 
               src={inst.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800"} 
               className="w-full h-full object-contain p-4 mix-blend-multiply"
               alt="Instrumento"
             />
             <div className="absolute bottom-3 left-3 bg-slate-800/90 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[8px] font-mono font-bold text-white uppercase tracking-widest">
                REF: {inst.modelo || 'GENERIC'}
             </div>
          </div>

          <div className="col-span-7 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 flex flex-col justify-between">
            {/* Nombre del Activo */}
            <div className="p-3 bg-slate-50/50 flex-1 flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-0.5">Nombre del Activo / Equipo</span>
              <span className="text-base font-black text-[#0B1326] uppercase tracking-tight block leading-tight">{inst.nombre}</span>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-200 flex-1">
              <div className="p-3 flex flex-col justify-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-0.5">Serial</span>
                <span className="text-xs font-mono font-bold text-slate-800 uppercase">{inst.serie || 'N/A'}</span>
              </div>
              <div className="p-3 flex flex-col justify-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-0.5">Ubicación Física</span>
                <span className="text-xs font-bold text-slate-800 uppercase">{inst.ubicacion || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-200 flex-1">
              <div className="p-3 flex flex-col justify-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-0.5">Criticidad</span>
                <span className="text-xs font-bold text-amber-600 uppercase font-mono">{inst.criticidad || 'N/A'}</span>
              </div>
              <div className="p-3 flex flex-col justify-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-0.5">Div. de Escala</span>
                <span className="text-xs font-bold text-slate-800 uppercase font-mono">{inst.division_escala || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-200 flex-1">
              <div className="p-3 flex flex-col justify-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-0.5">Responsable</span>
                <span className="text-xs font-bold text-slate-800 uppercase font-mono">{inst.responsable || 'Sin Asignar'}</span>
              </div>
              <div className="p-3 bg-slate-50/20 flex flex-col justify-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-0.5">Control Metrológico</span>
                <span className="text-xs font-bold text-slate-800 uppercase font-mono">{inst.proceso || 'N/A'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* LÍMITES DE PROCESO & ISO 10012 COMPLIANCE */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[9px] text-[#0B1326] font-bold uppercase tracking-[0.3em] border-l-2 border-slate-400 pl-3">Límites de Proceso & Requisitos ISO 10012</h3>
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl flex flex-col items-center text-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Capacidad Mín / Máx</span>
                <p className="text-xl font-black text-slate-800 tracking-tight">
                  {inst.rango_min || '0'} / {inst.rango_max || 'N/A'}
                </p>
             </div>
             <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl flex flex-col items-center text-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Resolución</span>
                <p className="text-xl font-black text-slate-800 tracking-tight">
                  {inst.resolucion || 'N/A'}
                </p>
             </div>
             <div className="bg-emerald-50/30 border border-emerald-200 p-4 rounded-xl flex flex-col items-center text-center">
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mb-1 font-mono">Tolerancia de Proceso</span>
                <p className="text-xl font-black text-emerald-700 tracking-tight">
                   {inst.tolerancia_proceso || 'N/A'}
                </p>
             </div>
          </div>
        </section>

        {/* RUTINAS PROGRAMADAS */}
        <section className="flex flex-col gap-3">
           <h3 className="text-[9px] text-[#0B1326] font-bold uppercase tracking-[0.3em] border-l-2 border-slate-400 pl-3">Plan de Rutinas Metrológicas</h3>
           <div className="grid grid-cols-4 gap-4">
             {[
               { key: 'calibracion', label: 'Calibración' },
               { key: 'verificacion', label: 'Verificación' },
               { key: 'mantenimiento', label: 'Mantenimiento' },
               { key: 'calificacion', label: 'Calificación' }
             ].map((rutina, idx) => {
                if (!inst.rutinas?.[rutina.key]) return null;
                return (
                  <div key={idx} className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">{rutina.label}</span>
                    <span className="block text-sm font-black text-slate-800 mt-1">{inst.rutinas[`${rutina.key}_frecuencia`] || 'N/A'} Meses</span>
                    <span className="block text-[7px] text-slate-400 mt-1 font-mono">Base: {inst.rutinas[`${rutina.key}_fecha_inicial`] ? new Date(inst.rutinas[`${rutina.key}_fecha_inicial`]).toISOString().split('T')[0] : 'N/A'}</span>
                  </div>
                );
             })}
             {(!inst.rutinas || !Object.keys(inst.rutinas).some(k => ['calibracion','verificacion','mantenimiento','calificacion'].includes(k) && inst.rutinas[k])) && (
                <div className="col-span-4 text-[9px] text-slate-400 italic bg-slate-50 p-3 rounded-lg text-center border border-slate-200">No hay rutinas activas programadas.</div>
             )}
           </div>
        </section>

        {/* HISTORIAL */}
        <section className="flex flex-col gap-3 flex-grow justify-end">
          <div className="flex justify-between items-end">
             <h3 className="text-[9px] text-[#0B1326] font-bold uppercase tracking-[0.3em] border-l-2 border-slate-400 pl-3">Registro Histórico de Calibración</h3>
             <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest font-mono">Página 01 de 01</span>
          </div>
          <div className="overflow-hidden border border-slate-200 rounded-xl">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                   <tr>
                      <th className="px-6 py-2.5">Fecha</th>
                      <th className="px-6 py-2.5">Certificado No.</th>
                      <th className="px-6 py-2.5">Proveedor / Lab</th>
                      <th className="px-6 py-2.5">Error Máx</th>
                      <th className="px-6 py-2.5">Acciones</th>
                   </tr>
                </thead>
                <tbody>
                   <tr className="border-b border-slate-50">
                      <td colSpan="5" className="px-6 py-8 text-center">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] font-mono mb-0.5">Sin registros previos en base de datos</p>
                         <p className="text-[10px] text-slate-400 italic">El activo no cuenta con calibraciones registradas en el periodo actual.</p>
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
        </section>

        {/* FIRMAS Y PIE */}
        <footer className="mt-auto">
          <div className="grid grid-cols-2 gap-16 mb-6 px-8 mt-4">
              <div className="flex flex-col items-center">
                 <div className="w-full border-b border-slate-200 h-10 mb-2 relative flex items-end justify-center pb-1">
                    <p className="text-[7px] font-mono text-slate-300">Firma Digital Registrada</p>
                 </div>
                 <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Analista Metrológico</span>
              </div>
             <div className="flex flex-col items-center">
                <div className="w-full border-b border-slate-200 h-10 mb-2 relative flex items-end justify-center pb-1">
                   <p className="text-[7px] font-mono text-slate-300">Aprobación de Calidad</p>
                </div>
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Director de Calidad</span>
             </div>
          </div>
          
          <div className="flex flex-col items-center gap-1.5 pt-4 text-slate-400 border-t border-slate-200">
             <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-center">
                Documento de Control Interno &bull; Compatible con NTC-ISO 10012:2003 Sistemas de Gestión de la Medición
             </span>
             <span className="text-[7px] font-mono text-slate-400/60 uppercase text-center">
                MJM Metrología &bull; Aseguramiento & Control de Calidad
             </span>
          </div>
        </footer>
      </main>

      {/* ESTILOS DE IMPRESIÓN */}
      <style>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          main { 
            box-shadow: none !important; 
            margin: 0 !important; 
            width: 100% !important; 
            min-height: 0 !important;
            padding: 0.5in !important;
          }
          @page {
            size: letter;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default HojaDeVidaPrint;
