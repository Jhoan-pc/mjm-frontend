import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Map, Layout, Sliders, ChevronRight, Globe, FileText, Database,
  ShieldCheck, Building, Users, Check, MapPin, X, Loader2, Mail, Phone, Calendar as CalendarIcon, ExternalLink, Wrench,
  Terminal, Globe2, Briefcase, Lock, Fingerprint, Palette, TerminalSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStore } from '../../store/contentStore';
import HierarchyTree from '../../components/HierarchyTree';
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';

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
  const [heroTitle, setHeroTitle] = useState(landing.hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(landing.hero.subtitle);
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

const GeographicView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4">
    <SectionHeader 
      title="Estructura Geográfica" 
      subtitle="Jerarquía organizacional de activos y ubicaciones."
      icon={Globe2}
    />
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <HierarchyTree />
    </div>
  </div>
);

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

           {activeCategory === 'clients' && (
              <div className="mt-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Estado del CRM</p>
                 <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-emerald-700">12</span>
                    <span className="text-[10px] font-bold text-emerald-600 mb-1">Clientes Activos</span>
                 </div>
              </div>
           )}
        </div>

        {/* Área de Contenido Principal */}
        <div className="flex-1 overflow-y-auto pr-4 -mr-4">
           {activeCategory === 'clients' ? (
             <div className="p-20 text-center">
               <SectionHeader title="Gestión de Cuentas" subtitle="Panel de administración de clientes corporativos." icon={Briefcase} />
               <p className="text-gray-400 italic">Módulo de CRM en proceso de migración de UI...</p>
             </div>
           ) : (subMenus[activeCategory] || []).find(s => s.id === activeSub)?.component || (
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
