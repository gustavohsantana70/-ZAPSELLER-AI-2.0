
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
  if (!apiKey) return { text: "Chave de API não configurada." };

  const ai = new GoogleGenAI({ apiKey });
  let modelName = plan === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  if (audioData) modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';

  // Lógica de instrução baseada na estratégia
  let strategyInstructions = "";
  switch(product.salesStrategy) {
    case 'digital':
      strategyInstructions = `VOCÊ VENDE UM PRODUTO DIGITAL/INFOPRODUTO. 
        - O acesso é imediato por e-mail após o pagamento.
        - Quando o cliente quiser comprar, envie o link de checkout: ${product.checkoutUrl || 'Link pendente'}.
        - Chame confirmOrder quando ele disser que vai comprar ou pedir o link.`;
      break;
    case 'service':
      strategyInstructions = `VOCÊ VENDE UM SERVIÇO/CONSULTORIA.
        - Seu objetivo é qualificar o lead e entender a dor dele.
        - Tente agendar uma conversa ou pedir os requisitos.
        - Chame confirmOrder quando ele fornecer os dados de contato para o orçamento.`;
      break;
    case 'physical_prepaid':
      strategyInstructions = `VOCÊ VENDE PRODUTO FÍSICO COM PAGAMENTO ANTECIPADO.
        - Peça o endereço para calcular o frete (mesmo que seja grátis).
        - Envie o link de checkout ou Chave Pix: ${product.pixKey || 'Pendente'}.
        - Chame confirmOrder quando ele confirmar que enviará o pagamento.`;
      break;
    default: // physical_cod
      strategyInstructions = `VOCÊ VENDE PRODUTO FÍSICO COM PAGAMENTO NA ENTREGA (CoD).
        - O maior benefício é a segurança: "Só paga quando chegar".
        - Peça nome e endereço completo.
        - Chame confirmOrder assim que ele passar o endereço.`;
  }

  const systemInstruction = isVipSupport 
    ? `Você é o estrategista sênior do ZapSeller IA. Ajude o usuário a vender mais.`
    : `VOCÊ É UM VENDEDOR HUMANO DE ALTA PERFORMANCE.
       PRODUTO: ${product.name} | VALOR: R$ ${product.price}.
       BENEFÍCIOS: ${product.benefits}.
       
       ${strategyInstructions}
       
       REGRAS GERAIS: Use emojis, seja direto, simule digitação humana.
       ${customPrompt || ""}`;

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
        textOutput = "Pedido em processamento! Verifique as informações acima para finalizarmos.";
      }
    }

    return {
      text: textOutput || "Como posso ajudar você a finalizar sua compra?",
      audioData: audioOutput,
      isThinking: !!config.thinkingConfig,
      orderConfirmed: orderDetails
    };
  } catch (error) {
    return { text: "Entendido! Como deseja prosseguir com a sua compra?" };
  }
};
