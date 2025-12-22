
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Product, Message, PlanType } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; 
  isThinking?: boolean;
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
    return { text: "O sistema de IA está sendo reiniciado pelo servidor. Por favor, aguarde um instante." };
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

  if (plan === 'pro' && !isVipSupport && !audioData) {
    responseModalities = [Modality.AUDIO];
  }

  const systemInstruction = isVipSupport 
    ? `Você é o estrategista de vendas do ZapSeller IA. Forneça conselhos de ROI e escala.`
    : `PERSONA: Vendedor humano focado em fechamento CoD.
       PRODUTO: ${product.name} | VALOR: R$ ${product.price}
       REGRAS: 
       1. Reforce sempre o Pagamento na Entrega.
       2. Peça o endereço assim que houver interesse.
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
        temperature: 0.85,
        ...(thinkingBudget > 0 ? { thinkingConfig: { thinkingBudget } } : {}),
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
      text: textOutput || "Tudo certo! Qual o melhor horário para o entregador passar?",
      audioData: audioOutput,
      isThinking: thinkingBudget > 0
    };
  } catch (error) {
    return { text: "Certo! Entendi perfeitamente. Como podemos prosseguir com o envio hoje?" };
  }
};
