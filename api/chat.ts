
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

// Configuração da ferramenta de fechamento de pedido
const confirmOrderTool: FunctionDeclaration = {
  name: 'confirmOrder',
  parameters: {
    type: Type.OBJECT,
    description: 'Registra o fechamento de uma venda ou interesse qualificado coletando dados do cliente.',
    properties: {
      customerName: { type: Type.STRING, description: 'Nome completo do cliente.' },
      details: { type: Type.STRING, description: 'Endereço de entrega, e-mail ou requisitos específicos.' },
    },
    required: ['customerName', 'details']
  }
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { history, product, customPrompt, audioData, plan, isVipSupport } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY não configurada no servidor.' });
  }

  const ai = new GoogleGenAI({ apiKey });

  // Seleção inteligente de modelos
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
      strategyInstructions = `PAGAMENTO NA ENTREGA (CoD). Cliente paga ao receber em mãos. Peça endereço via confirmOrder.`;
  }

  const systemInstruction = isVipSupport 
    ? `Você é o Gerente VIP do ZapSeller AI. Ajude o usuário a configurar sua operação de vendas no WhatsApp.`
    : `Aja como um vendedor experiente de WhatsApp para o produto: ${product.name}.
       PREÇO: R$ ${product.price}
       BENEFÍCIOS: ${product.benefits}
       ESTRATÉGIA: ${strategyInstructions}
       REGRAS:
       1. Seja persuasivo e use emojis.
       2. Use frases curtas.
       3. Nunca diga que é uma IA.
       4. Use gatilhos de escassez e urgência.
       5. ${customPrompt || ""}`;

  const contents = history.map((msg: any) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text || "Olá" }]
  }));

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
        ...(plan === 'pro' ? { thinkingConfig: { thinkingBudget: 8000 } } : {})
      }
    });

    let textOutput = response.text || "";
    let audioOutput = "";
    let orderDetails = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) audioOutput = part.inlineData.data;
        if (part.functionCall) {
          orderDetails = { ...part.functionCall.args, strategy: product.salesStrategy };
          textOutput = "Perfeito! Já registrei suas informações aqui no sistema. Posso te ajudar com algo mais?";
        }
      }
    }

    return res.status(200).json({
      text: textOutput,
      audioData: audioOutput,
      orderConfirmed: orderDetails
    });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: 'Erro ao processar requisição de IA.' });
  }
}
