"use strict";
let activeCell = null;
function toggleAnswer() {
    const answerTextEl = document.getElementById("answerText");
    if (!answerTextEl)
        return;
    answerTextEl.style.display = (answerTextEl.style.display === "none" || answerTextEl.style.display === "") ? "block" : "none";
}
function initOverlayPage() {
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
            await loadTeams();
        }
        catch (e) {
            console.error("Fehler beim Punkte aktualisieren:", e);
        }
    }
    correctBtn.addEventListener("click", () => updatePoints(true));
    wrongBtn.addEventListener("click", () => updatePoints(false));
    loadTeams();
}
document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
        if (document.getElementById("team-select")) {
            initOverlayPage();
            observer.disconnect();
        }
    });
    observer.observe(document.getElementById("pageContent"), {
        childList: true,
        subtree: true
    });
});
function showOverlay(cell, points) {
    if (cell.classList.contains("active")) {
        cell.classList.remove("active");
        window.activeCell = null;
        return;
    }
    window.activeCell = cell;
    cell.classList.add("active");
    const question = cell.getAttribute("data-question") || "";
    const answer = cell.getAttribute("data-answer") || "";
    const questionTitleEl = document.getElementById("questionTitle");
    const answerTextEl = document.getElementById("answerText");
    const pointsInput = document.getElementById("field-points");
    questionTitleEl.textContent = question;
    answerTextEl.textContent = answer;
    pointsInput.value = points.toString();
    document.getElementById("questionOverlay")?.classList.add("active");
}
function closeOverlay() {
    const overlay = document.getElementById("questionOverlay");
    if (overlay) {
        overlay.classList.remove("active");
    }
    const answerTextEl = document.getElementById("answerText");
    answerTextEl.style.display = "none";
    // Feld nur transparent machen, nicht verschwinden lassen
    if (window.activeCell) {
        window.activeCell.style.backgroundColor = 'transparent';
        window.activeCell.style.border = '2px solid transparent';
        window.activeCell.style.color = 'transparent';
        window.activeCell.style.opacity = '0.3'; // Leicht transparent, aber noch sichtbar
        window.activeCell.setAttribute('data-state', 'hidden');
        // Nach jedem Schließen prüfen, ob alle Felder transparent sind
        if (window.GamePagePOMInstance && typeof window.GamePagePOMInstance.checkAllHidden === 'function') {
            window.GamePagePOMInstance.checkAllHidden();
        }
    }
}
window.showOverlay = showOverlay;
window.closeOverlay = closeOverlay;
window.toggleAnswer = toggleAnswer;
//# sourceMappingURL=overlay.js.map