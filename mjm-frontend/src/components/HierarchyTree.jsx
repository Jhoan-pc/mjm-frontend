import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, Globe, Factory, Layout, Activity, MapPin, Wrench, 
  ChevronRight, Plus, MoreVertical, RefreshCw, AlertCircle, Loader2, Power, Trash2
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, getDoc, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

function ShieldCheck(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="m9 12 2 2 4-4"/></svg>;
}

const LEVEL_CONFIG = {
  mjm: { icon: ShieldCheck, next: 'cliente', color: 'text-amber-500', bg: 'bg-amber-100', label: 'MJM Hub' },
  cliente: { icon: Building, next: 'pais', color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Cliente (Tenant)' },
  pais: { icon: Globe, next: 'planta', color: 'text-blue-600', bg: 'bg-blue-100', label: 'País' },
  planta: { icon: Factory, next: 'area', color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Planta' },
  area: { icon: Layout, next: 'proceso', color: 'text-amber-600', bg: 'bg-amber-100', label: 'Área' },
  proceso: { icon: Activity, next: 'ubicacion', color: 'text-purple-600', bg: 'bg-purple-100', label: 'Proceso' },
  ubicacion: { icon: MapPin, next: 'instrumento', color: 'text-rose-600', bg: 'bg-rose-100', label: 'Ubicación' },
  instrumento: { icon: Wrench, next: null, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Instrumento' },
};

const TreeNode = ({ node, level, onAddChild, onFilterChange, activeFilter, onToggleStatus, instruments = [], forceExpanded = null }) => {
  const [expanded, setExpanded] = useState(level < 2);

  useEffect(() => {
    if (forceExpanded !== null) {
      setExpanded(forceExpanded);
    }
  }, [forceExpanded]);
  const config = LEVEL_CONFIG[node.type] || LEVEL_CONFIG.cliente;
  const Icon = config.icon;
  const hasChildren = node.children && node.children.length > 0;
  
  const isSelected = activeFilter === node.name;
  
  // Contar instrumentos vinculados a este nodo de jerarquía
  const nodeCount = instruments.filter(i => {
    if (node.type === 'mjm') {
      return true; // Todos los del Hub
    }
    if (node.type === 'cliente' && (i.tenantId === node.id || node.id === 'deltapruebas-sandbox')) {
      return true;
    }
    if (node.id.startsWith('pais_default_') || node.id.startsWith('planta_default_') || node.id.startsWith('area_default_')) {
      return true;
    }
    if (node.type === 'proceso') {
      return (i.proceso || 'OPERATIVO') === node.name;
    }
    if (node.type === 'ubicacion') {
      return (i.ubicacion || 'LABORATORIO 1') === node.name;
    }
    if (!i.jerarquia) return false;
    return Object.values(i.jerarquia).includes(node.name);
  }).length;

  const isTenant = node.type === 'cliente';
  const isActive = node.suscripcion_activa !== false; // Activa por defecto

  return (
    <div className={`select-none animate-in fade-in duration-300 ${!isActive ? 'opacity-50 grayscale' : ''}`}>
      <div 
        className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all group cursor-pointer ${isSelected ? 'bg-mjm-orange/10 border-l-4 border-mjm-orange shadow-sm' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
        style={{ paddingLeft: `${Math.max(0.75, level * 1.5)}rem` }}
        onClick={() => onFilterChange && onFilterChange(node.name)}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }} 
          className={`p-1.5 rounded-full transition-all ${!hasChildren ? 'invisible' : 'hover:bg-gray-200'} ${expanded ? 'rotate-90 text-mjm-orange' : 'text-gray-400'}`}
        >
          <ChevronRight size={16} />
        </button>

        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-mjm-orange text-white' : `${config.bg} ${config.color}`} shrink-0`}>
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm tracking-tight truncate ${isSelected ? 'font-black text-mjm-orange' : 'font-bold text-gray-700'}`}>
            {node.name}
            {isTenant && <span className="text-[8px] font-black text-gray-400 ml-2 uppercase font-mono tracking-widest">{isActive ? 'Activo' : 'Suspendido'}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {nodeCount > 0 && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-mjm-orange text-white' : 'bg-gray-100 text-gray-400'}`}>
              {nodeCount} Equipos
            </span>
          )}
          
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
            {/* Control Power para encender/apagar Tenant en el árbol */}
            {isTenant && onToggleStatus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(node);
                }}
                className={`p-1 px-2 text-[9px] font-black uppercase tracking-wider rounded border shadow-sm ${
                  isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                }`}
                title={isActive ? "Apagar Cliente" : "Encender Cliente"}
              >
                <Power size={10} />
              </button>
            )}

            {config.next && isActive && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(node.id, config.next, node.tenantId || node.id);
                }}
                className="p-1 px-2 text-[9px] font-black uppercase tracking-wider bg-white border border-gray-200 text-gray-500 rounded hover:border-mjm-orange hover:text-mjm-orange shadow-sm"
              >
                + Añadir {LEVEL_CONFIG[config.next]?.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="ml-6 border-l-2 border-gray-100 space-y-1 mt-1 transition-all">
          {node.children.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onAddChild={onAddChild} 
              onFilterChange={onFilterChange}
              activeFilter={activeFilter}
              onToggleStatus={onToggleStatus}
              instruments={instruments}
              forceExpanded={forceExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function HierarchyTree({ instruments = [], activeFilter = null, onFilterChange = null }) {
  const { tenant, isSuperAdmin } = useAuthStore();
  const [treeKey, setTreeKey] = useState(0);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalExpanded, setGlobalExpanded] = useState(null);

  const handleExpandAll = () => {
    setGlobalExpanded(true);
    setTimeout(() => setGlobalExpanded(null), 100);
  };

  const handleCollapseAll = () => {
    setGlobalExpanded(false);
    setTimeout(() => setGlobalExpanded(null), 100);
  };
  
  // Modales
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [currentTenantId, setCurrentTenantId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: '', nit: '', colorMain: '#0D9488', colorSec: '#0F766E', logoUrl: '' });

  useEffect(() => {
    const buildTree = async () => {
      try {
        setIsLoading(true);
        // 1. Cargar Tenants (Clientes) con Fallback en caso de error de permisos
        let tenantDocs = [];
        try {
          let tenantsQuery = collection(db, 'tenants');
          if (!isSuperAdmin && tenant) {
            tenantsQuery = query(collection(db, 'tenants'), where('__name__', '==', tenant.id));
          }
          const tenantSnap = await getDocs(tenantsQuery);
          tenantDocs = tenantSnap.docs;
        } catch (err) {
          console.warn("Fallo al listar todos los tenants, cargando tenant actual directamente por ID:", err);
          if (tenant && tenant.id) {
            const docSnap = await getDoc(doc(db, 'tenants', tenant.id));
            if (docSnap.exists()) {
              tenantDocs = [docSnap];
            }
          }
        }
        
        // 2. Cargar Jerarquía con Fallback en caso de error de permisos
        let hierarchyDocs = [];
        if (tenant && tenant.id) {
          try {
            // Intentar cargar desde la subcolección multitenant protegida
            const hierarchySnap = await getDocs(collection(db, 'tenants', tenant.id, 'hierarchy'));
            hierarchyDocs = hierarchySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } catch (err) {
            console.warn("Fallo al listar jerarquías en subcolección, intentando desde colección global:", err);
            try {
              let hierarchyQuery = collection(db, 'hierarchy');
              if (!isSuperAdmin && tenant) {
                hierarchyQuery = query(collection(db, 'hierarchy'), where('tenantId', '==', tenant.id));
              }
              const hierarchySnap = await getDocs(hierarchyQuery);
              hierarchyDocs = hierarchySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err2) {
              console.error("Fallo definitivo cargando jerarquías:", err2);
            }
          }

          // Cargar nodos locales guardados en el sandbox (en caso de error de permisos de escritura)
          try {
            const localNodes = JSON.parse(localStorage.getItem(`mjm_hierarchy_${tenant.id}`) || '[]');
            hierarchyDocs = [...hierarchyDocs, ...localNodes];
          } catch (e) {
            console.error("Error reading local hierarchy:", e);
          }
        }
        
        const allNodes = [];
        
        // Mapear tenants como nodos
        tenantDocs.forEach(doc => {
          allNodes.push({
            id: doc.id,
            type: 'cliente',
            name: doc.data().nombre_empresa,
            tenantId: doc.id,
            suscripcion_activa: doc.data().suscripcion_activa !== false,
            parentId: 'mjm_root',
            children: []
          });
        });

        // Mapear sub-nodos
        hierarchyDocs.forEach(item => {
          allNodes.push({
            id: item.id,
            ...item,
            children: []
          });
        });

        // Autogenerar estructura basada en los instrumentos si no hay jerarquías explísitas guardadas
        if (hierarchyDocs.length === 0 && instruments && instruments.length > 0) {
          const tenantId = tenant?.id || 'deltapruebas-sandbox';
          const defaultPaisId = `pais_default_${tenantId}`;
          const defaultPlantaId = `planta_default_${tenantId}`;
          const defaultAreaId = `area_default_${tenantId}`;

          allNodes.push({
            id: defaultPaisId,
            type: 'pais',
            name: 'Colombia',
            parentId: tenantId,
            tenantId: tenantId,
            suscripcion_activa: true,
            children: []
          });

          allNodes.push({
            id: defaultPlantaId,
            type: 'planta',
            name: 'Planta Principal',
            parentId: defaultPaisId,
            tenantId: tenantId,
            suscripcion_activa: true,
            children: []
          });

          allNodes.push({
            id: defaultAreaId,
            type: 'area',
            name: 'Área General',
            parentId: defaultPlantaId,
            tenantId: tenantId,
            suscripcion_activa: true,
            children: []
          });

          // Extraer Procesos y Ubicaciones de los instrumentos
          const procesosUnicos = new Set();
          const ubicacionesPorProceso = {};

          instruments.forEach(inst => {
            const proc = inst.proceso || 'OPERATIVO';
            const ubi = inst.ubicacion || 'LABORATORIO 1';
            procesosUnicos.add(proc);
            if (!ubicacionesPorProceso[proc]) {
              ubicacionesPorProceso[proc] = new Set();
            }
            ubicacionesPorProceso[proc].add(ubi);
          });

          procesosUnicos.forEach(proc => {
            const procId = `proc_${tenantId}_${proc}`;
            allNodes.push({
              id: procId,
              type: 'proceso',
              name: proc,
              parentId: defaultAreaId,
              tenantId: tenantId,
              suscripcion_activa: true,
              children: []
            });

            const ubis = ubicacionesPorProceso[proc];
            ubis.forEach(ubi => {
              const ubiId = `ubi_${tenantId}_${proc}_${ubi}`;
              allNodes.push({
                id: ubiId,
                type: 'ubicacion',
                name: ubi,
                parentId: procId,
                tenantId: tenantId,
                suscripcion_activa: true,
                children: []
              });
            });
          });
        }

        // 3. Crear nodo raíz central: MJM Metrología Hub
        const mjmRootNode = {
          id: 'mjm_root',
          type: 'mjm',
          name: 'MJM Metrología Hub',
          parentId: null,
          suscripcion_activa: true,
          children: []
        };

        const nodesMap = {
          mjm_root: mjmRootNode
        };
        allNodes.forEach(n => nodesMap[n.id] = n);
        
        allNodes.forEach(n => {
          const parent = n.parentId || 'mjm_root';
          if (nodesMap[parent]) {
            nodesMap[parent].children.push(n);
          }
        });

        setData([mjmRootNode]);
      } catch (error) {
        console.error("DEBUG FETCH:", error);
      } finally {
        setIsLoading(false);
      }
    };
    buildTree();
  }, [treeKey, isSuperAdmin, tenant]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, logoUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!form.name) return;
    setIsSaving(true);
    try {
      if (modalType === 'cliente') {
        const tenantData = {
          nombre_empresa: form.name,
          nit: form.nit,
          color_institucional_principal: form.colorMain,
          color_institucional_secundario: form.colorSec,
          logo_url: form.logoUrl,
          suscripcion_activa: true,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'tenants'), tenantData);
      } else {
        const nodeData = {
          name: form.name,
          type: modalType,
          parentId: parentId,
          tenantId: currentTenantId,
          createdAt: new Date().toISOString()
        };
        // Intentar guardar en la subcolección multitenant protegida
        try {
          await addDoc(collection(db, 'tenants', currentTenantId, 'hierarchy'), nodeData);
        } catch (e) {
          console.warn("Fallo al guardar en subcolección, guardando localmente en Sandbox por permisos:", e);
          try {
            // Guardar localmente
            const localHierarchy = JSON.parse(localStorage.getItem(`mjm_hierarchy_${currentTenantId}`) || '[]');
            localHierarchy.push({ id: `local_${Date.now()}`, ...nodeData });
            localStorage.setItem(`mjm_hierarchy_${currentTenantId}`, JSON.stringify(localHierarchy));
          } catch (errLocal) {
            console.error("Error guardando localmente en Sandbox:", errLocal);
            throw e; // Lanza el original si no se puede guardar localmente tampoco
          }
        }
      }
      
      setTreeKey(prev => prev + 1);
      setShowModal(false);
    } catch (e) {
      alert(`❌ Error Firebase: ${e.code || e.message}`);
    } finally {
      setIsSaving(false);
      setForm({ name: '', nit: '', colorMain: '#0D9488', colorSec: '#0F766E', logoUrl: '' });
    }
  };

  // Encender/Apagar un tenant directamente desde el árbol
  const handleToggleStatus = async (node) => {
    const nextStatus = !node.suscripcion_activa;
    const msg = nextStatus 
      ? `¿Deseas reactivar al cliente ${node.name}?`
      : `⚠️ ADVERTENCIA: ¿Deseas suspender la cuenta de ${node.name}? Se ocultará e inhabilitará todo acceso y sus equipos de manera jerárquica.`;

    if (!window.confirm(msg)) return;

    try {
      await updateDoc(doc(db, 'tenants', node.id), {
        suscripcion_activa: nextStatus
      });
      alert(`Cliente ${nextStatus ? 'Activado' : 'Suspendido'} exitosamente.`);
      setTreeKey(prev => prev + 1);
    } catch (e) {
      console.error(e);
      alert("Error al cambiar estado del cliente.");
    }
  };

  const openModal = (pId, type, tId) => {
    setParentId(pId);
    setModalType(type);
    setCurrentTenantId(tId || (tenant?.id));
    setForm({ name: type === 'pais' ? 'Colombia' : '', nit: '', colorMain: '#0D9488', colorSec: '#0F766E', logoUrl: '' });
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[650px] overflow-hidden">
      <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <h4 className="font-black text-mjm-navy uppercase text-sm flex items-center gap-2">
            <Globe size={18} className="text-mjm-orange animate-spin duration-[6000ms]" /> Jerarquías MJM (Cloud)
          </h4>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Estructura general de clientes, sedes y equipos en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExpandAll}
            className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-[9px] font-black uppercase tracking-wider hover:border-mjm-orange hover:text-mjm-orange transition shadow-sm active:scale-95"
          >
            Desplegar Todo
          </button>
          <button 
            onClick={handleCollapseAll}
            className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-[9px] font-black uppercase tracking-wider hover:border-mjm-orange hover:text-mjm-orange transition shadow-sm active:scale-95"
          >
            Contraer Todo
          </button>
          <button 
            onClick={() => openModal('mjm_root', 'cliente')}
            className="px-5 py-3 bg-mjm-navy text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-mjm-orange transition shadow shadow-mjm-navy/10 ml-2 active:scale-95"
          >
            + Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-2 custom-scrollbar bg-slate-50/30">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <RefreshCw size={32} className="animate-spin text-mjm-orange" />
            <span className="text-[10px] font-black uppercase tracking-widest text-mjm-navy opacity-50">Sincronizando Árbol Metrológico...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-300">
            <AlertCircle size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium italic">Sin jerarquías registradas.</p>
          </div>
        ) : (
          data.map(node => (
            <TreeNode 
              key={node.id} 
              node={node} 
              level={0} 
              onAddChild={openModal} 
              onToggleStatus={handleToggleStatus}
              instruments={instruments}
              forceExpanded={globalExpanded}
            />
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-mjm-navy uppercase tracking-tighter mb-1">Añadir {modalType === 'cliente' ? 'Cliente' : LEVEL_CONFIG[modalType]?.label}</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6">MJM Core Cloud Registry</p>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Nombre</label>
                <input 
                  placeholder={`Ej: ${LEVEL_CONFIG[modalType]?.label}...`}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-mjm-orange/20 transition-all"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  autoFocus
                />
              </div>

              {modalType === 'cliente' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">NIT / Identificación</label>
                    <input placeholder="900.000.000-0" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-mjm-orange/20" value={form.nit} onChange={e => setForm({...form, nit: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Color Principal</label>
                      <input type="color" value={form.colorMain} onChange={e => setForm({...form, colorMain: e.target.value})} className="h-10 w-full rounded-lg cursor-pointer border-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Color Secundario</label>
                      <input type="color" value={form.colorSec} onChange={e => setForm({...form, colorSec: e.target.value})} className="h-10 w-full rounded-lg cursor-pointer border-none" />
                    </div>
                  </div>
                  <div 
                    className="p-6 border-2 border-dashed border-gray-100 rounded-2xl text-center cursor-pointer hover:border-mjm-orange hover:bg-orange-50/30 transition-all group" 
                    onClick={() => fileInputRef.current.click()}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleLogoUpload} />
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="logo" className="h-12 mx-auto mb-2 object-contain" />
                    ) : (
                      <RefreshCw size={24} className="mx-auto mb-2 text-gray-300 group-hover:text-mjm-orange" />
                    )}
                    <span className="text-[9px] font-black text-mjm-navy uppercase tracking-widest">{form.logoUrl ? 'Imagen Lista' : 'Subir Logo PNG/JPG'}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setIsSaving(false);
                }} 
                className="px-5 py-2 text-[10px] font-black uppercase text-gray-400"
              >
                Cancelar
              </button>
              <button 
                disabled={!form.name || isSaving} 
                onClick={handleCreate} 
                className="px-8 py-3.5 bg-mjm-orange text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-mjm-orange/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
