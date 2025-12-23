import { Product, Message, PlanType } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; 
  isThinking?: boolean;
  orderConfirmed?: any;
}

/**
 * Cliente de API do ZapSeller AI.
 * Realiza chamadas seguras para o nosso backend, nunca diretamente para a IA.
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
      throw new Error(data.error || 'Erro de comunicação.');
    }

    return data;
  } catch (error: any) {
    return { 
      text: error.message.includes("Limite") 
        ? `⚠️ ${error.message}` 
        : "⚠️ Conexão instável. Tente novamente em instantes." 
    };
  }
};