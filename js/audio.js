const audioFileInput = document.getElementById("audioFileInput");
const selectAudioButton = document.getElementById("selectAudioButton");
const selectedAudioName = document.getElementById("selectedAudioName");
const convertAudioBtn = document.getElementById("convertAudioBtn");
const audioUploadZone = document.getElementById("audioUploadZone");
const loadingSpinner = document.getElementById("loadingSpinner");
const loadingText = document.getElementById("loadingText");

let selectedAudioFile = null;
let ffmpegLoaded = false;

const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

// Show spinner
function showSpinner(message) {
  loadingSpinner.classList.remove("hidden");
  loadingText.textContent = message;
}

// Hide spinner
function hideSpinner() {
  loadingSpinner.classList.add("hidden");
}

// Load ffmpeg
async function loadFFmpeg() {
  if (!ffmpegLoaded) {
    showSpinner("Loading converter...");
    await ffmpeg.load();
    ffmpegLoaded = true;
    hideSpinner();
    console.log("FFmpeg loaded successfully.");
  }
}

// Trigger file input
selectAudioButton.addEventListener("click", () => audioFileInput.click());

// Handle file selection
audioFileInput.addEventListener("change", (event) => handleAudioFile(event.target.files[0]));

// Drag & drop
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
  await loadFFmpeg();

  showSpinner("Converting file...");

  const inputName = "input." + selectedAudioFile.name.split(".").pop();
  const outputName = `output.${format}`;

  ffmpeg.FS("writeFile", inputName, await fetchFile(selectedAudioFile));

  if (format === "mp3") {
    await ffmpeg.run("-i", inputName, "-q:a", "2", outputName);
  } else if (format === "m4a") {
    await ffmpeg.run("-i", inputName, "-c:a", "aac", "-b:a", "192k", outputName);
  }

  const data = ffmpeg.FS("readFile", outputName);

  const url = URL.createObjectURL(new Blob([data.buffer], { type: `audio/${format}` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `converted.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  ffmpeg.FS("unlink", inputName);
  ffmpeg.FS("unlink", outputName);

  hideSpinner();
});
