
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
      name: 'Free (Iniciante)',
      price: 'R$ 0',
      description: 'Valide seu produto sem custos',
      features: [
        '1 Número de WhatsApp',
        'Respostas estáticas manuais',
        'Sem Inteligência Artificial',
        'Até 50 mensagens/mês',
        'Ideal para testes'
      ],
      aiFeature: false,
      buttonText: 'Plano Atual',
      highlight: false
    },
    {
      id: 'starter' as PlanType,
      name: 'Starter (Elite Text)',
      price: 'R$ 19,90/mês',
      description: 'IA Vendedora de alta performance',
      features: [
        '1 Número de WhatsApp',
        'IA de Texto Ilimitada (Qualidade)',
        '1.000 Mensagens IA/mês',
        'Treinamento para 2 Produtos',
        'Qualificação Automática de Leads',
        'Checkout CoD Integrado'
      ],
      aiFeature: true,
      buttonText: 'Ativar Vendedor Elite',
      highlight: true,
      link: 'https://pay.kiwify.com.br/Q0UNNyQ'
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro (Escala Industrial)',
      price: 'R$ 39,90/mês',
      description: 'Tecnologia de ponta para dominar o mercado',
      features: [
        '10 Números de WhatsApp',
        'IA de Texto Ilimitada (Qualidade)',
        'Mensagens IA ILIMITADAS',
        'Treinamento para 10 Produtos',
        'Qualificação Automática de Leads',
        'Checkout CoD Integrado',
        'IA de Voz Full (Ouve e Responde)'
      ],
      aiFeature: true,
      buttonText: 'Escalar Agora',
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
    <div className="min-h-screen bg-slate-50 py-16 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <button onClick={onBack} className="text-emerald-600 font-black text-xs uppercase tracking-widest mb-6 hover:opacity-70 flex items-center gap-2 mx-auto transition-all">
            <i className="fas fa-arrow-left"></i> Voltar ao Dashboard
          </button>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter text-center w-full">Sua escala começa aqui.</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Automatize 100% do seu atendimento no WhatsApp com a tecnologia do Google Gemini.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`rounded-[48px] p-10 border transition-all flex flex-col ${
                plan.id === 'pro' 
                  ? 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-slate-900/40 relative' 
                  : plan.highlight 
                    ? 'bg-white border-emerald-500 shadow-2xl shadow-emerald-100 scale-105 relative z-10' 
                    : 'bg-white border-slate-200'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  MELHOR CUSTO-BENEFÍCIO
                </div>
              )}

              {plan.id === 'pro' && (
                <div className="absolute -top-5 right-10 bg-amber-400 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <i className="fas fa-bolt"></i> PODER MÁXIMO
                </div>
              )}
              
              <div className="mb-10">
                <h3 className={`text-2xl font-black mb-2 ${plan.id === 'pro' ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    plan.id === 'pro' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {plan.aiFeature ? 'Tecnologia IA' : 'Sistema Estático'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-black ${plan.id === 'pro' ? 'text-white' : 'text-slate-900'}`}>{plan.price.split('/')[0]}</span>
                  <span className={`text-xs font-bold ${plan.id === 'pro' ? 'text-slate-400' : 'text-slate-400'}`}>/mês</span>
                </div>
                <p className={`text-sm mt-4 font-medium italic ${plan.id === 'pro' ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
              </div>

              <div className="flex-1 space-y-5 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                      <i className="fas fa-check text-[10px] text-white"></i>
                    </div>
                    <span className={`text-[15px] font-black leading-tight ${plan.id === 'pro' ? 'text-slate-100' : 'text-slate-700'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelect(plan)}
                disabled={currentPlan === plan.id}
                className={`w-full py-5 rounded-[24px] font-black transition-all text-sm uppercase tracking-widest active:scale-95 ${
                  currentPlan === plan.id
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-none'
                  : plan.id === 'pro'
                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-xl shadow-amber-900/20 border-none'
                    : plan.highlight
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-100 border-none'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-none'
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
