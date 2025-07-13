let activeCell: HTMLElement | null = null;

function toggleAnswer() {
  const answerTextEl = document.getElementById("answerText") as HTMLElement;
  if (!answerTextEl) return;
  answerTextEl.style.display = (answerTextEl.style.display === "none" || answerTextEl.style.display === "") ? "block" : "none";
}

function initOverlayPage() {
  const teamSelect = document.getElementById("team-select") as HTMLSelectElement;
  const pointsInput = document.getElementById("field-points") as HTMLInputElement;
  const correctBtn = document.getElementById("correct-btn") as HTMLButtonElement;
  const wrongBtn = document.getElementById("wrong-btn") as HTMLButtonElement;

  const questionTitleEl = document.getElementById("questionTitle") as HTMLElement;
  const answerTextEl = document.getElementById("answerText") as HTMLElement;

  async function loadTeams() {
    try {
      const res = await fetch('/teams');
      const teams: {name: string, points: number}[] = await res.json();
      teamSelect.innerHTML = "";
      teams.forEach(team => {
        const option = document.createElement("option");
        option.value = team.name;
        option.textContent = `${team.name} (${team.points} Punkte)`;
        teamSelect.appendChild(option);
      });
    } catch (e) {
      console.error("Fehler beim Laden der Teams:", e);
    }
  }

  async function updatePoints(isCorrect: boolean) {
    const teamName = teamSelect.value;
    const fieldPoints = Number(pointsInput.value) || 0;
    if (!teamName) return;

    try {
      await fetch('/teams/update', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ teamName, isCorrect, fieldPoints })
      });
      await loadTeams();
    } catch (e) {
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

  observer.observe(document.getElementById("pageContent")!, {
    childList: true,
    subtree: true
  });
});

function showOverlay(cell: HTMLElement, points: number) {
  if (cell.classList.contains("active")) {
    cell.classList.remove("active");
    activeCell = null;
    return;
  }

  activeCell = cell;
  activeCell.classList.add("active");

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
}

(window as any).showOverlay = showOverlay;
(window as any).closeOverlay = closeOverlay;
(window as any).toggleAnswer = toggleAnswer;