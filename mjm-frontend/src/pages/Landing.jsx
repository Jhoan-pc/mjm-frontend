import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContentStore } from '../store/contentStore';
import { Menu, X, MapPin, MessageCircle, Calendar, Users, Target, Shield, Cog, Cpu, Wrench, Package, ArrowRight, CheckCircle, Clock, Phone, Mail, Thermometer, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import metrologyBg from '../assets/metrology_bg_real.jpg';
import headerLogo0 from '../assets/logo_final_2_0.png';
import logoAzul from '../assets/logo_azul_sin_fondo.png';
import logoChatbot from '../assets/logo_original_con_fondo.jpeg';

// Client Logos
import starrettLogo from '../assets/allies/starrett.png';
import unitLogo from '../assets/allies/unit.jpg';
import meritLogo from '../assets/allies/merit.jpg';
import wilcoxonLogo from '../assets/allies/wilcoxon.png';
import deltatrakLogo from '../assets/allies/deltatrak.jpg';
import flukeLogo from '../assets/allies/fluke.png';
import hiokiLogo from '../assets/allies/hioki.png';
import mitutoyoLogo from '../assets/allies/mitutoyo.png';
import ctcLogo from '../assets/allies/ctc.jpg';
import trumaxLogo from '../assets/allies/trumax.png';

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

const Landing = () => {
  const { landing } = useContentStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  
  // Chatbot State
  const [chatView, setChatView] = useState('options'); // 'options' or 'form'
  const [currentStep, setCurrentStep] = useState(0);
  const [chatData, setChatData] = useState({});
  const [inputValue, setInputValue] = useState('');

  const chatSteps = [
    { 
      id: 'email', 
      question: "¡Hola! Es un gusto saludarte. 👋 Para empezar con la programación de tu equipo, ¿podrías indicarme tu **correo electrónico** corporativo?", 
      placeholder: "ejemplo@empresa.com",
      type: "email"
    },
    { 
      id: 'company', 
      question: "¡Excelente! ¿A qué **empresa** representas?", 
      placeholder: "Nombre de tu empresa",
      type: "text"
    },
    { 
      id: 'name', 
      question: "Mucho gusto. ¿Con quién tengo el placer de hablar? 😊", 
      placeholder: "Tu nombre completo",
      type: "text"
    },
    { 
      id: 'position', 
      question: "¡Entendido! ¿Cuál es tu **cargo** en la empresa?", 
      placeholder: "Ej: Director de Calidad, Técnico, Gerente...",
      type: "text"
    },
    { 
      id: 'phone', 
      question: "¿Y un **teléfono** para contactarte si es necesario?", 
      placeholder: "Número de contacto",
      type: "tel"
    },
    { 
      id: 'location', 
      question: "¿Desde qué **ciudad o país** nos escribes?", 
      placeholder: "Ciudad, País",
      type: "text"
    },
    { 
      id: 'equipment_basics', 
      question: "Perfecto. Ahora hablemos del equipo: **¿Qué tipo de equipo es, y cuál es su marca y modelo?**", 
      placeholder: "Ej: Multímetro, Fluke 87V",
      type: "text"
    },
    { 
      id: 'equipment_details', 
      question: "Entendido. ¿Podrías darme la **serie o código interno** y decirme para qué se **usa** principalmente?", 
      placeholder: "Serie/Código y Aplicación",
      type: "text"
    },
    { 
      id: 'certification_info', 
      question: "¡Ya casi terminamos! ¿A nombre de quién emitimos el **certificado** (nombre y dirección)? ¿Tienes algún **punto específico** o **diagnóstico** que debamos saber?", 
      placeholder: "Datos del certificado y observaciones (si aplica)",
      type: "textarea"
    }
  ];

  const handleChatNext = () => {
    if (!inputValue.trim()) return;
    
    const currentField = chatSteps[currentStep].id;
    const newChatData = { ...chatData, [currentField]: inputValue };
    setChatData(newChatData);
    setInputValue('');

    if (currentStep < chatSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setChatView('loading'); // Nuevo estado para feedback visual
      useContentStore.getState().submitChatbotForm(newChatData).then(() => {
        setChatView('success');
      });
    }
  };

  const handleChatReset = () => {
    setChatView('options');
    setCurrentStep(0);
    setChatData({});
    setInputValue('');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Suscribirse a cambios en tiempo real del contenido
    const unsubscribe = useContentStore.getState().subscribeToLanding();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const services = [
    {
      id: 1,
      name: "Aseguramiento Metrológico",
      icon: <Target className="w-10 h-10" />,
      description: "Gestión integral de sus procesos de medición para garantizar conformidad y calidad bajo estándares ISO 9001. Nos aseguramos de que sus instrumentos funcionen con la máxima precisión requerida.",
      image: "/services/aseguramiento.png",
      imageModal: "/services/aseguramiento.png",
      features: [
        { title: "Clasificación de Equipos", desc: "Identificación y clasificación detallada de todos los instrumentos de medición para un control efectivo" },
        { title: "Levantamiento de Información", desc: "Recopilación exhaustiva de datos técnicos y metrológicos para establecer la línea base del aseguramiento" },
        { title: "Cronogramas Integrados", desc: "Planificación estratégica de rutinas para minimizar tiempos de inactividad" },
        { title: "Indicadores de Gestión", desc: "Visualización de datos y métricas clave para la toma de decisiones basada en evidencia" }
      ]
    },
    {
      id: 2,
      name: "Portal Operativo (SaaS)",
      icon: <Cpu className="w-10 h-10" />,
      description: "Plataforma Cloud-First para la gestión integral de activos, cronogramas de mantenimiento y aseguramiento metrológico.",
      image: "/services/saas_card.png",
      imageModal: "/services/saas_card.png",
      isCustomLayout: true,
      customData: {
        cards: [
          { title: "Dashboard de Control", icon: <Target className="w-5 h-5"/>, img: "/services/saas_dashboard.png", desc: "Indicadores clave de desempeño y estatus metrológico en tiempo real." },
          { title: "Planificador Metrológico", icon: <Calendar className="w-5 h-5"/>, img: "/services/saas_planificador.png", desc: "Gestión automatizada de cronogramas y actividades de calibración." },
          { title: "Inventario de Activos", icon: <Package className="w-5 h-5"/>, img: "/services/saas_inventario.png", desc: "Listado maestro de equipos con trazabilidad completa y alertas." },
          { title: "Seguridad Cloud", icon: <Shield className="w-5 h-5"/>, img: "/services/saas_dashboard.png", desc: "Respaldo de información en la nube con acceso restringido y seguro." }
        ]
      }
    },
    {
      id: 3,
      name: "Capacitación",
      icon: <Users className="w-10 h-10" />,
      description: "Programas especializados en metrología adaptados a las necesidades de su empresa, formando a su personal en las mejores prácticas de la industria.",
      image: "/services/capacitacion.jpg",
      imageModal: "/services/capacitacion-modal.jpg"
    },
    {
      id: 4,
      name: "Calibración de Instrumentos",
      icon: <Cog className="w-10 h-10" />,
      description: "Servicios de calibración trazable y acreditada con laboratorios aliados para garantizar la precisión de sus mediciones.",
      image: "/services/calibracion.jpeg",
      imageModal: "/services/calibracion-modal.jpeg",
      isCustomLayout: true,
      customData: {
        cards: [
          { title: "Medidores y Sensores de Vibración", icon: <Target className="w-5 h-5"/>, img: "/services/sub_vibracion_1.jpg" },
          { title: "Analizadores de Vibración", icon: <Clock className="w-5 h-5"/>, img: "/services/sub_vibracion_2.jpg" },
          { title: "Termómetros infrarrojos", icon: <Thermometer className="w-5 h-5"/>, img: "/services/sub_temperatura.jpg" },
          { title: "Alineadores Laser", icon: <Ruler className="w-5 h-5"/>, img: "/services/sub_longitud.jpg" }
        ]
      }
    },
    {
      id: 5,
      name: "Diagnóstico, Mantenimiento y Verificación",
      icon: <Wrench className="w-10 h-10" />,
      description: "Mantenga sus instrumentos en óptimas condiciones con nuestro servicio técnico especializado.",
      image: "/services/diagnostico.jpg",
      imageModal: "/services/diagnostico.jpg",
      isCustomLayout: true,
      customData: {
        cards: [
          { title: "Diagnóstico Técnico", icon: <Target className="w-5 h-5"/>, img: "/services/sub_diagnostico.jpg", desc: "Evaluación exhaustiva del estado y funcionamiento de sus instrumentos de medición" },
          { title: "Reparación Especializada", icon: <Wrench className="w-5 h-5"/>, img: "/services/sub_reparacion.jpg", desc: "Servicio técnico calificado para la reparación de equipos" },
          { title: "Verificación", icon: <CheckCircle className="w-5 h-5"/>, img: "/services/sub_verificacion.jpg", desc: "Comprobación de especificaciones y funcionamiento según aplicación" },
          { title: "Mantenimiento Preventivo", icon: <Shield className="w-5 h-5"/>, img: "/services/sub_preventivo.jpg", desc: "Programas de mantenimiento para extender la vida útil de sus equipos" }
        ]
      }
    },
    {
      id: 6,
      name: "Suministros e Instrumentos",
      icon: <Package className="w-10 h-10" />,
      description: "Provisión de instrumentos de medición de alta calidad, patrones y accesorios especializados.",
      image: "/services/suministros.jpg",
      imageModal: "/services/suministros.jpg",
      isCustomLayout: true,
      customData: {
        cards: [
          { title: "Instrumentos de Medición", icon: <Target className="w-5 h-5"/>, img: "/services/sub_instrumentos.jpg", desc: "• Calibradores • Micrómetros • Termómetros • Manómetros" },
          { title: "Elementos de Almacenamiento", icon: <Package className="w-5 h-5"/>, img: "/services/sub_almacenamiento.jpg", desc: "• Estuches de protección • Kits de limpieza • Soportes • Adaptadores" },
          { title: "Repuestos Originales", icon: <Cog className="w-5 h-5"/>, img: "/services/sub_repuestos.jpg", desc: "• Sensores • Baterías • Cables • Componentes" },
          { title: "Asesoría Personalizada", icon: <Users className="w-5 h-5"/>, img: "/services/sub_asesoria.jpg", desc: "• Selección de equipos • Cotizaciones • Soporte técnico • Garantías" }
        ]
      }
    }
  ];


  return (
    <div className="font-sans text-mjm-navy bg-white min-h-screen flex flex-col relative w-full overflow-x-hidden selection:bg-mjm-orange selection:text-white">
      
      {/* HEADER - Industrial/Corporate */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-xl h-20 text-mjm-navy' : 'bg-transparent text-white h-24 pt-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex-shrink-0 flex items-center">
              <a href="#inicio" className="block focus:outline-none transition-transform hover:scale-105 active:scale-95">
                <img 
                  src={scrolled ? logoAzul : headerLogo0} 
                  alt="Logo MJM" 
                  className={`transition-all duration-500 object-contain ${
                    !scrolled 
                      ? 'h-10 md:h-14 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                      : 'h-10 md:h-12'
                  }`} 
                />
              </a>
            </div>
            
            {/* Desktop Navigation - Professional & Clean */}
            <nav className="hidden md:flex space-x-10 items-center">
              <a href="#inicio" className="hover:text-mjm-orange font-bold transition-all uppercase text-[13px] tracking-tight py-1">Inicio</a>
              <a href="#nosotros" className="hover:text-mjm-orange font-bold transition-all uppercase text-[13px] tracking-tight py-1">Nosotros</a>
              <a href="#servicios" className="hover:text-mjm-orange font-bold transition-all uppercase text-[13px] tracking-tight py-1">Servicios</a>
              <Link to="/login" className="bg-mjm-orange text-white px-8 py-3 rounded-md font-black hover:bg-orange-600 transition-all shadow-[0_4px_14px_0_rgba(238,140,44,0.39)] uppercase text-xs tracking-widest">
                Portal de Clientes
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 transition-colors">
                {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white border-t border-mjm-navy/10 p-6 space-y-6 shadow-2xl absolute w-full"
            >
              <a href="#inicio" className="block text-xl font-black text-mjm-navy" onClick={() => setIsMobileMenuOpen(false)}>Inicio</a>
              <a href="#nosotros" className="block text-xl font-black text-mjm-navy" onClick={() => setIsMobileMenuOpen(false)}>Nosotros</a>
              <a href="#servicios" className="block text-xl font-black text-mjm-navy" onClick={() => setIsMobileMenuOpen(false)}>Servicios</a>
              <Link to="/login" className="block w-full text-center bg-mjm-orange text-white py-4 rounded-lg font-black uppercase tracking-widest">Portal de Clientes</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION - RECONSTRUCTED TO BE IDENTICAL IN TEXT AND IMAGE */}
      <section id="inicio" className="relative min-h-[90vh] flex items-center mt-20 md:mt-0 pt-0 overflow-hidden">
        {/* Background - Optimized Loading */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://asesoriasintegralesmjm.com/ui/principal2.jpeg" 
            alt="Fondo Metrología" 
            className="w-full h-full object-cover scale-105 animate-pulse-slow"
            fetchPriority="high"
          />
          {/* Enhanced Blue Filter Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-mjm-navy via-mjm-navy/80 to-[#1a3a5a]/60 z-10"></div>
          <div className="absolute inset-0 bg-mjm-navy/30 mix-blend-multiply z-11"></div>
          
          {/* Industrial Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 z-12 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 w-full text-center lg:text-left py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] mb-8 animate-in fade-in slide-in-from-left duration-700 delay-100">
              {landing.hero.title.split(' ').slice(0, 2).join(' ')} <br/>
              <span className="text-mjm-orange">{landing.hero.title.split(' ').slice(2).join(' ')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed font-bold max-w-xl animate-in fade-in slide-in-from-left duration-700 delay-200">
              {landing.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start animate-in fade-in slide-in-from-left duration-700 delay-300">
              <a href="#servicios" className="bg-mjm-orange hover:bg-orange-600 text-white px-12 py-5 rounded-md font-black uppercase text-[13px] transition-all shadow-[0_10px_30px_-5px_rgba(238,140,44,0.6)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 tracking-widest group">
                NUESTROS SERVICIOS <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </a>

            </div>
          </div>
          
          {/* FLOATING ICONTEC BADGE (RIGHT SIDE) */}
          <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 animate-in fade-in slide-in-from-right duration-700 delay-500">
            <button 
              onClick={() => setIsCertModalOpen(true)}
              className="bg-[#fbfcff] rounded-2xl border-2 border-mjm-orange/30 shadow-[0_10px_30px_rgba(0,0,0,0.15)] p-4 pr-6 flex items-center gap-4 hover:scale-105 hover:shadow-[0_15px_40px_rgba(238,140,44,0.3)] hover:border-mjm-orange transition-all group outline-none"
            >
              <img 
                src="https://asesoriasintegralesmjm.com/ui/icontec.png" 
                alt="Logo Icontec ISO 9001" 
                className="h-[4.5rem] w-auto drop-shadow-sm group-hover:drop-shadow-md transition-all" 
                loading="lazy"
              />
              <div className="flex flex-col text-left justify-center">
                <span className="text-mjm-navy font-black text-2xl leading-none tracking-tight mb-0.5">Certificación</span>
                <span className="text-mjm-orange font-black text-[28px] leading-none tracking-tight">ISO 9001</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN: NUESTRO ALCANCE - CORPORATE CONTENT */}
      <section className="bg-white py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded shadow-[30px_30px_0px_0px_rgba(238,140,44,1)] overflow-hidden">
                <img src="https://asesoriasintegralesmjm.com/services/alcance.jpeg" alt="Metrologo MJM trabajando" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" loading="lazy" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-mjm-navy -z-0"></div>
            </div>
            
            <div className="lg:w-1/2">
              <span className="text-mjm-orange font-black uppercase tracking-[0.3em] text-xs mb-6 block">Trayectoria y Confianza</span>
              <h2 className="text-5xl md:text-7xl font-black mb-10 leading-none text-mjm-navy">Nuestro <br/>Alcance</h2>
              <div className="w-20 h-2 bg-mjm-orange mb-12"></div>
              <p className="text-xl text-mjm-navy/70 leading-relaxed font-medium mb-12">
                Con más de 12 años de experiencia, Asesorías Integrales MJM S.A.S. se ha consolidado como el aliado estratégico ideal para empresas que buscan la excelencia en sus sistemas de medición.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-mjm-navy text-white flex items-center justify-center rounded-sm font-black text-xl">01</div>
                    <span className="font-black uppercase text-[11px] tracking-widest text-mjm-navy">Consultoría ISO 9001</span>
                  </div>
                  <p className="text-sm text-mjm-navy/60 font-medium">Asesoramos la implementación de sistemas de calidad metrológica bajo los más altos estándares internacionales.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-mjm-orange text-white flex items-center justify-center rounded-sm font-black text-xl">02</div>
                    <span className="font-black uppercase text-[11px] tracking-widest text-mjm-navy">Criterio Técnico</span>
                  </div>
                  <p className="text-sm text-mjm-navy/60 font-medium">Nuestros expertos brindan soporte especializado para la toma de decisiones críticas en aseguramiento metrológico.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO DE SERVICIOS - PREMIUM ENHANCED */}
      <section id="servicios" className="bg-[#f8f9fa] py-40 border-y border-mjm-navy/5 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-mjm-orange/5 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-mjm-orange font-black uppercase tracking-[0.4em] text-xs mb-8 block">Servicios de Ingeniería</span>
          <h2 className="text-6xl md:text-8xl font-black text-mjm-navy mb-24 tracking-tighter">Portafolio <br/>Técnico</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.165, 0.84, 0.44, 1] }}
                key={service.id} 
                className="group relative bg-white rounded-[2rem] transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(35,76,116,0.15)] cursor-pointer overflow-hidden border border-mjm-navy/5 flex flex-col text-left"
                onClick={() => setActiveService(service)}
              >
                {/* Image Header */}
                <div className="relative w-full h-56 overflow-hidden bg-mjm-navy/5">
                  <div className="absolute inset-0 bg-mjm-navy/20 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>

                {/* Content Section */}
                <div className="relative z-10 w-full flex flex-col h-full p-10 pt-0">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-mjm-navy/5 group-hover:border-mjm-orange/20 group-hover:bg-mjm-orange flex items-center justify-center text-mjm-orange group-hover:text-white -mt-10 mb-8 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-xl z-20">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-black text-mjm-navy mb-6 uppercase tracking-widest leading-tight group-hover:text-mjm-orange transition-colors duration-500">{service.name}</h3>
                  <div className="w-12 h-1 bg-mjm-orange/30 group-hover:w-full group-hover:bg-mjm-orange transition-all duration-700 mb-8 rounded-full"></div>
                  <p className="text-mjm-navy/70 leading-relaxed font-medium mb-12 flex-grow">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-mjm-navy/40 group-hover:text-mjm-orange transition-colors duration-500 mt-auto">
                    Detalles Técnicos 
                    <ArrowRight size={14} className="group-hover:translate-x-3 transition-transform duration-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* SERVICE MODAL - FOR TECHNICAL DETAILS */}
      {activeService && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-mjm-navy/95 backdrop-blur-md" onClick={() => setActiveService(null)}></div>
          <div className="relative z-10 bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] rounded-3xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setActiveService(null)}
              className={`absolute top-6 right-6 z-50 rounded-full p-2 transition-all ${activeService.isCustomLayout ? 'text-white/60 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md' : 'text-mjm-navy/30 hover:text-mjm-orange bg-mjm-navy/5 hover:bg-mjm-navy/10'}`}
            >
              <X size={28} />
            </button>

            {activeService.isCustomLayout ? (
              <div className="w-full h-full overflow-y-auto custom-scrollbar bg-mjm-navy flex flex-col">
                <div className="text-center pt-20 pb-16 px-8 relative">
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                   <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight relative z-10">{activeService.name}</h2>
                   <p className="text-lg md:text-xl text-white/80 font-medium max-w-3xl mx-auto relative z-10">{activeService.description}</p>
                </div>
                
                <div className="px-8 pb-16">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeService.customData?.cards.map((card, idx) => (
                      <div key={idx} className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-xl border-4 border-white/5">
                        <div className="h-40 overflow-hidden relative bg-[#e2e8f0]">
                          <img src={card.img} alt={card.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="p-6 flex-grow flex flex-col items-center justify-center text-center gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#fff0e5] text-mjm-orange flex items-center justify-center shrink-0">
                              {card.icon}
                            </div>
                            <h4 className="font-black text-mjm-navy text-[13px] leading-tight uppercase relative">{card.title}</h4>
                          </div>
                          {card.desc && (
                            <p className="text-[11px] text-mjm-navy/60 font-medium leading-relaxed mt-2">{card.desc}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mx-8 mb-16 bg-mjm-orange rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 shadow-[0_10px_40px_rgba(238,140,44,0.3)]">
                   <div className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center border-2 border-white/50 bg-white/10">
                     <CheckCircle className="text-white w-7 h-7" />
                   </div>
                   <div>
                     <h3 className="text-white text-2xl font-black mb-1">Comprometidos con la Trazabilidad</h3>
                     <p className="text-white/90 font-medium text-sm">Nuestros patrones y entregables cumplen con la norma NTC-ISO/IEC 17025</p>
                   </div>
                </div>

                <div className="bg-white w-full mt-auto pt-14 pb-14 border-t-8 border-mjm-orange/10">
                  <h3 className="text-center text-mjm-navy font-black text-xl md:text-2xl mb-10 tracking-tight">Marcas que trabajamos</h3>
                  <div className="relative flex overflow-hidden w-full">
                    <motion.div 
                      className="flex gap-16 items-center justify-around translate-x-0 shrink-0"
                      style={{ minWidth: "200%" }}
                      animate={{ x: ["0%", "-50%"] }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    >
                      {[...brandLogos, ...brandLogos].map((logo, idx) => (
                        <div key={`modal-logo-${idx}`} className="h-16 w-32 flex items-center justify-center">
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
                <img src={activeService.imageModal} alt={activeService.name} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-mjm-navy via-mjm-navy/40 to-transparent"></div>
              </div>
              <div className="relative z-10 p-12 md:p-16 flex flex-col justify-end h-full">
                <div className="w-16 h-16 bg-mjm-orange text-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 transform -rotate-3 border-4 border-white/10">
                  {React.cloneElement(activeService.icon, { className: "w-8 h-8" })}
                </div>
                <h3 className="text-white text-3xl md:text-4xl font-black uppercase leading-tight tracking-tight drop-shadow-xl break-words">
                  {activeService.name}
                </h3>
              </div>
            </div>
            <div className="md:w-1/2 p-10 md:p-14 overflow-y-auto custom-scrollbar">
              <div className="space-y-8 pr-2">
                <h2 className="text-3xl md:text-4xl font-black text-mjm-navy uppercase tracking-tighter leading-tight pr-6">{activeService.name}</h2>
                <div className="w-16 h-2 bg-mjm-orange rounded-full"></div>
                <p className="text-lg text-mjm-navy/80 leading-relaxed font-medium">
                  {activeService.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-mjm-navy/5 p-6 rounded-2xl border-l-4 border-mjm-orange/30">
                  {activeService.features ? (
                    activeService.features.map((feat, idx) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="text-mjm-orange w-4 h-4 shrink-0 mt-0.5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-mjm-navy leading-tight">{feat.title}</span>
                        </div>
                        <p className="text-[11px] text-mjm-navy/70 font-medium pl-6 leading-relaxed">{feat.desc}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-mjm-orange w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-mjm-navy">ISO 9001:2015</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-mjm-orange w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-mjm-navy">Trazabilidad</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-mjm-orange w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-mjm-navy">Capacitación</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-mjm-orange w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-mjm-navy">Soporte Técnico</span>
                      </div>
                    </>
                  )}
                </div>
                <button className="w-full bg-mjm-orange text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-4">
                  Solicitar Cotización Inmediata
                </button>
              </div>
            </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DEL CERTIFICADO ISO */}
      <AnimatePresence>
        {isCertModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-mjm-navy/80 backdrop-blur-md" 
              onClick={() => setIsCertModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-4xl h-fit max-h-[90vh] flex flex-col items-center"
            >
              <div className="w-full flex justify-end mb-4">
                <button 
                  onClick={() => setIsCertModalOpen(false)} 
                  className="bg-mjm-orange/20 hover:bg-mjm-orange text-white w-12 h-12 rounded-full transition-all flex items-center justify-center backdrop-blur-md border border-white/10 group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
              
              <div className="w-full bg-[#fbfbfb] rounded-2xl border-4 border-white/20 p-2 sm:p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_80px_rgba(238,140,44,0.15)] overflow-hidden">
                <div className="w-full h-full overflow-y-auto max-h-[75vh] custom-scrollbar">
                    <img 
                      src="https://asesoriasintegralesmjm.com/ui/certificacion.png" 
                      alt="Certificado Oficial ISO 9001:2015" 
                      className="w-full h-auto object-contain rounded-lg shadow-inner" 
                      loading="lazy"
                    />
                </div>
              </div>

              <div className="mt-6">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] animate-pulse">
                  Click fuera para cerrar
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECCIÓN SOBRE NOSOTROS - REFACTOREAD WITH ORIGINAL CONTENT & CIMGA PHOTO */}
      <section id="nosotros" className="bg-mjm-navy py-40 relative overflow-hidden text-white border-b border-white/5">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="/nosotros/cimga.jpg" alt="Background Texture" className="w-full h-full object-cover blur-sm" />
        </div>
        <div className="absolute inset-0 bg-mjm-navy/80 z-1"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            {/* Lead Text & Image Column */}
            <div className="lg:w-1/2 space-y-12">
              <div className="space-y-6">
                <span className="text-mjm-orange font-black uppercase tracking-[0.4em] text-[11px] block">Trayectoria y Liderazgo</span>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] uppercase italic">Sobre <br/>Nosotros</h2>
                <div className="w-24 h-3 bg-mjm-orange rounded-full"></div>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden border-4 border-white/10 group shadow-2xl">
                <img src="/nosotros/cimga.jpg" alt="Participación CIMGA" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-mjm-navy to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm font-black uppercase tracking-widest text-mjm-orange mb-2">Compromiso Industrial</p>
                  <p className="text-xl font-bold leading-tight">Participación destacada en eventos técnicos de metrología como CIMGA.</p>
                </div>
              </div>

              <p className="text-2xl text-white/80 leading-relaxed font-bold italic border-l-8 border-mjm-orange pl-8 py-4 bg-white/5 uppercase tracking-tighter">
                "Media década de experiencia en aseguramiento metrológico, comprometidos con la excelencia y la mejora continua."
              </p>
            </div>

            {/* Strategic Pillars Column */}
            <div className="lg:w-1/2 grid grid-cols-1 gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-white/5 p-8 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                  <h3 className="text-xl font-black mb-4 uppercase tracking-widest text-mjm-orange underline decoration-2 underline-offset-8">Misión</h3>
                  <p className="text-sm text-white/70 leading-relaxed font-medium">Ser un aliado estratégico para la estructuración y fortalecimiento de la gestión metrológica de nuestros clientes basándonos en la experiencia técnico-científica.</p>
                </div>
                <div className="bg-white/5 p-8 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                  <h3 className="text-xl font-black mb-4 uppercase tracking-widest text-white underline decoration-2 underline-offset-8">Visión</h3>
                  <p className="text-sm text-white/70 leading-relaxed font-medium">Liderar el mercado nacional a través de la prestación de servicios integrales, confiables y oportunos.</p>
                </div>
              </div>

              <div className="bg-white/5 p-10 border border-mjm-orange/30 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-black mb-8 uppercase tracking-widest text-white flex items-center gap-4">
                  <span className="w-8 h-1 bg-mjm-orange block"></span> Pilares Operacionales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                  <div className="space-y-3">
                    <p className="font-black text-xs uppercase tracking-[0.2em] text-mjm-orange">Innovación Continua</p>
                    <p className="text-sm text-white/50 leading-relaxed">Implementamos desarrollos que optimizan procesos de medición.</p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-black text-xs uppercase tracking-[0.2em] text-mjm-orange">Excelencia Operacional</p>
                    <p className="text-sm text-white/50 leading-relaxed">Altos estándares de calidad certificados por ISO 9001:2015.</p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-black text-xs uppercase tracking-[0.2em] text-mjm-orange">Desarrollo del Talento</p>
                    <p className="text-sm text-white/50 leading-relaxed">Fortalecemos continuamente las competencias técnicas de nuestro equipo.</p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-black text-xs uppercase tracking-[0.2em] text-mjm-orange">Crecimiento Sostenible</p>
                    <p className="text-sm text-white/50 leading-relaxed">Expansión estratégica y presencia sólida en el mercado colombiano.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {["Integridad", "Confianza", "Pasión"].map((val, i) => (
                  <span key={val} className="px-6 py-2 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-mjm-orange">
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EQUIPO DE TRABAJO - CORPORATE GRID - REFACTORED TO LIGHT THEME */}
      <section className="bg-white py-40 border-t border-mjm-navy/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <span className="text-mjm-orange font-black uppercase tracking-[0.4em] text-xs mb-6 block">Talento Especializado</span>
            <h2 className="text-6xl md:text-8xl font-black text-mjm-navy tracking-tighter uppercase leading-none">Nuestro <br className="md:hidden"/>Equipo</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div className="w-full h-80 bg-[#f8f9fa] rounded-2xl border border-mjm-navy/5 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                <img src="/team/team_1.jpg" alt="MJM Technical Team 1" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-3xl font-black text-mjm-navy leading-tight tracking-tight uppercase">Expertos en diversas magnitudes físicas y calidad.</p>
              <p className="text-xl text-mjm-navy/60 leading-relaxed font-medium">Nuestra fuerza radica en el Staff de metrólogos calificados y aliados estratégicos en Bogotá y a nivel nacional.</p>
            </div>
            <div className="space-y-12">
              <div className="w-full h-80 bg-mjm-navy/5 rounded-2xl border border-mjm-navy/10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                <img src="/team/team_2.jpg" alt="MJM Technical Team 2" className="w-full h-full object-cover shadow-2xl" loading="lazy" />
              </div>
              <p className="text-3xl font-black text-mjm-navy leading-tight tracking-tight uppercase">Laboratorios acreditados bajo estándares internacionales.</p>
              <p className="text-xl text-mjm-navy/60 leading-relaxed font-medium">Trabajamos bajo criterios técnicos estrictos para asegurar que cada medición resista auditorías de alta exigencia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - REFACTORED TO IMPACT ORANGE THEME */}
      <section className="bg-mjm-orange py-40 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-6xl md:text-9xl font-black text-mjm-navy mb-12 tracking-tighter uppercase leading-none italic">¿LISTO PARA <br/>LA EXCELENCIA?</h2>
          <p className="text-2xl text-white font-black uppercase tracking-[0.3em] mb-16">Optimice su Aseguramiento Metrológico Hoy</p>
          <div className="flex justify-center">
            <a 
              href="https://wa.me/573137960800" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-mjm-navy text-white px-20 py-8 rounded-md font-black uppercase text-sm tracking-widest hover:bg-white hover:text-mjm-navy shadow-[0_20px_40px_-10px_rgba(10,15,26,0.4)] hover:-translate-y-2 transition-all flex items-center justify-center gap-4 group"
            >
              Contactar por WhatsApp <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* CLIENT LOGOS CAROUSEL - AUTOMATIC & INFINITE */}
      <section className="bg-white py-20 border-y border-mjm-navy/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
          <span className="text-mjm-navy/30 font-black uppercase tracking-[0.5em] text-[10px]">Alianzas y Respaldo Técnico</span>
        </div>
        
        <div className="relative flex overflow-hidden">
          <motion.div 
            className="flex gap-24 items-center justify-around translate-x-0 shrink-0"
            style={{ minWidth: "200%" }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 39, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...brandLogos, ...brandLogos].map((logo, idx) => (
              <img 
                key={`logo-${idx}`} 
                src={logo} 
                alt="Client Brand" 
                className="h-14 md:h-16 w-auto object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
                loading="lazy"
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* FOOTER - REFACTORED TO BE SIMPLE, ELEGANT AND COMPLETE */}
      <footer className="bg-[#0a0f1a] pt-28 pb-12 text-white/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            {/* Column 1: Brand & Info */}
            <div className="space-y-8">
              <div className="flex flex-col">
                <span className="text-white font-black text-2xl tracking-tighter uppercase leading-none">Asesorías Integrales</span>
                <span className="text-mjm-orange font-black text-2xl tracking-tighter uppercase leading-none">MJM</span>
              </div>
              <p className="text-sm leading-relaxed font-medium max-w-xs">
                Expertos en aseguramiento metrológico y consultoría técnica con certificación ISO 9001. Impulsando la excelencia industrial en Colombia.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-mjm-orange hover:text-white transition-all">
                  <span className="font-black text-xs">ln</span>
                </a>
              </div>
            </div>

            {/* Column 2: Services */}
            <div>
              <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">Servicios</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#servicios" className="hover:text-mjm-orange transition-colors">Aseguramiento Metrológico</a></li>
                <li><a href="#servicios" className="hover:text-mjm-orange transition-colors">Capacitación Técnica</a></li>
                <li><a href="#servicios" className="hover:text-mjm-orange transition-colors">Calibración de Instrumentos</a></li>
                <li><a href="#servicios" className="hover:text-mjm-orange transition-colors">Diagnóstico y Mantenimiento</a></li>
                <li><a href="#servicios" className="hover:text-mjm-orange transition-colors">Suministros Técnicos</a></li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">Enlaces Rápidos</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#inicio" className="hover:text-mjm-orange transition-colors">Inicio</a></li>
                <li><a href="#nosotros" className="hover:text-mjm-orange transition-colors">Nosotros</a></li>
                <li><a href="#servicios" className="hover:text-mjm-orange transition-colors">Servicios</a></li>
                <li><Link to="/login" className="hover:text-mjm-orange transition-colors">Portal de Clientes</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">Contacto</h4>
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-mjm-orange shrink-0 mt-0.5" />
                <span className="text-sm font-medium">comercial.asesoriasmjm@gmail.com</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-mjm-orange shrink-0" />
                <span className="text-sm font-medium">+57 313 7960800</span>
              </div>
              <div className="flex items-start gap-4 group">
                <MapPin className="w-5 h-5 text-mjm-orange shrink-0 mt-0.5 group-hover:scale-125 transition-transform" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Cl 2 #71d-84</span>
                  <span className="text-xs text-white/30 uppercase tracking-widest font-black">Bogotá, Colombia</span>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Cl+2+%2371d-84,+Bogotá,+Colombia" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-mjm-orange font-black uppercase tracking-widest hover:underline mt-1 flex items-center gap-1"
                  >
                    Ver en Google Maps <ArrowRight size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold">
            <p>&copy; 2026 Asesorías Integrales MJM S.A.S. - Todos los derechos reservados.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
            </div>
          </div>
        </div>
      </footer>

      {/* CHATBOT - LEAN & ELEGANT CORPORATE INTERFACE */}
      <div className="fixed bottom-8 right-8 z-[110] flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="absolute bottom-24 right-0 w-[420px] max-w-[calc(100vw-40px)] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_30px_100px_-20px_rgba(10,21,32,0.3)] border border-mjm-navy/10 overflow-hidden flex flex-col"
            >
              <div className="p-8 bg-mjm-navy text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 p-2 flex items-center justify-center border border-white/10">
                    <img src={logoChatbot} alt="MJM" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg tracking-tight leading-none uppercase">Atención Corporativa</h4>
                    <p className="text-[9px] font-bold text-mjm-orange uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                       Asistencia en Línea
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/40 hover:text-white transition-colors p-2 lg:-mr-2">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto max-h-[500px] min-h-[300px]">
                {chatView === 'options' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                      <p className="text-xl font-black text-mjm-navy leading-tight">
                        ¿Cómo podemos asistirte hoy?
                      </p>
                      <p className="text-sm text-mjm-navy/50 font-medium max-w-[90%]">
                        Selecciona una opción para que nuestro equipo técnico te acompañe en tu solicitud.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => setChatView('form')}
                        className="group flex items-center gap-5 p-5 bg-white border border-mjm-navy/5 rounded-2xl text-left transition-all hover:border-mjm-orange hover:shadow-xl hover:shadow-mjm-orange/10 active:scale-95"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-mjm-navy/5 text-mjm-navy flex items-center justify-center transition-colors group-hover:bg-mjm-orange group-hover:text-white">
                          <Package size={22} strokeWidth={2} />
                        </div>
                        <span className="font-black text-mjm-navy text-[13px] uppercase tracking-widest flex-1">Programar entrega de equipo</span>
                        <ArrowRight size={16} className="text-mjm-navy/10 group-hover:text-mjm-orange transition-all group-hover:translate-x-1" />
                      </button>
                      
                      <a 
                        href="https://wa.me/573137960800"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-5 p-5 bg-white border border-mjm-navy/5 rounded-2xl text-left transition-all hover:border-mjm-orange hover:shadow-xl hover:shadow-mjm-orange/10 active:scale-95"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-mjm-navy/5 text-mjm-navy flex items-center justify-center transition-colors group-hover:bg-green-500 group-hover:text-white">
                          <MessageCircle size={22} strokeWidth={2} />
                        </div>
                        <span className="font-black text-mjm-navy text-[13px] uppercase tracking-widest flex-1">Contactar asesor comercial</span>
                        <ArrowRight size={16} className="text-mjm-navy/10 group-hover:text-mjm-orange transition-all group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                )}

                {chatView === 'form' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <button 
                      onClick={handleChatReset}
                      className="text-[10px] font-black uppercase tracking-widest text-mjm-navy/40 hover:text-mjm-orange transition-colors flex items-center gap-2"
                    >
                      Volver al inicio
                    </button>
                    
                    <div className="space-y-6">
                      <div className="p-5 bg-mjm-navy/5 rounded-2xl border-l-4 border-mjm-orange">
                        <p className="text-[15px] font-bold text-mjm-navy leading-relaxed" dangerouslySetInnerHTML={{ __html: chatSteps[currentStep].question }}></p>
                      </div>

                      <div className="space-y-4">
                        {chatSteps[currentStep].type === 'textarea' ? (
                          <textarea 
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) handleChatNext();
                            }}
                            placeholder={chatSteps[currentStep].placeholder}
                            className="w-full p-5 bg-white border border-mjm-navy/10 rounded-2xl focus:border-mjm-orange focus:ring-4 focus:ring-mjm-orange/5 outline-none transition-all font-medium text-sm min-h-[120px] resize-none"
                          />
                        ) : (
                          <input 
                            autoFocus
                            type={chatSteps[currentStep].type}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleChatNext();
                            }}
                            placeholder={chatSteps[currentStep].placeholder}
                            className="w-full p-5 bg-white border border-mjm-navy/10 rounded-2xl focus:border-mjm-orange focus:ring-4 focus:ring-mjm-orange/5 outline-none transition-all font-medium text-sm"
                          />
                        )}
                        
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-mjm-navy/30">
                          <span>Paso {currentStep + 1} de {chatSteps.length}</span>
                          <button 
                            disabled={!inputValue.trim()}
                            onClick={handleChatNext}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                              inputValue.trim() 
                                ? 'bg-mjm-orange text-white shadow-lg shadow-mjm-orange/20' 
                                : 'bg-mjm-navy/5 text-mjm-navy/20 cursor-not-allowed'
                            }`}
                          >
                            Continuar <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {chatView === 'loading' && (
                  <div className="text-center py-24 animate-in fade-in duration-500">
                    <div className="w-16 h-16 border-4 border-mjm-orange/20 border-t-mjm-orange rounded-full animate-spin mx-auto mb-8"></div>
                    <p className="text-sm font-black text-mjm-navy uppercase tracking-widest animate-pulse">Procesando tu solicitud...</p>
                  </div>
                )}

                {chatView === 'success' && (
                  <div className="text-center space-y-8 py-10 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-2xl font-black text-mjm-navy tracking-tight leading-none">¡Información Recibida!</h4>
                      <p className="text-sm text-mjm-navy/60 font-medium">
                        Gracias por confiar en **MJM SAS**. Hemos registrado tu solicitud de entrega de equipo correctamente.
                      </p>
                    </div>
                    <p className="text-sm text-mjm-navy/80 font-bold bg-mjm-navy/5 p-6 rounded-2xl">
                      Un especialista técnico revisará los datos y se comunicará contigo vía telefónica o correo electrónico en breve para coordinar los detalles finales.
                    </p>
                    <button 
                      onClick={handleChatReset}
                      className="w-full py-4 bg-mjm-navy text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-mjm-navy/90 transition-all"
                    >
                      Listo, gracias
                    </button>
                  </div>
                )}
              </div>

              <div className="px-8 pb-8 pt-2">
                <div className="h-px bg-mjm-navy/5 mb-8"></div>
                <p className="text-center text-[9px] font-black uppercase tracking-[0.5em] text-mjm-navy/20">
                  MJM • Soporte Metrológico
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center group border-b-4 active:border-b-0 active:translate-y-1
            ${isChatOpen 
              ? 'bg-mjm-navy text-white border-mjm-navy shadow-mjm-navy/20' 
              : 'bg-mjm-orange text-white border-orange-700 shadow-mjm-orange/30 hover:-translate-y-1'
            }`}
        >
          {isChatOpen ? <X size={28} /> : <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />}
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white"></span>
            </span>
          )}
        </button>
      </div>

    </div>
  );
};

export default Landing;
