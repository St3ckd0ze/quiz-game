import GamePagePOM from './pages/GamePagePOM.js';
export class ApplicationManager {
    constructor() {
    }
    loadGamePage() {
        new GamePagePOM().loadPage();
        this.updateMenuExtras();
    }
    updateMenuExtras() {
    }
}
//# sourceMappingURL=ApplicationManager.js.map