
import React from 'react';
import { Product, AppStatus, WhatsAppAccount, User } from '../types';
import { PLANS_CONFIG } from '../App';

interface DashboardProps {
  user: User;
  product: Product;
  accounts: WhatsAppAccount[];
  onNavigate: (status: AppStatus) => void;
  onRemoveAccount: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, product, accounts, onNavigate, onRemoveAccount }) => {
  const currentPlanConfig = PLANS_CONFIG[user.plan];
  const maxAccounts = currentPlanConfig.maxAccounts;
  const isAtLimit = accounts.length >= maxAccounts;
  const maxMessages = currentPlanConfig.maxMessages;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-emerald-600 w-16 h-16 rounded-[24px] flex items-center justify-center text-white font-black text-3xl italic tracking-tighter shadow-xl shadow-emerald-200">
            zs
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Painel de Operações</h1>
            <p className="text-slate-500 font-bold text-sm">Escala: 
               <span className={`ml-2 px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${user.plan === 'free' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                 {user.plan === 'free' ? 'Monitoramento Manual' : `IA Ativa - ${user.plan.toUpperCase()}`}
               </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] shadow-sm border border-slate-100">
          <div className="px-4 py-2 border-r border-slate-100 hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mensagens IA</p>
            <p className="text-sm font-black text-slate-900">{user.messagesSent} / {maxMessages === Infinity ? '∞' : maxMessages}</p>
          </div>
          {user.plan !== 'pro' && (
            <button 
              onClick={() => onNavigate(AppStatus.PRICING)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-widest"
            >
              Fazer Upgrade
            </button>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Stats Box */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Conversas', value: accounts.length > 0 ? (12 * accounts.length).toString() : '0', icon: 'fa-comments', color: 'text-emerald-600' },
              { label: 'Leads Captados', value: accounts.length > 0 ? (24 * accounts.length).toString() : '0', icon: 'fa-user-plus', color: 'text-blue-600' },
              { label: 'Vendas CoD', value: '0', icon: 'fa-shopping-cart', color: 'text-purple-600' },
              { label: 'Faturamento', value: '0,00', icon: 'fa-wallet', color: 'text-amber-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <i className={`fas ${stat.icon} ${stat.color} mb-4 text-xl`}></i>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.label === 'Faturamento' ? 'R$ ' : ''}{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* AI Setup Card */}
          <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <i className="fas fa-brain text-[140px]"></i>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Vendedor Virtual Ativo</h2>
                    <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">IA treinada com Google Gemini</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate(AppStatus.PRODUCT_CONFIG)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black text-xs border border-white/10 uppercase tracking-widest transition-all"
                >
                  Configurar IA
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Treinamento Atual</p>
                  <p className="font-bold text-slate-200 truncate">{product.name}</p>
                </div>
                <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Simulação</p>
                  <button onClick={() => onNavigate(AppStatus.SIMULATOR)} className="text-white font-black hover:text-emerald-400 transition-colors flex items-center gap-2">
                    Testar Chat Agora <i className="fas fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Central */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">WhatsApp</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Slots: {accounts.length}/{maxAccounts}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <i className="fab fa-whatsapp text-xl"></i>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {accounts.length === 0 ? (
                <div className="text-center py-12 px-6 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium mb-6">Comece conectando seu número de atendimento.</p>
                  <button onClick={() => onNavigate(AppStatus.WHATSAPP_CONNECT)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Vincular Número</button>
                </div>
              ) : (
                accounts.map(acc => (
                  <div key={acc.id} className="p-5 bg-slate-50 rounded-[32px] border border-transparent hover:border-emerald-100 transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="relative">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 text-xl shadow-sm">
                          <i className="fab fa-whatsapp"></i>
                        </div>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest truncate">{acc.name}</p>
                        <p className="text-[11px] text-slate-400 font-bold truncate">{acc.number}</p>
                      </div>
                      <button onClick={() => onRemoveAccount(acc.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!isAtLimit && accounts.length > 0 && (
              <button 
                onClick={() => onNavigate(AppStatus.WHATSAPP_CONNECT)}
                className="w-full mt-8 bg-slate-100 text-slate-900 py-5 rounded-[24px] font-black hover:bg-slate-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <i className="fas fa-plus text-[10px]"></i>
                Novo Número
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
