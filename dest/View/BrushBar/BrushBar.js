import { ColorHelp } from "./ColorHelp.js";
import { MassControl } from "./MassControl.js";
import { RadiusControl } from "./RadiusControl.js";
export class BrushBar {
    get mass() {
        return this._massControl.mass;
    }
    get radius() {
        return this._radiusControl.radius;
    }
    constructor(game) {
        this.brushBar = document.createElement("div");
        this.brushBar.id = "sandBoxBrush";
        this._massControl = new MassControl();
        this._radiusControl = new RadiusControl();
        this._colorHelp = new ColorHelp(game);
        this.buildBrushBar();
    }
    buildBrushBar() {
        this.brushBar.append(this._massControl.massControl);
        this.brushBar.append(this._radiusControl.radiusControl);
        this.brushBar.append(this._colorHelp.colorHelp);
    }
}
