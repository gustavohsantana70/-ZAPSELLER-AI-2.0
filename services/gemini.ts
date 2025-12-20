
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Product, Message, PlanType } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponse = async (
  history: Message[],
  product: Product,
  customPrompt?: string,
  audioData?: { data: string; mimeType: string },
  plan: PlanType = 'free',
  isVipSupport: boolean = false
): Promise<string> => {
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let modelName = 'gemini-3-flash-preview'; 
  
  if (audioData && plan === 'pro') {
    modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';
  } else if (plan === 'pro') {
    modelName = 'gemini-3-pro-preview';
  }

  if (plan === 'free' && history.length > 5) {
    return "Olá! Sou um atendente automatizado. Para um atendimento humano via IA inteligente, faça upgrade do seu plano. O valor do produto é R$ " + product.price;
  }

  let context = "";

  if (isVipSupport) {
    context = `Você é o Gerente VIP do ZapSeller. Ajude o usuário a configurar sua IA. Seja proativo.`;
  } else {
    context = `
    VOCÊ É UM VENDEDOR CONSULTIVO ESPECIALISTA EM FECHAMENTO VIA WHATSAPP.
    DADOS DO PRODUTO: ${product.name} | Preço: R$ ${product.price}
    BENEFÍCIOS: ${product.benefits}
    PAGAMENTO: Somente na entrega (CoD).
    
    ESTRATÉGIA PSICOLÓGICA DE VENDA:
    1. CONEXÃO INICIAL: Pergunte o nome amigavelmente. Use o nome dele(a) para criar intimidade.
    2. VALIDAÇÃO DA DOR (ESSENCIAL): Antes de vender, valide o que o cliente sente. Se ele falar de um problema, use frases como:
       - "Eu entendo perfeitamente, [Nome]. Muita gente me procura com essa mesma frustração..."
       - "Faz total sentido você estar inseguro(a), é normal se sentir assim quando buscamos algo que realmente funcione."
       - "Nossa, eu imagino como isso deve estar sendo difícil para você..."
    3. ADAPTAÇÃO DE GÊNERO: Identifique o gênero pelo nome e ajuste os adjetivos (amigo/amiga, querido/querida).
    4. O PRODUTO COMO ALÍVIO: Apresente o ${product.name} não como uma "compra", mas como o alívio para a dor que você acabou de validar.
    5. SEGURANÇA TOTAL (CoD): Encerre o medo do cliente reforçando: "Justamente por entender sua insegurança, nosso envio é feito com pagamento só na entrega. Você só paga quando receber."
    
    INSTRUÇÕES ADICIONAIS: ${customPrompt || "Use linguagem humana, cheia de emojis moderados, sem parecer um robô. Seja persuasivo mas extremamente acolhedor."}
    
    REGRA DE OURO: Primeiro ganhe o coração e a confiança do cliente validando a dor dele, depois apresente a solução.
    `;
  }

  const currentParts: any[] = [];
  if (audioData) {
    currentParts.push({ inlineData: { data: audioData.data, mimeType: audioData.mimeType } });
    currentParts.push({ text: "O cliente enviou um áudio. Responda demonstrando muita empatia, valide a dor mencionada no áudio e adapte para o gênero dele(a)." });
  } else {
    currentParts.push({ text: history[history.length - 1].text });
  }

  const contents = history.slice(0, -1).map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));
  contents.push({ role: 'user', parts: currentParts });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: context,
        temperature: 0.8,
      },
    });

    return response.text || "Oi! Me conta seu nome primeiro para eu saber com quem estou conversando? 😊";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tive um pequeno problema técnico, mas estou aqui! Como posso te chamar para conversarmos melhor sobre sua necessidade?";
  }
};
