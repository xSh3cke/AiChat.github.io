const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const cfg = window.YX_CONFIG;

const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const send = document.getElementById("send");

const history = [];
let busy = false;

function add(role, text) {
  document.getElementById("empty")?.remove();
  const d = document.createElement("div");
  d.className = "msg " + role;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  return d;
}

function getKey() {
  let key = localStorage.getItem("yx_api_key");
  if (!key) {
    key = (prompt("Pega tu API key de NVIDIA (se guarda solo en este navegador):") || "").trim();
    if (key) localStorage.setItem("yx_api_key", key);
  }
  return key;
}

async function callApi(messages) {
  const direct = !cfg.API_URL;
  const headers = { "Content-Type": "application/json" };
  let url = cfg.API_URL;

  if (direct) {
    const key = getKey();
    if (!key) throw new Error("Falta la API key.");
    url = NVIDIA_URL;
    headers.Authorization = "Bearer " + key;
  }

  const body = direct
    ? {
        model: cfg.MODEL,
        messages: [{ role: "system", content: cfg.SYSTEM_PROMPT }, ...messages],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 4096,
        stream: true,
      }
    : { messages };

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    if (direct && (res.status === 401 || res.status === 403)) localStorage.removeItem("yx_api_key");
    throw new Error((await res.text()) || res.status);
  }
  return res;
}

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || busy) return;

  busy = true;
  send.disabled = true;
  input.value = "";
  input.style.height = "auto";

  add("user", text);
  history.push({ role: "user", content: text });
  const bot = add("bot dots", "");
  let reply = "";

  try {
    const res = await callApi(history);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) {
            reply += delta;
            bot.classList.remove("dots");
            bot.textContent = reply;
            chat.scrollTop = chat.scrollHeight;
          }
        } catch {}
      }
    }
    history.push({ role: "assistant", content: reply });
  } catch (err) {
    bot.textContent = "Error: " + err.message;
    history.pop();
  } finally {
    bot.classList.remove("dots");
    busy = false;
    send.disabled = false;
    input.focus();
  }
});
