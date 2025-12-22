
import React, { useState, useEffect } from 'react';
import { AppStatus } from '../types';

interface WhatsAppConnectProps {
  onSuccess: () => void;
  onBack: () => void;
}

const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 2) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 min-h-[550px]">
        {/* Lado Esquerdo: Instruções de Onboarding */}
        <div className="p-10 md:p-14 flex-1 space-y-10 bg-emerald-900 text-white flex flex-col justify-center">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl">
                <i className="fab fa-whatsapp"></i>
              </div>
              <h1 className="text-3xl font-black tracking-tight leading-none">Vincular<br/>WhatsApp</h1>
            </div>
            <p className="text-emerald-200 font-medium leading-relaxed">Conecte seu número oficial para permitir que a IA do ZapSeller assuma o atendimento e fechamento das vendas.</p>
          </div>

          <div className="space-y-6">
            {[
              { step: '01', text: 'Abra o WhatsApp no seu celular' },
              { step: '02', text: 'Vá em Aparelhos Conectados' },
              { step: '03', text: 'Escaneie o QR Code ao lado' }
            ].map((item, i) => (
              <div key={i} className="flex gap-5 items-center group">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">{item.step}</div>
                <p className="text-emerald-100 text-sm font-bold">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <button 
              onClick={onBack}
              className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2"
            >
              <i className="fas fa-chevron-left text-[10px]"></i>
              Voltar ao painel
            </button>
          </div>
        </div>

        {/* Lado Direito: Scanner Realístico */}
        <div className="flex-1 p-12 bg-white flex flex-col items-center justify-center text-center">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="relative group cursor-pointer" onClick={() => setStep(2)}>
                <div className="w-56 h-56 bg-slate-50 rounded-[40px] p-8 flex items-center justify-center border-2 border-slate-100 border-dashed group-hover:border-emerald-500 transition-all shadow-inner">
                  <i className="fas fa-qrcode text-8xl text-slate-200 group-hover:text-emerald-500 transition-all"></i>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px] backdrop-blur-[2px]">
                  <span className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-xl uppercase tracking-widest">Gerar Token</span>
                </div>
              </div>
              <div>
                <h3 className="text-slate-900 font-black text-lg">Pronto para conectar?</h3>
                <p className="text-slate-400 text-xs font-medium mt-2">Clique no ícone para gerar seu código de acesso seguro.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500 w-full flex flex-col items-center">
              <div className="w-64 h-64 bg-white shadow-2xl rounded-[48px] p-6 border border-slate-100 relative overflow-hidden flex items-center justify-center">
                 {/* QR Code Container */}
                 <div className="relative w-full h-full">
                    <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ZapSellerAI-Demo-Connection" 
                        alt="QR Code" 
                        className={`w-full h-full object-contain transition-all duration-700 ${loading ? 'opacity-20 blur-md scale-90' : 'opacity-100'}`}
                    />
                    
                    {/* Scan Line Animation */}
                    {!loading && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[scan_3s_ease-in-out_infinite]"></div>
                    )}

                    {loading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sincronizando...</p>
                      </div>
                    )}
                 </div>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Aguardando Leitura</span>
                </div>
                <p className="text-slate-400 text-[10px] font-medium max-w-[200px]">Aponte a câmera do seu WhatsApp para este código agora.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in zoom-in duration-700 flex flex-col items-center">
               <div className="w-28 h-28 bg-emerald-50 text-emerald-600 rounded-[40px] flex items-center justify-center shadow-xl border border-emerald-100 relative">
                  <i className="fas fa-check text-4xl"></i>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs border-4 border-white animate-bounce">
                    <i className="fas fa-bolt"></i>
                  </div>
               </div>
               
               <div className="max-w-[280px]">
                 <h2 className="text-2xl font-black text-slate-900 leading-tight">Instância Ativa!</h2>
                 <p className="text-slate-500 text-sm mt-3 font-medium">Sua conta foi pareada com sucesso e a inteligência artificial já está operacional.</p>
               </div>

               <button 
                onClick={onSuccess}
                className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
               >
                 Acessar Minha Central
               </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppConnect;
