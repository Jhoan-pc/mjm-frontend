import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldCheck, Lock, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import logoAzul from '../../assets/logo_azul_sin_fondo.png';
import headerLogo0 from '../../assets/logo_final_2_0.png';

const LandingHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const loginDemo = useAuthStore(state => state.loginDemo);
  const closeMobile = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const isScrollingDown = y > lastScrollY && y > 100;
      lastScrollY = y;
      
      const nav = document.getElementById("main-nav");
      if (nav) {
        if (isScrollingDown) {
          nav.style.transform = "translateY(-100%)";
          nav.style.opacity = "0";
        } else {
          nav.style.transform = "translateY(0)";
          nav.style.opacity = "1";
          if (y < 60) {
            nav.className = "fixed top-0 w-full z-50 transition-all duration-500 bg-gradient-to-b from-[#0b1326]/95 via-[#0b1326]/60 to-transparent py-3 sm:py-5 text-white";
          } else if (y < vh - 100) {
            nav.className = "fixed top-0 w-full z-50 transition-all duration-500 bg-[#0b1326]/85 backdrop-blur-md py-2.5 sm:py-3.5 shadow-xl text-white border-b border-white/10";
          } else {
            nav.className = "fixed top-0 w-full z-50 transition-all duration-500 bg-[#090f1d]/95 backdrop-blur-xl py-2 sm:py-3 shadow-2xl text-white border-b border-white/10";
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav id="main-nav" className="fixed top-0 w-full z-50 transition-all duration-500 bg-gradient-to-b from-[#0b1326]/95 via-[#0b1326]/60 to-transparent py-3 sm:py-5 text-white">
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto">
        
        {/* Brand Lockup de Alta Precisión: Isotipo + Tipografía Vectorial */}
        <a href="#inicio" className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center p-1.5 group-hover:border-[#f7931b]/60 group-hover:shadow-[0_0_20px_rgba(247,147,27,0.35)] transition-all shrink-0">
            <img
              src={logoAzul}
              alt="Isotipo MJM"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-space font-extrabold text-sm sm:text-base md:text-lg text-white tracking-tight uppercase group-hover:text-white transition-colors">
                ASESORÍAS INTEGRALES
              </span>
              <span className="font-space font-extrabold text-sm sm:text-base md:text-lg text-[#f7931b] tracking-tight uppercase">
                MJM
              </span>
            </div>
            <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-400 font-medium mt-1 leading-none flex items-center gap-1.5">
              <span>Metrología & Calibración</span>
              <span className="text-[#f7931b] font-bold hidden sm:inline">•</span>
              <span className="text-zinc-400 hidden sm:inline">ISO 9001</span>
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] font-space">
          <a className="text-white border-b-2 border-mjm-orange pb-1 transition-colors" href="#inicio">Inicio</a>
          <a className="text-zinc-400 hover:text-white transition-colors" href="#alcance">Nuestro Alcance</a>
          <a className="text-zinc-400 hover:text-white transition-colors" href="#servicios">Servicios</a>
          <a className="text-zinc-400 hover:text-white transition-colors" href="#nosotros">Nosotros</a>
          <a className="text-zinc-400 hover:text-white transition-colors" href="#contacto">Contacto</a>
        </div>

        {/* Acceso a Portal de Clientes */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link 
            to="/login" 
            className="bg-mjm-orange text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-[0.15em] hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/25 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 font-space"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden min-[420px]:inline">PORTAL CLIENTES</span>
            <span className="min-[420px]:hidden">PORTAL</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="md:hidden bg-[#090f1d]/98 backdrop-blur-2xl border-t border-white/10 px-6 py-8 space-y-5 shadow-2xl absolute w-full left-0 top-full text-white"
          >
            {[
              { href: '#inicio', label: 'Inicio' },
              { href: '#alcance', label: 'Nuestro Alcance' },
              { href: '#servicios', label: 'Servicios de Medición' },
              { href: '#nosotros', label: 'Sobre Nosotros' },
              { href: '#contacto', label: 'Contacto' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-lg font-space font-extrabold text-white hover:text-mjm-orange transition-colors"
                onClick={closeMobile}
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/login"
              className="block w-full text-center bg-mjm-orange hover:bg-orange-600 text-white py-3.5 rounded-xl font-space font-bold uppercase tracking-wider shadow-lg shadow-orange-500/25"
              onClick={closeMobile}
            >
              Acceso a Portal de Clientes
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingHeader;
