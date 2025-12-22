
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Product, Message, PlanType } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; // Base64 PCM data
  isThinking?: boolean;
  errorType?: 'AUTH' | 'GENERAL';
}

export const getGeminiResponse = async (
  history: Message[],
  product: Product,
  customPrompt?: string,
  audioData?: { data: string; mimeType: string },
  plan: PlanType = 'free',
  isVipSupport: boolean = false
): Promise<AIResponse> => {
  
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return { 
      text: "⚠️ Chave de API não detectada. Por favor, clique no botão 'Configurar Chave' no painel.",
      errorType: 'AUTH'
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  let modelName = 'gemini-3-flash-preview'; 
  let thinkingBudget = 0;
  let responseModalities: Modality[] = [Modality.TEXT];

  if (audioData) {
    modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';
  } else if (plan === 'pro') {
    modelName = 'gemini-3-pro-preview';
    thinkingBudget = 16000; 
  }

  // Resposta em Áudio exclusiva para Simulador Pro
  if (plan === 'pro' && !isVipSupport && !audioData) {
    responseModalities = [Modality.AUDIO];
  }

  if (plan === 'free' && history.length > 6) {
    return { text: "⚠️ O atendimento automático foi pausado. No plano gratuito você tem um limite de 5 mensagens por lead. Faça o upgrade para continuar convertendo!" };
  }

  const systemInstruction = isVipSupport 
    ? `Você é o estrategista VIP do ZapSeller AI. Fale sobre ROI, métricas de CoD e como escalar operações de dropshipping nacional.`
    : `PERSONA: Vendedor humano, empático e focado em fechamento imediato.
       PRODUTO: ${product.name} | VALOR: R$ ${product.price}
       REGRAS: 
       1. Sempre reforce que o cliente só paga no ato da entrega (Pagamento na Entrega/CoD).
       2. Use escassez real (ex: 'meu estoque para o frete grátis de hoje está no fim').
       3. Se o cliente mandar áudio, responda de forma curta e direta.
       ${customPrompt || ""}`;

  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }] as any[]
  }));

  if (audioData) {
    const lastMsg = contents[contents.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      lastMsg.parts.unshift({
        inlineData: {
          data: audioData.data,
          mimeType: audioData.mimeType
        }
      });
    }
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
        seed: 42,
        ...(thinkingBudget > 0 ? { 
          thinkingConfig: { thinkingBudget },
          maxOutputTokens: 20000 
        } : {}),
        ...(responseModalities.includes(Modality.AUDIO) ? {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          }
        } : {
          responseModalities: [Modality.TEXT]
        })
      },
    });

    let textOutput = "";
    let audioOutput = "";

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.text) textOutput += part.text;
      if (part.inlineData?.data) audioOutput = part.inlineData.data;
    }

    return {
      text: textOutput || "Estou processando seu pedido...",
      audioData: audioOutput,
      isThinking: thinkingBudget > 0
    };
  } catch (error: any) {
    console.error("Gemini Critical Error:", error);
    if (error.message?.includes("Requested entity was not found") || error.message?.includes("API key")) {
      return { 
        text: "⚠️ Falha de Autenticação: Sua chave de API expirou ou não foi encontrada. Clique em 'Configurar Chave'.",
        errorType: 'AUTH'
      };
    }
    return { text: "Estou verificando aqui no sistema... Um momento, por favor!" };
  }
};
