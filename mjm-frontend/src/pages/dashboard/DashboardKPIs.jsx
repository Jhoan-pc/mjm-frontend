import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { AlertCircle, CheckCircle, Clock, ShieldCheck, Activity, TrendingUp, TrendingDown, Layers, FileText, Cpu, AlertTriangle, Eye, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { useNavigate } from 'react-router-dom';

export default function DashboardKPIs() {
  const { tenant, isSuperAdmin } = useAuthStore();
  const { instruments, activities, loadInstruments, loadActivities } = useInventoryStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (tenant) {
      const unsubInst = loadInstruments(tenant.id, isSuperAdmin);
      const unsubAct = loadActivities(tenant.id, isSuperAdmin);
      return () => {
        if (unsubInst) unsubInst();
        if (unsubAct) unsubAct();
      };
    }
  }, [tenant, isSuperAdmin, loadInstruments, loadActivities]);

  // --- DINAMIC METRIC CALCULATIONS (ISO 10012 LOGIC) ---
  const metrologyMetrics = React.useMemo(() => {
    const total = instruments.length;
    
    // 1. Tasa de Conformidad Metrológica (Cl. 7.1)
    let conformCount = 0;
    let nonConformCount = 0;
    let warningCount = 0; 
    
    instruments.forEach(inst => {
      const history = inst.historial || [];
      const latest = history[0];
      
      if (latest) {
        if (latest.declaracion_conformidad === 'No Conforme' || inst.estado_funcional === 'NO CONFORME') {
          nonConformCount++;
        } else {
          conformCount++;
          const err = parseFloat(latest.error) || 0;
          const unc = parseFloat(latest.incertidumbre) || 0;
          const tol = parseFloat(inst.tolerancia_proceso) || parseFloat(latest.process_tolerance) || 0;
          if (tol > 0 && (err + unc) > 0.8 * tol) {
            warningCount++;
          }
        }
      } else {
        if (inst.estado === 'Vencido') {
          nonConformCount++;
        } else {
          conformCount++;
        }
      }
    });

    const conformityRate = total > 0 ? Math.round((conformCount / total) * 100) : 100;

    // 2. Schedule Compliance Rate (Cl. 7.1.2)
    const doneActivities = activities.filter(a => a.estado === 'done');
    const totalActivities = activities.length;
    const scheduleCompliance = totalActivities > 0 ? Math.round((doneActivities.length / totalActivities) * 100) : 100;

    // Individual speedmeter metrics
    const getComplianceByType = (typeLabel) => {
      const filtered = activities.filter(a => a.tipo === typeLabel);
      const completed = filtered.filter(a => a.estado === 'done');
      return {
        rate: filtered.length > 0 ? Math.round((completed.length / filtered.length) * 100) : 100,
        done: completed.length,
        total: filtered.length
      };
    };

    const calibracion = getComplianceByType('Calibración');
    const verificacion = getComplianceByType('Verificación');
    const mantenimiento = getComplianceByType('Mantenimiento');

    const overdueCount = instruments.filter(i => i.estado === 'Vencido').length;
    const upcomingCount = instruments.filter(i => i.estado === 'Próximo Vencimiento').length;

    return {
      total,
      conformCount,
      nonConformCount,
      warningCount,
      conformityRate,
      scheduleCompliance,
      calibracion,
      verificacion,
      mantenimiento,
      overdueCount,
      upcomingCount
    };
  }, [instruments, activities]);

  // --- MONTHLY AGGREGATION FOR PLAN VS REAL (2026) ---
  const monthlyChartData = React.useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    const data = months.map((monthName, index) => {
      const plannedList = activities.filter(a => {
        if (!a.fechaProgramada) return false;
        const [y, m] = a.fechaProgramada.split('-').map(Number);
        return y === currentYear && (m - 1) === index;
      });

      const realList = plannedList.filter(a => a.estado === 'done');

      return {
        name: monthName,
        plan: plannedList.length,
        real: realList.length
      };
    });

    return data;
  }, [activities]);

  // --- CRITICALITY MIX ---
  const criticalityData = React.useMemo(() => {
    const high = instruments.filter(i => i.criticidad === 'ALTA' || i.riesgo_operativo === 'Alta' || i.riesgo_operativo === 'Crítica').length;
    const medium = instruments.filter(i => i.criticidad === 'MEDIA' || i.riesgo_operativo === 'Media' || (!i.criticidad && !i.riesgo_operativo)).length;
    const low = instruments.filter(i => i.criticidad === 'BAJA' || i.riesgo_operativo === 'Baja').length;

    return [
      { name: 'Alta/Crítica', value: high, color: '#BA1A1A' },
      { name: 'Media', value: medium, color: '#E3A06D' },
      { name: 'Baja', value: low, color: '#78B7D0' }
    ];
  }, [instruments]);

  // --- RADAR DATA FOR INSTRUMENTS BY MAGNITUDE ---
  const magnitudeRadarData = React.useMemo(() => {
    const counts = {};
    instruments.forEach(i => {
      const mag = i.magnitud || i.magnitud_asociada || 'OTRA';
      const formatted = mag.toUpperCase();
      counts[formatted] = (counts[formatted] || 0) + 1;
    });

    const standardMags = ['MASA', 'TEMPERATURA', 'PRESIÓN', 'LONGITUD', 'ELÉCTRICA', 'HUMEDAD'];
    const maxVal = Math.max(5, ...Object.values(counts));

    return standardMags.map(mag => ({
      subject: mag,
      A: counts[mag] || 0,
      fullMark: maxVal
    }));
  }, [instruments]);

  // --- METROLOGICAL WARNINGS LIST ---
  const metrologicalAlerts = React.useMemo(() => {
    const list = [];
    instruments.forEach(inst => {
      const history = inst.historial || [];
      const latest = history[0];
      
      let type = '';
      let desc = '';
      
      if (inst.estado === 'Vencido') {
        type = 'danger';
        desc = 'Calibración Expirada';
      } else if (latest && latest.declaracion_conformidad === 'No Conforme') {
        type = 'danger';
        desc = 'Último certificado NO CONFORME';
      } else if (inst.estado_funcional === 'NO CONFORME') {
        type = 'danger';
        desc = 'Marcado fuera de servicio';
      } else {
        const err = parseFloat(latest?.error) || 0;
        const unc = parseFloat(latest?.incertidumbre) || 0;
        const tol = parseFloat(inst.tolerancia_proceso) || parseFloat(latest?.process_tolerance) || 0;
        if (tol > 0 && (err + unc) > 0.8 * tol) {
          type = 'warning';
          desc = `Alerta de Deriva (${Math.round(((err + unc) / tol) * 100)}% del MPE)`;
        }
      }

      if (type) {
        list.push({
          id: inst.id,
          codigo: inst.codigo || inst.codigoMJM || 'S/N',
          nombre: inst.nombre || 'Instrumento sin nombre',
          ubicacion: inst.ubicacion || inst.proceso || 'Planta Dorada',
          alerta: desc,
          tipo: type,
          fechaVencimiento: inst.fecha_vencimiento || 'Pendiente'
        });
      }
    });
    return list.slice(0, 5);
  }, [instruments]);

  // Helper Speedometer UI Renderer (Refined High-Density Linear Metric)
  const renderSpeedometer = (title, data) => {
    const rate = data.rate;
    return (
      <div className="flex flex-col justify-between p-3.5 bg-[var(--surface-alt)]/60 border border-[var(--outline-color)] rounded-xl relative">
        <div className="flex items-center justify-between">
          <span className="font-space font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{title}</span>
          <span className="font-mono font-bold text-[9px] text-[var(--text-muted)] px-1.5 py-0.2 rounded bg-[var(--background)] border border-[var(--outline-color)]">
            {data.done}/{data.total}
          </span>
        </div>
        <div className="my-2 flex items-baseline justify-between">
          <span className="font-data font-bold text-2xl text-[var(--text-main)] tracking-tight">{rate}%</span>
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Cumplimiento</span>
        </div>
        <div className="w-full bg-[var(--background)] h-1.5 rounded-full overflow-hidden border border-[var(--outline-color)]/50">
          <div 
            className="h-full bg-mjm-navy dark:bg-[#f7931b] rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
           <h1 className="font-space font-bold text-[var(--text-main)] text-xl sm:text-2xl tracking-tight uppercase">
             Control Metrológico <span className="text-mjm-navy dark:text-[#f7931b]">y Aseguramiento</span>
           </h1>
           <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
             Sistema de Gestión de Mediciones ISO 10012:2003 &bull; Cláusula 7.1
           </p>
        </div>
      </div>

      {/* --- KPI CARDS (Swiss High-Density Standard) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { 
            label: 'Confirmación Metrológica', 
            val: `${metrologyMetrics.conformityRate}%`, 
            icon: <ShieldCheck size={16} />, 
            trend: `${metrologyMetrics.conformCount}/${metrologyMetrics.total} Activos`,
            desc: 'Aptitud metrológica (ISO 10012)',
            dot: 'bg-emerald-500'
          },
          { 
            label: 'Cumplimiento Cronograma', 
            val: `${metrologyMetrics.scheduleCompliance}%`, 
            icon: <CheckCircle size={16} />, 
            trend: 'Planeado vs Real',
            desc: 'Intervenciones anuales cerradas',
            dot: 'bg-blue-500'
          },
          { 
            label: 'Retrasos / Vencidos', 
            val: metrologyMetrics.overdueCount, 
            icon: <Clock size={16} />, 
            trend: `+${metrologyMetrics.upcomingCount} por vencer`,
            desc: 'Calibración expirada sin cierre',
            dot: metrologyMetrics.overdueCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
          },
          { 
            label: 'Alertas de Deriva', 
            val: metrologyMetrics.warningCount, 
            icon: <AlertTriangle size={16} />, 
            trend: 'Error > 80% Tol.',
            desc: 'Instrumentos al límite del proceso',
            dot: metrologyMetrics.warningCount > 0 ? 'bg-amber-500' : 'bg-slate-400'
          },
        ].map((k, i) => (
          <div key={i} className="premium-card p-3.5 flex flex-col justify-between h-28 relative group hover:border-blue-500/40 dark:hover:border-[#f7931b]/40 transition-all">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-1.5 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
                  {k.icon}
                  <span className="font-space font-bold text-[10px] uppercase tracking-wider">{k.label}</span>
               </div>
               <span className="font-mono text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--outline-color)] text-[var(--text-main)] tracking-tight">
                  {k.trend}
               </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
               <span className="font-data font-bold text-2xl sm:text-3xl text-[var(--text-main)] tracking-tight leading-none">{k.val}</span>
               <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${k.dot}`} />
                  <span className="text-[8.5px] text-[var(--text-muted)] font-mono uppercase tracking-tight">{k.desc}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- CHARTS ROW 1 --- */}
      <div className="grid grid-cols-12 gap-3">
        
        {/* Plan vs Real Chart */}
        <div className="col-span-12 lg:col-span-8 premium-card p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 pb-2 border-b border-[var(--outline-color)]">
             <div>
                <h3 className="font-space font-bold text-[var(--text-main)] text-sm uppercase tracking-tight">Cumplimiento del Plan Metrológico</h3>
                <p className="font-inter font-medium text-[9.5px] text-[var(--text-muted)] uppercase tracking-wider">Planeado vs Real de Intervenciones 2026</p>
             </div>
             <div className="flex gap-3">
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded bg-mjm-navy dark:bg-sky-400"></div>
                   <span className="font-space font-bold text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Realizado</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded bg-[#78B7D0] dark:bg-[#f7931b]"></div>
                   <span className="font-space font-bold text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Programado</span>
                </div>
             </div>
          </div>
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9.5, fontWeight: 600, fontFamily: 'Roboto Mono', fill: 'var(--text-muted)' }} dy={5} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9.5, fontWeight: 600, fontFamily: 'Roboto Mono', fill: 'var(--text-muted)' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--surface-alt)', opacity: 0.6 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderRadius: '10px', 
                    border: '1px solid var(--outline-color)', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                    padding: '8px 12px',
                    fontFamily: 'Inter',
                    fontSize: '11px',
                    color: 'var(--text-main)'
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Bar dataKey="real" fill="#1E3A5F" radius={[3, 3, 0, 0]} barSize={11} name="Realizado" />
                <Bar dataKey="plan" fill="#78B7D0" radius={[3, 3, 0, 0]} barSize={11} name="Programado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Criticality Chart */}
        <div className="col-span-12 lg:col-span-4 premium-card p-4 sm:p-5 shadow-xs flex flex-col justify-between">
           <div className="w-full text-left pb-2 border-b border-[var(--outline-color)] mb-2">
              <h3 className="font-space font-bold text-[var(--text-main)] text-sm uppercase tracking-tight">Criticidad Operativa</h3>
              <p className="font-inter font-medium text-[9.5px] text-[var(--text-muted)] uppercase tracking-wider">Distribución por Nivel de Riesgo</p>
           </div>
           
           <div className="relative flex items-center justify-center h-[130px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={criticalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={58}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {criticalityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    position={{ x: 10, y: 10 }}
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)', 
                      borderRadius: '10px', 
                      border: '1px solid var(--outline-color)', 
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)', 
                      padding: '6px 10px',
                      fontFamily: 'Inter',
                      fontSize: '10px',
                      color: 'var(--text-main)'
                    }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                 <span className="font-data font-bold text-xl text-[var(--text-main)] leading-none tracking-tight">
                   {instruments.length || 0}
                 </span>
                 <span className="font-mono text-[7.5px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Equipos</span>
              </div>
           </div>

           <div className="w-full space-y-1 mt-2">
              {criticalityData.map((d, i) => (
                <div key={i} className="flex justify-between items-center py-1 px-2 rounded-md hover:bg-[var(--surface-alt)] transition-colors text-xs">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></div>
                      <span className="font-space font-semibold text-[9.5px] text-[var(--text-muted)] uppercase tracking-wide">{d.name}</span>
                   </div>
                   <span className="font-mono font-bold text-[10.5px] text-[var(--text-main)]">{d.value}</span>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* --- CHARTS ROW 2 (Speedometers & Radar) --- */}
      <div className="grid grid-cols-12 gap-3">
        
        {/* Speedmeters (8 cols) */}
        <div className="col-span-12 lg:col-span-8 premium-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="mb-3 pb-2 border-b border-[var(--outline-color)]">
            <h3 className="font-space font-bold text-[var(--text-main)] text-sm uppercase tracking-tight">Desempeño por Tipo de Rutina</h3>
            <p className="font-inter font-medium text-[9.5px] text-[var(--text-muted)] uppercase tracking-wider">Tasa de cumplimiento en Calibración, Verificación y Mantenimiento</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {renderSpeedometer('Calibración', metrologyMetrics.calibracion)}
            {renderSpeedometer('Verificación', metrologyMetrics.verificacion)}
            {renderSpeedometer('Mantenimiento', metrologyMetrics.mantenimiento)}
          </div>
        </div>

        {/* Magnitude Radar (4 cols) */}
        <div className="col-span-12 lg:col-span-4 premium-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="w-full text-left pb-2 border-b border-[var(--outline-color)]">
            <h3 className="font-space font-bold text-[var(--text-main)] text-sm uppercase tracking-tight">Magnitudes del Parque</h3>
            <p className="font-inter font-medium text-[9.5px] text-[var(--text-muted)] uppercase tracking-wider">Distribución por variable física</p>
          </div>
          
          <div className="w-full h-40 flex items-center justify-center mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={magnitudeRadarData}>
                <PolarGrid stroke="var(--outline-color)" opacity={0.4} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 8, fontWeight: 600, fontFamily: 'Space Grotesk' }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 7 }} />
                <Radar name="Equipos" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderRadius: '10px', 
                    border: '1px solid var(--outline-color)', 
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)', 
                    padding: '6px 10px',
                    fontFamily: 'Inter',
                    fontSize: '10px',
                    color: 'var(--text-main)'
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* --- METROLOGICAL ALERTS & DRIFT BOARD --- */}
      <section className="premium-card p-4 sm:p-5 shadow-xs">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--outline-color)]">
          <div>
            <h3 className="font-space font-bold text-[var(--text-main)] text-sm uppercase tracking-tight">Alertas Críticas de Conformidad</h3>
            <p className="font-inter font-medium text-[9.5px] text-[var(--text-muted)] uppercase tracking-wider">Equipos con desviaciones detectadas o plazos vencidos</p>
          </div>
          <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-mono font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {metrologicalAlerts.length} Alertas Activas
          </span>
        </div>

        {metrologicalAlerts.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-[var(--outline-color)]">
            <table className="w-full border-collapse table-precision text-xs">
              <thead>
                <tr className="bg-[var(--surface-alt)] border-b border-[var(--outline-color)] text-left">
                  <th className="px-3 py-2 text-left">Código MJM</th>
                  <th className="px-3 py-2 text-left">Instrumento</th>
                  <th className="px-3 py-2 text-left">Ubicación</th>
                  <th className="px-3 py-2 text-left">Diagnóstico de Alerta</th>
                  <th className="px-3 py-2 text-center">Vencimiento</th>
                  <th className="px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-color)]/40 font-inter">
                {metrologicalAlerts.map((alert, index) => (
                  <tr key={index} className="hover:bg-[var(--surface-alt)]/50 transition-colors">
                    <td className="px-3 py-2 font-mono font-bold text-[11px] text-[var(--text-main)]">{alert.codigo}</td>
                    <td className="px-3 py-2 font-bold text-[var(--text-main)]">{alert.nombre}</td>
                    <td className="px-3 py-2 text-[var(--text-muted)] text-[11px]">{alert.ubicacion}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 font-mono font-bold text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded ${
                        alert.tipo === 'danger' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        <AlertCircle size={9} /> {alert.alerta}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-center text-[var(--text-muted)]">{alert.fechaVencimiento}</td>
                    <td className="px-3 py-2 text-right">
                      <button 
                        onClick={() => navigate(`/dashboard/inventario/${alert.id}`)}
                        className="p-1 rounded-md bg-[var(--surface-alt)] border border-[var(--outline-color)] text-[var(--text-muted)] hover:text-blue-600 dark:hover:text-[#f7931b] transition-all"
                        title="Ver Hoja de Vida"
                      >
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 border border-dashed border-[var(--outline-color)] rounded-xl bg-[var(--surface-alt)]/20">
            <CheckCircle size={28} className="text-emerald-500 mb-1" />
            <p className="font-space font-bold text-xs text-[var(--text-main)] uppercase tracking-tight">Aseguramiento al Día</p>
            <p className="font-inter text-[10px] text-[var(--text-muted)]">No se detectaron desviaciones, derivas críticas ni equipos con plazos vencidos.</p>
          </div>
        )}
      </section>

      {/* --- IA VERIFICATION ENGINE (Compact Luxury Card) --- */}
      <section className="premium-card p-5 sm:p-6 bg-gradient-to-br from-[#0B132B] to-[#1E3A5F] text-white relative overflow-hidden group shadow-md">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div className="max-w-xl font-inter">
               <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 bg-white/10 text-[#f7931b] rounded-lg flex items-center justify-center border border-white/10 shadow-xs">
                     <Cpu size={16} className="animate-pulse" />
                  </div>
                  <h3 className="font-space font-bold text-sm tracking-wider uppercase">Confirmación Metrológica IA</h3>
               </div>
               <p className="text-slate-300 text-xs font-normal opacity-90 leading-relaxed mb-4">
                 Extracción y validación automática de errores e incertidumbre en certificados PDF contra tolerancias de proceso bajo norma ISO 10012.
               </p>
               <div className="flex gap-3">
                  <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-lg">
                     <p className="font-mono text-[8px] text-slate-400 uppercase tracking-wider mb-0.5">Ahorro Administrativo</p>
                     <p className="font-mono font-bold text-base text-white">94.2%</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-lg">
                     <p className="font-mono text-[8px] text-slate-400 uppercase tracking-wider mb-0.5">Tolerancia Promedio</p>
                     <p className="font-mono font-bold text-base text-white">0.25 EMP</p>
                  </div>
               </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto shrink-0">
               {[
                 { label: 'CONFORME', val: `${metrologyMetrics.conformityRate}%`, color: 'bg-emerald-500', icon: <ShieldCheck size={13}/> },
                 { label: 'DESVIADO / FUERA', val: `${100 - metrologyMetrics.conformityRate}%`, color: 'bg-red-500', icon: <AlertCircle size={13}/> },
               ].map((sem, i) => (
                 <div key={i} className="flex-1 bg-white/10 backdrop-blur-sm border border-white/10 p-3.5 rounded-xl min-w-[130px] hover:bg-white/15 transition-all">
                    <div className="flex items-center justify-between mb-2">
                       <div className={`w-2 h-2 rounded-full ${sem.color} shadow-xs`}></div>
                       <span className="text-white/40">{sem.icon}</span>
                    </div>
                    <p className="font-space font-semibold text-[8px] tracking-wider uppercase text-slate-300 mb-0.5">{sem.label}</p>
                    <p className="font-data font-bold text-xl text-white tracking-tight">{sem.val}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

    </div>
  );
}
