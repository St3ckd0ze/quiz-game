import { ApplicationManager } from "../ApplicationManager.js";
import { AbstractPOM } from "./AbstractPOM.js";

export class GamePagePOM extends AbstractPOM {
    constructor(private appManager: ApplicationManager) {
        super();
    }



    public async loadPage(): Promise<void> {
      
      await AbstractPOM.showPage("./html/landing.html");
    }

      
        
}   
