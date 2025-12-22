
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
              <h1 className="text-3xl font-black tracking-tight leading-none uppercase">Conectar<br/>WhatsApp</h1>
            </div>
            <p className="text-emerald-200 font-medium leading-relaxed max-w-xs">
              Siga os passos no seu celular real apenas para fins de teste no simulador.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {[
              { step: '01', text: 'Abra o WhatsApp no celular' },
              { step: '02', text: 'Vá em Aparelhos Conectados' },
              { step: '03', text: 'Aponte para o QR Code ao lado' },
              { step: '04', text: 'Clique no botão verde após 2 segundos' }
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
              <h3 className="text-slate-900 font-black text-2xl">Gerar Pareamento</h3>
              <button onClick={handleGenerateQR} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs">Iniciar Conexão</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500 w-full flex flex-col items-center">
              <div className="relative">
                <div className={`w-64 h-64 bg-white shadow-2xl rounded-[48px] p-8 border border-slate-100 transition-all ${loading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ZapSellerAI" alt="QR Code" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-[48px] pointer-events-none"></div>
                </div>
                {!loading && (
                   <p className="mt-4 text-[10px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">QR Code Simulado - Não escaneie</p>
                )}
              </div>
              
              {showConfirmButton ? (
                <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
                   <p className="text-emerald-600 text-[10px] font-black uppercase mb-4">Código Reconhecido pelo Servidor!</p>
                   <button onClick={handleSimulateScan} className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 flex items-center justify-center gap-3">
                     {loading ? 'Sincronizando...' : 'Concluir Vinculação'}
                     <i className="fas fa-check"></i>
                   </button>
                </div>
              ) : (
                <p className="text-slate-400 text-xs font-bold animate-pulse">Aguardando resposta do servidor...</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in zoom-in duration-700 flex flex-col items-center text-center">
               <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-[48px] flex items-center justify-center shadow-xl">
                  <i className="fas fa-check text-5xl"></i>
               </div>
               <h2 className="text-3xl font-black text-slate-900">WhatsApp Conectado!</h2>
               <p className="text-slate-500 text-sm font-bold">O vendedor virtual agora assumirá todas as mensagens recebidas neste número.</p>
               <button onClick={onSuccess} className="w-full bg-emerald-600 text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-100">Abrir Painel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnect;
