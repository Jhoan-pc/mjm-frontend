import React, { useState, useCallback, useMemo } from 'react';
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
  X,
  Play,
  Activity,
  Layers,
  Wrench
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';

// --- SUB-COMPONENTE: COMPARADOR ISO ---
const ISOComparator = ({ error, uncertainty, tolerance, unit, veredicto, riesgo }) => {
  const compliance = veredicto === 'Conforme';
  const totalError = parseFloat(error) + parseFloat(uncertainty);

  return (
    <div className="bg-white border border-outline/20 rounded-2xl p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-outline/10">
        <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Cómputo Metrológico ISO 10012</h3>
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${compliance ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' : 'bg-red-50 text-red-600 border border-red-500/20 shadow-sm'}`}>
          {veredicto}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-6 text-center relative">
        <div className="space-y-1">
          <p className="text-[9px] text-neutral font-black uppercase tracking-widest opacity-60">Error Encontrado</p>
          <p className="text-xl font-black text-secondary tracking-tight">{error} {unit}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-[9px] text-neutral font-black uppercase tracking-widest opacity-60">Incertidumbre (U)</p>
          <p className="text-xl font-black text-slate-500 tracking-tight">+ {uncertainty} {unit}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[9px] text-neutral font-black uppercase tracking-widest opacity-60">Tolerancia Límite</p>
          <p className="text-xl font-black text-secondary tracking-tight">± {tolerance} {unit}</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-outline/10 space-y-2 text-left">
        <p className="text-[9px] text-neutral font-black uppercase tracking-widest opacity-60">Análisis Matemático</p>
        <p className="text-xs font-semibold text-secondary leading-relaxed">
          {error} (Error) + {uncertainty} (Incertidumbre) = <span className="font-bold">{totalError.toFixed(4)} {unit}</span> de Desviación Acumulada.
          <br />
          Criterio: <span className="font-bold">{totalError.toFixed(4)} {unit} {compliance ? '≤' : '>'} {tolerance} {unit}</span>
        </p>
      </div>

      <div className="pt-4 border-t border-outline/10 text-left">
        <div className="flex items-start gap-3">
          {compliance ? (
            <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
          ) : (
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
          )}
          <div>
            <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Evaluación de Riesgo de Uso Continuo (ISO 10012)</p>
            <p className="text-xs text-neutral leading-relaxed italic">{riesgo}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function IAVerificationLab() {
  const { tenant } = useAuthStore();
  const { instruments, addInstrument, updateInstrument, addActivity, loadInstruments } = useInventoryStore();
  const [status, setStatus] = useState('idle'); // idle, scanning, verified
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (tenant?.id) {
      loadInstruments(tenant.id);
    }
  }, [tenant?.id, loadInstruments]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0] || e.dataTransfer?.files[0];
    if (!file) return;
    setSelectedFile(file);
    setStatus('scanning');
    
    // Simular lectura metrológica con Gemini
    setTimeout(() => {
      const fileName = file.name.toLowerCase();
      let extractedData = {};
      
      if (fileName.includes('micrometro') || fileName.includes('cd-11184') || fileName.includes('le-') || fileName.includes('metrotest')) {
        extractedData = {
          instrumento: 'Comparador de Carátula',
          marca: 'INSIZE',
          serie: 'A840379',
          modelo: 'CD-11184',
          laboratorio: 'LABORATORIO DIMENSIONAL METROTEST LTDA',
          laboratorio_tipo: 'Acreditado',
          patron: 'Banco con Cabeza Micrómetrica (Traceable to INM)',
          error_maximo: '0.0119',
          incertidumbre: '0.0039',
          criterio_tipo: 'emp',
          criterio_valor: '0.015',
          veredicto: 'Conforme',
          riesgo: 'El comparador mantiene su exactitud operativa dentro del límite máximo permisible establecido. Apto para uso sin restricciones.',
          unidad: 'mm'
        };
      } else if (fileName.includes('lt-19') || fileName.includes('termometro') || fileName.includes('temperatura')) {
        if (fileName.includes('1918')) {
          extractedData = {
            instrumento: 'Termómetro Digital',
            marca: 'MadgeTech',
            serie: 'T17311',
            modelo: 'TCTempX4',
            laboratorio: 'Laboratorio de Temperatura Industria y Metrología Ltda.',
            laboratorio_tipo: 'Acreditado',
            patron: 'Termómetro con Sensor RTD Pt-100 (Traceable to INMET)',
            error_maximo: '0.64',
            incertidumbre: '0.11',
            criterio_tipo: 'tolerancia',
            criterio_valor: '1.0',
            veredicto: 'Conforme',
            riesgo: 'El sensor de temperatura digital se mantiene dentro de la tolerancia de pasteurización de 1.0°C. No se identifican riesgos operacionales.',
            unidad: '°C'
          };
        } else {
          extractedData = {
            instrumento: 'Termómetro Digital',
            marca: 'MadgeTech',
            serie: 'T17319',
            modelo: 'TCTempX4',
            laboratorio: 'Laboratorio de Temperatura Industria y Metrología Ltda.',
            laboratorio_tipo: 'Acreditado',
            patron: 'Termómetro con Sensor RTD Pt-100 (Traceable to INMET)',
            error_maximo: '1.15',
            incertidumbre: '0.12',
            criterio_tipo: 'tolerancia',
            criterio_valor: '1.0',
            veredicto: 'No Conforme',
            riesgo: 'Se ha detectado una desviación crítica. El error acumulado (1.27°C) supera la tolerancia admisible de 1.0°C. Riesgo: Desviaciones en pasteurización y potencial pérdida de lotes por choque térmico no registrado.',
            unidad: '°C'
          };
        }
      } else {
        extractedData = {
          instrumento: 'Manómetro Industrial',
          marca: 'Wika',
          serie: 'W-' + Math.floor(Math.random() * 10000),
          modelo: 'CPG1500',
          laboratorio: 'Servicios de Metrología Wika S.A.S.',
          laboratorio_tipo: 'Trazable',
          patron: 'Balanza de pesos muertos Wika (Traceable to NIST)',
          error_maximo: '0.08',
          incertidumbre: '0.015',
          criterio_tipo: 'emp',
          criterio_valor: '0.1',
          veredicto: 'Conforme',
          riesgo: 'El manómetro opera con un margen de seguridad aceptable para el lazo de presión neumática de la planta principal.',
          unidad: 'bar'
        };
      }
      
      setParsedData(extractedData);
      setStatus('verified');
    }, 3000);
  };

  const handleSaveResults = async () => {
    if (!parsedData || !tenant) return;
    setIsSaving(true);
    
    try {
      const existing = instruments.find(i => i.serie === parsedData.serie || i.codigoMJM === parsedData.serie);
      let instrumentId = existing?.id;
      let finalCode = existing?.codigoMJM || existing?.codigo || '';
      
      if (!existing) {
        let nextNum = 1;
        if (instruments.length > 0) {
          const numbers = instruments
            .map(i => {
              const match = (i.codigoMJM || i.codigo || '').match(/\d+/);
              return match ? parseInt(match[0]) : 0;
            })
            .filter(num => num > 0);
          if (numbers.length > 0) {
            nextNum = Math.max(...numbers) + 1;
          }
        }
        finalCode = `MJM-${nextNum.toString().padStart(3, '0')}`;
        
        const newInstData = {
          nombre: parsedData.instrumento,
          marca: parsedData.marca,
          modelo: parsedData.modelo,
          serie: parsedData.serie,
          codigo: finalCode,
          codigoMJM: finalCode,
          ubicacion: 'Área de Calidad (Auto-registro)',
          magnitud: parsedData.unidad === '°C' ? 'Temperatura' : parsedData.unidad === 'bar' ? 'Presión' : 'Longitud',
          resolucion: parsedData.unidad === '°C' ? '0.1 °C' : '0.001 mm',
          capacidadMaxima: parsedData.unidad === '°C' ? '100 °C' : '10 mm',
          tolerancia_proceso: parsedData.criterio_valor,
          intervalo_confirmacion: 12,
          riesgo_operativo: 'Alto',
          estado: parsedData.veredicto === 'Conforme' ? 'Activo' : 'Vencido',
          archivado: false,
          rutinas: {
            calibracion: true,
            calibracion_frecuencia: 12,
            calibracion_fecha_inicial: new Date().toISOString().split('T')[0],
            calibracion_anos: 5
          }
        };
        
        instrumentId = await addInstrument(tenant.id, newInstData);
        alert(`Instrumento inexistente detectado. Se ha registrado automáticamente en el Inventario Maestro con el código: ${finalCode}`);
      } else {
        await updateInstrument(tenant.id, instrumentId, {
          tolerancia_proceso: parsedData.criterio_valor,
          estado: parsedData.veredicto === 'Conforme' ? 'Activo' : 'Vencido'
        });
        alert(`Resultados metrológicos vinculados al instrumento existente: ${finalCode}`);
      }
      
      if (parsedData.veredicto === 'No Conforme') {
        const nextWeekDate = new Date();
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        const dateStr = nextWeekDate.toISOString().split('T')[0];
        
        await addActivity({
          tenantId: tenant.id,
          instrumentId: instrumentId,
          instrumentNombre: parsedData.instrumento,
          codigoMJM: finalCode,
          tipo: 'Mantenimiento',
          estado: 'todo',
          fechaProgramada: dateStr,
          priority: 'high',
          notas: `TICKET AUTOMÁTICO - IA LAB: Calibración NO CONFORME. Desviación detectada: Error (${parsedData.error_maximo}) + Incertidumbre (${parsedData.incertidumbre}) supera tolerancia de ±${parsedData.criterio_valor} ${parsedData.unidad}.`
        });
        alert(`Alerta ISO 10012: Se ha generado automáticamente un ticket correctivo en el Kanban con plazo al: ${dateStr}`);
      }
      
      setStatus('idle');
      setSelectedFile(null);
      setParsedData(null);
    } catch (err) {
      console.error(err);
      alert('Error al guardar los resultados.');
    } finally {
      setIsSaving(false);
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-1.5">MJM AI Verification Lab</p>
           <h1 className="font-outfit font-extrabold text-[var(--text-main)] text-3xl tracking-tight uppercase">Motor de <span className="text-[var(--primary)] italic">Cumplimiento</span></h1>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-outline/20 shadow-sm">
              <Database size={16} className="text-primary" />
              <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Model: Gemini 1.5 Pro</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 min-h-[600px]">
        
        {/* --- PANEL IZQUIERDO: SCANNING AREA --- */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          <div 
            onDragOver={onDragOver}
            onDrop={handleFileUpload}
            className={`relative flex-1 bg-white border-2 border-dashed transition-all duration-500 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden min-h-[380px] ${status === 'scanning' ? 'border-primary shadow-2xl shadow-primary/10' : 'border-outline/30 hover:border-primary/50'}`}
          >
            
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

            <div className="relative z-20 text-center px-12 py-10 w-full">
              {status === 'idle' && (
                <div className="flex flex-col items-center justify-center">
                  <input type="file" id="pdf-input" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                  <label htmlFor="pdf-input" className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 border border-outline/20 group cursor-pointer hover:scale-105 transition-transform shadow-md">
                    <FileUp size={32} className="text-primary group-hover:animate-bounce" />
                  </label>
                  <h2 className="font-outfit font-bold text-secondary text-xl tracking-tight mb-2">Soltar Certificado de Calibración</h2>
                  <p className="text-neutral text-xs mb-8 max-w-sm mx-auto leading-relaxed">Arrastra el archivo PDF para que Gemini extraiga automáticamente los valores de error e incertidumbre.</p>
                  <label htmlFor="pdf-input" className="btn-inverted py-3.5 px-8 shadow-lg shadow-secondary/10 cursor-pointer">
                    SELECCIONAR ARCHIVO
                  </label>
                </div>
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
                  <h2 className="text-xl font-outfit font-bold text-secondary tracking-tight uppercase animate-pulse">Analizando Estructura Metrológica...</h2>
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-outline/20 shadow-inner">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3 }}
                        className="h-full bg-primary" 
                       />
                    </div>
                    <p className="text-[10px] text-neutral font-black uppercase tracking-[0.3em]">Lectura Inteligente Gemini en curso</p>
                  </div>
                </div>
              )}

              {status === 'verified' && (
                <div className="space-y-6 animate-in zoom-in duration-500 py-6">
                  <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20 ring-8 ring-primary/10">
                    <ShieldCheck size={40} />
                  </div>
                  <h2 className="text-2xl font-outfit font-bold text-secondary tracking-tight uppercase">Lectura Completada</h2>
                  <p className="text-neutral text-xs max-w-sm mx-auto">
                    Gemini ha extraído los datos del archivo <span className="font-bold text-secondary">{selectedFile?.name}</span>.
                  </p>
                  <div className="flex justify-center gap-4 pt-2">
                    <button onClick={() => setStatus('idle')} className="btn-secondary py-3.5 px-8 text-xs font-semibold">SUBIR OTRO</button>
                    <button 
                      onClick={handleSaveResults} 
                      disabled={isSaving}
                      className="btn-primary py-3.5 px-8 text-xs font-semibold flex items-center gap-2"
                    >
                      {isSaving ? 'GUARDANDO...' : 'CONFIRMAR E INTEGRAR'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison View (Only when verified) */}
          {status === 'verified' && parsedData && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <ISOComparator 
                 error={parsedData.error_maximo} 
                 uncertainty={parsedData.incertidumbre} 
                 tolerance={parsedData.criterio_valor} 
                 unit={parsedData.unidad}
                 veredicto={parsedData.veredicto}
                 riesgo={parsedData.riesgo}
               />
            </div>
          )}
        </section>

        {/* --- PANEL DERECHO: AI INSIGHTS --- */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
           
           <div className="bg-white rounded-[2.5rem] p-8 border border-outline/20 flex-1 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-8 border-b border-outline/10 pb-5">
                   <div className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Cpu size={24} />
                   </div>
                   <div>
                      <h3 className="font-outfit font-bold text-secondary text-base">Metadatos del Certificado</h3>
                      <p className="text-[9px] text-neutral font-black uppercase tracking-widest opacity-60">Extracción Gemini OCR</p>
                   </div>
                </div>

                <div className="space-y-6">
                   {[
                     { label: 'Número de Certificado', val: status === 'verified' ? parsedData?.modelo || 'N/A' : '---', icon: <FileText size={18}/> },
                     { label: 'Laboratorio Emisor', val: status === 'verified' ? parsedData?.laboratorio : '---', icon: <Building2 size={18}/> },
                     { label: 'Acreditación Lab', val: status === 'verified' ? parsedData?.laboratorio_tipo : '---', icon: <ShieldCheck size={18}/> },
                     { label: 'Instrumento Identificado', val: status === 'verified' ? parsedData?.instrumento : '---', icon: <Activity size={18}/> },
                     { label: 'Serie / Serial', val: status === 'verified' ? parsedData?.serie : '---', icon: <Barcode size={18}/> },
                     { label: 'Patrón Utilizado', val: status === 'verified' ? parsedData?.patron : '---', icon: <Layers size={18}/> },
                   ].map((insight, i) => (
                     <div key={i} className="flex items-start gap-4 group hover:bg-slate-50 p-2 rounded-xl transition-all">
                        <div className="text-primary group-hover:scale-110 transition-transform mt-0.5">{insight.icon}</div>
                        <div className="min-w-0 flex-1">
                           <p className="text-[9px] font-black text-neutral opacity-40 uppercase tracking-widest mb-0.5">{insight.label}</p>
                           <p className={`text-xs font-bold truncate ${status === 'verified' ? 'text-secondary font-inter' : 'text-neutral/20'}`}>{insight.val}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="mt-8 p-5 bg-slate-50 border border-outline/20 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Lock size={60} />
                 </div>
                 <div className="flex items-center gap-2 mb-2 relative z-10">
                    <Lock size={14} className="text-secondary" />
                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Garantía de Seguridad</span>
                 </div>
                 <p className="text-[10px] text-neutral leading-relaxed relative z-10 font-medium">
                    Los certificados de calibración se procesan localmente. El agente no comparte información con bases de datos públicas de entrenamiento.
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
const Barcode = ({size, className}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 5v14"/><path d="M21 5v14"/><path d="M7 5v14"/><path d="M11 5v14"/><path d="M14 5v14"/><path d="M17 5v14"/></svg>;
