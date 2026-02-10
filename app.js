// ================== CONFIGURATION ==================
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/cyfu356g7x4ahx89k5n4w2nq6hjp8is5"; // Ton webhook Make
const GEMINI_API_KEY = "TA_CLE_API_ICI"; // AIzaSyAg9OpJHyiqXtL9uNWXv60qkiDjysPsqvk
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

// ================== UI ELEMENTS (Basé sur ton HTML) ==================
// Ecrans
const homeSection = document.getElementById("home");
const viewerSection = document.getElementById("viewer");

// Inputs
const ideaInput = document.getElementById("idea");
const iterationPromptInput = document.getElementById("iterationPrompt");

// Boutons
const btnGenerate = document.getElementById("btnGenerate");
const btnDownload = document.getElementById("btnDownload");
const btnDownloadTop = document.getElementById("btnDownloadTop");
const btnIterate = document.getElementById("btnIterate"); // Le bouton "Modify Image"
const btnApplyIteration = document.getElementById("btnApplyIteration"); // Le bouton "Apply"

// Images & Status
const statusHome = document.getElementById("statusHome");
const statusViewer = document.getElementById("statusViewer");
const errorBox = document.getElementById("errorBox");
const skeleton = document.getElementById("skeleton");
const imgBlur = document.getElementById("imgBlur");
const imgFinal = document.getElementById("imgFinal");
const logoOverlay = document.getElementById("logoOverlay");

// Containers
const iterationZone = document.getElementById("iterationZone");

// ================== STATE ==================
let currentRawBase64 = null; // L'image propre pour Gemini (sans data:image...)
let currentFullDataUrl = null; // L'URL pour l'affichage (avec data:image...)

// ================== UTILS ==================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
  console.error(msg);
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function setStatus(text) {
  statusHome.textContent = text;
  statusViewer.textContent = text;
}

// ================== API: MAKE (Génération d'image) ==================
async function callMake(promptText) {
  const res = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea: promptText }),
  });

  if (!res.ok) throw new Error(`Make error: ${res.status}`);
  return res.json();
}

// ================== API: GEMINI (Cerveau de l'itération) ==================
async function getNewPromptFromGemini(imageBase64, userModification) {
  const systemPrompt = `
    Tu es un expert en conception visuelle et prompt engineering.
    Tâche :
    1. Analyse l'image fournie.
    2. Prends en compte la modification demandée : "${userModification}".
    3. Rédige un NOUVEAU prompt complet (en anglais, détaillé) qui décrit l'image résultante.
    4. Réponds UNIQUEMENT par le texte du prompt. Pas d'introduction.
  `;

  const payload = {
    contents: [{
      parts: [
        { text: systemPrompt },
        { 
          inline_data: { 
            mime_type: "image/png", 
            data: imageBase64 
          } 
        }
      ]
    }]
  };

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Erreur Gemini lors de l'analyse");
  const data = await response.json();
  
  // Extraction du texte
  return data.candidates[0].content.parts[0].text;
}

// ================== CORE LOGIC ==================

// Fonction principale qui gère l'UI et l'appel à Make
async function runGenerationProcess(promptToUse, isIteration = false) {
  try {
    // 1. Mise en place de l'interface
    clearError();
    
    if (!isIteration) {
      // Transition Home -> Viewer uniquement si c'est la première fois
      homeSection.classList.add("hidden"); // On cache le home proprement via CSS (display: none si class hidden)
      homeSection.style.display = "none"; // Force brut pour être sûr
      viewerSection.classList.remove("hidden");
    }

    // Reset visuel
    setStatus("Generating...");
    skeleton.classList.remove("hidden");
    imgBlur.classList.add("hidden");
    imgFinal.classList.add("hidden");
    logoOverlay.classList.add("hidden");
    
    // Désactivation des boutons
    btnGenerate.disabled = true;
    btnApplyIteration.disabled = true;
    btnIterate.classList.add("hidden"); 
    btnDownload.classList.add("hidden");
    iterationZone.classList.add("hidden"); // On cache la zone d'input pendant que ça charge

    // 2. Appel à Make
    const result = await callMake(promptToUse);
    
    if (result.status !== "ok") throw new Error("Erreur de génération Make");

    // 3. Traitement du résultat
    currentRawBase64 = result.image_base64;
    currentFullDataUrl = `data:${result.mime_type};base64,${result.image_base64}`;

    // 4. Animation d'affichage (Blur -> Sharp)
    imgBlur.src = currentFullDataUrl;
    imgBlur.classList.remove("hidden");
    // Petit delai pour laisser le CSS blur s'appliquer visuellement
    await sleep(500);
    
    imgFinal.src = currentFullDataUrl;
    imgFinal.onload = () => {
      imgBlur.classList.add("hidden");
      imgFinal.classList.remove("hidden");
      logoOverlay.classList.remove("hidden");
    };

    // 5. Activation des contrôles
    setStatus("Ready.");
    btnDownload.classList.remove("hidden");
    btnDownloadTop.disabled = false;
    btnIterate.classList.remove("hidden"); // Le bouton "Modify Image" réapparaît
    
    // Reset champs
    if (isIteration) {
      iterationPromptInput.value = "";
    }

  } catch (err) {
    showError(err.message);
    setStatus("Error.");
  } finally {
    btnGenerate.disabled = false;
    btnApplyIteration.disabled = false;
  }
}

// ================== EVENT LISTENERS ==================

// 1. Génération depuis l'accueil
btnGenerate.addEventListener("click", () => {
  const text = ideaInput.value.trim();
  if (!text) return showError("Please enter an idea.");
  runGenerationProcess(text, false);
});

// 2. Ouvrir / Fermer la zone d'itération
btnIterate.addEventListener("click", () => {
  // Toggle la classe hidden
  if (iterationZone.classList.contains("hidden")) {
    iterationZone.classList.remove("hidden");
    iterationPromptInput.focus();
  } else {
    iterationZone.classList.add("hidden");
  }
});

// 3. Appliquer l'itération (Le cœur du système)
btnApplyIteration.addEventListener("click", async () => {
  const modifText = iterationPromptInput.value.trim();
  
  if (!modifText) return showError("Please describe your changes.");
  if (!currentRawBase64) return showError("No image to modify.");

  try {
    setStatus("Gemini is analyzing the image...");
    btnApplyIteration.disabled = true;

    // Étape A : Demander à Gemini le nouveau prompt
    const newPrompt = await getNewPromptFromGemini(currentRawBase64, modifText);
    console.log("Nouveau Prompt généré :", newPrompt);

    // Étape B : Relancer la machine Make
    await runGenerationProcess(newPrompt, true);

  } catch (err) {
    showError(err.message);
    setStatus("Iteration failed.");
    btnApplyIteration.disabled = false;
  }
});

// 4. Téléchargement
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