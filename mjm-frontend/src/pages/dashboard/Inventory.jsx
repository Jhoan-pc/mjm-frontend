import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ChevronRight, ChevronDown, MoreVertical, Eye, FileText, Smartphone, Settings } from 'lucide-react';

const mockHierarchy = [
  {
    id: 'c1',
    name: 'Industrias Alfa',
    type: 'cliente',
    children: [
      {
        id: 'p1',
        name: 'Colombia',
        type: 'pais',
        children: [
          {
            id: 'pt1',
            name: 'Planta Bogotá',
            type: 'planta',
            children: [
              {
                id: 'a1',
                name: 'Calidad',
                type: 'area',
                children: [
                  { id: 'pr1', name: 'Metrología', type: 'proceso' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

const mockInstruments = [
  {
    id: 'MJM-INS-001',
    name: 'Micrómetro Digital',
    brand: 'Mitutoyo',
    model: '293-240-30',
    serial: 'SN-88291',
    code: 'CAL-01',
    resolution: '0.001 mm',
    capacity: '0-25 mm',
    magnitude: 'Dimensional',
    criticality: 'Alta',
    status: 'Certificado',
    lastCal: '2024-01-15',
    nextCal: '2025-01-15'
  },
  {
    id: 'MJM-INS-002',
    name: 'Manómetro de Presión',
    brand: 'Wika',
    model: '232.50',
    serial: 'P-9921',
    code: 'PRE-04',
    resolution: '0.1 psi',
    capacity: '0-100 psi',
    magnitude: 'Presión',
    criticality: 'Media',
    status: 'Próximo Vencimiento',
    lastCal: '2023-08-20',
    nextCal: '2024-08-20'
  }
];

export default function Inventory() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(['c1', 'p1', 'pt1', 'a1']);
  const [selectedNode, setSelectedNode] = useState('pr1');

  const toggleExpand = (id) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const renderTree = (nodes) => {
    return nodes.map(node => (
      <div key={node.id} className="ml-4">
        <div 
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${selectedNode === node.id ? 'bg-mjm-orange/10 text-mjm-orange font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
          onClick={() => {
            if (node.children) toggleExpand(node.id);
            setSelectedNode(node.id);
          }}
        >
          {node.children ? (
            expanded.includes(node.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-3.5" />
          )}
          <span className="text-xs uppercase tracking-tight">{node.name}</span>
        </div>
        {node.children && expanded.includes(node.id) && renderTree(node.children)}
      </div>
    ));
  };

  return (
    <div className="flex h-full bg-[#f8f9fa] overflow-hidden rounded-2xl shadow-sm border border-gray-200">
      
      {/* LEFT: Hierarchy Tree (Sidebar internal) */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Jerarquía</h3>
          <Settings size={14} className="text-gray-300 cursor-pointer hover:text-mjm-orange transition-colors" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 py-4 scrollbar-hide">
          {renderTree(mockHierarchy)}
        </div>
      </aside>

      {/* RIGHT: Instrument List Table */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Toolbar */}
        <header className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-mjm-navy uppercase tracking-tight">Inventario de Instrumentos</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Metrología / Plant: Bogotá / Proceso: Calidad</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por serie, código..."
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-mjm-orange w-64 transition-all"
              />
            </div>
            <button className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors">
              <Filter size={18} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-mjm-orange text-white rounded-lg font-black uppercase text-xs tracking-widest shadow-lg shadow-mjm-orange/20 hover:scale-105 transition-all active:scale-95">
              <Plus size={16} strokeWidth={3} />
              Agregar Instrumento
            </button>
          </div>
        </header>

        {/* Table Container */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-100">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">ID / Código</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Instrumento</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Criticidad</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Capacidad / Res</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Próxima Cal</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockInstruments.map(inst => (
                <tr key={inst.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-mjm-navy tracking-tight">{inst.id}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{inst.code}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-mjm-navy font-bold text-xs uppercase">
                        {inst.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 tracking-tight">{inst.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-black">{inst.brand} {inst.model}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                      inst.criticality === 'Alta' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                    }`}>
                      {inst.criticality}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">{inst.capacity}</span>
                      <span className="text-[10px] text-gray-400 font-bold">Res: {inst.resolution}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${inst.status === 'Certificado' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{inst.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-black text-mjm-navy">{inst.nextCal}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/dashboard/hoja-de-vida/${inst.id}`)}
                        className="p-1.5 hover:bg-mjm-orange/10 hover:text-mjm-orange rounded text-gray-400 transition-colors" 
                        title="Hoja de Vida"
                      >
                        <FileText size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-blue-50 hover:text-blue-500 rounded text-gray-400 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <footer className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
           <span>Mostrando {mockInstruments.length} de {mockInstruments.length} instrumentos</span>
           <div className="flex items-center gap-2">
              <button className="px-2 py-1 hover:text-mjm-navy transition-colors">Anterior</button>
              <button className="px-2 py-1 bg-mjm-navy text-white rounded">1</button>
              <button className="px-2 py-1 hover:text-mjm-navy transition-colors">Siguiente</button>
           </div>
        </footer>
      </main>
    </div>
  );
}
