
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
    // Simula um pequeno delay de "geração" do token de segurança
    setTimeout(() => {
      setLoading(false);
      // Após 2 segundos mostrando o QR, libera o botão de confirmar (simulando que o sistema detectou o início do pareamento)
      setTimeout(() => setShowConfirmButton(true), 2000);
    }, 1500);
  };

  const handleSimulateScan = () => {
    setLoading(true);
    // Simula a sincronização final de dados do WhatsApp
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 min-h-[600px]">
        
        {/* Lado Esquerdo: Instruções */}
        <div className="p-10 md:p-14 flex-1 space-y-10 bg-emerald-900 text-white flex flex-col justify-center relative overflow-hidden">
          {/* Efeito visual de fundo */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <i className="fab fa-whatsapp text-[300px] -translate-x-1/2 -translate-y-1/2"></i>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl border border-white/10">
                <i className="fab fa-whatsapp"></i>
              </div>
              <h1 className="text-3xl font-black tracking-tight leading-none uppercase">Conectar<br/>WhatsApp</h1>
            </div>
            <p className="text-emerald-200 font-medium leading-relaxed max-w-xs">
              Siga os passos para ativar seu vendedor virtual 24h e começar a fechar vendas automáticas.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {[
              { step: '01', text: 'Abra o WhatsApp no seu celular' },
              { step: '02', text: 'Toque em Menu ou Configurações' },
              { step: '03', text: 'Selecione Aparelhos Conectados' },
              { step: '04', text: 'Aponte a câmera para o QR Code' }
            ].map((item, i) => (
              <div key={i} className="flex gap-5 items-center group">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  {item.step}
                </div>
                <p className="text-emerald-100 text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 relative z-10">
            <button 
              onClick={onBack}
              className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2"
            >
              <i className="fas fa-arrow-left text-[10px]"></i>
              Cancelar e voltar
            </button>
          </div>
        </div>

        {/* Lado Direito: Área de Interação */}
        <div className="flex-1 p-12 bg-white flex flex-col items-center justify-center text-center">
          
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in zoom-in duration-500 max-w-xs">
              <div className="w-48 h-48 bg-slate-50 rounded-[48px] p-8 flex items-center justify-center border-2 border-slate-100 border-dashed mx-auto relative group">
                <i className="fas fa-qrcode text-7xl text-slate-200 group-hover:text-emerald-500 transition-all duration-500"></i>
                <div className="absolute -bottom-4 bg-white px-4 py-2 rounded-full shadow-md border border-slate-100">
                  <i className="fas fa-shield-alt text-emerald-600 text-xs mr-2"></i>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Criptografado</span>
                </div>
              </div>
              <div>
                <h3 className="text-slate-900 font-black text-2xl tracking-tight">Pareamento Seguro</h3>
                <p className="text-slate-400 text-sm font-medium mt-3 leading-relaxed">
                  Clique no botão abaixo para gerar o seu QR Code único de acesso.
                </p>
              </div>
              <button 
                onClick={handleGenerateQR}
                className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-xs"
              >
                Gerar Meu QR Code
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500 w-full flex flex-col items-center">
              <div className="relative">
                <div className={`w-64 h-64 bg-white shadow-2xl rounded-[48px] p-8 border border-slate-100 flex items-center justify-center transition-all duration-500 ${loading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                  <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ZapSellerAI-Session-Active" 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                  />
                  {!loading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[scan_3s_linear_infinite]"></div>
                  )}
                </div>

                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Iniciando Servidor...</p>
                  </div>
                )}
              </div>
              
              <div className="max-w-[280px]">
                {!showConfirmButton ? (
                   <>
                     <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-100 mb-4">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Aguardando Escaneamento</span>
                     </div>
                     <p className="text-slate-400 text-xs font-bold leading-relaxed">
                       Não feche esta janela. O código expira em 60 segundos por segurança.
                     </p>
                   </>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <p className="text-emerald-600 text-sm font-black uppercase tracking-widest bg-emerald-50 py-2 rounded-xl">Código Escaneado!</p>
                    <button 
                      onClick={handleSimulateScan}
                      disabled={loading}
                      className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                    >
                      {loading ? 'Finalizando...' : 'Concluir Vinculação'}
                      <i className="fas fa-check"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in zoom-in duration-700 flex flex-col items-center">
               <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-[48px] flex items-center justify-center shadow-xl border border-emerald-100 relative">
                  <i className="fas fa-check text-5xl"></i>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-lg border-4 border-white animate-bounce shadow-lg">
                    <i className="fab fa-whatsapp"></i>
                  </div>
               </div>
               
               <div className="max-w-[300px]">
                 <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Parabéns!</h2>
                 <p className="text-slate-500 text-sm mt-4 font-bold leading-relaxed">
                   Sua conta foi conectada. A partir de agora, a IA do ZapSeller responderá todos os seus novos leads.
                 </p>
               </div>

               <div className="w-full space-y-4">
                 <button 
                  onClick={onSuccess}
                  className="w-full bg-emerald-600 text-white py-6 rounded-[28px] font-black shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.2em] text-xs"
                 >
                   Ir para o Dashboard
                 </button>
               </div>
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
