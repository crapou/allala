// ============================================================
//  ALSTOM SHOWROOM — app.js (COMPLET)
//  • Génération initiale → Make.com webhook
//  • Itération (Image-to-Image) → API Gemini directe
// ============================================================

// ================== CONFIGURATION ==================

// 🔑 Clé API Gemini (tu la changeras plus tard)
const GEMINI_API_KEY = "AIzaSyAVDwhJP15uz_haf46aJ3NkL2EVdvr_pro";

// ✅ Modèle Gemini qui supporte la génération d'image native
// gemini-2.0-flash-exp supporte responseModalities: ["IMAGE"]
const GEMINI_MODEL = "gemini-2.0-flash-exp";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// 🔗 Ton webhook Make.com pour la PREMIÈRE génération
// ⚠️ Remplace cette URL par ton vrai webhook Make
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/cyfu356g7x4ahx89k5n4w2nq6hjp8is5";

// ================== UI ELEMENTS ==================

const home            = document.getElementById("home");
const viewer          = document.getElementById("viewer");
const idea            = document.getElementById("idea");
const btnGenerate     = document.getElementById("btnGenerate");
const statusHome      = document.getElementById("statusHome");
const statusViewer    = document.getElementById("statusViewer");
const skeleton        = document.getElementById("skeleton");
const imgBlur         = document.getElementById("imgBlur");
const imgFinal        = document.getElementById("imgFinal");
const logoOverlay     = document.getElementById("logoOverlay");
const canvas          = document.getElementById("canvas");
const btnDownload     = document.getElementById("btnDownload");
const btnDownloadTop  = document.getElementById("btnDownloadTop");
const btnIterate      = document.getElementById("btnIterate");
const iterationZone   = document.getElementById("iterationZone");
const iterationPrompt = document.getElementById("iterationPrompt");
const btnApplyIteration = document.getElementById("btnApplyIteration");
const errorBox        = document.getElementById("errorBox");

// ================== STATE ==================

let currentRawBase64   = null;   // base64 brut (sans prefix data:...)
let currentFullDataUrl = null;   // data:image/png;base64,...
let originalPrompt     = "";     // le prompt initial (pour contexte)
let sessionId          = generateSessionId();

// ================== HELPERS ==================

function generateSessionId() {
  return "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function setStatus(msg, target = "both") {
  if (target === "home" || target === "both") statusHome.textContent = msg;
  if (target === "viewer" || target === "both") statusViewer.textContent = msg;
}

function showError(msg) {
  errorBox.textContent = "❌ " + msg;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function showHome() {
  home.classList.remove("hidden");
  viewer.classList.add("hidden");
}

function showViewer() {
  home.classList.add("hidden");
  viewer.classList.remove("hidden");
}

function setLoading(isLoading) {
  btnGenerate.disabled = isLoading;
  btnApplyIteration.disabled = isLoading;

  if (isLoading) {
    skeleton.classList.remove("hidden");
    imgFinal.classList.add("hidden");
    imgFinal.classList.remove("reveal");
    imgBlur.classList.add("hidden");
    logoOverlay.classList.add("hidden");
    btnDownload.classList.add("hidden");
    btnDownloadTop.disabled = true;
    btnIterate.classList.add("hidden");
    iterationZone.classList.add("hidden");
  }
}

function showFinalImage(base64Data) {
  currentRawBase64 = base64Data;
  currentFullDataUrl = `data:image/png;base64,${base64Data}`;

  // Afficher le blur en premier (effet visuel)
  imgBlur.src = currentFullDataUrl;
  imgBlur.classList.remove("hidden");

  // Puis l'image finale
  imgFinal.src = currentFullDataUrl;
  imgFinal.onload = () => {
    skeleton.classList.add("hidden");
    imgBlur.classList.add("hidden");
    imgFinal.classList.remove("hidden");

    // Petit délai pour l'animation reveal
    requestAnimationFrame(() => {
      imgFinal.classList.add("reveal");
    });

    // Afficher les boutons
    logoOverlay.classList.remove("hidden");
    btnDownload.classList.remove("hidden");
    btnDownloadTop.disabled = false;
    btnIterate.classList.remove("hidden");

    setStatus("Image ready.", "viewer");
  };
}

// ================== DOWNLOAD (avec logo overlay) ==================

function downloadImage() {
  if (!currentFullDataUrl) return;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = currentFullDataUrl;

  img.onload = () => {
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");

    // Dessiner l'image
    ctx.drawImage(img, 0, 0);

    // Dessiner le logo overlay en bas à droite
    const logo = document.getElementById("logo");
    if (logo && logo.naturalWidth > 0) {
      const logoW = Math.round(img.naturalWidth * 0.12);
      const logoH = Math.round(logoW * (logo.naturalHeight / logo.naturalWidth));
      const margin = Math.round(img.naturalWidth * 0.02);
      ctx.drawImage(
        logo,
        img.naturalWidth - logoW - margin,
        img.naturalHeight - logoH - margin,
        logoW,
        logoH
      );
    }

    // Télécharger
    const link = document.createElement("a");
    link.download = `alstom-concept-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
}

// ================================================================
//  1) GÉNÉRATION INITIALE → Make.com Webhook
// ================================================================

async function callMakeWebhook(promptText) {
  const payload = {
    idea: promptText,
    mode: "new",
    session_id: sessionId,
  };

  const response = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Make webhook error (${response.status}): ${errText}`);
  }

  const data = await response.json();

  if (data.status !== "ok" || !data.image_base64) {
    throw new Error("Make webhook returned no image. Check your scenario.");
  }

  return data.image_base64;
}

// ================================================================
//  2) ITÉRATION IMAGE-TO-IMAGE → API Gemini directe (PAS de Make)
// ================================================================

async function callGeminiIteration(currentBase64, instruction) {
  // Nettoyer le base64 (enlever le prefix si présent)
  const cleanBase64 = currentBase64.replace(
    /^data:image\/(png|jpeg|webp);base64,/,
    ""
  );

  const payload = {
    contents: [
      {
        parts: [
          {
            text: [
              "You are modifying an existing image for Alstom (railway manufacturer).",
              "",
              "INSTRUCTION: " + instruction,
              "",
              "RULES:",
              "- Keep the EXACT same composition, structure, and perspective",
              "- Only apply the requested modification",
              "- Maintain photorealistic, professional, cinematic quality",
              "- Do NOT recreate the image from scratch — EDIT the existing one",
            ].join("\n"),
          },
          {
            inline_data: {
              mime_type: "image/png",
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API Error:", data);
    const msg = data.error?.message || "Gemini error (" + response.status + ")";
    throw new Error(msg);
  }

  // Chercher la partie image dans la réponse
  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inline_data && part.inline_data.data) {
        return part.inline_data.data; // base64 brut
      }
    }
  }

  // Pas d'image trouvée — récupérer le texte pour debug
  const textParts = candidates
    .flatMap((c) => c.content?.parts || [])
    .filter((p) => p.text)
    .map((p) => p.text)
    .join(" ");

  throw new Error(
    textParts
      ? 'Gemini did not return an image. Response: "' + textParts.slice(0, 200) + '"'
      : "Gemini returned no image. The model may have refused due to safety filters."
  );
}

// ================================================================
//  MAIN FLOWS
// ================================================================

async function handleGenerate() {
  const prompt = idea.value.trim();
  if (!prompt) return;

  originalPrompt = prompt;
  sessionId = generateSessionId();

  try {
    clearError();
    showViewer();
    setLoading(true);
    setStatus("⏳ Generating via Make.com…", "viewer");

    const base64 = await callMakeWebhook(prompt);
    showFinalImage(base64);
  } catch (err) {
    console.error("Generation error:", err);
    showError(err.message);
    setStatus("Error.", "viewer");
    skeleton.classList.add("hidden");
  }
}

async function handleIteration() {
  const instruction = iterationPrompt.value.trim();
  if (!instruction) return;
  if (!currentRawBase64) {
    showError("No base image available for iteration.");
    return;
  }

  try {
    clearError();
    setLoading(true);
    setStatus("⏳ Iterating via Gemini API (Image-to-Image)…", "viewer");

    const newBase64 = await callGeminiIteration(currentRawBase64, instruction);
    showFinalImage(newBase64);

    // Reset iteration input
    iterationPrompt.value = "";
  } catch (err) {
    console.error("Iteration error:", err);
    showError(err.message);
    setStatus("Iteration failed.", "viewer");
    skeleton.classList.add("hidden");
    // Ré-afficher l'image précédente si disponible
    if (currentFullDataUrl) {
      imgFinal.classList.remove("hidden");
      imgFinal.classList.add("reveal");
      btnDownload.classList.remove("hidden");
      btnIterate.classList.remove("hidden");
      logoOverlay.classList.remove("hidden");
    }
  }
}

// ================================================================
//  EVENT LISTENERS
// ================================================================

// Bouton "Generate" (page d'accueil)
btnGenerate.addEventListener("click", handleGenerate);

// Entrée dans le champ idea (sauf Shift+Enter pour retour à la ligne)
idea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleGenerate();
  }
});

// Bouton "✨ Modify Image" → affiche/masque la zone d'itération
btnIterate.addEventListener("click", () => {
  iterationZone.classList.toggle("hidden");
  if (!iterationZone.classList.contains("hidden")) {
    iterationPrompt.focus();
  }
});

// Bouton "Apply" (itération)
btnApplyIteration.addEventListener("click", handleIteration);

// Entrée dans le champ d'itération
iterationPrompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleIteration();
  }
});

// Boutons Download
btnDownload.addEventListener("click", downloadImage);
btnDownloadTop.addEventListener("click", downloadImage);

// Auto-resize des textareas
[idea, iterationPrompt].forEach((textarea) => {
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });
});

// ================================================================
//  INIT
// ================================================================
setStatus("Ready.", "home");
console.log("✅ Alstom Showroom — app.js loaded");