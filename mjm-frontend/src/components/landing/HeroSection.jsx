import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSection = ({ title, subtitle }) => {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Dividir el título en dos partes: primeras 2 palabras y el resto
  const words = title?.split(' ') || [];
  const titlePart1 = words.slice(0, 2).join(' ');
  const titlePart2 = words.slice(2).join(' ');

  return (
    <>
      <section id="inicio" className="relative min-h-[90vh] flex items-center mt-20 md:mt-0 pt-0 overflow-hidden">
        
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://asesoriasintegralesmjm.com/ui/principal2.jpeg"
            alt="Fondo Metrología"
            className="w-full h-full object-cover scale-105 animate-pulse-slow"
            fetchPriority="high"
          />
          {/* Filtros exactos de producción (bdf271f) */}
          <div className="absolute inset-0 bg-gradient-to-br from-mjm-navy via-mjm-navy/80 to-[#1a3a5a]/60 z-10" />
          <div className="absolute inset-0 bg-mjm-navy/30 mix-blend-multiply z-[11]" />
          {/* Rejilla industrial */}
          <div
            className="absolute inset-0 opacity-10 z-[12] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 w-full text-center lg:text-left py-20">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-8 font-display"
            >
              {titlePart1} <br />
              <span className="text-mjm-orange font-black">{titlePart2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed font-light max-w-xl"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <a
                href="#servicios"
                className="inline-flex items-center gap-3 bg-mjm-orange hover:bg-orange-600 text-white px-12 py-5 rounded-xl font-bold uppercase text-sm transition-all shadow-[0_10px_35px_rgba(238,140,44,0.25)] hover:shadow-[0_15px_40px_rgba(238,140,44,0.4)] hover:scale-[1.02] active:scale-95 tracking-wider group"
              >
                NUESTROS SERVICIOS
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </a>
            </motion.div>
          </div>

          {/* Badge ISO 9001 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-30"
          >
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="glass-premium rounded-2xl border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-4 pr-6 flex items-center gap-4 hover:scale-[1.02] hover:shadow-[0_15px_50px_rgba(238,140,44,0.2)] hover:border-mjm-orange/40 transition-premium group outline-none"
            >
              <img
                src="https://asesoriasintegralesmjm.com/ui/icontec.png"
                alt="Logo Icontec ISO 9001"
                className="h-[4.5rem] w-auto drop-shadow-sm group-hover:drop-shadow-md transition-all duration-500"
                loading="lazy"
              />
              <div className="flex flex-col text-left justify-center">
                <span className="text-mjm-navy font-bold text-xl leading-none tracking-tight mb-1">Certificación</span>
                <span className="text-mjm-orange font-extrabold text-2xl leading-none tracking-tight">ISO 9001</span>
              </div>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modal del Certificado ISO */}
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
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-4xl flex flex-col items-center"
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
                <div className="w-full h-full overflow-y-auto max-h-[75vh]">
                  <img
                    src="https://asesoriasintegralesmjm.com/ui/certificacion.png"
                    alt="Certificado Oficial ISO 9001:2015"
                    className="w-full h-auto object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="mt-6">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] animate-pulse">Click fuera para cerrar</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeroSection;
