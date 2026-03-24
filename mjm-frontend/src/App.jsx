import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardKPIs from './pages/dashboard/DashboardKPIs';
import HojasDeVida from './pages/dashboard/HojasDeVida';
import KanbanMantenimiento from './pages/dashboard/KanbanMantenimiento';
import { useAuthStore } from './store/authStore';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Private Dashboard Routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<DashboardKPIs />} />
          <Route path="hojas-de-vida" element={<HojasDeVida />} />
          <Route path="kanban" element={<KanbanMantenimiento />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
