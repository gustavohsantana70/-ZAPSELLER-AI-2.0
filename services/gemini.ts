import { Product, Message, PlanType } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; 
  isThinking?: boolean;
  orderConfirmed?: any;
}

/**
 * Cliente de API do ZapSeller AI.
 * Toda a inteligência e validação de chaves ocorre no backend (api/chat.ts).
 */
export const getGeminiResponse = async (
  history: Message[],
  product: Product,
  customPrompt?: string,
  audioData?: { data: string; mimeType: string },
  plan: PlanType = 'free',
  isVipSupport: boolean = false,
  messagesSent: number = 0
): Promise<AIResponse> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        product,
        customPrompt,
        audioData,
        plan,
        isVipSupport,
        messagesSent 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Falha na conexão com o servidor');
    }

    return data;
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { 
      text: error.message.includes("Limite") || error.message.includes("Plano")
        ? `⚠️ ${error.message}` 
        : "⚠️ Desculpe, tive um problema de conexão. Poderia tentar de novo?" 
    };
  }
};