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
  <section className="bg-slate-50/20 py-16 lg:py-20 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">
        <div className="lg:w-1/2 relative">
          <div className="relative z-10 rounded-2xl shadow-xl border border-slate-100 p-1.5 bg-white overflow-hidden group">
            <img src="https://asesoriasintegralesmjm.com/services/alcance.jpeg" alt="Metrologo MJM trabajando" className="w-full h-auto rounded-xl grayscale hover:grayscale-0 transition-all duration-700" loading="lazy" />
          </div>
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-mjm-navy/10 rounded-3xl -z-0" />
        </div>
        <div className="lg:w-1/2">
          <span className="text-mjm-orange font-bold uppercase tracking-[0.25em] text-xs mb-4 block">Trayectoria y Confianza</span>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-mjm-navy">Nuestro <span className="font-light">Alcance</span></h2>
          <div className="w-12 h-1 bg-mjm-orange mb-8 rounded-full" />
          <p className="text-base text-mjm-navy/70 leading-relaxed font-light mb-8">
            Con más de 12 años de experiencia, Asesorías Integrales MJM S.A.S. se ha consolidado como el aliado estratégico ideal para empresas que buscan la excelencia en sus sistemas de medición.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { num: '01', color: 'bg-mjm-navy/10 text-mjm-navy border-mjm-navy/20', title: 'Consultoría ISO 9001', desc: 'Asesoramos la implementación de sistemas de calidad metrológica bajo los más altos estándares internacionales.' },
              { num: '02', color: 'bg-mjm-orange/10 text-mjm-orange border-mjm-orange/20', title: 'Criterio Técnico', desc: 'Nuestros expertos brindan soporte especializado para la toma de decisiones críticas en aseguramiento metrológico.' },
            ].map(item => (
              <div key={item.num} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${item.color} flex items-center justify-center rounded-xl font-bold text-sm border font-data`}>{item.num}</div>
                  <span className="font-bold uppercase text-xs tracking-wider text-mjm-navy">{item.title}</span>
                </div>
                <p className="text-xs text-mjm-navy/60 font-light leading-relaxed">{item.desc}</p>
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
  <section id="nosotros" className="bg-mjm-navy py-20 lg:py-24 relative overflow-hidden text-white border-b border-white/5">
    <div className="absolute inset-0 z-0 opacity-10">
      <img src="/nosotros/cimga.jpg" alt="Background Texture" className="w-full h-full object-cover blur-sm" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-mjm-navy via-mjm-navy/95 to-slate-900/90 z-0" />
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">
        <div className="lg:w-1/2 space-y-8">
          <div className="space-y-4">
            <span className="text-mjm-orange font-bold uppercase tracking-[0.25em] text-xs block">Trayectoria y Liderazgo</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight uppercase">Sobre <br/><span className="font-light text-white/70">Nosotros</span></h2>
            <div className="w-12 h-1 bg-mjm-orange rounded-full" />
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 group shadow-xl">
            <img src="/nosotros/cimga.jpg" alt="Participación CIMGA" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-mjm-navy/95 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-mjm-orange mb-1">Compromiso Industrial</p>
              <p className="text-base font-bold leading-tight">Participación destacada en eventos técnicos de metrología como CIMGA.</p>
            </div>
          </div>
          <p className="text-lg text-white/90 leading-relaxed font-light border-l-4 border-mjm-orange pl-6 py-2 bg-white/5 rounded-r-xl">
            "Media década de experiencia en aseguramiento metrológico, comprometidos con la excelencia y la mejora continua."
          </p>
        </div>
        <div className="lg:w-1/2 grid grid-cols-1 gap-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Misión', color: 'text-mjm-orange', text: 'Ser un aliado estratégico para la estructuración y fortalecimiento de la gestión metrológica de nuestros clientes basándonos en la experiencia técnico-científica.' },
              { label: 'Visión', color: 'text-white',      text: 'Liderar el mercado nacional a través de la prestación de servicios integrales, confiables y oportunos.' },
            ].map(item => (
              <div key={item.label} className="glass-premium-dark p-6 rounded-2xl hover:bg-white/[0.08] transition-premium">
                <h3 className={`text-base font-bold mb-3 uppercase tracking-wider ${item.color} border-b border-white/10 pb-2`}>{item.label}</h3>
                <p className="text-xs text-white/70 leading-relaxed font-light">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="glass-premium-dark p-6 md:p-8 rounded-2xl shadow-xl border border-white/10">
            <h3 className="text-base font-bold mb-5 uppercase tracking-wider text-white flex items-center gap-3">
              <span className="w-6 h-[2px] bg-mjm-orange block" /> Pilares Operacionales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { title: 'Innovación Continua',   desc: 'Implementamos desarrollos que optimizan procesos de medición.' },
                { title: 'Excelencia Operacional', desc: 'Altos estándares de calidad certificados por ISO 9001:2015.' },
                { title: 'Desarrollo del Talento', desc: 'Fortalecemos continuamente las competencias técnicas de nuestro equipo.' },
                { title: 'Crecimiento Sostenible', desc: 'Expansión estratégica y presencia sólida en el mercado colombiano.' },
              ].map(p => (
                <div key={p.title} className="space-y-1">
                  <p className="font-bold text-xs uppercase tracking-wider text-mjm-orange">{p.title}</p>
                  <p className="text-xs text-white/50 leading-relaxed font-light">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2.5 pt-2 flex-wrap">
            {['Integridad', 'Confianza', 'Pasión'].map(val => (
              <span key={val} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-mjm-orange">{val}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Sección Equipo ─────────────────────────────────────────────────────────
const EquipoSection = () => (
  <section className="bg-slate-50/20 py-20 lg:py-24 border-t border-mjm-navy/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="text-mjm-orange font-bold uppercase tracking-[0.25em] text-xs mb-3 block">Talento Especializado</span>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-mjm-navy tracking-tight uppercase leading-none">Nuestro <span className="font-light">Equipo</span></h2>
        <div className="w-12 h-1 bg-mjm-orange/85 mx-auto mt-4 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
        {[
          { img: '/team/team_1.jpg', alt: 'MJM Technical Team 1', title: 'Expertos en diversas magnitudes físicas y calidad.', desc: 'Nuestra fuerza radica en el Staff de metrólogos calificados y aliados estratégicos en Bogotá y a nivel nacional.' },
          { img: '/team/team_2.jpg', alt: 'MJM Technical Team 2', title: 'Laboratorios acreditados bajo estándares internacionales.', desc: 'Trabajamos bajo criterios técnicos estrictos para asegurar que cada medición resista auditorías de alta exigencia.' },
        ].map(item => (
          <div key={item.alt} className="space-y-5 group">
            <div className="w-full h-80 bg-mjm-navy/5 rounded-2xl border border-mjm-navy/10 overflow-hidden grayscale hover:grayscale-0 transition-premium relative shadow-md">
              <img src={item.img} alt={item.alt} className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105" loading="lazy" />
            </div>
            <h4 className="text-lg md:text-xl font-bold text-mjm-navy leading-tight tracking-tight uppercase group-hover:text-mjm-orange transition-premium">{item.title}</h4>
            <p className="text-xs text-mjm-navy/60 leading-relaxed font-light">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── CTA Final ──────────────────────────────────────────────────────────────
const CTASection = () => (
  <section className="bg-mjm-orange py-20 lg:py-24 relative overflow-hidden text-center text-white">
    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent mix-blend-overlay pointer-events-none" />
    <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(255,255,255,0.15)_0%,_transparent_70%)] rounded-full blur-[60px] pointer-events-none"></div>
    <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-8">
      <h2 className="text-4xl md:text-6xl font-extrabold text-mjm-navy tracking-tight uppercase leading-none italic">¿LISTO PARA <br/>LA EXCELENCIA?</h2>
      <p className="text-base md:text-lg text-white font-bold uppercase tracking-[0.2em]">Optimice su Aseguramiento Metrológico Hoy</p>
      <div>
        <a
          href="https://wa.me/573137960800" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-mjm-navy hover:bg-mjm-navy/90 text-white px-8 py-4 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-premium shadow-[0_12px_24px_rgba(35,76,116,0.3)] hover:-translate-y-0.5 active:scale-95 group"
        >
          Contactar por WhatsApp <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </a>
      </div>
    </div>
  </section>
);

// ─── Logos Aliados ───────────────────────────────────────────────────────────
const BrandsCarousel = () => (
  <section className="bg-white py-12 lg:py-16 border-y border-mjm-navy/5 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
      <span className="text-mjm-navy/35 font-bold uppercase tracking-[0.4em] text-[10px]">Alianzas y Respaldo Técnico</span>
    </div>
    <div className="relative flex overflow-hidden w-full">
      <motion.div
        className="flex gap-20 items-center shrink-0"
        style={{ minWidth: '200%' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {[...brandLogos, ...brandLogos].map((logo, idx) => (
          <div key={idx} className="h-10 w-24 flex items-center justify-center shrink-0">
            <img src={logo} alt="Client Brand" className="max-h-full max-w-full object-contain grayscale opacity-45 hover:grayscale-0 hover:opacity-100 transition-premium" loading="lazy" />
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ─── Footer ──────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-[#0b1326] pt-16 lg:pt-20 pb-10 text-white/50 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
        <div className="space-y-5">
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-tight uppercase leading-none">Asesorías Integrales</span>
            <span className="text-mjm-orange font-extrabold text-lg tracking-tight uppercase leading-none">MJM</span>
          </div>
          <p className="text-xs leading-relaxed font-light max-w-xs text-white/60">
            Expertos en aseguramiento metrológico y consultoría técnica con certificación ISO 9001.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-5 border-b border-white/10 pb-2">Servicios</h4>
          <ul className="space-y-2.5 text-xs font-light">
            {['Aseguramiento Metrológico', 'Capacitación Técnica', 'Calibración de Instrumentos', 'Diagnóstico y Mantenimiento', 'Suministros Técnicos'].map(s => (
              <li key={s}><a href="#servicios" className="hover:text-mjm-orange transition-premium">{s}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-5 border-b border-white/10 pb-2">Enlaces Rápidos</h4>
          <ul className="space-y-2.5 text-xs font-light">
            <li><a href="#inicio"    className="hover:text-mjm-orange transition-premium">Inicio</a></li>
            <li><a href="#nosotros"  className="hover:text-mjm-orange transition-premium">Nosotros</a></li>
            <li><a href="#servicios" className="hover:text-mjm-orange transition-premium">Servicios</a></li>
            <li><Link to="/login"    className="hover:text-mjm-orange transition-premium">Portal de Clientes</Link></li>
          </ul>
        </div>
        <div className="space-y-3.5">
          <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-5 border-b border-white/10 pb-2">Contacto</h4>
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-mjm-orange shrink-0 mt-0.5" />
            <span className="text-xs font-light text-white/70">comercial.asesoriasmjm@gmail.com</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-mjm-orange shrink-0" />
            <span className="text-xs font-light text-white/70">+57 313 7960800</span>
          </div>
          <div className="flex items-start gap-2.5 group">
            <MapPin className="w-4 h-4 text-mjm-orange shrink-0 mt-0.5 group-hover:scale-105 transition-premium" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-light text-white/70">Cl 2 #71d-84</span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Bogotá, Colombia</span>
              <a href="https://www.google.com/maps/search/?api=1&query=Cl+2+%2371d-84,+Bogotá,+Colombia" target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-mjm-orange font-bold uppercase tracking-widest hover:underline mt-1 flex items-center gap-1">
                Ver en Google Maps <ArrowRight size={10} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-wider text-white/40 font-medium">
        <p>© 2026 Asesorías Integrales MJM S.A.S. - Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-premium">Privacidad</a>
          <a href="#" className="hover:text-white transition-premium">Términos</a>
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
