import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MessageSquare, Clock, Building2, User, Phone, Tag, Calendar, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ChatbotSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const tenant = useAuthStore(state => state.tenant);

  useEffect(() => {
    // Escuchar en tiempo real las solicitudes del chatbot
    const q = query(collection(db, 'chatbot_submissions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-mjm-orange" size={32} />
            Solicitudes del Chatbot
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Gestión de prospectos y programación de entregas capturadas en el landing.</p>
        </div>
        <div className="bg-mjm-navy/5 px-4 py-2 rounded-full border border-mjm-navy/10 flex items-center gap-2">
          <span className="w-2 h-2 bg-mjm-orange rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black uppercase text-mjm-navy tracking-widest">{submissions.length} Total Recibidas</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
           <div className="w-12 h-12 border-4 border-mjm-orange/20 border-t-mjm-orange rounded-full animate-spin mb-4"></div>
           <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Sincronizando con Firebase...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
               <MessageSquare size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Sin solicitudes todavía</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Las solicitudes que tus clientes completen en el asistente virtual aparecerán aquí automáticamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-8">
                
                {/* Status & Time */}
                <div className="md:w-48 shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 flex items-center gap-1.5">
                      <Clock size={12} /> {sub.status || 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> {sub.timestamp?.toDate().toLocaleString() || 'Reciente'}
                  </p>
                </div>

                {/* Main Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap gap-x-12 gap-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-mjm-navy group-hover:text-white transition-colors">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Contacto</p>
                        <p className="text-sm font-bold text-gray-900">{sub.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500 font-medium">{sub.position}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Empresa</p>
                        <p className="text-sm font-bold text-gray-900">{sub.company || 'N/A'}</p>
                        <p className="text-xs text-gray-500 italic uppercase tracking-tighter text-[10px]">{sub.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <Tag size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Equipo Solicitado</p>
                        <p className="text-sm font-bold text-mjm-navy">{sub.brand} {sub.model}</p>
                        <p className="text-xs text-gray-500">{sub.equipment_type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                    <p className="text-[10px] uppercase font-black text-gray-400 mb-2">Detalles Técnicos</p>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      S/N: <span className="font-bold text-gray-900">{sub.serial}</span> | Aplicación: <span className="font-bold text-gray-900">{sub.application}</span> | 
                      {sub.needs_certification === 'si' ? <span className="text-emerald-600"> ✅ Requiere Certificación</span> : <span className="text-amber-600"> ❌ Sólo Diagnóstico</span>}
                    </p>
                    {sub.email && (
                      <p className="mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Email: {sub.email}</p>
                    )}
                  </div>
                </div>

                {/* CTAs */}
                <div className="md:w-32 shrink-0 flex flex-col gap-2">
                   <a href={`tel:${sub.phone}`} className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                      <Phone size={12} /> Llamar
                   </a>
                   <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                      Gestionar <ChevronRight size={12} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
