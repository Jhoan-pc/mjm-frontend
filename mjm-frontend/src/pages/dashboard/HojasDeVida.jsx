import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Printer, FileText, Calendar, Info, Plus, X } from 'lucide-react';

export default function HojasDeVida() {
  const tenant = useAuthStore(state => state.tenant);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState({ fecha: '', tipo: 'Mantenimiento Preventivo', ejecutor: '', certificado: 'N/A', resultado: 'PENDIENTE' });

  const [instrumento, setInstrumento] = useState({
    id: 'INST-042',
    nombre: 'Balanza Analítica Sartorius 220g',
    marca: 'Sartorius',
    modelo: 'Secura 225D-1S',
    serie: '39485721',
    rango: '0 - 220g',
    resolucion: '0.01mg',
    ubicacion: 'Laboratorio Físico-Químico',
    historial: [
      { fecha: '2025-10-15', tipo: 'Calibración Externa', ejecutor: 'Metrología Labs SAS', certificado: 'CER-2025-098', resultado: 'Cumple' },
      { fecha: '2025-04-10', tipo: 'Mantenimiento Preventivo', ejecutor: 'Soporte MJM', certificado: 'N/A', resultado: 'OK' },
      { fecha: '2024-10-15', tipo: 'Calibración Externa', ejecutor: 'Metrología Labs SAS', certificado: 'CER-2024-112', resultado: 'Cumple' },
    ]
  });

  const handleProgramar = (e) => {
    e.preventDefault();
    setInstrumento({
      ...instrumento,
      historial: [nuevaActividad, ...instrumento.historial]
    });
    setIsModalOpen(false);
    setNuevaActividad({ fecha: '', tipo: 'Mantenimiento Preventivo', ejecutor: '', certificado: 'N/A', resultado: 'PENDIENTE' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consulta de Equipos</h1>
          <p className="text-gray-500 text-sm">Registro Documental ISO 9001</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-mjm-navy text-white rounded font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            <Calendar size={18} /> Programar Mant.
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 text-gray-900 font-bold uppercase rounded hover:bg-gray-100 transition-colors"
          >
            <Printer size={18} /> Imprimir PDF
          </button>
        </div>
      </div>

      {/* Modal Programar Mantenimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-mjm-navy flex items-center gap-2">
                <Plus className="text-mjm-orange" /> Nueva Actividad
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-mjm-orange">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleProgramar} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Actividad</label>
                <select 
                  value={nuevaActividad.tipo} 
                  onChange={e => setNuevaActividad({...nuevaActividad, tipo: e.target.value})}
                  className="w-full border-gray-300 rounded-md p-2 bg-gray-50 border focus:border-mjm-orange outline-none focus:ring-1 focus:ring-mjm-orange"
                >
                  <option>Mantenimiento Preventivo</option>
                  <option>Mantenimiento Correctivo</option>
                  <option>Calibración Externa</option>
                  <option>Calibración Interna</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Programada</label>
                  <input type="date" required value={nuevaActividad.fecha} onChange={e => setNuevaActividad({...nuevaActividad, fecha: e.target.value})} className="w-full border-gray-300 rounded-md p-2 bg-gray-50 border focus:border-mjm-orange outline-none" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ejecutor</label>
                  <input type="text" required value={nuevaActividad.ejecutor} onChange={e => setNuevaActividad({...nuevaActividad, ejecutor: e.target.value})} className="w-full border-gray-300 rounded-md p-2 bg-gray-50 border focus:border-mjm-orange outline-none" placeholder="Ing. a cargo" />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-mjm-orange text-white font-bold py-3 mt-4 rounded-lg shadow-md hover:bg-orange-600 transition-colors">
                Agendar e Incluir en Hoja de Vida
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENTO ESTILO ISO PARA IMPRESIÓN */}
      <div className="bg-white border-2 border-black p-4 sm:p-8 shadow-sm">
        
        {/* Encabezado ISO */}
        <div className="flex border-b-2 border-black pb-4 mb-8">
          <div className="w-1/4 border-r-2 border-black flex items-center justify-center p-2">
            {tenant?.logo_url ? <img src={tenant.logo_url} alt="Logo Cliente" className="max-h-16 grayscale" /> : <div className="font-bold text-xl uppercase">EMPRESA</div>}
          </div>
          <div className="w-2/4 flex flex-col justify-center items-center px-4 border-r-2 border-black text-center">
            <h2 className="font-bold text-xl uppercase font-serif tracking-wide">{tenant?.nombre_empresa || 'MJM'}</h2>
            <h3 className="font-bold text-lg mt-1 font-sans">HOJA DE VIDA DE EQUIPO</h3>
          </div>
          <div className="w-1/4 flex flex-col justify-center text-[10px] sm:text-xs font-mono p-2 space-y-1">
             <div className="flex justify-between border-b border-black pb-1"><span>CÓDIGO:</span> <strong>R-MET-01</strong></div>
             <div className="flex justify-between border-b border-black pb-1 pt-1"><span>VERSIÓN:</span> <strong>03</strong></div>
             <div className="flex justify-between pt-1"><span>FECHA:</span> <strong>24/03/2026</strong></div>
          </div>
        </div>

        {/* Ficha Técnica */}
        <div className="mb-8">
          <div className="bg-gray-100 border-2 border-black p-2 mb-4 flex items-center gap-2 font-bold uppercase text-sm">
            <Info size={18} /> IDENTIFICACIÓN DEL EQUIPO
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm px-2">
            <div className="flex border-b border-gray-400 pb-1">
              <span className="font-bold w-1/3 text-xs sm:text-sm">CÓDIGO:</span>
              <span className="w-2/3">{instrumento.id}</span>
            </div>
            <div className="flex border-b border-gray-400 pb-1">
              <span className="font-bold w-1/3 text-xs sm:text-sm">NOMBRE:</span>
              <span className="w-2/3 uppercase font-medium">{instrumento.nombre}</span>
            </div>
            <div className="flex border-b border-gray-400 pb-1">
              <span className="font-bold w-1/3 text-xs sm:text-sm">MARCA:</span>
              <span className="w-2/3">{instrumento.marca}</span>
            </div>
            <div className="flex border-b border-gray-400 pb-1">
              <span className="font-bold w-1/3 text-xs sm:text-sm">MODELO:</span>
              <span className="w-2/3">{instrumento.modelo}</span>
            </div>
            <div className="flex border-b border-gray-400 pb-1">
              <span className="font-bold w-1/3 text-xs sm:text-sm">SERIE:</span>
              <span className="w-2/3 font-mono text-gray-700">{instrumento.serie}</span>
            </div>
            <div className="flex border-b border-gray-400 pb-1">
              <span className="font-bold w-1/3 text-xs sm:text-sm">UBICACIÓN:</span>
              <span className="w-2/3 font-medium">{instrumento.ubicacion}</span>
            </div>
            <div className="flex border-b border-gray-400 pb-1">
              <span className="font-bold w-1/3 text-xs sm:text-sm">RANGO:</span>
              <span className="w-2/3 font-mono">{instrumento.rango}</span>
            </div>
            <div className="flex border-b border-gray-400 pb-1">
              <span className="font-bold w-1/3 text-xs sm:text-sm">RESOLUCIÓN:</span>
              <span className="w-2/3 font-mono">{instrumento.resolucion}</span>
            </div>
          </div>
        </div>

        {/* Historial de Mantenimientos */}
        <div>
          <div className="bg-gray-100 border-2 border-black p-2 mb-4 flex items-center gap-2 font-bold uppercase text-sm">
            <FileText size={18} /> HISTORIAL DE MANTENIMIENTO Y CALIBRACIÓN
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border-2 border-black min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-black">
                  <th className="border-r border-black p-2 text-left font-bold uppercase">Fecha</th>
                  <th className="border-r border-black p-2 text-left font-bold uppercase">Actividad</th>
                  <th className="border-r border-black p-2 text-left font-bold uppercase">Ejecutor</th>
                  <th className="border-r border-black p-2 text-left font-bold uppercase">Certificado</th>
                  <th className="p-2 text-center font-bold uppercase">Result.</th>
                </tr>
              </thead>
              <tbody>
                {instrumento.historial.map((reg, idx) => (
                  <tr key={idx} className="border-b border-gray-400 hover:bg-gray-50 transition-colors">
                    <td className="border-r border-black p-2 font-mono text-xs font-semibold">{reg.fecha}</td>
                    <td className="border-r border-black p-2 font-medium">{reg.tipo}</td>
                    <td className="border-r border-black p-2 text-gray-700">{reg.ejecutor}</td>
                    <td className="border-r border-black p-2 font-mono text-xs text-gray-600">{reg.certificado}</td>
                    <td className={`p-2 text-center font-bold text-[10px] uppercase ${reg.resultado === 'PENDIENTE' ? 'text-amber-600' : 'text-gray-900'}`}>
                      {reg.resultado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
          }
          .bg-white.border-2.border-black {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          .bg-white.border-2.border-black * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
}
