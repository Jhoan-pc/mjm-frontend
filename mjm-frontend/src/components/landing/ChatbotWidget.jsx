import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Package, MessageCircle, CheckCircle } from 'lucide-react';
import { useContentStore } from '../../store/contentStore';
import logoChatbot from '../../assets/logo_original_con_fondo.jpeg';

const chatSteps = [
  { id: 'email',    question: "¡Hola! Es un gusto saludarte. 👋 Para empezar, ¿podrías indicarme tu <strong>correo electrónico</strong> corporativo?", placeholder: "ejemplo@empresa.com", type: "email" },
  { id: 'company',  question: "¡Excelente! ¿A qué <strong>empresa</strong> representas?", placeholder: "Nombre de tu empresa", type: "text" },
  { id: 'name',     question: "Mucho gusto. ¿Con quién tengo el placer de hablar? 😊", placeholder: "Tu nombre completo", type: "text" },
  { id: 'position', question: "¡Entendido! ¿Cuál es tu <strong>cargo</strong> en la empresa?", placeholder: "Ej: Director de Calidad, Técnico, Gerente...", type: "text" },
  { id: 'phone',    question: "¿Y un <strong>teléfono</strong> para contactarte si es necesario?", placeholder: "Número de contacto", type: "tel" },
  { id: 'location', question: "¿Desde qué <strong>ciudad o país</strong> nos escribes?", placeholder: "Ciudad, País", type: "text" },
  { id: 'equipment_basics',  question: "Ahora hablemos del instrumento: <strong>¿Qué tipo de instrumento es, y cuál es su marca y modelo?</strong>", placeholder: "Ej: Multímetro, Fluke 87V", type: "text" },
  { id: 'equipment_details', question: "¿Podrías darme la <strong>serie o código interno</strong> y decirme para qué se <strong>usa</strong> principalmente?", placeholder: "Serie/Código y Aplicación", type: "text" },
  { id: 'certification_info', question: "¡Ya casi terminamos! ¿A nombre de quién emitimos el <strong>certificado</strong>? ¿Tienes algún <strong>punto específico</strong> que debamos saber?", placeholder: "Datos del certificado y observaciones", type: "textarea" },
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen]         = useState(false);
  const [chatView, setChatView]     = useState('options');
  const [currentStep, setCurrentStep] = useState(0);
  const [chatData, setChatData]     = useState({});
  const [inputValue, setInputValue] = useState('');

  const handleNext = useCallback(() => {
    if (!inputValue.trim()) return;
    const field = chatSteps[currentStep].id;
    const newData = { ...chatData, [field]: inputValue };
    setChatData(newData);
    setInputValue('');
    if (currentStep < chatSteps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setChatView('loading');
      useContentStore.getState().submitChatbotForm(newData).then(() => setChatView('success'));
    }
  }, [inputValue, currentStep, chatData]);

  const handleReset = useCallback(() => {
    setChatView('options');
    setCurrentStep(0);
    setChatData({});
    setInputValue('');
  }, []);

  const toggleChat = useCallback(() => setIsOpen(v => !v), []);

  return (
    <div className="fixed bottom-8 right-8 z-[110] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-24 right-0 w-[420px] max-w-[calc(100vw-40px)] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_30px_100px_-20px_rgba(10,21,32,0.3)] border border-mjm-navy/10 overflow-hidden flex flex-col"
          >
            {/* Header del chat */}
            <div className="p-8 bg-mjm-navy text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 p-2 flex items-center justify-center border border-white/10">
                  <img src={logoChatbot} alt="MJM" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-black text-lg tracking-tight leading-none uppercase">Atención Corporativa</h4>
                  <p className="text-[9px] font-bold text-mjm-orange uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Asistencia en Línea
                  </p>
                </div>
              </div>
              <button onClick={toggleChat} className="text-white/40 hover:text-white transition-colors p-2">
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 flex-1 overflow-y-auto max-h-[500px] min-h-[300px]">
              {chatView === 'options' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-xl font-black text-mjm-navy leading-tight">¿Cómo podemos asistirte hoy?</p>
                    <p className="text-sm text-mjm-navy/50 font-medium">Selecciona una opción para que nuestro equipo técnico te acompañe.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => setChatView('form')} className="group flex items-center gap-5 p-5 bg-white border border-mjm-navy/5 rounded-2xl text-left transition-all hover:border-mjm-orange hover:shadow-xl hover:shadow-mjm-orange/10 active:scale-95">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-mjm-navy/5 text-mjm-navy flex items-center justify-center transition-colors group-hover:bg-mjm-orange group-hover:text-white">
                        <Package size={22} />
                      </div>
                      <span className="font-black text-mjm-navy text-[13px] uppercase tracking-widest flex-1">Programar entrega de instrumento</span>
                      <ArrowRight size={16} className="text-mjm-navy/10 group-hover:text-mjm-orange transition-all group-hover:translate-x-1" />
                    </button>
                    <a href="https://wa.me/573137960800" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 p-5 bg-white border border-mjm-navy/5 rounded-2xl text-left transition-all hover:border-mjm-orange hover:shadow-xl hover:shadow-mjm-orange/10 active:scale-95">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-mjm-navy/5 text-mjm-navy flex items-center justify-center transition-colors group-hover:bg-green-500 group-hover:text-white">
                        <MessageCircle size={22} />
                      </div>
                      <span className="font-black text-mjm-navy text-[13px] uppercase tracking-widest flex-1">Contactar asesor comercial</span>
                      <ArrowRight size={16} className="text-mjm-navy/10 group-hover:text-mjm-orange transition-all group-hover:translate-x-1" />
                    </a>
                  </div>
                </motion.div>
              )}

              {chatView === 'form' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <button onClick={handleReset} className="text-[10px] font-black uppercase tracking-widest text-mjm-navy/40 hover:text-mjm-orange transition-colors flex items-center gap-2">
                    Volver al inicio
                  </button>
                  <div className="space-y-6">
                    <div className="p-5 bg-mjm-navy/5 rounded-2xl border-l-4 border-mjm-orange">
                      <p className="text-[15px] font-bold text-mjm-navy leading-relaxed" dangerouslySetInnerHTML={{ __html: chatSteps[currentStep].question }} />
                    </div>
                    <div className="space-y-4">
                      {chatSteps[currentStep].type === 'textarea' ? (
                        <textarea
                          autoFocus value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleNext(); }}
                          placeholder={chatSteps[currentStep].placeholder}
                          className="w-full p-5 bg-white border border-mjm-navy/10 rounded-2xl focus:border-mjm-orange focus:ring-4 focus:ring-mjm-orange/5 outline-none transition-all font-medium text-sm min-h-[120px] resize-none"
                        />
                      ) : (
                        <input
                          autoFocus type={chatSteps[currentStep].type} value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleNext(); }}
                          placeholder={chatSteps[currentStep].placeholder}
                          className="w-full p-5 bg-white border border-mjm-navy/10 rounded-2xl focus:border-mjm-orange focus:ring-4 focus:ring-mjm-orange/5 outline-none transition-all font-medium text-sm"
                        />
                      )}
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-mjm-navy/30">
                        <span>Paso {currentStep + 1} de {chatSteps.length}</span>
                        <button
                          disabled={!inputValue.trim()} onClick={handleNext}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${inputValue.trim() ? 'bg-mjm-orange text-white shadow-lg shadow-mjm-orange/20' : 'bg-mjm-navy/5 text-mjm-navy/20 cursor-not-allowed'}`}
                        >
                          Continuar <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {chatView === 'loading' && (
                <div className="text-center py-24">
                  <div className="w-16 h-16 border-4 border-mjm-orange/20 border-t-mjm-orange rounded-full animate-spin mx-auto mb-8" />
                  <p className="text-sm font-black text-mjm-navy uppercase tracking-widest animate-pulse">Procesando tu solicitud...</p>
                </div>
              )}

              {chatView === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-10">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={40} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-mjm-navy tracking-tight leading-none">¡Información Recibida!</h4>
                    <p className="text-sm text-mjm-navy/60 font-medium">Gracias por confiar en MJM SAS. Hemos registrado tu solicitud correctamente.</p>
                  </div>
                  <p className="text-sm text-mjm-navy/80 font-bold bg-mjm-navy/5 p-6 rounded-2xl">Un especialista revisará los datos y se comunicará contigo en breve.</p>
                  <button onClick={handleReset} className="w-full py-4 bg-mjm-navy text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-mjm-navy/90 transition-all">
                    Listo, gracias
                  </button>
                </motion.div>
              )}
            </div>

            <div className="px-8 pb-8 pt-2">
              <div className="h-px bg-mjm-navy/5 mb-8" />
              <p className="text-center text-[9px] font-black uppercase tracking-[0.5em] text-mjm-navy/20">MJM • Soporte Metrológico</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <button
        onClick={toggleChat}
        className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center group border-b-4 active:border-b-0 active:translate-y-1 relative ${
          isOpen
            ? 'bg-mjm-navy text-white border-mjm-navy shadow-mjm-navy/20'
            : 'bg-mjm-orange text-white border-orange-700 shadow-mjm-orange/30 hover:-translate-y-1'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={28} /></motion.span>
            : <motion.span key="open"  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={28} className="group-hover:scale-110 transition-transform" /></motion.span>
          }
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white" />
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
