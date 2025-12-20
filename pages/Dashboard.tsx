
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
            <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Painel de Vendas</h1>
            <p className="text-slate-500 font-bold text-sm">Status: 
               <span className={`ml-2 px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${user.plan === 'free' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                 {user.plan === 'free' ? 'Automação Limitada' : `Vendedor ${user.plan.toUpperCase()} Ativo`}
               </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] shadow-sm border border-slate-100">
          <div className="px-4 py-2 border-r border-slate-100 hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Créditos IA</p>
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

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Left Column: Stats and Product */}
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
                    <h2 className="text-2xl font-black tracking-tight">Cérebro IA Configurado</h2>
                    <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">{product.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate(AppStatus.PRODUCT_CONFIG)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black text-xs border border-white/10 uppercase tracking-widest transition-all"
                >
                  Editar Treinamento
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Status do Vendedor</p>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></span>
                    <span className="font-black text-xl">Venda Ativa 24h</span>
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Método Ativo</p>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-truck-fast text-xl text-white"></i>
                    <span className="font-black text-xl">Pagamento na Entrega</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tester Card */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer hover:border-emerald-200 transition-all" onClick={() => onNavigate(AppStatus.SIMULATOR)}>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center text-3xl shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <i className="fab fa-whatsapp"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Testar Conversa IA</h3>
                <p className="text-slate-500 font-medium">Veja como seu vendedor virtual responde aos leads.</p>
              </div>
            </div>
            <i className="fas fa-arrow-right text-slate-200 text-2xl group-hover:text-emerald-500 transition-all group-hover:translate-x-2"></i>
          </div>
        </div>

        {/* Right Column: Accounts */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Números</h2>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">{accounts.length} / {maxAccounts}</span>
            </div>

            <div className="space-y-4 flex-1">
              {accounts.map(acc => (
                <div key={acc.id} className="p-5 bg-slate-50 rounded-[32px] flex items-center gap-4 group hover:bg-white border border-transparent hover:border-emerald-100 transition-all">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 text-xl shadow-sm">
                    <i className="fab fa-whatsapp"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest truncate">{acc.name}</p>
                    <p className="text-sm text-slate-400 font-bold truncate">{acc.number}</p>
                  </div>
                  <button onClick={() => onRemoveAccount(acc.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-200 hover:text-red-500 transition-all">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigate(AppStatus.WHATSAPP_CONNECT)}
              disabled={isAtLimit}
              className={`w-full mt-10 py-5 rounded-[24px] font-black transition-all text-sm uppercase tracking-widest ${isAtLimit ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-xl'}`}
            >
              {isAtLimit ? 'Limite de Números' : 'Conectar Novo Número'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
