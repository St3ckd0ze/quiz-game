import { AbstractPOM } from "../pages/AbstractPOM.js";
export default class GamePagePOM extends AbstractPOM {
    lastClickedCell = null;
    async loadPage() {
        await AbstractPOM.showPage("./html/gamePage.html");
        const cells = document.querySelectorAll('.jeopardy-cell');
        const overlay = document.getElementById('questionOverlay');
        const title = document.getElementById('questionTitle');
        const text = document.getElementById('questionText');
        const closeBtn = document.getElementById('closeQuestion');
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const el = cell;
                if (el.dataset.state === "hidden") {
                    // War transparent, wird jetzt grau
                    el.style.backgroundColor = 'gray';
                    el.style.border = '2px solid #000';
                    el.style.color = '#000';
                    el.dataset.state = "redo";
                    return;
                }
                if (el.dataset.state === "redo") {
                    // War grau und wird jetzt wieder transparent
                    this.lastClickedCell = el;
                }
            });
        });
        closeBtn?.addEventListener('click', () => {
            overlay.style.display = 'none';
            if (this.lastClickedCell) {
                if (this.lastClickedCell.dataset.state === "redo") {
                    this.lastClickedCell.style.backgroundColor = 'transparent';
                    this.lastClickedCell.style.border = '2px solid transparent';
                    this.lastClickedCell.style.color = 'transparent';
                    this.lastClickedCell.dataset.state = "hidden";
                }
                else {
                    this.lastClickedCell.style.backgroundColor = 'transparent';
                    this.lastClickedCell.style.border = '2px solid transparent';
                    this.lastClickedCell.style.color = 'transparent';
                    this.lastClickedCell.dataset.state = "hidden";
                }
                this.lastClickedCell = null;
            }
        });
    }
}
//# sourceMappingURL=GamePagePOM.js.map