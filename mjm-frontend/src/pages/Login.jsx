import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import mjmLogo from '../assets/mjm-logo-main.jpg';
import heroImage from '../assets/login-hero.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex w-full bg-[#FAF8FF] font-sans selection:bg-[#78B7D0]/30">
      
      {/* --- LADO IZQUIERDO: HERO VISUAL (Oculto en móvil) --- */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0B1326]">
        {/* Capa de imagen con overlay tonal */}
        <div className="absolute inset-0 z-0">
           <img 
            src={heroImage} 
            alt="MJM Metrology AI" 
            className="w-full h-full object-cover opacity-60"
           />
           <div className="absolute inset-0 bg-gradient-to-br from-[#1F667C]/90 via-[#0B1326]/95 to-[#0B1326] mix-blend-multiply" />
        </div>

        {/* Contenido Hero */}
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
           {/* Logo / Brand */}
           <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-700">
              <img src={mjmLogo} alt="MJM Logo" className="w-16 h-16 object-cover rounded-2xl shadow-md border border-white/10" />
              <div className="flex flex-col">
                 <h2 className="text-white font-bold text-2xl tracking-tight leading-none">MJM</h2>
                 <p className="text-[#78B7D0] text-[8px] font-black uppercase tracking-[0.4em] mt-1">Plataforma Metrológica</p>
              </div>
           </div>

           {/* Copy Comercial Industrial */}
           <div className="max-w-xl animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
              <h2 className="text-5xl font-black text-white mb-8 tracking-tighter leading-[1.1]">
                Excelencia en <br /> 
                <span className="text-[#78B7D0] italic">Metrología Industrial</span>
              </h2>
              <p className="text-lg text-white/70 leading-relaxed font-medium">
                Gestión integral de sus activos y procesos de medición bajo estándares internacionales. 
                Asegure la trazabilidad y la excelencia técnica en cada una de sus operaciones industriales.
              </p>
           </div>

           {/* Footer Izquierdo Simplificado */}
           <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">
              Powered by MJM
           </div>
        </div>
      </section>

      {/* --- LADO DERECHO: FORMULARIO DE ACCESO --- */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 relative bg-white lg:bg-transparent">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
           {/* Encabezado del Formulario */}
           <header className="mb-12">
              <h1 className="text-3xl font-black text-[#131B2E] tracking-tighter mb-3 leading-tight uppercase">
                Bienvenido a su Sistema de Gestión Metrológica
              </h1>
              <div className="flex items-center gap-2">
                 <span className="px-3 py-1 bg-[#F2F3FF] border border-[#D3E4FE] text-[#505F76] text-[10px] font-black rounded-lg uppercase tracking-widest">
                    Alineado a ISO 10012:2026
                 </span>
              </div>
           </header>

           {/* Formulario */}
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-[#40484C] uppercase tracking-widest ml-1">Correo corporativo</label>
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#70787D] group-focus-within:text-[#1F667C] transition-colors">
                       <Mail size={18} />
                    </div>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      required
                      className="w-full h-14 pl-12 pr-4 bg-[#F2F3FF]/50 border border-[#BFC8CC] rounded-2xl outline-none focus:border-[#1F667C] focus:ring-4 focus:ring-[#1F667C]/5 transition-all text-[#131B2E] font-medium placeholder:text-[#70787D]/50"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[#40484C] uppercase tracking-widest">Contraseña</label>
                 </div>
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#70787D] group-focus-within:text-[#1F667C] transition-colors">
                       <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-14 pl-12 pr-12 bg-[#F2F3FF]/50 border border-[#BFC8CC] rounded-2xl outline-none focus:border-[#1F667C] focus:ring-4 focus:ring-[#1F667C]/5 transition-all text-[#131B2E] font-medium placeholder:text-[#70787D]/50"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#70787D] hover:text-[#1F667C] transition-colors"
                    >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
              </div>

              <div className="flex justify-end px-1">
                 <a href="#" className="text-[10px] font-black text-[#1F667C] uppercase tracking-widest hover:underline">¿Olvidó su contraseña?</a>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 animate-shake">
                   <AlertCircle size={16} /> {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#1F667C] text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#1F667C]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Iniciar Sesión Automática <ArrowRight size={18} />
                  </>
                )}
              </button>
           </form>

           <div className="mt-12 text-center">
              <p className="text-[10px] font-bold text-[#40484C] uppercase tracking-widest opacity-60">
                ¿Requiere asistencia técnica? 
                <a href="#" className="text-[#1F667C] ml-2 hover:underline">Contactar a Soporte MJM</a>
              </p>
           </div>
        </div>

        <footer className="absolute bottom-10 w-full px-16 flex flex-row justify-end items-center gap-4 pointer-events-none opacity-40">
           <div className="flex gap-6">
              <span className="text-[9px] font-black text-[#505F76] uppercase tracking-widest">Privacidad</span>
              <span className="text-[9px] font-black text-[#505F76] uppercase tracking-widest">Términos Legales</span>
           </div>
        </footer>
      </section>
    </div>
  );
}
