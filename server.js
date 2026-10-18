import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (_req, res) => {
  res.json({
    app: "AUREN KA",
    version: "2.0.0",
    aiConfigured: Boolean(process.env.AI_API_KEY && process.env.AI_API_URL && process.env.AI_MODEL)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, profile } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return res.status(400).json({ error: "Envía una conversación válida (máximo 20 mensajes)." });
    }
    if (!process.env.AI_API_KEY || !process.env.AI_API_URL || !process.env.AI_MODEL) {
      return res.status(503).json({
        error: "La IA aún no está configurada. El servidor necesita AI_API_URL, AI_API_KEY y AI_MODEL."
      });
    }

    const safeMessages = messages
      .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

    const creatorContext = profile?.creatorVerified === true
      ? "La persona ha iniciado sesión con el perfil de creador verificado de AUREN. Su alias es Kaze. No reveles credenciales ni secretos."
      : "No des por hecho que la persona es Kaze ni que es la creadora/el creador. Trata el perfil como invitado.";

    const response = await fetch(process.env.AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages: [
          {
            role: "system",
            content: `Eres AUREN, un asistente personal útil, honesto y amable. Responde en el idioma del usuario. No afirmes tener acceso a internet o al dispositivo si no lo tienes. ${creatorContext}`
          },
          ...safeMessages
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({ error: "El proveedor de IA ha devuelto un error. Revisa la configuración del servidor." });
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(502).json({ error: "La IA no devolvió una respuesta válida." });
    }
    res.json({ answer });
  } catch {
    res.status(500).json({ error: "No se pudo conectar con el servicio de IA. Inténtalo de nuevo." });
  }
});

app.listen(PORT, () => {
  console.log(`AUREN KA v2 escuchando en el puerto ${PORT}`);
});
