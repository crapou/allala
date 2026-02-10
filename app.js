// ================== CONFIGURATION ==================
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/cyfu356g7x4ahx89k5n4w2nq6hjp8is5";
const GEMINI_API_KEY = "AIzaSyAsZ825g314qrs7uM7SOqDPOcmEH9njbgMI"; // ⚠️ Mets ta clé API ici
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

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

// ================== UTILS ==================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function setStatus(text) {
  if (statusHome) statusHome.textContent = text;
  if (statusViewer) statusViewer.textContent = text;
}

// ================== API CALLS ==================

async function callMake(promptText) {
  const res = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea: promptText }),
  });
  if (!res.ok) throw new Error(`Make error: ${res.status}`);
  return res.json();
}

async function getNewPromptFromGemini(imageBase64, userModification) {
  const systemPrompt = `Analyze this image and the user's request: "${userModification}". Write a single, highly detailed English prompt for an AI image generator to create this modified version. Keep the same style. Response: [Prompt only]`;

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: systemPrompt },
          { inline_data: { mime_type: "image/png", data: imageBase64 } }
        ]
      }]
    })
  });

  if (!response.ok) throw new Error("Gemini API Error");
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// ================== CORE LOGIC ==================

async function runGenerationProcess(promptToUse, isIteration = false) {
  try {
    clearError();
    if (!isIteration) {
      homeSection.classList.add("hidden");
      homeSection.style.display = "none";
      viewerSection.classList.remove("hidden");
    }

    setStatus(isIteration ? "Applying changes..." : "Generating...");
    
    // UI Loading State
    skeleton.classList.remove("hidden");
    imgBlur.classList.add("hidden");
    imgFinal.classList.add("hidden");
    imgFinal.classList.remove("reveal");
    logoOverlay.classList.add("hidden");
    
    btnGenerate.disabled = true;
    btnApplyIteration.disabled = true;

    // 1. Appel Make
    const result = await callMake(promptToUse);
    if (result.status !== "ok") throw new Error("Make returned an error.");

    currentRawBase64 = result.image_base64;
    currentFullDataUrl = `data:${result.mime_type};base64,${result.image_base64}`;

    // 2. Affichage Progressif (Correction Onload/Cache)
    imgBlur.src = currentFullDataUrl;
    imgBlur.classList.remove("hidden");
    
    // On précharge l'image finale
    imgFinal.src = currentFullDataUrl;

    const revealImage = () => {
      skeleton.classList.add("hidden");
      imgBlur.classList.add("hidden");
      imgFinal.classList.remove("hidden");
      
      // On force un petit délai pour que la transition CSS 'opacity' fonctionne
      setTimeout(() => {
        imgFinal.classList.add("reveal");
        logoOverlay.classList.remove("hidden");
      }, 50);
    };

    // Si l'image est déjà en cache (Base64 instantané), onload ne se déclenchera pas forcément
    if (imgFinal.complete) {
      revealImage();
    } else {
      imgFinal.onload = revealImage;
    }

    // 3. Update UI
    setStatus("Done.");
    btnDownload.classList.remove("hidden");
    btnDownloadTop.disabled = false;
    btnIterate.classList.remove("hidden");
    iterationZone.classList.add("hidden");
    if (isIteration) iterationPromptInput.value = "";

  } catch (err) {
    showError(err.message);
    setStatus("Error occurred.");
  } finally {
    btnGenerate.disabled = false;
    btnApplyIteration.disabled = false;
  }
}

// ================== EVENT LISTENERS ==================

btnGenerate.addEventListener("click", () => {
  const text = ideaInput.value.trim();
  if (text) runGenerationProcess(text, false);
});

btnIterate.addEventListener("click", () => {
  iterationZone.classList.toggle("hidden");
  if (!iterationZone.classList.contains("hidden")) iterationPromptInput.focus();
});

btnApplyIteration.addEventListener("click", async () => {
  const modifText = iterationPromptInput.value.trim();
  if (!modifText || !currentRawBase64) return;

  try {
    setStatus("Gemini is thinking...");
    btnApplyIteration.disabled = true;
    const newPrompt = await getNewPromptFromGemini(currentRawBase64, modifText);
    console.log("Gemini Prompt:", newPrompt);
    await runGenerationProcess(newPrompt, true);
  } catch (err) {
    showError("Gemini analysis failed: " + err.message);
  } finally {
    btnApplyIteration.disabled = false;
  }
});

// Téléchargement propre
function downloadImage() {
  if (!currentFullDataUrl) return;
  const a = document.createElement("a");
  a.href = currentFullDataUrl;
  a.download = `alstom-concept-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

btnDownload.addEventListener("click", downloadImage);
btnDownloadTop.addEventListener("click", downloadImage);

// Init
setStatus("Ready.");