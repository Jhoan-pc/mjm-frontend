import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle, Clock, ShieldCheck, Activity, TrendingUp, TrendingDown, Layers, FileText, Cpu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useInventoryStore } from '../../store/inventoryStore';

export default function DashboardKPIs() {
  const { tenant, isSuperAdmin } = useAuthStore();
  const { instruments, activities, loadInstruments, loadActivities } = useInventoryStore();

  React.useEffect(() => {
    if (tenant) {
      loadInstruments(tenant.id, isSuperAdmin);
      loadActivities(tenant.id, isSuperAdmin);
    }
  }, [tenant, isSuperAdmin, loadInstruments, loadActivities]);

  const kpis = React.useMemo(() => {
    const total = instruments.length;
    const vigentes = instruments.filter(i => i.estado === 'Activo').length;
    const proximos = instruments.filter(i => i.estado === 'Próximo Vencimiento').length;
    const vencidos = instruments.filter(i => i.estado === 'Vencido').length;
    
    return { total, vigentes, proximos, vencidos };
  }, [instruments]);

  const chartData = [
    { name: 'Ene', real: 12, plan: 15 },
    { name: 'Feb', real: 18, plan: 20 },
    { name: 'Mar', real: 15, plan: 15 },
    { name: 'Abr', real: 22, plan: 25 },
    { name: 'May', real: 30, plan: 28 },
    { name: 'Jun', real: 25, plan: 30 },
  ];

  const pieData = [
    { name: 'Activos', value: kpis.vigentes, color: '#78B7D0' },
    { name: 'Próximos', value: kpis.proximos, color: '#E3A06D' },
    { name: 'Vencidos', value: kpis.vencidos, color: '#BA1A1A' },
  ];  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <p className="font-inter font-medium text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)] mb-1.5">MJM Insights v2.0</p>
           <h1 className="font-outfit font-extrabold text-[var(--text-main)] text-3xl tracking-tight uppercase">Resumen de <span className="text-[var(--primary)] italic">Activos</span></h1>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-2.5 bg-[var(--surface-alt)] border border-[var(--outline-color)] text-[var(--text-main)] rounded-xl font-inter font-semibold text-[10px] uppercase tracking-wider hover:brightness-105 active:scale-[0.98] transition-all shadow-sm">Exportar PDF</button>
           <button className="px-5 py-2.5 bg-[var(--primary)] text-[#1A202C] rounded-xl font-inter font-semibold text-[10px] uppercase tracking-wider hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-[var(--primary)]/10">Nueva Actividad</button>
        </div>
      </div>

      {/* --- KPI CARDS (Theme Aware) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Instrumentos', val: kpis.total, icon: <Layers />, color: 'var(--primary)', trend: '+12%' },
          { label: 'Estado Activo', val: kpis.vigentes, icon: <CheckCircle />, color: 'var(--primary)', trend: '94.2%' },
          { label: 'Próx. Vencimientos', val: kpis.proximos, icon: <Clock />, color: 'var(--tertiary)', trend: '-5%' },
          { label: 'Alertas Críticas', val: kpis.vencidos, icon: <AlertCircle />, color: 'var(--error)', trend: 'Revisión' },
        ].map((k, i) => (
          <div key={i} className="premium-card p-6 flex flex-col justify-between h-40 group hover:border-[var(--primary)]/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--primary)]/[0.03] transition-all duration-300">
            <div className="flex justify-between items-start">
               <div className="p-2.5 rounded-xl bg-[var(--surface-alt)] text-[var(--text-muted)] group-hover:bg-[var(--primary)] group-hover:text-[#1A202C] transition-all duration-300 shadow-sm">
                  {React.cloneElement(k.icon, { size: 20 })}
               </div>
               <span className="font-data font-bold text-[9px] px-2.5 py-0.5 rounded-full bg-[var(--background)] border border-[var(--outline-color)] text-[var(--text-main)] tracking-wider">
                  {k.trend}
               </span>
            </div>
            <div>
               <p className="font-inter font-medium text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{k.label}</p>
               <p className="font-data font-extrabold text-3xl text-[var(--text-main)] tracking-tight">{k.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-12 gap-6">
        
        <div className="col-span-12 lg:col-span-8 premium-card p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
             <div>
                <h3 className="font-outfit font-bold text-[var(--text-main)] text-lg uppercase tracking-tight">Cumplimiento del Cronograma</h3>
                <p className="font-inter font-medium text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Planeado vs Ejecutado</p>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                   <span className="font-inter font-semibold text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Real</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[var(--text-main)]"></div>
                   <span className="font-inter font-semibold text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Plan</span>
                </div>
             </div>
          </div>
          <div className="h-[320px] min-h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fontFamily: 'Roboto Mono', fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fontFamily: 'Roboto Mono', fill: 'var(--text-muted)' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--surface-alt)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderRadius: '12px', 
                    border: '1px solid var(--outline-color)', 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
                    padding: '10px 14px',
                    fontFamily: 'Inter',
                    fontSize: '11px',
                    color: 'var(--text-main)'
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Bar dataKey="real" fill="#78B7D0" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="plan" fill="var(--text-main)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 premium-card p-6 lg:p-8 shadow-sm flex flex-col items-center justify-between gap-6">
           <div className="w-full text-left">
              <h3 className="font-outfit font-bold text-[var(--text-main)] text-lg uppercase tracking-tight">Estado del Activo</h3>
              <p className="font-inter font-medium text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Conformidad Global</p>
           </div>
           
           <div className="relative flex items-center justify-center h-[220px] min-h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                 <span className="font-data font-extrabold text-3xl text-[var(--text-main)] leading-none tracking-tight">94%</span>
                 <span className="font-inter font-semibold text-[9px] text-[var(--success)] uppercase tracking-widest mt-1">Global</span>
              </div>
           </div>

           <div className="w-full space-y-1.5">
              {pieData.map((d, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 rounded-xl hover:bg-[var(--surface-alt)] transition-colors">
                   <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                      <span className="font-inter font-semibold text-[9px] text-[var(--text-muted)] uppercase tracking-wider">{d.name}</span>
                   </div>
                   <span className="font-data font-bold text-xs text-[var(--text-main)]">{d.value}</span>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* --- IA VERIFICATION ENGINE (Premium Section) --- */}
      <section className="premium-card p-8 lg:p-10 bg-[var(--secondary)] text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="white" strokeWidth="0.1"/></svg>
         </div>
         
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
            <div className="max-w-md font-inter">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-primary/20 text-primary rounded-lg flex items-center justify-center border border-primary/30">
                     <Cpu size={20} className="animate-pulse" />
                  </div>
                  <h3 className="font-outfit font-bold text-lg tracking-wider uppercase">MJM Metrology Bot</h3>
               </div>
               <p className="text-primary text-sm font-medium opacity-80 leading-relaxed mb-6">
                 Análisis automático de certificados bajo ISO 10012:2026. El motor Gemini está validando la consistencia de tus activos.
               </p>
               <div className="flex gap-4">
                  <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl">
                     <p className="font-inter font-semibold text-[9px] text-primary uppercase tracking-wider mb-1">Incertidumbre Promedio</p>
                     <p className="font-data font-bold text-lg">0.00042 <span className="font-inter text-[10px] opacity-40 font-medium">µm</span></p>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl">
                     <p className="font-inter font-semibold text-[9px] text-primary uppercase tracking-wider mb-1">Ahorro en Validación</p>
                     <p className="font-data font-bold text-lg">94.2 <span className="font-inter text-[10px] opacity-40 font-medium">%</span></p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
               {[
                 { label: 'CONFORME', val: '88%', color: 'bg-emerald-500', icon: <ShieldCheck size={14}/> },
                 { label: 'NO CONFORME', val: '12%', color: 'bg-error', icon: <AlertCircle size={14}/> },
               ].map((sem, i) => (
                 <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-2xl min-w-[170px] hover:bg-white/20 transition-all">
                    <div className="flex items-center justify-between mb-3.5">
                       <div className={`w-2.5 h-2.5 rounded-full ${sem.color} shadow-md animate-pulse`}></div>
                       <span className="text-white opacity-40">{sem.icon}</span>
                    </div>
                    <p className="font-inter font-semibold text-[9px] tracking-wider uppercase mb-1">{sem.label}</p>
                    <p className="font-data font-extrabold text-2xl tracking-tight">{sem.val}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- FOOTER BANNER --- */}
      <div className="bg-[var(--sidebar-bg)] rounded-3xl p-8 lg:p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group shadow-xl transition-colors duration-500">
         <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary)]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 bg-[var(--primary)]/20 rounded-2xl flex items-center justify-center text-[var(--primary)] shadow-xl">
               <ShieldCheck size={32} />
            </div>
            <div className="font-inter">
               <h3 className="font-outfit font-bold text-xl tracking-tight mb-1.5 uppercase">Protocolo ISO 10012:2026</h3>
               <p className="text-[var(--primary)] text-sm font-medium opacity-80 max-w-md leading-relaxed tracking-wide">
                  Tu sistema está operando bajo estándares internacionales. Los certificados de este mes están validados al 100%.
               </p>
            </div>
         </div>
         <button className="relative z-10 bg-[var(--primary)] text-[#1A202C] px-8 py-3.5 rounded-xl font-inter font-semibold text-[10px] uppercase tracking-wider shadow-lg shadow-[var(--primary)]/15 hover:brightness-105 active:scale-95 transition-all whitespace-nowrap">
            <div className="flex items-center gap-2.5">
               <FileText size={16} /> Ver Protocolo de Calidad
            </div>
         </button>
      </div>

    </div>
  );
}
