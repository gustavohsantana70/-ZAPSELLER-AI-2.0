
import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (email: string) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <button 
            onClick={onBack} 
            className="text-slate-400 text-xs font-black uppercase tracking-widest mb-8 inline-flex items-center gap-2 hover:text-emerald-600 transition-colors"
          >
            <i className="fas fa-arrow-left text-[10px]"></i>
            Voltar para o início
          </button>
          
          <div className="flex justify-center mb-6">
            <div className="bg-[#22c55e] w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic tracking-tighter shadow-lg shadow-emerald-200">
              zs
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            {isSignup ? 'Crie sua conta' : 'Acesse o ZapSeller AI'}
          </h1>
          <p className="text-slate-500 mt-3 font-medium">
            {isSignup ? 'Comece a vender 24h por dia' : 'Bem-vindo de volta!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1 uppercase tracking-widest">E-mail</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1 uppercase tracking-widest">Senha</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          {!isSignup && (
            <div className="text-right">
              <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Esqueceu a senha?</button>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95 uppercase tracking-widest text-sm"
          >
            {isSignup ? 'Começar Agora' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-10 text-center pt-8 border-t border-slate-100">
          {isSignup ? (
            <p className="text-sm font-medium text-slate-500">
              Já tem uma conta? <button onClick={() => setIsSignup(false)} className="text-emerald-600 font-black hover:underline ml-1">Entre aqui</button>
            </p>
          ) : (
            <p className="text-sm font-medium text-slate-500">
              Novo por aqui? <button onClick={() => setIsSignup(true)} className="text-emerald-600 font-black hover:underline ml-1">Crie sua conta</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
