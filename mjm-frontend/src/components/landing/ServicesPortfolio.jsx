import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  Target, 
  Cpu, 
  Users, 
  Cog, 
  Wrench, 
  Package, 
  Calendar, 
  Shield, 
  Thermometer, 
  Ruler, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Mail,
  Eye,
  ChevronRight,
  Play
} from 'lucide-react';
import PlatformVideoPlayer from './PlatformVideoPlayer';

const services = [
  {
    id: "aseguramiento",
    num: "01",
    tag: "Aseguramiento en Planta",
    name: "Aseguramiento Metrológico Integral",
    icon: Target,
    badge: "SERVICIO CENTRAL / ISO 9001",
    description: "Gestión integral de sus procesos de medición para garantizar conformidad y calidad bajo estándares ISO 9001 e ISO 10012.",
    longDesc: "Diseñamos y estructuramos planes de aseguramiento metrológico en sitio. Levantamos la línea base técnica de su parque de instrumentos, establecemos intervalos de confirmación metrológica y definimos reglas de decisión para proteger a su empresa ante cualquier auditoría externa de ICONTEC o INVIMA.",
    image: "/photos/diagnostico_vibraciones_fluke.jpg",
    standardsTitle: "NORMA ISO 10012 & CONFIRMACIÓN METROLÓGICA",
    standardsDesc: "Evaluación matemática de error e incertidumbre frente a las tolerancias de su proceso industrial.",
    gallery: [
      { url: "/photos/diagnostico_vibraciones_fluke.jpg", title: "Banco Técnico de Caracterización de Instrumentos & Ensayos" },
      { url: "/photos/calibracion_balanzas_planta.jpg", title: "Aseguramiento Metrológico en Planta & Salas Limpias" },
      { url: "/photos/analizador_emerson_csi2130.jpg", title: "Verificación de Trazabilidad y Estado de Activos Críticos" }
    ],
    features: [
      { title: "Clasificación Técnica", desc: "Inventario maestro y clasificación de criticidad para instrumentos en planta." },
      { title: "Línea Base & Tolerancias", desc: "Recopilación de tolerancias de proceso y especificaciones del fabricante." },
      { title: "Cronogramas de Rutina", desc: "Planificación estratégica para minimizar tiempos de parada en producción." },
      { title: "Indicadores de Gestión", desc: "Métricas de conformidad (Cl. 7.1) y cumplimiento de calibraciones en tiempo real." }
    ]
  },
  {
    id: "calibracion",
    num: "02",
    tag: "Laboratorio Trazable",
    name: "Calibración de Instrumentos",
    icon: Cog,
    badge: "5 MAGNITUDES FÍSICAS / NTC-ISO/IEC 17025",
    description: "Servicios de calibración trazable y acreditada con laboratorios aliados para garantizar la exactitud en vibración, temperatura, longitud y presión.",
    longDesc: "Ejecutamos calibraciones trazables bajo norma NTC-ISO/IEC 17025 con patrones de referencia de alta exactitud. Entregamos certificados oficiales con cálculo de incertidumbre expandida (GUM) y declaración de conformidad según criterios de aceptación técnica.",
    image: "/photos/calibracion_termografia_flir_cuerpo_negro.jpg",
    standardsTitle: "TRAZABILIDAD ONAC / NIST",
    standardsDesc: "Patrones de referencia calibrados periódicamente para asegurar repetibilidad y validez internacional.",
    gallery: [
      { url: "/photos/calibracion_termografia_flir_cuerpo_negro.jpg", title: "Calibración de Temperatura & Infrarrojos con Cavidad de Cuerpo Negro a 50.0°C" },
      { url: "/photos/calibrador_vibraciones_vc21.jpg", title: "Calibración de Sensores de Vibración con Patrón Portátil VC21 a 1280 Hz" },
      { url: "/photos/calibracion_multimetro_fluke87v.jpg", title: "Calibración Eléctrica Fluke 87V con Caja de Décadas de Resistencia Extech" },
      { url: "/photos/calibracion_vibracion_fluke805.jpg", title: "Verificación Metrológica de Medidores Fluke 805 a 320 Hz" }
    ],
    cards: [
      { title: "Medidores & Sensores de Vibración", desc: "Verificación de acelerómetros, sensores de proximidad y monitoreo predictivo.", icon: <Target className="w-4 h-4"/> },
      { title: "Analizadores de Vibración Multicanal", desc: "Calibración de colectores y sistemas dinámicos para mantenimiento.", icon: <Clock className="w-4 h-4"/> },
      { title: "Termometría & Cámaras Termográficas", desc: "Ajuste de emisividad, verificación de sensores infrarrojos y termocuplas.", icon: <Thermometer className="w-4 h-4"/> },
      { title: "Alineadores Laser de Ejes", desc: "Verificación de coplanaridad y precisión en maquinaria rotativa.", icon: <Ruler className="w-4 h-4"/> }
    ]
  },
  {
    id: "mantenimiento",
    num: "03",
    tag: "Servicio Técnico Calificado",
    name: "Diagnóstico, Mantenimiento & Verificación",
    icon: Wrench,
    badge: "SERVICIO PREVENTIVO & CORRECTIVO",
    description: "Evaluación técnica especializada, reparación de instrumentos críticos y verificación intermedia para extender la vida útil de sus activos.",
    longDesc: "Un instrumento con desgaste silencioso genera pérdidas millonarias en lotes defectuosos. Realizamos diagnóstico exhaustivo de componentes electrónicos y mecánicos, limpieza metrológica, ajustes de cero y verificaciones intermedias en campo.",
    image: "/photos/analizador_vibraciones_skf.jpg",
    standardsTitle: "VERIFICACIONES INTERMEDIAS",
    standardsDesc: "Comprobación rápida entre calibraciones para detectar derivas antes de auditorías.",
    gallery: [
      { url: "/photos/analizador_vibraciones_skf.jpg", title: "Diagnóstico Dinámico y Espectral con Colector SKF Microlog" },
      { url: "/photos/analizador_emerson_csi2130.jpg", title: "Monitoreo de Condición y Salud de Maquinaria Emerson CSI 2130" },
      { url: "/photos/laboratorio_osciloscopio_generador.jpg", title: "Alineación y Mantenimiento Electrónico en Banco Tektronix" }
    ],
    cards: [
      { title: "Diagnóstico Técnico en Campo", desc: "Evaluación del estado funcional y repetibilidad del instrumento.", icon: <Target className="w-4 h-4"/> },
      { title: "Reparación Especializada", desc: "Servicio técnico calificado para restauración de componentes electrónicos.", icon: <Wrench className="w-4 h-4"/> },
      { title: "Verificación Intermedia", desc: "Comprobación de especificaciones de proceso antes de entrar a turno.", icon: <CheckCircle className="w-4 h-4"/> },
      { title: "Mantenimiento Preventivo", desc: "Planes programados de conservación para alargar la vida útil del equipo.", icon: <Shield className="w-4 h-4"/> }
    ]
  },
  {
    id: "capacitacion",
    num: "04",
    tag: "Formación Técnica",
    name: "Capacitación Especializada en Metrología",
    icon: Users,
    badge: "PROGRAMAS TÉCNICOS A LA MEDIDA",
    description: "Talleres prácticos de metrología, interpretación de certificados de calibración y normas de calidad dirigidos al personal técnico de planta.",
    longDesc: "Fortalecemos las competencias técnicas de su equipo. Enseñamos a interpretar los certificados de calibración, entender los errores máximos permisibles (EMP) y aplicar buenas prácticas de laboratorio para evitar errores de medición en la operación diaria.",
    image: "/photos/laboratorio_osciloscopio_generador.jpg",
    standardsTitle: "ALINEACIÓN ISO 9001 / ISO 17025",
    standardsDesc: "Capacitación orientada a superar preguntas de auditoría técnica con solidez conceptual.",
    gallery: [
      { url: "/photos/laboratorio_osciloscopio_generador.jpg", title: "Talleres Prácticos de Manejo de Instrumentación y Generadores de Señal" },
      { url: "/photos/verificacion_emision_acustica.jpg", title: "Entrenamiento en Ultrasonido, Emisión Acústica y Rigor Normativo ONAC" },
      { url: "/photos/mjm_expo_industrial.jpg", title: "Participación y Formación Técnica en Foros Industriales Nacionales" }
    ],
    features: [
      { title: "Fundamentos y Magnitudes", desc: "Principios teóricos y aplicación práctica en líneas de producción." },
      { title: "Interpretación de Certificados", desc: "Criterios de aceptación, análisis de incertidumbre GUM y errores." },
      { title: "Buenas Prácticas en Planta", desc: "Manejo, conservación y almacenamiento de instrumentos de precisión." },
      { title: "Talleres a la Medida", desc: "Contenidos adaptados específicamente a los instrumentos de su empresa." }
    ]
  },
  {
    id: "suministros",
    num: "05",
    tag: "Equipamiento & Patrones",
    name: "Suministros Técnicos & Equipos de Medición",
    icon: Package,
    badge: "DISTRIBUCIÓN DIRECTA MULTIMARCA",
    description: "Provisión de instrumentos de medición de alta gama, patrones de referencia y accesorios de marcas líderes mundiales con garantía técnica.",
    longDesc: "Proveemos instrumentos de medición de las marcas más prestigiosas de la industria (Fluke, SKF, Megger, FLIR, EasyLaser, Mitutoyo). Asesoramos técnicamente su compra para asegurar que el rango, resolución y precisión cumplan exactamente con la necesidad de su proceso.",
    image: "/photos/espectrometro_xrf_aleaciones.jpg",
    standardsTitle: "GARANTÍA TÉCNICA DE FÁBRICA",
    standardsDesc: "Equipos 100% originales con respaldo de fabricante y opción de calibración inicial.",
    gallery: [
      { url: "/photos/espectrometro_xrf_aleaciones.jpg", title: "Suministro y Verificación de Analizadores XRF y Equipos Multimarca" },
      { url: "/photos/calibracion_multimetro_fluke87v.jpg", title: "Multímetros Industriales Fluke 87V y Herramientas Eléctricas" },
      { url: "/photos/calibrador_vibraciones_vc21.jpg", title: "Calibradores Patrón y Sensores Industriales con Garantía" }
    ],
    cards: [
      { title: "Instrumentos de Medición", desc: "Calibradores, micrómetros, manómetros, termómetros, tacómetros.", icon: <Target className="w-4 h-4"/> },
      { title: "Estuches de Protección", desc: "Cajas de alta resistencia, kits de limpieza metrológica y soportes.", icon: <Package className="w-4 h-4"/> },
      { title: "Sensores & Repuestos", desc: "Acelerómetros piezoeléctricos, cables blindados y baterías originales.", icon: <Cog className="w-4 h-4"/> },
      { title: "Asesoría de Selección", desc: "Acompañamiento técnico para elegir el instrumento exacto para su proceso.", icon: <Users className="w-4 h-4"/> }
    ]
  },
  {
    id: "saas",
    num: "06",
    tag: "Ventaja Exclusiva • Incluido en su Plan",
    isFeatured: true,
    name: "Software de Gobernanza Metrológica & Hojas de Vida QR",
    icon: Cpu,
    badge: "100% INCLUIDO EN PLAN ANUAL • ISO 10012",
    description: "Plataforma digital en la nube con acceso multi-usuario para la custodia de hojas de vida, escaneo QR en planta, cálculo GUM y semaforización de vencimientos 24/7 sin costo de licencia mensual.",
    longDesc: "El diferenciador definitivo de MJM: al contratar el aseguramiento técnico o calibración anual en planta, le entregamos la plataforma digital completa sin costos de suscripción mensual. Cero carpetas físicas extraviadas, cero pérdidas de tiempo buscando certificados ante auditores y control en vivo desde cualquier tablet o celular.",
    image: "/services/saas_card.png",
    standardsTitle: "MODELO MULTI-TENANT SEGURO",
    standardsDesc: "Espacios de trabajo independientes y aislados por empresa, planta o filial corporativa.",
    gallery: [
      { url: "/demo/platform_demo.webm", type: "video", title: "Video Recorrido: Navegación por la Plataforma en Vivo" },
      { url: "/demo/03_dashboard_kpis.png", type: "image", title: "Panel Central de Control & KPIs Metrológicos en Vivo" },
      { url: "/demo/04_inventario.png", type: "image", title: "Inventario Maestro de Activos Trazables en Planta" },
      { url: "/demo/05_aseguramiento_gum.png", type: "image", title: "Evaluación Matemática de Conformidad (Criterio GUM)" },
      { url: "/demo/06_kanban.png", type: "image", title: "Tablero Kanban de Calibración en Laboratorio" },
      { url: "/demo/07_calendario.png", type: "image", title: "Planificador y Calendario Preventivo de Paradas" }
    ],
    cards: [
      { title: "Hojas de Vida con Código QR", desc: "Registro inalterable con tolerancias, datos de placa y certificados adjuntos escaneables en planta.", icon: <Target className="w-4 h-4"/> },
      { title: "Planificador Metrológico", desc: "Cronogramas automatizados con semáforo preventivo a 30, 60 y 90 días.", icon: <Calendar className="w-4 h-4"/> },
      { title: "Cálculo GUM / ISO 10012", desc: "Evaluación algorítmica de Error + Incertidumbre frente a la tolerancia del proceso.", icon: <Shield className="w-4 h-4"/> },
      { title: "Licencia Anual 100% Incluida", desc: "Sin costos mensuales recurrentes. Incluido al contratar el aseguramiento técnico en planta.", icon: <Cpu className="w-4 h-4"/> }
    ]
  },
];

// ─── PORTAFOLIO PRINCIPAL: SPLIT-SCREEN STICKY PINNED CON FEED CONTINUO (INGYEMEL ENGINE) ────
const ServicesPortfolio = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [activeFocusedServiceId, setActiveFocusedServiceId] = useState("aseguramiento");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [modalMediaIndices, setModalMediaIndices] = useState({
    aseguramiento: 0,
    calibracion: 0,
    mantenimiento: 0,
    capacitacion: 0,
    suministros: 0,
    saas: 0
  });

  // Auto scroll & Intersection Observer for Modal Spotlight Focus Effect (Ingyemel Architecture)
  useEffect(() => {
    if (!selectedService) return;
    setActiveFocusedServiceId(selectedService.id);

    setTimeout(() => {
      const el = document.getElementById(`modal-card-${selectedService.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    const rootEl = document.getElementById('modal-feed-container');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const srvId = entry.target.id.replace('modal-card-', '');
            setActiveFocusedServiceId(srvId);
          }
        });
      },
      { root: rootEl, threshold: 0.25 }
    );

    services.forEach((srv) => {
      const el = document.getElementById(`modal-card-${srv.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selectedService?.id]);

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <>
      {/* 5. NUESTROS SERVICIOS SECTION (Dual-Column Pinned Scroll Gallery Ingyemel Style) */}
      <section 
        id="servicios" 
        className="py-28 md:py-36 bg-gradient-to-b from-[#121214] via-[#09090B] to-[#070708] relative z-20 shadow-2xl border-t-2 border-white/20 rounded-t-[44px] md:rounded-t-[64px]"
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Columna Izquierda: Sticky Pinned en Desktop (Apuntalado a la izquierda) */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6 self-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7931b]/10 border border-[#f7931b]/30 backdrop-blur-md text-[#f7931b] font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#f7931b] animate-pulse shrink-0"></span>
                <span>ESPECIALIDADES DE INGENIERÍA</span>
              </div>

              <h2 className="font-space font-extrabold text-3xl sm:text-5xl lg:text-[3.25rem] text-white uppercase tracking-tight leading-[1.08]">
                BLINDAJE & CONTROL <br />
                <span className="text-[#f7931b]">METROLÓGICO</span>
              </h2>

              <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-light font-inter">
                Un ecosistema de 6 especialidades que unifica metrólogos calificados en su planta, laboratorio trazable en 5 magnitudes y gobernanza digital de activos 100% incluida.
              </p>

              <div className="pt-4 space-y-4">
                <a
                  href="#contacto"
                  className="w-full sm:w-auto px-8 py-4 bg-[#f7931b] text-zinc-950 font-extrabold rounded-2xl hover:bg-orange-400 active:scale-[0.98] transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-2xl shadow-orange-500/30 cursor-pointer font-space"
                >
                  <Mail className="w-4 h-4 text-zinc-950" />
                  <span>SOLICITAR DIAGNÓSTICO OPORTUNO</span>
                </a>
                
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Soporte Metrológico 24/7 Disponible</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Stack Vertical de Tarjetas Canvas Oscuras con Scroll y Watermark Numbers */}
            <div className="lg:col-span-7 space-y-12">
              {services.map((service) => {
                const IconComponent = service.icon;
                const numStr = service.num;

                return (
                  <div
                    key={service.id}
                    onMouseMove={handleCardMouseMove}
                    onClick={() => setSelectedService(service)}
                    className="canvas-card p-6 md:p-10 space-y-6 group cursor-pointer overflow-hidden relative"
                  >
                    {/* Editorial Watermark Number (Exacto como en la imagen) */}
                    <span className="absolute top-4 right-6 z-20 font-space text-6xl md:text-7xl font-extrabold text-white/20 group-hover:text-[#f7931b]/40 transition-colors select-none pointer-events-none drop-shadow-md">
                      {numStr}
                    </span>

                    {/* Image Box / Live Video Box */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-black/60 border border-white/15">
                      {service.id === 'saas' ? (
                        <video
                          src="/demo/platform_demo.webm"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-black/85 text-[#f7931b] border border-[#f7931b]/40 backdrop-blur-md text-[10px] font-mono font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xl">
                          {service.tag}
                        </span>
                      </div>
                    </div>

                    {/* Service Content */}
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#f7931b]/10 border border-[#f7931b]/30 flex items-center justify-center text-[#f7931b]">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#f7931b] font-bold">
                          ESPECIALIDAD {numStr}
                        </span>
                      </div>

                      <h3 className="font-space font-extrabold text-2xl md:text-3xl text-white uppercase tracking-tight group-hover:text-[#f7931b] transition-colors">
                        {service.name}
                      </h3>

                      <p className="text-zinc-300 text-xs md:text-sm font-light leading-relaxed font-inter">
                        {service.description}
                      </p>

                      {service.id === 'saas' && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsVideoModalOpen(true);
                            }}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#f7931b]/20 to-orange-500/10 border border-[#f7931b]/50 text-white font-space font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 hover:bg-[#f7931b] hover:text-zinc-950 transition-all shadow-lg shadow-orange-500/20 group/btn cursor-pointer"
                          >
                            <Play className="w-4 h-4 text-[#f7931b] group-hover/btn:text-zinc-950 fill-[#f7931b] group-hover/btn:fill-zinc-950" />
                            <span>Ver Video Demostración en Vivo (Opción A)</span>
                          </button>
                        </div>
                      )}

                      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-mono">
                        <div className="flex items-center gap-2 text-[#f7931b] font-bold text-[11px]">
                          <Sparkles className="w-3.5 h-3.5 text-[#f7931b] animate-pulse shrink-0" />
                          <span>Toca la tarjeta para abrir el Dossier & Galería</span>
                        </div>
                        <div className="px-4 py-2 bg-[#f7931b] text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-orange-400 transition-all uppercase text-[11px] tracking-wider shadow-lg shadow-orange-500/20 cursor-pointer font-space">
                          <Eye className="w-3.5 h-3.5 text-zinc-950" />
                          <span>Explorar Ficha Completa</span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-950 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* 6. CONTINUOUS VERTICAL MODAL FEED WITH SPOTLIGHT FOCUS EFFECT (EXACT INGYEMEL ENGINE) */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] bg-black/94 backdrop-blur-2xl animate-in fade-in duration-300">
          
          {/* Strictly Fixed & Sticky Close Button (Always visible on viewport) */}
          <button
            onClick={() => setSelectedService(null)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[130] p-3 sm:p-3.5 rounded-full bg-zinc-950/90 text-white border-2 border-mjm-orange/60 hover:bg-mjm-orange hover:text-white transition-all shadow-[0_0_30px_rgba(247,147,27,0.35)] cursor-pointer flex items-center justify-center group"
            title="Cerrar Dossier"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          <div id="modal-feed-container" className="w-full h-full overflow-y-auto subtle-scroll px-3 sm:px-8 py-6 sm:py-[max(40px,calc(50vh-280px))]">
            
            {/* Vertical Stack of All 6 Service Modal Cards with Spotlight Focus Effect */}
            <div className="max-w-6xl mx-auto w-full space-y-12 sm:space-y-20">
              {services.map((service, sIndex) => {
                const currentMediaIndex = modalMediaIndices[service.id] || 0;
                const numStr = service.num;
                const isFocused = activeFocusedServiceId === service.id;
                const whatsappMsg = encodeURIComponent(`Hola, requiero cotización y soporte técnico sobre "${service.name}" (Especialidad ${numStr}).`);

                return (
                  <div
                    key={service.id}
                    id={`modal-card-${service.id}`}
                    className={`canvas-card w-full rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-2xl flex flex-col lg:flex-row relative scroll-mt-24 transition-all duration-500 ease-out bg-[#0F121B]/95 text-white ${
                      isFocused 
                        ? 'border-2 border-mjm-orange/60 shadow-[0_0_90px_rgba(247,147,27,0.22)] opacity-100 scale-100' 
                        : 'border border-white/15 hover:border-mjm-orange/40 shadow-2xl opacity-90'
                    }`}
                  >
                    {/* Left Column: Widescreen Media Viewer & Thumbnails */}
                    <div className="lg:w-7/12 min-h-[320px] sm:min-h-[420px] lg:min-h-[500px] relative bg-zinc-950 flex flex-col justify-between p-3 sm:p-6">
                      <div className="absolute inset-0 z-0">
                        {service.gallery?.[currentMediaIndex]?.type === 'video' ? (
                          <video 
                            key={`video-${service.id}-${currentMediaIndex}`}
                            src={service.gallery[currentMediaIndex].url} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            controls
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <img 
                            src={service.gallery?.[currentMediaIndex]?.url || service.image} 
                            alt={service.name} 
                            loading="lazy" 
                            decoding="async" 
                            className="w-full h-full object-cover animate-in fade-in duration-500" 
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-black/40 pointer-events-none" />
                      </div>

                      {/* Top Media Title Badge & Slide Counter */}
                      <div className="relative z-10 flex items-center justify-between w-full pr-2 sm:pr-4">
                        <div className="bg-black/75 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white/10 text-[10px] sm:text-xs font-medium text-white max-w-[75%] truncate shadow-lg">
                          <span className="text-mjm-orange font-bold font-mono">
                            {service.gallery?.[currentMediaIndex]?.title || service.name}
                          </span>
                        </div>
                        {service.gallery && (
                          <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-white/10 text-[10px] sm:text-xs font-mono text-zinc-300 font-bold">
                            0{currentMediaIndex + 1} / 0{service.gallery.length}
                          </div>
                        )}
                      </div>

                      {/* Bottom Thumbnail Gallery Selector */}
                      {service.gallery && service.gallery.length > 1 && (
                        <div className="relative z-10 flex gap-2 w-full p-2 bg-black/75 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 mt-auto overflow-x-auto">
                          {service.gallery.map((media, idx) => (
                            <button
                              key={idx}
                              onClick={() => setModalMediaIndices(prev => ({ ...prev, [service.id]: idx }))}
                              className={`relative h-12 w-20 sm:h-14 sm:w-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                                currentMediaIndex === idx ? 'border-mjm-orange scale-105 shadow-xl shadow-orange-500/30' : 'border-transparent opacity-50 hover:opacity-100'
                              }`}
                            >
                              {media.type === 'video' ? (
                                <div className="w-full h-full bg-[#070b14] flex flex-col items-center justify-center text-white relative">
                                  <Play size={16} className="text-[#f7931b] fill-[#f7931b]" />
                                  <span className="text-[8px] font-mono font-bold text-[#f7931b] uppercase mt-0.5">VIDEO</span>
                                </div>
                              ) : (
                                <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Executive Technical Sheet & CTA */}
                    <div className="lg:w-5/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 relative">
                      
                      {/* Editorial Watermark Number */}
                      <span className="absolute top-4 sm:top-6 right-6 sm:right-8 font-space text-5xl sm:text-6xl md:text-7xl font-extrabold text-white/10 select-none pointer-events-none drop-shadow-md z-0">
                        {numStr}
                      </span>

                      <div className="space-y-4 relative z-10">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-mjm-orange/10 border border-mjm-orange/30 rounded-full text-mjm-orange font-mono text-[10px] sm:text-[11px] uppercase tracking-wider mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ESPECIALIDAD {numStr}</span>
                          </div>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-space text-white uppercase tracking-tight leading-tight">
                            {service.name}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed font-inter">
                          {service.longDesc}
                        </p>

                        {/* Standards Banner */}
                        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                          <h4 className="font-space font-bold text-xs uppercase tracking-wider text-mjm-orange">
                            {service.standardsTitle}
                          </h4>
                          <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                            {service.standardsDesc}
                          </p>
                        </div>

                        {/* Specs grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {service.cards ? (
                            service.cards.map((c, i) => (
                              <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-xs">
                                <div className="font-bold text-white uppercase flex items-center gap-1.5 text-[11px]">
                                  <span className="text-mjm-orange">{c.icon}</span>
                                  <span>{c.title}</span>
                                </div>
                                <p className="text-[10px] text-zinc-400 font-light mt-0.5 leading-relaxed">{c.desc}</p>
                              </div>
                            ))
                          ) : (
                            service.features?.map((f, i) => (
                              <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-xs">
                                <div className="font-bold text-white uppercase flex items-center gap-1.5 text-[11px]">
                                  <CheckCircle className="w-3.5 h-3.5 text-mjm-orange shrink-0" />
                                  <span>{f.title}</span>
                                </div>
                                <p className="text-[10px] text-zinc-400 font-light mt-0.5 leading-relaxed">{f.desc}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-4 border-t border-white/10 flex flex-col gap-3 relative z-10">
                        <a
                          href={`https://wa.me/573137960800?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full btn-primary flex items-center justify-center gap-2 text-center shadow-lg shadow-orange-500/25 font-space font-bold uppercase text-xs tracking-wider"
                        >
                          <Mail className="w-4 h-4 text-white" />
                          <span>Cotizar esta Especialidad</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </a>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* 7. MODAL DE VIDEO DEMOSTRACIÓN INTERACTIVA (OPCIÓN A) */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Botón de Cierre */}
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[160] p-3 sm:p-3.5 rounded-full bg-zinc-950/90 text-white border-2 border-[#f7931b]/60 hover:bg-[#f7931b] hover:text-zinc-950 transition-all shadow-[0_0_30px_rgba(247,147,27,0.35)] cursor-pointer flex items-center justify-center group"
              title="Cerrar Demostración"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-200" />
            </button>

            <div className="w-full max-w-6xl my-auto animate-in zoom-in-95 duration-300">
              <PlatformVideoPlayer onDemoClick={() => setIsVideoModalOpen(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ServicesPortfolio;
