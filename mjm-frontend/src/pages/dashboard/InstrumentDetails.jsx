import React, { useState } from 'react';
import { Camera, Calendar, FileText, Settings, Download, MoreVertical, Plus, ChevronRight, Activity, ShieldCheck, Cog, DownloadCloud, Clock, Save } from 'lucide-react';

const mockInstrument = {
  id: 'MJM-INS-001',
  name: 'Micrómetro Digital',
  brand: 'Mitutoyo',
  model: '293-240-30',
  serial: 'SN-88291',
  code: 'CAL-01',
  location: 'Calidad - Planta Bogotá',
  resolution: '0.001 mm',
  capacity: '0-25 mm',
  magnitude: 'Dimensional',
  criticality: 'Alta',
  year: '2022',
  provider: 'MJM SAS',
  status: 'Certificado',
  lastCal: '2024-01-15',
  nextCal: '2025-01-15',
  photo: 'https://asesoriasintegralesmjm.com/services/alcance.jpeg'
};

const mockHistory = [
  { id: 1, type: 'Calibración', date: '2024-01-15', provider: 'Laboratorio MJM', cert: 'CERT-00291', status: 'Aprobado' },
  { id: 2, type: 'Mantenimiento Preventivo', date: '2023-12-01', provider: 'MJM SAS', cert: 'MT-881', status: 'Completado' },
  { id: 3, type: 'Verificación Semanal', date: '2024-03-24', provider: 'Interno', cert: 'VER-001', status: 'Dentro de Tolerancia' }
];

export default function InstrumentDetails() {
  const [activeTab, setActiveTab] = useState('technical');
  const [isScheduling, setIsScheduling] = useState(false);

  const StatusCard = ({ title, value, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
       <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</span>
          <span className="text-sm font-black text-mjm-navy tracking-tight">{value}</span>
       </div>
       <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${color}-50 text-${color}-500`}>
          <Clock size={16} />
       </div>
    </div>
  );

  return (
    <div className="flex bg-[#f8f9fa] h-full overflow-hidden flex-col">
      
      {/* Header Info */}
      <header className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-white border-b border-gray-100 shadow-sm relative z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-mjm-navy rounded-2xl overflow-hidden relative shadow-lg">
             <img src={mockInstrument.photo} alt={mockInstrument.name} className="w-full h-full object-cover grayscale brightness-125" />
             <div className="absolute inset-0 bg-mjm-navy/30"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-mjm-navy uppercase tracking-tighter leading-none">{mockInstrument.name}</h1>
            <div className="flex items-center gap-4 mt-2">
               <span className="px-2 py-0.5 bg-mjm-orange/10 text-mjm-orange text-[10px] font-black uppercase tracking-widest rounded">{mockInstrument.id}</span>
               <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">S/N: {mockInstrument.serial} / {mockInstrument.code}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
           <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95">
             <DownloadCloud size={16} />
             Exportar PDF
           </button>
           <button 
             onClick={() => setIsScheduling(true)}
             className="flex items-center gap-2 px-6 py-2 bg-mjm-orange text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-mjm-orange/20 hover:scale-105 transition-all active:scale-95"
           >
             <Calendar size={16} />
             Programar Nueva
           </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            
            {/* Left Col: Specs & Info */}
            <div className="flex-1 space-y-8">
               
               {/* Summary Stats */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatusCard title="Última Calibración" value={mockInstrument.lastCal} color="green" />
                  <StatusCard title="Próxima Calibración" value={mockInstrument.nextCal} color="orange" />
                  <StatusCard title="Días Restantes" value="285 Días" color="blue" />
               </div>

               {/* Tabs & Content */}
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex border-b border-gray-100 p-2">
                     <button 
                       onClick={() => setActiveTab('technical')}
                       className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'technical' ? 'bg-mjm-navy text-white shadow-lg' : 'text-gray-400 hover:text-mjm-navy hover:bg-gray-50'}`}
                     >
                        <Settings size={16} />
                        Ficha Técnica
                     </button>
                     <button 
                       onClick={() => setActiveTab('history')}
                       className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-mjm-navy text-white shadow-lg' : 'text-gray-400 hover:text-mjm-navy hover:bg-gray-50'}`}
                     >
                        <Activity size={16} />
                        Historial Metrológico
                     </button>
                  </div>

                  <div className="p-8">
                     {activeTab === 'technical' ? (
                       <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
                          {[
                            { l: 'Marca', v: mockInstrument.brand },
                            { l: 'Modelo', v: mockInstrument.model },
                            { l: 'Magnitud', v: mockInstrument.magnitude },
                            { l: 'Resolución', v: mockInstrument.resolution },
                            { l: 'Capacidad Máx', v: mockInstrument.capacity },
                            { l: 'Criticidad', v: mockInstrument.criticality },
                            { l: 'Año Adquisición', v: mockInstrument.year },
                            { l: 'Ubicación Planta', v: mockInstrument.location },
                            { l: 'Proveedor', v: mockInstrument.provider },
                          ].map((item, i) => (
                            <div key={i} className="flex flex-col group">
                               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 group-hover:text-mjm-orange transition-colors">{item.l}</span>
                               <span className="text-sm font-bold text-gray-800 tracking-tight">{item.v}</span>
                            </div>
                          ))}
                       </div>
                     ) : (
                       <div className="space-y-4">
                          <table className="w-full text-left">
                             <thead>
                               <tr className="border-b border-gray-100">
                                 <th className="pb-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Actividad</th>
                                 <th className="pb-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-center">Fecha</th>
                                 <th className="pb-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Certificado</th>
                                 <th className="pb-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-right">Estado</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                {mockHistory.map(row => (
                                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                     <td className="py-4">
                                        <div className="flex items-center gap-3">
                                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${row.type.includes('Cal') ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                              <ShieldCheck size={16} />
                                           </div>
                                           <span className="text-xs font-bold text-mjm-navy">{row.type}</span>
                                        </div>
                                     </td>
                                     <td className="py-4 text-center text-[10px] font-black text-gray-400 tracking-widest">{row.date}</td>
                                     <td className="py-4 text-xs font-bold text-mjm-orange hover:underline cursor-pointer">{row.cert}</td>
                                     <td className="py-4 text-right">
                                        <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-widest ${
                                          row.status === 'Aprobado' || row.status === 'Completado' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                          {row.status}
                                        </span>
                                     </td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Col: Maintenance / Sidebar Actions */}
            <div className="w-full lg:w-96 shrink-0 space-y-8">
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-mjm-navy flex items-center justify-between">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Controles de Instrumento</h3>
                     <MoreVertical size={16} className="text-white/40" />
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                     <button className="flex flex-col items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all group">
                        <span className="text-[9px] font-black uppercase tracking-widest text-mjm-orange mb-1 group-hover:tracking-[0.3em] transition-all">Ver Hoja Técnica Completa</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase leading-tight">ISO 9001:2015 Metrología</span>
                     </button>
                     <button className="flex items-center justify-center gap-3 w-full py-4 text-mjm-navy bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all">
                        <Plus size={16} strokeWidth={3} />
                        Nueva Verificación
                     </button>
                  </div>
               </div>

               <div className="bg-[#EE8C2C]/5 rounded-2xl border border-[#EE8C2C]/20 p-8">
                  <h4 className="text-lg font-black text-mjm-orange uppercase tracking-tight mb-2">Programación Cíclica</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">Gestiona inspecciones recurrentes basadas en tiempo o uso.</p>
                  
                  <div className="space-y-4">
                     <div className="flex flex-col">
                        <label className="text-[9px] font-black text-mjm-navy opacity-40 uppercase tracking-widest mb-1.5">Frecuencia Meses</label>
                        <input type="number" defaultValue="12" className="bg-white border-0 rounded-lg p-3 text-sm focus:ring-2 focus:ring-mjm-orange" />
                     </div>
                     <button className="w-full py-3 bg-mjm-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-mjm-orange/20 hover:scale-105 transition-all">
                        <Save size={16} className="mx-auto" />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* MODAL: Simple Scheduling Drawer emulation */}
      {isScheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
           <div className="absolute inset-0 bg-mjm-navy/40 backdrop-blur-sm" onClick={() => setIsScheduling(false)}></div>
           <div className="w-full md:w-[480px] h-full bg-white relative z-10 shadow-2xl p-8 flex flex-col">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-2xl font-black text-mjm-navy tracking-tight uppercase">Programar Actividad</h2>
                 <button onClick={() => setIsScheduling(false)} className="text-gray-300 hover:text-mjm-navy uppercase text-[10px] font-black tracking-widest">Cerrar</button>
              </div>
              
              <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-hide">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Evento</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['Calibración', 'Mantenimiento', 'Verificación', 'Calificación'].map(type => (
                         <button key={type} className="p-4 border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:border-mjm-orange hover:text-mjm-orange transition-all text-center">
                           {type}
                         </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha de Ejecución</label>
                    <input type="date" className="p-4 bg-gray-50 border-0 rounded-xl text-mjm-navy font-bold focus:ring-2 focus:ring-mjm-orange" />
                 </div>

                 <div className="p-6 bg-gray-900 rounded-2xl flex items-center justify-between">
                    <div>
                       <p className="text-white text-xs font-black uppercase tracking-widest">¿Es un evento cíclico?</p>
                       <p className="text-gray-500 text-[10px] font-bold">Repetir automáticamente según frecuencia.</p>
                    </div>
                    <div className="w-12 h-6 bg-mjm-orange rounded-full relative cursor-pointer shadow-sm shadow-mjm-orange/20">
                       <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                 </div>
              </div>

              <button className="w-full py-4 mt-8 bg-mjm-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all">
                 Confirmar Programación
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
