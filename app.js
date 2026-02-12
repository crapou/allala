// ============================================================
//  ALSTOM SHOWROOM — app.js (DEBUG VERSION)
//  • Génération initiale → Make.com webhook
//  • Itération Image-to-Image → Gemini 3 Pro Image (Nano Banana Pro)
// ============================================================

const GEMINI_API_KEY = "AIzaSyAVDwhJP15uz_haf46aJ3NkL2EVdvr_pro";
const GEMINI_MODEL   = "gemini-3-pro-image-preview";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/"
                     + GEMINI_MODEL
                     + ":generateContent?key=" + GEMINI_API_KEY;

const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/cyfu356g7x4ahx89k5n4w2nq6hjp8is5";

// ================== UI ELEMENTS ==================

var home            = document.getElementById("home");
var viewer          = document.getElementById("viewer");
var idea            = document.getElementById("idea");
var btnGenerate     = document.getElementById("btnGenerate");
var statusHome      = document.getElementById("statusHome");
var statusViewer    = document.getElementById("statusViewer");
var skeleton        = document.getElementById("skeleton");
var imgBlur         = document.getElementById("imgBlur");
var imgFinal        = document.getElementById("imgFinal");
var logoOverlay     = document.getElementById("logoOverlay");
var canvas          = document.getElementById("canvas");
var btnDownload     = document.getElementById("btnDownload");
var btnDownloadTop  = document.getElementById("btnDownloadTop");
var btnIterate      = document.getElementById("btnIterate");
var iterationZone   = document.getElementById("iterationZone");
var iterationPrompt = document.getElementById("iterationPrompt");
var btnApplyIteration = document.getElementById("btnApplyIteration");
var errorBox        = document.getElementById("errorBox");

// ================== STATE ==================

var currentRawBase64   = null;
var currentFullDataUrl = null;
var originalPrompt     = "";
var sessionId          = generateSessionId();

// ================== HELPERS ==================

function generateSessionId() {
  return "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function setStatus(msg, target) {
  if (!target) target = "both";
  if (target === "home" || target === "both") statusHome.textContent = msg;
  if (target === "viewer" || target === "both") statusViewer.textContent = msg;
}

function showError(msg) {
  errorBox.textContent = "\u274c " + msg;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
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
  currentFullDataUrl = "data:image/png;base64," + base64Data;

  imgBlur.src = currentFullDataUrl;
  imgBlur.classList.remove("hidden");

  imgFinal.src = currentFullDataUrl;
  imgFinal.onload = function () {
    skeleton.classList.add("hidden");
    imgBlur.classList.add("hidden");
    imgFinal.classList.remove("hidden");
    requestAnimationFrame(function () {
      imgFinal.classList.add("reveal");
    });
    logoOverlay.classList.remove("hidden");
    btnDownload.classList.remove("hidden");
    btnDownloadTop.disabled = false;
    btnIterate.classList.remove("hidden");
    setStatus("Image ready.", "viewer");
  };
}

// ================== DOWNLOAD ==================

function downloadImage() {
  if (!currentFullDataUrl) return;
  var img = new Image();
  img.crossOrigin = "anonymous";
  img.src = currentFullDataUrl;
  img.onload = function () {
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var logo = document.getElementById("logo");
    if (logo && logo.naturalWidth > 0) {
      var logoW  = Math.round(img.naturalWidth * 0.12);
      var logoH  = Math.round(logoW * (logo.naturalHeight / logo.naturalWidth));
      var margin = Math.round(img.naturalWidth * 0.02);
      ctx.drawImage(logo, img.naturalWidth - logoW - margin, img.naturalHeight - logoH - margin, logoW, logoH);
    }
    var link = document.createElement("a");
    link.download = "alstom-concept-" + Date.now() + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
}

// ================================================================
//  1) GÉNÉRATION INITIALE → Make.com Webhook
// ================================================================

async function callMakeWebhook(promptText) {
  var response = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea: promptText, mode: "new", session_id: sessionId }),
  });
  if (!response.ok) {
    var errText = await response.text();
    throw new Error("Make webhook error (" + response.status + "): " + errText);
  }
  var data = await response.json();
  if (data.status !== "ok" || !data.image_base64) {
    throw new Error("Make webhook returned no image. Check your scenario.");
  }
  return data.image_base64;
}

// ================================================================
//  2) ITÉRATION → Gemini 3 Pro Image (Nano Banana Pro)
// ================================================================

async function callGeminiIteration(currentBase64, instruction) {
  var cleanBase64 = currentBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

  // ── LOG taille du base64 envoyé ──
  console.log("BASE64 length being sent:", cleanBase64.length, "chars (~" + Math.round(cleanBase64.length * 0.75 / 1024 / 1024 * 100) / 100 + " MB)");

  var payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inline_data: {
              mime_type: "image/png",
              data: cleanBase64
            }
          },
          {
            text: "Edit this image. Apply ONLY the following modification: " + instruction + ". Keep everything else exactly the same."
          }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        imageSize: "2K"
      }
    }
  };

  console.log("Calling Gemini:", GEMINI_MODEL);

  var response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  // ── Lire la réponse brute comme TEXTE d'abord ──
  var rawText = await response.text();
  
  // ══════════════════════════════════════════════
  //  DEBUG : Afficher les 3000 premiers caractères
  //  de la réponse brute dans une ALERTE
  //  → COPIE-COLLE ÇA ET ENVOIE-LE MOI
  // ══════════════════════════════════════════════
  var debugSnippet = rawText.slice(0, 3000);
  console.log("GEMINI RAW RESPONSE:", debugSnippet);
  alert("GEMINI RAW RESPONSE (copie ce texte):\n\n" + debugSnippet);

  // Parser le JSON
  var data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error("Gemini returned invalid JSON. Raw: " + rawText.slice(0, 500));
  }

  if (!response.ok) {
    throw new Error((data.error && data.error.message) || ("Gemini error " + response.status));
  }

  // ── Chercher l'image ──
  var candidates = data.candidates || [];
  for (var c = 0; c < candidates.length; c++) {
    var parts = (candidates[c].content && candidates[c].content.parts) || [];
    for (var p = 0; p < parts.length; p++) {
      if (parts[p].inline_data && parts[p].inline_data.data) {
        return parts[p].inline_data.data;
      }
      if (parts[p].inlineData && parts[p].inlineData.data) {
        return parts[p].inlineData.data;
      }
    }
  }

  // ── Pas d'image ──
  var debugText = "";
  var finishReason = "";
  var blockReason = "";
  
  if (data.promptFeedback && data.promptFeedback.blockReason) {
    blockReason = data.promptFeedback.blockReason;
  }
  
  for (var c2 = 0; c2 < candidates.length; c2++) {
    if (candidates[c2].finishReason) finishReason = candidates[c2].finishReason;
    var parts2 = (candidates[c2].content && candidates[c2].content.parts) || [];
    for (var p2 = 0; p2 < parts2.length; p2++) {
      if (parts2[p2].text) debugText += parts2[p2].text + " ";
    }
  }

  if (blockReason) {
    throw new Error("Blocked by safety: " + blockReason);
  }
  
  if (debugText) {
    throw new Error("Gemini text only (no image): " + debugText.slice(0, 300) + " [finishReason=" + finishReason + "]");
  }

  throw new Error("Gemini returned no image. Safety filters may have blocked the request. [finishReason=" + finishReason + "]");
}

// ================================================================
//  MAIN FLOWS
// ================================================================

async function handleGenerate() {
  var prompt = idea.value.trim();
  if (!prompt) return;
  originalPrompt = prompt;
  sessionId = generateSessionId();

  try {
    clearError();
    home.classList.add("hidden");
    viewer.classList.remove("hidden");
    setLoading(true);
    setStatus("\u23f3 Generating via Make.com\u2026", "viewer");
    var base64 = await callMakeWebhook(prompt);
    showFinalImage(base64);
  } catch (err) {
    console.error("Generation error:", err);
    showError(err.message);
    setStatus("Error.", "viewer");
    skeleton.classList.add("hidden");
  }
}

async function handleIteration() {
  var instruction = iterationPrompt.value.trim();
  if (!instruction) return;
  if (!currentRawBase64) {
    showError("No base image available for iteration.");
    return;
  }

  try {
    clearError();
    setLoading(true);
    setStatus("\u23f3 Iterating via " + GEMINI_MODEL + "\u2026", "viewer");
    var newBase64 = await callGeminiIteration(currentRawBase64, instruction);
    showFinalImage(newBase64);
    iterationPrompt.value = "";
  } catch (err) {
    console.error("Iteration error:", err);
    showError(err.message);
    setStatus("Iteration failed.", "viewer");
    skeleton.classList.add("hidden");
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

btnGenerate.addEventListener("click", handleGenerate);

idea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
});

btnIterate.addEventListener("click", function () {
  iterationZone.classList.toggle("hidden");
  if (!iterationZone.classList.contains("hidden")) iterationPrompt.focus();
});

btnApplyIteration.addEventListener("click", handleIteration);

iterationPrompt.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleIteration(); }
});

btnDownload.addEventListener("click", downloadImage);
btnDownloadTop.addEventListener("click", downloadImage);

[idea, iterationPrompt].forEach(function (ta) {
  ta.addEventListener("input", function () {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  });
});

// ================================================================
setStatus("Ready.", "home");
console.log("\u2705 Alstom Showroom | Iteration model: " + GEMINI_MODEL);