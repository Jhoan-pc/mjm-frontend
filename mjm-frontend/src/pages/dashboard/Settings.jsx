import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings as SettingsIcon, Map, Layout, Sliders, ChevronRight, Globe, FileText, Database,
  ShieldCheck, Building, Users, Check, MapPin, X, Loader2, Mail, Phone, Calendar as CalendarIcon, ExternalLink, Wrench,
  Terminal, Globe2, Briefcase, Lock, Fingerprint, Palette, TerminalSquare, Plus, Key, Eye, EyeOff, DollarSign, Power, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStore } from '../../store/contentStore';
import HierarchyTree from '../../components/HierarchyTree';
import { collection, addDoc, serverTimestamp, getDocs, getDoc, query, where, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import Cotizador from './Cotizador';
import { useInventoryStore } from '../../store/inventoryStore';

// ─── Componentes de Sección ─────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-12 h-12 rounded-2xl bg-mjm-navy/5 flex items-center justify-center text-mjm-navy">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-xl font-black text-mjm-navy uppercase tracking-tighter">{title}</h3>
      <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
    </div>
  </div>
);

const BrandingConfig = () => {
  const { landing, updateLandingContent } = useContentStore();
  const [heroTitle, setHeroTitle] = useState((landing && landing.hero && landing.hero.title) || 'MJM Metrología');
  const [heroSubtitle, setHeroSubtitle] = useState((landing && landing.hero && landing.hero.subtitle) || 'Aseguramiento de Calidad');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateLandingContent({ hero: { title: heroTitle, subtitle: heroSubtitle } });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader 
        title="Personalización Visual" 
        subtitle="Gestione la identidad visual y mensajes del portal público."
        icon={Palette}
      />
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Título Principal (Hero)</label>
            <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-mjm-orange/20 outline-none transition-all font-bold text-mjm-navy text-lg" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Subtítulo de Soporte</label>
            <textarea rows={4} value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-mjm-orange/20 outline-none transition-all text-sm font-medium leading-relaxed" />
          </div>
          <button onClick={handleSave} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-mjm-navy text-white hover:bg-mjm-orange shadow-xl shadow-mjm-navy/10'}`}>
            {saved ? <><Check size={16} /> Cambios Aplicados</> : 'Actualizar Portal'}
          </button>
      </div>
    </div>
  );
};

const PlatformRules = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
    <SectionHeader 
      title="Reglas de Negocio" 
      subtitle="Defina los parámetros operativos y técnicos globales."
      icon={Sliders}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { name: "Intervalos de Calibración", icon: <CalendarIcon size={18} />, desc: "Estándares por tipo de instrumento." },
        { name: "Alertas Tempranas", icon: <ShieldCheck size={18} />, desc: "Días de antelación para notificaciones." },
        { name: "Formatos ISO/IEC", icon: <FileText size={18} />, desc: "Gestión de plantillas y firmas." },
        { name: "Base de Datos", icon: <Database size={18} />, desc: "Optimización y limpieza de registros." }
      ].map((item, idx) => (
        <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-mjm-orange/30 transition-all cursor-pointer group flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-mjm-navy group-hover:bg-mjm-orange group-hover:text-white transition-colors">
            {item.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-black text-mjm-navy text-xs uppercase tracking-widest">{item.name}</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
          </div>
          <ChevronRight size={16} className="text-gray-200 group-hover:text-mjm-orange group-hover:translate-x-1 transition-all" />
        </div>
      ))}
    </div>
  </div>
);

const GeographicView = () => {
  const { instruments, loadInstruments } = useInventoryStore();
  const { tenant } = useAuthStore();

  useEffect(() => {
    if (tenant?.id) {
      const unsubscribe = loadInstruments(tenant.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [tenant?.id, loadInstruments]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 font-sans">
      <SectionHeader 
        title="Estructura Geográfica" 
        subtitle="Jerarquía organizacional de activos y ubicaciones."
        icon={Globe2}
      />
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <HierarchyTree instruments={instruments} />
      </div>
    </div>
  );
};

// ─── CONTROL CRM TENANTS & USUARIOS & PLAN DE PAGOS (SOCIO / MJM PARTNERSHIP) ───
const CRMAdminView = () => {
  const { tenant } = useAuthStore();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  // Formulario de Usuario nuevo
  const [userForm, setUserForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'cliente_planta', 
    plantaAsignada: '',
    seccionAsignada: ''
  });
  const [userSaving, setUserSaving] = useState(false);

  // Formulario de Pago / Suscripción
  const [payForm, setPayForm] = useState({
    montoTotal: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  });
  const [paySaving, setPaySaving] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      let list = [];
      try {
        const snap = await getDocs(collection(db, 'tenants'));
        list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Fallo al listar todos los tenants (permisos). Cargando tenant actual:", err);
        if (tenant && tenant.id) {
          const docSnap = await getDoc(doc(db, 'tenants', tenant.id));
          if (docSnap.exists()) {
            list = [{ id: docSnap.id, ...docSnap.data() }];
          }
        }
      }
      setTenants(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.password || !userForm.nombre) {
      alert("Por favor complete todos los datos");
      return;
    }
    setUserSaving(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, userForm.email, userForm.password);
      const uid = credential.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        nombre: userForm.nombre,
        email: userForm.email,
        tenantId: selectedTenant.id,
        rol: userForm.rol,
        planta: userForm.plantaAsignada || null,
        seccion: userForm.seccionAsignada || null,
        createdAt: serverTimestamp()
      });

      alert("Usuario registrado y vinculado exitosamente");
      setShowUserModal(false);
      setUserForm({ nombre: '', email: '', password: '', rol: 'cliente_planta', plantaAsignada: '', seccionAsignada: '' });
    } catch (error) {
      console.error(error);
      alert(`Error al crear usuario: ${error.message}`);
    } finally {
      setUserSaving(false);
    }
  };

  // Guardar suscripción y actualizar contador (50/50 socio-MJM)
  const handleUpdateSubscription = async () => {
    if (!payForm.montoTotal) {
      alert("Por favor ingrese el monto cobrado");
      return;
    }
    setPaySaving(true);
    try {
      const val = Number(payForm.montoTotal);
      const socioMonto = val * 0.50; // Reparto del 50% para el socio

      await updateDoc(doc(db, 'tenants', selectedTenant.id), {
        suscripcion_activa: true,
        suscripcion_monto: val,
        suscripcion_socio_monto: socioMonto, // 50% de ganancia de desarrollo
        suscripcion_inicio: payForm.fechaInicio,
        suscripcion_fin: payForm.fechaFin,
        updatedAt: serverTimestamp()
      });

      alert("Plan de suscripción actualizado. Monto del 50% registrado en el contador.");
      setShowPayModal(false);
      fetchTenants();
    } catch (e) {
      console.error(e);
      alert("Error al actualizar la suscripción");
    } finally {
      setPaySaving(false);
    }
  };

  // Encender o Apagar un Tenant (Bloqueo de Cuenta por falta de pago)
  const toggleTenantStatus = async (tenantItem) => {
    const nextStatus = !tenantItem.suscripcion_activa;
    const msg = nextStatus 
      ? `¿Estás seguro de reactivar al cliente ${tenantItem.nombre_empresa}?`
      : `⚠️ ADVERTENCIA: ¿Estás seguro de APAGAR/SUSPENDER la cuenta de ${tenantItem.nombre_empresa} por falta de pago? Se bloqueará su acceso a la plataforma.`;

    if (!window.confirm(msg)) return;

    try {
      await updateDoc(doc(db, 'tenants', tenantItem.id), {
        suscripcion_activa: nextStatus
      });
      alert(`Cliente ${nextStatus ? 'ACTIVADO' : 'SUSPENDIDO'} exitosamente.`);
      fetchTenants();
    } catch (e) {
      console.error(e);
      alert("Error al cambiar el estado del cliente");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 font-sans">
      <SectionHeader 
        title="CRM & Control Total Multi-tenant" 
        subtitle="Administre el acceso de cada cliente y el balance de ganancias compartidas (50/50)."
        icon={Briefcase}
      />

      {/* BALANCE PANEL GENERAL (SOCIO / DESARROLLO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#050b14] text-white p-6 rounded-3xl flex flex-col justify-between shadow-xl">
          <div>
             <p className="text-[9px] font-black uppercase text-mjm-orange tracking-[0.2em] mb-1">Monto Total de Licenciamiento</p>
             <h3 className="text-3xl font-black italic tracking-tighter">
               {formatCurrency(tenants.reduce((acc, curr) => acc + (curr.suscripcion_monto || 0), 0))}
             </h3>
          </div>
          <p className="text-[8px] opacity-40 uppercase tracking-widest mt-4">Ingresos Globales Cobrados</p>
        </div>
        <div className="bg-emerald-950 text-emerald-300 border border-emerald-900/30 p-6 rounded-3xl flex flex-col justify-between shadow-xl">
          <div>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">Contador Mi Cuenta (Socio 50%)</p>
             <h3 className="text-3xl font-black italic tracking-tighter">
               {formatCurrency(tenants.reduce((acc, curr) => acc + (curr.suscripcion_socio_monto || 0), 0))}
             </h3>
          </div>
          <p className="text-[8px] opacity-60 uppercase tracking-widest mt-4">Tus utilidades por desarrollo</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-3xl flex flex-col justify-between shadow-sm">
          <div>
             <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Clientes Activos / Suspendidos</p>
             <h3 className="text-3xl font-black tracking-tighter text-mjm-navy">
               {tenants.filter(t => t.suscripcion_activa).length} <span className="text-slate-300 font-medium">/ {tenants.filter(t => !t.suscripcion_activa).length}</span>
             </h3>
          </div>
          <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-4">Capacidad de encendido y apagado</p>
        </div>
      </div>

      {/* TABLA DE CLIENTES CON CONTROL REMOTO (ENCENDIDO/APAGADO) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-mjm-orange" size={32} />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cargando Clientes...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h4 className="font-black text-mjm-navy text-xs uppercase tracking-widest">Administrador de Cuentas</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="p-4">Cliente / NIT</th>
                    <th className="p-4">Suscripción Anual</th>
                    <th className="p-4">Comisión Socio (50%)</th>
                    <th className="p-4">Vence el</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {tenants.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {t.logo_url ? (
                            <img src={t.logo_url} alt="logo" className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-100 p-0.5" />
                          ) : (
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-black"><Building size={14}/></div>
                          )}
                          <div>
                            <span className="font-bold text-slate-800 uppercase block">{t.nombre_empresa}</span>
                            <span className="text-[9px] text-slate-400 block font-mono">NIT: {t.nit || 'Sin Registrar'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">{formatCurrency(t.suscripcion_monto)}</td>
                      <td className="p-4 font-mono font-black text-emerald-600 bg-emerald-50/30">{formatCurrency(t.suscripcion_socio_monto)}</td>
                      <td className="p-4 text-slate-500 font-mono">{t.suscripcion_fin || 'Sin Suscripción'}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                          t.suscripcion_activa 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.suscripcion_activa ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                          {t.suscripcion_activa ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => { setSelectedTenant(t); setShowUserModal(true); }}
                          className="px-3 py-2 bg-mjm-navy text-white text-[9px] font-black uppercase tracking-wider rounded-lg"
                        >
                          + Usuario
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedTenant(t);
                            setPayForm({
                              montoTotal: t.suscripcion_monto || '',
                              fechaInicio: t.suscripcion_inicio || new Date().toISOString().split('T')[0],
                              fechaFin: t.suscripcion_fin || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                            });
                            setShowPayModal(true);
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-mjm-orange hover:text-white text-slate-600 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                        >
                          Planes
                        </button>
                        <button 
                          onClick={() => toggleTenantStatus(t)}
                          className={`p-2 rounded-lg transition-all ${
                            t.suscripcion_activa 
                              ? 'text-red-500 hover:bg-red-50' 
                              : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={t.suscripcion_activa ? "Apagar Cuenta" : "Encender Cuenta"}
                        >
                          <Power size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR USUARIO */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-mjm-navy uppercase tracking-tighter">Vincular Usuario</h3>
                <p className="text-[9px] text-mjm-orange font-black uppercase tracking-widest mt-1">Tenant: {selectedTenant?.nombre_empresa}</p>
              </div>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Nombre Completo</label>
                <input 
                  type="text" 
                  value={userForm.nombre}
                  onChange={e => setUserForm({...userForm, nombre: e.target.value})}
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                  placeholder="Ej: Carlos Pérez"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={userForm.email}
                  onChange={e => setUserForm({...userForm, email: e.target.value})}
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                  placeholder="ejemplo@cliente.co"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Contraseña</label>
                <input 
                  type="password" 
                  value={userForm.password}
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Rol de Acceso</label>
                <select 
                  value={userForm.rol}
                  onChange={e => setUserForm({...userForm, rol: e.target.value})}
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold cursor-pointer"
                >
                  <option value="admin">Administrador General del Cliente</option>
                  <option value="cliente_planta">Operador de Planta</option>
                  <option value="cliente_seccion">Operador de Sección</option>
                </select>
              </div>

              {userForm.rol !== 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Nombre Planta</label>
                    <input 
                      type="text" 
                      value={userForm.plantaAsignada}
                      onChange={e => setUserForm({...userForm, plantaAsignada: e.target.value})}
                      placeholder="Ej: Planta Medellín"
                      className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Nombre Sección</label>
                    <input 
                      type="text" 
                      value={userForm.seccionAsignada}
                      onChange={e => setUserForm({...userForm, seccionAsignada: e.target.value})}
                      placeholder="Ej: Envasado"
                      className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowUserModal(false)} className="px-5 py-2 text-[10px] font-black uppercase text-gray-400">Cancelar</button>
              <button 
                disabled={userSaving}
                onClick={handleCreateUser} 
                className="px-8 py-3.5 bg-mjm-navy hover:bg-mjm-orange text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-mjm-navy/10 flex items-center gap-2"
              >
                {userSaving ? <Loader2 size={16} className="animate-spin" /> : 'Registrar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAR PLAN / SUSCRIPCIÓN */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-mjm-navy uppercase tracking-tighter">Plan de Suscripción</h3>
                <p className="text-[9px] text-mjm-orange font-black uppercase tracking-widest mt-1">{selectedTenant?.nombre_empresa}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Monto Cobrado (COP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    value={payForm.montoTotal}
                    onChange={e => setPayForm({...payForm, montoTotal: e.target.value})}
                    className="w-full pl-8 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                    placeholder="5000000"
                  />
                </div>
                <p className="text-[8px] text-slate-400 mt-1.5 uppercase font-bold tracking-widest">
                  Se calculará automáticamente el 50% ({payForm.montoTotal ? formatCurrency(Number(payForm.montoTotal) * 0.5) : '$0'}) para el contador de tu comisión.
                </p>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Fecha Inicio</label>
                <input 
                  type="date" 
                  value={payForm.fechaInicio}
                  onChange={e => setPayForm({...payForm, fechaInicio: e.target.value})}
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Fecha Vencimiento</label>
                <input 
                  type="date" 
                  value={payForm.fechaFin}
                  onChange={e => setPayForm({...payForm, fechaFin: e.target.value})}
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowPayModal(false)} className="px-5 py-2 text-[10px] font-black uppercase text-gray-400">Cancelar</button>
              <button 
                disabled={paySaving}
                onClick={handleUpdateSubscription} 
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/10 flex items-center gap-2"
              >
                {paySaving ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Suscripción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Settings Component ───────────────────────────────────────────────

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState('platform'); // 'platform' | 'organization' | 'clients' | 'security'
  const [activeSub, setActiveSub] = useState('rules');

  const categories = [
    { id: 'platform', name: 'Plataforma', icon: <TerminalSquare size={20} />, color: 'bg-blue-500' },
    { id: 'organization', name: 'Organización', icon: <Building size={20} />, color: 'bg-mjm-orange' },
    { id: 'clients', name: 'Cuentas / CRM', icon: <Briefcase size={20} />, color: 'bg-emerald-500' },
    { id: 'security', name: 'Seguridad', icon: <Lock size={20} />, color: 'bg-red-500' },
  ];

  const subMenus = {
    platform: [
      { id: 'rules', name: 'Parámetros Técnicos', icon: <Sliders size={14} />, component: <PlatformRules /> },
      { id: 'branding', name: 'Identidad Visual', icon: <Palette size={14} />, component: <BrandingConfig /> },
    ],
    organization: [
      { id: 'geo', name: 'Jerarquía Local', icon: <MapPin size={14} />, component: <GeographicView /> },
      { id: 'sites', name: 'Gestión de Sedes', icon: <Globe size={14} />, component: <div className="p-20 text-center opacity-30 font-black">Módulo en Desarrollo</div> },
    ],
    clients: [
      { id: 'crm', name: 'Clientes & Usuarios', icon: <Users size={14} />, component: <CRMAdminView /> },
      { id: 'cotizador', name: 'Cotizador de Servicios', icon: <Database size={14} />, component: <Cotizador /> }
    ]
  };

  return (
    <div className="h-full flex flex-col gap-8 font-sans">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-1">MJM Digital Core</p>
           <h1 className="font-black text-[var(--text-main)] text-4xl tracking-tighter uppercase">Ajustes <span className="text-[var(--primary)] italic">del Sistema</span></h1>
        </div>
        <div className="flex bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
           {categories.map(cat => (
             <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setActiveSub(Object.keys(subMenus[cat.id] || {})[0] || 'none'); }}
                className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all ${activeCategory === cat.id ? 'bg-white shadow-xl text-mjm-navy' : 'text-gray-400 hover:text-gray-600'}`}
             >
                {cat.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 flex-1 overflow-hidden">
        
        {/* Sidebar de Sub-Secciones */}
        <div className="w-full lg:w-64 flex flex-col gap-3">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 mb-2">Secciones Disponibles</p>
           {(subMenus[activeCategory] || []).map(sub => (
             <button
                key={sub.id}
                onClick={() => setActiveSub(sub.id)}
                className={`group flex items-center justify-between p-4 rounded-2xl transition-all border ${activeSub === sub.id ? 'bg-mjm-navy border-mjm-navy text-white shadow-xl shadow-mjm-navy/20' : 'bg-white border-gray-100 text-gray-500 hover:border-mjm-navy/30 hover:text-mjm-navy'}`}
             >
                <div className="flex items-center gap-3">
                   {sub.icon}
                   <span className="text-[10px] font-black uppercase tracking-widest">{sub.name}</span>
                </div>
                <ChevronRight size={14} className={`${activeSub === sub.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'} transition-all`} />
             </button>
           ))}
        </div>

        {/* Área de Contenido Principal */}
        <div className="flex-1 overflow-y-auto pr-4 -mr-4">
           {(subMenus[activeCategory] || []).find(s => s.id === activeSub)?.component || (
             <div className="p-20 text-center opacity-20 flex flex-col items-center gap-4">
               <Fingerprint size={64} />
               <p className="font-black uppercase tracking-widest text-xs">Módulo Restringido</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
