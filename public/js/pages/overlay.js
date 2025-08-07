"use strict";
let dropdownOrder = [];
let activeCell = null;
let usedTeams = [];
let rotationIndex = 0;
async function loadTeams() {
    const teamSelect = document.getElementById("team-select");
    try {
        const res = await fetch('/teams');
        const teams = await res.json();
        teamSelect.innerHTML = "";
        const rotatedOrder = [
            ...dropdownOrder.slice(rotationIndex),
            ...dropdownOrder.slice(0, rotationIndex)
        ];
        teams
            .filter(team => !usedTeams.includes(team.name))
            .sort((a, b) => rotatedOrder.indexOf(a.name) - rotatedOrder.indexOf(b.name))
            .forEach(team => {
            const option = document.createElement("option");
            option.value = team.name;
            option.textContent = `${team.name} (${team.points} Punkte)`;
            teamSelect.appendChild(option);
        });
        if (dropdownOrder.length === 0) {
            dropdownOrder = teams.map(team => team.name);
        }
    }
    catch (e) {
        console.error("Fehler beim Laden der Teams:", e);
    }
}
async function updatePoints(isCorrect) {
    const teamSelect = document.getElementById("team-select");
    const pointsInput = document.getElementById("field-points");
    const teamName = teamSelect.value;
    const fieldPoints = Number(pointsInput.value) || 0;
    // Frage-ID aus activeCell lesen
    const frageId = window.activeCell?.getAttribute('data-question-id') || "";
    // Prüfen, ob noch niemand geraten hat (lokal im Frontend)
    const firstTry = usedTeams.length === 0;
    // Das erste Team, das antwortet, ist der Question Selector
    const isQuestionSelector = firstTry;
    if (!teamName)
        return;
    try {
        await fetch('/teams/update', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teamName, isCorrect, fieldPoints, frageId, isQuestionSelector })
        });
        usedTeams.push(teamName);
        await loadTeams();
    }
    catch (e) {
        console.error("Fehler beim Punkte aktualisieren:", e);
    }
}
const correctHandler = () => updatePoints(true);
const wrongHandler = () => updatePoints(false);
function initOverlayPage() {
    const correctBtn = document.getElementById("correct-btn");
    const wrongBtn = document.getElementById("wrong-btn");
    if (correctBtn) {
        correctBtn.removeEventListener("click", correctHandler);
        correctBtn.addEventListener("click", correctHandler);
    }
    if (wrongBtn) {
        wrongBtn.removeEventListener("click", wrongHandler);
        wrongBtn.addEventListener("click", wrongHandler);
    }
    loadTeams();
}
function toggleAnswer() {
    const answerTextEl = document.getElementById("answerText");
    if (!answerTextEl)
        return;
    answerTextEl.style.display = (answerTextEl.style.display === "none" || answerTextEl.style.display === "") ? "block" : "none";
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
    rotationIndex = (rotationIndex + 1) % dropdownOrder.length;
    usedTeams = [];
    initOverlayPage();
}
window.showOverlay = showOverlay;
window.closeOverlay = closeOverlay;
window.toggleAnswer = toggleAnswer;
window.rotateDropdownOrder = function () {
    if (dropdownOrder.length > 0) {
        dropdownOrder.push(dropdownOrder.shift());
    }
};
//# sourceMappingURL=overlay.js.map