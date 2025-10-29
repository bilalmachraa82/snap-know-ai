import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error("Image data is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    console.log("Analyzing food image with Lovable AI...");

    // Call Lovable AI Gateway with vision capabilities
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um nutricionista expert em análise de alimentos. 
Analise a imagem da refeição e retorne APENAS um objeto JSON válido (sem markdown, sem \`\`\`json) com esta estrutura exata:
{
  "food_name": "nome do prato principal",
  "calories": número inteiro de calorias estimadas,
  "protein": gramas de proteína (decimal),
  "carbs": gramas de carboidratos (decimal),
  "fats": gramas de gordura (decimal),
  "portion_size": "descrição da porção (ex: 350g, 1 prato médio)",
  "meal_type": "breakfast, lunch, dinner ou snack",
  "confidence": "high, medium ou low"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise esta refeição e forneça os valores nutricionais estimados."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit excedido. Por favor, tenta novamente em alguns segundos.");
      }
      if (response.status === 402) {
        throw new Error("Créditos de AI esgotados. Por favor, adiciona créditos ao workspace.");
      }
      
      throw new Error("Erro ao processar imagem com AI");
    }

    const aiData = await response.json();
    console.log("AI Response:", JSON.stringify(aiData, null, 2));

    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta inválida da AI");
    }

    // Parse JSON response (remove markdown code blocks if present)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/```\n?/g, "");
    }

    const analysisResult = JSON.parse(cleanContent);

    // Validate required fields
    if (!analysisResult.food_name || !analysisResult.calories) {
      throw new Error("Análise incompleta da AI");
    }

    console.log("Analysis successful:", analysisResult.food_name);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          food_name: analysisResult.food_name,
          calories: parseInt(analysisResult.calories),
          protein: parseFloat(analysisResult.protein || 0),
          carbs: parseFloat(analysisResult.carbs || 0),
          fats: parseFloat(analysisResult.fats || 0),
          portion_size: analysisResult.portion_size || "Porção média",
          meal_type: analysisResult.meal_type || "snack",
          confidence: analysisResult.confidence || "medium",
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in analyze-food function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido ao analisar imagem"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
