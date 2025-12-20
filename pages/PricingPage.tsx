
import React from 'react';
import { PlanType } from '../types';

interface PricingPageProps {
  currentPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
  onBack: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ currentPlan, onSelectPlan, onBack }) => {
  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Free (Estático)',
      price: 'R$ 0',
      description: 'Ideal para validar fluxos simples',
      features: [
        'Automação via palavras-chave',
        'Respostas estáticas manuais',
        '10 Mensagens de teste IA',
        '1 produto cadastrado',
        'Marca ZapSeller no chat'
      ],
      aiFeature: false,
      buttonText: 'Plano Atual',
      highlight: false
    },
    {
      id: 'starter' as PlanType,
      name: 'Starter (Vendedor IA)',
      price: 'R$ 19,90/mês',
      description: 'IA Texto para fechamento CoD',
      features: [
        'Cérebro IA treinado em vendas',
        'Entende texto do cliente',
        'Até 500 conversas IA/mês',
        'Prompt editável',
        'Qualificação de leads',
        'Checkout CoD Integrado'
      ],
      aiFeature: true,
      buttonText: 'Ativar Vendedor IA',
      highlight: true,
      link: 'https://pay.kiwify.com.br/Q0UNNyQ'
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro (IA Nativa)',
      price: 'R$ 39,90/mês',
      description: 'O futuro do WhatsApp CoD',
      features: [
        'IA de Áudio Nativa (Entende Voz)',
        'Respostas contextualizadas',
        'Conversas ILIMITADAS',
        'Multi-contas (até 5)',
        'Relatórios de Conversão',
        'Suporte VIP Gerente'
      ],
      aiFeature: true,
      buttonText: 'Escalar com IA',
      highlight: false,
      link: 'https://pay.kiwify.com.br/6d9bLtJ'
    }
  ];

  const handleSelect = (plan: typeof plans[0]) => {
    if (plan.link) {
      window.open(plan.link, '_blank');
    }
    onSelectPlan(plan.id);
  };

  return (
    <div className="min-h-screen bg-white py-16 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <button onClick={onBack} className="text-emerald-600 font-black text-xs uppercase tracking-widest mb-6 hover:opacity-70 flex items-center gap-2 mx-auto">
            <i className="fas fa-arrow-left"></i> Voltar ao Dashboard
          </button>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Planos que vendem por você.</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Escolha entre automação estática ou o poder da Inteligência Artificial.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-white rounded-[48px] p-10 border transition-all flex flex-col ${
                plan.highlight ? 'border-emerald-500 shadow-2xl shadow-emerald-100 scale-105 relative z-10' : 'border-slate-100'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  POPULAR
                </div>
              )}
              
              <div className="mb-10 text-center md:text-left">
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${plan.aiFeature ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {plan.aiFeature ? 'Tecnologia IA' : 'Fluxo Estático'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 justify-center md:justify-start">
                  <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5 text-base"></i>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelect(plan)}
                disabled={currentPlan === plan.id}
                className={`w-full py-5 rounded-[24px] font-black transition-all text-sm uppercase tracking-widest ${
                  currentPlan === plan.id
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : plan.highlight
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-100'
                }`}
              >
                {currentPlan === plan.id ? 'Plano Atual' : plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
