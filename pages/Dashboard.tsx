
import React from 'react';
import { Product, AppStatus, WhatsAppAccount, User } from '../types';
import { PLANS_CONFIG } from '../App';

interface DashboardProps {
  user: User;
  product: Product;
  accounts: WhatsAppAccount[];
  onNavigate: (status: AppStatus) => void;
  onRemoveAccount: (id: string) => void;
  onConfigKey?: () => void;
  hasApiKey?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, product, accounts, onNavigate, onRemoveAccount, onConfigKey, hasApiKey }) => {
  const currentPlanConfig = PLANS_CONFIG[user.plan];
  const maxAccounts = currentPlanConfig.maxAccounts;
  const isAtLimit = accounts.length >= maxAccounts;
  const maxMessages = currentPlanConfig.maxMessages;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 pb-24">
      {!hasApiKey && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-400 text-slate-900 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-amber-200">
              <i className="fas fa-key"></i>
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-sm">IA Desconectada</h3>
              <p className="text-slate-500 text-xs font-bold">Você precisa configurar sua chave de API do Google Gemini para ativar o vendedor virtual.</p>
            </div>
          </div>
          <button 
            onClick={onConfigKey}
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-200"
          >
            Configurar Chave Agora
          </button>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-emerald-600 w-16 h-16 rounded-[24px] flex items-center justify-center text-white font-black text-3xl italic tracking-tighter shadow-xl shadow-emerald-200">
            zs
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Painel de Controle</h1>
            <p className="text-slate-500 font-bold text-sm">Status da Operação: 
               <span className={`ml-2 px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${user.plan === 'free' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                 {user.plan === 'free' ? 'Modo Manual' : `IA Ativa - Plano ${user.plan.toUpperCase()}`}
               </span>
               {user.plan === 'pro' && (
                 <span className="ml-2 px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest bg-amber-100 text-amber-600">
                   Qualidade Máxima
                 </span>
               )}
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
              { label: 'Conversas', value: (12 * accounts.length).toString(), icon: 'fa-comments', color: 'text-emerald-600' },
              { label: 'Leads', value: (24 * accounts.length).toString(), icon: 'fa-user-plus', color: 'text-blue-600' },
              { label: 'Vendas CoD', value: (5 * accounts.length).toString(), icon: 'fa-shopping-cart', color: 'text-purple-600' },
              { label: 'R$ Total', value: (897 * accounts.length).toLocaleString('pt-BR'), icon: 'fa-wallet', color: 'text-amber-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <i className={`fas ${stat.icon} ${stat.color} mb-4 text-xl`}></i>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Product AI Card */}
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
                    <h2 className="text-2xl font-black tracking-tight">Configuração da IA</h2>
                    <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Produto Ativo: {product.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate(AppStatus.PRODUCT_CONFIG)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black text-xs border border-white/10 uppercase tracking-widest transition-all"
                >
                  Treinar Minha IA
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Qualificação Automática</p>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></span>
                    <span className="font-black text-xl">IA {user.plan === 'pro' ? 'Qualidade Máxima' : 'Ativa'}</span>
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Checkout Integrado</p>
                  <button onClick={() => onNavigate(AppStatus.SIMULATOR)} className="text-white font-black hover:text-emerald-400 transition-colors flex items-center gap-2">
                    {user.plan === 'pro' ? 'Checkout CoD Ativo' : 'Testar Chat Agora'} <i className="fas fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Central de Instâncias */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Minhas Contas</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Slots: {accounts.length}/{maxAccounts}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <i className="fab fa-whatsapp text-xl"></i>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {accounts.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium mb-4">Nenhum número conectado ainda.</p>
                  <button onClick={() => onNavigate(AppStatus.WHATSAPP_CONNECT)} className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">Vincular Agora</button>
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
                        <i className="fas fa-unlink text-sm"></i>
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                       <span className="text-emerald-600">IA Conectada</span>
                       <span className="text-slate-300">Sincronizado</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!isAtLimit && (
              <button 
                onClick={() => onNavigate(AppStatus.WHATSAPP_CONNECT)}
                className="w-full mt-8 bg-slate-900 text-white py-5 rounded-[24px] font-black hover:bg-black transition-all text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                <i className="fas fa-plus text-[10px]"></i>
                Conectar WhatsApp
              </button>
            )}
            
            {isAtLimit && user.plan !== 'pro' && (
              <button 
                onClick={() => onNavigate(AppStatus.PRICING)}
                className="w-full mt-8 bg-amber-400 text-slate-900 py-5 rounded-[24px] font-black hover:bg-amber-300 transition-all text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"
              >
                <i className="fas fa-crown text-[10px]"></i>
                Liberar Mais Slots
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
