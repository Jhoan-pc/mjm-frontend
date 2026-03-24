import React, { useState } from 'react';
import { Menu, X, MapPin, MessageCircle, Calendar, Users, Target, Shield, Cog, Cpu, Wrench, Package, ArrowRight } from 'lucide-react';

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeService, setActiveService] = useState(null);

  const services = [
    {
      id: 1,
      name: "Aseguramiento Metrológico",
      icon: <Target className="w-8 h-8" />,
      description: "Gestión integral de procesos de medición para garantizar conformidad y calidad bajo estándares ISO 9001. Nos aseguramos de que sus instrumentos funcionen con la máxima precisión requerida."
    },
    {
      id: 2,
      name: "Nuevo Servicio (Placeholder)",
      icon: <Shield className="w-8 h-8" />,
      description: "Espacio reservado para el nuevo servicio corporativo que complementará nuestra oferta de aseguramiento. Próximamente estructurado."
    },
    {
      id: 3,
      name: "Capacitación",
      icon: <Users className="w-8 h-8" />,
      description: "Programas especializados y adaptados a las necesidades de la empresa, formando a su personal en las mejores prácticas de metrología."
    },
    {
      id: 4,
      name: "Calibración",
      icon: <Cog className="w-8 h-8" />,
      description: "Servicios trazables y acreditados realizados mediante laboratorios aliados. Aseguramos la confiabilidad en las mediciones críticas."
    },
    {
      id: 5,
      name: "Diagnóstico y Mantenimiento",
      icon: <Wrench className="w-8 h-8" />,
      description: "Evaluación técnica y mantenimiento preventivo y correctivo de instrumentos industriales."
    },
    {
      id: 6,
      name: "Suministros",
      icon: <Package className="w-8 h-8" />,
      description: "Provisión de instrumentos de medición de alta calidad, patrones y accesorios especializados de marcas reconocidas."
    }
  ];

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen flex flex-col relative w-full overflow-x-hidden">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-mjm-navy">MJM</span>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#inicio" className="text-gray-600 hover:text-mjm-orange font-medium transition-colors">Inicio</a>
              <a href="#servicios" className="text-gray-600 hover:text-mjm-orange font-medium transition-colors">Servicios</a>
              <a href="#nosotros" className="text-gray-600 hover:text-mjm-orange font-medium transition-colors">Nosotros</a>
              <Link to="/login" className="bg-mjm-orange text-white px-5 py-2.5 rounded-md font-semibold hover:bg-orange-600 transition-all shadow-md">
                Portal de Clientes
              </Link>
            </nav>
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-mjm-orange"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <a href="#inicio" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-mjm-orange hover:bg-gray-50">Inicio</a>
            <a href="#servicios" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-mjm-orange hover:bg-gray-50">Servicios</a>
            <a href="#nosotros" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-mjm-orange hover:bg-gray-50">Nosotros</a>
            <button className="w-full text-left bg-mjm-orange text-white px-3 py-2 rounded-md font-medium mt-2">
              Portal de Clientes
            </button>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="inicio" className="pt-32 pb-20 md:pt-40 md:pb-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left pr-0 lg:pr-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-mjm-navy font-semibold text-sm mb-6 border border-blue-100">
              ✓ Certificación ISO 9001
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-mjm-navy leading-tight tracking-tight mb-6">
              Expertos en <br className="hidden lg:block"/>
              <span className="text-mjm-orange">Aseguramiento Metrológico</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
              Consultoría, capacitación, verificación y calibración de instrumentos con los más altos estándares de calidad y confiabilidad para la industria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#servicios" className="bg-mjm-navy text-white px-8 py-3.5 rounded-md font-semibold hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2">
                Conoce más <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0 w-full relative">
            <div className="bg-gray-200 rounded-2xl w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden shadow-xl border border-gray-100 relative group">
              <span className="text-gray-400 font-medium z-10">[Espacio Imagen Principal Hero]</span>
              <div className="absolute inset-0 bg-mjm-navy/5 group-hover:bg-mjm-navy/10 transition-colors"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SEGUNDA SECCIÓN: NUESTRO ALCANCE & EQUIPO */}
      <section className="bg-gray-50 py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Image Placeholder */}
            <div className="lg:w-1/2 w-full">
              <div className="bg-gray-300 rounded-xl relative w-full h-[350px] shadow-lg flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-700">
                <span className="text-gray-600 font-semibold">[Fotografía Grupal - Equipo de Trabajo]</span>
              </div>
            </div>
            {/* Text Content */}
            <div className="lg:w-1/2 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-mjm-navy mb-4">Nuestro Alcance</h2>
                <div className="w-16 h-1 bg-mjm-orange mb-6"></div>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Ofrecemos soluciones integrales certificadas bajo la norma ISO 9001, garantizando la máxima calidad y precisión en cada proceso industrial. Nuestro compromiso es la confiabilidad de sus herramientas.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Desde la asesoría y evaluación, hasta la capacitación especializada y el suministro de equipos; cubrimos el ciclo completo del aseguramiento de calidad en mediciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS SECTION */}
      <section id="servicios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-mjm-navy">Nuestros Servicios</h2>
            <div className="w-24 h-1 bg-mjm-orange mx-auto mt-4 mb-6"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Soluciones precisas y certificadas operando bajo estrictos estándares industriales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                onClick={() => setActiveService(service)}
                className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="text-mjm-navy group-hover:text-mjm-orange transition-colors mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-mjm-navy transition-colors">{service.name}</h3>
                <p className="text-gray-600 line-clamp-2">
                  {service.description}
                </p>
                <div className="mt-6 flex items-center text-mjm-orange text-sm font-semibold uppercase tracking-wider">
                  Saber más <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL DE SERVICIO */}
      {activeService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setActiveService(null)}></div>
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-mjm-navy p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="text-mjm-orange">{activeService.icon}</span>
                <h3 className="text-xl font-bold">{activeService.name}</h3>
              </div>
              <button onClick={() => setActiveService(null)} className="text-white hover:text-mjm-orange transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {activeService.description}
              </p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setActiveService(null)}
                  className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cerrar
                </button>
                <button className="px-5 py-2 bg-mjm-orange text-white font-medium rounded-md hover:bg-orange-600 transition-colors shadow-md">
                  Solicitar Cotización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOSOTROS SECTION */}
      <section id="nosotros" className="bg-mjm-navy py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Sobre Nosotros</h2>
              <div className="w-20 h-1 bg-mjm-orange mb-8"></div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Somos una empresa dedicada a fortalecer la industria mediante el rigor y la exactitud metrológica. Nuestra trayectoria nos consolida como líderes en confiabilidad, operando siempre bajo un sistema de gestión certificado ISO 9001.
              </p>
              <ul className="space-y-4 pt-4">
                {['Compromiso total con la calidad.', 'Trazabilidad y precisión garantizada.', 'Acompañamiento especializado.'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-200">
                    <span className="text-mjm-orange mr-3"><Target className="w-5 h-5"/></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-semibold text-mjm-orange mb-4">Nuestra Visión 2026</h3>
              <p className="text-gray-300 leading-relaxed mb-8">
                Proyectamos expandir nuestras capacidades tecnológicas, integrando nuestra nueva plataforma SaaS Multi-tenant para la gestión documental y operativa de los instrumentos de nuestros clientes en tiempo real.
              </p>
              <button className="w-full bg-white text-mjm-navy font-bold py-3 rounded-md hover:bg-gray-100 transition-colors shadow-lg">
                Visita el Portal Corporativo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MARCAS ALIADAS */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Nuestras Marcas Aliadas</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {/* Placeholders for logos */}
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 font-medium text-xs">LOGO {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 pt-20 pb-10 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold text-white mb-6 block">MJM</span>
              <p className="text-gray-400 text-sm max-w-sm mb-6">
                Expertos en aseguramiento metrológico con certificación ISO 9001. Soluciones integrales para la industria.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Enlaces Rápidos</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#inicio" className="hover:text-mjm-orange transition-colors">Inicio</a></li>
                <li><a href="#servicios" className="hover:text-mjm-orange transition-colors">Servicios</a></li>
                <li><a href="#nosotros" className="hover:text-mjm-orange transition-colors">Nosotros</a></li>
                <li><a href="#" className="hover:text-mjm-orange transition-colors">Política de Privacidad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Contacto</h4>
              <ul className="space-y-3 text-sm flex flex-col">
                <span className="text-gray-400">Bogotá, Colombia</span>
                <span className="text-gray-400">info@asesoriasintegralesmjm.com</span>
                <span className="text-gray-400">+57 300 000 0000</span>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Asesorías Integrales MJM. Todos los derechos reservados.
            </p>
            {/* BOTÓN NAVEGA A MJM */}
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all"
            >
              <MapPin className="w-4 h-4 text-mjm-orange group-hover:scale-110 transition-transform" />
              Navega hasta MJM
            </a>
          </div>
        </div>
      </footer>

      {/* CHATBOT FLOTANTE */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Opciones Chatbot */}
        {isChatOpen && (
          <div className="absolute bottom-16 right-0 mb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h4 className="font-semibold text-mjm-navy">¡Hola! ¿En qué te ayudamos?</h4>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 hover:text-mjm-navy rounded-xl text-left text-sm font-medium text-gray-700 transition-colors border border-transparent hover:border-blue-100">
                <Calendar className="w-5 h-5 text-mjm-orange" />
                Programar entrega de equipos
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 hover:text-mjm-navy rounded-xl text-left text-sm font-medium text-gray-700 transition-colors border border-transparent hover:border-blue-100">
                <MessageCircle className="w-5 h-5 text-mjm-navy" />
                Comunicarse con asesor comercial
              </button>
            </div>
          </div>
        )}
        
        {/* Botón Flotante */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`${isChatOpen ? 'bg-mjm-navy' : 'bg-mjm-orange'} hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center`}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
};

export default App;
