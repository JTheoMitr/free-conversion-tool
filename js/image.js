const fileInput = document.getElementById("fileInput");
const selectFileButton = document.getElementById("selectFileButton");
const selectedFileName = document.getElementById("selectedFileName");
const convertBtn = document.getElementById("convertBtn");
const previewContainer = document.getElementById("previewContainer");

let selectedFile = null;

// Trigger file input when button clicked
selectFileButton.addEventListener("click", () => fileInput.click());

// Handle file selection
fileInput.addEventListener("change", (event) => handleFile(event.target.files[0]));

// Drag & drop support
previewContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  previewContainer.classList.add("border-blue-400");
});

previewContainer.addEventListener("dragleave", () => {
  previewContainer.classList.remove("border-blue-400");
});

previewContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  previewContainer.classList.remove("border-blue-400");

  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// Handle file logic
function handleFile(file) {
  if (!file) return;

  const allowedTypes = ["image/webp", "image/png", "image/jpeg"];
  if (!allowedTypes.includes(file.type)) {
    alert("Please select a valid image file (WebP, PNG, or JPG).");
    return;
  }

  selectedFileName.textContent = file.name;

  const img = new Image();
  const reader = new FileReader();

  reader.onload = (e) => {
    img.src = e.target.result;
    img.onload = () => {
      selectedFile = img;
      previewContainer.innerHTML = ""; // Clear upload text
      previewContainer.appendChild(img);
      img.style.maxWidth = "100%";
      img.style.maxHeight = "300px";
      img.classList.add("mx-auto", "mt-2", "rounded-lg");
    };
  };

  reader.readAsDataURL(file);
}

// Convert & Download
convertBtn.addEventListener("click", () => {
  if (!selectedFile) {
    alert("Please select an image first.");
    return;
  }

  const format = document.querySelector('input[name="format"]:checked').value;

  const canvas = document.createElement("canvas");
  canvas.width = selectedFile.naturalWidth;
  canvas.height = selectedFile.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(selectedFile, 0, 0);

  let mimeType;
  let extension;

  switch (format) {
    case "jpg":
      mimeType = "image/jpeg";
      extension = "jpg";
      break;
    case "png":
      mimeType = "image/png";
      extension = "png";
      break;
    case "webp":
      mimeType = "image/webp";
      extension = "webp";
      break;
    default:
      alert("Unsupported format selected.");
      return;
  }

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, mimeType);
});
