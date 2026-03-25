import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import metrologyBg from '../assets/metrology_bg_real.jpg';
import mjmLogo from '../assets/logo_final_2.0.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mjm-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background with real image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={metrologyBg} 
          alt="Metrology Background" 
          className="w-full h-full object-cover opacity-55 blur-[2px] brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-mjm-navy/75"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center flex-col items-center">
          <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 transition-colors self-start ml-4 sm:ml-0">
            <ArrowLeft className="w-4 h-4" /> Volver a Inicio
          </Link>
          
          <div className="w-full max-w-[195px] mb-8 animate-in fade-in zoom-in duration-700 flex justify-center items-center">
            <img 
              src={mjmLogo} 
              alt="MJM Logo" 
              className="w-full h-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
            />
          </div>

          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            Aseguramiento Metrológico
          </h2>
        </div>

        <div className="mt-8">
          <div className="bg-white/10 backdrop-blur-xl py-10 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 sm:rounded-2xl sm:px-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-200 uppercase tracking-widest">
                  Correo Electrónico
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-mjm-orange focus:border-transparent sm:text-sm transition-all"
                    placeholder="usuario@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-200 uppercase tracking-widest">
                  Contraseña
                </label>
                <div className="mt-2 text-center">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl shadow-sm placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-mjm-orange focus:border-transparent sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-[0_10px_20px_rgba(238,140,44,0.3)] text-sm font-black uppercase tracking-[0.2em] text-white bg-mjm-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mjm-orange disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Ingresar al Portal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
