import { GoogleGenAI, GenerateContentResponse, Type, FunctionDeclaration } from "@google/genai";
import { Product, Message, PlanType } from "../types";

export interface AIResponse {
  text: string;
  audioData?: string; 
  isThinking?: boolean;
  orderConfirmed?: any;
}

// Definição da ferramenta de fechamento de pedido para a IA
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
  
  // Inicialização obrigatória utilizando process.env.API_KEY conforme diretrizes
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  // Seleção de modelo baseada na tarefa e plano
  // Gemini 3 Pro é utilizado para tarefas complexas de vendas no plano Pro
  let modelName = 'gemini-3-flash-preview'; 
  if (plan === 'pro') modelName = 'gemini-3-pro-preview';
  if (audioData) modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';

  let strategyInstructions = "";
  switch(product.salesStrategy) {
    case 'digital':
      strategyInstructions = `Venda o acesso imediato. Link: ${product.checkoutUrl || 'Indisponível'}.`;
      break;
    case 'service':
      strategyInstructions = `Qualifique o lead e use confirmOrder quando ele quiser um orçamento.`;
      break;
    default:
      strategyInstructions = `PAGAMENTO NA ENTREGA (CoD). Cliente paga ao receber. Peça endereço via confirmOrder assim que ele demonstrar interesse.`;
  }

  const systemInstruction = isVipSupport 
    ? `Você é o Gerente VIP do ZapSeller AI. Ajude o usuário a configurar sua operação de vendas no WhatsApp.`
    : `Aja como um vendedor experiente de WhatsApp para o produto: ${product.name}.
       PREÇO: R$ ${product.price}
       BENEFÍCIOS: ${product.benefits}
       ESTRATÉGIA: ${strategyInstructions}
       REGRAS:
       1. Seja persuasivo e use emojis.
       2. Use frases curtas e diretas.
       3. Nunca mencione que você é uma inteligência artificial.
       4. Use gatilhos de escassez e urgência.
       5. ${customPrompt || ""}`;

  // Formatação das mensagens para o SDK
  const contents: any[] = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text || "Olá" }]
  }));

  // Inclusão de áudio se disponível (Suporte nativo no modelo 2.5 flash native audio)
  if (audioData && contents.length > 0) {
    const lastPart = contents[contents.length - 1];
    if (lastPart.role === 'user') {
      lastPart.parts.push({
        inlineData: {
          mimeType: audioData.mimeType,
          data: audioData.data
        }
      });
    }
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
        tools: [{ functionDeclarations: [confirmOrderTool] }],
        // Habilita raciocínio avançado se for modelo compatível
        ...(plan === 'pro' && modelName.includes('pro') ? { thinkingConfig: { thinkingBudget: 4000 } } : {})
      }
    });

    // Extração direta da propriedade .text conforme diretrizes
    let textOutput = response.text || "";
    let audioOutput = "";
    let orderDetails = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          audioOutput = part.inlineData.data;
        }
        if (part.functionCall) {
          orderDetails = { ...part.functionCall.args, strategy: product.salesStrategy };
          textOutput = "Perfeito! Já registrei suas informações aqui no sistema. Posso te ajudar com algo mais?";
        }
      }
    }

    return {
      text: textOutput,
      audioData: audioOutput,
      orderConfirmed: orderDetails
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { text: "⚠️ Ocorreu um erro na comunicação com a IA. Verifique sua conexão ou tente novamente em instantes." };
  }
};