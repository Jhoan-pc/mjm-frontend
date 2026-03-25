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
import ChatbotSubmissions from './pages/dashboard/ChatbotSubmissions';
import Settings from './pages/dashboard/Settings';
import { useAuthStore } from './store/authStore';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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

          {/* Otros módulos */}
          <Route path="solicitudes" element={<ChatbotSubmissions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
