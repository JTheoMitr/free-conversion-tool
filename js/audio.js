const audioFileInput = document.getElementById("audioFileInput");
const selectAudioButton = document.getElementById("selectAudioButton");
const selectedAudioName = document.getElementById("selectedAudioName");
const convertAudioBtn = document.getElementById("convertAudioBtn");
const audioUploadZone = document.getElementById("audioUploadZone");

let selectedAudioFile = null;

// Trigger file input
selectAudioButton.addEventListener("click", () => audioFileInput.click());

// Handle file selection
audioFileInput.addEventListener("change", (event) => handleAudioFile(event.target.files[0]));

// Drag & drop support
audioUploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  audioUploadZone.classList.add("border-blue-400");
});

audioUploadZone.addEventListener("dragleave", () => {
  audioUploadZone.classList.remove("border-blue-400");
});

audioUploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  audioUploadZone.classList.remove("border-blue-400");
  handleAudioFile(e.dataTransfer.files[0]);
});

// Handle file logic
function handleAudioFile(file) {
  if (!file) return;

  const allowedTypes = ["audio/wav", "audio/aiff", "audio/x-aiff"];
  if (!allowedTypes.includes(file.type)) {
    alert("Please select a valid audio file (WAV or AIFF).");
    return;
  }

  selectedAudioFile = file;
  selectedAudioName.textContent = file.name;
}

// Convert & Download
convertAudioBtn.addEventListener("click", async () => {
  if (!selectedAudioFile) {
    alert("Please select an audio file first.");
    return;
  }

  const format = document.querySelector('input[name="audioFormat"]:checked').value;

  alert(`Conversion to ${format.toUpperCase()} will be handled in the next step using ffmpeg.wasm.`);

  // Placeholder for ffmpeg conversion (to be implemented next)
});
