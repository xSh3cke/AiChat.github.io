// Configuración de Yx Agent
//
// OPCIÓN A (recomendada): usa un proxy (worker.js en Cloudflare Workers).
//   Pega aquí la URL de tu Worker. La API key queda guardada como secreto
//   en Cloudflare y nunca llega al navegador ni al repositorio.
//   Ejemplo: "https://yx-agent.tu-usuario.workers.dev"
//
// OPCIÓN B: deja API_URL vacío. La página llamará directo a NVIDIA y te
//   pedirá tu API key una vez (se guarda solo en tu navegador).
//   Ojo: NVIDIA puede bloquear llamadas directas desde el navegador (CORS).

window.YX_CONFIG = {
  API_URL: "",
  MODEL: "deepseek-ai/deepseek-v4.1-flash",
  SYSTEM_PROMPT: "Eres Yx Agent, un asistente útil y conciso. Responde en el idioma del usuario."
};
