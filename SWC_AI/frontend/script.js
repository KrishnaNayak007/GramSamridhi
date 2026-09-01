const API_URL = "http://127.0.0.1:8000";

const SEVERITY_COLORS = { low: "#4CAF50", medium: "#FF9800", critical: "#F44336" };
const TYPE_COLORS = { organic: "#4CAF50", inorganic: "#2196F3", mixed: "#9C27B0" };
const TYPE_ICONS = { organic: "🍃", inorganic: "🧴", mixed: "♻️" };
const SEVERITY_ICONS = { low: "🟢", medium: "🟠", critical: "🔴" };

const fileInput = document.getElementById("file-input");
const fileNameSpan = document.getElementById("file-name");
const analyzeBtn = document.getElementById("analyze-btn");
const previewSection = document.getElementById("preview-section");
const imagePreview = document.getElementById("image-preview");

let selectedFile = null;

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile = file;
    fileNameSpan.textContent = file.name;
    analyzeBtn.disabled = false;

    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.src = event.target.result;
      previewSection.style.display = "block";
      document.getElementById("severity-banner").textContent = "Click 'Analyze Image' to run inference...";
      document.getElementById("severity-banner").style.backgroundColor = "#9E9E9E";
      document.getElementById("type-banner").style.display = "none";
    };
    reader.readAsDataURL(file);
  }
});

analyzeBtn.addEventListener("click", () => {
  if (selectedFile) {
    analyzeImage(selectedFile);
  }
});

function renderBanner(elementId, result, colorMap, iconMap, fallbackType) {
  const el = document.getElementById(elementId);
  el.style.display = "block";

  if (!result || result.error) {
    el.textContent = result?.error || "Prediction unavailable.";
    el.style.backgroundColor = "#9E9E9E";
    return;
  }

  const { label, confidence, message } = result;
  const normalizedLabel = (label || "").toLowerCase();
  const icon = iconMap[normalizedLabel] || "🔍";
  el.style.backgroundColor = colorMap[normalizedLabel] || "#9E9E9E";
  el.innerHTML = `${icon} <strong>${normalizedLabel.toUpperCase()}</strong> — ${(confidence * 100).toFixed(1)}%<small>${message || ""}</small>`;
}

async function analyzeImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  try {
    const res = await fetch(API_URL + "/predict", { method: "POST", body: formData });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    renderBanner("severity-banner", data.severity, SEVERITY_COLORS, SEVERITY_ICONS, "severity");
    renderBanner("type-banner", data.waste_type, TYPE_COLORS, TYPE_ICONS, "type");
  } catch (err) {
    document.getElementById("severity-banner").textContent =
      "Could not reach the AI server. Is uvicorn running on port 8000?";
    document.getElementById("severity-banner").style.backgroundColor = "#F44336";
    document.getElementById("type-banner").style.display = "none";
    console.error(err);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Image";
  }
}
