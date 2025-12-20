
import React from 'react';
import { User } from '../types';

interface ReportsPageProps {
  user: User;
  onBack: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ user, onBack }) => {
  const isPro = user.plan === 'pro';

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20 space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
             <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Relatórios de Conversão</h1>
            <p className="text-slate-500 font-medium">Analise o desempenho do seu vendedor virtual em tempo real.</p>
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período:</span>
           <span className="text-xs font-black text-slate-900">Últimos 30 dias</span>
        </div>
      </header>

      {!isPro ? (
        <div className="bg-slate-900 text-white rounded-[40px] p-12 text-center flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10">
              <i className="fas fa-chart-pie text-[200px]"></i>
           </div>
           <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 relative z-10">
              <i className="fas fa-lock"></i>
           </div>
           <h2 className="text-4xl font-black max-w-md leading-tight relative z-10">Desbloqueie relatórios avançados de conversão</h2>
           <p className="text-slate-400 font-medium max-w-sm relative z-10">Usuários PRO têm acesso a funil de vendas completo, motivos de perda de leads e horários de maior pico.</p>
           <button className="bg-white text-slate-900 px-12 py-5 rounded-[24px] font-black text-lg hover:bg-emerald-500 hover:text-white transition-all shadow-xl relative z-10">
              👉 QUERO SER PRO
           </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Funnel Chart Mock */}
          <div className="md:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-8">Funil de Vendas</h3>
            <div className="space-y-6">
               {[
                 { label: 'Leads Captados', value: '1.240', color: 'bg-emerald-500', width: 'w-full' },
                 { label: 'Perguntaram Preço', value: '892', color: 'bg-emerald-400', width: 'w-3/4' },
                 { label: 'Informaram Dados CoD', value: '412', color: 'bg-emerald-300', width: 'w-1/2' },
                 { label: 'Vendas Confirmadas', value: '388', color: 'bg-emerald-600', width: 'w-1/3' },
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                       <span>{item.label}</span>
                       <span className="text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full ${item.color} ${item.width} rounded-full transition-all duration-1000`}></div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6">Motivos de Perda</h3>
                <div className="space-y-4">
                   {[
                     { label: 'Dúvida Produto', perc: '45%' },
                     { label: 'Preço/Valor', perc: '30%' },
                     { label: 'Insegurança CoD', perc: '15%' },
                     { label: 'Outros', perc: '10%' },
                   ].map((m, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="text-sm font-bold text-slate-600">{m.label}</span>
                        <span className="text-sm font-black text-emerald-600">{m.perc}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-emerald-600 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden group">
                <div className="relative z-10">
                   <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Dica da IA PRO 💡</p>
                   <p className="text-sm font-bold leading-relaxed">Detectamos que 60% dos seus leads param de responder após as 20h. Sugerimos ativar o Follow-up de 12h.</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                   <i className="fas fa-lightbulb"></i>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
