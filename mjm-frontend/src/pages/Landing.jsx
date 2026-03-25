import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContentStore } from '../store/contentStore';
import { Menu, X, MapPin, MessageCircle, Calendar, Users, Target, Shield, Cog, Cpu, Wrench, Package, ArrowRight, CheckCircle, Clock, Phone, Mail } from 'lucide-react';
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

const clientLogos = [
  starrettLogo, unitLogo, meritLogo, wilcoxonLogo, deltatrakLogo, 
  flukeLogo, hiokiLogo, mitutoyoLogo, ctcLogo, trumaxLogo
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
      description: "Gestión integral de sus procesos de medición para garantizar conformidad y calidad bajo estándares ISO 9001. Nos aseguramos de que sus instrumentos funcionen con la máxima precisión requerida."
    },
    {
      id: 2,
      name: "[NUEVO SERVICIO (Placeholder)]",
      icon: <Shield className="w-10 h-10" />,
      description: "Espacio reservado para el nuevo servicio corporativo que complementará nuestra oferta de aseguramiento. Próximamente estructurado para satisfacer nuevas demandas industriales."
    },
    {
      id: 3,
      name: "Capacitación",
      icon: <Users className="w-10 h-10" />,
      description: "Programas especializados en metrología adaptados a las necesidades de su empresa, formando a su personal en las mejores prácticas de la industria."
    },
    {
      id: 4,
      name: "Calibración",
      icon: <Cog className="w-10 h-10" />,
      description: "Servicios de calibración trazable y acreditada realizados con laboratorios aliados. Aseguramos la confiabilidad en las mediciones críticas para su operación."
    },
    {
      id: 5,
      name: "Diagnóstico y Mantenimiento",
      icon: <Wrench className="w-10 h-10" />,
      description: "Evaluación técnica y mantenimiento preventivo de instrumentos de medición industriales para prolongar su vida útil y precisión."
    },
    {
      id: 6,
      name: "Suministros",
      icon: <Package className="w-10 h-10" />,
      description: "Provisión de instrumentos de medición de alta calidad, patrones y accesorios especializados de las marcas más reconocidas a nivel mundial."
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
              <a href="#servicios" className="hover:text-mjm-orange font-bold transition-all uppercase text-[13px] tracking-tight py-1">Servicios</a>
              <a href="#nosotros" className="hover:text-mjm-orange font-bold transition-all uppercase text-[13px] tracking-tight py-1">Nosotros</a>
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
              <a href="#servicios" className="block text-xl font-black text-mjm-navy" onClick={() => setIsMobileMenuOpen(false)}>Servicios</a>
              <a href="#nosotros" className="block text-xl font-black text-mjm-navy" onClick={() => setIsMobileMenuOpen(false)}>Nosotros</a>
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
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-mjm-navy/60 z-10"></div>
          {/* Industrial Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 z-11 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
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
              <a href="#nosotros" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/20 px-12 py-5 rounded-md font-black uppercase text-[13px] transition-all tracking-widest text-center">
                CONOCER MÁS
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

      {/* PORTFOLIO DE SERVICIOS - INDUSTRIAL GRID */}
      <section id="servicios" className="bg-[#f8f9fa] py-40 border-y border-mjm-navy/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-mjm-orange font-black uppercase tracking-[0.4em] text-xs mb-8 block">Servicios de Ingeniería</span>
          <h2 className="text-6xl md:text-8xl font-black text-mjm-navy mb-24 tracking-tighter">Portafolio <br/>Técnico</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="group relative bg-white border border-mjm-navy/5 p-16 transition-all duration-500 hover:z-10 hover:shadow-2xl hover:bg-mjm-navy cursor-pointer overflow-hidden"
              >
                <div className="relative z-10 transition-all duration-500 group-hover:scale-95">
                  <div className="text-mjm-orange mb-10 transform group-hover:scale-110 transition-transform duration-500 group-hover:text-white">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-black text-mjm-navy mb-8 uppercase tracking-widest group-hover:text-white transition-colors">{service.name}</h3>
                  <div className="w-12 h-1 bg-mjm-orange mb-10 group-hover:w-full transition-all duration-500"></div>
                  <p className="text-mjm-navy/60 group-hover:text-white/80 transition-colors leading-relaxed font-medium">
                    {service.description}
                  </p>
                  <button 
                    onClick={() => setActiveService(service)}
                    className="mt-12 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-mjm-orange group-hover:text-white transition-colors"
                  >
                    Detalles Técnicos <ArrowRight size={14} />
                  </button>
                </div>
                {/* Diagonal Industrial Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-mjm-orange opacity-0 group-hover:opacity-10 transition-opacity -mr-16 -mt-16 rotate-45"></div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* SERVICE MODAL - FOR TECHNICAL DETAILS */}
      {activeService && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-mjm-navy/95 backdrop-blur-md" onClick={() => setActiveService(null)}></div>
          <div className="relative z-10 bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setActiveService(null)}
              className="absolute top-6 right-6 text-mjm-navy hover:text-mjm-orange z-20"
            >
              <X size={40} />
            </button>
            <div className="md:w-1/2 bg-mjm-navy flex items-center justify-center p-20 relative overflow-hidden">
              <div className="relative z-10 text-mjm-orange pointer-events-none transform scale-150 opacity-20">
                {activeService.icon}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-[120px] font-black uppercase opacity-5 rotate-90 leading-none whitespace-nowrap select-none">{activeService.name}</h3>
              </div>
            </div>
            <div className="md:w-1/2 p-16 md:p-24 overflow-y-auto">
              <div className="space-y-12">
                <span className="text-mjm-orange text-xs font-black uppercase tracking-[0.4em]">Especificaciones MJM</span>
                <h2 className="text-5xl md:text-7xl font-black text-mjm-navy uppercase tracking-tighter leading-none">{activeService.name}</h2>
                <div className="w-32 h-3 bg-mjm-orange"></div>
                <p className="text-2xl md:text-3xl font-black text-mjm-navy leading-tight">
                  {activeService.description}
                </p>
                <div className="grid grid-cols-2 gap-6 bg-mjm-navy/5 p-8 border-l-2 border-mjm-navy">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-mjm-orange w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">ISO 9001:2015</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-mjm-orange w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Trazabilidad</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-mjm-orange w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Capacitación</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-mjm-orange w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Soporte Técnico</span>
                  </div>
                </div>
                <button className="w-full bg-mjm-orange text-white py-6 font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl">
                  Solicitar Cotización Inmediata
                </button>
              </div>
            </div>
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

      {/* NOSOTROS - SOLID NAVY AS REQUESTED */}
      <section id="nosotros" className="bg-mjm-navy py-40 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="lg:w-1/2">
              <span className="text-mjm-orange font-black uppercase tracking-[0.3em] text-[11px] mb-8 block">Visión Estratégica</span>
              <h2 className="text-5xl md:text-8xl font-black mb-10 leading-none tracking-tighter">Sobre <br/>Nosotros</h2>
              <div className="w-24 h-3 bg-mjm-orange rounded-full mb-12"></div>
              <p className="text-2xl text-white/80 leading-relaxed font-bold italic">
                Somos líderes estratégicos en aseguramiento metrológico, dedicados a fortalecer la industria nacional mediante el rigor técnico y el cumplimiento de estándares internacionales.
              </p>
            </div>
            
            <div className="lg:w-1/2 grid grid-cols-1 gap-10">
              <div className="bg-white/5 p-12 border-l-4 border-mjm-orange hover:bg-white/10 transition-colors">
                <h3 className="text-3xl font-black mb-6 uppercase tracking-widest text-mjm-orange">Misión</h3>
                <p className="text-xl text-white/70 leading-relaxed font-medium">Contribuir a que las empresas colombianas incrementen su productividad por medio del aseguramiento metrológico corporativo, basándonos en la experiencia, confiabilidad y rigor de nuestro equipo.</p>
              </div>
              <div className="bg-white/5 p-12 border-l-4 border-white hover:bg-white/10 transition-colors">
                <h3 className="text-3xl font-black mb-6 uppercase tracking-widest text-white">Trayectoria</h3>
                <p className="text-xl text-white/70 leading-relaxed font-medium">Contamos con un alto posicionamiento gracias a nuestro personal capacitado y un staff de laboratorios acreditados de primer nivel.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EQUIPO DE TRABAJO - CORPORATE GRID */}
      <section className="bg-white py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <span className="text-mjm-orange font-black uppercase tracking-[0.4em] text-xs mb-6 block">Talento Especializado</span>
            <h2 className="text-6xl md:text-8xl font-black text-mjm-navy tracking-tighter">Nuestro <br className="md:hidden"/>Equipo</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-12">
              <div className="w-full h-80 bg-[#f8f9fa] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                <img src="https://asesoriasintegralesmjm.com/ui/logov2.png" alt="MJM Team 1" className="w-full h-full object-contain p-20 opacity-20" loading="lazy" />
              </div>
              <p className="text-2xl font-black text-mjm-navy leading-tight">Expertos en diversas magnitudes físicas y sistemas de gestión de calidad.</p>
              <p className="text-mjm-navy/60 leading-relaxed font-medium">Nuestra fuerza radica en el Staff de metrólogos calificados y aliados estratégicos en Bogotá y a nivel nacional.</p>
            </div>
            <div className="space-y-12">
              <div className="w-full h-80 bg-mjm-navy overflow-hidden">
                <img src="https://asesoriasintegralesmjm.com/ui/logov3.png" alt="MJM Team 2" className="w-full h-full object-contain p-20 opacity-40 brightness-0 invert" loading="lazy" />
              </div>
              <p className="text-2xl font-black text-mjm-navy leading-tight">Laboratorios acreditados bajo estándares internacionales competentes.</p>
              <p className="text-mjm-navy/60 leading-relaxed font-medium">Trabajamos bajo criterios técnicos estrictos para asegurar que cada medición resista auditorías de alta exigencia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - IMPACTFUL */}
      <section className="bg-mjm-navy py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-mjm-orange/5 mix-blend-overlay"></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-6xl md:text-9xl font-black text-white mb-12 tracking-tighter leading-none">¿LISTO PARA <br/>LA EXCELENCIA?</h2>
          <p className="text-2xl text-mjm-orange font-black uppercase tracking-[0.3em] mb-16">Optimice su Aseguramiento Metrológico Hoy</p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <a href="https://wa.me/573123763432" className="bg-white text-mjm-navy px-16 py-6 rounded-md font-black uppercase text-sm tracking-widest hover:bg-mjm-orange hover:text-white transition-all transform hover:-translate-y-2 shadow-2xl">
              Contactar por WhatsApp
            </a>
            <a href="mailto:info@asesoriasintegralesmjm.com" className="bg-transparent border-2 border-white text-white px-16 py-6 rounded-md font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all">
              Enviar un Correo
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
            {[...clientLogos, ...clientLogos].map((logo, idx) => (
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

      {/* FOOTER - MINIMALIST CORPORATE */}
      <footer className="bg-[#050b14] py-24 text-white/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <img src="https://asesoriasintegralesmjm.com/ui/logov2.png" alt="MJM Logo" className="h-10 mx-auto mb-12 brightness-0 invert opacity-30" loading="lazy" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20 text-[11px] font-black uppercase tracking-[0.3em]">
            <div>
              <p className="text-white mb-4">Ubicación</p>
              <p>Bogotá D.C. - Colombia</p>
            </div>
            <div>
              <p className="text-white mb-4">Contacto</p>
              <p>+57 312 376 3432 <br/> info@asesoriasintegralesmjm.com</p>
            </div>
            <div>
              <p className="text-white mb-4">Horario</p>
              <p>Lun - Vie: 8:00 AM - 5:30 PM</p>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 text-[10px] uppercase tracking-[0.2em]">
            <p>&copy; 2026 Asesorías Integrales MJM S.A.S. - Todos los derechos reservados.</p>
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
                        href="https://wa.me/573123763432"
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
