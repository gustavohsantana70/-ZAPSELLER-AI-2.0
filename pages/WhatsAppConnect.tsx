
import React, { useState, useEffect } from 'react';

interface WhatsAppConnectProps {
  onSuccess: (data: { number: string; name: string }) => void;
  onBack: () => void;
}

const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrKey, setQrKey] = useState(Date.now());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [instanceName, setInstanceName] = useState('Atendimento Principal');

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`].slice(-6));
  };

  const runConnectionSequence = () => {
    setLoading(true);
    setStep(2);
    
    const sequence = [
      { msg: "Iniciando túnel seguro SSL/TLS...", delay: 400 },
      { msg: "Isolando variáveis de ambiente...", delay: 900 },
      { msg: "Handshake com gateway sandbox OK.", delay: 1500 },
      { msg: "Ambiente protegido pronto para ativação.", delay: 2000 },
    ];

    sequence.forEach((item, index) => {
      setTimeout(() => {
        addLog(item.msg);
        if (index === sequence.length - 1) setLoading(false);
      }, item.delay);
    });
  };

  const simulateScan = () => {
    if (phoneNumber.length < 10) {
      addLog("ERRO: Número de telefone inválido.");
      alert("Por favor, insira um número de telefone válido antes de ativar.");
      return;
    }

    setLoading(true);
    addLog(`Vinculando número: ${phoneNumber}...`);
    
    setTimeout(() => addLog("Sincronizando banco de dados local..."), 600);
    setTimeout(() => addLog("Protegendo credenciais de acesso..."), 1200);
    setTimeout(() => addLog("Instância ativada em modo seguro."), 1800);
    
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2500);
  };

  useEffect(() => {
    if (step === 2 && !loading) {
      const interval = setInterval(() => setQrKey(Date.now()), 15000);
      return () => clearInterval(interval);
    }
  }, [step, loading]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-mono">
      <div className="max-w-5xl w-full bg-[#111] rounded-[40px] border border-white/10 shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col md:flex-row">
        
        {/* Terminal Info */}
        <div className="p-10 md:p-16 flex-1 bg-gradient-to-br from-emerald-950/30 to-black">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <i className="fab fa-whatsapp"></i>
            </div>
            <h2 className="text-white text-2xl font-black tracking-tighter uppercase leading-none">
              ZapSeller<br/><span className="text-emerald-500 text-sm">Nexus Core</span>
            </h2>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-black/60 rounded-3xl border border-emerald-500/10">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Segurança do Sistema</span>
               </div>
               <div className="space-y-2">
                  {logs.length === 0 && <p className="text-white/20 text-xs italic">Aguardando inicialização do túnel...</p>}
                  {logs.map((log, i) => (
                    <p key={i} className="text-emerald-400/80 text-[11px] leading-none animate-in fade-in slide-in-from-left-2">{log}</p>
                  ))}
               </div>
            </div>

            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
               <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2"><i className="fas fa-shield-alt mr-2"></i>Ambiente Protegido</p>
               <p className="text-white/40 text-[10px] leading-relaxed font-sans font-medium">
                 O modo manual permite vincular seu número diretamente ao nosso cérebro de IA sem necessidade de leitura física de tela.
               </p>
            </div>
          </div>

          <button onClick={onBack} className="mt-12 text-white/40 hover:text-white text-xs font-bold transition-colors">
            ← Sair da Conexão
          </button>
        </div>

        {/* Action Area */}
        <div className="flex-1 p-12 bg-white flex flex-col items-center justify-center text-center relative overflow-hidden">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500 max-w-xs">
              <div className="w-48 h-48 bg-slate-50 rounded-[48px] flex items-center justify-center border-2 border-slate-100 border-dashed mx-auto relative group cursor-pointer" onClick={runConnectionSequence}>
                <i className="fas fa-lock text-6xl text-slate-200 group-hover:text-emerald-500 group-hover:scale-110 transition-all"></i>
              </div>
              <h3 className="text-slate-900 font-black text-2xl tracking-tight leading-tight">Vincular Atendimento</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed font-sans">Abra o painel de conexão seguro para ativar seu vendedor virtual.</p>
              <button 
                onClick={runConnectionSequence} 
                className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95"
              >
                Abrir Gateway
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500 w-full flex flex-col items-center">
              <div className="w-full max-w-xs space-y-4">
                 <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificação da Instância</label>
                    <input 
                      type="text"
                      value={instanceName}
                      onChange={(e) => setInstanceName(e.target.value)}
                      placeholder="Ex: Atendimento Suporte"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-slate-800"
                    />
                 </div>

                 <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Número de WhatsApp</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+55</span>
                      <input 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        placeholder="(00) 00000-0000"
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-slate-800"
                      />
                    </div>
                 </div>

                 <button 
                  onClick={simulateScan} 
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all disabled:opacity-50"
                 >
                   {loading ? 'Validando...' : 'Ativar Instância Manual'}
                   <i className="fas fa-shield-check"></i>
                 </button>
                 <p className="text-slate-400 text-[9px] font-bold font-sans">Ao clicar, você autoriza a IA a gerenciar o fluxo de mensagens neste número.</p>
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
                  <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2 tracking-tight">Sucesso!</h2>
                  <p className="text-slate-500 text-sm font-bold font-sans">
                    O número <b>+55 {phoneNumber}</b> foi vinculado com sucesso à instância <b>{instanceName}</b>.
                  </p>
               </div>
               <button 
                 onClick={() => onSuccess({ number: `+55 ${phoneNumber}`, name: instanceName })} 
                 className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-black transition-all"
               >
                 Ir para o Painel
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnect;
