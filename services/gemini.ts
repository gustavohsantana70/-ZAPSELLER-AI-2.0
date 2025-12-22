
import { GoogleGenAI, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";
import { Product, Message, PlanType, SalesStrategy } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; 
  isThinking?: boolean;
  orderConfirmed?: any;
}

const confirmOrderTool: FunctionDeclaration = {
  name: 'confirmOrder',
  parameters: {
    type: Type.OBJECT,
    description: 'Registra o fechamento de uma venda ou interesse qualificado.',
    properties: {
      customerName: { type: Type.STRING, description: 'Nome do cliente' },
      details: { type: Type.STRING, description: 'Endereço (se físico) ou E-mail (se digital) ou Requisitos (se serviço)' },
      strategy: { type: Type.STRING, description: 'Estratégia utilizada' }
    },
    required: ['customerName', 'details', 'strategy']
  }
};

export const getGeminiResponse = async (
  history: Message[],
  product: Product,
  customPrompt?: string,
  audioData?: { data: string; mimeType: string },
  plan: PlanType = 'free',
  isVipSupport: boolean = false
): Promise<AIResponse> => {
  
  const apiKey = process.env.API_KEY;
  // Se a chave não estiver no ambiente, o sistema falhará silenciosamente para o dev resolver no deploy
  if (!apiKey) return { text: "O serviço de atendimento está passando por uma atualização rápida. Por favor, tente novamente em alguns segundos." };

  const ai = new GoogleGenAI({ apiKey });
  let modelName = plan === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  if (audioData) modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';

  let strategyInstructions = "";
  switch(product.salesStrategy) {
    case 'digital':
      strategyInstructions = `VOCÊ VENDE UM PRODUTO DIGITAL. Link: ${product.checkoutUrl || 'Link pendente'}.`;
      break;
    case 'service':
      strategyInstructions = `VOCÊ VENDE UM SERVIÇO. Qualifique o lead e use confirmOrder para o orçamento.`;
      break;
    case 'physical_prepaid':
      strategyInstructions = `VOCÊ VENDE PRODUTO FÍSICO COM PAGAMENTO ANTECIPADO. Pix/Link: ${product.pixKey || 'Pendente'}.`;
      break;
    default:
      strategyInstructions = `VOCÊ VENDE PRODUTO FÍSICO COM PAGAMENTO NA ENTREGA (CoD). Peça o endereço.`;
  }

  const systemInstruction = isVipSupport 
    ? `Você é o estrategista do ZapSeller. Ajude o usuário.`
    : `Você é um vendedor humano de alta performance no WhatsApp. 
       PRODUTO: ${product.name}. 
       VALOR: R$ ${product.price}. 
       REGRAS: Seja direto, use emojis, não pareça um robô. 
       ${strategyInstructions} 
       ${customPrompt || ""}`;

  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }] as any[]
  }));

  try {
    const config: any = {
      systemInstruction,
      temperature: 0.8,
      tools: [{ functionDeclarations: [confirmOrderTool] }]
    };

    if (plan === 'pro' && !audioData) {
      config.thinkingConfig = { thinkingBudget: 4000 };
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents,
      config
    });

    let textOutput = "";
    let audioOutput = "";
    let orderDetails = null;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.text) textOutput += part.text;
      if (part.inlineData?.data) audioOutput = part.inlineData.data;
      if (part.functionCall) {
        orderDetails = { ...part.functionCall.args, strategy: product.salesStrategy };
        textOutput = "Pedido em processamento! Verifique as informações.";
      }
    }

    return {
      text: textOutput || "Pode me falar mais sobre sua dúvida?",
      audioData: audioOutput,
      isThinking: !!config.thinkingConfig,
      orderConfirmed: orderDetails
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { text: "O vendedor está ocupado no momento. Por favor, envie a mensagem novamente." };
  }
};
