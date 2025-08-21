"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const ul = document.getElementById("team-list");
    async function loadTeams() {
        const isResultPage = document.getElementById("result-page") !== null;
        if (!isResultPage) {
            try {
                const res = await fetch('/teams');
                const teams = await res.json();
                ul.innerHTML = "";
                teams.forEach((team) => {
                    const li = document.createElement("li");
                    const nameSpan = document.createElement("span");
                    nameSpan.classList.add("team-name");
                    nameSpan.textContent = team.name;
                    nameSpan.style.color = team.color;
                    const pointsSpan = document.createElement("span");
                    pointsSpan.classList.add("team-points");
                    pointsSpan.textContent = `: ${team.points} Punkte`;
                    // Länge messen
                    const totalLength = (team.name + team.points).length;
                    if (totalLength > 15) {
                        li.classList.add("small-text");
                    }
                    if (totalLength > 20) {
                        li.classList.add("smaller-text", "tight");
                    }
                    li.appendChild(nameSpan);
                    li.appendChild(pointsSpan);
                    ul.appendChild(li);
                });
            }
            catch (err) {
                console.error("Fehler beim Laden der Teams:", err);
            }
        }
        else {
            document.getElementById("TopMenu").innerHTML = "";
        }
    }
    loadTeams();
    setInterval(loadTeams, 1000);
});
//# sourceMappingURL=navbar.js.map