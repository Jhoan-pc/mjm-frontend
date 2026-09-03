import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight, 
  ShieldCheck, 
  RotateCw, 
  Lock, 
  MousePointer2,
  Sparkles,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const CHAPTERS = [
  {
    id: 'kpis',
    title: 'Panel de Control & KPIs en Vivo',
    badge: 'MONITOREO CONTINUO',
    route: 'https://app.mjmmetrologia.com/dashboard',
    subtitle: 'Alertas tempranas a 30, 60 y 90 días: detección inmediata de equipos vencidos o fuera de servicio.',
    image: '/demo/03_dashboard_kpis.png',
    sidebarLabel: 'Dashboard',
    sidebarPos: { x: '5.8%', y: '16.5%' },
    actionPos: { x: '72%', y: '32%' },
    actionText: 'Auditoría OK • 98.4% Cumplimiento'
  },
  {
    id: 'inventario',
    title: 'Inventario Maestro de Activos & Trazabilidad',
    badge: 'GESTIÓN 5 MAGNITUDES',
    route: 'https://app.mjmmetrologia.com/dashboard/inventario',
    subtitle: 'Base de datos centralizada con marcas Fluke, Megger, FLIR, números de serie y certificados vigentes.',
    image: '/demo/04_inventario.png',
    sidebarLabel: 'Inventario',
    sidebarPos: { x: '5.8%', y: '21.5%' },
    actionPos: { x: '45%', y: '42%' },
    actionText: 'Inspeccionando Fluke 87V • Vence en 45 días'
  },
  {
    id: 'gum',
    title: 'Criterio Matemático GUM & Incertidumbre',
    badge: 'CONFORMIDAD ALGORÍTMICA',
    route: 'https://app.mjmmetrologia.com/dashboard/aseguramiento',
    subtitle: 'Evaluación algorítmica de conformidad: compara el error instrumental e incertidumbre expandida contra la tolerancia del proceso.',
    image: '/demo/05_aseguramiento_gum.png',
    sidebarLabel: 'Aseguramiento',
    sidebarPos: { x: '5.8%', y: '36.5%' },
    actionPos: { x: '58%', y: '48%' },
    actionText: 'Cálculo GUM: Error + U(k=2) ≤ Tolerancia'
  },
  {
    id: 'kanban',
    title: 'Flujo Kanban de Calibración en Laboratorio',
    badge: 'OPERACIÓN VISUAL LEAN',
    route: 'https://app.mjmmetrologia.com/dashboard/kanban',
    subtitle: 'Trazabilidad minuto a minuto desde la recepción del instrumento hasta la emisión del certificado oficial.',
    image: '/demo/06_kanban.png',
    sidebarLabel: 'Kanban Metrológico',
    sidebarPos: { x: '5.8%', y: '31.5%' },
    actionPos: { x: '38%', y: '34%' },
    actionText: 'Moviendo a "En Calibración Activa"'
  },
  {
    id: 'calendario',
    title: 'Planificador Preventivo Anual',
    badge: 'CERO PARADAS DE PLANTA',
    route: 'https://app.mjmmetrologia.com/dashboard/calendario',
    subtitle: 'Cronograma automatizado que coordina las paradas de calibración con los turnos de producción.',
    image: '/demo/07_calendario.png',
    sidebarLabel: 'Planificador',
    sidebarPos: { x: '5.8%', y: '26.5%' },
    actionPos: { x: '52%', y: '28%' },
    actionText: 'Sincronizado con Turnos de Planta'
  }
];

export default function PlatformVideoPlayer({ onDemoClick }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [cursorPhase, setCursorPhase] = useState('sidebar'); // 'sidebar' | 'clicking' | 'action' | 'inspecting'
  const navigate = useNavigate();
  const loginDemo = useAuthStore(state => state.loginDemo);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const SLIDE_DURATION = 5500; // 5.5s por capítulo
  const current = CHAPTERS[currentIdx];

  // Temporizador principal y coreografía de animación
  useEffect(() => {
    if (!isPlaying) return;

    // Fases de la interacción simulada dentro de cada capítulo
    const t0 = setTimeout(() => setCursorPhase('sidebar'), 100);
    const t1 = setTimeout(() => setCursorPhase('clicking'), 900);
    const t2 = setTimeout(() => {
      setIsNavigating(true);
      setCursorPhase('action');
    }, 1200);
    const t3 = setTimeout(() => {
      setIsNavigating(false);
      setCursorPhase('inspecting');
    }, 1800);

    const interval = 50;
    const step = (interval / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIdx(curr => (curr + 1) % CHAPTERS.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(timer);
    };
  }, [isPlaying, currentIdx]);

  const handleSelectChapter = (idx) => {
    setCurrentIdx(idx);
    setProgress(0);
    setCursorPhase('sidebar');
  };

  const handleNext = () => {
    setCurrentIdx((currentIdx + 1) % CHAPTERS.length);
    setProgress(0);
    setCursorPhase('sidebar');
  };

  const handlePrev = () => {
    setCurrentIdx((currentIdx - 1 + CHAPTERS.length) % CHAPTERS.length);
    setProgress(0);
    setCursorPhase('sidebar');
  };

  const handleEnterDemo = async () => {
    if (onDemoClick) {
      onDemoClick();
      return;
    }
    try {
      setIsLoggingIn(true);
      await loginDemo();
      navigate('/dashboard');
    } catch (e) {
      console.error("Error al ingresar a demo:", e);
      navigate('/login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl bg-[#070b14] border-2 border-white/20 shadow-[0_25px_90px_rgba(0,0,0,0.85)] overflow-hidden text-white backdrop-blur-3xl select-none">
      
      {/* 1. Barra de Navegación de Ventana Real (Browser Chrome & Titanium Bezel) */}
      <div className="bg-[#0b101d] px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between gap-3 text-xs">
        
        {/* Controles de Ventana */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-[#e0443e]/60" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-[#dea123]/60" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-[#1aab29]/60" />
          </div>

          <div className="hidden sm:flex items-center gap-1 text-zinc-400 pl-2">
            <button onClick={handlePrev} className="p-1 hover:text-white rounded hover:bg-white/5 cursor-pointer">
              <ChevronLeft size={15} />
            </button>
            <button onClick={handleNext} className="p-1 hover:text-white rounded hover:bg-white/5 cursor-pointer">
              <ChevronRight size={15} />
            </button>
            <button 
              onClick={() => setProgress(0)} 
              className={`p-1 hover:text-white rounded hover:bg-white/5 cursor-pointer ${isNavigating ? 'animate-spin text-[#f7931b]' : ''}`}
            >
              <RotateCw size={13} />
            </button>
          </div>
        </div>

        {/* Barra de Direcciones Interactiva con Candado de Seguridad */}
        <div className="flex-1 max-w-xl mx-auto bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 flex items-center gap-2 text-zinc-300 font-mono text-[11px] shadow-inner relative overflow-hidden">
          {/* Shimmer / Progress Loader Bar en la URL al cambiar de ruta */}
          {isNavigating && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#f7931b] via-amber-400 to-[#f7931b]"
            />
          )}

          <Lock size={12} className="text-emerald-400 shrink-0" />
          <span className="truncate text-white font-medium">
            {current.route}
          </span>
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold hidden md:inline">
            TLS 1.3
          </span>
        </div>

        {/* Botón de Entrada Instantánea */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-[10px] font-mono text-red-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>EN VIVO</span>
          </div>

          <button
            onClick={handleEnterDemo}
            disabled={isLoggingIn}
            className="px-3.5 py-1.5 rounded-xl bg-[#f7931b] hover:bg-orange-400 text-zinc-950 font-space font-extrabold text-[10px] sm:text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isLoggingIn ? 'Iniciando...' : 'Probar en Vivo'}</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>

      {/* 2. Pantalla de la Aplicación con Transiciones de Navegación SPA */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#03060c] overflow-hidden group">
        
        {/* Shimmer sutil de carga entre vistas */}
        {isNavigating && (
          <div className="absolute inset-0 z-30 bg-black/30 backdrop-blur-[1px] flex items-center justify-center transition-all pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-[#f7931b] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Vista activa con animación fluida de deslizamiento */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0.4, x: 25, scale: 0.99 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0.3, x: -25, scale: 1.01 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full relative"
          >
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-contain object-top select-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradiente inferior para legibilidad cinematográfica */}
        <div className="absolute inset-x-0 bottom-0 h-36 sm:h-44 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none" />

        {/* 3. Cursor Virtual Animado con Simulación de Navegación Humana */}
        <motion.div
          animate={{
            left: cursorPhase === 'sidebar' || cursorPhase === 'clicking'
              ? current.sidebarPos.x 
              : current.actionPos.x,
            top: cursorPhase === 'sidebar' || cursorPhase === 'clicking'
              ? current.sidebarPos.y 
              : current.actionPos.y,
            scale: cursorPhase === 'clicking' ? 0.82 : 1
          }}
          transition={{
            duration: cursorPhase === 'sidebar' ? 0.9 : 1.2,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute z-40 pointer-events-none hidden sm:flex items-start gap-2"
        >
          {/* Puntero de ratón estilizado */}
          <div className="relative">
            <MousePointer2 
              size={24} 
              className={`fill-white text-zinc-950 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] transition-transform duration-150 ${
                cursorPhase === 'clicking' ? 'scale-90 text-[#f7931b]' : ''
              }`} 
            />

            {/* Onda de clic pulsante */}
            {cursorPhase === 'clicking' && (
              <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-[#f7931b]/60 border-2 border-white animate-ping pointer-events-none" />
            )}
          </div>

          {/* Etiqueta flotante con el texto de la acción en curso */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-2.5 py-1 rounded-lg bg-zinc-950/90 border border-white/20 text-[10px] font-mono font-medium text-white shadow-2xl backdrop-blur-md whitespace-nowrap flex items-center gap-1.5"
          >
            {cursorPhase === 'sidebar' || cursorPhase === 'clicking' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#f7931b] animate-pulse" />
                <span>Navegar: {current.sidebarLabel}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={11} className="text-emerald-400" />
                <span>{current.actionText}</span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Flechas de Navegación Lateral (Hover) */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-[#f7931b] hover:text-zinc-950 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer z-30"
          title="Módulo Anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-[#f7931b] hover:text-zinc-950 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer z-30"
          title="Siguiente Módulo"
        >
          <ChevronRight size={20} />
        </button>

        {/* Overlay Inferior: Título, Badge de Norma y Botones de Conversión */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7931b]/20 border border-[#f7931b]/40 text-[#f7931b] font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-bold">
              <ShieldCheck size={13} />
              <span>{current.badge} • ISO 10012</span>
            </div>
            <h3 className="font-space font-extrabold text-lg sm:text-2xl text-white tracking-tight leading-tight">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-light font-inter leading-snug">
              {current.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all backdrop-blur-md cursor-pointer"
              title={isPlaying ? 'Pausar Simulación' : 'Reanudar Simulación'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="text-[#f7931b] fill-[#f7931b]" />}
            </button>

            <button
              onClick={handleEnterDemo}
              className="px-5 py-3 rounded-xl bg-[#f7931b] hover:bg-orange-400 text-zinc-950 font-space font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-orange-500/30 flex items-center gap-2 cursor-pointer"
            >
              <span>Explorar en Vivo</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Barra de Progreso y Capítulos */}
      <div className="bg-[#0b101d] p-3 sm:p-5 border-t border-white/10">
        
        {/* Barra continua de tiempo */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 via-[#f7931b] to-amber-300 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Píldoras de Capítulos con Click Directo */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CHAPTERS.map((ch, idx) => {
            const isActive = idx === currentIdx;
            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChapter(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.08] border-[#f7931b] shadow-lg shadow-orange-500/10'
                    : 'bg-transparent border-white/5 hover:border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-[#f7931b] uppercase font-bold tracking-wider">
                    0{idx + 1}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#f7931b] animate-ping" />}
                </div>
                <span className="block text-xs font-space font-bold text-white truncate mt-0.5">
                  {ch.sidebarLabel}
                </span>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
