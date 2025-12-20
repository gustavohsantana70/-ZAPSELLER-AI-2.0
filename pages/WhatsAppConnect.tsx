
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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        {/* Left Side: Instructions */}
        <div className="p-8 md:p-12 flex-1 space-y-8 bg-emerald-900 text-white">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="bg-[#22c55e] w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm italic tracking-tighter shrink-0">
                zs
              </div>
              <div className="flex items-center text-xl font-black tracking-tighter">
                <span className="text-white">ZAPSELLER</span>
                <span className="text-[#22c55e] ml-1.5">AI</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold leading-tight">Conecte seu WhatsApp</h1>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <p className="text-emerald-100 text-sm">Abra o WhatsApp no seu celular.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <p className="text-emerald-100 text-sm">Toque em <span className="text-white font-bold">Configurações</span> ou <span className="text-white font-bold">Menu</span> e selecione <span className="text-white font-bold">Aparelhos Conectados</span>.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <p className="text-emerald-100 text-sm">Aponte a câmera para o código QR ao lado para começar a vender.</p>
            </div>
          </div>

          <button 
            onClick={onBack}
            className="text-emerald-300 text-xs font-bold hover:text-white transition-colors flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            CANCELAR E VOLTAR
          </button>
        </div>

        {/* Right Side: QR Code Area */}
        <div className="flex-1 p-12 bg-white flex flex-col items-center justify-center text-center relative">
          {step === 1 && (
            <div className="space-y-6">
              <div className="relative group cursor-pointer" onClick={() => setStep(2)}>
                <div className="w-48 h-48 bg-slate-100 rounded-3xl p-4 flex items-center justify-center border-2 border-slate-200 border-dashed group-hover:border-emerald-500 transition-all">
                  <i className="fas fa-qrcode text-8xl text-slate-300 group-hover:text-emerald-500 transition-all"></i>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                  <span className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg">GERAR QR CODE</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Aguardando geração do token</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="w-48 h-48 bg-white shadow-xl rounded-3xl p-2 border border-slate-200 relative overflow-hidden">
                 <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ZapSellerAI-Demo" 
                    alt="QR Code" 
                    className={`w-full h-full object-contain ${loading ? 'blur-sm grayscale' : ''}`}
                 />
                 {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                 )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-slate-700 font-bold">Escaneie para conectar</span>
                <p className="text-slate-400 text-[10px]">O código expira em 30 segundos.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in zoom-in duration-500">
               <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check text-4xl"></i>
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-slate-800">Conectado com sucesso!</h2>
                 <p className="text-slate-500 text-sm mt-2">Sua IA já está pronta para receber os primeiros clientes.</p>
               </div>
               <button 
                onClick={onSuccess}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
               >
                 IR PARA O DASHBOARD
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnect;
