
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Product, Message, PlanType } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; 
  isThinking?: boolean;
  errorType?: 'AUTH' | 'GENERAL' | 'NOT_FOUND';
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
      text: "⚠️ Chave de API não configurada. Selecione sua chave clicando no botão de aviso no topo.",
      errorType: 'AUTH'
    };
  }

  // Cria nova instância para garantir o uso da chave atualizada
  const ai = new GoogleGenAI({ apiKey });
  
  // No Pro usamos o Gemini 3 Pro (Requer projeto com Billing ativo)
  // No Free/Starter usamos o Flash
  let modelName = (plan === 'pro' || isVipSupport) ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview'; 
  let thinkingBudget = (plan === 'pro') ? 16000 : 0; 

  if (audioData) {
    modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';
  }

  const systemInstruction = isVipSupport 
    ? `Você é o estrategista VIP do ZapSeller AI. Explique como configurar chaves de API e escalar vendas no WhatsApp.`
    : `PERSONA: Vendedor de WhatsApp ultra-persuasivo. 
       PRODUTO: ${product.name} | VALOR: R$ ${product.price}
       REGRAS: 
       1. FRETE GRÁTIS HOJE.
       2. PAGAMENTO NA ENTREGA (CoD).
       3. Peça o endereço para fechar o pedido assim que o cliente mostrar interesse.
       ${customPrompt || ""}`;

  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }] as any[]
  }));

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        ...(thinkingBudget > 0 ? { thinkingConfig: { thinkingBudget } } : {}),
      },
    });

    return {
      text: response.text || "Entendido. Como podemos prosseguir com seu pedido?",
      isThinking: thinkingBudget > 0
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorMsg = error.message || "";
    
    // Se o erro for 'Requested entity was not found', a chave não tem acesso ao modelo Gemini 3 Pro
    if (errorMsg.includes("Requested entity was not found")) {
      return { 
        text: "⚠️ Erro de Permissão: Sua chave de API não tem acesso a este modelo. Verifique se o faturamento está ativo no Google Cloud.",
        errorType: 'NOT_FOUND'
      };
    }
    
    if (errorMsg.includes("API key") || errorMsg.includes("invalid")) {
      return { 
        text: "⚠️ Chave Inválida: O código da chave de API está incorreto ou expirou.",
        errorType: 'AUTH'
      };
    }

    return { text: "Estou processando seu pedido de entrega CoD. Pode me confirmar seu bairro?" };
  }
};
