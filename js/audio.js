import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const audioFileInput = document.getElementById("audioFileInput");
const selectAudioButton = document.getElementById("selectAudioButton");
const selectedAudioFileName = document.getElementById("selectedAudioFileName");
const convertAudioBtn = document.getElementById("convertAudioBtn");
const spinner = document.getElementById("spinner");
const spinnerText = document.getElementById("spinnerText");

const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

let selectedAudioFile = null;
let ffmpeg = null;

// Button triggers file input
selectAudioButton.addEventListener("click", () => {
  audioFileInput.click();
});

// Handle file selection
audioFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = ["audio/aiff", "audio/wav", "audio/mpeg", "audio/mp4", "audio/x-m4a"];
  if (!allowedTypes.includes(file.type)) {
    alert("Please select a valid audio file (AIFF, WAV, MP3, M4A).");
    return;
  }

  selectedAudioFile = file;
  selectedAudioFileName.textContent = file.name;
});

// Initialize FFmpeg
async function loadFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    // Hook into ffmpeg log for progress tracking
    ffmpeg.setLogger(({ type, message }) => {
      if (type === "fferr" && message.includes("time=")) {
        const match = message.match(/time=(\d+:\d+:\d+\.\d+)/);
        if (match) {
          const [h, m, s] = match[1].split(":").map(parseFloat);
          const currentTime = h * 3600 + m * 60 + s;
          const duration = selectedAudioFile?.duration || 60; // fallback 60s
          const progress = Math.min(100, Math.round((currentTime / duration) * 100));
          updateProgress(progress);
        }
      }
    });
  }
}

// Progress bar helpers
function updateProgress(value) {
  progressContainer.classList.remove("hidden");
  progressBar.style.width = `${value}%`;
  progressText.textContent = `${value}%`;
}

function resetProgress() {
  progressBar.style.width = "0%";
  progressText.textContent = "0%";
  progressContainer.classList.add("hidden");
}

// Spinner helpers
function showSpinner(message) {
  spinner.classList.remove("hidden");
  spinnerText.textContent = message;
}

function hideSpinner() {
  spinner.classList.add("hidden");
}

// Get audio duration (for better progress tracking)
function getAudioDuration(file) {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(file);
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration || 60); // fallback 60s
    });
  });
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
  resetProgress();

  const inputName = "input." + selectedAudioFile.name.split(".").pop();
  const outputName = `output.${format}`;

  ffmpeg.FS("writeFile", inputName, await fetchFile(selectedAudioFile));

  // Estimate duration for progress
  selectedAudioFile.duration = await getAudioDuration(selectedAudioFile);

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
  resetProgress();
});
