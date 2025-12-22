
import React, { useState, useEffect } from 'react';
import { AppStatus, User, Product, WhatsAppAccount, PlanType } from './types';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProductConfig from './pages/ProductConfig';
import ChatSimulator from './pages/ChatSimulator';
import WhatsAppConnect from './pages/WhatsAppConnect';
import PricingPage from './pages/PricingPage';
import ReportsPage from './pages/ReportsPage';
import Sidebar from './components/Sidebar';

export const PLANS_CONFIG: Record<PlanType, any> = {
  free: { 
    name: 'Free', 
    maxProducts: 1, 
    maxAccounts: 1, 
    maxMessages: 50, 
    hasAI: false,
    hasAudioAI: false 
  },
  starter: { 
    name: 'Starter', 
    maxProducts: 2, 
    maxAccounts: 1, 
    maxMessages: 1000, 
    hasAI: true, 
    hasAudioAI: false 
  },
  pro: { 
    name: 'Pro', 
    maxProducts: 10, 
    maxAccounts: 10, 
    maxMessages: Infinity, 
    hasAI: true, 
    hasAudioAI: true,
    hasAutoQualification: true,
    hasCodCheckout: true
  },
};

const DEFAULT_PROMPT = "Você é um vendedor que ama ajudar pessoas. Use muita empatia. Primeiro valide a dor do cliente, mostre que você entende o que ele está passando. Só depois apresente o produto como a solução ideal. Reforce sempre o Pagamento na Entrega para tirar o peso da decisão.";

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.LANDING);
  const [user, setUser] = useState<User>({ 
    email: '', 
    isLoggedIn: false, 
    plan: 'free', 
    messagesSent: 0 
  });
  
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Kit Emagrecedor Natural X',
      price: '197,90',
      benefits: 'Queima gordura localizada, inibe o apetite e dá mais energia.',
      paymentMethod: 'Pagamento somente na entrega (CoD)'
    }
  ]);
  
  const [activeProductId, setActiveProductId] = useState<string>('1');
  const activeProduct = products.find(p => p.id === activeProductId) || products[0];

  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([
    { id: '1', name: 'Suporte Principal', number: '+55 (11) 98765-4321', status: 'connected', lastActivity: 'Há 2 min' }
  ]);
  
  const [customPrompt, setCustomPrompt] = useState<string>(DEFAULT_PROMPT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('zapseller_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStatus(AppStatus.DASHBOARD);
    }
  }, []);

  const handleLogin = (email: string) => {
    const newUser: User = { email, isLoggedIn: true, plan: 'free', messagesSent: 0 };
    setUser(newUser);
    localStorage.setItem('zapseller_user', JSON.stringify(newUser));
    setStatus(AppStatus.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('zapseller_user');
    setUser({ email: '', isLoggedIn: false, plan: 'free', messagesSent: 0 });
    setStatus(AppStatus.LANDING);
  };

  const handleUpgrade = async (plan: PlanType) => {
    try {
      const win = window as any;
      if (plan === 'pro' && win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
        }
      }
    } catch (e) {
      console.log("Ambiente fora do AI Studio, utilizando API_KEY de produção.");
    }
    
    const updatedUser = { ...user, plan };
    setUser(updatedUser);
    localStorage.setItem('zapseller_user', JSON.stringify(updatedUser));
    setStatus(AppStatus.DASHBOARD);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const addProduct = () => {
    const newProd: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Produto',
      price: '0,00',
      benefits: '',
      paymentMethod: 'Pagamento somente na entrega (CoD)'
    };
    setProducts([...products, newProd]);
    setActiveProductId(newProd.id);
  };

  const addAccount = () => {
    const currentPlan = PLANS_CONFIG[user.plan];
    if (accounts.length < currentPlan.maxAccounts) {
      const newAcc: WhatsAppAccount = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Conta ${accounts.length + 1}`,
        number: `+55 (11) 9${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'connected',
        lastActivity: 'Agora mesmo'
      };
      setAccounts([...accounts, newAcc]);
    }
  };

  const renderContent = () => {
    switch (status) {
      case AppStatus.LANDING:
        return <LandingPage onStart={() => setStatus(AppStatus.AUTH)} onLogin={() => setStatus(AppStatus.AUTH)} />;
      case AppStatus.AUTH:
        return <AuthPage onLogin={handleLogin} onBack={() => setStatus(AppStatus.LANDING)} />;
      case AppStatus.DASHBOARD:
        return <Dashboard user={user} product={activeProduct} accounts={accounts} onNavigate={setStatus} onRemoveAccount={(id) => setAccounts(a => a.filter(acc => acc.id !== id))} />;
      case AppStatus.PRODUCT_CONFIG:
        return (
          <ProductConfig 
            user={user}
            products={products}
            activeProductId={activeProductId}
            setActiveProductId={setActiveProductId}
            onUpdateProduct={updateProduct}
            onAddProduct={addProduct}
            customPrompt={customPrompt} 
            setCustomPrompt={setCustomPrompt} 
            onSave={() => setStatus(AppStatus.DASHBOARD)} 
          />
        );
      case AppStatus.SIMULATOR:
        return (
          <ChatSimulator 
            user={user}
            product={activeProduct} 
            customPrompt={customPrompt} 
            onBack={() => setStatus(AppStatus.DASHBOARD)} 
            onMessageSent={() => setUser(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }))}
          />
        );
      case AppStatus.REPORTS:
        return <ReportsPage user={user} onBack={() => setStatus(AppStatus.DASHBOARD)} />;
      case AppStatus.WHATSAPP_CONNECT:
        return <WhatsAppConnect onSuccess={() => { addAccount(); setStatus(AppStatus.DASHBOARD); }} onBack={() => setStatus(AppStatus.DASHBOARD)} />;
      case AppStatus.PRICING:
        return <PricingPage currentPlan={user.plan} onSelectPlan={handleUpgrade} onBack={() => setStatus(AppStatus.DASHBOARD)} />;
      default:
        return <LandingPage onStart={() => setStatus(AppStatus.AUTH)} onLogin={() => setStatus(AppStatus.AUTH)} />;
    }
  };

  const showSidebar = status !== AppStatus.LANDING && status !== AppStatus.AUTH && status !== AppStatus.WHATSAPP_CONNECT && status !== AppStatus.PRICING;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {showSidebar && (
        <Sidebar 
          user={user}
          currentStatus={status} 
          onNavigate={setStatus} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      )}
      <main className={`flex-1 transition-all duration-300 ${showSidebar && isSidebarOpen ? 'md:ml-0' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
