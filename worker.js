// Proxy para Yx Agent (Cloudflare Workers, plan gratis).
// Guarda tu API key como secreto: NVIDIA_API_KEY
// Variables opcionales: MODEL, ALLOWED_ORIGIN (ej. https://tu-usuario.github.io)

const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const SYSTEM = "Eres Yx Agent, un asistente útil y conciso. Responde en el idioma del usuario.";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("Not found", { status: 404, headers: cors });

    let messages;
    try {
      messages = (await request.json()).messages;
      if (!Array.isArray(messages)) throw new Error();
    } catch {
      return new Response("Bad request", { status: 400, headers: cors });
    }

    const upstream = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: env.MODEL || "deepseek-ai/deepseek-v4.1-flash",
        messages: [{ role: "system", content: SYSTEM }, ...messages.slice(-30)],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 4096,
        stream: true,
      }),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": upstream.headers.get("Content-Type") || "text/event-stream" },
    });
  },
};
