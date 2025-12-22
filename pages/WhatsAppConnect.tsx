
import React, { useState, useEffect } from 'react';

interface WhatsAppConnectProps {
  onSuccess: () => void;
  onBack: () => void;
}

const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrKey, setQrKey] = useState(Date.now());

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`].slice(-6));
  };

  const runConnectionSequence = () => {
    setLoading(true);
    setStep(2);
    
    const sequence = [
      { msg: "Iniciando gateway de conexão...", delay: 500 },
      { msg: "Gerando par de chaves RSA-2048...", delay: 1200 },
      { msg: "Aguardando handshake do dispositivo...", delay: 2000 },
      { msg: "Terminal pronto para ativação em sandbox.", delay: 2500 },
    ];

    sequence.forEach((item, index) => {
      setTimeout(() => {
        addLog(item.msg);
        if (index === sequence.length - 1) setLoading(false);
      }, item.delay);
    });
  };

  const simulateScan = () => {
    setLoading(true);
    addLog("Comando de bypass (Ativação Manual) recebido...");
    
    setTimeout(() => addLog("Sincronizando banco de dados de leads..."), 800);
    setTimeout(() => addLog("Injetando protocolos de IA vendedora..."), 1600);
    setTimeout(() => addLog("Instância vinculada com sucesso ao Sandbox."), 2400);
    
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 3000);
  };

  useEffect(() => {
    if (step === 2 && !loading) {
      const interval = setInterval(() => setQrKey(Date.now()), 15000);
      return () => clearInterval(interval);
    }
  }, [step, loading]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-mono">
      <div className="max-w-5xl w-full bg-[#111] rounded-[40px] border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden flex flex-col md:flex-row">
        
        {/* Terminal Info */}
        <div className="p-10 md:p-16 flex-1 bg-gradient-to-br from-emerald-950/40 to-black">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <i className="fab fa-whatsapp"></i>
            </div>
            <h2 className="text-white text-2xl font-black tracking-tighter uppercase leading-none">
              Nexus<br/><span className="text-emerald-500">Gateway</span>
            </h2>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-black/40 rounded-3xl border border-emerald-500/20">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Console de Status</span>
               </div>
               <div className="space-y-2">
                  {logs.length === 0 && <p className="text-white/20 text-xs italic">Aguardando comando de inicialização...</p>}
                  {logs.map((log, i) => (
                    <p key={i} className="text-emerald-400/80 text-[11px] leading-none animate-in fade-in slide-in-from-left-2">{log}</p>
                  ))}
               </div>
            </div>

            <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
               <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2"><i className="fas fa-exclamation-triangle mr-2"></i>Atenção: Modo Simulação</p>
               <p className="text-white/60 text-[10px] leading-relaxed">
                 O QR Code é gerado para testes de interface. O app do WhatsApp não o reconhecerá. Utilize o botão <b>"Ativar Instância Manual"</b> para prosseguir.
               </p>
            </div>
          </div>

          <button onClick={onBack} className="mt-12 text-white/40 hover:text-white text-xs font-bold transition-colors">
            ← Voltar ao Dashboard
          </button>
        </div>

        {/* Action Area */}
        <div className="flex-1 p-12 bg-white flex flex-col items-center justify-center text-center relative overflow-hidden">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500 max-w-xs">
              <div className="w-48 h-48 bg-slate-50 rounded-[48px] flex items-center justify-center border-2 border-slate-100 border-dashed mx-auto relative group cursor-pointer" onClick={runConnectionSequence}>
                <i className="fas fa-network-wired text-6xl text-slate-200 group-hover:text-emerald-500 group-hover:scale-110 transition-all"></i>
              </div>
              <h3 className="text-slate-900 font-black text-2xl tracking-tight leading-tight">Vincular Número</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Inicie o servidor de conexão para sincronizar sua conta de atendimento em modo sandbox.</p>
              <button 
                onClick={runConnectionSequence} 
                className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95"
              >
                Gerar Gateway
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500 w-full flex flex-col items-center">
              <div className="relative group">
                <div className={`w-64 h-64 bg-white shadow-2xl rounded-[48px] p-8 border border-slate-100 flex items-center justify-center transition-all overflow-hidden ${loading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                   <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ZapSellerAI-Sandbox-${qrKey}`} 
                      alt="QR Code Simulado" 
                      className="w-full h-full object-contain pointer-events-none opacity-20 grayscale"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/60 backdrop-blur-[4px]">
                    <div className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
                      MODO SANDBOX
                    </div>
                    <p className="text-slate-600 text-[10px] mt-3 font-bold max-w-[140px] leading-tight">Não escaneie com o celular. Use o botão abaixo.</p>
                  </div>
                </div>
                {loading && (
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                   </div>
                )}
              </div>
              
              <div className="w-full max-w-xs space-y-4">
                 <button 
                  onClick={simulateScan} 
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all disabled:opacity-50 animate-pulse"
                 >
                   {loading ? 'Sincronizando...' : 'Ativar Instância Manual'}
                   <i className="fas fa-bolt"></i>
                 </button>
                 <p className="text-slate-400 text-[9px] font-bold">Clique no botão verde acima para simular a conexão e prosseguir para o teste da IA.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in zoom-in duration-700 flex flex-col items-center max-w-xs">
               <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-[48px] flex items-center justify-center shadow-2xl relative">
                  <i className="fas fa-check text-5xl"></i>
                  <div className="absolute -inset-4 border-2 border-emerald-500/20 rounded-[60px] animate-ping opacity-20"></div>
               </div>
               <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2 tracking-tight">Ativado!</h2>
                  <p className="text-slate-500 text-sm font-bold">Instância conectada no Sandbox. Agora você pode ir para o Simulador testar a IA.</p>
               </div>
               <button onClick={onSuccess} className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-black transition-all">Ir para o Painel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnect;
