import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContentStore } from '../store/contentStore';
import { useEffect } from 'react';
import {
  Mail, Phone, MapPin, ArrowRight,
  CheckCircle, Target, Shield, ShieldCheck, Wrench, Package, Users, Globe,
  ChevronRight, ExternalLink
} from 'lucide-react';

// Sub-componentes modulares (cada uno aislado con su propio estado)
import LandingHeader     from '../components/landing/LandingHeader';
import HeroSection       from '../components/landing/HeroSection';
import ServicesPortfolio from '../components/landing/ServicesPortfolio';
import ChatbotWidget     from '../components/landing/ChatbotWidget';

import logoAzul from '../assets/logo_azul_sin_fondo.png';

// ─── Helpers Dinámicos de Fecha & Trayectoria (Actualización Automática cada Diciembre) ──
const getExperienceYears = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Enero, 11 = Diciembre
  // En diciembre de cada año se anticipa y computa el siguiente ciclo anual
  const effectiveYear = month === 11 ? year + 1 : year;
  return Math.max(12, effectiveYear - 2014);
};

const getCurrentYear = () => new Date().getFullYear();

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

// ─── TrustBar Metrológica (Tesla-Style Glass Stats Ribbon Estilo Ingyemel) ──
const TrustBar = () => (
  <div className="relative z-30 bg-black/70 border-y border-white/10 backdrop-blur-md py-4 sm:py-6 text-white shadow-xl">
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
      <div className="py-2 space-y-1">
        <span className="text-xl sm:text-2xl font-space font-extrabold text-mjm-orange">ISO 9001:2015</span>
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400 leading-snug max-w-[280px] mx-auto">CERTIFICADO ICONTEC • CO-SC-CER1090494</p>
      </div>
      <div className="py-2 space-y-1">
        <span className="text-xl sm:text-2xl font-space font-extrabold text-mjm-orange">NTC-ISO/IEC 17025</span>
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400 leading-snug max-w-[280px] mx-auto">TRAZABILIDAD METROLÓGICA • ONAC / NIST</p>
      </div>
      <div className="py-2 space-y-1">
        <span className="text-xl sm:text-2xl font-space font-extrabold text-mjm-orange">Nivel Nacional</span>
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400 leading-snug max-w-[280px] mx-auto">ATENCIÓN EN PLANTA EN TODA COLOMBIA</p>
      </div>
      <div className="py-2 space-y-1">
        <span className="text-xl sm:text-2xl font-space font-extrabold text-emerald-400">Software Incluido</span>
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400 leading-snug max-w-[280px] mx-auto">PLATAFORMA & HOJAS DE VIDA QR SIN COSTO MENSUAL</p>
      </div>
    </div>
  </div>
);

// ─── Sección Alcance (Clinical Light & Technical Excellence) ────────────────
const AlcanceSection = () => (
  <section id="alcance" className="bg-[#F8F9FB] py-20 lg:py-28 relative overflow-hidden border-b border-mjm-navy/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-center">
        
        {/* Fotografía Real con Marco Técnico de Laboratorio */}
        <div className="lg:w-1/2 relative group">
          <div className="relative z-10 rounded-2xl shadow-2xl border border-mjm-navy/10 p-2 bg-white overflow-hidden">
            <img
              src="/ui/principal2.jpeg"
              alt="Metrólogo de MJM realizando aseguramiento en laboratorio"
              className="w-full h-auto rounded-xl object-cover grayscale-0 group-hover:scale-[1.02] transition-transform duration-700"
              loading="lazy"
              decoding="async"
            />
            {/* Tag de Rigor Metrológico */}
            <div className="absolute top-4 left-4 z-20 bg-mjm-navy/90 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-mjm-orange animate-pulse"></span>
              <span>Laboratorio & Aseguramiento en Campo</span>
            </div>
          </div>
          <div className="absolute -bottom-5 -right-5 w-48 h-48 bg-mjm-orange/10 rounded-3xl -z-0 blur-xl" />
        </div>

        {/* Storytelling de Dolor y Blindaje de Auditorías */}
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mjm-orange/10 border border-mjm-orange/20 text-mjm-orange font-mono text-xs uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Blindaje Normativo & Cero No-Conformidades</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-space font-extrabold text-mjm-navy uppercase tracking-tight leading-tight">
            Nuestro Alcance: <br />
            <span className="text-mjm-orange font-light">Más Allá del Papel</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-light font-inter">
            Un certificado de calibración archivado en una carpeta física no protege a su empresa si no hay trazabilidad en planta. Cuando un instrumento se desvía en plena producción, el costo de lotes defectuosos y las no-conformidades ante auditores de <strong className="font-semibold text-mjm-navy">ICONTEC, INVIMA o ISO 9001</strong> es devastador.
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
            Rompemos el esquema de los talleres tradicionales que solo entregan hojas impresas. En MJM enviamos al metrólogo a su planta para calibrar en sitio e <strong className="text-mjm-navy font-semibold">integramos el software de gobernanza digital</strong> para que cualquier auditor o jefe de calidad escanee el QR del equipo y verifique su vigencia en 3 segundos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {[
              { num: '01', title: 'Criterio Técnico & GUM', desc: 'Determinación matemática de conformidad confrontando la incertidumbre expandida contra la tolerancia del proceso para prevenir paradas.' },
              { num: '02', title: 'Gobernanza & QR en Sitio', desc: 'Hojas de vida inalterables y certificados oficiales en la nube, listos para auditoría sin buscar carpetas extraviadas.' },
            ].map(item => (
              <div key={item.num} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-space font-extrabold text-mjm-orange text-lg">{item.num}.</span>
                  <span className="font-space font-bold uppercase text-xs tracking-wider text-mjm-navy">{item.title}</span>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </section>
);

// ─── Cinta de Métricas Industriales & Prueba Social Cuantitativa ────────
const MetricsProofBar = () => (
  <section className="bg-[#050b14] border-y border-white/10 py-10 px-6 relative z-20">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div className="space-y-1">
        <span className="block font-space font-black text-3xl sm:text-4xl text-[#f7931b]">+4,800</span>
        <span className="block font-mono text-[10px] sm:text-xs uppercase tracking-widest text-zinc-300 font-bold">
          Instrumentos Calibrados
        </span>
        <span className="block text-[11px] text-zinc-500 font-light">En planta y laboratorio</span>
      </div>
      <div className="space-y-1">
        <span className="block font-space font-black text-3xl sm:text-4xl text-emerald-400">0</span>
        <span className="block font-mono text-[10px] sm:text-xs uppercase tracking-widest text-zinc-300 font-bold">
          No-Conformidades
        </span>
        <span className="block text-[11px] text-zinc-500 font-light">En auditorías ICONTEC / INVIMA</span>
      </div>
      <div className="space-y-1">
        <span className="block font-space font-black text-3xl sm:text-4xl text-[#f7931b]">100%</span>
        <span className="block font-mono text-[10px] sm:text-xs uppercase tracking-widest text-zinc-300 font-bold">
          Trazabilidad ONAC / INM
        </span>
        <span className="block text-[11px] text-zinc-500 font-light">Cadena ininterrumpida</span>
      </div>
      <div className="space-y-1">
        <span className="block font-space font-black text-3xl sm:text-4xl text-white">12</span>
        <span className="block font-mono text-[10px] sm:text-xs uppercase tracking-widest text-zinc-300 font-bold">
          Departamentos Cubiertos
        </span>
        <span className="block text-[11px] text-zinc-500 font-light">Servicio en sitio a nivel nacional</span>
      </div>
    </div>
  </section>
);

// ─── Sección Nosotros: Infraestructura & Autoridad Técnica (Clinical Light Luxury) ──────
const NosotrosSection = () => (
  <section id="nosotros" className="py-24 lg:py-32 bg-white relative z-20 shadow-xl border-t border-slate-200 text-mjm-navy">
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      
      {/* Columna Izquierda (5 Cols): Marco Visual Limpio con Resplandor & Placa Flotante */}
      <div className="lg:col-span-5 relative group">
        {/* Resplandor Cálido Suave */}
        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-[#f7931b]/15 via-orange-400/10 to-[#f7931b]/15 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 relative bg-slate-50 p-2">
          <img
            src="/nosotros/cimga.jpg"
            alt="Autoridad Técnica MJM en Congreso CIMGA"
            className="w-full h-full object-cover rounded-2xl contrast-[1.04] brightness-[0.98] group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            decoding="async"
          />

          {/* Badge de Rigor Superior */}
          <div className="absolute top-5 left-5 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mjm-navy/90 border border-white/20 backdrop-blur-md text-[10px] font-mono text-white shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#f7931b] animate-pulse shrink-0"></span>
            <span>PARTICIPACIÓN CIENTÍFICA • CIMGA</span>
          </div>
        </div>

        {/* Placa Flotante Inferior Derecha (Años de Experiencia Dinámicos) */}
        <div className="absolute -bottom-6 -right-6 p-5 bg-white/95 border border-slate-200 text-mjm-navy rounded-2xl shadow-2xl backdrop-blur-xl hidden sm:block z-20 space-y-1">
          <span className="block text-2xl font-space font-extrabold text-[#f7931b]">+{getExperienceYears()} Años</span>
          <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-600 font-bold">Trayectoria Metrológica</span>
        </div>
      </div>

      {/* Columna Derecha (7 Cols): Narrativa Editorial & 2 Tarjetas Blancas de Titanio */}
      <div className="lg:col-span-7 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#f7931b]/10 border border-[#f7931b]/30 rounded-full text-[#f7931b] font-mono uppercase tracking-wider text-[10px] sm:text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#f7931b]" />
          <span>AUTORIDAD TÉCNICO-CIENTÍFICA & RIGOR NORMATIVO</span>
        </div>

        <h2 className="font-space font-extrabold text-3xl sm:text-5xl text-mjm-navy uppercase tracking-tight leading-tight">
          Ingeniería Metrológica <br />
          <span className="text-[#f7931b] font-light">con Criterio Aplicado</span>
        </h2>

        <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed font-light font-inter">
          <p>
            En <strong className="text-mjm-navy font-semibold">Asesorías Integrales MJM</strong> entendemos que una desviación no detectada en un instrumento paraliza una auditoría y arriesga la conformidad de lotes enteros de producción. Con más de {getExperienceYears()} años de trayectoria y actualización continua en congresos técnico-científicos (<strong className="text-[#f7931b] font-medium">CIMGA</strong>), aportamos exactitud matemática y criterio de ingeniería a sus procesos.
          </p>
          <p className="text-slate-600 text-xs sm:text-sm font-normal">
            Unificamos la rigurosidad de laboratorio bajo norma NTC-ISO/IEC 17025, aseguramiento en planta ISO 10012 y gobernanza en la nube con licencias ilimitadas para proteger a su empresa ante cualquier organismo de control sin sobrecostos de software.
          </p>
        </div>

        {/* 2 Tarjetas Blancas de Titanio de Alto Nivel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-[#f7931b] hover:shadow-xl transition-all space-y-2 group/card shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f7931b]/10 border border-[#f7931b]/30 flex items-center justify-center text-[#f7931b] group-hover/card:bg-[#f7931b] group-hover/card:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold font-space uppercase tracking-wider text-mjm-navy">Despliegue a Nivel Nacional</h4>
            </div>
            <p className="text-xs text-slate-600 font-normal leading-relaxed font-inter">
              Atención presencial en plantas de toda Colombia para no detener líneas continuas durante rutinas de verificación.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-[#f7931b] hover:shadow-xl transition-all space-y-2 group/card shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f7931b]/10 border border-[#f7931b]/30 flex items-center justify-center text-[#f7931b] group-hover/card:bg-[#f7931b] group-hover/card:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold font-space uppercase tracking-wider text-mjm-navy">Blindaje en Auditorías</h4>
            </div>
            <p className="text-xs text-slate-600 font-normal leading-relaxed font-inter">
              Custodia digital inalterable de hojas de vida y certificados con cálculo GUM para auditorías ICONTEC e INVIMA.
            </p>
          </div>
        </div>

        {/* Cita Editorial en Barra Limpia */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center gap-4 text-xs sm:text-sm font-inter text-slate-700 font-light">
          <div className="w-1.5 h-10 bg-[#f7931b] rounded-full shrink-0" />
          <p className="italic">
            "Más de {getExperienceYears()} años brindando aseguramiento metrológico para industrias donde el margen de error no es una opción."
          </p>
        </div>

      </div>
    </div>
  </section>
);

// ─── Sección Equipo (Clinical Light Talent & Lab) ───────────────────────────
const EquipoSection = () => (
  <section className="bg-[#F8F9FB] py-20 lg:py-24 border-t border-slate-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-2">
        <span className="text-mjm-orange font-mono uppercase tracking-[0.25em] text-xs font-bold block">Talento & Laboratorio</span>
        <h2 className="text-3xl sm:text-5xl font-space font-extrabold text-mjm-navy tracking-tight uppercase leading-none">
          Equipo <span className="font-light text-slate-500">Especializado</span>
        </h2>
        <div className="w-12 h-1 bg-mjm-orange mx-auto mt-4 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
        {[
          { img: '/team/team_1.jpg', alt: 'Equipo Técnico MJM en campo', title: 'Especialistas en múltiples magnitudes físicas.', desc: 'Metrólogos calificados para atender requerimientos de longitud, temperatura, presión, vibración y frecuencia en planta.' },
          { img: '/team/team_2.jpg', alt: 'Laboratorio de calibración y verificación MJM', title: 'Laboratorios y alianzas de alta exigencia técnica.', desc: 'Cumplimiento estricto de criterios de calibración para garantizar que cada entrega resista auditorías de alta exigencia.' },
        ].map(item => (
          <div key={item.alt} className="space-y-5 group">
            <div className="w-full h-80 bg-slate-900 rounded-2xl border border-slate-200 overflow-hidden relative shadow-md">
              <img
                src={item.img}
                alt={item.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>
            <h4 className="text-lg md:text-xl font-space font-bold text-mjm-navy leading-tight tracking-tight uppercase group-hover:text-mjm-orange transition-premium">
              {item.title}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-light font-inter">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── CTA Final de Alta Gama (Obsidian Command Center) ────────────────────────
const CTASection = () => (
  <section className="bg-[#090f1d] py-20 lg:py-28 relative overflow-hidden text-center text-white border-t border-b border-white/10">
    <div className="absolute inset-0 bg-radial-gradient from-mjm-orange/10 via-transparent to-transparent pointer-events-none" />
    <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-mjm-orange/10 border border-mjm-orange/30 rounded-full text-mjm-orange font-mono text-[10px] font-bold uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-mjm-orange animate-pulse" />
        <span>Atención Inmediata a Nivel Nacional</span>
      </div>
      <h2 className="text-3xl sm:text-5xl md:text-6xl font-space font-extrabold text-white tracking-tight uppercase leading-tight">
        ¿Listo para Blindar sus <br /><span className="text-mjm-orange font-light">Auditorías Metrológicas?</span>
      </h2>
      <p className="text-sm sm:text-base text-zinc-300 font-light max-w-xl mx-auto font-inter">
        Agende una evaluación técnica en planta con nuestros ingenieros metrólogos. Recuerde que su aseguramiento anual incluye la plataforma de gobernanza digital y hojas de vida QR sin costo de suscripción mensual.
      </p>
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="https://wa.me/573137960800"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center justify-center gap-3 shadow-xl shadow-orange-500/25"
        >
          <span>Contactar Ingeniero por WhatsApp</span>
          <ArrowRight className="w-4 h-4" />
        </a>
        <a
          href="#contacto"
          className="px-6 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-space text-xs font-bold uppercase tracking-wider transition-all"
        >
          <span>Enviar Formulario Técnico</span>
        </a>
      </div>
    </div>
  </section>
);

// ─── Logos Aliados con Máscara Gaussiana ───────────────────────────────────────
const BrandsCarousel = () => (
  <section className="bg-white py-12 lg:py-16 border-y border-mjm-navy/5 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
      <span className="text-slate-400 font-mono font-bold uppercase tracking-[0.3em] text-[10px]">
        Marcas & Fabricantes Suministrados y Respaldados
      </span>
    </div>
    <div className="relative flex overflow-hidden w-full mask-gradient-x">
      <motion.div
        className="flex gap-20 items-center shrink-0"
        style={{ minWidth: '200%' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      >
        {[...brandLogos, ...brandLogos].map((logo, idx) => (
          <div key={idx} className="h-10 w-24 flex items-center justify-center shrink-0">
            <img
              src={logo}
              alt="Marca Aliada"
              className="max-h-full max-w-full object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-premium"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ─── Footer (Titanium Glass Style Estilo Ingyemel) ───────────────────────────
const Footer = () => (
  <footer className="bg-gradient-to-b from-[#141722] via-[#0E1119] to-[#07080C] text-white pt-20 pb-12 border-t-2 border-white/20 rounded-t-[44px] md:rounded-t-[64px] relative z-20 shadow-2xl overflow-hidden" id="contacto">
    {/* Resplandor Ambiental Dorado/Naranja en el Fondo */}
    <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-[#f7931b]/5 blur-[140px] rounded-full pointer-events-none" />

    <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
      
      {/* Columna 1: Logo & Bio Corporativa (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <a href="#inicio" className="flex items-center gap-3 sm:gap-3.5 group cursor-pointer">
          <div className="w-11 h-11 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center p-1.5 group-hover:border-[#f7931b]/60 group-hover:shadow-[0_0_20px_rgba(247,147,27,0.35)] transition-all shrink-0">
            <img
              src={logoAzul}
              alt="Isotipo MJM"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-space font-extrabold text-base sm:text-lg text-white tracking-tight uppercase group-hover:text-white transition-colors">
                ASESORÍAS INTEGRALES
              </span>
              <span className="font-space font-extrabold text-base sm:text-lg text-[#f7931b] tracking-tight uppercase">
                MJM
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-400 font-medium mt-1 leading-none flex items-center gap-1.5">
              <span>Metrología & Calibración</span>
              <span className="text-[#f7931b] font-bold">•</span>
              <span className="text-zinc-400">ISO 9001</span>
            </span>
          </div>
        </a>
        
        <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed max-w-sm font-inter">
          Líderes en aseguramiento metrológico, calibración trazable y gobernanza de activos en planta. Cumplimiento bajo normas ISO 9001 e ISO 10012 con atención técnica a nivel nacional.
        </p>

        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-zinc-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Atención en Planta • Soporte Metrológico 24/7</span>
        </div>
      </div>

      {/* Columna 2: Especialidades de Medición (3 cols) */}
      <div className="lg:col-span-3 space-y-4">
        <h4 className="font-mono text-xs uppercase tracking-[0.25em] text-[#f7931b] font-bold">Especialidades de Medición</h4>
        <ul className="space-y-2.5 text-xs text-zinc-300 font-space">
          {[
            'Aseguramiento Metrológico Integral',
            'Calibración & Verificación Trazable',
            'Capacitación Técnica Especializada',
            'Diagnóstico y Mantenimiento',
            'Suministro de Instrumentación',
            'Custodia Digital Multi-Tenant'
          ].map((item, idx) => (
            <li key={idx}>
              <a href="#servicios" className="hover:text-[#f7931b] transition-colors flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-[#f7931b]" />
                <span>{item}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Columna 3: Sede Principal & Cobertura (3 cols) */}
      <div className="lg:col-span-3 space-y-4">
        <h4 className="font-mono text-xs uppercase tracking-[0.25em] text-[#f7931b] font-bold">Sede Principal & Cobertura</h4>
        <div className="space-y-3 text-xs text-zinc-300 font-inter">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#f7931b] shrink-0 mt-0.5" />
            <span className="leading-relaxed font-light">Cl 2 #71d-84, Bogotá D.C., Colombia <br /><strong className="text-white font-medium">(Atención Presencial a Nivel Nacional)</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#f7931b] shrink-0" />
            <span>Cel / WhatsApp: +57 313 7960800</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#f7931b] shrink-0" />
            <span>comercial.asesoriasmjm@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Columna 4: Portal Corporativo (2 cols) */}
      <div className="lg:col-span-2 space-y-4">
        <h4 className="font-mono text-xs uppercase tracking-[0.25em] text-[#f7931b] font-bold">Portal de Clientes</h4>
        <p className="text-xs text-zinc-400 font-light leading-relaxed">
          Custodia inalterable de hojas de vida, certificados y cálculo de conformidad GUM.
        </p>
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f7931b] text-zinc-950 font-extrabold text-xs uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 font-space cursor-pointer"
        >
          <span>Acceso Clientes</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>

    {/* Barra Inferior Sub-Footer con Powered by Delta CoreTech */}
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-zinc-400 font-mono relative z-10 md:pr-80 pb-24 md:pb-4">
      {/* Copyright & Habeas Data */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center md:text-left text-zinc-400">
        <span>© {getCurrentYear()} Asesorías Integrales MJM S.A.S. • Todos los derechos reservados.</span>
        <span className="hidden sm:inline text-zinc-600">•</span>
        <span className="text-[11px] text-zinc-500 font-sans">
          Tratamiento de Datos (Ley 1581)
        </span>
      </div>
      
      {/* Insignia Delta CoreTech (Centrada / 100% Despejada y Visible) */}
      <a 
        href="https://deltacoretech.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 sm:gap-3 px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md hover:border-[#f7931b]/70 hover:bg-white/[0.12] transition-all group shadow-xl cursor-pointer"
        title="Desarrollado y Gestionado por Delta CoreTech"
      >
        <span className="text-[10px] sm:text-xs text-zinc-300 font-sans tracking-wide">Powered by</span>
        <img 
          src="/assets/images/delta_symbol_white.png" 
          alt="Delta CoreTech Icon" 
          className="w-4 h-4 sm:w-5 sm:h-5 object-contain transition-transform duration-200 group-hover:scale-110 filter drop-shadow-[0_0_8px_rgba(247,147,27,0.6)]" 
        />
        <span className="text-xs sm:text-sm font-extrabold font-space text-white tracking-wider uppercase">
          Delta <span className="text-[#f7931b]">CoreTech</span>
        </span>
      </a>
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
    <div className="font-sans text-mjm-navy bg-white min-h-screen flex flex-col relative w-full overflow-x-clip selection:bg-mjm-orange selection:text-white">

      {/* Navegación — estado de scroll aislado dentro del componente */}
      <LandingHeader />

      {/* Hero — estado del modal ISO aislado */}
      <HeroSection
        title={landing?.hero?.title || 'Expertos en Aseguramiento Metrológico'}
        subtitle={landing?.hero?.subtitle || 'Consultoría, capacitación, verificación y calibración de instrumentos con los más altos estándares de calidad y confiabilidad'}
      />

      {/* Barra de Confianza Metrológica */}
      <TrustBar />

      {/* Contenido estático — sin estado, render único */}
      <AlcanceSection />

      {/* Cinta de Métricas Industriales & Prueba Social Cuantitativa */}
      <MetricsProofBar />

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
