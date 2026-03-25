import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardKPIs from './pages/dashboard/DashboardKPIs';
import Inventory from './pages/dashboard/Inventory';
import InstrumentDetails from './pages/dashboard/InstrumentDetails';
import Planner from './pages/dashboard/Planner';
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
          <Route path="inventory" element={<Inventory />} />
          <Route path="hoja-de-vida/:id" element={<InstrumentDetails />} />
          <Route path="planner" element={<Planner />} />
          <Route path="solicitudes" element={<ChatbotSubmissions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
