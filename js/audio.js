const audioFileInput = document.getElementById("audioFileInput");
const selectAudioButton = document.getElementById("selectAudioButton");
const selectedAudioName = document.getElementById("selectedAudioName");
const convertAudioBtn = document.getElementById("convertAudioBtn");
const audioUploadZone = document.getElementById("audioUploadZone");

let selectedAudioFile = null;
let ffmpegLoaded = false;

// Load ffmpeg
const { createFFmpeg } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

async function loadFFmpeg() {
  if (!ffmpegLoaded) {
    console.log("Loading FFmpeg...");
    await ffmpeg.load();
    ffmpegLoaded = true;
    console.log("FFmpeg loaded successfully.");
  }
}

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

  await loadFFmpeg();

  const inputName = "input." + selectedAudioFile.name.split(".").pop();
  const outputName = `output.${format}`;

  // Write file to memory
  ffmpeg.FS("writeFile", inputName, await fetchFile(selectedAudioFile));

  // Convert
  if (format === "mp3") {
    await ffmpeg.run("-i", inputName, "-q:a", "2", outputName);
  } else if (format === "m4a") {
    await ffmpeg.run("-i", inputName, "-c:a", "aac", "-b:a", "192k", outputName);
  }

  // Read file from memory
  const data = ffmpeg.FS("readFile", outputName);

  // Create download link
  const url = URL.createObjectURL(new Blob([data.buffer], { type: `audio/${format}` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `converted.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  ffmpeg.FS("unlink", inputName);
  ffmpeg.FS("unlink", outputName);
});
