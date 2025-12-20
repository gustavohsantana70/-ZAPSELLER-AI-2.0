
import React from 'react';
import { Product, User } from '../types';
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

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdateProduct({ ...activeProduct, [name]: value });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Produto & IA</h1>
          <p className="text-slate-500 font-medium mt-1">Configure o que sua IA vai vender e como ela deve se comportar.</p>
        </div>
        
        {/* Product Switcher for PRO */}
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
              {p.name.split(' ')[0]}
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

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Product Form */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
                <i className="fas fa-tag"></i>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Dados do Produto</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Editando agora: {activeProduct.name}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Nome de Exibição</label>
                <input 
                  name="name"
                  value={activeProduct.name}
                  onChange={handleFieldChange}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                  placeholder="Ex: Detox Premium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Preço Sugerido (R$)</label>
                <input 
                  name="price"
                  value={activeProduct.price}
                  onChange={handleFieldChange}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                  placeholder="197,90"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-1">Benefícios & Argumentos (Ouro para a IA)</label>
              <textarea 
                name="benefits"
                value={activeProduct.benefits}
                onChange={handleFieldChange}
                rows={4}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium resize-none"
                placeholder="Ex: Resultados em 7 dias, Frete Grátis para todo Brasil..."
              />
            </div>

            <div className="p-5 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-600">
                <i className="fas fa-truck-fast"></i>
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Pagamento na Entrega (CoD)</p>
                <p className="text-[11px] text-slate-500 font-medium">Habilitado por padrão para máxima conversão.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Prompt Editor */}
        <div className="lg:col-span-2">
          <div className={`bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl h-full relative overflow-hidden transition-all ${user.plan === 'free' ? 'opacity-50 grayscale' : ''}`}>
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center text-xl">
                    <i className="fas fa-brain"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Cérebro da IA</h2>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Persuasão Ativa</span>
                  </div>
                </div>

                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={user.plan === 'free'}
                  placeholder="Insira aqui as instruções personalizadas para o seu vendedor virtual..."
                  className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-mono leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none mb-6"
                />

                <button 
                  onClick={onSave}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  SALVAR TUDO
                  <i className="fas fa-save text-xs"></i>
                </button>
             </div>

             {user.plan === 'free' && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8">
                   <i className="fas fa-lock text-4xl text-emerald-500 mb-6"></i>
                   <h3 className="text-xl font-black mb-2">Personalização Bloqueada</h3>
                   <p className="text-sm text-slate-400 mb-8 font-medium">Acesse o plano STARTER para treinar sua IA com seu próprio script.</p>
                   <button className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-sm hover:bg-emerald-500 hover:text-white transition-all">LIBERAR AGORA</button>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductConfig;
