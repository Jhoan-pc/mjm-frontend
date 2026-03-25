import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, FileText, Kanban, LogOut, Settings,
  Menu, X, Package, Calendar, MessageSquare, ChevronRight
} from 'lucide-react';

export default function DashboardLayout() {
  const { tenant, user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
          <img src={tenant.logo_url} alt={tenant.nombre_empresa} className="h-8 object-contain" />
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
                style={active ? { backgroundColor: tenant.color_institucional_principal } : {}}
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
                  style={active ? { backgroundColor: tenant.color_institucional_principal } : {}}>
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
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">Tecnología de</span>
          <span className="text-[11px] font-black text-white uppercase tracking-tighter mt-1">Asesorías Integrales MJM</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Header */}
        <header
          className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 border-b-[3px] relative z-20 shrink-0"
          style={{ borderColor: tenant.color_institucional_principal }}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-600">
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h2 className="text-base font-black text-gray-900 leading-tight">{tenant.nombre_empresa}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: tenant.color_institucional_principal }}>
                  Asesorías Integrales MJM
                </span>
                <div className="w-px h-3 bg-gray-200"></div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Sistema de Aseguramiento Metrológico</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: tenant.color_institucional_principal }}>{user?.rol}</p>
            </div>
            <div className="w-9 h-9 rounded-full text-white flex items-center justify-center font-black text-sm"
              style={{ backgroundColor: tenant.color_institucional_principal }}>
              {tenant.nombre_empresa?.substring(0, 1)}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6"
          style={{ '--tenant-main': tenant.color_institucional_principal, '--tenant-sec': tenant.color_institucional_secundario }}>
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
