// ================== CONFIGURATION GEMINI 3 ==================
// Utilisation de Nano Banana Pro via l'endpoint Gemini 3 Pro Image
const GEMINI_API_KEY = "AIzaSyAsZ825g314qrs7uM7SOqDPOcmEH9njbgM"; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`;

// ================== UI ELEMENTS ==================
const homeSection = document.getElementById("home");
const viewerSection = document.getElementById("viewer");
const ideaInput = document.getElementById("idea");
const iterationPromptInput = document.getElementById("iterationPrompt");
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

// ================== STATE ==================
let currentRawBase64 = null; 
let currentFullDataUrl = null;

// ================== CORE API CALL (NANO BANANA PRO) ==================

async function callNanoBanana(prompt, base64Context = null) {
  const parts = [{ text: prompt }];
  
  // Si on a une image (itération), on l'ajoute au payload pour le Image-to-Image
  if (base64Context) {
    parts.push({
      inline_data: {
        mime_type: "image/png",
        data: base64Context.replace(/^data:image\/(png|jpeg);base64,/, "")
      }
    });
  }

  const payload = {
    contents: [{ parts: parts }],
    generationConfig: {
      // Configuration spécifique à la génération d'image Gemini 3
      "image_generation_config": {
        "number_of_images": 1,
        "aspect_ratio": "16:9",
        "add_watermark": false
      }
    }
  };

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini 3 Error:", data);
    throw new Error(data.error?.message || "Erreur Nano Banana Pro");
  }

  // On extrait l'image générée du flux de réponse
  const imagePart = data.candidates[0].content.parts.find(p => p.inline_data);
  if (!imagePart) throw new Error("Aucune image n'a été retournée par le modèle.");

  return imagePart.inline_data.data;
}

// ================== LOGIC ==================

async function runProcess(userInput, isIteration = false) {
  try {
    clearError();
    if (!isIteration) {
      homeSection.classList.add("hidden");
      viewerSection.classList.remove("hidden");
    }

    setStatus(isIteration ? "Modification en cours (Nano Banana Pro)..." : "Génération initiale...");
    
    // UI Loading
    skeleton.classList.remove("hidden");
    imgFinal.classList.add("hidden");
    imgFinal.classList.remove("reveal");

    // Appel API Unique (Génération ou Itération)
    const newBase64 = await callNanoBanana(userInput, isIteration ? currentRawBase64 : null);
    
    currentRawBase64 = newBase64;
    currentFullDataUrl = `data:image/png;base64,${newBase64}`;

    // Affichage
    imgFinal.src = currentFullDataUrl;
    imgFinal.onload = () => {
      skeleton.classList.add("hidden");
      imgFinal.classList.remove("hidden");
      setTimeout(() => imgFinal.classList.add("reveal"), 50);
      logoOverlay.classList.remove("hidden");
    };

    setStatus("Terminé.");
    btnDownload.classList.remove("hidden");
    btnDownloadTop.disabled = false;
    btnIterate.classList.remove("hidden");
    iterationZone.classList.add("hidden");

  } catch (err) {
    showError(err.message);
    setStatus("Erreur.");
  }
}

// ================== EVENTS ==================

btnGenerate.addEventListener("click", () => {
  const val = ideaInput.value.trim();
  if (val) runProcess(val, false);
});

btnApplyIteration.addEventListener("click", () => {
  const val = iterationPromptInput.value.trim();
  if (val && currentRawBase64) runProcess(val, true);
});

btnIterate.addEventListener("click", () => iterationZone.classList.toggle("hidden"));

btnDownload.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = currentFullDataUrl;
  a.download = `alstom-nano-banana-${Date.now()}.png`;
  a.click();
});

setStatus("Système Nano Banana Pro prêt.");