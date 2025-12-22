
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
      text: "⚠️ Sua chave de API do Google Gemini não foi detectada. Para resolver, vá ao Painel e clique em 'Configurar Chave Agora'.",
      errorType: 'AUTH'
    };
  }

  // Sempre cria uma nova instância para garantir o uso da chave mais recente do seletor
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // No Plano PRO usamos o Gemini 3 Pro para Qualidade Superior e Qualificação de Leads
  let modelName = plan === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview'; 
  let thinkingBudget = plan === 'pro' ? 32768 : 0; 
  let responseModalities: Modality[] = [Modality.TEXT];

  // Se houver entrada de áudio, usamos o modelo nativo de áudio
  if (audioData) {
    modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';
  }

  // No Plano PRO o simulador pode responder em áudio se configurado (IA de Voz)
  if (plan === 'pro' && !isVipSupport && !audioData) {
    // Para fins de demonstração no simulador, alternamos ou permitimos áudio
    // responseModalities = [Modality.AUDIO]; // Descomentar para forçar áudio no PRO
  }

  const systemInstruction = isVipSupport 
    ? `Você é o estrategista VIP do ZapSeller AI. Ajude o usuário Pro a escalar. Fale sobre ROI e CoD.`
    : `PERSONA: Vendedor humano de elite. Seu objetivo é FECHAR A VENDA AGORA.
       PRODUTO: ${product.name} | PREÇO: R$ ${product.price}
       REGRAS CRÍTICAS: 
       1. FRETE GRÁTIS HOJE.
       2. PAGAMENTO NA ENTREGA (CoD) - O cliente só paga quando o produto chegar na mão dele.
       3. QUALIFICAÇÃO: Se o cliente parecer interessado, peça o endereço para agendar a entrega.
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
        temperature: 0.9,
        ...(thinkingBudget > 0 ? { 
          thinkingConfig: { thinkingBudget },
          maxOutputTokens: 25000 
        } : {}),
        responseModalities: responseModalities
      },
    });

    let textOutput = "";
    let audioOutput = "";

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.text) textOutput += part.text;
      if (part.inlineData?.data) audioOutput = part.inlineData.data;
    }

    return {
      text: textOutput || "Estou processando seu pedido de entrega...",
      audioData: audioOutput,
      isThinking: thinkingBudget > 0
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("API key") || error.message?.includes("not found")) {
      return { 
        text: "⚠️ Erro de Autenticação: Sua chave de API não tem permissão ou não foi selecionada. Por favor, clique em 'Configurar Chave' no topo do painel.",
        errorType: 'AUTH'
      };
    }
    return { text: "Estamos com uma instabilidade momentânea na rede do WhatsApp, mas já estou voltando!" };
  }
};
