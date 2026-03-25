import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Map, 
  Layout, 
  Sliders, 
  ChevronRight, 
  Globe, 
  FileText, 
  Database,
  ShieldCheck,
  Building,
  Users,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStore } from '../../store/contentStore';

const GeographicConfig = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Configuración Geográfica</h3>
      <p className="text-sm text-gray-500">Gestione los países, ciudades y regiones activos en la plataforma.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h4 className="font-bold text-mjm-navy mb-4 flex items-center gap-2">
          <Globe size={18} className="text-mjm-orange" /> Países Operativos
        </h4>
        <ul className="space-y-2">
          {['Colombia', 'Ecuador', 'Perú'].map(country => (
            <li key={country} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">{country}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">Activo</span>
            </li>
          ))}
        </ul>
        <button className="mt-6 w-full py-2 bg-mjm-navy text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-mjm-orange transition-colors">
          Agregar País
        </button>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h4 className="font-bold text-mjm-navy mb-4 flex items-center gap-2">
          <Map size={18} className="text-mjm-orange" /> Sedes Principales
        </h4>
        <ul className="space-y-2">
          {['Bogotá D.C.', 'Medellín', 'Cali'].map(city => (
            <li key={city} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">{city}</span>
              <ChevronRight size={14} className="text-gray-300" />
            </li>
          ))}
        </ul>
        <button className="mt-6 w-full py-2 border-2 border-mjm-navy text-mjm-navy rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-mjm-navy hover:text-white transition-colors">
          Ver todas las Sedes
        </button>
      </div>
    </div>
  </div>
);

const LandingPageConfig = () => {
  const { landing, updateLandingContent } = useContentStore();
  const [heroTitle, setHeroTitle] = useState(landing.hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(landing.hero.subtitle);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateLandingContent({
      hero: {
        title: heroTitle,
        subtitle: heroSubtitle
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Configuración del Landing Page</h3>
        <p className="text-sm text-gray-500">Edite los textos y contenidos visuales de la página principal en tiempo real.</p>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h4 className="font-bold text-mjm-navy flex items-center gap-2">
            <Layout size={18} className="text-mjm-orange" /> Sección Hero (Principal)
          </h4>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Título de Impacto</label>
            <input 
              type="text" 
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-mjm-orange/20 focus:border-mjm-orange outline-none transition-all font-bold text-mjm-navy"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Subtítulo Descriptivo</label>
            <textarea 
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-mjm-orange/20 focus:border-mjm-orange outline-none transition-all text-sm"
            />
          </div>
          <div className="pt-4 flex items-center gap-4">
            <button 
              onClick={handleSave}
              className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
                saved ? 'bg-green-500 text-white' : 'bg-mjm-orange text-white hover:bg-orange-600 shadow-lg shadow-mjm-orange/20'
              }`}
            >
              {saved ? <><Check size={16} /> ¡Guardado!</> : 'Guardar Cambios'}
            </button>
            <button className="px-6 py-3 border border-gray-200 text-gray-500 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
              Vista Previa
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-mjm-navy mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
            <FileText size={16} /> Contenido de Servicios
          </h4>
          <p className="text-xs text-gray-500 mb-4">Administre los 6 servicios mostrados en el portafolio.</p>
          <button className="w-full py-2 bg-mjm-navy/5 text-mjm-navy rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-mjm-navy hover:text-white transition-all">
            Gestionar Portafolio
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-mjm-navy mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
            <Database size={16} /> Alianzas y Marcas
          </h4>
          <p className="text-xs text-gray-500 mb-4">Actualice los logos que aparecen en el carrusel de aliados.</p>
          <button className="w-full py-2 bg-mjm-navy/5 text-mjm-navy rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-mjm-navy hover:text-white transition-all">
            Actualizar Alianzas
          </button>
        </div>
      </div>
    </div>
  );
};

const PlatformParams = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Parametrización de la Plataforma</h3>
      <p className="text-sm text-gray-500">Configure los valores globales y reglas de negocio del sistema de aseguramiento.</p>
    </div>
    
    <div className="space-y-4">
      {[
        { name: "Intervalos de Calibración Sugeridos", icon: <Sliders size={18} />, desc: "Defina los tiempos estándar por tipo de instrumento." },
        { name: "Alertas de Vencimiento", icon: <ShieldCheck size={18} />, desc: "Configure con cuántos días de antelación se notificará a los clientes." },
        { name: "Plantillas de Certificados", icon: <FileText size={18} />, desc: "Gestione el diseño y campos obligatorios de los reportes PDF." }
      ].map((item, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-mjm-orange/30 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-mjm-navy group-hover:bg-mjm-orange group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-mjm-orange group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Settings = () => {
  const [activeSection, setActiveSection] = useState('system'); 
  const [activeTab, setActiveTab] = useState('geo'); 

  const menuItems = [
    { id: 'system', name: 'Administrador del Sistema', icon: <SettingsIcon size={20} />, active: true },
    { id: 'clients', name: 'Gestión de Clientes', icon: <Building size={20} />, active: false },
    { id: 'users', name: 'Usuarios y Permisos', icon: <Users size={20} />, active: false },
  ];

  const systemTabs = [
    { id: 'geo', name: 'Configuración Geográfica', icon: <Globe size={16} /> },
    { id: 'landing', name: 'Landing Page', icon: <Layout size={16} /> },
    { id: 'params', name: 'Parametrización', icon: <Sliders size={16} /> },
  ];

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-mjm-navy uppercase tracking-tighter">Configuración General</h1>
        <p className="text-gray-500 font-medium">Administre las preferencias globales y el comportamiento del sistema.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        <div className="w-full lg:w-72 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all text-left ${
                activeSection === item.id 
                  ? 'bg-mjm-navy text-white shadow-lg shadow-mjm-navy/20' 
                  : 'text-gray-500 hover:bg-white hover:text-mjm-navy border border-transparent hover:border-gray-100 shadow-sm'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 shadow-sm">
          {activeSection === 'system' ? (
            <div className="space-y-8">
              <div className="flex overflow-x-auto pb-4 gap-4 border-b border-gray-100">
                {systemTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-mjm-orange text-white shadow-md'
                        : 'text-gray-400 hover:text-mjm-navy bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    {tab.name}
                  </button>
                ))}
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'geo' && <GeographicConfig />}
                {activeTab === 'landing' && <LandingPageConfig />}
                {activeTab === 'params' && <PlatformParams />}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                 <Building size={40} />
              </div>
              <h3 className="text-xl font-bold text-mjm-navy">Sección en Desarrollo</h3>
              <p className="text-gray-500 max-w-sm">Esta sección de configuración estará disponible próximamente para gestionar clientes y permisos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
