
import React, { useState, useRef, useEffect } from 'react';
import { Product, Message, User } from '../types';
import { getGeminiResponse, AIResponse } from '../services/gemini';
import { PLANS_CONFIG } from '../App';

// Funções de decodificação de áudio PCM para Gemini (Raw PCM 24kHz)
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

interface ChatSimulatorProps {
  user: User;
  product: Product;
  customPrompt: string;
  onBack: () => void;
  onMessageSent: () => void;
  onConfigKey?: () => void;
}

const ChatSimulator: React.FC<ChatSimulatorProps> = ({ user, product, customPrompt, onBack, onMessageSent, onConfigKey }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Olá! 👋 Tudo bem? Com quem eu falo por aqui para começarmos o atendimento?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [leadStatus, setLeadStatus] = useState<'frio' | 'morno' | 'quente'>('frio');
  const [authError, setAuthError] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentPlan = PLANS_CONFIG[user.plan];
  const maxMessages = currentPlan.maxMessages;
  const isAtLimit = user.messagesSent >= maxMessages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isThinking]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
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
      const audioBuffer = await decodeAudioData(audioData, ctx);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("Falha na reprodução de voz IA:", e);
    }
  };

  const handleSend = async (
    e: React.FormEvent | null, 
    audioInput?: { data: string; mimeType: string },
    audioUrl?: string
  ) => {
    if (e) e.preventDefault();
    if (isAtLimit) {
      alert(`Ops! Você atingiu seu limite de mensagens no plano ${user.plan.toUpperCase()}.`);
      return;
    }
    
    const textToSend = input.trim();
    if (!textToSend && !audioInput) return;

    const userMessage: Message = { 
      role: 'user', 
      text: audioInput ? "🎤 Mensagem de voz recebida" : textToSend, 
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
      const aiRes: AIResponse = await getGeminiResponse(updatedHistory, product, customPrompt, audioInput, user.plan);
      
      setIsTyping(false);
      setIsThinking(false);

      if (aiRes.errorType === 'AUTH') {
        setAuthError(true);
      }
      
      const modelMsg: Message = { 
        role: 'model', 
        text: aiRes.text, 
        timestamp: new Date(),
        audioUrl: aiRes.audioData ? 'ai-voice-generated' : undefined
      };

      setMessages(prev => [...prev, modelMsg]);

      if (aiRes.audioData) {
        playAIResponse(aiRes.audioData);
      }
      
      // Lógica básica de scoring do lead
      const fullText = (textToSend + " " + aiRes.text).toLowerCase();
      if (fullText.includes('confirmado') || fullText.includes('endereço') || fullText.includes('rua') || fullText.includes('número')) {
        setLeadStatus('quente');
      } else if (updatedHistory.length > 4) {
        setLeadStatus('morno');
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setIsThinking(false);
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
      alert("Microfone não disponível. Por favor, verifique as permissões do seu navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#e5ddd5] z-[100] md:relative md:h-screen font-sans overflow-hidden">
      {/* WhatsApp Header */}
      <header className="bg-[#075e54] text-white p-4 py-3 flex items-center justify-between shadow-lg z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-black/10 rounded-full transition-colors active:scale-90">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black relative shrink-0">
            ZS
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#25d366] border-2 border-[#075e54] rounded-full"></span>
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-sm leading-none truncate">Vendedor Virtual</h2>
            <p className="text-[9px] opacity-80 uppercase tracking-widest font-black mt-1">visto por último hoje às {new Date().getHours()}:00</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 bg-black/10 px-2.5 py-1.5 rounded-xl border border-white/10`}>
             <div className={`w-2 h-2 rounded-full ${leadStatus === 'frio' ? 'bg-blue-400' : leadStatus === 'morno' ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`}></div>
             <span className="text-[9px] font-black uppercase tracking-widest text-white/90">Potencial {leadStatus}</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative pb-10"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}
      >
        <div className="flex justify-center mb-6">
           <span className="bg-[#e1f3fb] text-[#54656f] text-[11px] font-bold px-4 py-1.5 rounded-xl shadow-sm uppercase tracking-widest">Criptografia de ponta a ponta</span>
        </div>

        {authError && (
          <div className="flex justify-center mb-6 animate-in zoom-in">
             <div className="bg-amber-100 border border-amber-300 p-6 rounded-[24px] text-center max-w-xs shadow-xl">
                <i className="fas fa-key text-amber-600 text-3xl mb-4"></i>
                <h3 className="text-slate-900 font-black text-sm mb-2">Chave API Necessária</h3>
                <p className="text-slate-600 text-xs font-bold mb-4">A conexão com a inteligência artificial requer uma chave válida.</p>
                <button 
                  onClick={() => { onConfigKey?.(); setAuthError(false); }}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                   Configurar Chave
                </button>
             </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[12px] p-2.5 shadow-sm relative ${msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              
              {msg.audioUrl && (
                <div className="mb-1 p-2 bg-black/5 rounded-xl flex items-center gap-3 border border-black/5 min-w-[220px]">
                  <button className="w-9 h-9 bg-[#075e54] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm active:scale-95">
                    <i className="fas fa-play text-[10px] ml-1"></i>
                  </button>
                  <div className="flex-1">
                    <div className="h-1 bg-black/10 rounded-full w-full mb-1">
                       <div className="h-full bg-[#075e54] w-[40%]"></div>
                    </div>
                    <p className="text-[8px] font-bold text-slate-500 uppercase">{msg.role === 'model' ? 'Áudio da IA' : 'Áudio enviado'}</p>
                  </div>
                  <i className="fab fa-whatsapp text-emerald-600 text-xl"></i>
                </div>
              )}

              {msg.text && msg.text !== "🎤 Mensagem de voz recebida" && (
                <p className="text-[14px] leading-snug text-slate-800 font-medium whitespace-pre-wrap">{msg.text}</p>
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

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-900 text-amber-400 rounded-full px-5 py-2.5 shadow-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-slate-800 border-l-amber-500 border-l-4">
              <i className="fas fa-bolt animate-pulse"></i>
              IA Pro analisando estratégia de fechamento...
            </div>
          </div>
        )}

        {isTyping && !isThinking && (
          <div className="flex justify-start">
            <div className="bg-white text-emerald-600 rounded-full px-4 py-2 shadow-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-100">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              digitando...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2 bg-[#f0f2f5] shrink-0 border-t border-slate-200">
        <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2 max-w-4xl mx-auto pb-4 md:pb-1">
          <div className={`flex-1 bg-white rounded-full flex items-center px-4 py-1.5 shadow-sm border border-slate-200 transition-all ${isRecording ? 'ring-4 ring-red-500/20 bg-red-50' : ''}`}>
            {isRecording ? (
              <div className="flex items-center gap-3 w-full px-2">
                 <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                 <span className="text-red-600 font-black text-xs uppercase tracking-widest flex-1">Gravando Áudio • {recordingTime}s</span>
                 <button type="button" onClick={stopRecording} className="text-red-500 text-xs font-black hover:bg-red-100 px-3 py-1 rounded-full uppercase">Parar</button>
              </div>
            ) : (
              <>
                <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="far fa-smile text-2xl"></i>
                </button>
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Mensagem"
                  disabled={isAtLimit || isTyping || isThinking}
                  className="flex-1 bg-transparent py-3 px-3 outline-none text-[15px] text-slate-800 font-medium placeholder:text-slate-400 disabled:opacity-50"
                />
                <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fas fa-paperclip text-xl rotate-45"></i>
                </button>
              </>
            )}
          </div>

          <button 
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            onClick={input.trim() ? () => handleSend(null) : undefined}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 shrink-0 ${isRecording ? 'bg-red-500 scale-125 shadow-red-200' : 'bg-[#075e54]'} text-white`}
          >
            <i className={input.trim() && !isRecording ? "fas fa-paper-plane text-lg ml-1" : (isRecording ? "fas fa-stop" : "fas fa-microphone text-xl")}></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSimulator;
