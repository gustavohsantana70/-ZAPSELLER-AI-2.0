
import React, { useState } from 'react';
import { AppStatus } from '../types';

interface WhatsAppConnectProps {
  onSuccess: () => void;
  onBack: () => void;
}

const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  const handleGenerateQR = () => {
    setLoading(true);
    setStep(2);
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowConfirmButton(true), 2000);
    }, 1500);
  };

  const handleSimulateScan = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 min-h-[600px]">
        
        <div className="p-10 md:p-14 flex-1 space-y-10 bg-emerald-900 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl border border-white/10">
                <i className="fab fa-whatsapp"></i>
              </div>
              <h1 className="text-3xl font-black tracking-tight leading-none uppercase">Conectar<br/>Atendimento</h1>
            </div>
            <p className="text-emerald-200 font-medium leading-relaxed max-w-xs">
              Conecte sua instância para ativar a inteligência artificial de vendas.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {[
              { step: '01', text: 'Abra o WhatsApp no celular' },
              { step: '02', text: 'Vá em Aparelhos Conectados' },
              { step: '03', text: 'Aponte a câmera para o código' },
              { step: '04', text: 'Aguarde a sincronização da IA' }
            ].map((item, i) => (
              <div key={i} className="flex gap-5 items-center">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-emerald-400">{item.step}</div>
                <p className="text-emerald-100 text-sm font-bold opacity-80">{item.text}</p>
              </div>
            ))}
          </div>

          <button onClick={onBack} className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mt-10 hover:text-white transition-colors">
            ← Cancelar e Voltar
          </button>
        </div>

        <div className="flex-1 p-12 bg-white flex flex-col items-center justify-center text-center">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-48 h-48 bg-slate-50 rounded-[48px] p-8 flex items-center justify-center border-2 border-slate-100 border-dashed mx-auto">
                <i className="fas fa-qrcode text-7xl text-slate-200"></i>
              </div>
              <h3 className="text-slate-900 font-black text-2xl">Ativação de Instância</h3>
              <button onClick={handleGenerateQR} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200">Gerar Token de Conexão</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500 w-full flex flex-col items-center">
              <div className="relative">
                <div className={`w-64 h-64 bg-white shadow-2xl rounded-[48px] p-8 border border-slate-100 flex items-center justify-center transition-all ${loading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                   <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ZapSellerAI-Production-Auth" 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                  />
                  {!loading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[scan_3s_linear_infinite]"></div>
                  )}
                </div>
              </div>
              
              {showConfirmButton ? (
                <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
                   <p className="text-emerald-600 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Autenticação Detectada!</p>
                   <button onClick={handleSimulateScan} className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 flex items-center justify-center gap-3">
                     {loading ? 'Sincronizando...' : 'Concluir Conexão'}
                     <i className="fas fa-check"></i>
                   </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                   <p className="text-slate-400 text-xs font-bold">Aguardando escaneamento do terminal...</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in zoom-in duration-700 flex flex-col items-center">
               <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-[48px] flex items-center justify-center shadow-xl">
                  <i className="fas fa-check text-5xl"></i>
               </div>
               <h2 className="text-3xl font-black text-slate-900 leading-tight">Sistema Conectado</h2>
               <p className="text-slate-500 text-sm font-bold">Sua IA agora está monitorando e respondendo leads em tempo real.</p>
               <button onClick={onSuccess} className="w-full bg-emerald-600 text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-100">Acessar Painel</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0.2; }
          50% { top: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppConnect;
