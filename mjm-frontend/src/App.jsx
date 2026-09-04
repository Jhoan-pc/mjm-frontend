import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import { useAuthStore } from './store/authStore';

// Carga Diferida (Code Splitting): La landing page no descarga módulos administrativos ni Recharts
const Login = lazy(() => import('./pages/Login'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardKPIs = lazy(() => import('./pages/dashboard/DashboardKPIs'));
const Inventario = lazy(() => import('./pages/dashboard/Inventario'));
const HojaDeVida = lazy(() => import('./pages/dashboard/HojaDeVida'));
const Calendario = lazy(() => import('./pages/dashboard/Calendario'));
const KanbanMetrologico = lazy(() => import('./pages/dashboard/KanbanMetrologico'));
const AsegMetrologico = lazy(() => import('./pages/dashboard/AsegMetrologico'));
const ChatbotSubmissions = lazy(() => import('./pages/dashboard/ChatbotSubmissions'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const IAVerificationLab = lazy(() => import('./pages/dashboard/IAVerificationLab'));
const HojaDeVidaPrint = lazy(() => import('./pages/dashboard/HojaDeVidaPrint'));
const Cotizador = lazy(() => import('./pages/dashboard/Cotizador'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center gap-4">
    <div className="w-10 h-10 border-4 border-[#EE8C2C] border-t-transparent rounded-full animate-spin" />
    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Cargando módulo...</p>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  // ⏳ Esperar a que Firebase confirme la sesión antes de redirigir
  if (loading) {
    return <PageLoader />;
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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="ia-lab" element={<IAVerificationLab />} />
            <Route path="cotizador" element={<Cotizador />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Ruta de Impresión de Hoja de Vida - FUERA DEL LAYOUT DE DASHBOARD */}
          <Route 
            path="/dashboard/inventario/imprimir/:id" 
            element={
              <PrivateRoute>
                <HojaDeVidaPrint />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
