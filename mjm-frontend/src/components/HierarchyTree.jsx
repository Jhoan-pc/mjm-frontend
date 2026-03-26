import React, { useState, useRef, useEffect } from 'react';
import { 
  Building, Globe, Factory, Layout, Activity, MapPin, Wrench, 
  ChevronRight, Plus, MoreVertical, RefreshCw, AlertTriangle, Loader2
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

const LEVEL_CONFIG = {
  cliente: { icon: Building, next: 'pais', color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Cliente' },
  pais: { icon: Globe, next: 'planta', color: 'text-blue-600', bg: 'bg-blue-100', label: 'País' },
  planta: { icon: Factory, next: 'area', color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Planta' },
  area: { icon: Layout, next: 'proceso', color: 'text-amber-600', bg: 'bg-amber-100', label: 'Área' },
  proceso: { icon: Activity, next: 'ubicacion', color: 'text-purple-600', bg: 'bg-purple-100', label: 'Proceso' },
  ubicacion: { icon: MapPin, next: 'instrumento', color: 'text-rose-600', bg: 'bg-rose-100', label: 'Ubicación' },
  instrumento: { icon: Wrench, next: null, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Instrumento' },
};

const TreeNode = ({ node, level, onAddChild, onFilterChange, activeFilter, instruments = [] }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const config = LEVEL_CONFIG[node.type] || LEVEL_CONFIG.cliente;
  const Icon = config.icon;
  const hasChildren = node.children && node.children.length > 0;
  
  const isSelected = activeFilter === node.name;
  
  // Contar instrumentos vinculados a este nodo (si se pasan instrumentos)
  const nodeCount = instruments.filter(i => {
    if (!i.jerarquia) return false;
    return Object.values(i.jerarquia).includes(node.name);
  }).length;

  return (
    <div className="select-none animate-in fade-in duration-300">
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
          <p className={`text-sm tracking-tight truncate ${isSelected ? 'font-black text-mjm-orange' : 'font-bold text-gray-700'}`}>{node.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {nodeCount > 0 && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-mjm-orange text-white' : 'bg-gray-100 text-gray-400'}`}>
              {nodeCount}
            </span>
          )}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            {config.next && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(node.id, config.next, node.tenantId);
                }}
                className="p-1 px-2 text-[9px] font-black uppercase tracking-wider bg-white border border-gray-200 text-gray-500 rounded hover:border-mjm-orange hover:text-mjm-orange shadow-sm"
              >
                +
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
              instruments={instruments}
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
        // 1. Cargar Tenants (Raíces)
        let tenantsQuery = collection(db, 'tenants');
        if (!isSuperAdmin && tenant) {
          tenantsQuery = query(collection(db, 'tenants'), where('__name__', '==', tenant.id));
        }
        const tenantSnap = await getDocs(tenantsQuery);
        
        // 2. Cargar Todos los Nodos de la Jerarquía
        let hierarchyQuery = collection(db, 'hierarchy');
        if (!isSuperAdmin && tenant) {
          hierarchyQuery = query(collection(db, 'hierarchy'), where('tenantId', '==', tenant.id));
        }
        const hierarchySnap = await getDocs(hierarchyQuery);
        
        const allNodes = [];
        // Mapear tenants a formato de nodo
        tenantSnap.docs.forEach(doc => {
          allNodes.push({
            id: doc.id,
            type: 'cliente',
            name: doc.data().nombre_empresa,
            tenantId: doc.id,
            parentId: null,
            children: []
          });
        });

        // Mapear otros nodos
        hierarchySnap.docs.forEach(doc => {
          allNodes.push({
            id: doc.id,
            ...doc.data(),
            children: []
          });
        });

        // 3. Reconstruir Árbol (Recursivo en memoria)
        const nodesMap = {};
        allNodes.forEach(n => nodesMap[n.id] = n);
        
        const roots = [];
        allNodes.forEach(n => {
          if (n.parentId && nodesMap[n.parentId]) {
            nodesMap[n.parentId].children.push(n);
          } else if (n.type === 'cliente') {
            roots.push(n);
          }
        });

        setData(roots);
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
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'tenants'), tenantData);
      } else {
        const nodeData = {
          name: form.name,
          type: modalType,
          parentId: parentId,
          tenantId: currentTenantId,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'hierarchy'), nodeData);
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

  const openModal = (pId, type, tId) => {
    setParentId(pId);
    setModalType(type);
    setCurrentTenantId(tId || (tenant?.id));
    setForm({ name: type === 'pais' ? 'Colombia' : '', nit: '', colorMain: '#0D9488', colorSec: '#0F766E', logoUrl: '' });
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[600px] overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h4 className="font-bold text-mjm-navy uppercase text-sm flex items-center gap-2">
          <Globe size={18} className="text-mjm-orange" /> Jerarquías MJM (Cloud)
        </h4>
        <button 
          onClick={() => openModal(null, 'cliente')}
          className="px-4 py-2 bg-mjm-navy text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-mjm-orange transition shadow shadow-mjm-navy/10"
        >
          + Nuevo Cliente
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <RefreshCw size={32} className="animate-spin text-mjm-orange" />
            <span className="text-[10px] font-black uppercase tracking-widest text-mjm-navy opacity-50">Sincronizando Nube...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-300">
            <AlertTriangle size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium italic">Sin jerarquías registradas.</p>
            <p className="text-[10px] mt-1 uppercase font-bold text-gray-400">Crea tu primer cliente para comenzar</p>
          </div>
        ) : (
          data.map(node => (
            <TreeNode key={node.id} node={node} level={0} onAddChild={openModal} />
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-mjm-navy uppercase tracking-tighter mb-1 font-sans">Añadir {modalType}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6 font-sans">MJM Core Cloud Registry</p>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider font-sans">Nombre del {LEVEL_CONFIG[modalType]?.label}</label>
                <input 
                  placeholder={`Ej: ${LEVEL_CONFIG[modalType]?.label}...`}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-mjm-orange/20 transition-all font-sans"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  autoFocus
                />
              </div>

              {modalType === 'cliente' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">NIT / Identificación</label>
                    <input placeholder="900.000.000-0" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-mjm-orange/20" value={form.nit} onChange={e => setForm({...form, nit: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Color 1</label>
                      <input type="color" value={form.colorMain} onChange={e => setForm({...form, colorMain: e.target.value})} className="h-10 w-full rounded-lg cursor-pointer border-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Color 2</label>
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
                className="px-5 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition"
              >
                Cancelar
              </button>
              <button 
                disabled={!form.name || isSaving} 
                onClick={handleCreate} 
                className="px-8 py-3 bg-mjm-orange text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-mjm-orange/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirmar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
