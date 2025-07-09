document.addEventListener("DOMContentLoaded", () => {
  const teamSelect = document.getElementById("team-select") as HTMLSelectElement;
  const pointsInput = document.getElementById("field-points") as HTMLInputElement;
  const correctBtn = document.getElementById("correct-btn") as HTMLButtonElement;
  const wrongBtn = document.getElementById("wrong-btn") as HTMLButtonElement;

  // Teams laden und Dropdown befüllen
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

  // Punkte-Update an den Server senden
  async function updatePoints(isCorrect: boolean) {
    const teamName = teamSelect.value;
    const fieldPoints = Number(pointsInput.value) || 0;
    if (!teamName) return;

    try {
      await fetch('/teams/update', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          teamName,
          isCorrect,
          fieldPoints
        })
      });
      await loadTeams();
      // Overlay NICHT automatisch schließen
    } catch (e) {
      console.error("Fehler beim Punkte aktualisieren:", e);
    }
  }

  correctBtn.addEventListener("click", () => updatePoints(true));
  wrongBtn.addEventListener("click", () => updatePoints(false));

  loadTeams();
});