
import React from 'react';
import { Product, AppStatus, WhatsAppAccount, User } from '../types';

interface DashboardProps {
  user: User;
  product: Product;
  accounts: WhatsAppAccount[];
  onNavigate: (status: AppStatus) => void;
  onRemoveAccount: (id: string) => void;
  onConfigKey: () => void;
  hasApiKey: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, product, accounts, onNavigate, onRemoveAccount, onConfigKey, hasApiKey }) => {
  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
      {!hasApiKey && (
        <div className="bg-red-50 border-2 border-red-200 p-8 rounded-[32px] animate-in fade-in slide-in-from-top-4 shadow-xl shadow-red-100/50">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div>
                <h3 className="text-slate-900 font-black text-lg">IA Desconectada (Erro de Chave)</h3>
                <p className="text-slate-500 text-sm font-bold max-w-md">Sua chave de API não foi detectada ou é inválida. Certifique-se de usar uma chave de um projeto com 
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-red-600 underline mx-1">faturamento ativo</a> 
                  para usar os modelos Pro.
                </p>
              </div>
            </div>
            <button 
              onClick={onConfigKey}
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-200"
            >
              Configurar Chave Agora
            </button>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel de Operações</h1>
          <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">ZapSeller AI v2.5</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Plano Ativo</span>
          <span className="text-emerald-600 font-black text-sm uppercase">{user.plan}</span>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-2xl font-black mb-4">IA Treinada para: {product.name}</h2>
                <div className="flex gap-4">
                  <button onClick={() => onNavigate(AppStatus.SIMULATOR)} className="bg-emerald-600 px-8 py-3 rounded-xl font-black text-xs uppercase">Abrir Simulador</button>
                  <button onClick={() => onNavigate(AppStatus.PRICING)} className="bg-white/10 px-8 py-3 rounded-xl font-black text-xs uppercase">Ver Planos</button>
                </div>
             </div>
             <i className="fab fa-whatsapp absolute -right-10 -bottom-10 text-[200px] opacity-10"></i>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 h-full">
           <h3 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Contas Conectadas</h3>
           <div className="space-y-4">
              {accounts.map(acc => (
                <div key={acc.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                   <span className="font-black text-xs">{acc.number}</span>
                   <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                </div>
              ))}
              <button onClick={() => onNavigate(AppStatus.WHATSAPP_CONNECT)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-[10px] uppercase hover:border-emerald-500 hover:text-emerald-600 transition-all">
                 + Conectar Novo Número
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
