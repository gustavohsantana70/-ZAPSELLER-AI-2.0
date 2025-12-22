
import React from 'react';
import { Product, User, SalesStrategy } from '../types';
import { PLANS_CONFIG } from '../App';

interface ProductConfigProps {
  user: User;
  products: Product[];
  activeProductId: string;
  setActiveProductId: (id: string) => void;
  onUpdateProduct: (p: Product) => void;
  onAddProduct: () => void;
  customPrompt: string;
  setCustomPrompt: (s: string) => void;
  onSave: () => void;
}

const ProductConfig: React.FC<ProductConfigProps> = ({ 
  user, products, activeProductId, setActiveProductId, onUpdateProduct, onAddProduct, customPrompt, setCustomPrompt, onSave 
}) => {
  const activeProduct = products.find(p => p.id === activeProductId) || products[0];
  const currentPlan = PLANS_CONFIG[user.plan];
  const canAddMore = products.length < currentPlan.maxProducts;

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdateProduct({ ...activeProduct, [name]: value });
  };

  const strategies: { id: SalesStrategy; label: string; icon: string; desc: string }[] = [
    { id: 'physical_cod', label: 'Físico (Pagamento Entrega)', icon: 'fa-truck-fast', desc: 'Ideal para dropshipping nacional e alta conversão.' },
    { id: 'physical_prepaid', label: 'Físico (Pagamento Antecipado)', icon: 'fa-credit-card', desc: 'Venda com checkout ou Pix antes do envio.' },
    { id: 'digital', label: 'Infoproduto / Digital', icon: 'fa-bolt', desc: 'Cursos, E-books e acessos imediatos.' },
    { id: 'service', label: 'Serviço / Consultoria', icon: 'fa-user-tie', desc: 'Qualificação de leads e orçamentos.' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Produto & IA</h1>
          <p className="text-slate-500 font-medium mt-1">Configure o modelo de negócio para sua IA vender qualquer coisa.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[24px]">
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProductId(p.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                activeProductId === p.id 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p.name.split(' ')[0] || 'Novo'}
            </button>
          ))}
          {canAddMore && (
            <button 
              onClick={onAddProduct}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white rounded-full transition-all"
            >
              <i className="fas fa-plus"></i>
            </button>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Sales Strategy Selector */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
             <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
               <i className="fas fa-chess-knight text-emerald-600"></i>
               Modelo de Venda
             </h2>
             <div className="grid sm:grid-cols-2 gap-4">
               {strategies.map((strat) => (
                 <button
                   key={strat.id}
                   onClick={() => onUpdateProduct({ ...activeProduct, salesStrategy: strat.id })}
                   className={`p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group ${
                     activeProduct.salesStrategy === strat.id 
                     ? 'border-emerald-500 bg-emerald-50/30' 
                     : 'border-slate-100 bg-white hover:border-slate-200'
                   }`}
                 >
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl transition-all ${
                     activeProduct.salesStrategy === strat.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                   }`}>
                     <i className={`fas ${strat.icon}`}></i>
                   </div>
                   <p className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight">{strat.label}</p>
                   <p className="text-[10px] font-bold text-slate-400 leading-tight">{strat.desc}</p>
                   {activeProduct.salesStrategy === strat.id && (
                     <div className="absolute top-4 right-4 text-emerald-500"><i className="fas fa-check-circle"></i></div>
                   )}
                 </button>
               ))}
             </div>
          </div>

          {/* Product Form */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Comercial</label>
                <input 
                  name="name"
                  value={activeProduct.name}
                  onChange={handleFieldChange}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                  placeholder="Ex: Mentoria VIP"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                <input 
                  name="price"
                  value={activeProduct.price}
                  onChange={handleFieldChange}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                  placeholder="497,00"
                />
              </div>
            </div>

            {/* Dynamic Fields based on strategy */}
            {(activeProduct.salesStrategy === 'digital' || activeProduct.salesStrategy === 'physical_prepaid') && (
              <div className="space-y-2 animate-in slide-in-from-top-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Link de Checkout / Pagamento</label>
                <input 
                  name="checkoutUrl"
                  value={activeProduct.checkoutUrl || ''}
                  onChange={handleFieldChange}
                  className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50/10 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-emerald-700"
                  placeholder="https://pay.seu-link.com/..."
                />
              </div>
            )}

            {activeProduct.salesStrategy === 'physical_prepaid' && (
              <div className="space-y-2 animate-in slide-in-from-top-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Chave Pix (Opcional)</label>
                <input 
                  name="pixKey"
                  value={activeProduct.pixKey || ''}
                  onChange={handleFieldChange}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                  placeholder="CNPJ ou E-mail para Pix"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Principais Benefícios (Treinamento IA)</label>
              <textarea 
                name="benefits"
                value={activeProduct.benefits}
                onChange={handleFieldChange}
                rows={4}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium resize-none"
                placeholder="Liste aqui o que faz seu produto/serviço ser único..."
              />
            </div>
          </div>
        </div>

        {/* Right: Prompt Editor */}
        <div className="lg:col-span-4">
          <div className={`bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl h-full flex flex-col relative overflow-hidden transition-all ${user.plan === 'free' ? 'opacity-50 grayscale' : ''}`}>
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center text-xl">
                    <i className="fas fa-brain"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Cérebro Custom</h2>
                    <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-[0.2em]">IA Estratégica</span>
                  </div>
                </div>

                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={user.plan === 'free'}
                  placeholder="Diga à IA como ela deve tratar os clientes (ex: seja agressivo no fechamento, use gírias, etc)..."
                  className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-mono leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none mb-6"
                />

                <button 
                  onClick={onSave}
                  className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  SALVAR CONFIGURAÇÃO
                  <i className="fas fa-save"></i>
                </button>
             </div>
             {user.plan === 'free' && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8">
                   <i className="fas fa-lock text-4xl text-emerald-500 mb-6"></i>
                   <h3 className="text-xl font-black mb-2">PROMPTS CUSTOM</h3>
                   <p className="text-sm text-slate-400 mb-8 font-medium">Libere o poder total de treinamento da IA no plano STARTER.</p>
                   <button className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-sm">UPGRADE AGORA</button>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductConfig;
