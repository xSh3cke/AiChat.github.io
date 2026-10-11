// Yx Agent - servidor mínimo (Node 18+, sin dependencias)
// Uso: node server.js  ->  http://localhost:3000

const http = require("http");
const fs = require("fs");
const path = require("path");

// Cargar .env manualmente
try {
  const env = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const API_KEY = process.env.NVIDIA_API_KEY;
const MODEL = process.env.MODEL || "deepseek-ai/deepseek-v4.1-flash";
const PORT = process.env.PORT || 3000;

if (!API_KEY) {
  console.error("Falta NVIDIA_API_KEY en el archivo .env");
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(fs.readFileSync(path.join(__dirname, "index.html")));
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    for await (const chunk of req) body += chunk;

    let messages;
    try {
      messages = JSON.parse(body).messages;
      if (!Array.isArray(messages)) throw new Error();
    } catch {
      res.writeHead(400);
      return res.end("Bad request");
    }

    try {
      const upstream = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "Eres Yx Agent, un asistente útil y conciso. Responde en el idioma del usuario." },
            ...messages,
          ],
          temperature: 1,
          top_p: 0.95,
          max_tokens: 8192,
          stream: true,
        }),
      });

      if (!upstream.ok) {
        const text = await upstream.text();
        res.writeHead(upstream.status, { "Content-Type": "text/plain" });
        return res.end(text);
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      for await (const chunk of upstream.body) res.write(chunk);
      res.end();
    } catch (e) {
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error: " + e.message);
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => console.log(`Yx Agent corriendo en http://localhost:${PORT}`));
