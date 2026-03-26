import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAuthStore } from '../../store/authStore';
import { useReactToPrint } from 'react-to-print';
import {
  ArrowLeft, Printer, CheckCircle, Clock,
  XCircle, Wrench, AlertTriangle, FileText,
  Calendar, Plus, X, CloudLightning, CalendarPlus
} from 'lucide-react';
import { stichService } from '../../services/stichGateway';

// ─── Modal Programar Evento (Premium Branded) ──────────────────────────────
const ProgramarEventoModal = ({ instrument, onClose }) => {
  const [form, setForm] = useState({
    tipo: 'Calibración', laboratorio: '', fechaInicio: '', frecuenciaNum: 6,
    frecuenciaUnidad: 'meses', repeticiones: 4, observaciones: ''
  });
  const { addActivity } = useInventoryStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedCount, setSavedCount] = useState(0);

  const handleSave = async () => {
    if (!form.fechaInicio) return;
    setIsSaving(true);
    setSaveError(null);
    let fecha = new Date(form.fechaInicio);
    let saved = 0;
    try {
      for (let i = 0; i < form.repeticiones; i++) {
        if (i > 0) {
          if (form.frecuenciaUnidad === 'meses') fecha.setMonth(fecha.getMonth() + parseInt(form.frecuenciaNum));
          if (form.frecuenciaUnidad === 'dias') fecha.setDate(fecha.getDate() + parseInt(form.frecuenciaNum));
          if (form.frecuenciaUnidad === 'años') fecha.setFullYear(fecha.getFullYear() + parseInt(form.frecuenciaNum));
        }
        await addActivity({
          instrumentId: instrument.id,
          instrumentNombre: instrument.nombre,
          codigoMJM: instrument.codigoMJM,
          tenantId: instrument.tenantId,
          tipo: form.tipo,
          laboratorio: form.laboratorio || 'Laboratorio MJM',
          fechaProgramada: new Date(fecha).toISOString().split('T')[0],
          prioridad: instrument.criticidad === 'Crítica' ? 'Alta' : 'Normal',
          observaciones: form.observaciones,
          ciclo: { total: parseInt(form.repeticiones), numero: i + 1 }
        });
        saved++;
        setSavedCount(saved);
      }
      // Breve pausa para mostrar el éxito antes de cerrar
      await new Promise(r => setTimeout(r, 800));
      onClose();
    } catch (err) {
      setSaveError(`Error al guardar en base de datos: ${err.message || 'Revisa la consola.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-mjm-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-mjm-navy text-white px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Programar Ciclo Maestro</h2>
            <p className="text-[10px] text-white/50 mt-1 uppercase tracking-widest">{instrument?.codigoMJM} · {instrument?.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X size={18}/></button>
        </div>
        <div className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Tipo de Actividad</label>
              <div className="grid grid-cols-2 gap-2">
                {['Calibración','Verificación','Calificación','Mantenimiento'].map(t => (
                  <button key={t} onClick={() => setForm({...form, tipo: t})} 
                    className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${form.tipo === t ? 'bg-mjm-orange text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Fecha Inicio</label>
              <input type="date" value={form.fechaInicio} onChange={e => setForm({...form, fechaInicio: e.target.value})} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-mjm-orange/40 outline-none transition" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Laboratorio Sugerido</label>
              <input value={form.laboratorio} onChange={e => setForm({...form, laboratorio: e.target.value})} placeholder="Ej: MJM Metrología" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-mjm-orange/40 outline-none transition" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Frecuencia y Repeticiones</label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Cada</span>
              <input type="number" value={form.frecuenciaNum} onChange={e => setForm({...form, frecuenciaNum: e.target.value})} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-black text-center" />
              <select value={form.frecuenciaUnidad} onChange={e => setForm({...form, frecuenciaUnidad: e.target.value})} className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider">
                <option value="meses">Meses</option>
                <option value="dias">Días</option>
                <option value="años">Años</option>
              </select>
              <span className="text-gray-300">/</span>
              <input type="number" value={form.repeticiones} onChange={e => setForm({...form, repeticiones: e.target.value})} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-black text-center" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Veces</span>
            </div>
            <p className="text-[9px] text-mjm-orange font-black uppercase tracking-widest mt-3">⚡ Se generarán {form.repeticiones} eventos automáticos</p>
          </div>
        </div>
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest border-2 border-gray-200 rounded-xl hover:bg-white transition text-gray-400" disabled={isSaving}>Cancelar</button>
          <button onClick={handleSave} disabled={isSaving || !form.fechaInicio} className="flex-1 py-3 bg-mjm-orange text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-mjm-orange/20 hover:scale-[1.02] transition active:scale-95 disabled:opacity-50">
            {isSaving ? `🤖 Guardando ${savedCount}/${form.repeticiones}...` : '🦸 Programar Ciclo'}
          </button>
        </div>
        {saveError && (
          <div className="px-8 pb-5">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] font-bold text-red-600 uppercase tracking-wider">
              ⚠️ {saveError}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── CSS de Impresión (inyectado globalmente) ─────────────────────────────
const PrintStyles = () => (
  <style>{`
    @media print {
      @page { size: letter portrait; margin: 0; }
      body * { visibility: hidden !important; }
      .hv-carta, .hv-carta * { visibility: visible !important; }
      .hv-carta {
        position: fixed !important;
        top: 0; left: 0;
        width: 216mm !important;
        height: 279mm !important;
        overflow: hidden !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `}</style>
);

// ─── Documento Imprimible (Monochrome Elite) ──────────────────────────────
const PrintableHV = React.forwardRef(({ instrument, tenant, isSuperAdmin }, ref) => {
  const mjmName = "MJM METROLOGÍA";
  const displayLogo = isSuperAdmin ? null : (tenant?.logo_url);
  const displayName = isSuperAdmin ? mjmName : (tenant?.nombre_empresa || "CLIENTE MJM");

  return (
    <>
    <PrintStyles />
    <div
      ref={ref}
      className="hv-carta bg-white text-black font-sans"
      style={{
        width: '816px',       /* 216mm @ 96dpi */
        minHeight: '1056px',  /* 279mm @ 96dpi */
        maxHeight: '1056px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '36px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* HEADER ISO */}
      <div className="grid grid-cols-3 border-2 border-black mb-4">
        <div className="border-r-2 border-black p-3 flex items-center justify-center">
          {displayLogo ? (
            <img src={displayLogo} alt="Logo" className="grayscale max-h-10 object-contain" />
          ) : (
            <div className="text-base font-black tracking-widest">{displayName}</div>
          )}
        </div>
        <div className="border-r-2 border-black p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[8px] font-black tracking-[0.4em] mb-0.5 opacity-50 uppercase">Expediente Técnico</span>
          <h1 className="text-sm font-black tracking-[0.4em] uppercase leading-tight">Hoja de Vida</h1>
          <span className="text-[8px] font-bold mt-0.5 opacity-40 uppercase">MJM-MET-V2-001</span>
        </div>
        <div className="p-3 flex flex-col justify-center text-[8px] font-black uppercase tracking-widest">
          <div className="flex justify-between border-b border-black/10 pb-1 mb-1">
            <span>CÓDIGO:</span> <span className="font-bold">{instrument?.codigoMJM}</span>
          </div>
          <div className="flex justify-between border-b border-black/10 pb-1 mb-1">
            <span>VERSIÓN:</span> <span>02</span>
          </div>
          <div className="flex justify-between">
            <span>FECHA:</span> <span>{new Date().toLocaleDateString('es-CO')}</span>
          </div>
        </div>
      </div>

      {/* GALERÍA (EL ÚNICO COLOR) */}
      <div className="grid grid-cols-2 gap-5 mb-4 items-start">
        <div className="border border-black p-1.5 bg-gray-50 flex items-center justify-center overflow-hidden" style={{height:'200px'}}>
           <img 
             src={instrument?.imageUrl || '/assets/instruments/default.jpeg'} 
             alt="Instrumento" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="space-y-3">
          <div className="border-l-4 border-black pl-3">
             <h2 className="text-[8px] font-black tracking-widest uppercase mb-0.5 opacity-40 italic">Descripción del Instrumento</h2>
             <p className="text-base font-black tracking-tight leading-tight">{instrument?.nombre}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div>
               <h3 className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-0.5">Marca / Modelo</h3>
               <p className="text-[10px] font-bold">{instrument?.marca} · {instrument?.modelo}</p>
             </div>
             <div>
               <h3 className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-0.5">Serie Única</h3>
               <p className="text-[10px] font-bold font-mono">{instrument?.serie}</p>
             </div>
             <div>
               <h3 className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-0.5">Magnitud Física</h3>
               <p className="text-[10px] font-black uppercase tracking-widest">{instrument?.magnitud}</p>
             </div>
             <div>
               <h3 className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-0.5">Vencimiento</h3>
               <p className="text-[10px] font-black uppercase tracking-tighter underline">{instrument?.proximaFecha || 'POR PROGRAMAR'}</p>
             </div>
          </div>
        </div>
      </div>

      {/* FICHA TÉCNICA FORMAL */}
      <h3 className="text-[8px] font-black uppercase tracking-[0.4em] mb-2 border-b border-black pb-1 text-center opacity-40">Identificación y Especificaciones Técnicas</h3>
      <div className="grid grid-cols-4 border-t border-l border-black mb-4 text-[8px]">
        {[
          ['RESOLUCIÓN', instrument?.resolucion],
          ['CAP. MÁXIMA', instrument?.capacidadMaxima],
          ['CRITICIDAD', instrument?.criticidad],
          ['AÑO ADQ.', instrument?.anioAdquisicion],
          ['PROVEEDOR', instrument?.proveedor],
          ['ACCESORIOS', instrument?.accesorios || 'NINGUNO'],
          ['CÓD. INTERNO', instrument?.codigoInterno],
          ['UBICACIÓN', instrument?.ubicacion || 'PLANTA'],
        ].map(([k, v]) => (
          <div key={k} className="border-b border-r border-black px-2 py-1.5 flex flex-col justify-between" style={{minHeight:'44px'}}>
            <span className="text-[7px] font-black tracking-widest opacity-30 uppercase">{k}</span>
            <span className="text-[8px] font-bold text-gray-800 tracking-tight leading-tight uppercase">{v || '—'}</span>
          </div>
        ))}
      </div>

      {/* HISTORIAL METROLÓGICO */}
      <h3 className="text-[8px] font-black uppercase tracking-[0.4em] mb-2 border-b border-black pb-1 text-center opacity-40">Registro de Intervenciones Metrológicas</h3>
      <table className="w-full border-t border-l border-black text-[8px] mb-4">
        <thead>
          <tr className="bg-black text-white">
            {['Fecha', 'Actividad Realizada', 'Laboratorio Responsable', 'N° Certificado', 'Veredicto'].map(h => (
              <th key={h} className="border-r border-black p-1.5 text-left font-black tracking-widest text-[7px] uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(instrument?.historial || []).length === 0 ? (
            <tr><td colSpan={5} className="border-b border-r border-black p-4 text-center text-gray-400 italic text-[8px]">Sin intervenciones registradas.</td></tr>
          ) : ([...(instrument?.historial || [])].slice(-6).reverse().map((h) => (
            <tr key={h.id} className="border-b border-black">
              <td className="border-r border-black p-1.5 font-mono">{h.fecha}</td>
              <td className="border-r border-black p-1.5 font-black uppercase tracking-tighter">{h.tipo}</td>
              <td className="border-r border-black p-1.5 uppercase opacity-60">{h.laboratorio}</td>
              <td className="border-r border-black p-1.5 font-mono">{h.certificado}</td>
              <td className="border-r border-black p-1.5 font-black uppercase underline">{h.resultado}</td>
            </tr>
          )))}
        </tbody>
      </table>

      {/* FIRMAS ISO */}
      <div className="grid grid-cols-2 gap-12 pt-4 mt-auto">
        <div className="border-t border-black text-center pt-2">
          <p className="text-[7px] font-black uppercase tracking-[0.3em] mb-1">Analista Metrológico</p>
          <div className="h-6"></div>
          <p className="text-[6px] opacity-40 uppercase tracking-widest font-bold">Firma y Sello Realizó</p>
        </div>
        <div className="border-t border-black text-center pt-2">
          <p className="text-[7px] font-black uppercase tracking-[0.3em] mb-1">Director Técnico / Calidad</p>
          <div className="h-6"></div>
          <p className="text-[6px] opacity-40 uppercase tracking-widest font-bold">Firma y Sello Aprobó</p>
        </div>
      </div>

      <div className="text-[6px] font-bold tracking-[0.4em] text-center opacity-10 uppercase pt-3">
        DOCUMENTACIÓN TÉCNICA MJM METROLOGÍA V2.0 · USO EXCLUSIVO CLIENTE
      </div>
    </div>
    </>
  );
});

export default function HojaDeVida() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instruments, loadInstruments, getInstrumentFromFirestore } = useInventoryStore();
  const { tenant, isSuperAdmin } = useAuthStore();
  const [showProgramar, setShowProgramar] = useState(false);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  // El instrumento se toma del store (se actualiza al cargar)
  const inst = useMemo(() => instruments.find(i => i.id === id), [instruments, id]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // Siempre recargar el instrumento fresco desde Firestore
      // para que el historial esté al día (no caché obsoleto)
      if (id) {
        await getInstrumentFromFirestore(id);
      }
      // Si el store general está vacío, cargar todos
      if (instruments.length === 0 && tenant) {
        await loadInstruments(tenant.id, isSuperAdmin);
      }
      setLoading(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `HV_${inst?.codigoMJM || 'instrument'}`
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-12 h-12 border-4 border-mjm-orange border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-mjm-navy/50">Recuperando Expediente...</p>
    </div>
  );

  if (!inst) return (
    <div className="flex items-center justify-center h-full p-20">
      <div className="bg-white rounded-3xl shadow-2xl shadow-mjm-navy/10 w-full max-w-sm p-12 text-center border border-gray-100 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-mjm-orange/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
           <AlertTriangle size={40} className="text-mjm-orange" />
        </div>
        <h2 className="text-lg font-black uppercase tracking-widest text-mjm-navy">Extraviado</h2>
        <p className="text-xs text-gray-500 mt-3 font-medium px-4">El instrumento solicitado no existe o no tiene permisos suficientes.</p>
        <button onClick={() => navigate('/dashboard/inventario')} className="mt-8 w-full py-4 bg-mjm-navy text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-mjm-orange transition-all shadow-xl shadow-mjm-navy/20">
          Volver al Inventario
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {showProgramar && <ProgramarEventoModal instrument={inst} onClose={() => setShowProgramar(false)} />}
      
      {/* BARRA DE ACCIONES (STICKY - BRANDED) */}
      <div className="sticky top-0 z-30 bg-white shadow-xl shadow-mjm-navy/5 border-b border-mjm-navy/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard/inventario')} className="p-3 bg-gray-50 hover:bg-mjm-navy hover:text-white rounded-2xl transition-all text-mjm-navy shadow-inner">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
               <span className="font-mono text-[10px] font-black bg-mjm-navy text-white px-3 py-1 rounded-lg shadow-lg shadow-mjm-navy/20">{inst.codigoMJM}</span>
               <h1 className="text-sm font-black uppercase tracking-widest text-mjm-navy">{inst.nombre}</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowProgramar(true)} className="flex items-center gap-2 px-6 py-3.5 bg-mjm-orange text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-mjm-navy transition-all shadow-xl shadow-mjm-orange/20 active:scale-95 group">
            <CalendarPlus size={16} className="group-hover:rotate-12 transition-transform" /> Programar Ciclo
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3.5 bg-mjm-navy text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-mjm-orange transition-all shadow-xl shadow-mjm-navy/20 group">
            <Printer size={16} /> Imprimir Hoja de Vida
          </button>
          <button onClick={async () => {
             try {
                await stichService.triggerPdfGeneration({ instrumentId: inst.id, codigo: inst.codigoMJM });
                alert('🧬 Webhook Stich disparado exitosamente.');
             } catch (err) { alert('Error: ' + err.message); }
          }} className="p-3.5 bg-gray-100 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-gray-400">
            <CloudLightning size={18} />
          </button>
        </div>
      </div>

      {/* VISTA PREVIA DEL DOCUMENTO */}
      <div className="flex-1 overflow-auto bg-[#e8e8e8] flex justify-center py-10 px-4">
        <div className="shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-white/60 mb-10 shrink-0" style={{width:'816px'}}>
           <PrintableHV ref={printRef} instrument={inst} tenant={tenant} isSuperAdmin={isSuperAdmin} />
        </div>
      </div>
    </div>
  );
}
