// ================== CONFIGURATION ==================
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/cyfu356g7x4ahx89k5n4w2nq6hjp8is5";
const GEMINI_API_KEY = "AIzaSyAsZ825g314qrs7uM7SOqDPOcmEH9njbgMI"; 

// On passe sur le modèle 1.5 Flash (ultra stable et rapide) pour éviter les erreurs de quota/version
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
  // NETTOYAGE STRICT DU BASE64
  // On retire le header 'data:image/png;base64,' s'il est présent
  const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|webp|jpg);base64,/, "");

  const payload = {
    contents: [{
      parts: [
        { text: `You are a design expert. Based on this image, create a new detailed English prompt to: ${userModification}. Style: Photorealistic, cinematic. Output ONLY the prompt.` },
        { 
          inline_data: { 
            mime_type: "image/png", 
            data: cleanBase64.trim() 
          } 
        }
      ]
    }],
    safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
  };

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    // On affiche l'erreur REELLE dans la console pour débugger
    console.error("FULL GEMINI ERROR:", data);
    const reason = data.error?.message || "Unknown error";
    throw new Error(`Gemini rejected: ${reason}`);
  }

  if (!data.candidates || !data.candidates[0].content) {
    console.warn("Gemini Safety Filter triggered:", data);
    throw new Error("Content blocked by safety filters. Try another request.");
  }

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

    setStatus(isIteration ? "Updating..." : "Generating...");
    
    skeleton.classList.remove("hidden");
    imgBlur.classList.add("hidden");
    imgFinal.classList.add("hidden");
    imgFinal.classList.remove("reveal");
    logoOverlay.classList.add("hidden");
    
    btnGenerate.disabled = true;
    btnApplyIteration.disabled = true;

    const result = await callMake(promptToUse);
    if (result.status !== "ok") throw new Error("Make error.");

    currentRawBase64 = result.image_base64; 
    currentFullDataUrl = `data:${result.mime_type};base64,${result.image_base64}`;

    imgBlur.src = currentFullDataUrl;
    imgBlur.classList.remove("hidden");
    imgFinal.src = currentFullDataUrl;

    const revealImage = () => {
      skeleton.classList.add("hidden");
      imgBlur.classList.add("hidden");
      imgFinal.classList.remove("hidden");
      setTimeout(() => {
        imgFinal.classList.add("reveal");
        logoOverlay.classList.remove("hidden");
      }, 50);
    };

    if (imgFinal.complete) revealImage();
    else imgFinal.onload = revealImage;

    setStatus("Done.");
    btnDownload.classList.remove("hidden");
    btnDownloadTop.disabled = false;
    btnIterate.classList.remove("hidden");
    iterationZone.classList.add("hidden");
    if (isIteration) iterationPromptInput.value = "";

  } catch (err) {
    console.error("Process Error:", err);
    showError(err.message);
    setStatus("Error.");
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
    await runGenerationProcess(newPrompt, true);
  } catch (err) {
    showError(err.message);
  } finally {
    btnApplyIteration.disabled = false;
  }
});

function downloadImage() {
  if (!currentFullDataUrl) return;
  const a = document.createElement("a");
  a.href = currentFullDataUrl;
  a.download = `alstom-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

btnDownload.addEventListener("click", downloadImage);
btnDownloadTop.addEventListener("click", downloadImage);

setStatus("Ready.");