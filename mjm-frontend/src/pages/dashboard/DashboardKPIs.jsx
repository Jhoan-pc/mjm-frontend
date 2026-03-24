import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function DashboardKPIs() {
  const tenant = useAuthStore(state => state.tenant);

  // Simulated DB data
  const kpis = {
    total: 120,
    calibrados: 98,
    proximos: 15,
    vencidos: 7
  };

  const chartData = [
    { name: 'Ene', calibrados: 12 }, { name: 'Feb', calibrados: 19 },
    { name: 'Mar', calibrados: 10 }, { name: 'Abr', calibrados: 25 },
    { name: 'May', calibrados: 32 }
  ];

  const pieData = [
    { name: 'Calibrados', value: kpis.calibrados, color: '#10B981' }, // emerald-500
    { name: 'Por Vencer (<30d)', value: kpis.proximos, color: '#F59E0B' }, // amber-500
    { name: 'Vencidos', value: kpis.vencidos, color: '#EF4444' } // red-500
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Status Metrológico</h1>
          <p className="text-gray-500 mt-1">Resumen general de los equipos bajo nuestro alcance.</p>
        </div>
        <button 
          className="px-4 py-2 text-white font-medium rounded shadow-md"
          style={{ backgroundColor: 'var(--tenant-main)' }}
        >
          Generar Reporte Mensual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Total Equipos</p>
          <p className="text-3xl font-bold mt-2">{kpis.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-emerald-500 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Vigentes (100%)</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{kpis.calibrados}</p>
          </div>
          <CheckCircle className="text-emerald-100 w-12 h-12" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Próx. Vencimiento</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{kpis.proximos}</p>
          </div>
          <Clock className="text-amber-100 w-12 h-12" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-red-500 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Vencidos / Fuera de Uso</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{kpis.vencidos}</p>
          </div>
          <AlertCircle className="text-red-100 w-12 h-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Ejecución de Mantenimientos (YTD)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="calibrados" fill={'var(--tenant-main)'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <h3 className="text-lg font-bold text-gray-800 mb-2">Ratio de Cumplimiento</h3>
           <p className="text-sm text-gray-500 mb-6">Distribución actual del estado de los equipos.</p>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip wrapperStyle={{ outline: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
           
           <div className="flex flex-col gap-2 mt-2">
             {pieData.map((data, i) => (
               <div key={i} className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: data.color}}></div>
                   <span className="text-gray-600 font-medium">{data.name}</span>
                 </div>
                 <span className="font-bold text-gray-900">{data.value}</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
