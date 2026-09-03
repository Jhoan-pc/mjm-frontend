import React, { useState, useEffect } from 'react';
import { ArrowRight, X, ShieldCheck, Mail, ChevronRight, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const HeroSection = () => {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const navigate = useNavigate();
  const loginDemo = useAuthStore(state => state.loginDemo);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      
      const heroContent = document.getElementById("hero-content");
      if (heroContent) {
        heroContent.style.opacity = Math.max(0, 1 - y / (vh * 0.55)).toString();
      }

      const heroBg = document.getElementById("hero-bg-layer");
      if (heroBg) {
        if (y > vh - 50) {
          heroBg.style.opacity = "0";
        } else {
          heroBg.style.opacity = "1";
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Layer 1: Fixed Pinned Background Layer (Ingyemel Style) */}
      <div id="hero-bg-layer" className="fixed inset-0 h-screen w-full z-0 pointer-events-none overflow-hidden bg-[#070708] transition-opacity duration-500">
        <img
          src="/ui/placa_electronica_hero.jpg"
          alt="Fondo Metrología Electrónica e Industrial"
          className="w-full h-full object-cover scale-105 filter brightness-[0.80] contrast-110"
          fetchPriority="high"
          decoding="async"
        />
        {/* Gradientes profundos multicapa Navy / Obsidian para contraste cinematográfico */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#0b1326]/65 to-black/75" />
      </div>

      {/* Layer 2: Hero Foreground Content Layer (Ingyemel Clean & Editorial Ultra High-End) */}
      <header id="inicio" className="relative min-h-screen w-full flex flex-col justify-center items-center pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 text-center z-10">
        <div 
          id="hero-content"
          className="max-w-5xl mx-auto space-y-6 md:space-y-8 relative z-20 transition-opacity duration-150 ease-out pointer-events-auto my-auto"
        >
          {/* Badge Normativo Superior */}
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-1.5 bg-black/70 border border-mjm-orange/40 rounded-full text-mjm-orange font-mono uppercase tracking-wider text-[10px] sm:text-xs backdrop-blur-md shadow-2xl max-w-[94vw] text-center leading-tight">
            <span className="w-2 h-2 rounded-full bg-mjm-orange animate-pulse shrink-0"></span>
            <span>ISO 9001:2015 CERTIFICADO • TRAZABILIDAD NTC-ISO/IEC 17025</span>
          </div>

          {/* Título Principal Estilo Ingyemel */}
          <h1 className="font-space font-light text-white text-3xl sm:text-5xl md:text-6xl lg:text-[4.75rem] tracking-tight leading-tight sm:leading-[1.04] max-w-4xl mx-auto">
            ASEGURAMIENTO METROLÓGICO & <br />
            <span className="font-space italic font-normal text-mjm-orange">
              TRAZABILIDAD DIGITAL DE INSTRUMENTOS
            </span>
          </h1>

          {/* Subtítulo de Conversión */}
          <p className="font-inter text-xs sm:text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
            Garantice auditorías impecables ante <strong className="text-white font-medium">entidades regulatorias y certificadores</strong> y elimine paradas de línea por derivas instrumentales. Calibración trazable en laboratorio propio e <strong className="text-[#f7931b] font-medium">incluimos la plataforma de gestión y hojas de vida sin costo de licencia mensual</strong> <span className="text-zinc-400 text-xs sm:text-sm font-normal">(aplican condiciones)</span>.
          </p>

          {/* Botones de Acción Ingyemel Style */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 flex-wrap">
            {/* Botón Estelar: Explorar Demo en Vivo con Halo y Pulso Metrológico */}
            <button
              type="button"
              onClick={async () => {
                try {
                  await loginDemo();
                  navigate('/dashboard');
                } catch(e) {
                  navigate('/login');
                }
              }}
              className="relative group w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-[#f7931b] via-[#ffaa3b] to-[#f7931b] hover:from-[#ffa834] hover:to-[#f7931b] text-zinc-950 font-black rounded-2xl transition-all duration-300 uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(247,147,27,0.45)] hover:shadow-[0_0_55px_rgba(247,147,27,0.7)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-space"
            >
              {/* Halo de resplandor pulsante continuo */}
              <span className="absolute -inset-0.5 rounded-2xl bg-[#f7931b]/50 blur-sm animate-pulse pointer-events-none" />

              {/* Micro-indicador "En Vivo" (Radar Ping) */}
              <span className="relative flex h-2.5 w-2.5 z-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-950 opacity-70" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-950" />
              </span>

              <Sparkles className="relative z-10 w-4 h-4 text-zinc-950 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">EXPLORAR DEMO EN VIVO</span>
            </button>

            <a 
              href="https://wa.me/573159253952?text=Hola%20MJM,%20solicito%20asesor%C3%ADa%20t%C3%A9cnica%20metrol%C3%B3gica"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500/50 font-extrabold rounded-2xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 backdrop-blur-md shadow-xl cursor-pointer font-space"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>CONTACTAR POR WHATSAPP</span>
            </a>

            <button
              onClick={() => setIsCertModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-black/60 border border-white/20 hover:border-[#f7931b]/60 text-zinc-300 hover:text-white font-mono rounded-2xl transition-all text-xs flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#f7931b]" />
              <span>Ver Certificado ISO</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal del Certificado ISO */}
      <AnimatePresence>
        {isCertModalOpen && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setIsCertModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-4xl flex flex-col items-center"
            >
              <div className="w-full flex justify-end mb-4">
                <button
                  onClick={() => setIsCertModalOpen(false)}
                  className="bg-mjm-orange hover:bg-orange-600 text-white w-12 h-12 rounded-full transition-all flex items-center justify-center shadow-2xl cursor-pointer group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
              <div className="w-full bg-[#fbfbfb] rounded-2xl border-4 border-white/20 p-2 sm:p-4 shadow-2xl overflow-hidden">
                <div className="w-full h-full overflow-y-auto max-h-[75vh]">
                  <img
                    src="/ui/certificacion.png"
                    alt="Certificado Oficial ISO 9001:2015"
                    className="w-full h-auto object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeroSection;
