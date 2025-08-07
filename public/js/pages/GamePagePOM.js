import { AbstractPOM } from "../pages/AbstractPOM.js";
export default class GamePagePOM extends AbstractPOM {
    lastClickedCell = null;
    currentRound = 1;
    maxRounds = 3; // Erhöht für Ergebnisseite
    questions = [];
    categories = [];
    async loadQuestions(round) {
        const res = await fetch(`/questions_round${round}.json`);
        this.questions = await res.json();
        this.categories = [...new Set(this.questions.map((q) => q.category))];
        // Update Kategorie-Anzeige basierend auf aktueller Runde
        const categoryRow = document.getElementById("category-row");
        if (categoryRow) {
            categoryRow.innerHTML = "";
            this.categories.forEach(cat => {
                const div = document.createElement("div");
                div.className = "col jeopardy-header";
                div.textContent = cat;
                categoryRow.appendChild(div);
            });
        }
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/gamePage.html");
        await this.loadQuestions(this.currentRound);
        this.renderBoard();
        window.GamePagePOMInstance = this;
    }
    renderBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        const rows = Math.ceil(this.questions.length / this.categories.length);
        for (let r = 0; r < rows; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row mb-2';
            for (let c = 0; c < this.categories.length; c++) {
                const idx = r * this.categories.length + c;
                const q = this.questions[idx];
                if (!q)
                    continue;
                const cell = document.createElement('div');
                cell.className = 'col jeopardy-cell';
                cell.setAttribute('data-question', q.question);
                cell.setAttribute('data-answer', q.answer);
                cell.setAttribute('data-state', 'visible');
                // Frage-ID eindeutig generieren
                const frageId = `round${this.currentRound}-${q.category}-${r}-${c}`;
                cell.setAttribute('data-question-id', frageId);
                cell.textContent = q.points.toString();
                cell.onclick = () => window.showOverlay(cell, q.points);
                cell.addEventListener('transitionend', () => this.checkAllHidden());
                rowDiv.appendChild(cell);
            }
            board.appendChild(rowDiv);
        }
        this.addNextRoundButton();
        //Debug Wichtig nicht Löschen!!!
        //this.showResultsButton();
    }
    checkAllHidden() {
        const cells = document.querySelectorAll('.jeopardy-cell');
        const allHidden = Array.from(cells).every(cell => cell.dataset.state === 'hidden');
        const nextRoundBtn = document.getElementById('next-round-btn');
        const resultsBtn = document.getElementById('results-btn');
        if (allHidden) {
            if (this.currentRound === 1 && this.currentRound < this.maxRounds) {
                if (!nextRoundBtn)
                    this.showNextRoundButton();
            }
            else if (this.currentRound === 2) {
                if (!resultsBtn)
                    this.showResultsButton();
            }
        }
        else {
            if (nextRoundBtn)
                nextRoundBtn.remove();
            //if (resultsBtn) resultsBtn.remove();
        }
    }
    showNextRoundButton() {
        const btn = document.createElement('button');
        btn.id = 'next-round-btn';
        btn.textContent = 'Nächste Runde';
        btn.style.position = 'fixed';
        btn.style.bottom = '30px';
        btn.style.right = '30px';
        btn.className = 'btn btn-primary';
        btn.onclick = async () => {
            this.currentRound++;
            await this.loadQuestions(this.currentRound);
            this.renderBoard();
        };
        document.body.appendChild(btn);
    }
    async showResultsButton() {
        const btn = document.createElement('button');
        btn.id = 'results-btn';
        btn.textContent = 'Ergebnisse anzeigen';
        btn.style.position = 'fixed';
        btn.style.bottom = '30px';
        btn.style.right = '30px';
        btn.className = 'btn btn-success';
        btn.onclick = async () => {
            await AbstractPOM.showPage('./html/results.html');
            // Direkt nach dem Laden der Seite die Ergebnisse abrufen
            await this.loadAndDisplayResults();
        };
        document.body.appendChild(btn);
    }
    async loadAndDisplayResults() {
        try {
            const res = await fetch('/teams');
            const teams = await res.json();
            // Teams nach Punkten sortieren (höchste zuerst)
            teams.sort((a, b) => b.points - a.points);
            const podiumPlaces = [];
            let currentPlace = 1;
            let currentPoints = null;
            for (const team of teams) {
                if (currentPoints === null || team.points !== currentPoints) {
                    // Neuer Platz (nicht derselbe Punktestand wie vorher)
                    if (podiumPlaces.length === 3)
                        break;
                    currentPoints = team.points;
                    podiumPlaces.push({
                        place: currentPlace,
                        points: team.points,
                        teams: [team]
                    });
                    currentPlace++;
                }
                else {
                    // Gleicher Punktestand, gleicher Platz
                    podiumPlaces[podiumPlaces.length - 1].teams.push(team);
                }
            }
            // Stelle sicher, dass es 3 Plätze gibt
            for (let i = podiumPlaces.length; i < 3; i++) {
                podiumPlaces.push({
                    place: i + 1,
                    points: 0,
                    teams: []
                });
            }
            // Podium anzeigen (mit dynamischer Farbe)
            if (podiumPlaces.length >= 1) {
                const place1 = podiumPlaces[0];
                const team1Container = document.getElementById('team1-name');
                const team1Points = document.getElementById('team1-points');
                if (team1Container) {
                    team1Container.innerHTML = place1.teams.map((team) => {
                        return `<span style="color: ${team.color || '#fff'}">${team.name}</span>`;
                    }).join('<br>');
                }
                if (team1Points) {
                    team1Points.textContent = place1.points + ' Punkte';
                    // Optional: Farbe der Punktzahl anpassen (Farbe des ersten Teams)
                    team1Points.style.color = '#fff';
                }
            }
            if (podiumPlaces.length >= 2) {
                const place2 = podiumPlaces[1];
                const team2Container = document.getElementById('team2-name');
                const team2Points = document.getElementById('team2-points');
                if (team2Container) {
                    team2Container.innerHTML = place2.teams.map((team) => {
                        return `<span style="color: ${team.color || '#fff'}">${team.name}</span>`;
                    }).join('<br>');
                }
                if (team2Points) {
                    team2Points.textContent = place2.points + ' Punkte';
                    team2Points.style.color = '#fff';
                }
            }
            if (podiumPlaces.length >= 3) {
                const place3 = podiumPlaces[2];
                const team3Container = document.getElementById('team3-name');
                const team3Points = document.getElementById('team3-points');
                if (team3Container) {
                    team3Container.innerHTML = place3.teams.map((team) => {
                        return `<span style="color: ${team.color || '#fff'}">${team.name}</span>`;
                    }).join('<br>');
                }
                if (team3Points) {
                    team3Points.textContent = place3.points + ' Punkte';
                    team3Points.style.color = '#fff';
                }
            }
            // Globale Funktionen für results.html verfügbar machen
            window.goBack = () => {
                window.location.href = '/';
            };
        }
        catch (e) {
            console.error("Fehler beim Laden der Ergebnisse:", e);
        }
    }
    addNextRoundButton() {
        this.checkAllHidden();
    }
}
//# sourceMappingURL=GamePagePOM.js.map