import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, FileText, Trello, LogOut, Settings } from 'lucide-react';

export default function DashboardLayout() {
  const { tenant, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard KPIs', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Hojas de Vida', path: '/dashboard/hojas-de-vida', icon: <FileText size={20} /> },
    { name: 'Plan de Mantenimiento', path: '/dashboard/kanban', icon: <Trello size={20} /> }
  ];

  if (!tenant) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      
      {/* SIDEBAR: Estilo industrial, neutro pero adaptado al tenant */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col shadow-2xl relative z-20">
        <div className="h-20 flex items-center justify-center p-4 border-b border-gray-800 bg-white">
          {/* Logo del Tenant */}
          <img src={tenant.logo_url} alt={tenant.nombre_empresa} className="h-10 object-contain" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Gestión Metrológica</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const activeStyle = isActive 
                ? { backgroundColor: tenant.color_institucional_principal, color: 'white' } 
                : {};
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all hover:bg-white/10 ${isActive ? 'shadow-md shadow-[var(--tenant-main)/30]' : ''}`}
                style={activeStyle}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg cursor-pointer">
            <Settings size={20} />
            Configuración
          </div>
          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors font-medium cursor-pointer"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Dynamic Theme Banner / Topbar */}
        <header 
          className="h-20 bg-white shadow-sm flex items-center justify-between px-8 border-b-4"
          style={{ borderColor: tenant.color_institucional_principal }}
        >
          <div>
            <h2 className="text-xl font-bold text-gray-800">Panel de Control: {tenant.nombre_empresa}</h2>
            <p className="text-sm text-gray-500">MJM - Sistema de Aseguramiento Metrológico</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
              <p className="text-xs text-mjm-orange font-bold uppercase">{user?.rol}</p>
            </div>
            <div 
              className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold"
              style={{ backgroundColor: tenant.color_institucional_principal }}
            >
              {tenant.nombre_empresa.substring(0, 1)}
            </div>
          </div>
        </header>

        {/* Global CSS variables para los hijos (Tenant UI Theme) */}
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8"
          style={{
            '--tenant-main': tenant.color_institucional_principal,
            '--tenant-sec': tenant.color_institucional_secundario
          }}
        >
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
