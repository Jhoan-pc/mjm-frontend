import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Map, Layout, Sliders, ChevronRight, Globe, FileText, Database,
  ShieldCheck, Building, Users, Check, MapPin, X, Loader2, Mail, Phone, Calendar as CalendarIcon, ExternalLink, Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStore } from '../../store/contentStore';
import HierarchyTree from '../../components/HierarchyTree';
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';

const INSTRUMENTS_SEED = [
  // LONGITUD (10) - Usando fotos reales: long_1, long_2, long_3
  { nombre: 'Calibrador Pie de Rey Digital', marca: 'Mitutoyo', modelo: 'CD-6"CSX', serie: 'MT-77821', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '150 mm', criticidad: 'Alta', anioAdquisicion: '2022', proveedor: 'Mitutoyo Colombia', accesorios: 'Estuche rígido', rutinas: { calibracion: true, verificacion: true, calificacion: false, mantenimiento: true }, imageUrl: '/assets/instruments/long_1.jpeg' },
  { nombre: 'Micrómetro de Exteriores', marca: 'Starrett', modelo: 'T444.1XRL-1', serie: 'ST-9920', magnitud: 'Longitud', resolucion: '0.001 mm', capacidadMax: '25 mm', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'Herramientas Pro', accesorios: 'Llave de ajuste', rutinas: { calibracion: true, verificacion: true, calificacion: false, mantenimiento: true }, imageUrl: '/assets/instruments/long_2.jpeg' },
  { nombre: 'Reloj Comparador Digital', marca: 'Mahr', modelo: 'MarCal 16 EWR', serie: 'MH-1122', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '12.5 mm', criticidad: 'Media', anioAdquisicion: '2021', proveedor: 'Mahr Group', accesorios: 'Soporte magnético', rutinas: { calibracion: true, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/long_3.jpeg' },
  { nombre: 'Bloques Patrón (Juego 81 piezas)', marca: 'Gagemaker', modelo: 'AS-1', serie: 'GG-881', magnitud: 'Longitud', resolucion: 'Grado 0', capacidadMax: '100 mm', criticidad: 'Alta', anioAdquisicion: '2024', proveedor: 'Metrology Lab', accesorios: 'Pinzas de sujeción', rutinas: { calibracion: true, verificacion: false, mantenimiento: false }, imageUrl: '/assets/instruments/long_1.jpeg' },
  { nombre: 'Medidor de Espesores Ultrasónico', marca: 'Olympus', modelo: '38DL PLUS', serie: 'OL-556', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '500 mm', criticidad: 'Alta', anioAdquisicion: '2022', proveedor: 'Olympus Latam', accesorios: 'Transductor 5MHz', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/long_2.jpeg' },
  { nombre: 'Altímetro Digital', marca: 'Trimos', modelo: 'V3-400', serie: 'TR-334', magnitud: 'Longitud', resolucion: '0.001 mm', capacidadMax: '400 mm', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'Swiss Metrol', accesorios: 'Palpador de rubí', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/long_3.jpeg' },
  { nombre: 'Escuadra de Combinación', marca: 'Starrett', modelo: 'C434-12-4R', serie: 'ST-004', magnitud: 'Longitud', resolucion: '0.5 mm', capacidadMax: '300 mm', criticidad: 'Baja', anioAdquisicion: '2020', proveedor: 'Ferretería Industrial', accesorios: 'Nivel integrado', rutinas: { calibracion: false, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/long_1.jpeg' },
  { nombre: 'Flexómetro Global Plus', marca: 'Stanley', modelo: '33-425', serie: 'SN-445', magnitud: 'Longitud', resolucion: '1 mm', capacidadMax: '8 m', criticidad: 'Baja', anioAdquisicion: '2024', proveedor: 'Sodimac', accesorios: 'Clip de cinturón', rutinas: { calibracion: false, verificacion: true, noAplica: true }, imageUrl: '/assets/instruments/long_2.jpeg' },
  { nombre: 'Gramil Digital', marca: 'Mitutoyo', modelo: '192-613-10', serie: 'MT-1192', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '300 mm', criticidad: 'Media', anioAdquisicion: '2021', proveedor: 'Mitutoyo Colombia', accesorios: 'Punta de trazar', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/long_3.jpeg' },
  { nombre: 'Calibrador de Altura', marca: 'Fowler', modelo: '54-175-024', serie: 'FW-998', magnitud: 'Longitud', resolucion: '0.01 mm', capacidadMax: '600 mm', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'Fowler High Prec', accesorios: 'Cable RS232', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/long_1.jpeg' },

  // TEMPERATURA INFRARED (10) - Usando fotos reales: temp_1, temp_2, temp_3, temp_4
  { nombre: 'Pirómetro Infrarrojo de Visualización', marca: 'Fluke', modelo: '62 MAX+', serie: 'FK-TEMP01', magnitud: 'Temperatura Infraroja', resolucion: '0.1 °C', capacidadMax: '650 °C', criticidad: 'Alta', anioAdquisicion: '2022', proveedor: 'Fluke Corp', accesorios: 'Funda protectora', rutinas: { calibracion: true, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/temp_1.jpeg' },
  { nombre: 'Cámara Termográfica Industrial', marca: 'FLIR', modelo: 'E8-XT', serie: 'FL-8892', magnitud: 'Temperatura Infraroja', resolucion: '0.05 °C', capacidadMax: '550 °C', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'FLIR Systems', accesorios: 'Batería extra, Maleta', rutinas: { calibracion: true, verificacion: true, calificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/temp_2.jpeg' },
  { nombre: 'Termómetro Infrarrojo Laser Doble', marca: 'Testo', modelo: '835-T1', serie: 'TS-3341', magnitud: 'Temperatura Infraroja', resolucion: '0.1 °C', capacidadMax: '600 °C', criticidad: 'Media', anioAdquisicion: '2021', proveedor: 'Testo Latam', accesorios: 'Tripode mini', rutinas: { calibracion: true, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/temp_3.jpeg' },
  { nombre: 'Pirómetro de Alta Velocidad', marca: 'Raytek', modelo: 'Raynger 3i Plus', serie: 'RY-009', magnitud: 'Temperatura Infraroja', resolucion: '1 °C', capacidadMax: '3000 °C', criticidad: 'Alta', anioAdquisicion: '2024', proveedor: 'Raytek Int', accesorios: 'Filtro solar', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/temp_4.jpeg' },
  { nombre: 'Módulo de Temperatura IR para Smartphone', marca: 'Fluke', modelo: 'iSee TC01A', serie: 'FK-IS01', magnitud: 'Temperatura Infraroja', resolucion: '0.1 °C', capacidadMax: '150 °C', criticidad: 'Baja', anioAdquisicion: '2024', proveedor: 'Fluke Corp', accesorios: 'Adaptador USB-C', rutinas: { calibracion: false, verificacion: true, noAplica: true }, imageUrl: '/assets/instruments/temp_1.jpeg' },
  { nombre: 'Termómetro IR con Sonda K', marca: 'Amprobe', modelo: 'IR-730', serie: 'AM-445', magnitud: 'Temperatura Infraroja', resolucion: '0.1 °C', capacidadMax: '1250 °C', criticidad: 'Media', anioAdquisicion: '2022', proveedor: 'Amprobe Lab', accesorios: 'Sonda termopar k', rutinas: { calibracion: true, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/temp_2.jpeg' },
  { nombre: 'Escaner de Temperatura Lineal', marca: 'LumaSense', modelo: 'MP150', serie: 'LS-991', magnitud: 'Temperatura Infraroja', resolucion: '0.5 °C', capacidadMax: '950 °C', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'LumaSense Tech', accesorios: 'Unidad de purga de aire', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/temp_3.jpeg' },
  { nombre: 'Transmisor de Temp IR Fijo', marca: 'Extech', modelo: 'VIR50', serie: 'EX-002', magnitud: 'Temperatura Infraroja', resolucion: '0.1 °C', capacidadMax: '2200 °C', criticidad: 'Alta', anioAdquisicion: '2021', proveedor: 'Extech Dist', accesorios: 'Soporte ajustable', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/temp_4.jpeg' },
  { nombre: 'Termómetro IR Visual con SD', marca: 'Reed', modelo: 'R2020', serie: 'RE-771', magnitud: 'Temperatura Infraroja', resolucion: '0.1 °C', capacidadMax: '800 °C', criticidad: 'Media', anioAdquisicion: '2022', proveedor: 'Reed Tools', accesorios: 'Memoria SD 16GB', rutinas: { calibracion: true, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/temp_1.jpeg' },
  { nombre: 'Sensor IR Maquinaria Pesada', marca: 'Caterpillar', modelo: 'IRT-500', serie: 'CAT-992', magnitud: 'Temperatura Infraroja', resolucion: '1 °C', capacidadMax: '500 °C', criticidad: 'Media', anioAdquisicion: '2020', proveedor: 'CAT Metrology', accesorios: 'Protector blindado', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/temp_2.jpeg' },

  // TIEMPO Y FRECUENCIA (10) - Usando fotos reales: freq_1, freq_2
  { nombre: 'Cronómetro Digital Certificado', marca: 'Traceable', modelo: '6500', serie: 'TR-TIME01', magnitud: 'Tiempo y Frecuencia', resolucion: '0.01 s', capacidadMax: '24 h', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'Fisher Scientific', accesorios: 'Certificado trazable', rutinas: { calibracion: true, verificacion: true, noAplica: false }, imageUrl: '/assets/instruments/freq_1.jpeg' },
  { nombre: 'Frecuencímetro Analizador', marca: 'Keysight', modelo: '53220A', serie: 'KS-FREQ-8', magnitud: 'Tiempo y Frecuencia', resolucion: '0.001 Hz', capacidadMax: '350 MHz', criticidad: 'Alta', anioAdquisicion: '2022', proveedor: 'Keysight Tech', accesorios: 'Referencia Rubidio', rutinas: { calibracion: true, verificacion: true, calificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/freq_2.jpeg' },
  { nombre: 'Generador de Funciones', marca: 'Tektronix', modelo: 'AFG1022', serie: 'TK-GEN-4', magnitud: 'Tiempo y Frecuencia', resolucion: '1 uHz', capacidadMax: '25 MHz', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'Tektronix Latam', accesorios: 'Cables BNC', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/freq_1.jpeg' },
  { nombre: 'Osciloscopio Digital de 4 Canales', marca: 'Rigol', modelo: 'DS1104Z Plus', serie: 'RG-OSC-2', magnitud: 'Tiempo y Frecuencia', resolucion: '8 bits', capacidadMax: '100 MHz', criticidad: 'Alta', anioAdquisicion: '2021', proveedor: 'Rigol Global', accesorios: 'Puntas de prueba x4', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/freq_2.jpeg' },
  { nombre: 'Contador Universal de Tiempos', marca: 'Agilent', modelo: '53131A', serie: 'AG-771', magnitud: 'Tiempo y Frecuencia', resolucion: '0.1 ns', capacidadMax: '12.4 GHz', criticidad: 'Alta', anioAdquisicion: '2020', proveedor: 'Agilent Refurb', accesorios: 'Interfaz GPIB', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/freq_1.jpeg' },
  { nombre: 'Reloj de Pared GPS Industrial', marca: 'Masterclock', modelo: 'TCC100', serie: 'MC-GPS-01', magnitud: 'Tiempo y Frecuencia', resolucion: '1 ms', capacidadMax: 'N/A', criticidad: 'Media', anioAdquisicion: '2022', proveedor: 'Masterclock USA', accesorios: 'Antena GPS exterior', rutinas: { calibracion: false, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/freq_2.jpeg' },
  { nombre: 'Analizador de Energía y Armónicos', marca: 'Hioki', modelo: 'PQ3100', serie: 'HK-POW-9', magnitud: 'Tiempo y Frecuencia', resolucion: '0.01 Hz', capacidadMax: '60 Hz', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'Hioki Japan', accesorios: 'Pinzas de corriente CT', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/freq_1.jpeg' },
  { nombre: 'Cronómetro de Procesos PLC', marca: 'Siemens', modelo: 'S7-Timer', serie: 'SI-778', magnitud: 'Tiempo y Frecuencia', resolucion: '1 ms', capacidadMax: '9999 s', criticidad: 'Alta', anioAdquisicion: '2021', proveedor: 'Siemens Dist', accesorios: 'Ninguno', rutinas: { calibracion: false, verificacion: true, calificacion: true }, imageUrl: '/assets/instruments/freq_2.jpeg' },
  { nombre: 'Frecuencímetro Portátil BT', marca: 'Instek', modelo: 'GFC-8010H', serie: 'GW-004', magnitud: 'Tiempo y Frecuencia', resolucion: '1 Hz', capacidadMax: '120 MHz', criticidad: 'Media', anioAdquisicion: '2022', proveedor: 'GW Instek', accesorios: 'Batería recargable', rutinas: { calibracion: true, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/freq_1.jpeg' },
  { nombre: 'Transmisor de Tiempo PTP', marca: 'Meinberg', modelo: 'LANTIME M300', serie: 'MB-PTP-01', magnitud: 'Tiempo y Frecuencia', resolucion: '1 us', capacidadMax: 'N/A', criticidad: 'Alta', anioAdquisicion: '2024', proveedor: 'Meinberg Ger', accesorios: 'Modulo NTP/PTP', rutinas: { calibracion: true, verificacion: false, mantenimiento: true }, imageUrl: '/assets/instruments/freq_2.jpeg' },

  // VIBRACIÓN (10) - Usando fotos reales: vib_1, vib_2, vib_3
  { nombre: 'Acelerómetro Piezoeléctrico', marca: 'Brüel & Kjær', modelo: 'Type 4533-B', serie: 'BK-VIB-01', magnitud: 'Vibración', resolucion: '0.01 m/s²', capacidadMax: '500 m/s²', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'B&K Global', accesorios: 'Base magnética', rutinas: { calibracion: true, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/vib_1.jpeg' },
  { nombre: 'Analizador de Vibraciones Fluke', marca: 'Fluke', modelo: '810', serie: 'FK-VIB-88', magnitud: 'Vibración', resolucion: '0.1 mm/s', capacidadMax: '1000 Hz', criticidad: 'Alta', anioAdquisicion: '2022', proveedor: 'Fluke Corp', accesorios: 'Software SmartView', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/vib_2.jpeg' },
  { nombre: 'Sensor de Vibración Wireless', marca: 'Emerson', modelo: 'CSI 9420', serie: 'EM-WIR-4', magnitud: 'Vibración', resolucion: '0.05 m/s²', capacidadMax: '200 Hz', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'Emerson Process', accesorios: 'Puerta de enlace Hart', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/vib_3.jpeg' },
  { nombre: 'Vibrómetro Láser Doppler', marca: 'Polytec', modelo: 'PDV-100', serie: 'PY-LAS-1', magnitud: 'Vibración', resolucion: '0.01 um', capacidadMax: '10 MHz', criticidad: 'Alta', anioAdquisicion: '2024', proveedor: 'Polytec Latam', accesorios: 'Trípode profesional', rutinas: { calibracion: true, verificacion: true, calificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/vib_1.jpeg' },
  { nombre: 'Analizador Portátil de 2 Canales', marca: 'Adash', modelo: 'VA3 Pro', serie: 'AD-776', magnitud: 'Vibración', resolucion: '0.001 mm/s', capacidadMax: '500 Hz', criticidad: 'Media', anioAdquisicion: '2021', proveedor: 'Adash Dist', accesorios: 'Sondas ICP', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/vib_2.jpeg' },
  { nombre: 'Calibrador de Vibración Portátil', marca: 'The Modal Shop', modelo: '9110D', serie: 'MS-CAL-3', magnitud: 'Vibración', resolucion: '0.5% Accu', capacidadMax: '10 kg', criticidad: 'Alta', anioAdquisicion: '2023', proveedor: 'Modal Shop USA', accesorios: 'Masas de referencia', rutinas: { calibracion: true, verificacion: false, mantenimiento: true }, imageUrl: '/assets/instruments/vib_3.jpeg' },
  { nombre: 'Transmisor de Vibración 4-20mA', marca: 'Wilcoxon', modelo: 'PCC420', serie: 'WX-SENS-5', magnitud: 'Vibración', resolucion: '0.1 ips', capacidadMax: '10 ips', criticidad: 'Alta', anioAdquisicion: '2021', proveedor: 'Wilcoxon Sens', accesorios: 'Cable blindado', rutinas: { calibracion: true, verificacion: true, mantenimiento: false }, imageUrl: '/assets/instruments/vib_1.jpeg' },
  { nombre: 'Medidor de Vibración Pen-Type', marca: 'Extech', modelo: 'VB400', serie: 'EX-V01', magnitud: 'Vibración', resolucion: '0.01 mm/s', capacidadMax: '200 mm/s', criticidad: 'Baja', anioAdquisicion: '2022', proveedor: 'Extech Dist', accesorios: 'Funda de cuero', rutinas: { calibracion: false, verificacion: true, noAplica: true }, imageUrl: '/assets/instruments/vib_2.jpeg' },
  { nombre: 'Sensor de Vibración Marítimo', marca: 'Dytran', modelo: '3055B', serie: 'DY-V009', magnitud: 'Vibración', resolucion: '0.01 m/s²', capacidadMax: '1000 m/s²', criticidad: 'Media', anioAdquisicion: '2020', proveedor: 'Dytran Lab', accesorios: 'Protección salina', rutinas: { calibracion: true, verificacion: true, mantenimiento: true }, imageUrl: '/assets/instruments/vib_3.jpeg' },
  { nombre: 'Analizador FFT de Bolsillo', marca: 'Digivibe', modelo: 'GX600', serie: 'DG-771', magnitud: 'Vibración', resolucion: '1024 líneas', capacidadMax: '10 kHz', criticidad: 'Baja', anioAdquisicion: '2024', proveedor: 'Digivibe Global', accesorios: 'App iOS/Android', rutinas: { calibracion: false, verificacion: true, noAplica: true }, imageUrl: '/assets/instruments/vib_1.jpeg' }
];

const GeographicConfig = () => (
  <div className="w-full">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Estructura Organizacional</h3>
      <p className="text-sm text-gray-500">Administre el árbol de dependencias desde los clientes hasta los instrumentos.</p>
    </div>
    <HierarchyTree />
  </div>
);

const LandingPageConfig = () => {
  const { landing, updateLandingContent } = useContentStore();
  const [heroTitle, setHeroTitle] = useState(landing.hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(landing.hero.subtitle);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateLandingContent({ hero: { title: heroTitle, subtitle: heroSubtitle } });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Configuración del Landing Page</h3>
        <p className="text-sm text-gray-500">Edite los textos y contenidos visuales de la página principal en tiempo real.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <Layout size={18} className="text-mjm-orange" />
            <h4 className="font-bold text-mjm-navy">Sección Hero (Principal)</h4>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Título de Impacto</label>
            <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-mjm-orange/20 focus:border-mjm-orange outline-none transition-all font-bold text-mjm-navy" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Subtítulo Descriptivo</label>
            <textarea rows={3} value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-mjm-orange/20 focus:border-mjm-orange outline-none transition-all text-sm" />
          </div>
          <div className="pt-4 flex items-center gap-4">
            <button onClick={handleSave} className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-mjm-orange text-white hover:bg-orange-600 shadow-lg shadow-mjm-orange/20'}`}>
              {saved ? <><Check size={16} /> ¡Guardado!</> : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlatformParams = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Parametrización de la Plataforma</h3>
      <p className="text-sm text-gray-500 font-sans">Configure los valores globales y reglas de negocio del sistema.</p>
    </div>
    <div className="space-y-4 font-sans">
      {[
        { name: "Intervalos de Calibración Sugeridos", icon: <Sliders size={18} />, desc: "Defina los tiempos estándar por tipo de instrumento." },
        { name: "Alertas de Vencimiento", icon: <ShieldCheck size={18} />, desc: "Configure con cuántos días de antelación se notificará a los clientes." },
        { name: "Plantillas de Certificados", icon: <FileText size={18} />, desc: "Gestione el diseño y campos obligatorios de los reportes PDF." }
      ].map((item, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-mjm-orange/30 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-mjm-navy group-hover:bg-mjm-orange group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-mjm-orange group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ClientManagement = () => {
  const { isSuperAdmin } = useAuthStore();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [metrics, setMetrics] = useState({ sedes: 0, instrumentos: 0 });
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const snap = await getDocs(collection(db, 'tenants'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(list.filter(c => c.id !== 'mjm-core-root')); // Ocultar nodo raíz si aplica
      } catch (e) {
        console.error("Firestore Clients Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const fetchMetrics = async () => {
        try {
          const hierarchySnap = await getDocs(query(collection(db, 'hierarchy'), where('tenantId', '==', selectedClient.id), where('type', '==', 'planta')));
          const inventorySnap = await getDocs(query(collection(db, 'inventario_metrologico'), where('tenantId', '==', selectedClient.id)));
          setMetrics({ 
            sedes: hierarchySnap.size, 
            instrumentos: inventorySnap.size 
          });
        } catch (e) {
          console.error("Metrics Error:", e);
        }
      };
      fetchMetrics();
    } else {
      setMetrics({ sedes: 0, instrumentos: 0 });
    }
  }, [selectedClient]);

  if (loading) return (
    <div className="py-20 flex flex-col items-center gap-3">
       <Loader2 className="animate-spin text-mjm-orange" size={40} />
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sincronizando Base de Datos...</p>
    </div>
  );

  return (
    <div className="space-y-8 h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-mjm-navy uppercase tracking-tighter">Gestión de Clientes</h3>
          <p className="text-sm text-gray-500 font-medium font-sans">Supervisión y control de cuentas corporativas registradas.</p>
        </div>
        <div className="px-4 py-1.5 bg-mjm-orange/10 text-mjm-orange rounded-full text-[10px] font-black uppercase tracking-widest border border-mjm-orange/20">
          {clients.length} Clientes Activos
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-6 relative overflow-hidden group border-b-4" style={{ borderBottomColor: client.color_institucional_principal || '#234c74' }}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center p-3 shadow-inner border border-gray-100">
                {client.logo_url ? <img src={client.logo_url} alt="logo" className="w-full h-full object-contain" /> : <Building size={24} className="text-gray-300" />}
              </div>
              <button 
                onClick={() => setSelectedClient(client)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-mjm-navy hover:text-white transition-all shadow-sm"
              >
                <ExternalLink size={14} />
              </button>
            </div>
            <div className="space-y-1 mb-6">
              <h4 className="font-black text-mjm-navy uppercase tracking-tighter text-lg leading-none">{client.nombre_empresa || 'Cliente'}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NIT: {client.nit || 'N/A'}</p>
            </div>
            <button 
              onClick={() => setSelectedClient(client)}
              className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-gray-100 text-mjm-navy hover:bg-mjm-navy hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Ver Ficha Técnica <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {selectedClient && (
        <div className="fixed inset-0 bg-mjm-navy/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative">
            <button onClick={() => setSelectedClient(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all z-10">
              <X size={20} />
            </button>
            <div className="flex flex-col md:flex-row h-full">
               <div className="w-full md:w-64 p-10 flex flex-col items-center justify-center text-center gap-6" style={{ backgroundColor: `${selectedClient.color_institucional_principal || '#234c74'}10` }}>
                  <div className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center p-6 border border-gray-100">
                    {selectedClient.logo_url ? <img src={selectedClient.logo_url} alt="logo" className="w-full h-full object-contain" /> : <Building size={48} className="text-mjm-navy/10" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-mjm-navy uppercase tracking-tighter leading-none">{selectedClient.nombre_empresa}</h2>
                    <p className="text-xs font-bold text-mjm-orange mt-2 uppercase tracking-wide">NIT {selectedClient.nit}</p>
                  </div>
               </div>
               <div className="flex-1 p-10 space-y-8 font-sans">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Suscripción</p>
                        <p className="text-sm font-black text-mjm-navy">12 Meses (Anual)</p>
                     </div>
                     <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                        <p className="text-[9px] font-black uppercase text-mjm-orange mb-1 tracking-widest">Vencimiento</p>
                        <p className="text-sm font-black text-mjm-orange">334 Días Restantes</p>
                     </div>
                     <div className="bg-mjm-navy/5 p-4 rounded-2xl border border-mjm-navy/10 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase text-mjm-navy/40 mb-1 tracking-widest">Sedes / Plantas</p>
                          <p className="text-xl font-black text-mjm-navy">{metrics.sedes}</p>
                        </div>
                        <Building size={20} className="text-mjm-navy/20" />
                     </div>
                     <div className="bg-mjm-navy/5 p-4 rounded-2xl border border-mjm-navy/10 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase text-mjm-navy/40 mb-1 tracking-widest">Instrumentos</p>
                          <p className="text-xl font-black text-mjm-navy">{metrics.instrumentos}</p>
                        </div>
                        <Wrench size={20} className="text-mjm-navy/20" />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100 pb-2">Información de Negocio</h4>
                     <p className="text-xs font-medium text-gray-600">Este cliente opera bajo el sistema de aseguramiento metrológico de MJM con acceso a todas las funcionalidades del núcleo.</p>
                  </div>
                    <div className="pt-4 flex flex-col gap-3">
                         <button 
                           disabled={seeding}
                           onClick={async () => {
                             const ok = window.confirm("¿Seguro que quieres inyectar 40 instrumentos de prueba a este cliente? Esto LIMPIARÁ los registros previos de este cliente para evitar duplicados.");
                             if (ok) {
                               try {
                                 setSeeding(true);
                                 // LIMPIEZA: Borrar instrumentos previos para evitar duplicados infinitos
                                 const existingSnap = await getDocs(query(collection(db, 'inventario_metrologico'), where('tenantId', '==', selectedClient.id)));
                                 for (const docRef of existingSnap.docs) {
                                   await deleteDoc(doc(db, 'inventario_metrologico', docRef.id));
                                 }

                                 let count = 0;
                                 for (const inst of INSTRUMENTS_SEED) {
                                   await addDoc(collection(db, 'inventario_metrologico'), {
                                     ...inst,
                                     tenantId: selectedClient.id,
                                     codigoMJM: `MJM-DC-${String(count+1).padStart(3, '0')}`,
                                     capacidadMaxima: inst.capacidadMax, // Normalización
                                     estado: 'Vigente', // Estado por defecto
                                     proximaCalibracion: '2025-06-20', // Fecha demo
                                     ubicacion: count % 2 === 0 ? 'Planta de Producción - Sector A' : 'Laboratorio de Calidad - Piso 2',
                                     createdAt: serverTimestamp()
                                   });
                                   count++;
                                 }
                                 alert(`¡Éxito! Base de datos saneada y ${count} instrumentos inyectados con fotos reales.`);
                                 setSelectedClient(null);
                               } catch (err) {
                                 console.error("Error Sembrando:", err);
                                 alert("Error de Firestore: " + err.message);
                               } finally {
                                 setSeeding(false);
                               }
                             }
                           }}
                           className={`w-full py-3 border-2 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all mb-2 ${
                             seeding ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-mjm-orange/10 text-mjm-orange border-mjm-orange/30 hover:bg-mjm-orange hover:text-white'
                           }`}
                         >
                           {seeding ? '🦾 Inyectando Equipos...' : '🧪 Saneamiento e Inyección Masiva'}
                          </button>

                          {/* BOTÓN ACTIVIDADES DE PRUEBA */}
                          <button
                            disabled={seeding}
                            onClick={async () => {
                              const ok = window.confirm(`¿Inyectar actividades de prueba desde Dic/2025 para todos los instrumentos de ${selectedClient.nombre_empresa}? Esto NO borra las existentes.`);
                              if (!ok) return;
                              setSeeding(true);
                              try {
                                // 1. Leer instrumentos reales del tenant
                                const instSnap = await getDocs(query(collection(db, 'inventario_metrologico'), where('tenantId', '==', selectedClient.id)));
                                const instruments = instSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                                const TIPOS = ['Calibración', 'Verificación', 'Mantenimiento'];
                                const LABS  = ['MJM Metrología', 'CERTLAB SAS', 'Laboratorio Nacional', 'TÜV Rheinland', 'Incontec'];

                                // 2. Para cada instrumento, generar 3 actividades espaciadas desde Dic/2025
                                let total = 0;
                                for (const inst of instruments) {
                                  const tiposDisp = [];
                                  if (inst.rutinas?.calibracion)   tiposDisp.push('Calibración');
                                  if (inst.rutinas?.verificacion)  tiposDisp.push('Verificación');
                                  if (inst.rutinas?.mantenimiento) tiposDisp.push('Mantenimiento');
                                  const tipos = tiposDisp.length > 0 ? tiposDisp : TIPOS;

                                  // Act 1: Dic 2025 — done
                                  await addDoc(collection(db, 'activities'), {
                                    instrumentId: inst.id,
                                    instrumentNombre: inst.nombre,
                                    codigoMJM: inst.codigoMJM,
                                    tenantId: selectedClient.id,
                                    tipo: tipos[0],
                                    laboratorio: LABS[total % LABS.length],
                                    fechaProgramada: '2025-12-15',
                                    fechaRealizacion: '2025-12-16',
                                    certificado: `CERT-${inst.codigoMJM}-DIC25`,
                                    prioridad: inst.criticidad === 'Alta' ? 'Alta' : 'Normal',
                                    resultado: 'CONFORME',
                                    estado: 'done',
                                    evidencias: [],
                                    archivada: false,
                                    observaciones: 'Calibración realizada exitosamente. Instrumento dentro de especificaciones.',
                                    ciclo: { total: 3, numero: 1 },
                                    createdAt: serverTimestamp()
                                  });

                                  // Act 2: Feb 2026 — done
                                  await addDoc(collection(db, 'activities'), {
                                    instrumentId: inst.id,
                                    instrumentNombre: inst.nombre,
                                    codigoMJM: inst.codigoMJM,
                                    tenantId: selectedClient.id,
                                    tipo: tipos[1 % tipos.length],
                                    laboratorio: LABS[(total + 1) % LABS.length],
                                    fechaProgramada: '2026-02-10',
                                    fechaRealizacion: '2026-02-12',
                                    certificado: `CERT-${inst.codigoMJM}-FEB26`,
                                    prioridad: 'Normal',
                                    resultado: 'CONFORME',
                                    estado: 'done',
                                    evidencias: [],
                                    archivada: false,
                                    observaciones: 'Verificación periódica completada.',
                                    ciclo: { total: 3, numero: 2 },
                                    createdAt: serverTimestamp()
                                  });

                                  // Act 3: Jun 2026 — todo (próxima)
                                  await addDoc(collection(db, 'activities'), {
                                    instrumentId: inst.id,
                                    instrumentNombre: inst.nombre,
                                    codigoMJM: inst.codigoMJM,
                                    tenantId: selectedClient.id,
                                    tipo: tipos[0],
                                    laboratorio: LABS[(total + 2) % LABS.length],
                                    fechaProgramada: '2026-06-15',
                                    prioridad: inst.criticidad === 'Alta' ? 'Alta' : 'Normal',
                                    estado: 'todo',
                                    evidencias: [],
                                    archivada: false,
                                    observaciones: 'Calibración anual programada.',
                                    ciclo: { total: 3, numero: 3 },
                                    createdAt: serverTimestamp()
                                  });

                                  total++;
                                }
                                alert(`¡Listo! Se generaron ${total * 3} actividades para ${total} instrumentos.`);
                                setSelectedClient(null);
                              } catch (err) {
                                console.error("Error Sembrando Actividades:", err);
                                alert("Error: " + err.message);
                              } finally {
                                setSeeding(false);
                              }
                            }}
                            className={`w-full py-3 border-2 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all mb-2 ${
                              seeding ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white'
                            }`}
                          >
                            {seeding ? '🤖 Generando Actividades...' : '📅 Inyectar Actividades (Dic/25→Jun/26)'}
                          </button>

                       <button className="flex-1 py-4 bg-mjm-navy text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-mjm-navy/20 hover:bg-mjm-orange transition-all">
                          Gestionar Licencia
                       </button>
                       <button onClick={() => setSelectedClient(null)} className="px-6 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl hover:bg-gray-50 transition-all">
                          Cerrar
                       </button>
                    </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Settings = () => {
  const [activeSection, setActiveSection] = useState('system'); 
  const [activeTab, setActiveTab] = useState('geo'); 

  const menuItems = [
    { id: 'system', name: 'Administrador del Sistema', icon: <SettingsIcon size={20} /> },
    { id: 'clients', name: 'Gestión de Clientes', icon: <Building size={20} /> },
    { id: 'users', name: 'Usuarios y Permisos', icon: <Users size={20} /> },
  ];

  const systemTabs = [
    { id: 'geo', name: 'Configuración Geográfica', icon: <Globe size={16} /> },
    { id: 'landing', name: 'Landing Page', icon: <Layout size={16} /> },
    { id: 'params', name: 'Parametrización', icon: <Sliders size={16} /> },
  ];

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-mjm-navy uppercase tracking-tighter">Configuración General</h1>
        <p className="text-gray-500 font-medium font-sans">Administre las preferencias globales y el comportamiento del sistema.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        <div className="w-full lg:w-72 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all text-left ${
                activeSection === item.id 
                  ? 'bg-mjm-navy text-white shadow-lg shadow-mjm-navy/20' 
                  : 'text-gray-500 hover:bg-white hover:text-mjm-navy border border-transparent shadow-sm'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 shadow-sm">
          {activeSection === 'system' ? (
            <div className="space-y-8">
              <div className="flex overflow-x-auto pb-4 gap-4 border-b border-gray-100">
                {systemTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeTab === tab.id ? 'bg-mjm-orange text-white shadow-md' : 'text-gray-400 hover:text-mjm-navy bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.name}
                  </button>
                ))}
              </div>
              <div className="animate-in fade-in duration-500">
                {activeTab === 'geo' && <GeographicConfig />}
                {activeTab === 'landing' && <LandingPageConfig />}
                {activeTab === 'params' && <PlatformParams />}
              </div>
            </div>
          ) : activeSection === 'clients' ? (
            <ClientManagement />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center font-sans">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                 <Users size={40} />
              </div>
              <h3 className="text-xl font-bold text-mjm-navy">Usuarios y Permisos</h3>
              <p className="text-gray-500 max-w-sm mt-2">Sección disponible en la próxima actualización de seguridad.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
