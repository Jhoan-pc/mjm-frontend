import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { 
  FileText, Plus, Calculator, Trash2, Printer, Check, 
  ChevronRight, Building2, User, Landmark, HelpCircle, AlertCircle
} from 'lucide-react';

const SERVICIOS_PREDETERMINADOS = [
  { id: 'cal_masa', nombre: 'Calibración de Masa / Balanzas (ISO 17025)', precioBase: 120000, unidad: 'Equipo' },
  { id: 'cal_temp', nombre: 'Calibración de Temperatura / Termómetros', precioBase: 85000, unidad: 'Punto' },
  { id: 'cal_presion', nombre: 'Calibración de Presión / Manómetros', precioBase: 90000, unidad: 'Equipo' },
  { id: 'cal_longitud', nombre: 'Calibración de Dimensional / Calibradores Pie de Rey', precioBase: 75000, unidad: 'Equipo' },
  { id: 'mant_prev', nombre: 'Mantenimiento Preventivo Metrológico Avanzado', precioBase: 60000, unidad: 'Equipo' },
  { id: 'calif_instalacion', nombre: 'Calificación de Instalación y Operación (IQ/OQ/PQ)', precioBase: 450000, unidad: 'Sistema' }
];

export default function Cotizador() {
  const { tenant } = useAuthStore();
  const { instruments } = useInventoryStore();

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteContacto, setClienteContacto] = useState('');
  const [validezDias, setValidezDias] = useState(15);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [notas, setNotas] = useState('La calibración incluye emisión de certificados digitales con trazabilidad a patrones nacionales (ONAC). El servicio se ejecutará en las instalaciones del cliente.');

  const [items, setItems] = useState([
    { id: 1, descripcion: 'Calibración de Masa / Balanzas (ISO 17025)', cantidad: 5, precioUnitario: 120000 },
    { id: 2, descripcion: 'Calibración de Temperatura / Termómetros', cantidad: 3, precioUnitario: 85000 }
  ]);

  const [nuevoItem, setNuevoItem] = useState({
    descripcion: SERVICIOS_PREDETERMINADOS[0].nombre,
    cantidad: 1,
    precioUnitario: SERVICIOS_PREDETERMINADOS[0].precioBase
  });

  const handleSelectPredef = (e) => {
    const s = SERVICIOS_PREDETERMINADOS.find(item => item.nombre === e.target.value);
    if (s) {
      setNuevoItem({
        descripcion: s.nombre,
        cantidad: 1,
        precioUnitario: s.precioBase
      });
    } else {
      setNuevoItem({
        ...nuevoItem,
        descripcion: e.target.value
      });
    }
  };

  const handleAddItem = () => {
    if (!nuevoItem.descripcion) return;
    setItems([
      ...items,
      {
        id: Date.now(),
        descripcion: nuevoItem.descripcion,
        cantidad: Number(nuevoItem.cantidad) || 1,
        precioUnitario: Number(nuevoItem.precioUnitario) || 0
      }
    ]);
    setNuevoItem({
      descripcion: SERVICIOS_PREDETERMINADOS[0].nombre,
      cantidad: 1,
      precioUnitario: SERVICIOS_PREDETERMINADOS[0].precioBase
    });
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Cálculos financieros
  const subtotal = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.cantidad * curr.precioUnitario), 0);
  }, [items]);

  const valorDescuento = useMemo(() => {
    return subtotal * (descuentoPorcentaje / 100);
  }, [subtotal, descuentoPorcentaje]);

  const iva = useMemo(() => {
    return (subtotal - valorDescuento) * 0.19; // IVA 19% Colombia
  }, [subtotal, valorDescuento]);

  const total = useMemo(() => {
    return subtotal - valorDescuento + iva;
  }, [subtotal, valorDescuento, iva]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-screen">
      {/* HEADER DE COTIZADOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8 no-print">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-1">MJM Financial Suite</p>
          <h1 className="font-black text-mjm-navy text-4xl tracking-tighter uppercase">Cotizador de <span className="text-mjm-orange italic">Servicios</span></h1>
          <p className="text-xs text-gray-500 mt-2 font-medium">Genere cotizaciones comerciales de calibración y mantenimiento técnico para clientes industriales de MJM.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="px-8 py-3.5 bg-mjm-navy text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-mjm-navy/10 hover:bg-mjm-orange transition-all flex items-center justify-center gap-2"
        >
          <Printer size={16} /> Imprimir Oferta (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL DE FORMULACIÓN COMERCIAL (Izquierda - Ocultar al imprimir) */}
        <section className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 no-print">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <Calculator className="text-mjm-orange" size={20} />
            <h3 className="font-black text-mjm-navy text-sm uppercase tracking-wider">Formulación Comercial</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Razón Social del Cliente</label>
              <input 
                type="text" 
                placeholder="Ej: Challenger SAS" 
                value={clienteNombre} 
                onChange={e => setClienteNombre(e.target.value)}
                className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-mjm-orange/20"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Contacto / Correo</label>
              <input 
                type="text" 
                placeholder="Ej: Ing. Carlos Pérez (carlos@challenger.co)" 
                value={clienteContacto} 
                onChange={e => setClienteContacto(e.target.value)}
                className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-mjm-orange/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Validez (Días)</label>
                <input 
                  type="number" 
                  value={validezDias} 
                  onChange={e => setValidezDias(Number(e.target.value))}
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-mjm-orange/20"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Descuento (%)</label>
                <input 
                  type="number" 
                  max="100" 
                  value={descuentoPorcentaje} 
                  onChange={e => setDescuentoPorcentaje(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Términos y Notas de la Oferta</label>
              <textarea 
                rows={3} 
                value={notas} 
                onChange={e => setNotas(e.target.value)}
                className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-medium leading-relaxed outline-none"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h4 className="font-black text-mjm-navy text-xs uppercase tracking-wider">Agregar Ítem de Servicio</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Concepto de Servicio</label>
                <select 
                  onChange={handleSelectPredef}
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold cursor-pointer"
                >
                  {SERVICIOS_PREDETERMINADOS.map(s => (
                    <option key={s.id} value={s.nombre}>{s.nombre} ({formatCurrency(s.precioBase)}/{s.unidad})</option>
                  ))}
                  <option value="OTRO">-- Otro Servicio Personalizado --</option>
                </select>
              </div>

              {nuevoItem.descripcion === 'OTRO' || !SERVICIOS_PREDETERMINADOS.some(s => s.nombre === nuevoItem.descripcion) ? (
                <div>
                  <input 
                    type="text" 
                    placeholder="Escriba la descripción del servicio..." 
                    value={nuevoItem.descripcion === 'OTRO' ? '' : nuevoItem.descripcion} 
                    onChange={e => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Cantidad</label>
                  <input 
                    type="number" 
                    value={nuevoItem.cantidad} 
                    onChange={e => setNuevoItem({ ...nuevoItem, cantidad: Number(e.target.value) })}
                    className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Precio Unitario ($)</label>
                  <input 
                    type="number" 
                    value={nuevoItem.precioUnitario} 
                    onChange={e => setNuevoItem({ ...nuevoItem, precioUnitario: Number(e.target.value) })}
                    className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddItem}
                className="w-full py-3.5 bg-mjm-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-mjm-orange transition-all mt-2"
              >
                Insertar en Cotización
              </button>
            </div>
          </div>
        </section>

        {/* LIENZO DE LA COTIZACIÓN (Formato Imprimible ISO 9001) */}
        <section className="lg:col-span-7 bg-white border-2 border-slate-300 p-8 sm:p-12 rounded-3xl shadow-sm print:shadow-none print:border-none print:p-0 w-full text-slate-800">
          
          {/* CABECERA ISO */}
          <div className="flex border border-slate-300 rounded-xl overflow-hidden mb-8">
            <div className="w-1/3 p-4 flex items-center justify-center border-r border-slate-300 bg-slate-50/50">
              <span className="text-[12px] font-black text-slate-800 uppercase tracking-tighter">MJM METROLOGÍA</span>
            </div>
            <div className="w-2/3 p-4 flex flex-col justify-center text-right font-mono text-[9px] text-slate-500">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-1">Oferta Comercial Metrológica</span>
              <span>Ref: COT-{new Date().getFullYear()}-{Math.floor(Math.random()*1000).toString().padStart(3, '0')}</span>
              <span>Emisión: {new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>

          {/* DATOS DEL CLIENTE / PROVEEDOR */}
          <div className="grid grid-cols-2 gap-8 text-[11px] mb-8 border-b border-slate-100 pb-6">
            <div>
              <p className="font-mono text-slate-400 font-bold uppercase tracking-wider mb-1.5">PROVEEDOR:</p>
              <h4 className="font-black text-slate-800 uppercase">MJM Metrología SAS</h4>
              <p className="text-slate-500 mt-1">NIT: 901.123.456-7</p>
              <p className="text-slate-500">Bogotá, Colombia &bull; metrologia@mjm.co</p>
            </div>
            <div>
              <p className="font-mono text-slate-400 font-bold uppercase tracking-wider mb-1.5">CLIENTE COMERCIAL:</p>
              <h4 className="font-black text-slate-800 uppercase">{clienteNombre || 'CLIENTE DESTINATARIO'}</h4>
              <p className="text-slate-500 mt-1">{clienteContacto || 'Contacto comercial por definir'}</p>
              <p className="text-slate-500">Validez de la oferta: {validezDias} días calendario</p>
            </div>
          </div>

          {/* TABLA DE CONCEPTOS COTIZADOS */}
          <div className="mb-8 min-h-[220px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">
                  <th className="px-4 py-3">Servicio / Descripción Técnica</th>
                  <th className="px-4 py-3 text-center">Cant.</th>
                  <th className="px-4 py-3 text-right">V. Unitario</th>
                  <th className="px-4 py-3 text-right">V. Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-4 font-bold flex justify-between items-center group">
                      <span>{item.descripcion}</span>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2 no-print"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-slate-600">{item.cantidad}</td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-600">{formatCurrency(item.precioUnitario)}</td>
                    <td className="px-4 py-4 text-right font-mono font-black text-slate-800">{formatCurrency(item.cantidad * item.precioUnitario)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400 italic font-mono bg-slate-50/20">
                      No se han agregado ítems a la propuesta económica.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALES */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-6 border-t border-slate-200">
            <div className="sm:col-span-7 text-[10px] text-slate-400 leading-relaxed font-medium">
              <span className="font-bold text-slate-500 uppercase tracking-widest block mb-2 font-mono">Términos del Servicio</span>
              <p>{notas}</p>
            </div>
            
            <div className="sm:col-span-5 flex flex-col gap-2.5 font-mono text-xs">
              <div className="flex justify-between text-slate-500 border-b border-slate-50 pb-2">
                <span>SUBTOTAL:</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              {valorDescuento > 0 && (
                <div className="flex justify-between text-emerald-600 border-b border-slate-50 pb-2">
                  <span>DESC. ({descuentoPorcentaje}%):</span>
                  <span className="font-bold">-{formatCurrency(valorDescuento)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 border-b border-slate-50 pb-2">
                <span>IVA (19%):</span>
                <span className="font-bold">{formatCurrency(iva)}</span>
              </div>
              <div className="flex justify-between text-[#0B1326] text-sm pt-2">
                <span className="font-black uppercase tracking-tight">TOTAL GENERAL:</span>
                <span className="font-black text-lg text-mjm-orange">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* FIRMA DE EMISOR */}
          <div className="mt-20 grid grid-cols-2 gap-12 max-w-lg">
            <div className="flex flex-col items-center">
              <div className="w-full border-b border-slate-300 h-10 mb-2 relative flex items-end justify-center pb-1">
                <span className="text-[8px] font-mono text-slate-400">Emisor MJM Metrología</span>
              </div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ejecutivo de Cuenta</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full border-b border-slate-300 h-10 mb-2 relative flex items-end justify-center pb-1">
                <span className="text-[8px] font-mono text-slate-400">Aceptación Comercial del Cliente</span>
              </div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Firma y Sello</span>
            </div>
          </div>

          {/* PIE DE PÁGINA COMERCIAL */}
          <footer className="mt-12 pt-4 border-t border-slate-200 text-center text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-loose">
            MJM Metrología SAS &bull; Gestión Integrada de la Medición conforme a NTC-ISO 10012.
          </footer>
        </section>

      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          /* Hide all UI layout components, sidebars, headers and controls */
          aside, header, nav, .no-print, button,
          .bg-gray-100\\/50, .lg\\:w-64,
          div.flex-col.md\\:flex-row.md\\:items-center.justify-between {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          section {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
