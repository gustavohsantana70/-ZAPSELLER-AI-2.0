
import { GoogleGenAI, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";
import { Product, Message, PlanType, SalesStrategy } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; 
  isThinking?: boolean;
  orderConfirmed?: any;
  needsKey?: boolean;
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
  if (!apiKey) return { text: "Chave de API não configurada.", needsKey: true };

  const ai = new GoogleGenAI({ apiKey });
  let modelName = plan === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  if (audioData) modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';

  let strategyInstructions = "";
  switch(product.salesStrategy) {
    case 'digital':
      strategyInstructions = `VOCÊ VENDE UM PRODUTO DIGITAL/INFOPRODUTO. 
        - Link de checkout: ${product.checkoutUrl || 'Link pendente'}.
        - Chame confirmOrder quando ele quiser comprar.`;
      break;
    case 'service':
      strategyInstructions = `VOCÊ VENDE UM SERVIÇO/CONSULTORIA.
        - Qualifique o lead e peça os requisitos.
        - Chame confirmOrder para agendamento.`;
      break;
    case 'physical_prepaid':
      strategyInstructions = `VOCÊ VENDE PRODUTO FÍSICO COM PAGAMENTO ANTECIPADO.
        - Envie o link ou Pix: ${product.pixKey || 'Pendente'}.
        - Chame confirmOrder na confirmação de pagamento.`;
      break;
    default:
      strategyInstructions = `VOCÊ VENDE PRODUTO FÍSICO COM PAGAMENTO NA ENTREGA (CoD).
        - Peça nome e endereço completo.
        - Chame confirmOrder assim que ele passar o endereço.`;
  }

  const systemInstruction = isVipSupport 
    ? `Você é o estrategista sênior do ZapSeller IA. Ajude o usuário a escalar.`
    : `VOCÊ É UM VENDEDOR HUMANO DE ALTA PERFORMANCE.
       PRODUTO: ${product.name} | VALOR: R$ ${product.price}.
       BENEFÍCIOS: ${product.benefits}.
       ${strategyInstructions}
       REGRAS: Use emojis, seja direto. ${customPrompt || ""}`;

  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }] as any[]
  }));

  try {
    const config: any = {
      systemInstruction,
      temperature: 0.9,
      tools: [{ functionDeclarations: [confirmOrderTool] }]
    };

    if (plan === 'pro' && !audioData) config.thinkingConfig = { thinkingBudget: 16000 };

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
        textOutput = "Pedido em processamento! Verifique as informações acima.";
      }
    }

    return {
      text: textOutput || "Como posso ajudar você a finalizar?",
      audioData: audioOutput,
      isThinking: !!config.thinkingConfig,
      orderConfirmed: orderDetails
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("API key")) {
      return { text: "Erro na Chave de API. Por favor, reconfigure sua chave de acesso.", needsKey: true };
    }
    return { text: "O sistema de IA está sendo reiniciado. Por favor, aguarde um momento ou verifique sua conexão." };
  }
};
