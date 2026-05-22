import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContentStore } from '../store/contentStore';
import { useEffect } from 'react';
import {
  Mail, Phone, MapPin, ArrowRight,
  CheckCircle, Target, Shield, Wrench, Package, Users
} from 'lucide-react';

// Sub-componentes modulares (cada uno aislado con su propio estado)
import LandingHeader     from '../components/landing/LandingHeader';
import HeroSection       from '../components/landing/HeroSection';
import ServicesPortfolio from '../components/landing/ServicesPortfolio';
import ChatbotWidget     from '../components/landing/ChatbotWidget';

import logoAzul from '../assets/logo_azul_sin_fondo.png';

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

// ─── Sección Alcance ────────────────────────────────────────────────────────
const AlcanceSection = () => (
  <section className="bg-white py-32 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-24 items-center">
        <div className="lg:w-1/2 relative">
          <div className="relative z-10 rounded shadow-[30px_30px_0px_0px_rgba(247,147,27,1)] overflow-hidden">
            <img src="https://asesoriasintegralesmjm.com/services/alcance.jpeg" alt="Metrologo MJM trabajando" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" loading="lazy" />
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-mjm-navy -z-0" />
        </div>
        <div className="lg:w-1/2">
          <span className="text-mjm-orange font-black uppercase tracking-[0.3em] text-xs mb-6 block">Trayectoria y Confianza</span>
          <h2 className="text-5xl md:text-7xl font-black mb-10 leading-none text-mjm-navy">Nuestro <br/>Alcance</h2>
          <div className="w-20 h-2 bg-mjm-orange mb-12" />
          <p className="text-xl text-mjm-navy/70 leading-relaxed font-medium mb-12">
            Con más de 12 años de experiencia, Asesorías Integrales MJM S.A.S. se ha consolidado como el aliado estratégico ideal para empresas que buscan la excelencia en sus sistemas de medición.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { num: '01', color: 'bg-mjm-navy', title: 'Consultoría ISO 9001', desc: 'Asesoramos la implementación de sistemas de calidad metrológica bajo los más altos estándares internacionales.' },
              { num: '02', color: 'bg-mjm-orange', title: 'Criterio Técnico', desc: 'Nuestros expertos brindan soporte especializado para la toma de decisiones críticas en aseguramiento metrológico.' },
            ].map(item => (
              <div key={item.num} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${item.color} text-white flex items-center justify-center rounded-sm font-black text-xl`}>{item.num}</div>
                  <span className="font-black uppercase text-[11px] tracking-widest text-mjm-navy">{item.title}</span>
                </div>
                <p className="text-sm text-mjm-navy/60 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Sección Nosotros ───────────────────────────────────────────────────────
const NosotrosSection = () => (
  <section id="nosotros" className="bg-mjm-navy py-40 relative overflow-hidden text-white border-b border-white/5">
    <div className="absolute inset-0 z-0 opacity-20">
      <img src="/nosotros/cimga.jpg" alt="Background Texture" className="w-full h-full object-cover blur-sm" />
    </div>
    <div className="absolute inset-0 bg-mjm-navy/80 z-0" />
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-24 items-center">
        <div className="lg:w-1/2 space-y-12">
          <div className="space-y-6">
            <span className="text-mjm-orange font-black uppercase tracking-[0.4em] text-[11px] block">Trayectoria y Liderazgo</span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] uppercase italic">Sobre <br/>Nosotros</h2>
            <div className="w-24 h-3 bg-mjm-orange rounded-full" />
          </div>
          <div className="relative rounded-2xl overflow-hidden border-4 border-white/10 group shadow-2xl">
            <img src="/nosotros/cimga.jpg" alt="Participación CIMGA" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-mjm-navy to-transparent opacity-60" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-sm font-black uppercase tracking-widest text-mjm-orange mb-2">Compromiso Industrial</p>
              <p className="text-xl font-bold leading-tight">Participación destacada en eventos técnicos de metrología como CIMGA.</p>
            </div>
          </div>
          <p className="text-2xl text-white/80 leading-relaxed font-bold italic border-l-8 border-mjm-orange pl-8 py-4 bg-white/5 uppercase tracking-tighter">
            "Media década de experiencia en aseguramiento metrológico, comprometidos con la excelencia y la mejora continua."
          </p>
        </div>
        <div className="lg:w-1/2 grid grid-cols-1 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { label: 'Misión', color: 'text-mjm-orange', text: 'Ser un aliado estratégico para la estructuración y fortalecimiento de la gestión metrológica de nuestros clientes basándonos en la experiencia técnico-científica.' },
              { label: 'Visión', color: 'text-white',      text: 'Liderar el mercado nacional a través de la prestación de servicios integrales, confiables y oportunos.' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 p-8 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <h3 className={`text-xl font-black mb-4 uppercase tracking-widest ${item.color} underline decoration-2 underline-offset-8`}>{item.label}</h3>
                <p className="text-sm text-white/70 leading-relaxed font-medium">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/5 p-10 border border-mjm-orange/30 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-black mb-8 uppercase tracking-widest text-white flex items-center gap-4">
              <span className="w-8 h-1 bg-mjm-orange block" /> Pilares Operacionales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
              {[
                { title: 'Innovación Continua',   desc: 'Implementamos desarrollos que optimizan procesos de medición.' },
                { title: 'Excelencia Operacional', desc: 'Altos estándares de calidad certificados por ISO 9001:2015.' },
                { title: 'Desarrollo del Talento', desc: 'Fortalecemos continuamente las competencias técnicas de nuestro equipo.' },
                { title: 'Crecimiento Sostenible', desc: 'Expansión estratégica y presencia sólida en el mercado colombiano.' },
              ].map(p => (
                <div key={p.title} className="space-y-3">
                  <p className="font-black text-xs uppercase tracking-[0.2em] text-mjm-orange">{p.title}</p>
                  <p className="text-sm text-white/50 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            {['Integridad', 'Confianza', 'Pasión'].map(val => (
              <span key={val} className="px-6 py-2 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-mjm-orange">{val}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Sección Equipo ─────────────────────────────────────────────────────────
const EquipoSection = () => (
  <section className="bg-white py-40 border-t border-mjm-navy/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-24">
        <span className="text-mjm-orange font-black uppercase tracking-[0.4em] text-xs mb-6 block">Talento Especializado</span>
        <h2 className="text-6xl md:text-8xl font-black text-mjm-navy tracking-tighter uppercase leading-none">Nuestro <br className="md:hidden"/>Equipo</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {[
          { img: '/team/team_1.jpg', alt: 'MJM Technical Team 1', title: 'Expertos en diversas magnitudes físicas y calidad.', desc: 'Nuestra fuerza radica en el Staff de metrólogos calificados y aliados estratégicos en Bogotá y a nivel nacional.' },
          { img: '/team/team_2.jpg', alt: 'MJM Technical Team 2', title: 'Laboratorios acreditados bajo estándares internacionales.', desc: 'Trabajamos bajo criterios técnicos estrictos para asegurar que cada medición resista auditorías de alta exigencia.' },
        ].map(item => (
          <div key={item.alt} className="space-y-12">
            <div className="w-full h-80 bg-mjm-navy/5 rounded-2xl border border-mjm-navy/10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              <img src={item.img} alt={item.alt} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="text-3xl font-black text-mjm-navy leading-tight tracking-tight uppercase">{item.title}</p>
            <p className="text-xl text-mjm-navy/60 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── CTA Final ──────────────────────────────────────────────────────────────
const CTASection = () => (
  <section className="bg-mjm-orange py-40 relative overflow-hidden text-center">
    <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
    <div className="max-w-5xl mx-auto px-4 relative z-10">
      <h2 className="text-6xl md:text-9xl font-black text-mjm-navy mb-12 tracking-tighter uppercase leading-none italic">¿LISTO PARA <br/>LA EXCELENCIA?</h2>
      <p className="text-2xl text-white font-black uppercase tracking-[0.3em] mb-16">Optimice su Aseguramiento Metrológico Hoy</p>
      <a
        href="https://wa.me/573137960800" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-4 bg-mjm-navy text-white px-20 py-8 rounded-md font-black uppercase text-sm tracking-widest hover:bg-white hover:text-mjm-navy shadow-[0_20px_40px_-10px_rgba(10,15,26,0.4)] hover:-translate-y-2 transition-all group"
      >
        Contactar por WhatsApp <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
      </a>
    </div>
  </section>
);

// ─── Logos Aliados ───────────────────────────────────────────────────────────
const BrandsCarousel = () => (
  <section className="bg-white py-20 border-y border-mjm-navy/5 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
      <span className="text-mjm-navy/30 font-black uppercase tracking-[0.5em] text-[10px]">Alianzas y Respaldo Técnico</span>
    </div>
    <div className="relative flex overflow-hidden">
      <motion.div
        className="flex gap-24 items-center shrink-0"
        style={{ minWidth: '200%' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 39, repeat: Infinity, ease: 'linear' }}
      >
        {[...brandLogos, ...brandLogos].map((logo, idx) => (
          <img key={idx} src={logo} alt="Client Brand" className="h-14 md:h-16 w-auto object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500" loading="lazy" />
        ))}
      </motion.div>
    </div>
  </section>
);

// ─── Footer ──────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-[#0a0f1a] pt-28 pb-12 text-white/50 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
        <div className="space-y-8">
          <div className="flex flex-col">
            <span className="text-white font-black text-2xl tracking-tighter uppercase leading-none">Asesorías Integrales</span>
            <span className="text-mjm-orange font-black text-2xl tracking-tighter uppercase leading-none">MJM</span>
          </div>
          <p className="text-sm leading-relaxed font-medium max-w-xs">
            Expertos en aseguramiento metrológico y consultoría técnica con certificación ISO 9001.
          </p>
        </div>
        <div>
          <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">Servicios</h4>
          <ul className="space-y-4 text-sm font-medium">
            {['Aseguramiento Metrológico', 'Capacitación Técnica', 'Calibración de Instrumentos', 'Diagnóstico y Mantenimiento', 'Suministros Técnicos'].map(s => (
              <li key={s}><a href="#servicios" className="hover:text-mjm-orange transition-colors">{s}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">Enlaces Rápidos</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="#inicio"    className="hover:text-mjm-orange transition-colors">Inicio</a></li>
            <li><a href="#nosotros"  className="hover:text-mjm-orange transition-colors">Nosotros</a></li>
            <li><a href="#servicios" className="hover:text-mjm-orange transition-colors">Servicios</a></li>
            <li><Link to="/login"    className="hover:text-mjm-orange transition-colors">Portal de Clientes</Link></li>
          </ul>
        </div>
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
              <a href="https://www.google.com/maps/search/?api=1&query=Cl+2+%2371d-84,+Bogotá,+Colombia" target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-mjm-orange font-black uppercase tracking-widest hover:underline mt-1 flex items-center gap-1">
                Ver en Google Maps <ArrowRight size={10} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold">
        <p>© 2026 Asesorías Integrales MJM S.A.S. - Todos los derechos reservados.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          <a href="#" className="hover:text-white transition-colors">Términos</a>
        </div>
      </div>
    </div>
  </footer>
);

// ════════════════════════════════════════════════════════════════════════════
// LANDING PAGE — Ensamblador limpio (~60 líneas en lugar de 1061)
// Cada sección es un componente aislado con su propio estado y re-renders
// ════════════════════════════════════════════════════════════════════════════
const Landing = () => {
  const { landing } = useContentStore();

  useEffect(() => {
    const unsubscribe = useContentStore.getState().subscribeToLanding();
    return () => unsubscribe();
  }, []);

  return (
    <div className="font-sans text-mjm-navy bg-white min-h-screen flex flex-col relative w-full overflow-x-hidden selection:bg-mjm-orange selection:text-white">

      {/* Navegación — estado de scroll aislado dentro del componente */}
      <LandingHeader />

      {/* Hero — estado del modal ISO aislado */}
      <HeroSection
        title={landing?.hero?.title || 'Expertos en Aseguramiento Metrológico'}
        subtitle={landing?.hero?.subtitle || 'Consultoría, capacitación, verificación y calibración de instrumentos con los más altos estándares de calidad y confiabilidad'}
      />

      {/* Contenido estático — sin estado, render único */}
      <AlcanceSection />

      {/* Portafolio — estado de servicio activo y modal aislados */}
      <ServicesPortfolio />

      {/* Secciones estáticas */}
      <NosotrosSection />
      <EquipoSection />
      <CTASection />
      <BrandsCarousel />
      <Footer />

      {/* Chatbot — todo su estado completamente aislado */}
      <ChatbotWidget />

    </div>
  );
};

export default Landing;
