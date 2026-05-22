import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Target, Cpu, Users, Cog, Wrench, Package, Calendar, Shield, Thermometer, Ruler, Clock, ArrowRight } from 'lucide-react';

const brandLogos = [
  "/brands/1693432797912-pmaaao.png",
  "/brands/1763365987FAG (1).png",
  "/brands/441881478_122148678764198124_1758329588444554_n.jpg",
  "/brands/Adash_www.png",
  "/brands/EASYLASER_600px.png",
  "/brands/FLIR_logo.svg.png",
  "/brands/Fluke_logo.svg.png",
  "/brands/Megger_logo_without_slogan.svg.png",
  "/brands/SKF-Logo.png",
  "/brands/b0a75f_f62ecb4182b64bdbab646485b47f2f5a~mv2.png",
  "/brands/channels4_profile.jpg"
];

const services = [
  {
    id: 1, name: "Aseguramiento Metrológico", icon: <Target className="w-10 h-10" />,
    description: "Gestión integral de sus procesos de medición para garantizar conformidad y calidad bajo estándares ISO 9001.",
    image: "/services/aseguramiento.png", imageModal: "/services/aseguramiento.png",
    features: [
      { title: "Clasificación de Instrumentos", desc: "Identificación y clasificación detallada de todos los instrumentos de medición para un control efectivo" },
      { title: "Levantamiento de Información", desc: "Recopilación exhaustiva de datos técnicos y metrológicos para establecer la línea base del aseguramiento" },
      { title: "Cronogramas Integrados", desc: "Planificación estratégica de rutinas para minimizar tiempos de inactividad" },
      { title: "Indicadores de Gestión", desc: "Visualización de datos y métricas clave para la toma de decisiones basada en evidencia" }
    ]
  },
  {
    id: 2, name: "Portal Operativo (SaaS)", icon: <Cpu className="w-10 h-10" />,
    description: "Plataforma Cloud-First para la gestión integral de activos, cronogramas de mantenimiento y aseguramiento metrológico.",
    image: "/services/saas_card.png", imageModal: "/services/saas_card.png", isCustomLayout: true,
    customData: { cards: [
      { title: "Dashboard de Control", icon: <Target className="w-5 h-5"/>, img: "/services/saas_dashboard.png", desc: "Indicadores clave de desempeño y estatus metrológico en tiempo real." },
      { title: "Planificador Metrológico", icon: <Calendar className="w-5 h-5"/>, img: "/services/saas_planificador.png", desc: "Gestión automatizada de cronogramas y actividades de calibración." },
      { title: "Inventario de Activos", icon: <Package className="w-5 h-5"/>, img: "/services/saas_inventario.png", desc: "Listado maestro de instrumentos con trazabilidad completa y alertas." },
      { title: "Seguridad Cloud", icon: <Shield className="w-5 h-5"/>, img: "/services/saas_dashboard.png", desc: "Respaldo de información en la nube con acceso restringido y seguro." }
    ]}
  },
  {
    id: 3, name: "Capacitación", icon: <Users className="w-10 h-10" />,
    description: "Programas especializados en metrología adaptados a las necesidades de su empresa.",
    image: "/services/capacitacion.jpg", imageModal: "/services/capacitacion-modal.jpg"
  },
  {
    id: 4, name: "Calibración de Instrumentos", icon: <Cog className="w-10 h-10" />,
    description: "Servicios de calibración trazable y acreditada con laboratorios aliados para garantizar la precisión de sus mediciones.",
    image: "/services/calibracion.jpeg", imageModal: "/services/calibracion-modal.jpeg", isCustomLayout: true,
    customData: { cards: [
      { title: "Medidores y Sensores de Vibración", icon: <Target className="w-5 h-5"/>, img: "/services/sub_vibracion_1.jpg" },
      { title: "Analizadores de Vibración", icon: <Clock className="w-5 h-5"/>, img: "/services/sub_vibracion_2.jpg" },
      { title: "Termómetros infrarrojos", icon: <Thermometer className="w-5 h-5"/>, img: "/services/sub_temperatura.jpg" },
      { title: "Alineadores Laser", icon: <Ruler className="w-5 h-5"/>, img: "/services/sub_longitud.jpg" }
    ]}
  },
  {
    id: 5, name: "Diagnóstico, Mantenimiento y Verificación", icon: <Wrench className="w-10 h-10" />,
    description: "Mantenga sus instrumentos en óptimas condiciones con nuestro servicio técnico especializado.",
    image: "/services/diagnostico.jpg", imageModal: "/services/diagnostico.jpg", isCustomLayout: true,
    customData: { cards: [
      { title: "Diagnóstico Técnico", icon: <Target className="w-5 h-5"/>, img: "/services/sub_diagnostico.jpg", desc: "Evaluación exhaustiva del estado y funcionamiento de sus instrumentos de medición" },
      { title: "Reparación Especializada", icon: <Wrench className="w-5 h-5"/>, img: "/services/sub_reparacion.jpg", desc: "Servicio técnico calificado para la reparación de instrumentos" },
      { title: "Verificación", icon: <CheckCircle className="w-5 h-5"/>, img: "/services/sub_verificacion.jpg", desc: "Comprobación de especificaciones y funcionamiento según aplicación" },
      { title: "Mantenimiento Preventivo", icon: <Shield className="w-5 h-5"/>, img: "/services/sub_preventivo.jpg", desc: "Programas de mantenimiento para extender la vida útil de sus instrumentos" }
    ]}
  },
  {
    id: 6, name: "Suministros e Instrumentos", icon: <Package className="w-10 h-10" />,
    description: "Provisión de instrumentos de medición de alta calidad, patrones y accesorios especializados.",
    image: "/services/suministros.jpg", imageModal: "/services/suministros.jpg", isCustomLayout: true,
    customData: { cards: [
      { title: "Instrumentos de Medición", icon: <Target className="w-5 h-5"/>, img: "/services/sub_instrumentos.jpg", desc: "• Calibradores • Micrómetros • Termómetros • Manómetros" },
      { title: "Elementos de Almacenamiento", icon: <Package className="w-5 h-5"/>, img: "/services/sub_almacenamiento.jpg", desc: "• Estuches de protección • Kits de limpieza • Soportes • Adaptadores" },
      { title: "Repuestos Originales", icon: <Cog className="w-5 h-5"/>, img: "/services/sub_repuestos.jpg", desc: "• Sensores • Baterías • Cables • Componentes" },
      { title: "Asesoría Personalizada", icon: <Users className="w-5 h-5"/>, img: "/services/sub_asesoria.jpg", desc: "• Selección de instrumentos • Cotizaciones • Soporte técnico • Garantías" }
    ]}
  },
];

// --- SERVICE MODAL ---
const ServiceModal = ({ service, onClose }) => (
  <AnimatePresence>
    {service && (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-mjm-navy/95 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] rounded-3xl"
        >
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 z-50 rounded-full p-2 transition-all ${
              service.isCustomLayout
                ? 'text-white/60 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md'
                : 'text-mjm-navy/30 hover:text-mjm-orange bg-mjm-navy/5 hover:bg-mjm-navy/10'
            }`}
          >
            <X size={28} />
          </button>

          {service.isCustomLayout ? (
            <div className="w-full h-full overflow-y-auto bg-mjm-navy flex flex-col">
              <div className="text-center pt-20 pb-16 px-8 relative">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight relative z-10">{service.name}</h2>
                <p className="text-lg md:text-xl text-white/80 font-medium max-w-3xl mx-auto relative z-10">{service.description}</p>
              </div>
              <div className="px-8 pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {service.customData?.cards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-xl">
                      <div className="h-40 overflow-hidden bg-[#e2e8f0]">
                        <img src={card.img} alt={card.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-6 flex-grow flex flex-col items-center justify-center text-center gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#fff0e5] text-mjm-orange flex items-center justify-center shrink-0">{card.icon}</div>
                          <h4 className="font-black text-mjm-navy text-[13px] leading-tight uppercase">{card.title}</h4>
                        </div>
                        {card.desc && <p className="text-[11px] text-mjm-navy/60 font-medium leading-relaxed mt-2">{card.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mx-8 mb-16 bg-mjm-orange rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-[0_10px_40px_rgba(238,140,44,0.3)]">
                <div className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center border-2 border-white/50 bg-white/10">
                  <CheckCircle className="text-white w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-white text-2xl font-black mb-1">Comprometidos con la Trazabilidad</h3>
                  <p className="text-white/90 font-medium text-sm">Nuestros patrones y entregables cumplen con la norma NTC-ISO/IEC 17025</p>
                </div>
              </div>
              <div className="bg-white w-full pt-14 pb-14 border-t-8 border-mjm-orange/10">
                <h3 className="text-center text-mjm-navy font-black text-xl md:text-2xl mb-10 tracking-tight">Marcas que trabajamos</h3>
                <div className="relative flex overflow-hidden w-full">
                  <motion.div
                    className="flex gap-16 items-center shrink-0"
                    style={{ minWidth: '200%' }}
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  >
                    {[...brandLogos, ...brandLogos].map((logo, idx) => (
                      <div key={idx} className="h-16 w-32 flex items-center justify-center">
                        <img src={logo} alt="Brand Logo" className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100" />
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row w-full h-full">
              <div className="md:w-1/2 relative overflow-hidden bg-mjm-navy min-h-[300px]">
                <div className="absolute inset-0 z-0">
                  <img src={service.imageModal} alt={service.name} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-mjm-navy via-mjm-navy/40 to-transparent" />
                </div>
                <div className="relative z-10 p-12 md:p-16 flex flex-col justify-end h-full">
                  <div className="w-16 h-16 bg-mjm-orange text-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 transform -rotate-3 border-4 border-white/10">
                    {React.cloneElement(service.icon, { className: 'w-8 h-8' })}
                  </div>
                  <h3 className="text-white text-3xl md:text-4xl font-black uppercase leading-tight tracking-tight drop-shadow-xl">{service.name}</h3>
                </div>
              </div>
              <div className="md:w-1/2 p-10 md:p-14 overflow-y-auto">
                <div className="space-y-8 pr-2">
                  <h2 className="text-3xl md:text-4xl font-black text-mjm-navy uppercase tracking-tighter leading-tight pr-6">{service.name}</h2>
                  <div className="w-16 h-2 bg-mjm-orange rounded-full" />
                  <p className="text-lg text-mjm-navy/80 leading-relaxed font-medium">{service.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-mjm-navy/5 p-6 rounded-2xl border-l-4 border-mjm-orange/30">
                    {service.features ? (
                      service.features.map((feat, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="text-mjm-orange w-4 h-4 shrink-0 mt-0.5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-mjm-navy leading-tight">{feat.title}</span>
                          </div>
                          <p className="text-[11px] text-mjm-navy/70 font-medium pl-6 leading-relaxed">{feat.desc}</p>
                        </div>
                      ))
                    ) : (
                      ['ISO 9001:2015', 'Trazabilidad', 'Capacitación', 'Soporte Técnico'].map(item => (
                        <div key={item} className="flex items-center gap-3">
                          <CheckCircle className="text-mjm-orange w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-mjm-navy">{item}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <button className="w-full bg-mjm-orange text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-4">
                    Solicitar Cotización Inmediata
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- PORTFOLIO PRINCIPAL ---
const ServicesPortfolio = () => {
  const [activeService, setActiveService] = useState(null);
  const close = useCallback(() => setActiveService(null), []);

  return (
    <>
      <section id="servicios" className="bg-[#f8f9fa] py-40 border-y border-mjm-navy/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-mjm-orange/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-mjm-orange font-black uppercase tracking-[0.4em] text-xs mb-8 block">Servicios de Ingeniería</span>
          <h2 className="text-6xl md:text-8xl font-black text-mjm-navy mb-24 tracking-tighter">Portafolio <br/>Técnico</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.165, 0.84, 0.44, 1] }}
                className="group relative bg-white rounded-[2rem] transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(35,76,116,0.15)] cursor-pointer overflow-hidden border border-mjm-navy/5 flex flex-col text-left"
                onClick={() => setActiveService(service)}
              >
                <div className="relative w-full h-56 overflow-hidden bg-mjm-navy/5">
                  <div className="absolute inset-0 bg-mjm-navy/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="relative z-10 w-full flex flex-col h-full p-10 pt-0">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-mjm-navy/5 group-hover:border-mjm-orange/20 group-hover:bg-mjm-orange flex items-center justify-center text-mjm-orange group-hover:text-white -mt-10 mb-8 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-xl z-20">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-black text-mjm-navy mb-6 uppercase tracking-widest leading-tight group-hover:text-mjm-orange transition-colors duration-500">{service.name}</h3>
                  <div className="w-12 h-1 bg-mjm-orange/30 group-hover:w-full group-hover:bg-mjm-orange transition-all duration-700 mb-8 rounded-full" />
                  <p className="text-mjm-navy/70 leading-relaxed font-medium mb-12 flex-grow">{service.description}</p>
                  <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-mjm-navy/40 group-hover:text-mjm-orange transition-colors duration-500 mt-auto">
                    Detalles Técnicos <ArrowRight size={14} className="group-hover:translate-x-3 transition-transform duration-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de servicio — estado aislado, no afecta el resto de la página */}
      <ServiceModal service={activeService} onClose={close} />
    </>
  );
};

export default ServicesPortfolio;
