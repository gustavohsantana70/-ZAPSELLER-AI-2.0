
import React, { useState, useRef, useEffect } from 'react';
import { AppStatus, User, Message } from '../types';
import { getGeminiResponse } from '../services/gemini';

interface SidebarProps {
  user: User;
  currentStatus: AppStatus;
  onNavigate: (status: AppStatus) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentStatus, onNavigate, onLogout, isOpen, setIsOpen }) => {
  const [isVipChatOpen, setIsVipChatOpen] = useState(false);
  const [vipMessages, setVipMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou seu Gerente de Sucesso VIP. Como posso ajudar você a escalar suas vendas hoje?', timestamp: new Date() }
  ]);
  const [vipInput, setVipInput] = useState('');
  const [isVipTyping, setIsVipTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: AppStatus.DASHBOARD, icon: 'fa-chart-line', label: 'Dashboard' },
    { id: AppStatus.PRODUCT_CONFIG, icon: 'fa-box-open', label: 'Produto & IA' },
    { id: AppStatus.SIMULATOR, icon: 'fa-comments', label: 'Simulador IA' },
    { id: AppStatus.REPORTS, icon: 'fa-chart-pie', label: 'Relatórios' },
    { id: AppStatus.PRICING, icon: 'fa-crown', label: 'Minha Assinatura', color: 'text-amber-400' },
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [vipMessages, isVipTyping]);

  const handleSendVipMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipInput.trim() || isVipTyping) return;

    const userMsg: Message = { role: 'user', text: vipInput, timestamp: new Date() };
    const newHistory = [...vipMessages, userMsg];
    setVipMessages(newHistory);
    setVipInput('');
    setIsVipTyping(true);

    try {
      const response = await getGeminiResponse(
        newHistory,
        { id: '', name: '', price: '', benefits: '', paymentMethod: '' }, // Produto vazio para suporte
        undefined,
        undefined,
        user.plan,
        true // Indica que é Suporte VIP
      );
      setVipMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVipTyping(false);
    }
  };

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-emerald-600 text-white p-2 rounded-lg shadow-lg"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-emerald-900 text-white transition-all duration-300 overflow-hidden flex flex-col h-screen sticky top-0 z-40 shadow-xl`}>
        <div className="p-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#22c55e] w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-base italic tracking-tighter shrink-0">
              zs
            </div>
            <div className="flex flex-col font-black tracking-tighter leading-none">
              <span className="text-white text-lg">ZAPSELLER</span>
              <span className="text-[#22c55e] text-lg">AI</span>
            </div>
          </div>
          
          {user.plan === 'pro' && (
            <div className="mt-4 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[9px] font-black text-center text-emerald-400 uppercase tracking-widest">
               🚀 ESCALA MÁXIMA PRO
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentStatus === item.id 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <i className={`fas ${item.icon} w-5 ${item.color || ''}`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {user.plan === 'pro' && (
          <div className="px-4 mb-4">
             <div className="p-4 bg-emerald-800/50 rounded-2xl border border-emerald-700/50">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">SUPORTE VIP</p>
                <button 
                  onClick={() => setIsVipChatOpen(true)}
                  className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 text-white py-2.5 rounded-xl text-sm font-bold transition-all border border-emerald-500/30 shadow-sm"
                >
                   Chamar Gerente
                </button>
             </div>
          </div>
        )}

        <div className="p-4 border-t border-emerald-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-300 hover:bg-emerald-800 hover:text-white transition-all"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* VIP Chat Modal Overlay */}
      {isVipChatOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end p-4 md:p-8 pointer-events-none">
          <div className="w-full max-w-md h-[600px] bg-white rounded-[32px] shadow-2xl border border-emerald-100 flex flex-col pointer-events-auto animate-in slide-in-from-bottom-10">
            {/* Header */}
            <div className="bg-emerald-900 text-white p-6 rounded-t-[32px] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-lg shadow-lg">
                  <i className="fas fa-user-tie"></i>
                </div>
                <div>
                  <h3 className="font-black text-sm">Gerente VIP</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Online Agora</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsVipChatOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {vipMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none shadow-sm border border-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isVipTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2 rounded-2xl shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                    Gerente VIP está digitando...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendVipMessage} className="p-4 bg-white rounded-b-[32px] border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <input 
                  value={vipInput}
                  onChange={(e) => setVipInput(e.target.value)}
                  placeholder="Diga sua dúvida estratégica..."
                  className="flex-1 bg-transparent py-3 outline-none text-sm text-slate-800 font-medium placeholder:text-slate-400"
                />
                <button type="submit" className="text-emerald-600 hover:scale-110 transition-transform p-2 disabled:opacity-50" disabled={isVipTyping}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
