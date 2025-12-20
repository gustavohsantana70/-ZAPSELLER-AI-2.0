
import React, { useState, useRef, useEffect } from 'react';
import { Product, Message, User } from '../types';
import { getGeminiResponse } from '../services/gemini';
import { PLANS_CONFIG } from '../App';

interface ChatSimulatorProps {
  user: User;
  product: Product;
  customPrompt: string;
  onBack: () => void;
  onMessageSent: () => void;
}

const ChatSimulator: React.FC<ChatSimulatorProps> = ({ user, product, customPrompt, onBack, onMessageSent }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Olá! 👋 Tudo bem? Com quem eu falo por aqui para começarmos o atendimento?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [leadStatus, setLeadStatus] = useState<'frio' | 'morno' | 'quente'>('frio');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentPlan = PLANS_CONFIG[user.plan];
  const maxMessages = currentPlan.maxMessages;
  const isAtLimit = user.messagesSent >= maxMessages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    if (messages.length > 2) {
      const lastThree = messages.slice(-3).map(m => m.text.toLowerCase()).join(' ');
      if (lastThree.includes('entrega') || lastThree.includes('preço') || lastThree.includes('comprar')) {
        setLeadStatus('quente');
      } else if (messages.length > 4) {
        setLeadStatus('morno');
      }
    }
  }, [messages, isTyping]);

  const handleSend = async (
    e: React.FormEvent | null, 
    audioData?: { data: string; mimeType: string },
    audioUrl?: string
  ) => {
    if (e) e.preventDefault();
    if (isAtLimit) {
      alert(`Limite atingido!`);
      return;
    }
    
    const textToSend = input.trim();
    if (!textToSend && !audioData) return;

    const userMessage: Message = { 
      role: 'user', 
      text: audioData ? "🎤 Mensagem de voz" : textToSend, 
      timestamp: new Date(),
      audioUrl: audioUrl
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    onMessageSent();

    try {
      const aiResponseText = await getGeminiResponse(newMessages, product, customPrompt, audioData, user.plan);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'model', text: aiResponseText, timestamp: new Date() }]);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    if (isAtLimit) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          handleSend(null, { data: base64String, mimeType: 'audio/webm' }, audioUrl);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { 
      console.error("Erro ao acessar microfone:", err);
      alert("Microfone não autorizado.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#e5ddd5] z-[100] md:relative md:h-screen">
      <header className="bg-[#075e54] text-white p-4 py-3 flex items-center justify-between shadow-xl z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-black/10 rounded-full transition-colors active:scale-90">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black relative shrink-0">
            ZS
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#25d366] border-2 border-[#075e54] rounded-full"></span>
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-sm leading-none truncate max-w-[120px] sm:max-w-none">Vendedor IA</h2>
            <p className="text-[9px] opacity-80 uppercase tracking-widest font-black mt-1">Online agora</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user.plan !== 'free' && (
            <div className={`flex items-center gap-1.5 bg-black/10 px-2.5 py-1.5 rounded-xl border border-white/10`}>
               <div className={`w-2 h-2 rounded-full ${leadStatus === 'frio' ? 'bg-blue-400' : leadStatus === 'morno' ? 'bg-amber-400' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
               <span className={`text-[9px] font-black uppercase tracking-widest hidden sm:inline ${leadStatus === 'frio' ? 'text-blue-200' : leadStatus === 'morno' ? 'text-amber-200' : 'text-red-200'}`}>{leadStatus}</span>
            </div>
          )}
          <button className="p-2 opacity-80"><i className="fas fa-video"></i></button>
          <button className="p-2 opacity-80"><i className="fas fa-phone"></i></button>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative custom-scrollbar pb-8"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px', backgroundRepeat: 'repeat' }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[16px] p-3 shadow-sm relative ${msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              {msg.audioUrl && (
                <div className="mb-2 p-3 bg-black/5 rounded-2xl flex items-center gap-3 border border-black/5 min-w-[200px]">
                  <button className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <i className="fas fa-play text-[10px] ml-1"></i>
                  </button>
                  <div className="flex-1 space-y-1">
                    <div className="h-1 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="w-0 h-full bg-emerald-600"></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-emerald-700 uppercase">
                      <span>Voz</span>
                      <span>0:04</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center text-[10px] text-emerald-600 font-bold">
                    IA
                  </div>
                </div>
              )}
              {msg.text && msg.text !== "🎤 Mensagem de voz" && (
                <p className="text-[14px] leading-relaxed text-slate-800 font-medium whitespace-pre-wrap">{msg.text}</p>
              )}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'user' && <i className="fas fa-check-double text-[9px] text-blue-400"></i>}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-400 rounded-2xl px-4 py-2 shadow-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              Vendedor ouvindo...
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-[#f0f2f5] shrink-0 border-t border-slate-200">
        <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2 max-w-4xl mx-auto pb-6 md:pb-2">
          <div className={`flex-1 bg-white rounded-full flex items-center px-5 py-1.5 shadow-sm border border-slate-200 ${isRecording ? 'ring-4 ring-red-500/20 animate-pulse bg-red-50' : ''}`}>
            <button type="button" className="text-slate-400 mr-3 hover:text-slate-600">
               <i className="far fa-smile text-2xl"></i>
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? "IA está ouvindo..." : "Escreva seu nome ou envie um áudio"}
              disabled={isRecording || isAtLimit}
              className="flex-1 bg-transparent py-3 outline-none text-[15px] text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium"
            />
            {!input.trim() && (
               <button type="button" className="text-slate-400 ml-3 hover:text-slate-600">
                  <i className="fas fa-camera text-xl"></i>
               </button>
            )}
          </div>
          {input.trim() ? (
            <button type="submit" className="w-14 h-14 bg-[#075e54] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0">
              <i className="fas fa-paper-plane text-xl ml-1"></i>
            </button>
          ) : (
            <button 
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 shrink-0 ${isRecording ? 'bg-red-500 scale-110 shadow-red-200 ring-4 ring-red-100' : 'bg-[#075e54]'} text-white`}
            >
              <i className={isRecording ? "fas fa-stop text-lg" : "fas fa-microphone text-xl"}></i>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatSimulator;
