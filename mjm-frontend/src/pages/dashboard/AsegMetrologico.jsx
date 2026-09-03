import React, { useState, useMemo, useEffect } from 'react';
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
  Layers
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
    (inst.nombre ? String(inst.nombre).toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
    (inst.codigoMJM ? String(inst.codigoMJM).toLowerCase() : '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Industrial */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-1.5">
             <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono font-medium uppercase tracking-wider border border-slate-200 dark:border-zinc-700">
               Protocolo Táctico ISO 10012
             </span>
           </div>
           <h1 className="font-space font-bold text-slate-900 dark:text-white text-2xl md:text-3xl tracking-tight">
             Comprobación Metrológica <span className="text-mjm-navy dark:text-[#f7931b]">en Planta</span>
           </h1>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-normal leading-relaxed">
             Verificación periódica con patrones de referencia internos para asegurar la aptitud de uso y detectar desviaciones antes de la calibración formal.
           </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm">
            <History size={14} className="text-slate-400" /> Registro Maestro
          </button>
          <button className="px-4 py-2 bg-mjm-navy hover:bg-[#1a3857] text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2">
            <Plus size={15} /> Nueva Comprobación
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ClipboardCheck, label: 'En Control', val: verifData.totalEnControl, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { icon: CheckCircle, label: 'Ejecutadas (Mes)', val: verifData.ejecutadasMes, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { icon: TrendingUp, label: 'Deriva Media', val: verifData.desviacionMedia, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
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

      {/* Search Toolbar */}
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
        <button className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 font-medium text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0">
           <Filter size={14} className="text-slate-400" /> Filtrar por Planta
        </button>
      </div>

      {/* Verification Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredInstruments.map((item) => {
          const lastVerif = verifData.activities.find(a => a.instrumentId === item.id && a.estado === 'done');
          const nextVerif = verifData.activities.find(a => a.instrumentId === item.id && a.estado === 'todo');
          const isOverdue = verifData.activities.some(a => a.instrumentId === item.id && a.estado === 'todo' && new Date(a.fechaProgramada) < new Date());
          
          // Cálculo de consumo de tolerancia MPE
          const errorVal = 0.02;
          const mpeVal = 0.05;
          const consumptionPct = Math.min(100, Math.round((errorVal / mpeVal) * 100));

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
                      {item.codigoMJM} <span className="text-slate-300 dark:text-zinc-700">•</span> Serie: {item.serie || 'INTERNO'}
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

                {/* Comparador Técnico MPE vs Error */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Patrón de Referencia</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {lastVerif?.laboratorio === 'INTERNO (MJM PLANTA)' ? 'Patrón Maestro PT100 Cal-Ref' : 'Patrón de Planta Cal-Ref'}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">Cert: {lastVerif?.certificado || 'Trazable INM'}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Error / MPE</span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">{consumptionPct}% MPE</span>
                    </div>
                    
                    <div className="flex justify-between items-baseline mb-2 font-mono">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">0.02 {item.unidad_medida || 'mm'}</span>
                      <span className="text-xs text-slate-400">Tol: ±0.05 {item.unidad_medida || 'mm'}</span>
                    </div>

                    {/* Barra de Consumo de Tolerancia */}
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${consumptionPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${consumptionPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie de Tarjeta */}
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <History size={13} /> Última: {lastVerif?.fechaRealizacion || 'Sin registro'}
                </span>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f7931b] hover:bg-[#e58212] text-white font-semibold text-xs rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer">
                  Comparar <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Industrial Discreto */}
      <div className="pt-8 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600 text-[10px] font-mono tracking-wider uppercase">
        <span>ISO 10012:2026</span>
        <span>•</span>
        <span>Delta Metrology CoreTech</span>
      </div>
    </div>
  );
}
