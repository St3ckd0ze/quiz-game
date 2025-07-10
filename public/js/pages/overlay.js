"use strict";
let activeCell = null;
document.addEventListener("DOMContentLoaded", () => {
    const teamSelect = document.getElementById("team-select");
    const pointsInput = document.getElementById("field-points");
    const correctBtn = document.getElementById("correct-btn");
    const wrongBtn = document.getElementById("wrong-btn");
    const questionTitleEl = document.getElementById("questionTitle");
    const answerTextEl = document.getElementById("answerText");
    async function loadTeams() {
        try {
            const res = await fetch('/teams');
            const teams = await res.json();
            teamSelect.innerHTML = "";
            teams.forEach(team => {
                const option = document.createElement("option");
                option.value = team.name;
                option.textContent = `${team.name} (${team.points} Punkte)`;
                teamSelect.appendChild(option);
            });
        }
        catch (e) {
            console.error("Fehler beim Laden der Teams:", e);
        }
    }
    async function updatePoints(isCorrect) {
        const teamName = teamSelect.value;
        const fieldPoints = Number(pointsInput.value) || 0;
        if (!teamName)
            return;
        try {
            await fetch('/teams/update', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamName, isCorrect, fieldPoints })
            });
            await loadTeams(); // Sofort nach Update die Teams neu laden
        }
        catch (e) {
            console.error("Fehler beim Punkte aktualisieren:", e);
        }
    }
    correctBtn.addEventListener("click", () => updatePoints(true));
    wrongBtn.addEventListener("click", () => updatePoints(false));
    loadTeams();
    const toggleAnswerBtn = document.querySelector(".btn-warning");
    toggleAnswerBtn?.addEventListener("click", () => {
        answerTextEl.style.display = answerTextEl.style.display === "none" ? "block" : "none";
    });
});
function showOverlay(cell, points) {
    if (cell.classList.contains("active")) {
        cell.classList.remove("active");
        activeCell = null;
        return;
    }
    activeCell = cell;
    activeCell.classList.add("active");
    const question = cell.getAttribute("data-question") || "";
    const answer = cell.getAttribute("data-answer") || "";
    const questionTitleEl = document.getElementById("questionTitle");
    const answerTextEl = document.getElementById("answerText");
    const pointsInput = document.getElementById("field-points");
    questionTitleEl.textContent = question;
    answerTextEl.textContent = answer;
    answerTextEl.style.display = "none";
    pointsInput.value = points.toString();
    document.getElementById("questionOverlay")?.classList.add("active");
}
function closeOverlay() {
    const overlay = document.getElementById("questionOverlay");
    if (overlay) {
        overlay.classList.remove("active");
    }
    // activeCell bleibt gesetzt, damit der Button transparent bleibt
}
// Globale Funktionen für HTML onclick-Handler
window.showOverlay = showOverlay;
window.closeOverlay = closeOverlay;
//# sourceMappingURL=overlay.js.map