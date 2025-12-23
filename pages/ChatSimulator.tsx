import React, { useState, useRef, useEffect } from 'react';
import { Product, Message, User, SalesStrategy } from '../types';
import { getGeminiResponse, AIResponse } from '../services/gemini';
import { PLANS_CONFIG } from '../App';

// Funções de decodificação de áudio PCM seguindo as diretrizes
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Implementação manual de decodificação conforme documentação do SDK
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
}

const ChatSimulator: React.FC<ChatSimulatorProps> = ({ user, product, customPrompt, onBack, onMessageSent }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Olá! 👋 Vi que você tem interesse no ${product.name}. Como posso te ajudar hoje?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [leadStatus, setLeadStatus] = useState<'frio' | 'morno' | 'quente'>('frio');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentPlan = PLANS_CONFIG[user.plan];
  const isAtLimit = user.messagesSent >= currentPlan.maxMessages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isThinking]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const playAIResponse = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const audioData = decodeBase64(base64Audio);
      // Decodificando áudio PCM 24kHz Mono conforme retorno da API
      const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) { console.error(e); }
  };

  const handleSend = async (e: React.FormEvent | null, audioIn?: any, audioUrl?: string) => {
    if (e) e.preventDefault();
    if (isAtLimit) return alert("Limite de mensagens atingido.");
    
    const textToSend = input.trim();
    if (!textToSend && !audioIn) return;

    const userMessage: Message = { 
      role: 'user', 
      text: audioIn ? "🎤 Áudio Enviado" : textToSend, 
      timestamp: new Date(),
      audioUrl: audioUrl
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setIsTyping(true);
    if (user.plan === 'pro') setIsThinking(true);
    onMessageSent();

    try {
      const res: AIResponse = await getGeminiResponse(updatedHistory, product, customPrompt, audioIn, user.plan);
      
      setIsTyping(false);
      setIsThinking(false);
      
      if (res.orderConfirmed) {
        setConfirmedOrder(res.orderConfirmed);
        setLeadStatus('quente');
      }

      const modelMsg: Message = { 
        role: 'model', 
        text: res.text, 
        timestamp: new Date(),
        audioUrl: res.audioData ? 'ai-voice' : undefined
      };

      setMessages(prev => [...prev, modelMsg]);
      if (res.audioData) playAIResponse(res.audioData);

    } catch (error: any) {
      setIsTyping(false);
      setIsThinking(false);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `Erro: ${error.message || "Problema na conexão. Verifique sua chave de API."}`, 
        timestamp: new Date() 
      }]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          handleSend(null, { data: base64, mimeType: 'audio/webm' }, url);
        };
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setIsRecording(true);
    } catch (err) { alert("Erro ao acessar microfone."); }
  };

  const getOrderModalConfig = (strategy: SalesStrategy) => {
    switch(strategy) {
      case 'digital': return { title: 'ACESSO LIBERADO!', label: 'Digital / Infoproduto', icon: 'fa-bolt', color: 'bg-blue-500 shadow-blue-200' };
      case 'service': return { title: 'LEAD QUALIFICADO!', label: 'Serviço / Consultoria', icon: 'fa-user-tie', color: 'bg-purple-600 shadow-purple-200' };
      case 'physical_prepaid': return { title: 'PAGAMENTO EM ANÁLISE', label: 'Físico (Pix/Cartão)', icon: 'fa-credit-card', color: 'bg-emerald-600 shadow-emerald-200' };
      default: return { title: 'VENDA CONFIRMADA!', label: 'Físico (CoD)', icon: 'fa-truck-fast', color: 'bg-emerald-500 shadow-emerald-200' };
    }
  };

  const modalConfig = confirmedOrder ? getOrderModalConfig(confirmedOrder.strategy) : null;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#e5ddd5] z-[100] md:relative md:h-screen font-sans overflow-hidden">
      {/* WhatsApp Header */}
      <header className="bg-[#075e54] text-white p-4 py-3 flex items-center justify-between shadow-lg z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black relative uppercase tracking-tighter">
            ZS
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#25d366] border-2 border-[#075e54] rounded-full"></span>
          </div>
          <div>
            <h2 className="font-bold text-sm leading-none">IA Vendedora</h2>
            <p className="text-[9px] opacity-80 uppercase tracking-widest font-black mt-1">modelo: {product.salesStrategy.replace('_', ' ')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 ${leadStatus === 'quente' ? 'bg-red-500 animate-pulse' : 'bg-black/20'}`}>
             <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
             <span className="text-[8px] font-black uppercase tracking-widest">Lead {leadStatus}</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative pb-10"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[12px] p-2.5 shadow-sm relative ${msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              {msg.audioUrl && msg.audioUrl !== 'ai-voice' && (
                <div className="mb-1 p-2 bg-black/5 rounded-xl flex items-center gap-3 border border-black/5 min-w-[200px]">
                  <i className="fas fa-play text-[#075e54]"></i>
                  <div className="flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-[#075e54]"></div>
                  </div>
                  <i className="fab fa-whatsapp text-emerald-600"></i>
                </div>
              )}
              <p className="text-[14px] leading-snug text-slate-800 font-medium whitespace-pre-wrap">{msg.text}</p>
              <div className="flex justify-end mt-1">
                <span className="text-[9px] text-slate-400 font-bold">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-4">
            <div className="bg-slate-900 text-amber-400 rounded-2xl px-5 py-3 shadow-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border-l-4 border-amber-500">
              <i className="fas fa-bolt animate-pulse"></i>
              IA ESTRATÉGICA: Analisando melhor oferta...
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

        {/* Modal Dinâmico de Venda */}
        {confirmedOrder && modalConfig && (
          <div className="flex justify-center my-6 animate-in zoom-in duration-500">
            <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-2xl max-w-[280px] text-center">
              <div className={`w-16 h-16 ${modalConfig.color} text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg`}>
                <i className={`fas ${modalConfig.icon}`}></i>
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">{modalConfig.title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{modalConfig.label}</p>
              
              <div className="text-left space-y-2 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cliente: <span className="text-slate-900">{confirmedOrder.customerName}</span></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Detalhes: <span className="text-slate-900 truncate block">{confirmedOrder.details}</span></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total: <span className="text-emerald-600 font-black">R$ {product.price}</span></p>
              </div>

              <button onClick={() => setConfirmedOrder(null)} className="text-slate-400 text-[10px] font-black uppercase hover:text-slate-900 transition-colors">Fechar Resumo</button>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2 bg-[#f0f2f5] border-t border-slate-200">
        <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2 max-w-4xl mx-auto pb-4 md:pb-1">
          <div className={`flex-1 bg-white rounded-full flex items-center px-4 py-1.5 shadow-sm border border-slate-200 ${isRecording ? 'ring-4 ring-red-500/20 bg-red-50' : ''}`}>
            {isRecording ? (
              <div className="flex items-center gap-3 w-full px-2">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                 <span className="text-red-600 font-black text-[10px] uppercase tracking-widest flex-1">Gravando... {recordingTime}s</span>
                 <button type="button" onClick={() => mediaRecorderRef.current?.stop()} className="text-red-500 text-[10px] font-black uppercase">Parar</button>
              </div>
            ) : (
              <>
                <i className="far fa-smile text-2xl text-slate-400 mr-3"></i>
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  disabled={isTyping || isThinking}
                  className="flex-1 bg-transparent py-3 outline-none text-[15px] font-medium"
                />
              </>
            )}
          </div>
          <button 
            type="button"
            onMouseDown={startRecording}
            onMouseUp={() => mediaRecorderRef.current?.stop()}
            onClick={input.trim() && !isRecording ? () => handleSend(null) : undefined}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-500 scale-110' : 'bg-[#075e54]'} text-white`}
          >
            <i className={input.trim() && !isRecording ? "fas fa-paper-plane" : (isRecording ? "fas fa-stop" : "fas fa-microphone")}></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSimulator;