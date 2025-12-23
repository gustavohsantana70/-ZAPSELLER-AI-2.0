import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

// Limites comerciais estritos por plano
const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  starter: 100,
  pro: 9999
};

const confirmOrderTool: FunctionDeclaration = {
  name: 'confirmOrder',
  parameters: {
    type: Type.OBJECT,
    description: 'Registra o fechamento de uma venda coletando dados do cliente.',
    properties: {
      customerName: { type: Type.STRING, description: 'Nome completo do cliente.' },
      details: { type: Type.STRING, description: 'Endereço de entrega ou requisitos.' },
    },
    required: ['customerName', 'details']
  }
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { history, product, customPrompt, audioData, plan = 'free', messagesSent = 0 } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });

  // 1. Verificação de Limite de Mensagens
  const limit = PLAN_LIMITS[plan] || 10;
  if (messagesSent >= limit) {
    return res.status(403).json({ 
      error: `Limite do plano ${plan.toUpperCase()} atingido (${messagesSent}/${limit}). Faça upgrade para continuar.` 
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Seleção de modelos: Pro usa Gemini 3 Pro, outros usam Flash
  let modelName = 'gemini-3-flash-preview';
  if (plan === 'pro') modelName = 'gemini-3-pro-preview';
  if (audioData) modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';

  // 2. Definição do Prompt Base conforme o Plano
  let systemInstruction = "";
  
  if (plan === 'free') {
    systemInstruction = `Você é um atendente educado. Responda de forma clara e objetiva. Não use técnicas agressivas de venda. Produto: ${product.name}. Preço: R$ ${product.price}.`;
  } else if (plan === 'starter') {
    systemInstruction = `Você é um vendedor experiente no WhatsApp. Seu objetivo é conduzir o cliente até a compra no modelo CoD (Pagamento na Entrega). Use prova social leve, benefícios e urgência moderada. Produto: ${product.name}. Preço: R$ ${product.price}. Benefícios: ${product.benefits}.`;
  } else if (plan === 'pro') {
    systemInstruction = `Você é um vendedor profissional focado em fechamento. 
    Antes de responder, pense na melhor estratégia para:
    - Quebrar objeções
    - Gerar urgência real
    - Conduzir para o fechamento imediato no CoD
    Nunca revele seu raciocínio interno. Use emojis e seja persuasivo.
    Produto: ${product.name}. Preço: R$ ${product.price}. Benefícios: ${product.benefits}.`;
  }

  // Adiciona customização se não for plano free
  if (customPrompt && plan !== 'free') {
    systemInstruction += `\n\nDiretriz Adicional: ${customPrompt}`;
  }

  const contents = history.map((msg: any) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text || "" }]
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
        temperature: plan === 'pro' ? 0.9 : 0.7,
        tools: [{ functionDeclarations: [confirmOrderTool] }],
        ...(plan === 'pro' && !audioData ? { thinkingConfig: { thinkingBudget: 12000 } } : {})
      }
    });

    let textOutput = response.text || "";
    let audioOutput = "";
    let orderConfirmed = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) audioOutput = part.inlineData.data;
        if (part.functionCall) {
          orderConfirmed = part.functionCall.args;
          textOutput = "Excelente! Já anotei seus dados aqui. Seu pedido será processado agora mesmo! 👋";
        }
      }
    }

    return res.status(200).json({
      text: textOutput,
      audioData: audioOutput,
      orderConfirmed
    });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: 'Erro ao processar com IA.' });
  }
}