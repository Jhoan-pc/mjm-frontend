import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, FileText, Kanban, LogOut, Settings, Menu, X, ShieldCheck, MessageSquare } from 'lucide-react';

export default function DashboardLayout() {
  const { tenant, user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard KPIs', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventario Equipos', path: '/dashboard/inventory', icon: <FileText size={20} /> },
    { name: 'Planificador', path: '/dashboard/planner', icon: <Kanban size={20} /> },
    { name: 'Solicitudes Chatbot', path: '/dashboard/solicitudes', icon: <MessageSquare size={20} /> }
  ];

  if (!tenant) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800 relative">
      
      {/* OVERLAY for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR: Estilo industrial, neutro pero adaptado al tenant */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-gray-900 text-gray-300 flex flex-col shadow-2xl z-40 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
          <Link 
            to="/dashboard/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all hover:bg-white/10 ${location.pathname.startsWith('/dashboard/settings') ? 'bg-white/10 text-white shadow-md' : 'text-gray-300'}`}
          >
            <Settings size={20} />
            Configuración
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors font-medium cursor-pointer"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>

        {/* MJM Platform Ownership Badge (Sidebar Bottom) */}
        <div className="mt-auto p-10 flex flex-col items-center">
            <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity duration-500">
               <span className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 mb-2 text-center">Tecnología de</span>
               <span className="text-[12px] font-black text-white uppercase tracking-tighter">Asesorías Integrales MJM</span>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Dynamic Theme Banner / Topbar */}
        <header 
          className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 border-b-4 relative z-20"
          style={{ borderColor: tenant.color_institucional_principal }}
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-600"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">Panel de Control: <span className="hidden xs:inline">{tenant.nombre_empresa}</span></h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] font-black text-mjm-orange uppercase tracking-widest">Asesorías Integrales MJM</span>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <p className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-[0.2em]">Sistema de Aseguramiento Metrológico</p>
                </div>
            </div>
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
          className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8"
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
