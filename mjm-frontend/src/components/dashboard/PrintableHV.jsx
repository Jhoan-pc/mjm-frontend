import React, { forwardRef } from 'react';
import { Info, FileText, Camera } from 'lucide-react';

const PrintableHV = forwardRef(({ instrument, tenant }, ref) => {
  if (!instrument) return null;

  const firstEvidencia = instrument.evidencias && instrument.evidencias.length > 0 
    ? (instrument.evidencias[0].dataUrl || instrument.evidencias[0]) 
    : null;
  const imgSrc = instrument.imagen_url || instrument.imageUrl || firstEvidencia;

  return (
    <div ref={ref} className="bg-white p-4 text-black font-sans leading-relaxed" style={{ width: '210mm', height: '270mm', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Marco Exterior Formal */}
      <div className="border-[3px] border-black p-6 h-full flex flex-col">
        
        {/* Encabezado ISO (Zeticas Standard - Rediseño Premium) */}
        <div className="flex border-[2.5px] border-black mb-8 h-32 overflow-hidden">
          {/* Logo Column */}
          <div className="w-1/4 border-r-[2.5px] border-black flex items-center justify-center p-4 bg-white">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt="Logo" className="max-h-24 grayscale object-contain" />
            ) : (
              <div className="flex flex-col items-center opacity-20">
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mb-1">
                   <div className="w-6 h-6 border-2 border-black rotate-45"></div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">Logo Empresa</span>
              </div>
            )}
          </div>

          {/* Title Column */}
          <div className="w-2/4 flex flex-col justify-center items-center px-8 border-r-[2.5px] border-black text-center bg-gray-50/30">
            <h2 className="font-black text-2xl uppercase tracking-tighter text-black leading-tight">
              {tenant?.nombre_empresa || 'SISTEMA DE GESTIÓN'}
            </h2>
            <div className="flex items-center gap-4 w-full mt-2">
               <div className="h-[2px] flex-1 bg-black"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Calidad & Metrología</span>
               <div className="h-[2px] flex-1 bg-black"></div>
            </div>
            <h3 className="font-black text-xl uppercase tracking-widest text-mjm-navy mt-1">HOJA DE VIDA</h3>
          </div>

          {/* Metadata Column */}
          <div className="w-1/4 flex flex-col justify-center divide-y-[1.5px] divide-black text-[9px] font-black bg-white">
             <div className="flex-1 flex items-center justify-between px-4">
                <span className="text-gray-400">CÓDIGO:</span>
                <span>R-MET-01</span>
             </div>
             <div className="flex-1 flex items-center justify-between px-4">
                <span className="text-gray-400">VERSIÓN:</span>
                <span>04</span>
             </div>
             <div className="flex-1 flex items-center justify-between px-4">
                <span className="text-gray-400">FECHA:</span>
                <span>09/05/2026</span>
             </div>
          </div>
        </div>

        {/* Ficha Técnica con Foto Elegante */}
        <div className="mb-6">
          <div className="bg-black text-white p-2.5 mb-4 flex items-center gap-2 font-black uppercase text-xs tracking-widest">
            <Info size={14} /> IDENTIFICACIÓN DEL ACTIVO METROLÓGICO
          </div>
          
          <div className="flex gap-6">
            {/* Grid de Datos */}
            <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
              {[
                ['CÓDIGO MJM:', instrument.codigoMJM],
                ['NOMBRE:', instrument.nombre],
                ['MARCA:', instrument.marca],
                ['MODELO:', instrument.modelo],
                ['N° SERIE:', instrument.serie],
                ['UBICACIÓN:', instrument.ubicacion],
                ['MAGNITUD:', instrument.magnitud],
                ['RESOLUCIÓN:', instrument.resolucion],
                ['CAPACIDAD:', instrument.capacidadMaxima || instrument.capacidadMax],
                ['CRITICIDAD:', instrument.criticidad || 'NORMAL']
              ].map(([label, value]) => (
                <div key={label} className="flex border-b border-black/10 pb-1 items-end h-8">
                  <span className="font-black text-[9px] w-[40%] text-gray-500 uppercase tracking-tighter">{label}</span>
                  <span className="w-[60%] font-bold text-black uppercase truncate">{value || '---'}</span>
                </div>
              ))}
            </div>

            {/* Foto del Equipo (Elegant Frame) */}
            <div className="w-[30%] flex flex-col gap-2">
               <div className="border-2 border-black aspect-square flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                  {imgSrc ? (
                    <img src={imgSrc} className="w-full h-full object-contain p-2 grayscale hover:grayscale-0 transition-all duration-500" alt="Instrumento" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-20">
                       <Camera size={32} />
                       <span className="text-[8px] font-black uppercase">Sin Registro Fotográfico</span>
                    </div>
                  )}
                  <div className="absolute top-1 left-1 border-t border-l border-black/20 w-4 h-4"></div>
                  <div className="absolute bottom-1 right-1 border-b border-r border-black/20 w-4 h-4"></div>
               </div>
               <p className="text-[7px] font-black text-center uppercase tracking-widest text-gray-400">Registro Fotográfico del Activo</p>
            </div>
          </div>
        </div>

        {/* Historial de Mantenimientos (Persistente) */}
        <div className="flex-1">
          <div className="bg-black text-white p-2.5 mb-4 flex items-center gap-2 font-black uppercase text-xs tracking-widest">
            <FileText size={14} /> HISTORIAL TÉCNICO Y TRAZABILIDAD
          </div>
          <div className="overflow-hidden border-2 border-black rounded-sm shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-black">
                  <th className="border-r border-black p-2 text-[9px] font-black uppercase">Fecha</th>
                  <th className="border-r border-black p-2 text-[9px] font-black uppercase">Actividad</th>
                  <th className="border-r border-black p-2 text-[9px] font-black uppercase">Laboratorio / Ejecutor</th>
                  <th className="border-r border-black p-2 text-[9px] font-black uppercase">N° Certificado</th>
                  <th className="p-2 text-[9px] font-black uppercase text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {(instrument.historial || []).length > 0 ? instrument.historial.map((reg, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="border-r border-black/10 p-2 font-mono text-[9px]">{reg.fecha}</td>
                    <td className="border-r border-black/10 p-2 text-[9px] font-bold uppercase">{reg.tipo}</td>
                    <td className="border-r border-black/10 p-2 text-[9px] uppercase">{reg.ejecutor || 'MJM LABS'}</td>
                    <td className="border-r border-black/10 p-2 font-mono text-[9px]">{reg.certificado || '---'}</td>
                    <td className="p-2 text-center">
                       <span className="text-[8px] font-black px-2 py-0.5 border border-black uppercase rounded-full bg-gray-50">
                          {reg.resultado || 'COMPLETO'}
                       </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-300 italic text-[10px] uppercase tracking-[0.2em] font-black">
                      No se registran eventos de mantenimiento o calibración.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Firmas y Sellos Autorizados */}
        <div className="mt-8 grid grid-cols-2 gap-16 px-12 pb-4">
          <div className="flex flex-col items-center">
            <div className="w-full border-t-2 border-black pt-2 text-center">
               <p className="text-[9px] font-black uppercase tracking-tighter">Responsable de Calidad / Metrología</p>
               <p className="text-[7px] text-gray-400 font-bold uppercase mt-1">Autorizado por MJM Digital Core</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full border-t-2 border-black pt-2 text-center">
               <p className="text-[9px] font-black uppercase tracking-tighter">Director Técnico de Operaciones</p>
               <p className="text-[7px] text-gray-400 font-bold uppercase mt-1">Firma Digital Verificada</p>
            </div>
          </div>
        </div>

        {/* Footer Formal */}
        <div className="mt-auto pt-4 border-t border-black/10 flex justify-between items-center opacity-40">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-black rounded-full"></div>
             <p className="text-[7px] font-black tracking-widest uppercase">MJM GESTIÓN METROLÓGICA · CLOUD SYNCED</p>
          </div>
          <p className="text-[7px] font-black tracking-[0.2em] uppercase">DOCUMENTO CONTROLADO BAJO NORMA ISO 9001:2015</p>
        </div>
      </div>
    </div>
  );
});

PrintableHV.displayName = 'PrintableHV';

export default PrintableHV;
