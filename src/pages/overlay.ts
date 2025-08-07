let dropdownOrder: string[] = [];
let activeCell: HTMLElement | null = null;
let usedTeams: string[] = [];
let rotationIndex: number = 0;

async function loadTeams() {
  const teamSelect = document.getElementById("team-select") as HTMLSelectElement;
  try {
    const res = await fetch('/teams');
    const teams: {name: string, points: number}[] = await res.json();
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
  } catch (e) {
    console.error("Fehler beim Laden der Teams:", e);
  }
}

async function updatePoints(isCorrect: boolean) {
  const teamSelect = document.getElementById("team-select") as HTMLSelectElement;
  const pointsInput = document.getElementById("field-points") as HTMLInputElement;

  const teamName = teamSelect.value;
  const fieldPoints = Number(pointsInput.value) || 0;

  // Frage-ID aus activeCell lesen
  const frageId = (window as any).activeCell?.getAttribute('data-question-id') || "";

  // Prüfen, ob noch niemand geraten hat (lokal im Frontend)
  const firstTry = usedTeams.length === 0;

  // Das erste Team, das antwortet, ist der Question Selector
  const isQuestionSelector = firstTry;

  if (!teamName) return;

  try {
    await fetch('/teams/update', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ teamName, isCorrect, fieldPoints, frageId, isQuestionSelector })
    });
    usedTeams.push(teamName);
    await loadTeams();
  } catch (e) {
    console.error("Fehler beim Punkte aktualisieren:", e);
  }
}

const correctHandler = () => updatePoints(true);
const wrongHandler = () => updatePoints(false);

function initOverlayPage() {
  const correctBtn = document.getElementById("correct-btn") as HTMLButtonElement;
  const wrongBtn = document.getElementById("wrong-btn") as HTMLButtonElement;

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
  const answerTextEl = document.getElementById("answerText") as HTMLElement;
  if (!answerTextEl) return;
  answerTextEl.style.display = (answerTextEl.style.display === "none" || answerTextEl.style.display === "") ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    if (document.getElementById("team-select")) {
      initOverlayPage();
      observer.disconnect();
    }
  });

  observer.observe(document.getElementById("pageContent")!, {
    childList: true,
    subtree: true
  });
});

function showOverlay(cell: HTMLElement, points: number) {
  if (cell.classList.contains("active")) {
    cell.classList.remove("active");
    (window as any).activeCell = null;
    return;
  }

  (window as any).activeCell = cell;
  cell.classList.add("active");

  const question = cell.getAttribute("data-question") || "";
  const answer = cell.getAttribute("data-answer") || "";

  const questionTitleEl = document.getElementById("questionTitle") as HTMLElement;
  const answerTextEl = document.getElementById("answerText") as HTMLElement;
  const pointsInput = document.getElementById("field-points") as HTMLInputElement;

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
  const answerTextEl = document.getElementById("answerText") as HTMLElement;
  answerTextEl.style.display = "none";
  // Feld nur transparent machen, nicht verschwinden lassen
  if ((window as any).activeCell) {
    (window as any).activeCell.style.backgroundColor = 'transparent';
    (window as any).activeCell.style.border = '2px solid transparent';
    (window as any).activeCell.style.color = 'transparent';
    (window as any).activeCell.style.opacity = '0.3'; // Leicht transparent, aber noch sichtbar
    (window as any).activeCell.setAttribute('data-state', 'hidden');
    // Nach jedem Schließen prüfen, ob alle Felder transparent sind
    if ((window as any).GamePagePOMInstance && typeof (window as any).GamePagePOMInstance.checkAllHidden === 'function') {
      (window as any).GamePagePOMInstance.checkAllHidden();
    }
  }
  rotationIndex = (rotationIndex + 1) % dropdownOrder.length;
  usedTeams = [];
  initOverlayPage();
}

(window as any).showOverlay = showOverlay;
(window as any).closeOverlay = closeOverlay;
(window as any).toggleAnswer = toggleAnswer;

(window as any).rotateDropdownOrder = function () {
  if (dropdownOrder.length > 0) {
    dropdownOrder.push(dropdownOrder.shift()!);
  }
};