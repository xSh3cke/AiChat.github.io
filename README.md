# Yx Agent

Chat minimalista con IA (NVIDIA API). Sitio estático para GitHub Pages.

## Archivos

- `index.html`, `style.css`, `script.js`: la página
- `config.js`: URL del proxy y modelo
- `worker.js`: proxy opcional para Cloudflare Workers (mantiene la API key secreta)

## Publicar en GitHub Pages

1. Sube estos archivos a un repositorio.
2. En el repo: **Settings → Pages → Deploy from a branch → main / (root)**.
3. Tu chat quedará en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

## API key (importante)

**Nunca pongas la API key en el código ni en el repositorio**, porque cualquiera podría verla y usarla.

### Opción A: Cloudflare Worker (recomendada)

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Hello World.
2. Pega el contenido de `worker.js` y despliega.
3. En Settings → Variables and Secrets añade el secreto `NVIDIA_API_KEY` con tu key.
   Opcional: `ALLOWED_ORIGIN` = `https://TU-USUARIO.github.io`.
4. Copia la URL del Worker y pégala en `API_URL` dentro de `config.js`.

### Opción B: directo desde el navegador

Deja `API_URL` vacío. La página te pedirá la key la primera vez y la guarda solo en tu navegador.
Si NVIDIA bloquea la llamada (CORS), usa la opción A.
