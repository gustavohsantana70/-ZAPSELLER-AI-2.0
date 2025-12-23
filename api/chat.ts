
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

// Limites comerciais por plano
const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  starter: 100,
  pro: 9999
};

const confirmOrderTool: FunctionDeclaration = {
  name: 'confirmOrder',
  parameters: {
    type: Type.OBJECT,
    description: 'Coleta dados para fechamento de pedido ou agendamento.',
    properties: {
      customerName: { type: Type.STRING, description: 'Nome do cliente' },
      details: { type: Type.STRING, description: 'Endereço ou requisitos' },
    },
    required: ['customerName', 'details']
  }
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { history, product, customPrompt, audioData, plan = 'free', messagesSent = 0 } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'Erro de configuração do servidor.' });

  // 1. Validação de Limite
  if (messagesSent >= PLAN_LIMITS[plan]) {
    return res.status(403).json({ 
      error: "Limite do plano atingido. Faça upgrade para o ZapSeller Pro para continuar vendendo 24h." 
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  let modelName = plan === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  if (audioData) modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';

  // 2. Lógica de Prompt Base por Plano
  let systemInstruction = "";
  if (plan === 'free') {
    systemInstruction = `Você é um atendente educado para o produto ${product.name}. Responda de forma clara e objetiva. Não use técnicas agressivas de venda.`;
  } else if (plan === 'starter') {
    systemInstruction = `Você é um vendedor experiente no WhatsApp para o produto ${product.name}. Seu objetivo é conduzir o cliente até a compra no modelo CoD. Use prova social leve, benefícios e urgência moderada.`;
  } else if (plan === 'pro') {
    systemInstruction = `Você é um vendedor profissional de elite focado em fechamento de alta conversão para o produto ${product.name}. 
    Antes de responder, pense estrategicamente em: quebrar objeções complexas, gerar urgência real e conduzir para o fechamento imediato no CoD. 
    Nunca revele seu raciocínio estratégico. Use emojis e seja extremamente persuasivo.`;
  }

  if (customPrompt && plan !== 'free') {
    systemInstruction += ` Instruções adicionais do usuário: ${customPrompt}`;
  }

  const contents = history.map((msg: any) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text || "" }]
  }));

  if (audioData && contents.length > 0) {
    const lastPart = contents[contents.length - 1];
    if (lastPart.role === 'user') {
      lastPart.parts.push({ inlineData: { mimeType: audioData.mimeType, data: audioData.data } });
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
    let orderDetails = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) audioOutput = part.inlineData.data;
        if (part.functionCall) {
          orderDetails = part.functionCall.args;
          textOutput = "Pedido registrado com sucesso! Já estamos preparando tudo para você.";
        }
      }
    }

    return res.status(200).json({ text: textOutput, audioData: audioOutput, orderConfirmed: orderDetails });
  } catch (error) {
    return res.status(500).json({ error: 'Falha na IA.' });
  }
}
