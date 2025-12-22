
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
  if (!apiKey) return { text: "O vendedor está finalizando outro atendimento. Aguarde um instante." };

  const ai = new GoogleGenAI({ apiKey });
  // Priorizamos modelos de alta performance para o Micro-SaaS
  let modelName = 'gemini-3-flash-preview'; 
  if (plan === 'pro') modelName = 'gemini-3-pro-preview';
  if (audioData) modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';

  let strategyInstructions = "";
  switch(product.salesStrategy) {
    case 'digital':
      strategyInstructions = `VOCÊ VENDE UM PRODUTO DIGITAL. Foque na entrega imediata via e-mail. Link: ${product.checkoutUrl || 'Checkout Ativo'}.`;
      break;
    case 'service':
      strategyInstructions = `VOCÊ VENDE UM SERVIÇO. Foque em autoridade e qualificação. Peça os dados para orçamento.`;
      break;
    case 'physical_prepaid':
      strategyInstructions = `VOCÊ VENDE PRODUTO FÍSICO COM PAGAMENTO ANTECIPADO. Destaque o envio imediato após Pix: ${product.pixKey || 'Chave Pix Ativa'}.`;
      break;
    default:
      strategyInstructions = `VOCÊ VENDE PRODUTO FÍSICO NO MODELO COD (PAGAMENTO NA ENTREGA). Este é seu maior trunfo: o cliente só paga quando receber em casa. Peça o endereço completo para fechar.`;
  }

  const systemInstruction = isVipSupport 
    ? `Você é o estrategista sênior do ZapSeller. Sua missão é fazer o usuário lucrar.`
    : `ATUE COMO UM VENDEDOR HUMANO REAL NO WHATSAPP.
       PRODUTO: ${product.name} | VALOR: R$ ${product.price}.
       ESTILO: Persuasivo, amigável, usa emojis, usa frases curtas. 
       OBJETIVO: Levar ao fechamento rápido. 
       ${strategyInstructions}
       PERSONALIDADE ADICIONAL: ${customPrompt || "Foque na segurança do cliente."}`;

  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }] as any[]
  }));

  try {
    const config: any = {
      systemInstruction,
      temperature: 0.85,
      tools: [{ functionDeclarations: [confirmOrderTool] }]
    };

    if (plan === 'pro' && !audioData) {
      config.thinkingConfig = { thinkingBudget: 8000 };
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
        textOutput = "Pedido em processamento! Verifique as informações acima para confirmarmos seu envio.";
      }
    }

    return {
      text: textOutput || "Estou aqui para tirar suas dúvidas, como posso ajudar?",
      audioData: audioOutput,
      isThinking: !!config.thinkingConfig,
      orderConfirmed: orderDetails
    };
  } catch (error: any) {
    console.error("Gemini Critical Error:", error);
    return { text: "O sistema de IA está sendo sincronizado. Por favor, reenvie sua mensagem em 2 segundos." };
  }
};
