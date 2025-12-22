
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
            IA Vendedora de Elite 24h Ativa
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Seu atendimento no WhatsApp <span className="text-emerald-600">em escala industrial</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Automatize conversas e feche vendas no modelo <span className="text-slate-900 font-bold underline decoration-emerald-400">Pagamento na Entrega (CoD)</span>. Agora com IA que ouve e fala como um humano.
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <button onClick={onStart} className="w-full sm:w-auto bg-emerald-600 text-white px-12 py-6 rounded-[28px] text-xl font-black hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3">
              Quero Escalar Minhas Vendas
              <i className="fas fa-arrow-right text-sm"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Funcionalidades Section */}
      <section id="funcionalidades" className="py-24 bg-slate-50 border-y border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">A tecnologia de elite do CoD</h2>
            <p className="text-lg text-slate-500 font-medium">Focada no mercado brasileiro, otimizada para máxima conversão.</p>
          </header>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'fa-robot', title: 'Cérebro de Vendas Elite', desc: 'IA treinada com os melhores scripts de CoD do Brasil. Ela entende objeções e fecha o pedido.' },
              { icon: 'fa-microphone', title: 'IA de Voz Bidirecional', desc: 'No plano Pro, sua IA ouve os áudios dos clientes e responde também em áudio humanizado.' },
              { icon: 'fa-truck-fast', title: 'Domínio do CoD', desc: 'Especializada em converter leads para pagamento na entrega, aumentando o ROI em até 300%.' },
              { icon: 'fa-layer-group', title: 'Escala Multi-Números', desc: 'Conecte até 10 números de WhatsApp simultaneamente para tráfego pesado no plano Pro.' },
              { icon: 'fa-bolt', title: 'Raciocínio Estratégico', desc: 'Usa a capacidade avançada de processamento para planejar a melhor resposta em negociações.' },
              { icon: 'fa-chart-line', title: 'Funil de Alta Precisão', desc: 'Saiba exatamente onde seus clientes estão travando e melhore seu lucro em tempo real.' },
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
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">O plano certo para o seu lucro</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Sem letras miúdas. Apenas escala.</p>
          </header>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-200 flex flex-col hover:border-emerald-200 transition-all group">
              <div className="mb-10">
                <h3 className="text-2xl font-black text-slate-900 mb-2">FREE</h3>
                <p className="text-slate-500 font-bold text-sm mb-6">Validação Inicial</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-900">R$ 0</span>
                  <span className="text-slate-400 font-bold">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  '1 Número Conectado',
                  'Sem Inteligência Artificial',
                  'Até 50 mensagens/mês',
                  'Respostas Estáticas',
                  'Foco em Pequenos Testes'
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                    <i className="fas fa-check text-emerald-500 mt-0.5"></i>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="w-full py-5 rounded-[24px] bg-white border-2 border-slate-200 text-slate-900 font-black text-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                Começar Grátis
              </button>
            </div>

            {/* Starter Plan */}
            <div className="bg-white p-10 rounded-[48px] flex flex-col shadow-2xl shadow-emerald-100 scale-105 relative overflow-hidden border-2 border-emerald-500 group">
              <div className="relative z-10">
                <div className="inline-flex py-1 px-3 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                  MAIS ESCOLHIDO
                </div>
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">STARTER</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900">R$ 19,90</span>
                    <span className="text-slate-400 font-bold">/mês</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    '1 Número Conectado',
                    'IA de Texto Persuasiva',
                    '1.000 mensagens IA/mês',
                    '2 Produtos Ativos',
                    'Dashboard de Vendas',
                    'Checkout CoD Integrado'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                      <i className="fas fa-check text-emerald-500 mt-0.5"></i>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleBuyStarter} className="w-full py-5 rounded-[24px] bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all shadow-xl active:scale-95">
                  Ativar Vendedor Elite
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 text-white p-10 rounded-[48px] border border-slate-800 flex flex-col hover:border-emerald-500 transition-all group">
              <div className="mb-10">
                <h3 className="text-2xl font-black text-white mb-2">PRO</h3>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-5xl font-black text-amber-400">R$ 39,90</span>
                  <span className="text-slate-500 font-bold">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Até 10 Números Conectados',
                  'IA de Voz Full (Ouve e Fala)',
                  'Conversas ILIMITADAS',
                  'Até 10 Produtos Diferentes',
                  'Raciocínio Estratégico de IA',
                  'Suporte VIP via WhatsApp'
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-100">
                    <i className="fas fa-check text-emerald-400 mt-0.5"></i>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleBuyPro} className="w-full py-5 rounded-[24px] bg-amber-400 text-slate-900 font-black text-lg hover:bg-amber-300 transition-all shadow-xl active:scale-95">
                Escala Industrial
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
            Potencializado pela Inteligência Artificial de última geração.
          </p>
          <p className="text-xs text-slate-300 font-medium">© 2025 ZapSeller AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
