import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Package, MessageCircle, CheckCircle, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';
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
  const [auditStep, setAuditStep]   = useState(0);
  const [auditAnswers, setAuditAnswers] = useState({ qty: '', urgency: '', storage: '' });

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
    setAuditStep(0);
    setAuditAnswers({ qty: '', urgency: '', storage: '' });
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
                    <button 
                      onClick={() => setChatView('audit_calculator')} 
                      className="group flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500/10 via-white to-white border border-[#f7931b]/40 rounded-2xl text-left transition-all hover:border-mjm-orange hover:shadow-xl hover:shadow-orange-500/10 active:scale-95 cursor-pointer"
                    >
                      <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-500/15 text-mjm-orange flex items-center justify-center transition-colors group-hover:bg-mjm-orange group-hover:text-white">
                        <ShieldCheck size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block font-black text-mjm-navy text-[13px] uppercase tracking-wider">
                          Evaluar Riesgo de Auditoría (60s)
                        </span>
                        <span className="block text-[11px] text-zinc-500 font-medium mt-0.5 truncate">
                          Diagnóstico exprés para ICONTEC / INVIMA
                        </span>
                      </div>
                      <ArrowRight size={16} className="text-mjm-orange transition-all group-hover:translate-x-1 shrink-0" />
                    </button>

                    <button onClick={() => setChatView('form')} className="group flex items-center gap-4 p-4 bg-white border border-mjm-navy/5 rounded-2xl text-left transition-all hover:border-mjm-orange hover:shadow-xl hover:shadow-mjm-orange/10 active:scale-95 cursor-pointer">
                      <div className="w-11 h-11 shrink-0 rounded-xl bg-mjm-navy/5 text-mjm-navy flex items-center justify-center transition-colors group-hover:bg-mjm-orange group-hover:text-white">
                        <Package size={20} />
                      </div>
                      <span className="font-black text-mjm-navy text-[13px] uppercase tracking-wider flex-1">Programar entrega de instrumento</span>
                      <ArrowRight size={16} className="text-mjm-navy/10 group-hover:text-mjm-orange transition-all group-hover:translate-x-1 shrink-0" />
                    </button>

                    <a href="https://wa.me/573159253952?text=Hola%20MJM,%20solicito%20contactar%20a%20un%20asesor%20comercial%20metrol%C3%B3gico." target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-4 bg-white border border-mjm-navy/5 rounded-2xl text-left transition-all hover:border-mjm-orange hover:shadow-xl hover:shadow-mjm-orange/10 active:scale-95 cursor-pointer">
                      <div className="w-11 h-11 shrink-0 rounded-xl bg-mjm-navy/5 text-mjm-navy flex items-center justify-center transition-colors group-hover:bg-green-500 group-hover:text-white">
                        <MessageCircle size={20} />
                      </div>
                      <span className="font-black text-mjm-navy text-[13px] uppercase tracking-wider flex-1">Contactar asesor comercial</span>
                      <ArrowRight size={16} className="text-mjm-navy/10 group-hover:text-mjm-orange transition-all group-hover:translate-x-1 shrink-0" />
                    </a>
                  </div>
                </motion.div>
              )}

              {chatView === 'audit_calculator' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <button onClick={handleReset} className="text-[10px] font-black uppercase tracking-widest text-mjm-navy/40 hover:text-mjm-orange transition-colors flex items-center gap-2 cursor-pointer">
                    ← Volver al inicio
                  </button>

                  {auditStep === 0 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-500/10 rounded-2xl border-l-4 border-mjm-orange">
                        <span className="text-[10px] font-mono font-bold text-mjm-orange uppercase">Paso 1 de 3</span>
                        <p className="text-sm font-bold text-mjm-navy mt-1">¿Cuántos instrumentos de medición operan en su planta?</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {['Menos de 25 instrumentos', '25 a 100 instrumentos', 'Más de 100 instrumentos'].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setAuditAnswers(prev => ({ ...prev, qty: opt }));
                              setAuditStep(1);
                            }}
                            className="p-3.5 bg-white border border-mjm-navy/10 hover:border-mjm-orange rounded-xl text-left font-bold text-xs text-mjm-navy transition-all hover:shadow-md cursor-pointer flex items-center justify-between"
                          >
                            <span>{opt}</span>
                            <ArrowRight size={14} className="text-mjm-navy/30" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {auditStep === 1 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-500/10 rounded-2xl border-l-4 border-mjm-orange">
                        <span className="text-[10px] font-mono font-bold text-mjm-orange uppercase">Paso 2 de 3</span>
                        <p className="text-sm font-bold text-mjm-navy mt-1">¿Cuándo está programada su próxima auditoría de calidad?</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { label: 'Menos de 30 días (Urgente)', val: 'critico' },
                          { label: 'De 1 a 3 meses (Preventivo)', val: 'medio' },
                          { label: 'Más de 3 meses / Rutinaria', val: 'bajo' }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => {
                              setAuditAnswers(prev => ({ ...prev, urgency: opt.label }));
                              setAuditStep(2);
                            }}
                            className="p-3.5 bg-white border border-mjm-navy/10 hover:border-mjm-orange rounded-xl text-left font-bold text-xs text-mjm-navy transition-all hover:shadow-md cursor-pointer flex items-center justify-between"
                          >
                            <span>{opt.label}</span>
                            <ArrowRight size={14} className="text-mjm-navy/30" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {auditStep === 2 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-500/10 rounded-2xl border-l-4 border-mjm-orange">
                        <span className="text-[10px] font-mono font-bold text-mjm-orange uppercase">Paso 3 de 3</span>
                        <p className="text-sm font-bold text-mjm-navy mt-1">¿Dónde custodian actualmente los certificados y hojas de vida?</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {['Carpetas físicas / Archivador AZ', 'Hojas de cálculo de Excel', 'Plataforma o Software en la nube'].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setAuditAnswers(prev => ({ ...prev, storage: opt }));
                              setAuditStep(3);
                            }}
                            className="p-3.5 bg-white border border-mjm-navy/10 hover:border-mjm-orange rounded-xl text-left font-bold text-xs text-mjm-navy transition-all hover:shadow-md cursor-pointer flex items-center justify-between"
                          >
                            <span>{opt}</span>
                            <ArrowRight size={14} className="text-mjm-navy/30" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {auditStep === 3 && (
                    <div className="space-y-5 text-center">
                      <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 font-mono text-[10px] font-extrabold uppercase">
                          <AlertTriangle size={14} />
                          <span>Diagnóstico Preliminar: Riesgo Potencial</span>
                        </div>
                        <h4 className="font-black text-base text-mjm-navy">Vulnerable a Hallazgos de Auditoría</h4>
                        <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                          La custodia en <strong>{auditAnswers.storage}</strong> para <strong>{auditAnswers.qty}</strong> presenta una alta probabilidad de no-conformidad por trazabilidad o cálculo GUM.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <a
                          href={`https://wa.me/573159253952?text=${encodeURIComponent(`Hola MJM, realicé el diagnóstico de auditoría: Tengo ${auditAnswers.qty}, auditoría en "${auditAnswers.urgency}" y custodio en "${auditAnswers.storage}". Requiero acompañamiento técnico preventivo.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer font-space"
                        >
                          <MessageCircle size={16} />
                          <span>Solicitar Aseguramiento en Planta (WhatsApp)</span>
                        </a>

                        <button
                          onClick={handleReset}
                          className="w-full py-2.5 text-[11px] font-bold text-zinc-500 hover:text-mjm-orange transition-colors cursor-pointer"
                        >
                          Reiniciar Evaluación
                        </button>
                      </div>
                    </div>
                  )}
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

      {/* Botón flotante: Cápsula de Cristal de Titanio */}
      <button
        onClick={toggleChat}
        className={`group flex items-center gap-3 p-1.5 pl-4 pr-1.5 rounded-full backdrop-blur-xl transition-all duration-300 shadow-2xl cursor-pointer ${
          isOpen
            ? 'bg-zinc-900/95 text-white border border-white/20 shadow-black/80'
            : 'bg-[#090f1d]/90 text-white border border-white/20 hover:border-[#f7931b]/60 shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_10px_35px_rgba(247,147,27,0.25)] hover:scale-[1.02]'
        }`}
        title="Asistente Metrológico MJM"
      >
        {/* Etiqueta descriptiva en desktop */}
        {!isOpen && (
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="font-space font-extrabold text-xs uppercase tracking-wider text-white group-hover:text-[#f7931b] transition-colors leading-none">
              Asistencia Técnica
            </span>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 mt-1 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>En Línea 24/7</span>
            </span>
          </div>
        )}

        {/* Insignia Circular con Ícono */}
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform duration-300 ${
          isOpen
            ? 'bg-white/10 text-white rotate-90'
            : 'bg-[#f7931b] text-zinc-950 shadow-lg shadow-orange-500/30 group-hover:scale-105'
        }`}>
          <AnimatePresence mode="wait">
            {isOpen
              ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={20} /></motion.span>
              : <motion.span key="open"  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} className="text-zinc-950" /></motion.span>
            }
          </AnimatePresence>
        </div>
      </button>
    </div>
  );
};

export default ChatbotWidget;
