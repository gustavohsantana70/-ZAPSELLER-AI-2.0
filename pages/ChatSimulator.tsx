import React, { useState, useRef, useEffect } from 'react';
import { Product, Message, User, SalesStrategy } from '../types';
import { getGeminiResponse, AIResponse } from '../services/gemini';
import { PLANS_CONFIG } from '../App';

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface ChatSimulatorProps {
  user: User;
  product: Product;
  customPrompt: string;
  onBack: () => void;
  onMessageSent: () => void;
  onUpgrade?: () => void;
}

const ChatSimulator: React.FC<ChatSimulatorProps> = ({ user, product, customPrompt, onBack, onMessageSent, onUpgrade }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Olá! 👋 Vi que você tem interesse no ${product.name}. Como posso te ajudar hoje?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentPlanConfig = PLANS_CONFIG[user.plan];
  const isAtLimit = user.messagesSent >= currentPlanConfig.maxMessages;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, isThinking]);

  const handleSend = async (e: React.FormEvent | null, audioIn?: any) => {
    if (e) e.preventDefault();
    if (isAtLimit) return;
    
    const textToSend = input.trim();
    if (!textToSend && !audioIn) return;

    const userMessage: Message = { role: 'user', text: audioIn ? "🎤 Áudio Enviado" : textToSend, timestamp: new Date() };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setIsTyping(true);
    if (user.plan === 'pro') setIsThinking(true);

    try {
      const res: AIResponse = await getGeminiResponse(
        updatedHistory, 
        product, 
        customPrompt, 
        audioIn, 
        user.plan, 
        false, 
        user.messagesSent
      );
      
      setIsTyping(false);
      setIsThinking(false);
      
      if (res.text.includes("⚠️ Limite")) {
        alert(res.text);
        return;
      }

      onMessageSent();
      if (res.orderConfirmed) setConfirmedOrder(res.orderConfirmed);

      const modelMsg: Message = { role: 'model', text: res.text, timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);

      if (res.audioData) {
        const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
        const decoded = await decodeAudioData(decodeBase64(res.audioData), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (error: any) {
      setIsTyping(false);
      setIsThinking(false);
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ ${error.message || "Erro de conexão"}`, timestamp: new Date() }]);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#e5ddd5] z-[100] md:relative md:h-screen font-sans overflow-hidden">
      {/* WhatsApp Header */}
      <header className="bg-[#075e54] text-white p-4 py-3 flex items-center justify-between shadow-lg z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black">ZS</div>
          <div>
            <h2 className="font-bold text-sm leading-none">ZapSeller AI</h2>
            <p className="text-[9px] opacity-80 uppercase tracking-widest font-black mt-1">Online agora</p>
          </div>
        </div>
        
        {user.plan === 'free' && (
          <div className="px-3 py-1 bg-amber-500 rounded-full border border-amber-400 shadow-md">
             <span className="text-[8px] font-black uppercase text-white">Plano Free</span>
          </div>
        )}
      </header>

      {/* Plan Notice Banner */}
      {user.plan === 'free' && (
        <div className="bg-amber-50 border-b border-amber-200 p-2 text-center animate-in slide-in-from-top duration-300">
          <p className="text-[10px] font-bold text-amber-800">
            Você está no plano <span className="underline">Free</span> ({user.messagesSent}/{currentPlanConfig.maxMessages}). 
            Ative a IA de fechamento agora!
          </p>
        </div>
      )}

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative pb-10"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[12px] p-2.5 shadow-sm relative ${msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              <p className="text-[14px] leading-snug text-slate-800 font-medium whitespace-pre-wrap">{msg.text}</p>
              <div className="flex justify-end mt-1">
                <span className="text-[9px] text-slate-400 font-bold">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-900 text-amber-400 rounded-2xl px-5 py-3 shadow-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border-l-4 border-amber-500">
              <i className="fas fa-bolt animate-pulse"></i>
              IA PRO: Analisando as melhores táticas de fechamento...
            </div>
          </div>
        )}

        {isTyping && !isThinking && (
          <div className="flex justify-start">
            <div className="bg-white text-emerald-600 rounded-full px-4 py-2 shadow-sm text-[10px] font-black uppercase tracking-widest border border-slate-100 animate-pulse">
              IA digitando...
            </div>
          </div>
        )}
      </div>

      {/* Fixed Upgrade Button for Conversion */}
      {user.plan === 'free' && (
        <div className="px-4 py-3 bg-white border-t border-slate-200">
          <button 
            onClick={onUpgrade}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
          >
            <i className="fas fa-crown text-amber-300"></i>
            Ativar ZapSeller Pro Agora
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 bg-[#f0f2f5] border-t border-slate-200">
        <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2 max-w-4xl mx-auto pb-4">
          <div className={`flex-1 bg-white rounded-full flex items-center px-4 py-1.5 shadow-sm border border-slate-200 ${isAtLimit ? 'bg-slate-100' : ''}`}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAtLimit ? "Mensagens esgotadas." : "Digite uma mensagem..."}
              disabled={isTyping || isThinking || isAtLimit}
              className="flex-1 bg-transparent py-3 outline-none text-[15px] font-medium"
            />
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isAtLimit}
            className="w-12 h-12 rounded-full bg-[#075e54] text-white flex items-center justify-center shadow-lg disabled:opacity-50 transition-all"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSimulator;