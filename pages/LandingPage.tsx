
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBuyStarter = () => {
    window.open('https://pay.kiwify.com.br/Q0UNNyQ', '_blank');
  };

  const handleBuyPro = () => {
    window.open('https://pay.kiwify.com.br/6d9bLtJ', '_blank');
  };

  return (
    <div className="bg-white selection:bg-emerald-100 selection:text-emerald-900 scroll-smooth">
      {/* Navbar */}
      <header className="fixed w-full top-0 bg-white/90 backdrop-blur-lg z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="bg-[#22c55e] w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl italic tracking-tighter shrink-0">
              zs
            </div>
            <div className="flex items-center text-2xl font-black tracking-tighter">
              <span className="text-[#111827]">ZAPSELLER</span>
              <span className="text-[#22c55e] ml-1.5">AI</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollTo('funcionalidades')} 
              className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              Funcionalidades
            </button>
            <button 
              onClick={() => scrollTo('planos')} 
              className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              Preços
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">Entrar</button>
            <button onClick={onStart} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-95">
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest mb-8 border border-emerald-100 animate-bounce">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Seu vendedor virtual 24h no WhatsApp
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Não perca mais nenhuma venda por <span className="text-emerald-600">demora no atendimento</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Automatize suas vendas no WhatsApp com Inteligência Artificial persuasiva, focada em fechar produtos físicos com <span className="text-slate-900 font-bold underline decoration-emerald-400">Pagamento na Entrega (CoD)</span> — 24h por dia.
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <button onClick={onStart} className="w-full sm:w-auto bg-emerald-600 text-white px-12 py-6 rounded-[28px] text-xl font-black hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3">
              Quero Vender Mais
              <i className="fas fa-arrow-right text-sm"></i>
            </button>
            
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-slate-400 text-sm font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2"><i className="fas fa-check text-emerald-500"></i> Sem cartão no plano grátis</span>
              <span className="flex items-center gap-2"><i className="fas fa-check text-emerald-500"></i> Cancelamento a qualquer momento</span>
              <span className="flex items-center gap-2"><i className="fas fa-check text-emerald-500"></i> Feito para afiliados e vendedores físicos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Section */}
      <section id="funcionalidades" className="py-24 bg-slate-50 border-y border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Tudo que você precisa para escalar</h2>
            <p className="text-lg text-slate-500 font-medium">Focado em conversão e automação real para o mercado brasileiro.</p>
          </header>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'fa-robot', title: 'IA Persuasiva', desc: 'Sua IA não apenas responde, ela vende. Treinada com gatilhos mentais e focada em CoD.' },
              { icon: 'fa-clock', title: 'Atendimento 24/7', desc: 'Seus clientes não esperam. Respostas instantâneas mesmo de madrugada.' },
              { icon: 'fa-truck-fast', title: 'Foco em CoD', desc: 'Reforça o pagamento na entrega para gerar confiança absoluta no cliente.' },
              { icon: 'fa-comments', title: 'Follow-up Inteligente', desc: 'O cliente parou de responder? A IA envia lembretes educados para retomar a venda.' },
              { icon: 'fa-chart-pie', title: 'Qualificação de Leads', desc: 'Saiba quem são seus leads quentes e foque sua energia onde há lucro.' },
              { icon: 'fa-microchip', title: 'Modelo Gemini Pro', desc: 'Tecnologia de ponta do Google para conversas fluidas e humanas.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 hover:scale-[1.02] transition-all group">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-24 px-4 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Escolha o plano ideal para o seu momento</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Comece grátis e evolua conforme suas vendas crescem.</p>
          </header>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-200 flex flex-col hover:border-emerald-200 transition-all group">
              <div className="mb-10">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Plano FREE</h3>
                <p className="text-slate-500 font-bold text-sm mb-6">Para começar</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-900">R$ 0</span>
                  <span className="text-slate-400 font-bold">/mês</span>
                </div>
                <p className="text-sm text-slate-600 mt-4 font-medium italic">Ideal para testar o ZapSeller AI sem risco.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  '1 número de WhatsApp conectado',
                  'Até 50 conversas/mês',
                  'IA com script padrão de vendas',
                  'Respostas automáticas básicas',
                  'Pagamento na Entrega (CoD)'
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                    <i className="fas fa-check text-emerald-500 mt-0.5"></i>
                    {f}
                  </li>
                ))}
                <li className="pt-4 border-t border-slate-200 text-xs text-slate-400 font-bold uppercase tracking-widest">Limitações:</li>
                {['Sem personalização avançada', 'Sem follow-up automático', 'Sem relatórios'].map((l, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-400 line-through">
                    <i className="fas fa-times text-slate-300 mt-0.5"></i>
                    {l}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="w-full py-5 rounded-[24px] bg-white border-2 border-slate-200 text-slate-900 font-black text-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                👉 Começar Grátis
              </button>
            </div>

            {/* Starter Plan */}
            <div className="bg-emerald-600 p-10 rounded-[48px] flex flex-col shadow-2xl shadow-emerald-200 scale-105 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <i className="fab fa-whatsapp text-[180px] text-white"></i>
              </div>
              <div className="relative z-10">
                <div className="inline-flex py-1 px-3 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                  ⭐ MAIS ESCOLHIDO
                </div>
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-white mb-2">Plano STARTER</h3>
                  <p className="text-emerald-100 font-bold text-sm mb-6">Mais vendido</p>
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="text-5xl font-black">R$ 19,90</span>
                    <span className="text-emerald-200 font-bold">/mês</span>
                  </div>
                  <p className="text-sm text-emerald-50 mt-4 font-medium italic">Para quem já vende e quer escalar sem perder leads.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    'Tudo do Free +',
                    'Até 500 conversas/mês',
                    'IA persuasiva treinável por produto',
                    'Follow-up automático no WhatsApp',
                    'Qualificação de leads (quente/morno)',
                    'Suporte prioritário'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-white">
                      <i className="fas fa-check text-emerald-200 mt-0.5"></i>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleBuyStarter} className="w-full py-5 rounded-[24px] bg-white text-emerald-700 font-black text-lg hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-800/20 active:scale-95">
                  🚀 Começar agora
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 p-10 rounded-[48px] border border-slate-800 flex flex-col hover:border-slate-700 transition-all group">
              <div className="mb-10">
                <h3 className="text-2xl font-black text-white mb-2">Plano PRO</h3>
                <p className="text-slate-500 font-bold text-sm mb-6">Escala Máxima</p>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-5xl font-black">R$ 39,90</span>
                  <span className="text-slate-500 font-bold">/mês</span>
                </div>
                <p className="text-sm text-slate-400 mt-4 font-medium italic">Venda todos os dias no automático com máximo desempenho.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Tudo do Starter +',
                  'Conversas ILIMITADAS',
                  'Múltiplos produtos e scripts',
                  'IA avançada focada em fechamento',
                  'Relatórios completos de conversão',
                  'Acesso antecipado a novidades',
                  'Suporte Premium VIP'
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-300">
                    <i className="fas fa-check text-emerald-500 mt-0.5"></i>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleBuyPro} className="w-full py-5 rounded-[24px] bg-white text-slate-900 font-black text-lg hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95">
                💎 Quero vender no automático
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-[#22c55e] w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm italic tracking-tighter shrink-0">
              zs
            </div>
            <div className="flex items-center text-xl font-black tracking-tighter">
              <span className="text-[#111827]">ZAPSELLER</span>
              <span className="text-[#22c55e] ml-1.5">AI</span>
            </div>
          </div>
          <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto mb-10 mt-6 leading-relaxed">
            A solução definitiva para automatizar seu atendimento e triplicar suas vendas CoD.
          </p>
          <div className="flex justify-center gap-10 mb-12">
            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">Início</button>
            <button onClick={() => scrollTo('funcionalidades')} className="text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">Funcionalidades</button>
            <button onClick={() => scrollTo('planos')} className="text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">Preços</button>
          </div>
          <p className="text-xs text-slate-300 font-medium">© 2025 ZapSeller AI. Transformando leads em lucros.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
