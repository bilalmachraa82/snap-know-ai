import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

/**
 * SECURITY: CORS Origin Whitelist
 * Only these origins are allowed to make requests to this edge function
 */
const ALLOWED_ORIGINS = [
  'https://lovable.dev',
  'http://localhost:8080',
  // Allow custom production domain from environment variable
  Deno.env.get("ALLOWED_ORIGIN"),
].filter(Boolean); // Remove undefined values

/**
 * SECURITY: Request Size Limits
 * Base64 encoding increases size by ~33%, so 10MB base64 = ~7.5MB original file
 */
const MAX_BASE64_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Rate Limiting: Current limits (enforced by Lovable AI Gateway)
 * - Free tier: 20 requests/minute
 * - Pro tier: 100 requests/minute
 */

/**
 * Validates and returns CORS headers for the given origin
 * SECURITY: Implements origin whitelist to prevent unauthorized domains
 */
function getCorsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

/**
 * Generates a unique request ID for tracking and debugging
 */
function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * SECURITY: Validates base64 image data
 * Checks format, size, and ensures it's actually an image
 */
function validateImageBase64(imageBase64: string): { valid: boolean; error?: string } {
  // Check if it's a string
  if (typeof imageBase64 !== 'string') {
    return { valid: false, error: 'Image data must be a string' };
  }

  // Check size (10MB limit for base64)
  if (imageBase64.length > MAX_BASE64_SIZE) {
    return { valid: false, error: 'Image size exceeds maximum allowed (10MB base64)' };
  }

  // Validate data URI format for images
  const dataUriPattern = /^data:image\/(jpeg|jpg|png|gif|webp|bmp);base64,/i;
  if (!dataUriPattern.test(imageBase64)) {
    return { valid: false, error: 'Invalid image format. Must be a data URI with supported image type' };
  }

  // Extract and validate base64 content
  const base64Content = imageBase64.split(',')[1];
  if (!base64Content) {
    return { valid: false, error: 'Invalid base64 data' };
  }

  // Validate base64 format (allows A-Z, a-z, 0-9, +, /, =)
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Pattern.test(base64Content)) {
    return { valid: false, error: 'Invalid base64 encoding' };
  }

  return { valid: true };
}

serve(async (req) => {
  const requestId = generateRequestId();
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  console.log(`[${requestId}] Incoming request from origin: ${origin || 'unknown'}`);

  // SECURITY: Validate origin for non-OPTIONS requests
  if (req.method !== 'OPTIONS' && origin && !ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`[${requestId}] Rejected request from unauthorized origin: ${origin}`);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Origin not allowed',
        requestId
      }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    // SECURITY: Validate required field
    if (!imageBase64) {
      console.warn(`[${requestId}] Missing image data`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Image data is required',
          requestId
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // SECURITY: Validate image format, size, and encoding
    const validation = validateImageBase64(imageBase64);
    if (!validation.valid) {
      console.warn(`[${requestId}] Image validation failed: ${validation.error}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.error,
          requestId
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error(`[${requestId}] LOVABLE_API_KEY is not configured`);
      // SECURITY: Don't leak internal configuration details to client
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Service configuration error',
          requestId
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`[${requestId}] Analyzing food image with Lovable AI...`);

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
      // SECURITY: Log detailed error server-side only
      console.error(`[${requestId}] AI Gateway error:`, response.status, errorText);

      // Extract rate limit headers if present
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      const rateLimitReset = response.headers.get('x-ratelimit-reset');

      if (response.status === 429) {
        console.warn(`[${requestId}] Rate limit exceeded. Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset}`);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Rate limit excedido. Por favor, tenta novamente em alguns segundos.',
            requestId
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              ...(rateLimitReset && { 'Retry-After': rateLimitReset })
            }
          }
        );
      }
      if (response.status === 402) {
        console.error(`[${requestId}] AI credits exhausted`);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Créditos de AI esgotados. Por favor, adiciona créditos ao workspace.',
            requestId
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // SECURITY: Generic error message to client, detailed log server-side
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro ao processar imagem com AI',
          requestId
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const aiData = await response.json();
    console.log(`[${requestId}] AI Response:`, JSON.stringify(aiData, null, 2));

    // Extract rate limit headers from AI Gateway response
    const rateLimitLimit = response.headers.get('x-ratelimit-limit');
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');

    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      console.error(`[${requestId}] Invalid AI response: no content in response`);
      // SECURITY: Generic error to client
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Resposta inválida da AI',
          requestId
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse JSON response (remove markdown code blocks if present)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/```\n?/g, "");
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse AI response:`, parseError);
      // SECURITY: Generic error to client
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro ao processar resposta da AI',
          requestId
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Validate required fields
    if (!analysisResult.food_name || !analysisResult.calories) {
      console.error(`[${requestId}] Incomplete AI analysis:`, analysisResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Análise incompleta da AI',
          requestId
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`[${requestId}] Analysis successful:`, analysisResult.food_name);

    // Prepare response headers with rate limiting information
    const responseHeaders: HeadersInit = {
      ...corsHeaders,
      "Content-Type": "application/json",
    };

    // Add rate limiting headers to inform client of their quota status
    if (rateLimitLimit) responseHeaders['X-RateLimit-Limit'] = rateLimitLimit;
    if (rateLimitRemaining) responseHeaders['X-RateLimit-Remaining'] = rateLimitRemaining;
    if (rateLimitReset) responseHeaders['X-RateLimit-Reset'] = rateLimitReset;

    return new Response(
      JSON.stringify({
        success: true,
        requestId,
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
        headers: responseHeaders,
      }
    );

  } catch (error) {
    // SECURITY: Log detailed error server-side, return generic error to client
    console.error(`[${requestId}] Error in analyze-food function:`, error);

    // Check if error is related to invalid JSON parsing from request
    const isClientError = error instanceof SyntaxError;

    return new Response(
      JSON.stringify({
        success: false,
        error: isClientError
          ? "Dados de requisição inválidos"
          : "Erro ao analisar imagem",
        requestId
      }),
      {
        status: isClientError ? 400 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
