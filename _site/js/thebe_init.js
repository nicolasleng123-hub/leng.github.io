document.addEventListener("DOMContentLoaded", async function () {
  if (!window.thebe) {
    console.warn("Thebe n'est pas chargé.");
    return;
  }

  const cells = document.querySelectorAll(".cell");
  cells.forEach(function (cell) {
    cell.classList.add("thebe-cell");
    cell.setAttribute("data-executable", "true");
  });

  try {
    await window.thebe.bootstrap();
  } catch (error) {
    console.error("Erreur d'initialisation Thebe:", error);
  }
});