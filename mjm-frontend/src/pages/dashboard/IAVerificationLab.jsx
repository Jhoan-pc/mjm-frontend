import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileUp, 
  ShieldCheck, 
  Cpu, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  ArrowRight,
  FileText,
  Microscope,
  Database,
  Lock,
  X
} from 'lucide-react';

// --- SUB-COMPONENTE: COMPARADOR ISO ---
const ISOComparator = ({ extracted, required }) => {
  const compliance = extracted <= required;
  return (
    <div className="bg-white border border-outline/20 rounded-2xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Análisis de Conformidad ISO 10012</h3>
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${compliance ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' : 'bg-error/10 text-error border border-error/20'}`}>
          {compliance ? 'CONFORME' : 'NO CONFORME'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral opacity-20">
          <ArrowRight size={24} />
        </div>
        
        <div className="space-y-1">
          <p className="text-[9px] text-neutral font-black uppercase tracking-widest opacity-60">Tolerancia Proceso</p>
          <p className="text-3xl font-black text-secondary tracking-tighter">± {required}</p>
        </div>
        
        <div className="space-y-1 text-right">
          <p className="text-[9px] text-neutral font-black uppercase tracking-widest opacity-60">Incertidumbre Gemini</p>
          <p className={`text-3xl font-black tracking-tighter ${compliance ? 'text-primary' : 'text-error'}`}>{extracted}</p>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-outline/10 text-center">
        <p className="text-xs text-neutral italic font-medium">
          {compliance 
            ? "Veredicto: El activo mantiene su capacidad de medición dentro del rango de seguridad establecido." 
            : "Veredicto: Se ha detectado una desviación crítica. Se recomienda el retiro inmediato del activo."}
        </p>
      </div>
    </div>
  );
};

export default function IAVerificationLab() {
  const [status, setStatus] = useState('idle'); // idle, scanning, verified

  const startScan = useCallback(() => {
    setStatus('scanning');
    setTimeout(() => setStatus('verified'), 3500); 
  }, []);

  return (
    <div className="space-y-gutter animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-1">MJM AI Verification Lab</p>
           <h1 className="font-black text-[var(--text-main)] text-4xl tracking-tighter uppercase">Motor de <span className="text-[var(--primary)] italic">Cumplimiento</span></h1>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl border border-outline/20 shadow-sm">
              <Database size={16} className="text-primary" />
              <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Model: Gemini 1.5 Pro</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-gutter min-h-[600px]">
        
        {/* --- PANEL IZQUIERDO: SCANNING AREA --- */}
        <section className="col-span-12 lg:col-span-8 space-y-gutter flex flex-col">
          
          <div className={`relative flex-1 bg-white border-2 border-dashed transition-all duration-500 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden ${status === 'scanning' ? 'border-primary shadow-2xl shadow-primary/10' : 'border-outline/30 hover:border-primary/50'}`}>
            
            {/* Background Animation for Scanning */}
            <AnimatePresence>
              {status === 'scanning' && (
                <motion.div 
                  initial={{ top: '-10%' }}
                  animate={{ top: '110%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[150px] bg-gradient-to-b from-transparent via-primary/10 to-transparent z-10 pointer-events-none border-t border-primary/20"
                />
              )}
            </AnimatePresence>

            <div className="relative z-20 text-center px-12 py-20">
              {status === 'idle' && (
                <>
                  <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-8 border border-outline/20 group cursor-pointer hover:scale-105 transition-transform shadow-xl">
                    <FileUp size={40} className="text-primary group-hover:animate-bounce" />
                  </div>
                  <h2 className="font-bold text-secondary text-2xl tracking-tight mb-2">Soltar Certificado de Calibración</h2>
                  <p className="text-neutral text-sm mb-10 max-w-sm mx-auto leading-relaxed">Arrastra el archivo PDF para que Gemini extraiga automáticamente los valores de error e incertidumbre.</p>
                  <button onClick={startScan} className="btn-inverted py-5 px-12 shadow-2xl shadow-secondary/20">
                    INICIAR ANÁLISIS IA
                  </button>
                </>
              )}

              {status === 'scanning' && (
                <div className="space-y-8">
                  <div className="flex justify-center gap-6">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="p-6 bg-primary/10 rounded-full text-primary shadow-lg">
                       <Microscope size={48} />
                    </motion.div>
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, delay: 0.5 }} className="p-6 bg-surface rounded-full text-neutral border border-outline/20 shadow-lg">
                       <Search size={48} />
                    </motion.div>
                  </div>
                  <h2 className="text-2xl font-black text-secondary tracking-tighter uppercase animate-pulse">Analizando Estructura Metrológica...</h2>
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-outline/20 shadow-inner">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3.5 }}
                        className="h-full bg-primary" 
                       />
                    </div>
                    <p className="text-[10px] text-neutral font-black uppercase tracking-[0.3em]">IA Pattern Recognition in progress</p>
                  </div>
                </div>
              )}

              {status === 'verified' && (
                <div className="space-y-10 animate-in zoom-in duration-500 py-10">
                  <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 ring-8 ring-primary/10 transition-transform hover:scale-110">
                    <ShieldCheck size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-secondary tracking-tighter uppercase">Validación Completada</h2>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setStatus('idle')} className="btn-secondary py-4 px-10">SUBIR OTRO</button>
                    <button className="btn-primary py-4 px-10">GUARDAR RESULTADOS</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison View (Only when verified) */}
          {status === 'verified' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <ISOComparator extracted={0.00042} required={0.00050} />
            </div>
          )}
        </section>

        {/* --- PANEL DERECHO: AI INSIGHTS --- */}
        <aside className="col-span-12 lg:col-span-4 space-y-gutter flex flex-col">
           
           <div className="bg-white rounded-[2.5rem] p-10 border border-outline/20 flex-1 shadow-xl flex flex-col">
              <div className="flex items-center gap-4 mb-10 border-b border-outline/10 pb-6">
                 <div className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Cpu size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-secondary text-lg">Gemini Meta-Data</h3>
                    <p className="text-[10px] text-neutral font-black uppercase tracking-widest">Extracción en tiempo real</p>
                 </div>
              </div>

              <div className="space-y-8 flex-1">
                 {[
                   { label: 'Número de Certificado', val: status === 'verified' ? 'CERT-2026-9923' : '---', icon: <FileText size={18}/> },
                   { label: 'Laboratorio Emisor', val: status === 'verified' ? 'Metrología Avanzada S.A.' : '---', icon: <Building2 size={18}/> },
                   { label: 'Fecha de Calibración', val: status === 'verified' ? '14 Mayo 2026' : '---', icon: <Calendar size={18}/> },
                   { label: 'Incertidumbre (k=2)', val: status === 'verified' ? '0.00042 mm' : '---', icon: <Zap size={18}/> },
                 ].map((insight, i) => (
                   <div key={i} className="flex items-start gap-6 group hover:bg-surface/50 p-2 rounded-2xl transition-all">
                      <div className="text-primary group-hover:scale-110 transition-transform mt-1">{insight.icon}</div>
                      <div>
                         <p className="text-[10px] font-black text-neutral opacity-40 uppercase tracking-widest mb-1">{insight.label}</p>
                         <p className={`text-sm font-bold ${status === 'verified' ? 'text-secondary' : 'text-neutral/20'}`}>{insight.val}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-6 bg-surface border border-outline/20 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Lock size={60} />
                 </div>
                 <div className="flex items-center gap-2 mb-3 relative z-10">
                    <Lock size={14} className="text-secondary" />
                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Protocolo de Privacidad</span>
                 </div>
                 <p className="text-[11px] text-neutral leading-relaxed relative z-10">
                    Los datos extraídos son procesados bajo el esquema de seguridad corporativa. MJM no comparte información técnica con modelos externos.
                 </p>
              </div>
           </div>

        </aside>
      </div>

    </div>
  );
}

// Helpers
const Building2 = ({size, className}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>;
const Calendar = ({size, className}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
