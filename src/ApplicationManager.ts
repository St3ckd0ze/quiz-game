import { User } from './domain/User.js'
import { GamePagePOM } from './pages/GamePagePOM.js';

export class ApplicationManager {


    constructor() {
    }

    loadGamePage() {
        new GamePagePOM(this).loadPage();
        this.updateMenuExtras();
    }

    updateMenuExtras() {
    
    }    
}
