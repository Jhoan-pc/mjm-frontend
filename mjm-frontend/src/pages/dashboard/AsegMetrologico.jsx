import React, { useState, useMemo, useEffect } from 'react';
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
  Zap,
  LayoutGrid,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useInventoryStore } from '../../store/inventoryStore';

export default function ComprobacionMetrologica() {
  const { tenant, isSuperAdmin } = useAuthStore();
  const { instruments, activities, loadInstruments, loadActivities } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (tenant) {
      loadInstruments(tenant.id, isSuperAdmin);
      loadActivities(tenant.id, isSuperAdmin);
    }
  }, [tenant, isSuperAdmin, loadInstruments, loadActivities]);

  const verifData = useMemo(() => {
    const vActs = activities.filter(a => a.tipo === 'Verificación');
    const instIds = [...new Set(vActs.map(a => a.instrumentId))];
    const targetInstruments = instruments.filter(i => instIds.includes(i.id));

    const totalEnControl = targetInstruments.length;
    const ejecutadasMes = vActs.filter(a => {
      if (a.estado !== 'done') return false;
      const d = new Date(a.fechaRealizacion || a.fechaProgramada);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const alertas = vActs.filter(a => a.estado === 'todo' && new Date(a.fechaProgramada) < new Date()).length;
    const desviacionMedia = "0.042%"; 

    return { instruments: targetInstruments, activities: vActs, totalEnControl, ejecutadasMes, alertas, desviacionMedia };
  }, [instruments, activities]);

  const filteredInstruments = verifData.instruments.filter(inst => 
    inst.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.codigoMJM.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (instrumentId) => {
    const instActs = verifData.activities.filter(a => a.instrumentId === instrumentId);
    const hasOverdue = instActs.some(a => a.estado !== 'done' && new Date(a.fechaProgramada) < new Date());
    if (hasOverdue) return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700 bg-[#f8f9fa] min-h-screen">
      {/* Header Elite Light */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-gray-200 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-mjm-navy rounded-xl border border-mjm-navy shadow-inner">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">MJM Calibration Engine</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-mjm-navy tracking-tighter uppercase italic leading-none">
            Comprobación <span className="text-gray-300">Metrológica</span>
          </h1>
          <p className="text-sm text-gray-500 mt-3 font-medium max-w-xl">
            Protocolo de comparación táctica con patrones de referencia internos para asegurar la trazabilidad en punto de uso.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 md:flex-none px-8 py-3.5 bg-white border border-gray-200 text-gray-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <History size={14} /> Log Maestro
          </button>
          <button className="flex-1 md:flex-none px-8 py-3.5 bg-[#050b14] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl hover:bg-mjm-navy transition-all flex items-center justify-center gap-2">
            <Plus size={16} /> Nueva Comprobación
          </button>
        </div>
      </div>

      {/* KPI Cards Light */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: ClipboardCheck, label: 'Equipos en Control', val: verifData.totalEnControl, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: CheckCircle, label: 'Ejecutadas (Mes)', val: verifData.ejecutadasMes, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: TrendingUp, label: 'Desviación Media', val: verifData.desviacionMedia, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: AlertTriangle, label: 'Alertas / Vencidos', val: verifData.alertas, color: 'text-red-500', bg: 'bg-red-50' }
        ].map((k, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-mjm-navy/5 flex items-center gap-5 group hover:border-mjm-navy/10 transition-all">
            <div className={`p-4 ${k.bg} rounded-2xl ${k.color} group-hover:scale-110 transition-transform`}><k.icon size={24} /></div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1.5">{k.label}</p>
              <p className="text-3xl font-black text-mjm-navy leading-none tracking-tighter">{k.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Toolbar Light */}
      <div className="flex flex-col md:flex-row gap-4 items-center pt-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-mjm-navy transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar por equipo, código MJM o serie..."
            className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-3xl focus:outline-none focus:border-mjm-navy/20 transition-all text-gray-800 text-sm font-medium tracking-wide placeholder:text-gray-300 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="w-full md:w-auto px-10 py-5 bg-white border border-gray-200 text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] rounded-3xl hover:text-mjm-navy hover:border-mjm-navy/30 transition-all flex items-center justify-center gap-3 shadow-sm">
           <Filter size={14} /> Filtro de Planta
        </button>
      </div>

      {/* Verification Grid Light */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
        {filteredInstruments.map((item) => {
          const lastVerif = verifData.activities.find(a => a.instrumentId === item.id && a.estado === 'done');
          const nextVerif = verifData.activities.find(a => a.instrumentId === item.id && a.estado === 'todo');
          
          return (
            <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-mjm-navy/5 hover:border-mjm-orange/20 transition-all duration-500 overflow-hidden group relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-mjm-navy">
                <LayoutGrid size={80} />
              </div>
              
              <div className="p-8 sm:p-10 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(item.id)}`}>
                        {verifData.activities.some(a => a.instrumentId === item.id && a.estado === 'todo' && new Date(a.fechaProgramada) < new Date()) ? 'VENCIDO' : 'VIGENTE'}
                      </span>
                      <span className="px-4 py-1.5 bg-gray-50 text-gray-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
                        {item.magnitud || 'Planta'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-mjm-navy tracking-tight uppercase italic group-hover:text-mjm-orange transition-colors duration-300">{item.nombre}</h3>
                    <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">{item.codigoMJM} · S/N: {item.serie || 'INTERNO'}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Próxima Comp. en Planta</p>
                    <div className="flex items-center gap-2 text-mjm-navy">
                      <Clock size={16} />
                      <span className="text-lg font-black italic tracking-tighter">{nextVerif?.fechaProgramada || 'Pte. Programar'}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Comparison Block Light */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Patrón de Referencia Interno</p>
                    <p className="text-sm font-black text-mjm-navy/80">{lastVerif?.laboratorio === 'INTERNO (MJM PLANTA)' ? 'Patrón Maestro PT100 Cal-Ref' : 'No definido'}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono italic">Certificado: {lastVerif?.certificado || 'N/A'}</p>
                  </div>
                  <div className="bg-mjm-navy shadow-lg shadow-mjm-navy/20 p-6 rounded-3xl flex justify-between items-center group-hover:bg-[#0a0d14] transition-colors">
                    <div>
                      <p className="text-[9px] font-black text-mjm-orange uppercase tracking-[0.3em] mb-1.5">Último Error</p>
                      <p className="text-xl font-black text-white">0.02 {item.unidad_medida || ''}</p>
                    </div>
                    <div className="text-right border-l border-white/10 pl-6">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-1.5">MPE (Máx. Perm)</p>
                      <p className="text-base font-black text-white/20">0.05 {item.unidad_medida || ''}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Tarjeta Light */}
                <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    <History size={14} />
                    EJECUCIÓN: {lastVerif?.fechaRealizacion || 'Sin registro'}
                  </div>
                  <button className="flex items-center gap-3 px-8 py-3.5 bg-mjm-orange text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-200 active:scale-95 group/btn">
                    Iniciar Comparación <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Branding Light */}
      <div className="pt-20 pb-10 flex flex-col items-center gap-4 opacity-30 text-mjm-navy">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-mjm-navy to-transparent"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.8em] text-center">
          Metrology Assurance Layer · Delta CoreTech
        </span>
      </div>
    </div>
  );
}
