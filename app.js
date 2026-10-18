const $ = (id) => document.getElementById(id);
const messagesEl = $("messages");
let conversation = [];
let lastAnswer = "";
let profile = { name: "Invitado", creatorVerified: false };

function addBubble(role, content) {
  const div = document.createElement("div");
  div.className = `bubble ${role}`;
  const b = document.createElement("b");
  b.textContent = role === "user" ? (profile.name || "TÚ").toUpperCase() : "AUREN";
  const p = document.createElement("p");
  p.textContent = content;
  div.append(b, p);
  messagesEl.append(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

async function checkStatus() {
  const label = $("status").querySelector("span");
  try {
    const r = await fetch("/api/status");
    const data = await r.json();
    label.textContent = data.aiConfigured ? "Servidor conectado · IA configurada" : "Web conectada · falta configurar la IA";
  } catch {
    label.textContent = "No se pudo comprobar el servidor";
  }
}
checkStatus();

async function sendMessage(text) {
  const content = text.trim();
  if (!content) return;
  addBubble("user", content);
  conversation.push({ role: "user", content });
  $("prompt").value = "";
  $("sendBtn").disabled = true;
  const pending = addBubble("assistant", "Estoy comprobando la conexión…");
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation.slice(-12), profile })
    });
    const data = await response.json();
    pending.remove();
    if (!response.ok) throw new Error(data.error || "No se pudo obtener respuesta.");
    lastAnswer = data.answer;
    conversation.push({ role: "assistant", content: data.answer });
    addBubble("assistant", data.answer);
  } catch (error) {
    pending.remove();
    const msg = error.message || "Error de conexión.";
    addBubble("assistant", msg);
  } finally {
    $("sendBtn").disabled = false;
    $("prompt").focus();
  }
}
$("chatForm").addEventListener("submit", e => {
  e.preventDefault();
  sendMessage($("prompt").value);
});
$("clearBtn").addEventListener("click", () => {
  conversation = [];
  messagesEl.replaceChildren();
  addBubble("assistant", "Conversación reiniciada. ¿En qué te ayudo?");
  lastAnswer = "";
});
$("profileBtn").addEventListener("click", () => {
  $("displayName").value = profile.name === "Invitado" ? "" : profile.name;
  $("creatorCode").value = "";
  $("profileDialog").showModal();
});
$("profileForm").addEventListener("submit", e => {
  if (e.submitter?.value !== "save") return;
  e.preventDefault();
  const name = $("displayName").value.trim().slice(0,40) || "Invitado";
  // A display name is not authentication. Creator verification remains false until server-side auth is implemented.
  profile = { name, creatorVerified: false };
  $("profileName").textContent = name;
  $("profileInfo").textContent = "Perfil local sin verificación de creador.";
  $("profileDialog").close();
  addBubble("assistant", `Perfil local actualizado: ${name}. La verificación segura del creador todavía debe configurarse en el servidor.`);
});
$("speakBtn").addEventListener("click", () => {
  if (!lastAnswer) return;
  if (!("speechSynthesis" in window)) return addBubble("assistant", "Este navegador no admite lectura en voz alta.");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(lastAnswer);
  utterance.lang = "es-ES";
  speechSynthesis.speak(utterance);
});
$("voiceBtn").addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return addBubble("assistant", "El reconocimiento de voz no está disponible en este navegador. Puedes escribir o usar el dictado del teclado.");
  const recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  recognition.interimResults = false;
  recognition.onresult = e => sendMessage(e.results[0][0].transcript);
  recognition.onerror = () => addBubble("assistant", "No pude reconocer la voz. Comprueba los permisos del micrófono.");
  recognition.start();
});
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
