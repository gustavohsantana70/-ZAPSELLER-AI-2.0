
import { Product, Message, PlanType } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; 
  isThinking?: boolean;
  orderConfirmed?: any;
}

/**
 * Cliente de API para o ZapSeller AI.
 * Agora toda a lógica pesada e a chave de API ficam protegidas no backend.
 */
export const getGeminiResponse = async (
  history: Message[],
  product: Product,
  customPrompt?: string,
  audioData?: { data: string; mimeType: string },
  plan: PlanType = 'free',
  isVipSupport: boolean = false
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
        isVipSupport
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro na comunicação com o servidor');
    }

    return await response.json();
  } catch (error: any) {
    console.error("API Fetch Error:", error);
    return { 
      text: "⚠️ Ocorreu um erro ao falar com o vendedor virtual. Por favor, tente novamente em alguns instantes." 
    };
  }
};
