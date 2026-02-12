// ============================================================
//  ALSTOM SHOWROOM — app.js (SÉCURISÉ)
//  • Génération initiale → Make.com webhook
//  • Itération Image-to-Image → Proxy backend (clé cachée)
// ============================================================

// ⚠️ REMPLACE cette URL par l'URL de ton backend sur Render
const PROXY_URL = "https://alstom-proxy.onrender.com";

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
    btnApplyIteration.disabled = true;
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
    btnApplyIteration.disabled = false;
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
//  2) ITÉRATION → Proxy Backend (clé API cachée côté serveur)
// ================================================================

async function callGeminiIteration(currentBase64, instruction) {
  var cleanBase64 = currentBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

  var response = await fetch(PROXY_URL + "/api/iterate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: cleanBase64,
      instruction: instruction
    })
  });

  var data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Proxy error " + response.status);
  }

  if (!data.image_base64) {
    throw new Error("Proxy returned no image.");
  }

  return data.image_base64;
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
    setStatus("\u23f3 Iterating via proxy\u2026", "viewer");
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
      btnApplyIteration.disabled = false;
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
  if (!iterationZone.classList.contains("hidden")) {
    btnApplyIteration.disabled = false;
    iterationPrompt.focus();
  }
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
console.log("\u2705 Alstom Showroom | Iterations via secure proxy");
