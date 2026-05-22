import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import headerLogo0 from '../../assets/logo_final_2_0.png';
import logoAzul from '../../assets/logo_azul_sin_fondo.png';

// Hook con throttle para no castigar el hilo principal con el evento scroll
const useScrolled = (threshold = 50) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
};

const LandingHeader = () => {
  const scrolled = useScrolled();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobile = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <header className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-xl h-20 text-mjm-navy' : 'bg-transparent text-white h-24 pt-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#inicio" className="block focus:outline-none transition-transform hover:scale-105 active:scale-95">
              <img
                src={scrolled ? logoAzul : headerLogo0}
                alt="Logo MJM"
                className={`transition-all duration-500 object-contain ${
                  !scrolled ? 'h-10 md:h-14 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'h-10 md:h-12'
                }`}
              />
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-10 items-center">
            {['#inicio', '#nosotros', '#servicios'].map((href, i) => (
              <a key={i} href={href} className="hover:text-mjm-orange font-bold transition-all uppercase text-[13px] tracking-tight py-1">
                {['Inicio', 'Nosotros', 'Servicios'][i]}
              </a>
            ))}
            <Link to="/login" className="bg-mjm-orange text-white px-8 py-3 rounded-md font-black hover:bg-orange-600 transition-all shadow-[0_4px_14px_0_rgba(238,140,44,0.39)] uppercase text-xs tracking-widest">
              Portal de Clientes
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(v => !v)} className="p-2 transition-colors">
              {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t border-mjm-navy/10 p-6 space-y-6 shadow-2xl absolute w-full"
          >
            <a href="#inicio"    className="block text-xl font-black text-mjm-navy" onClick={closeMobile}>Inicio</a>
            <a href="#nosotros"  className="block text-xl font-black text-mjm-navy" onClick={closeMobile}>Nosotros</a>
            <a href="#servicios" className="block text-xl font-black text-mjm-navy" onClick={closeMobile}>Servicios</a>
            <Link to="/login" className="block w-full text-center bg-mjm-orange text-white py-4 rounded-lg font-black uppercase tracking-widest" onClick={closeMobile}>
              Portal de Clientes
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingHeader;
