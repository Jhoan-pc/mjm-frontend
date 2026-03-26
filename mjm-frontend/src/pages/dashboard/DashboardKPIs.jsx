import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useInventoryStore } from '../../store/inventoryStore';

export default function DashboardKPIs() {
  const { tenant, isSuperAdmin } = useAuthStore();
  const { instruments, activities, loadInstruments, loadActivities } = useInventoryStore();

  // 🔄 Carga de Datos Reales
  React.useEffect(() => {
    if (tenant) {
      loadInstruments(tenant.id, isSuperAdmin);
      loadActivities(tenant.id, isSuperAdmin);
    }
  }, [tenant, isSuperAdmin, loadInstruments, loadActivities]);

  const kpis = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const next30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Mapear estado REAL de cada instrumento basado en sus actividades
    const instrumentStates = instruments.map(inst => {
      const instActs = activities.filter(a => a.instrumentId === inst.id);
      const isOverdue = instActs.some(a => a.estado !== 'done' && a.fechaProgramada < todayStr);
      const isApproaching = instActs.some(a => a.estado !== 'done' && a.fechaProgramada >= todayStr && a.fechaProgramada <= next30);
      
      if (isOverdue) return 'Vencido';
      if (isApproaching) return 'Próximo Vencimiento';
      return 'Vigente';
    });

    const total = instruments.length;
    const calibrados = instrumentStates.filter(s => s === 'Vigente').length;
    const proximos = instrumentStates.filter(s => s === 'Próximo Vencimiento').length;
    const vencidos = instrumentStates.filter(s => s === 'Vencido').length;
    
    // Distribución de Actividades (Segunda dimensión solicitada)
    const actStats = {
      done: activities.filter(a => a.estado === 'done').length,
      overdue: activities.filter(a => a.estado !== 'done' && a.fechaProgramada < todayStr).length,
      pending: activities.filter(a => a.estado !== 'done' && a.fechaProgramada >= todayStr).length,
    };

    const criticidad = {
      Alta: instruments.filter(i => i.criticidad === 'Alta').length,
      Media: instruments.filter(i => i.criticidad === 'Media').length,
      Baja: instruments.filter(i => i.criticidad === 'Baja').length,
    };

    return { total, calibrados, proximos, vencidos, actStats, criticidad };
  }, [instruments, activities]);

  const chartData = React.useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      
      const monthActs = activities.filter(a => {
        const ad = new Date(a.fechaProgramada);
        return ad.getMonth() === mIdx && ad.getFullYear() === y;
      });

      const ejecutados = monthActs.filter(a => a.estado === 'done').length;
      // Pendientes son aquellas no terminadas (pueden ser futuras o vencidas)
      const pendientes = monthActs.filter(a => a.estado !== 'done').length;

      result.push({
        name: `${months[mIdx]} ${y}`,
        ejecutados,
        pendientes
      });
    }
    return result;
  }, [activities]);

  const pieData = [
    { name: 'Vigentes', value: kpis.calibrados, color: '#10B981' }, 
    { name: 'Por Vencer', value: kpis.proximos, color: '#F59E0B' }, 
    { name: 'Vencidos / Fuera', value: kpis.vencidos, color: '#EF4444' }
  ];

  const activityPieData = [
    { name: 'Ejecutadas', value: kpis.actStats.done, color: '#3B82F6' }, // blue-500
    { name: 'Vencidas', value: kpis.actStats.overdue, color: '#EF4444' }, // red-500
    { name: 'Pendientes', value: kpis.actStats.pending, color: '#94A3B8' } // slate-400
  ];

  const criticalityData = [
    { name: 'Alta', value: kpis.criticidad.Alta, color: '#7C3AED' }, // violet-600
    { name: 'Media', value: kpis.criticidad.Media, color: '#3B82F6' }, // blue-500
    { name: 'Baja', value: kpis.criticidad.Baja, color: '#94A3B8' }   // slate-400
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Status Metrológico</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Resumen general de los equipos bajo nuestro alcance.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="w-full md:w-auto px-6 py-3 text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--tenant-main)' }}
        >
          📄 Generar Reporte Mensual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500 transition-all hover:shadow-md">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Equipos</p>
          <p className="text-4xl font-black mt-2 text-gray-900">{kpis.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-emerald-500 flex justify-between items-center transition-all hover:shadow-md">
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Vigentes (100%)</p>
            <p className="text-4xl font-black text-emerald-600 mt-2">{kpis.calibrados}</p>
          </div>
          <CheckCircle className="text-emerald-100 w-12 h-12" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500 flex justify-between items-center transition-all hover:shadow-md">
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Próx. Vencimiento</p>
            <p className="text-4xl font-black text-amber-600 mt-2">{kpis.proximos}</p>
          </div>
          <Clock className="text-amber-100 w-12 h-12" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-500 flex justify-between items-center transition-all hover:shadow-md">
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Vencidos / Fuera</p>
            <p className="text-4xl font-black text-red-600 mt-2">{kpis.vencidos}</p>
          </div>
          <AlertCircle className="text-red-100 w-12 h-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfica de Ejecución Histórica */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-mjm-navy uppercase tracking-widest mb-1">Cumplimiento de Actividades</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-6">Ejecutadas vs Programadas (Últimos 6 meses)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                <Bar dataKey="ejecutados" name="Ejecutadas" stackId="a" fill={'#10B981'} />
                <Bar dataKey="pendientes" name="Pendientes/Vencidas" stackId="a" fill={'#FEE2E2'} stroke="#EF4444" strokeWidth={1} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#10B981]"></div>
                <span className="text-[10px] font-black uppercase text-gray-400">Ejecutadas</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#FEE2E2] border border-[#EF4444]"></div>
                <span className="text-[10px] font-black uppercase text-gray-400">Pendientes</span>
             </div>
          </div>
        </div>

        {/* Gráficas de Distribución */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Estado de Actividades */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-sm font-black text-mjm-navy uppercase tracking-widest mb-1">Actividades</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">Estado del Cronograma</p>
            <div className="flex-1 flex items-center justify-center min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activityPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                    {activityPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip wrapperStyle={{ outline: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {activityPieData.map((data, i) => (
                <div key={i} className="flex justify-between items-center text-[9px] font-black uppercase">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: data.color}}></div>
                    {data.name}
                  </div>
                  <span className="text-gray-900">{data.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estado General (Vigencia) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-sm font-black text-mjm-navy uppercase tracking-widest mb-1">Equipos</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">Vigencia Metrológica</p>
            <div className="flex-1 flex items-center justify-center min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip wrapperStyle={{ outline: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {pieData.map((data, i) => (
                <div key={i} className="flex justify-between items-center text-[9px] font-black uppercase">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: data.color}}></div>
                    {data.name}
                  </div>
                  <span className="text-gray-900">{data.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribución por Criticidad */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-sm font-black text-mjm-navy uppercase tracking-widest mb-1">Prioridad</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">Nivel de Criticidad</p>
            <div className="flex-1 flex items-center justify-center min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={criticalityData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                    {criticalityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip wrapperStyle={{ outline: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {criticalityData.map((data, i) => (
                <div key={i} className="flex justify-between items-center text-[9px] font-black uppercase">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: data.color}}></div>
                    {data.name}
                  </div>
                  <span className="text-gray-900">{data.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
