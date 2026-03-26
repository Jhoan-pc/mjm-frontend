import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  History,
  ClipboardCheck,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const MOCK_ASEGURAMIENTO = [
  {
    id: 'as-1',
    nombre: 'Punzón Termómetro Digital',
    codigoMJM: 'MJM-PT-001',
    serie: 'SN-99201',
    magnitud: 'Temperatura',
    ultimoPatron: 'Termómetro de Referencia PT100',
    ultimaVerificacion: '2026-03-10',
    proximaVerificacion: '2026-04-10',
    estado: 'Vigente',
    errorMax: '0.2°C',
    errorEncontrado: '0.05°C'
  },
  {
    id: 'as-2',
    nombre: 'Cronómetro Digital',
    codigoMJM: 'MJM-CR-002',
    serie: 'TIME-44',
    magnitud: 'Tiempo',
    ultimoPatron: 'Reloj Maestro GPS',
    ultimaVerificacion: '2026-02-15',
    proximaVerificacion: '2026-03-15',
    estado: 'Vencido',
    errorMax: '0.5s',
    errorEncontrado: '0.8s'
  },
  {
    id: 'as-3',
    nombre: 'Micrómetro de Exteriores',
    codigoMJM: 'MJM-ME-045',
    serie: 'DIM-881',
    magnitud: 'Longitud',
    ultimoPatron: 'Bloques Patrón Grado 0',
    ultimaVerificacion: '2026-03-20',
    proximaVerificacion: '2026-04-20',
    estado: 'Vigente',
    errorMax: '0.01mm',
    errorEncontrado: '0.002mm'
  }
];

export default function AseguramientoMetrologico() {
  const { tenant } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Vigente': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Vencido': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Por Vencer': return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700 bg-[#050b14] min-h-screen text-white/90">
      {/* Header Estrecho con Branding Limpio */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shadow-inner">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">MJM Security Operations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Control & Aseguramiento</h1>
          <p className="text-sm text-white/40 mt-2 font-medium">Verificación táctica de instrumentos mediante patrones de referencia.</p>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 md:flex-none px-8 py-3.5 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <History size={14} /> Historial
          </button>
          <button 
            className="flex-1 md:flex-none px-8 py-3.5 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 bg-[#1a1c20] border border-white/20"
          >
            <Plus size={16} /> Programar Verificación
          </button>
        </div>
      </div>

      {/* KPI Cards Mini Elite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: ClipboardCheck, label: 'Equipos en Control', val: '12', color: 'text-blue-400' },
          { icon: CheckCircle, label: 'Ejecutadas (Mes)', val: '8', color: 'text-emerald-400' },
          { icon: TrendingUp, label: 'Desviación Media', val: '0.05%', color: 'text-amber-400' },
          { icon: Zap, label: 'Alertas de Error', val: '2', color: 'text-red-500' }
        ].map((k, i) => (
          <div key={i} className="bg-[#0a0d14] p-6 rounded-2xl border border-white/5 shadow-xl flex items-center gap-5 group hover:border-white/20 transition-all">
            <div className={`p-3.5 bg-white/5 rounded-xl ${k.color} group-hover:scale-110 transition-transform`}><k.icon size={22} /></div>
            <div>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{k.label}</p>
              <p className="text-2xl font-black text-white">{k.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar Search Elite */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar por equipo, código MJM o serie..."
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 transition-all text-white text-sm font-medium tracking-wide placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="w-full md:w-auto px-8 py-4 bg-white border-2 border-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-black hover:text-white transition-all transform active:scale-95 shadow-xl">
           Filtrar Auditoría
        </button>
      </div>

      {/* Grid de Equipos en Aseguramiento */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {MOCK_ASEGURAMIENTO.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(item.estado)}`}>
                      {item.estado}
                    </span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-wider">
                      {item.magnitud}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-mjm-navy transition-colors">{item.nombre}</h3>
                  <p className="text-xs font-mono text-gray-400 mt-1">{item.codigoMJM} · S/N: {item.serie}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-right">Próxima Verificación</p>
                  <div className="flex items-center gap-2 text-mjm-navy">
                    <Clock size={14} />
                    <span className="text-sm font-black italic">{item.proximaVerificacion}</span>
                  </div>
                </div>
              </div>

              {/* Detalles Técnicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Patrón de Referencia</p>
                  <p className="text-xs font-bold text-gray-700">{item.ultimoPatron}</p>
                </div>
                <div className="bg-mjm-navy/5 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black text-mjm-navy/50 uppercase tracking-widest mb-1">Último Error</p>
                    <p className="text-sm font-black text-mjm-navy">{item.errorEncontrado}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Max Permitido</p>
                    <p className="text-sm font-black text-gray-400">{item.errorMax}</p>
                  </div>
                </div>
              </div>

              {/* Footer de Tarjeta */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <History size={12} />
                  Última: {item.ultimaVerificacion}
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#050b14] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-500 transition-all shadow-md active:scale-95">
                  Iniciar Verificación <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding Sutil */}
      <div className="pt-10 flex justify-center opacity-30">
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-gray-300"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Sistema de Aseguramiento Metrológico</span>
          <div className="h-px w-10 bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
