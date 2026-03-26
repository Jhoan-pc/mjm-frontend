import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardKPIs from './pages/dashboard/DashboardKPIs';
import Inventario from './pages/dashboard/Inventario';
import HojaDeVida from './pages/dashboard/HojaDeVida';
import Calendario from './pages/dashboard/Calendario';
import KanbanMetrologico from './pages/dashboard/KanbanMetrologico';
import AsegMetrologico from './pages/dashboard/AsegMetrologico';
import ChatbotSubmissions from './pages/dashboard/ChatbotSubmissions';
import Settings from './pages/dashboard/Settings';
import { useAuthStore } from './store/authStore';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  // ⏳ Esperar a que Firebase confirme la sesión antes de redirigir
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#EE8C2C] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Verificando sesión...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const tenant = useAuthStore((state) => state.tenant);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Inject Branding CSS Variables dynamically
  useEffect(() => {
    if (tenant) {
      const root = document.documentElement;
      root.style.setProperty('--color-mjm-navy', tenant.color_institucional_principal || '#234c74');
      root.style.setProperty('--color-mjm-orange', tenant.color_institucional_secundario || '#f7931b');
    }
  }, [tenant]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Private Dashboard Routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<DashboardKPIs />} />

          {/* Inventario y Hojas de Vida */}
          <Route path="inventario" element={<Inventario />} />
          <Route path="inventario/:id" element={<HojaDeVida />} />

          {/* Planificador */}
          <Route path="calendario" element={<Calendario />} />

          {/* Kanban Metrológico */}
          <Route path="kanban" element={<KanbanMetrologico />} />

          {/* Aseguramiento Metrológico */}
          <Route path="aseguramiento" element={<AsegMetrologico />} />

          {/* Otros módulos */}
          <Route path="solicitudes" element={<ChatbotSubmissions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
