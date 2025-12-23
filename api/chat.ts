import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

// Limites comerciais estritos por plano (validado no server)
const PLAN_LIMITS: Record<string, number> = {
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { 
    history, 
    product, 
    customPrompt, 
    audioData, 
    plan = 'free', 
    isVipSupport, 
    messagesSent = 0 
  } = req.body;

  // A chave é obtida exclusivamente do ambiente do servidor
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Configuração do servidor pendente (API_KEY).' });
  }

  // 1. Verificação de Limite por Plano
  const limit = PLAN_LIMITS[plan] || 10;
  if (messagesSent >= limit) {
    return res.status(403).json({ 
      error: `Limite do plano ${plan.toUpperCase()} atingido (${messagesSent}/${limit}). Faça upgrade para continuar vendendo.` 
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  // 2. Seleção de modelo e estratégia
  let modelName = 'gemini-3-flash-preview'; 
  let thinkingBudget = 0;

  if (plan === 'pro') {
    modelName = 'gemini-3-pro-preview';
    thinkingBudget = 16000; // Alta capacidade de raciocínio para fechamentos complexos
  }
  
  if (audioData) {
    modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';
    thinkingBudget = 0;
  }

  // 3. Prompt de Personalidade por Plano
  let baseInstruction = "";
  if (plan === 'free') {
    baseInstruction = "Você é um atendente informativo básico. Responda educadamente sem forçar a venda.";
  } else if (plan === 'starter') {
    baseInstruction = "Você é um vendedor experiente. Use gatilhos de urgência e foque nos benefícios do produto para fechar a venda.";
  } else {
    baseInstruction = "Você é um mestre em fechamento de vendas (Closer Elite). Use psicologia de vendas, quebra de objeções agressiva e amigável, e conduza ao fechamento imediato.";
  }

  const systemInstruction = isVipSupport 
    ? "Você é o Gerente VIP do ZapSeller AI. Ajude o usuário estrategicamente a escalar sua operação."
    : `${baseInstruction}
       PRODUTO: ${product.name}
       PREÇO: R$ ${product.price}
       ESTRATÉGIA: ${product.salesStrategy === 'physical_cod' ? 'PAGAMENTO NA ENTREGA (CoD)' : 'VENDA DIRETA'}
       DIRETRIZ CUSTOMIZADA: ${customPrompt || "Nenhuma"}
       REGRAS: 
       - Tom de voz de WhatsApp (curto, direto, emojis).
       - Use 'confirmOrder' quando o cliente decidir comprar.`;

  const contents = history.map((msg: any) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text || "" }]
  }));

  if (audioData && contents.length > 0) {
    const lastUserTurn = [...contents].reverse().find(c => c.role === 'user');
    if (lastUserTurn) {
      lastUserTurn.parts.push({
        inlineData: { mimeType: audioData.mimeType, data: audioData.data }
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
        ...(thinkingBudget > 0 && !audioData ? { thinkingConfig: { thinkingBudget } } : {})
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
          textOutput = "Excelente! Acabei de registrar seu pedido aqui. Estamos processando tudo agora! 🚀";
        }
      }
    }

    return res.status(200).json({
      text: textOutput,
      audioData: audioOutput,
      orderConfirmed: orderDetails
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "Erro ao processar com a IA." });
  }
}