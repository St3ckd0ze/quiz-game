document.addEventListener("DOMContentLoaded", () => {
  const ul = document.getElementById("team-list") as HTMLUListElement;

  async function loadTeams() {
    try {
      const res = await fetch('/teams');  
      const teams = await res.json();
      ul.innerHTML = "";
      teams.forEach((team: {name: string, points: number}) => {
        const li = document.createElement("li");

        const nameSpan = document.createElement("span");
        nameSpan.classList.add("team-name");
        nameSpan.textContent = team.name;

        const pointsSpan = document.createElement("span");
        pointsSpan.classList.add("team-points");
        pointsSpan.textContent = `: ${team.points} Punkte`;

        li.appendChild(nameSpan);
        li.appendChild(pointsSpan);
        ul.appendChild(li);
      });
    } catch (err) {
      console.error("Fehler beim Laden der Teams:", err);
    }
  }

  loadTeams();
  setInterval(loadTeams, 3000);
});