// ========= GENAI MODE (Make Webhook) =========
const MAKE_WEBHOOK_URL =
  "https://hook.eu2.make.com/cyfu356g7x4ahx89k5n4w2nq6hjp8is5";

// ================== API CONFIG ==================
const GEMINI_API_KEY = "TA_CLE_API_ICI"; // 🔑 AIzaSyAg9OpJHyiqXtL9uNWXv60qkiDjysPsqvk
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

// ================== UI ==================
const home = document.getElementById("home");
const viewer = document.getElementById("viewer");
const idea = document.getElementById("idea");

const btnGenerate = document.getElementById("btnGenerate");
const btnDownload = document.getElementById("btnDownload");
const btnDownloadTop = document.getElementById("btnDownloadTop");
const btnIterate = document.getElementById("btnIterate");
const btnApplyIteration = document.getElementById("btnApplyIteration");

const statusHome = document.getElementById("statusHome");
const statusViewer = document.getElementById("statusViewer");
const errorBox = document.getElementById("errorBox");

const skeleton = document.getElementById("skeleton");
const imgBlur = document.getElementById("imgBlur");
const imgFinal = document.getElementById("imgFinal");
const logoOverlay = document.getElementById("logoOverlay");

const iterationZone = document.getElementById("iterationZone");
const iterationPrompt = document.getElementById("iterationPrompt");

// Canvas (optionnel – branding plus tard)
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const logoImg = document.getElementById("logo");

// ================== STATE ==================
let lastDataUrl = null;
let originalPrompt = null;

// ================== UTILS ==================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function setHomeStatus(t = "") {
  statusHome.textContent = t;
}
function setViewerStatus(t = "") {
  statusViewer.textContent = t;
}
function showError(t) {
  errorBox.textContent = t;
  errorBox.classList.remove("hidden");
}
function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}
function toViewer() {
  home.classList.add("hidden");
  viewer.classList.remove("hidden");
}

// ================== UI FLOW ==================
function setLoading(v) {
  if (v) {
    skeleton.classList.remove("hidden");
    btnDownload.classList.add("hidden");
    btnDownloadTop.disabled = true;
    imgFinal.classList.remove("reveal");
    if (logoOverlay) logoOverlay.classList.add("hidden");
  } else {
    skeleton.classList.add("hidden");
  }
}

function hideImages() {
  imgBlur.classList.add("hidden");
  imgFinal.classList.add("hidden");
  imgFinal.classList.remove("reveal");
  if (logoOverlay) logoOverlay.classList.add("hidden");
}

function showBlur(src) {
  imgBlur.src = src;
  imgBlur.classList.remove("hidden");
}

function showFinal(src) {
  imgFinal.src = src;
  imgFinal.classList.remove("hidden");

  imgFinal.onload = () => {
    imgBlur.classList.add("hidden");
    requestAnimationFrame(() => {
      imgFinal.classList.add("reveal");
      if (logoOverlay) logoOverlay.classList.remove("hidden");
    });
  };
}

function setBlurLevel(level) {
  imgBlur.style.filter =
    level === "strong"
      ? "blur(32px) saturate(1.15)"
      : "blur(14px) saturate(1.1)";
}

// ================== DOWNLOAD (FIX FINAL) ==================
function dataUrlToBlob(dataUrl) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function forceDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadPNG() {
  try {
    clearError();

    if (!lastDataUrl) {
      throw new Error("No image generated yet.");
    }

    setViewerStatus("Downloading…");

    // 🔥 téléchargement DIRECT de l'image générée (ultra fiable)
    const blob = dataUrlToBlob(lastDataUrl);
    forceDownload(blob, `alstom-showroom-${Date.now()}.png`);

    setViewerStatus("Done.");
  } catch (e) {
    setViewerStatus("Download failed.");
    showError(e.message || String(e));
  }
}

btnDownload.addEventListener("click", downloadPNG);
btnDownloadTop.addEventListener("click", downloadPNG);

// ================== MAKE ==================
async function callMake(ideaText) {
  const res = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea: ideaText }),
  });

  if (!res.ok) throw new Error(`Make error ${res.status}`);
  return res.json();
}

// ================== MAIN GENERATION ==================
btnGenerate.addEventListener("click", async () => {
  clearError();
  toViewer();

  setLoading(true);
  setViewerStatus("Generating…");
  btnGenerate.disabled = true;
  hideImages();

  try {
    const ideaText = idea.value.trim();
    if (!ideaText) throw new Error("Please enter an idea.");

    // Sauvegarder le prompt original
    originalPrompt = ideaText;

    const result = await callMake(ideaText);
    if (result.status !== "ok") throw new Error("Generation failed.");

    const dataUrl = `data:${result.mime_type};base64,${result.image_base64}`;
    lastDataUrl = dataUrl;

    setBlurLevel("strong");
    showBlur(dataUrl);
    await sleep(2500);

    setBlurLevel("medium");
    await sleep(1200);

    showFinal(dataUrl);

    setLoading(false);
    setViewerStatus("Done.");
    btnDownload.classList.remove("hidden");
    btnDownloadTop.disabled = false;
    
    // ✅ NOUVEAU : Afficher le bouton "Modify Image"
    btnIterate.classList.remove("hidden");
    
  } catch (e) {
    setLoading(false);
    setViewerStatus("Generation failed.");
    showError(e.message || String(e));
  } finally {
    btnGenerate.disabled = false;
  }
});

// ================== ITERATION LOGIC ==================
// ✅ Afficher/masquer la zone d'itération
btnIterate.addEventListener("click", () => {
  if (iterationZone.classList.contains("hidden")) {
    iterationZone.classList.remove("hidden");
    iterationPrompt.focus();
  } else {
    iterationZone.classList.add("hidden");
  }
});

// ✅ Appliquer l'itération (on codera ça à l'ÉTAPE 2)
btnApplyIteration.addEventListener("click", async () => {
  alert("On va coder ça ensemble à l'ÉTAPE 2 ! 🚀");
});

// ================== INIT ==================
setHomeStatus("Ready (GenAI mode).");