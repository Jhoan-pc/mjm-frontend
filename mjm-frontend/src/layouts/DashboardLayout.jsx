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
  Sparkles,
  Building
} from 'lucide-react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import mjmLogo from '../assets/mjm-logo-main.jpg';

export default function DashboardLayout() {
  const { user, tenant, logout, isDarkMode, toggleDarkMode, isDemoMode, isSuperAdmin, allTenants, switchTenant } = useAuthStore();
  const { activities, loadActivities } = useInventoryStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mjm_desktop_sidebar');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(prev => !prev);
    } else {
      setIsDesktopSidebarOpen(prev => {
        const next = !prev;
        localStorage.setItem('mjm_desktop_sidebar', String(next));
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 310);
        return next;
      });
    }
  };
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
      if (tenant?.id === 'sandboxdemo' || tenant?.id === 'deltapruebas-sandbox') {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        try {
          const tDoc = await getDoc(doc(db, 'tenants', tenant.id));
          if (tDoc.exists()) {
             useAuthStore.setState({ tenant: { id: tDoc.id, ...tDoc.data() } });
          }
        } catch (_) {}
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
    ...(isSuperAdmin ? [{ name: 'Ajustes & CRM', path: '/dashboard/settings', icon: <SettingsIcon size={19} /> }] : [])
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

      {/* --- SIDEBAR (Desktop) --- */}
      <aside 
        className={`hidden lg:flex flex-col bg-[var(--sidebar-bg)] text-white flex-shrink-0 z-40 transition-all duration-300 ease-in-out overflow-hidden ${
          isDesktopSidebarOpen 
            ? 'w-64 border-r border-white/10 opacity-100' 
            : 'w-0 border-r-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-64 flex flex-col h-full flex-shrink-0">
          <div className="p-4 mb-1 border-b border-white/10">
            {/* BRANDING DEL TENANT */}
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-white/10 shadow-xs shrink-0">
                  <img 
                    src={tenant?.logo_url || mjmLogo} 
                    alt="Logo" 
                    className="w-full h-full object-contain p-0.5" 
                  />
               </div>
               <div className="flex-1 min-w-0">
                  <h1 className="font-space font-bold text-white text-[11px] tracking-tight uppercase leading-none truncate">
                    {tenant?.nombre_empresa || 'MJM Plataforma'}
                  </h1>
                  <p className="text-[7.5px] text-[#f7931b] font-mono font-medium uppercase tracking-widest mt-0.5">
                    ISO 10012 Metrología
                  </p>
               </div>
            </div>
          </div>

          <nav className="flex-1 px-2.5 space-y-0.5 font-inter mt-1">
            {navItems.map((item) => {
              const isIALab = item.path === '/dashboard/ia-lab';
              const isDemoTarget = isDemo && isIALab;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group text-[11.5px] ${
                    active
                      ? 'bg-white/10 text-white font-semibold border-l-2 border-[#f7931b] shadow-xs'
                      : isDemoTarget
                        ? 'border border-[#f7931b]/60 bg-[#f7931b]/15 text-white font-semibold shadow-[0_0_12px_rgba(247,147,27,0.2)]'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                  }`}
                >
                  <span className={`transition-transform duration-150 shrink-0 ${active || isDemoTarget ? 'text-[#f7931b]' : 'text-slate-400 group-hover:text-white'}`}>
                    {React.cloneElement(item.icon, { size: 16 })}
                  </span>
                  <span className="tracking-tight truncate">{item.name}</span>
                  {isDemoTarget ? (
                    <span className="ml-auto px-1.5 py-0.5 rounded bg-[#f7931b] text-zinc-950 text-[8px] font-black tracking-wider uppercase flex items-center gap-1 shadow-xs animate-pulse">
                      <Sparkles size={8} /> PROBAR
                    </span>
                  ) : active ? (
                    <ChevronRight size={11} className="ml-auto text-[#f7931b] shrink-0" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* --- FOOTER BRANDING --- */}
          <div className="mt-auto pb-4 px-3 flex flex-col items-center border-t border-white/5 pt-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-300 hover:text-red-400 active:scale-95 transition-all group cursor-pointer rounded-lg hover:bg-white/5"
              >
                <LogOut size={13} className="opacity-70 group-hover:opacity-100 transition-all" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Cerrar Sesión</span>
              </button>

             <p className="text-[8px] text-white/20 font-mono uppercase tracking-widest mt-1 select-none pointer-events-none">
                MJM Engine v2.4
             </p>
          </div>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR COMPACTO Y ELEGANTE (52px) */}
        <header className="h-13 bg-[var(--surface)] border-b border-[var(--outline-color)] flex items-center justify-between px-4 sm:px-6 transition-colors duration-300 shrink-0">
           <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              {/* BOTÓN HAMBURGUESA PARA ESCOGER SI VER O NO EL SIDEBAR */}
              <button 
                onClick={toggleSidebar}
                className="p-1.5 text-[var(--text-main)] hover:bg-[var(--surface-alt)] hover:text-[#f7931b] rounded-lg transition-all border border-[var(--outline-color)]/60 hover:border-[var(--outline-color)] shadow-xs flex items-center justify-center group cursor-pointer shrink-0"
                title={isDesktopSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
                aria-label="Alternar menú lateral"
              >
                 <Menu size={16} className="group-hover:scale-105 transition-transform" />
              </button>
              <div className="hidden md:flex items-center gap-1.5 text-[var(--text-muted)] text-[10.5px] font-inter font-medium uppercase tracking-wider truncate">
                 <span>Gestión Metrológica</span>
                 <ChevronRight size={9} className="opacity-40 shrink-0" />
                 <span className="text-mjm-navy dark:text-[#f7931b] font-bold truncate">
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

           <div className="flex items-center gap-2 sm:gap-3">

              {/* TENANT SWITCHER (EXCLUSIVO SUPERADMIN) */}
              {isSuperAdmin && allTenants && allTenants.length > 0 && (
                <div className="flex items-center gap-1.5 bg-[var(--background)] px-2.5 py-1 rounded-lg border border-[var(--outline-color)] shadow-xs">
                  <Building size={12} className="text-[#f7931b] shrink-0" />
                  <span className="text-[9px] font-mono font-bold uppercase text-[var(--text-muted)] hidden xl:inline">Empresa:</span>
                  <select
                    value={tenant?.id || ''}
                    onChange={(e) => switchTenant(e.target.value)}
                    className="bg-transparent text-[11px] font-bold text-[var(--text-main)] outline-none cursor-pointer pr-1 max-w-[120px] sm:max-w-[170px] truncate"
                  >
                    {allTenants.map((t) => (
                      <option key={t.id} value={t.id} className="bg-white dark:bg-[#070C18] text-slate-900 dark:text-white">
                        {t.nombre_empresa} {(t.id === 'sandboxdemo' || t.id === 'deltapruebas-sandbox') ? '(Demo)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* BADGE DE ROL / MODO */}
              <div className="hidden sm:flex shrink-0">
                {isDemo ? (
                  <span className="px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider bg-orange-500/10 text-[#f7931b] border border-[#f7931b]/30 flex items-center gap-1 shadow-xs animate-pulse">
                    <Sparkles size={9} /> Demo Sandbox
                  </span>
                ) : isSuperAdmin ? (
                  <span className="px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1 shadow-xs">
                    <ShieldCheck size={9} /> SuperAdmin MJM
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Cliente Corporativo
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 bg-[var(--background)] p-0.5 rounded-lg border border-[var(--outline-color)]">
                 <button 
                  onClick={toggleDarkMode}
                  className="p-1.5 rounded-md transition-all hover:bg-[var(--surface-alt)] text-[var(--text-main)]"
                  title="Modo Oscuro / Claro"
                 >
                    {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                 </button>
                 <button 
                   onClick={() => setShowNotifications(!showNotifications)}
                   className="p-1.5 rounded-md transition-all hover:bg-[var(--surface-alt)] text-[var(--text-main)] relative"
                   title="Notificaciones y Alertas"
                 >
                    <Bell size={14} />
                    {hasAlerts && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-[var(--background)] animate-pulse" />}
                 </button>
              </div>

              {/* NOTIFICATIONS POPOVER - GLASSMORPHISM EN AZUL PROFUNDO */}
              {showNotifications && (
                <div className="absolute top-16 right-4 sm:right-8 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Backdrop para cerrar al hacer clic afuera */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  />
                  
                  {/* Tarjeta Glassmorphism Azul */}
                  <div className="relative z-50 rounded-2xl p-5 text-white backdrop-blur-2xl border border-sky-400/30 shadow-[0_20px_50px_rgba(10,25,47,0.85),0_0_30px_rgba(56,189,248,0.2)] overflow-hidden bg-gradient-to-b from-[#14284b]/95 via-[#0d1d36]/95 to-[#091528]/95 before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.2),_transparent_70%)] before:pointer-events-none">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 border-b border-sky-400/20 pb-3 relative">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                          <AlertCircle size={15} />
                        </div>
                        <div>
                          <h4 className="font-space font-bold text-xs uppercase tracking-wider text-white">
                            Alertas Críticas
                          </h4>
                          <p className="text-[9px] font-inter text-sky-300/70 font-medium">
                            Estado del Plan Metrológico
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowNotifications(false)} 
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                        title="Cerrar"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Filas de Estados */}
                    <div className="space-y-2.5 font-inter relative">
                      
                      {/* Vencimientos */}
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${stats.vencidos > 0 ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse' : 'bg-slate-500'}`} />
                          <span className="text-xs font-medium text-slate-200">Vencimientos</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                          stats.vencidos > 0 
                            ? 'bg-red-500/25 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse' 
                            : 'bg-white/10 text-slate-400 border border-white/10'
                        }`}>
                          {String(stats.vencidos).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Programados Hoy */}
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${stats.hoy > 0 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-slate-500'}`} />
                          <span className="text-xs font-medium text-slate-200">Programados Hoy</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                          stats.hoy > 0 
                            ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                            : 'bg-white/10 text-slate-400 border border-white/10'
                        }`}>
                          {String(stats.hoy).padStart(2, '0')}
                        </span>
                      </div>

                      {/* En Proceso */}
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${stats.enProceso > 0 ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-slate-500'}`} />
                          <span className="text-xs font-medium text-slate-200">En Proceso</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                          stats.enProceso > 0 
                            ? 'bg-sky-500/25 text-sky-300 border border-sky-500/50 shadow-[0_0_10px_rgba(56,189,248,0.3)]' 
                            : 'bg-white/10 text-slate-400 border border-white/10'
                        }`}>
                          {String(stats.enProceso).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Footer Shortcut */}
                    <div className="mt-3.5 pt-3 border-t border-sky-400/20 flex items-center justify-between relative">
                      <Link 
                        to="/dashboard/kanban" 
                        onClick={() => setShowNotifications(false)}
                        className="w-full flex items-center justify-between text-[11px] font-space font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 transition-colors group p-1"
                      >
                        <span className="flex items-center gap-1.5">
                          Ver Gestión Operativa
                        </span>
                        <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                  </div>
                </div>
              )}

              {/* PERFIL DE USUARIO */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-white/10 group cursor-default">
                 <div className="flex flex-col items-end transition-all">
                    <p className={`text-[11px] font-inter font-semibold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                       {user?.nombre || 'Administrador MJM'}
                    </p>
                    <p className={`text-[8.5px] font-mono font-medium uppercase tracking-wider transition-all ${isDarkMode ? 'text-[#f7931b]' : 'text-slate-500'}`}>
                       {tenant?.nombre_empresa || 'DeltaSandbox'}
                    </p>
                 </div>
                 <div className="w-7 h-7 rounded-lg bg-mjm-navy text-white dark:bg-[#f7931b] dark:text-slate-950 flex items-center justify-center font-space font-bold text-[10px] shadow-xs transition-shadow shrink-0">
                    {user?.nombre ? user.nombre.substring(0, 2).toUpperCase() : 'MJ'}
                 </div>
              </div>
           </div>
        </header>

        {/* Banner de Modo Demostración Interactivo */}
        {isDemo && (
          <div className="bg-gradient-to-r from-mjm-navy via-[#1e3e5f] to-mjm-navy text-white px-4 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-[#f7931b]/30 shadow-xs text-xs shrink-0">
             <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 relative">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f7931b] opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f7931b]"></span>
                </span>
                <span className="font-space font-bold text-[#f7931b] uppercase tracking-wider text-[10px]">Tour Interactivo MJM:</span>
                <span className="text-slate-300 hidden md:inline text-[11px]">Cargue su certificado de calibración en la sección estrella para experimentar el análisis automatizado.</span>
             </div>
             <Link 
               to="/dashboard/ia-lab" 
               className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f7931b] hover:bg-orange-500 text-zinc-950 font-bold text-[9px] uppercase tracking-wider rounded-md shadow-xs transition-all cursor-pointer shrink-0 font-space"
             >
                <Sparkles size={11} />
                <span>Ir a Confirmación Metrológica</span>
             </Link>
          </div>
        )}

        {/* CONTENIDO SCROLLABLE DE ALTA DENSIDAD */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-3.5 sm:p-5 lg:p-6 pb-20 lg:pb-6 transition-colors duration-300">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
