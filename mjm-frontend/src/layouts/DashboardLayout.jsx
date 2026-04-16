import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, FileText, Kanban, LogOut, Settings,
  Menu, X, Package, Calendar, MessageSquare, ChevronRight, ShieldCheck, ClipboardCheck
} from 'lucide-react';

export default function DashboardLayout() {
  const { tenant, user, logout, isSuperAdmin, setSuperAdmin } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // MJM Branding Assets
  const mjmLogo = "https://placehold.co/200x60/050b14/white?text=MJM+METROLOGIA";
  const mjmName = "MJM Metrología";
  const mjmColor = "#234c74";
  const mjmSecondary = "#f7931b";

  // Dynamic Branding Calculation
  const displayLogo = isSuperAdmin ? mjmLogo : (tenant?.logo_url || "https://via.placeholder.com/150");
  const displayName = isSuperAdmin ? mjmName : (tenant?.nombre_empresa || "Cliente MJM");
  const mainColor = isSuperAdmin ? mjmColor : (tenant?.color_institucional_principal || "#234c74");
  const secondaryColor = isSuperAdmin ? mjmSecondary : (tenant?.color_institucional_secundario || "#f7931b");

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Módulos de Aseguramiento Metrológico
  const navItems = [
    { name: 'Dashboard KPIs', path: '/dashboard', exact: true, icon: <LayoutDashboard size={18} /> },
    { name: 'Inventario', path: '/dashboard/inventario', icon: <Package size={18} /> },
    { name: 'Planificador', path: '/dashboard/calendario', icon: <Calendar size={18} /> },
    { name: 'Tablero Kanban', path: '/dashboard/kanban', icon: <Kanban size={18} /> },
    { name: 'Comprobación Metrológica', path: '/dashboard/aseguramiento', icon: <ClipboardCheck size={18} /> },
  ];

  const secondaryItems = [
    { name: 'Solicitudes', path: '/dashboard/solicitudes', icon: <MessageSquare size={18} /> },
  ];

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  if (!tenant) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800 relative">

      {/* OVERLAY para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-[#050b14] text-gray-300 flex flex-col shadow-2xl z-40 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo del cliente */}
        <div className="h-16 flex items-center justify-center p-4 border-b border-white/10 bg-white/5">
          <img 
            src={displayLogo} 
            alt={displayName} 
            className="h-8 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="hidden text-white font-black text-xs tracking-widest uppercase">
            {displayName}
          </div>
        </div>

        {/* Nav Principal */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Aseguramiento</p>
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${active ? 'text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                style={active ? { backgroundColor: mainColor } : {}}
              >
                {item.icon}
                <span className="flex-1">{item.name}</span>
                {active && <ChevronRight size={14} className="opacity-60" />}
              </Link>
            );
          })}

          <div className="pt-4">
            <p className="px-3 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Gestión</p>
            {secondaryItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.name} to={item.path} onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${active ? 'text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                  style={active ? { backgroundColor: mainColor } : {}}>
                  {item.icon}<span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer del Sidebar */}
        <div className="border-t border-white/10">
          <Link to="/dashboard/settings" onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all ${isActive('/dashboard/settings') ? 'text-white bg-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            <Settings size={18} /> Configuración
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-red-400 hover:bg-red-400/10 transition-colors text-sm font-semibold">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>

        {/* Sello MJM */}
        <div className="py-5 flex flex-col items-center opacity-30 hover:opacity-100 transition-opacity duration-500">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">TECNOLOGÍA MJM V2.0</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Header */}
        <header
          className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 border-b-[3px] relative z-20 shrink-0"
          style={{ borderColor: mainColor }}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-600">
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h2 className="text-base font-black text-gray-900 leading-tight">{displayName}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Sistema de Aseguramiento Metrológico</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Switch de Súper Admin */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
               <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Acceso Total</span>
               <button 
                onClick={() => setSuperAdmin(!isSuperAdmin)}
                className={`w-10 h-5 rounded-full transition-all relative ${isSuperAdmin ? 'bg-mjm-orange shadow-inner shadow-orange-900/20' : 'bg-gray-200'}`}
               >
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isSuperAdmin ? 'left-6' : 'left-1'}`} />
               </button>
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
               <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: mainColor }}>
                 {isSuperAdmin ? '🔥 SÚPER ADMIN' : user?.rol}
               </p>
            </div>
             <div className="w-9 h-9 rounded-full text-white flex items-center justify-center font-black text-sm"
               style={{ backgroundColor: mainColor }}>
                {displayName?.substring(0, 1)}
             </div>
          </div>
        </header>

        {/* Contenido */}
         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50"
           style={{ '--tenant-main': mainColor, '--tenant-sec': secondaryColor }}>
          <div className="w-full h-full flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
