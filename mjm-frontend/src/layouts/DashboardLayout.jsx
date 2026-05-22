import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  History, 
  Database,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import mjmLogo from '../assets/mjm-logo-main.jpg';

export default function DashboardLayout() {
  const { user, tenant, logout, isDarkMode, toggleDarkMode } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🌙 Sincronizar Modo Oscuro, Colores y Datos en Tiempo Real
  React.useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Sincronizar datos frescos de la BD si estamos en Sandbox
    const syncTenant = async () => {
      if (tenant?.id === 'deltapruebas-sandbox') {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        const tDoc = await getDoc(doc(db, 'tenants', 'deltapruebas-sandbox'));
        if (tDoc.exists()) {
           // Actualizar el estado global con los datos reales de la BD
           useAuthStore.setState({ tenant: { id: tDoc.id, ...tDoc.data() } });
        }
      }
    };

    syncTenant();

    if (tenant?.color_institucional_principal) {
      root.style.setProperty('--primary', tenant.color_institucional_principal);
    }
    if (tenant?.color_institucional_secundario) {
      root.style.setProperty('--secondary', tenant.color_institucional_secundario);
    }
  }, [isDarkMode, tenant?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  if (!tenant) return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Iniciando Laboratorio...</p>
      </div>
    </div>
  );

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventario de Activos', path: '/dashboard/inventario', icon: <Package size={20} /> },
    { name: 'Planificador', path: '/dashboard/calendario', icon: <Calendar size={20} /> },
    { name: 'Gestión Operativa', path: '/dashboard/kanban', icon: <History size={20} /> },
    { name: 'IA Lab (Beta)', path: '/dashboard/ia-lab', icon: <Database size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden transition-colors duration-500 selection:bg-[var(--primary)]/20">
      
      {/* --- SIDEBAR (Dark Optimized) --- */}
      <aside className="hidden lg:flex flex-col w-72 bg-[var(--sidebar-bg)] text-white flex-shrink-0 shadow-2xl z-50 transition-colors duration-500">
        <div className="p-8 mb-6 border-b border-white/5">
        {/* BRANDING DEL TENANT */}
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={tenant?.logo_url || mjmLogo} 
                alt="Logo" 
                className="w-full h-full object-contain p-1" 
              />
           </div>
           <div className="flex-1 min-w-0">
              <h1 className="font-black text-white text-base tracking-tight uppercase leading-none truncate">
                {tenant?.nombre_empresa || 'MJM Plataforma'}
              </h1>
              <p className="text-[7px] text-[var(--primary)] font-black uppercase tracking-[0.2em] mt-2">
                Sistema de Gestión
              </p>
           </div>
        </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                isActive(item.path)
                  ? 'bg-[var(--primary)] text-[#1A202C] shadow-lg shadow-[var(--primary)]/20'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
              {isActive(item.path) && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </Link>
          ))}
        </nav>

        {/* --- FOOTER BRANDING --- */}
        <div className="mt-auto pb-10 flex flex-col items-center">
           <p className="text-[7px] text-white/20 font-black uppercase tracking-[0.5em] mb-8">
              Powered by MJM
           </p>
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-3 px-5 py-4 text-white/40 hover:text-red-400 transition-all duration-300 group"
           >
             <LogOut size={16} className="opacity-40 group-hover:rotate-12 transition-transform" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cerrar Sesión</span>
           </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className="h-24 bg-[var(--surface)] border-b border-[var(--outline-color)] flex items-center justify-between px-10 transition-colors duration-500">
           <div className="flex items-center gap-6 flex-1">
              <button className="lg:hidden p-2 text-[var(--text-main)]">
                 <Menu />
              </button>
              <div className="hidden md:flex items-center gap-3 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                 <span>Panel de Gestión</span>
                 <ChevronRight size={12} className="opacity-30" />
                 <span className="text-[var(--primary)]">{location.pathname.split('/').pop() || 'Overview'}</span>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative hidden xl:block mr-6">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                 <input 
                  type="text" 
                  placeholder="Buscar activos..." 
                  className="bg-[var(--background)] border border-[var(--outline-color)] rounded-full pl-12 pr-6 py-2.5 text-xs w-72 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                 />
              </div>

              <div className="flex items-center gap-2 bg-[var(--background)] p-1.5 rounded-2xl border border-[var(--outline-color)]">
                 <button 
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl transition-all hover:bg-[var(--surface-alt)] text-[var(--text-main)]"
                 >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                 </button>
                 <button className="p-2.5 rounded-xl transition-all hover:bg-[var(--surface-alt)] text-[var(--text-main)] relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--primary)] rounded-full border-2 border-[var(--background)]" />
                 </button>
              </div>

              {/* PERFIL DE USUARIO */}
              <div className="flex items-center gap-4 pl-4 border-l border-neutral-200 dark:border-white/10 group cursor-default">
                 <div className="flex flex-col items-end transition-all duration-300">
                    <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                       {user?.nombre || 'MJM Administrator'}
                    </p>
                    <p className={`text-[8px] font-black uppercase tracking-[0.3em] transition-all ${isDarkMode ? 'text-[var(--primary)] drop-shadow-[0_0_10px_var(--primary)]' : 'text-slate-500'}`}>
                       {tenant?.nombre_empresa || 'DeltaSandbox'}
                    </p>
                 </div>
                 <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-slate-900 font-black text-sm shadow-lg shadow-[var(--primary)]/20 transition-shadow">
                    {user?.nombre ? user.nombre.substring(0, 2).toUpperCase() : 'MJ'}
                 </div>
              </div>
           </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-10 lg:p-14 pb-32 lg:pb-12 transition-colors duration-500">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
