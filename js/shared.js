// Tool selector navigation
document.getElementById("toolSelector")?.addEventListener("change", (e) => {
  const selected = e.target.value;
  if (selected !== "/") {
    window.location.href = selected;
  }
});
