
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
  free: { name: 'Free', maxProducts: 1, maxAccounts: 1, maxMessages: 50, hasAI: false },
  starter: { name: 'Starter', maxProducts: 2, maxAccounts: 1, maxMessages: 1000, hasAI: true },
  pro: { name: 'Pro', maxProducts: 10, maxAccounts: 10, maxMessages: Infinity, hasAI: true },
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.LANDING);
  const [user, setUser] = useState<User>({ email: '', isLoggedIn: false, plan: 'free', messagesSent: 0 });
  const [products, setProducts] = useState<Product[]>([{ id: '1', name: 'Kit Emagrecedor X', price: '197,90', benefits: 'Queima gordura', paymentMethod: 'CoD' }]);
  const [activeProductId, setActiveProductId] = useState<string>('1');
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const win = window as any;
    if (win.aistudio) {
      const has = await win.aistudio.hasSelectedApiKey();
      setHasApiKey(has);
    }
  };

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio) {
      await win.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const resetApiKeyStatus = () => setHasApiKey(false);

  const renderContent = () => {
    switch (status) {
      case AppStatus.DASHBOARD:
        return (
          <Dashboard 
            user={user} product={products.find(p => p.id === activeProductId)!} 
            accounts={accounts} onNavigate={setStatus} hasApiKey={hasApiKey} onConfigKey={handleSelectKey}
            onRemoveAccount={(id) => setAccounts(a => a.filter(acc => acc.id !== id))}
          />
        );
      case AppStatus.SIMULATOR:
        return (
          <ChatSimulator 
            user={user} product={products.find(p => p.id === activeProductId)!} customPrompt={customPrompt} 
            onBack={() => setStatus(AppStatus.DASHBOARD)} onConfigKey={handleSelectKey}
            onMessageSent={() => setUser(p => ({...p, messagesSent: p.messagesSent + 1}))}
            onApiKeyError={resetApiKeyStatus}
          />
        );
      case AppStatus.WHATSAPP_CONNECT:
        return <WhatsAppConnect onBack={() => setStatus(AppStatus.DASHBOARD)} onSuccess={() => {
          setAccounts([...accounts, { id: Date.now().toString(), name: 'Nova Conta', number: 'WhatsApp Ativo', status: 'connected' }]);
          setStatus(AppStatus.DASHBOARD);
        }} />;
      case AppStatus.PRICING:
        return <PricingPage currentPlan={user.plan} onBack={() => setStatus(AppStatus.DASHBOARD)} onSelectPlan={(p) => setUser({...user, plan: p})} />;
      case AppStatus.AUTH:
        return <AuthPage onBack={() => setStatus(AppStatus.LANDING)} onLogin={(e) => { setUser({...user, email: e, isLoggedIn: true}); setStatus(AppStatus.DASHBOARD); }} />;
      case AppStatus.LANDING:
        return <LandingPage onStart={() => setStatus(AppStatus.AUTH)} onLogin={() => setStatus(AppStatus.AUTH)} />;
      default:
        return <Dashboard user={user} product={products[0]} accounts={accounts} onNavigate={setStatus} hasApiKey={hasApiKey} onConfigKey={handleSelectKey} onRemoveAccount={() => {}} />;
    }
  };

  const showSidebar = status !== AppStatus.LANDING && status !== AppStatus.AUTH && status !== AppStatus.WHATSAPP_CONNECT;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {showSidebar && <Sidebar user={user} currentStatus={status} onNavigate={setStatus} onLogout={() => setStatus(AppStatus.LANDING)} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
};

export default App;
