import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2,
  ChevronRight,
  Lightbulb,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import mjmLogo from '../assets/logo_final_2.0.png';
import heroImage from '../assets/metrology_bg_real.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Credenciales inválidas o error de autenticación. Por favor verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans selection:bg-[#f7931b]/20">
      
      {/* --- LADO IZQUIERDO: HERO VISUAL (Oculto en móvil) --- */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#070C18]">
        {/* Capa de imagen con overlay tonal */}
        <div className="absolute inset-0 z-0">
           <img 
            src={heroImage} 
            alt="MJM Metrology AI" 
            className="w-full h-full object-cover opacity-40 filter contrast-125"
           />
           <div className="absolute inset-0 bg-gradient-to-br from-[#234c74]/90 via-[#0B1326]/95 to-[#070C18] mix-blend-multiply" />
        </div>

        {/* Contenido Hero */}
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
           {/* Logo / Brand */}
           <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-700">
              <img src={mjmLogo} alt="MJM Logo" className="w-14 h-14 object-contain rounded-xl shadow-lg border border-white/10 bg-white p-1" />
              <div className="flex flex-col">
                 <h2 className="text-white font-space font-bold text-2xl tracking-tight leading-none">MJM</h2>
                 <p className="text-[#f7931b] text-[9px] font-mono font-semibold uppercase tracking-[0.3em] mt-1">Metrología Industrial</p>
              </div>
           </div>

           {/* Copy Comercial Industrial */}
           <div className="max-w-lg animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
              <h2 className="text-4xl xl:text-5xl font-extrabold font-space text-white mb-6 tracking-tight leading-[1.15]">
                Control y Aseguramiento <br /> 
                <span className="text-[#f7931b]">Metrológico</span>
              </h2>
              <p className="text-base text-slate-300 leading-relaxed font-normal">
                Gestión digital de activos, confirmación metrológica y trazabilidad bajo estándares internacionales ISO 10012 e ISO/IEC 17025.
              </p>
           </div>

           {/* Footer Izquierdo Simplificado */}
           <div className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">
              Asesorías Integrales MJM S.A.S.
           </div>
        </div>
      </section>

      {/* --- LADO DERECHO: FORMULARIO DE ACCESO --- */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-14 relative bg-white lg:bg-slate-50">
        <div className="w-full max-w-md bg-white lg:p-10 lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-xl lg:shadow-slate-200/50 animate-in fade-in duration-500">
           {/* Encabezado del Formulario */}
           <header className="mb-8">
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-mjm-navy font-medium transition-colors mb-4 group">
                 <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Volver a Inicio
              </Link>
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-mono font-medium rounded-md uppercase tracking-wider">
                    ISO 10012:2026 Ready
                 </span>
              </div>
              <h1 className="text-2xl font-bold font-space text-slate-900 tracking-tight">
                Iniciar Sesión
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-normal">
                Ingrese sus credenciales corporativas para acceder al panel de control.
              </p>
           </header>

           {/* Formulario */}
           <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-slate-700">Correo corporativo</label>
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-mjm-navy transition-colors">
                       <Mail size={16} />
                    </div>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      required
                      className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 rounded-lg outline-none focus:border-mjm-navy focus:ring-2 focus:ring-mjm-navy/15 transition-all text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700">Contraseña</label>
                    <a href="#" className="text-xs text-slate-500 hover:text-mjm-navy font-medium hover:underline transition-colors">¿Olvidó su contraseña?</a>
                 </div>
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-mjm-navy transition-colors">
                       <Lock size={16} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-11 pl-10 pr-10 bg-white border border-slate-300 rounded-lg outline-none focus:border-mjm-navy focus:ring-2 focus:ring-mjm-navy/15 transition-all text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                       {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                 </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg flex items-center gap-2">
                   <AlertCircle size={15} className="shrink-0 text-red-600" /> {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-mjm-navy hover:bg-[#1b3d5d] text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Ingresar a la Plataforma <ArrowRight size={15} />
                  </>
                )}
              </button>
           </form>

           <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-500">
                ¿Requiere asistencia técnica o soporte? 
                <a href="#" className="text-mjm-navy font-semibold ml-1.5 hover:underline">Contactar a Soporte MJM</a>
              </p>
           </div>
        </div>

        <footer className="absolute bottom-6 w-full px-12 flex justify-between items-center text-[10px] text-slate-400">
           <span>Plataforma Metrológica v2.4</span>
           <div className="flex gap-4">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Términos de Servicio</a>
           </div>
        </footer>
      </section>
    </div>
  );
}
