import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useInventoryStore } from '../store/inventoryStore';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  History, 
  Database,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import mjmLogo from '../assets/mjm-logo-main.jpg';

export default function DashboardLayout() {
  const { user, tenant, logout, isDarkMode, toggleDarkMode, isDemoMode } = useAuthStore();
  const { activities, loadActivities } = useInventoryStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDemo = isDemoMode || user?.id === 'sandbox-dev-001';

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

  useEffect(() => {
    if (tenant?.id) {
      const unsubscribe = loadActivities(tenant.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [tenant?.id, loadActivities]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const stats = useMemo(() => {
    const vencidos = activities.filter(act => act.estado === 'todo' && act.fechaProgramada < todayStr).length;
    const hoy = activities.filter(act => act.estado === 'todo' && act.fechaProgramada === todayStr).length;
    const enProceso = activities.filter(act => act.estado === 'doing').length;
    return { vencidos, hoy, enProceso };
  }, [activities, todayStr]);
  const hasAlerts = stats.vencidos > 0 || stats.hoy > 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Inventario de Activos', path: '/dashboard/inventario', icon: <Package size={19} /> },
    { name: 'Comprobación en Planta', path: '/dashboard/aseguramiento', icon: <ShieldCheck size={19} /> },
    { name: 'Confirmación Metrológica', path: '/dashboard/ia-lab', icon: <Database size={19} /> },
    { name: 'Cronograma', path: '/dashboard/calendario', icon: <Calendar size={19} /> },
    { name: 'Gestión Operativa', path: '/dashboard/kanban', icon: <History size={19} /> },
    { name: 'Ajustes', path: '/dashboard/settings', icon: <SettingsIcon size={19} /> },
  ];

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden transition-colors duration-500 selection:bg-[#f7931b]/20">
      
      {/* --- MOBILE SIDEBAR DRAWER --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer Content */}
          <aside className="relative flex flex-col w-72 h-full bg-[var(--sidebar-bg)] text-white shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            <div className="p-5 mb-2 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-white/10 shadow-md">
                   <img 
                     src={tenant?.logo_url || mjmLogo} 
                     alt="Logo" 
                     className="w-full h-full object-contain p-1" 
                   />
                </div>
                <div className="flex-1 min-w-0">
                   <h1 className="font-space font-bold text-white text-xs tracking-tight uppercase leading-none truncate">
                     {tenant?.nombre_empresa || 'MJM Plataforma'}
                   </h1>
                   <p className="text-[8px] text-[#f7931b] font-mono font-medium uppercase tracking-widest mt-1">
                     ISO 10012 Metrología
                   </p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-md hover:bg-white/5 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-3 space-y-1">
              {navItems.map((item) => {
                const isIALab = item.path === '/dashboard/ia-lab';
                const isDemoTarget = isDemo && isIALab;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group text-xs ${
                      active
                        ? 'bg-white/10 text-white font-semibold border-l-2 border-[#f7931b]'
                        : isDemoTarget
                          ? 'border border-[#f7931b]/60 bg-[#f7931b]/15 text-white font-semibold shadow-[0_0_15px_rgba(247,147,27,0.25)]'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <span className={`transition-transform duration-200 ${active || isDemoTarget ? 'text-[#f7931b]' : 'text-slate-400 group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    <span className="tracking-wide">{item.name}</span>
                    {isDemoTarget ? (
                      <span className="ml-auto px-1.5 py-0.5 rounded bg-[#f7931b] text-zinc-950 text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm animate-pulse">
                        <Sparkles size={9} /> PROBAR
                      </span>
                    ) : active ? (
                      <ChevronRight size={12} className="ml-auto text-[#f7931b]" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pb-5 flex flex-col items-center">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-300 hover:text-red-400 active:scale-95 transition-all group cursor-pointer"
              >
                <LogOut size={14} className="opacity-70 group-hover:opacity-100 transition-all" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Cerrar Sesión</span>
              </button>

               <p className="text-[9px] text-white/25 font-mono uppercase tracking-widest mt-2 select-none pointer-events-none">
                  MJM Engine v2.4
               </p>
            </div>
          </aside>
        </div>
      )}

      {/* --- SIDEBAR (Dark Optimized) --- */}
      <aside className="hidden lg:flex flex-col w-72 bg-[var(--sidebar-bg)] text-white flex-shrink-0 border-r border-white/10 z-50 transition-colors duration-500">
        <div className="p-5 mb-2 border-b border-white/10">
        {/* BRANDING DEL TENANT */}
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-white/10 shadow-md">
              <img 
                src={tenant?.logo_url || mjmLogo} 
                alt="Logo" 
                className="w-full h-full object-contain p-1" 
              />
           </div>
           <div className="flex-1 min-w-0">
              <h1 className="font-space font-bold text-white text-xs tracking-tight uppercase leading-none truncate">
                {tenant?.nombre_empresa || 'MJM Plataforma'}
              </h1>
              <p className="text-[8px] text-[#f7931b] font-mono font-medium uppercase tracking-widest mt-1">
                ISO 10012 Metrología
              </p>
           </div>
        </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 font-inter">
          {navItems.map((item) => {
            const isIALab = item.path === '/dashboard/ia-lab';
            const isDemoTarget = isDemo && isIALab;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group text-xs ${
                  active
                    ? 'bg-white/10 text-white font-semibold border-l-2 border-[#f7931b] shadow-sm'
                    : isDemoTarget
                      ? 'border border-[#f7931b]/60 bg-[#f7931b]/15 text-white font-semibold shadow-[0_0_15px_rgba(247,147,27,0.25)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                }`}
              >
                <span className={`transition-transform duration-200 ${active || isDemoTarget ? 'text-[#f7931b]' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.name}</span>
                {isDemoTarget ? (
                  <span className="ml-auto px-1.5 py-0.5 rounded bg-[#f7931b] text-zinc-950 text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm animate-pulse">
                    <Sparkles size={9} /> PROBAR
                  </span>
                ) : active ? (
                  <ChevronRight size={12} className="ml-auto text-[#f7931b]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* --- FOOTER BRANDING --- */}
        <div className="mt-auto pb-5 flex flex-col items-center">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-300 hover:text-red-400 active:scale-95 transition-all group cursor-pointer"
            >
              <LogOut size={14} className="opacity-70 group-hover:opacity-100 transition-all" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Cerrar Sesión</span>
            </button>

           <p className="text-[9px] text-white/25 font-mono uppercase tracking-widest mt-2 select-none pointer-events-none">
              MJM Engine v2.4
           </p>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR COMPACTO Y ELEGANTE (64px) */}
        <header className="h-16 bg-[var(--surface)] border-b border-[var(--outline-color)] flex items-center justify-between px-6 transition-colors duration-500">
           <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-[var(--text-main)] hover:bg-[var(--surface-alt)] rounded-lg transition-all"
              >
                 <Menu size={18} />
              </button>
              <div className="hidden md:flex items-center gap-2 text-[var(--text-muted)] text-[11px] font-inter font-medium uppercase tracking-wider">
                 <span>Gestión Metrológica</span>
                 <ChevronRight size={10} className="opacity-40" />
                 <span className="text-mjm-navy dark:text-[#f7931b] font-semibold">
                    {(() => {
                      const path = location.pathname.split('/').pop() || 'overview';
                      if (path === 'calendario') return 'Cronograma de Calibración';
                      if (path === 'inventario') return 'Inventario de Activos';
                      if (path === 'kanban') return 'Gestión Operativa';
                      if (path === 'ia-lab') return 'Confirmación Metrológica (ISO 10012)';
                      if (path === 'aseguramiento') return 'Comprobación Metrológica en Planta';
                      if (path === 'settings') return 'Ajustes del Sistema';
                      return 'Tablero General';
                    })()}
                 </span>
              </div>
           </div>

           <div className="flex items-center gap-4">

              <div className="flex items-center gap-1.5 bg-[var(--background)] p-1 rounded-xl border border-[var(--outline-color)]">
                 <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg transition-all hover:bg-[var(--surface-alt)] text-[var(--text-main)]"
                 >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                 </button>
                 <button 
                   onClick={() => setShowNotifications(!showNotifications)}
                   className="p-2 rounded-lg transition-all hover:bg-[var(--surface-alt)] text-[var(--text-main)] relative"
                 >
                    <Bell size={16} />
                    {hasAlerts && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[var(--background)] animate-pulse" />}
                 </button>
              </div>

              {/* NOTIFICATIONS POPOVER */}
              {showNotifications && (
                <div className="absolute top-16 right-8 w-72 bg-[var(--sidebar-bg)]/90 backdrop-blur-md text-white shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-xl p-5 border border-white/10 z-50 animate-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                     <div className="flex items-center gap-2">
                       <AlertCircle size={16} className="text-[var(--tertiary)]" />
                       <h4 className="font-outfit font-bold text-xs uppercase tracking-wider">Alertas Críticas</h4>
                     </div>
                     <button onClick={() => setShowNotifications(false)} className="text-white/50 hover:text-white"><X size={14}/></button>
                  </div>
                  <div className="space-y-3 font-inter">
                     <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                        <span className="text-xs font-medium opacity-60">Vencimientos</span>
                        <span className={`${stats.vencidos > 0 ? 'bg-red-500 animate-pulse font-bold' : 'bg-neutral-600 font-medium'} px-2 py-0.5 rounded text-[10px] text-white font-data`}>
                           {String(stats.vencidos).padStart(2, '0')}
                        </span>
                     </div>
                     <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                        <span className="text-xs font-medium opacity-60">Programados Hoy</span>
                        <span className="bg-[var(--primary)] px-2 py-0.5 rounded text-[10px] text-[#1A202C] font-data font-bold">
                           {String(stats.hoy).padStart(2, '0')}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-medium opacity-60">En Proceso</span>
                        <span className="bg-[var(--tertiary)] px-2 py-0.5 rounded text-[10px] text-[#1A202C] font-data font-bold">
                           {String(stats.enProceso).padStart(2, '0')}
                        </span>
                     </div>
                  </div>
                </div>
              )}

              {/* PERFIL DE USUARIO */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10 group cursor-default">
                 <div className="flex flex-col items-end transition-all duration-300">
                    <p className={`text-xs font-inter font-semibold tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                       {user?.nombre || 'Administrador MJM'}
                    </p>
                    <p className={`text-[9px] font-mono font-medium uppercase tracking-wider transition-all ${isDarkMode ? 'text-[#f7931b]' : 'text-slate-500'}`}>
                       {tenant?.nombre_empresa || 'DeltaSandbox'}
                    </p>
                 </div>
                 <div className="w-8 h-8 rounded-lg bg-mjm-navy text-white dark:bg-[#f7931b] dark:text-slate-950 flex items-center justify-center font-space font-bold text-xs shadow-sm transition-shadow">
                    {user?.nombre ? user.nombre.substring(0, 2).toUpperCase() : 'MJ'}
                 </div>
              </div>
           </div>
        </header>

        {/* Banner de Modo Demostración Interactivo */}
        {isDemo && (
          <div className="bg-gradient-to-r from-mjm-navy via-[#1e3e5f] to-mjm-navy text-white px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#f7931b]/40 shadow-sm text-xs">
             <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 relative">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f7931b] opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f7931b]"></span>
                </span>
                <span className="font-space font-bold text-[#f7931b] uppercase tracking-wider text-[11px]">Tour Interactivo MJM:</span>
                <span className="text-slate-200 hidden md:inline font-normal">Cargue su certificado de calibración en la sección estrella para experimentar el análisis automatizado.</span>
             </div>
             <Link 
               to="/dashboard/ia-lab" 
               className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f7931b] hover:bg-orange-500 text-zinc-950 font-black text-[10px] uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer shrink-0 font-space"
             >
                <Sparkles size={12} />
                <span>Ir a Confirmación Metrológica</span>
             </Link>
          </div>
        )}

        {/* CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6 md:p-8 lg:p-10 pb-28 lg:pb-10 transition-colors duration-500">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
