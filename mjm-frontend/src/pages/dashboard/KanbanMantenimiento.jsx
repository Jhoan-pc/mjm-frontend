import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Paperclip, CheckCircle2, AlertTriangle, Clock, UploadCloud, FileCheck } from 'lucide-react';

export default function KanbanMantenimiento() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Calibración Balanzas', assignedTo: 'Metrología Externa', status: 'PENDIENTE', instrument: 'Laboratorio QA', hasEvidence: false, fileName: '' },
    { id: 2, title: 'Revisión Termohigrómetros', assignedTo: 'MJM Soporte', status: 'EN_EJECUCION', instrument: 'Planta 1', hasEvidence: true, fileName: 'informe_termo.pdf' },
    { id: 3, title: 'Mantenimiento Pie de Rey', assignedTo: 'Taller Interno', status: 'EJECUTADO', instrument: 'Tornería', hasEvidence: true, fileName: 'certificado_cal.pdf' }
  ]);
  const [uploading, setUploading] = useState(null);
  const fileInputRef = useRef(null);

  const moveTask = (task, newStatus) => {
    if (newStatus === 'EJECUTADO' && !task.hasEvidence) {
      alert("⚠️ REGLA DE LA NORMA: No se puede mover una actividad a 'Ejecutado' si no has adjuntado la evidencia o certificado correspondiente.");
      return;
    }
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  const handleUploadClick = (taskId) => {
    // Hack: guardar el id de la tarea activa en una prop custom del input
    fileInputRef.current.dataset.taskId = taskId;
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const taskId = parseInt(fileInputRef.current.dataset.taskId, 10);
    setUploading(taskId);

    // Simular subida a Firebase Storage
    setTimeout(() => {
      setTasks(tasks.map(t => t.id === taskId ? { 
        ...t, 
        hasEvidence: true, 
        fileName: file.name 
      } : t));
      setUploading(null);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
  };

  const columns = [
    { id: 'PENDIENTE', title: 'Pendiente', color: 'border-l-gray-400', icon: <Clock size={16}/> },
    { id: 'EN_EJECUCION', title: 'En Ejecución', color: 'border-l-blue-400', icon: <AlertTriangle size={16}/> },
    { id: 'EJECUTADO', title: 'Ejecutado', color: 'border-l-emerald-500', icon: <CheckCircle2 size={16}/> }
  ];

  return (
    <div className="h-full flex flex-col uppercase">
      {/* Input hidden file */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept=".pdf,.jpg,.jpeg,.png"
      />

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-mjm-navy tracking-tighter">Plan de Mantenimiento</h1>
          <p className="text-gray-500 text-sm mt-1 font-bold">Flujo de trabajo para control de instrumentos (Drag & Drop UI)</p>
        </div>
        <button className="bg-mjm-navy text-white px-6 py-3 font-bold text-xs uppercase tracking-widest rounded shadow-lg hover:bg-gray-800 transition-colors">
          + Nueva Actividad
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-8">
        {columns.map(col => (
          <div key={col.id} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col min-w-[300px]">
            <h3 className={`font-black text-gray-800 uppercase tracking-[0.2em] text-xs mb-6 flex items-center gap-3 border-b-2 pb-3 ${col.id === 'PENDIENTE' ? 'border-gray-300' : col.id === 'EN_EJECUCION' ? 'border-blue-400' : 'border-emerald-500'}`}>
              <span className={col.id === 'PENDIENTE' ? 'text-gray-500' : col.id === 'EN_EJECUCION' ? 'text-blue-500' : 'text-emerald-500'}>
                {col.icon}
              </span>
              {col.title} <span className="ml-auto bg-white px-2 py-0.5 rounded-full shadow-sm text-[10px]">{tasks.filter(t => t.status === col.id).length}</span>
            </h3>
            
            <div className="flex-1 space-y-4">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task.id} 
                  className={`bg-white rounded-lg p-5 shadow-sm border border-gray-100 border-l-4 ${col.color} flex flex-col justify-between group transform transition-all hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="mb-4">
                     <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold tracking-widest">{task.instrument}</span>
                     <h4 className="font-black text-sm text-mjm-navy mt-3 leading-tight">{task.title}</h4>
                     <p className="text-[10px] text-gray-400 font-bold mt-2 flex items-center gap-1">
                       Resp: {task.assignedTo}
                     </p>
                  </div>
                  
                  <div className="mt-4 flex flex-col border-t border-gray-50 pt-4">
                    {uploading === task.id ? (
                      <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-mjm-orange bg-orange-50 p-2 rounded justify-center animate-pulse">
                        <UploadCloud size={14} className="animate-bounce" /> SUBIENDO...
                      </div>
                    ) : task.hasEvidence ? (
                      <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded cursor-pointer hover:bg-emerald-100 transition-colors" title={task.fileName}>
                        <FileCheck size={14} /> CERTIFICADO ADJUNTO
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleUploadClick(task.id)}
                        className="flex items-center justify-center gap-2 text-[10px] font-black tracking-widest text-gray-500 bg-gray-50 border border-dashed border-gray-300 p-2 rounded hover:text-white hover:bg-mjm-orange hover:border-mjm-orange transition-all group"
                      >
                        <Paperclip size={14} /> ADJUNTAR EVIDENCIA
                      </button>
                    )}
                  </div>

                  {/* Acciones para mover */}
                  <div className="mt-4 flex gap-2 pt-2 border-t border-gray-50">
                     {col.id !== 'PENDIENTE' && (
                        <button onClick={() => moveTask(task, 'PENDIENTE')} className="flex-1 text-[10px] uppercase font-black text-gray-500 hover:text-mjm-navy transition-colors">◁ Volver</button>
                     )}
                     {col.id === 'PENDIENTE' && (
                        <button onClick={() => moveTask(task, 'EN_EJECUCION')} className="flex-1 text-[10px] uppercase font-black text-blue-500 hover:text-blue-700 transition-colors">Iniciar ▷</button>
                     )}
                     {col.id === 'EN_EJECUCION' && (
                        <button onClick={() => moveTask(task, 'EJECUTADO')} className="flex-1 text-[10px] uppercase font-black text-emerald-500 hover:text-emerald-700 transition-colors">Finalizar ▷</button>
                     )}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-gray-300">
                  <span className="font-bold text-xs tracking-widest">Columna vacía</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
