import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

// Configurações de segurança e limites (Hardcoded no servidor)
const SECURE_PLAN_LIMITS: Record<string, number> = {
  free: 10,
  starter: 100,
  pro: 9999
};

const confirmOrderTool: FunctionDeclaration = {
  name: 'confirmOrder',
  parameters: {
    type: Type.OBJECT,
    description: 'Registra o fechamento de uma venda coletando os dados do cliente.',
    properties: {
      customerName: { type: Type.STRING, description: 'Nome completo do cliente.' },
      details: { type: Type.STRING, description: 'Endereço completo ou requisitos de entrega.' },
    },
    required: ['customerName', 'details']
  }
};

export default async function handler(req: any, res: any) {
  // 1. Bloqueio de métodos não autorizados
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Acesso negado.' });
  }

  const { history, product, customPrompt, audioData, plan = 'free', isVipSupport, messagesSent = 0 } = req.body;

  // 2. Proteção de Chave: Apenas do ambiente seguro
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("[SECURITY ALERT] API_KEY não configurada no servidor!");
    return res.status(500).json({ error: 'Erro de configuração interna.' });
  }

  // 3. Validação de SaaS no Servidor (Preveni falsificação de plano no frontend)
  const actualLimit = SECURE_PLAN_LIMITS[plan] || 10;
  if (messagesSent >= actualLimit) {
    return res.status(403).json({ error: 'Limite de uso atingido para seu plano.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Configurações de inteligência baseadas no plano
    let modelName = 'gemini-3-flash-preview';
    let thinkingBudget = 0;

    if (plan === 'pro') {
      modelName = 'gemini-3-pro-preview';
      thinkingBudget = 16000;
    }

    if (audioData && (plan === 'pro' || isVipSupport)) {
      modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';
      thinkingBudget = 0;
    }

    const systemInstruction = isVipSupport 
      ? "Você é o Gerente VIP de Sucesso. Ajude o usuário estrategicamente."
      : `Você é um vendedor especialista. Produto: ${product.name}. Preço: R$ ${product.price}. 
         Diretriz: ${customPrompt || "Feche a venda com educação."}`;

    const contents = history.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text || "" }]
    }));

    // Injeção segura de dados multimídia
    if (audioData && contents.length > 0) {
      const lastPart = contents[contents.length - 1];
      if (lastPart.role === 'user') {
        lastPart.parts.push({
          inlineData: { mimeType: audioData.mimeType, data: audioData.data }
        });
      }
    }

    const result: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ functionDeclarations: [confirmOrderTool] }],
        ...(thinkingBudget > 0 ? { thinkingConfig: { thinkingBudget } } : {})
      }
    });

    // 4. Sanitização da resposta para o cliente
    let responseText = result.text || "";
    let responseAudio = "";
    let orderData = null;

    if (result.candidates?.[0]?.content?.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) responseAudio = part.inlineData.data;
        if (part.functionCall) orderData = part.functionCall.args;
      }
    }

    return res.status(200).json({
      text: responseText,
      audioData: responseAudio,
      orderConfirmed: orderData
    });

  } catch (err) {
    // 5. Log de erro interno SEM vazar para o usuário final
    console.error("[INTERNAL ERROR]", err);
    return res.status(500).json({ error: 'Não foi possível processar sua mensagem agora.' });
  }
}