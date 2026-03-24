import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Paperclip, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function KanbanMantenimiento() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Calibración Balanzas', assignedTo: 'Metrología Externa', status: 'PENDIENTE', instrument: 'Laboratorio QA', hasEvidence: false },
    { id: 2, title: 'Revisión Termohigrómetros', assignedTo: 'MJM Soporte', status: 'EN_EJECUCION', instrument: 'Planta de Producción', hasEvidence: true },
    { id: 3, title: 'Calibración Pie de Rey', assignedTo: 'Taller', status: 'EJECUTADO', instrument: 'Tornería', hasEvidence: true }
  ]);

  const [activeTab, setActiveTab] = useState(null);

  const moveTask = (task, newStatus) => {
    // Validar Regla de Negocio
    if (newStatus === 'EJECUTADO' && !task.hasEvidence) {
      alert("⚠️ REGLA DE NEGOCIO CERRADA: No se puede mover a 'Ejecutado' porque no se ha adjuntado la evidencia o informe final.");
      return;
    }
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  const toggleEvidence = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, hasEvidence: !t.hasEvidence } : t));
  };

  const columns = [
    { id: 'PENDIENTE', title: 'Pendiente', color: 'border-l-gray-400', icon: <Clock size={16}/> },
    { id: 'EN_EJECUCION', title: 'En Ejecución', color: 'border-l-blue-400', icon: <AlertTriangle size={16}/> },
    { id: 'EJECUTADO', title: 'Ejecutado', color: 'border-l-emerald-500', icon: <CheckCircle2 size={16}/> }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kanban de Actividades</h1>
        <p className="text-gray-500 text-sm mt-1">Control de mantenimientos y cumplimiento documental.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6">
        {columns.map(col => (
          <div key={col.id} className="flex-1 bg-gray-200/50 rounded-lg p-4 shadow-inner flex flex-col">
            <h3 className="font-bold text-gray-700 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              {col.icon} {col.title} ({tasks.filter(t => t.status === col.id).length})
            </h3>
            
            <div className="flex-1 space-y-4">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task.id} 
                  className={`bg-white rounded p-4 shadow-sm border-l-4 ${col.color} flex flex-col justify-between group transform transition-transform hover:-translate-y-1`}
                >
                  <div>
                     <h4 className="font-bold text-sm text-gray-800 mb-1">{task.title}</h4>
                     <p className="text-xs text-gray-500 uppercase">{task.instrument}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <button 
                      onClick={() => toggleEvidence(task.id)}
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors ${task.hasEvidence ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}
                    >
                      <Paperclip size={14} /> 
                      {task.hasEvidence ? 'Evidencia Adjunta' : 'Adjuntar Evidencia'}
                    </button>
                  </div>

                  {/* Acciones para mover */}
                  <div className="mt-3 flex gap-2">
                     {col.id !== 'PENDIENTE' && (
                        <button onClick={() => moveTask(task, 'PENDIENTE')} className="flex-1 text-[10px] uppercase font-bold text-gray-500 bg-gray-100 py-1 rounded hover:bg-gray-200">◁ Volver</button>
                     )}
                     {col.id === 'PENDIENTE' && (
                        <button onClick={() => moveTask(task, 'EN_EJECUCION')} className="flex-1 text-[10px] uppercase font-bold text-white bg-blue-500 py-1 rounded hover:bg-blue-600">Iniciar ▷</button>
                     )}
                     {col.id === 'EN_EJECUCION' && (
                        <button onClick={() => moveTask(task, 'EJECUTADO')} className="flex-1 text-[10px] uppercase font-bold text-white bg-emerald-500 py-1 rounded hover:bg-emerald-600">Finalizar ▷</button>
                     )}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center text-sm text-gray-400">
                  Sin tareas
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
