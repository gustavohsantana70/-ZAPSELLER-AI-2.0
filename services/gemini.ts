
import { Product, Message, PlanType } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; 
  isThinking?: boolean;
  orderConfirmed?: any;
}

/**
 * Cliente de API para o ZapSeller AI.
 * Toda a lógica de prompts e limites é agora validada no servidor.
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
        messagesSent // Envia o uso atual para controle no backend
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na comunicação com o servidor');
    }

    return data;
  } catch (error: any) {
    console.error("API Fetch Error:", error);
    return { 
      text: error.message.includes("Limite") 
        ? `⚠️ ${error.message}` 
        : "⚠️ Ocorreu um erro ao falar com o vendedor virtual. Por favor, tente novamente." 
    };
  }
};
