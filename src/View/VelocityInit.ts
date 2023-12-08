import { Game } from "../Model/Game.js";
import { Vector2 } from "../Model/Vector2.js";
import { BrushBar } from "./BrushBar/BrushBar.js";

export class VelocityInit {
    private _game: Game;
    private _brushBar: BrushBar;
    private _dragStartingPos: Vector2;

    private _active: boolean;
    private _velocityVis: HTMLDivElement;
    private _vel: Vector2;

    constructor(game: Game, brushBar: BrushBar){
        this._game = game;
        this._brushBar = brushBar;
        this._dragStartingPos = Vector2.null;
        this._vel = Vector2.null;

        this._velocityVis = document.createElement("div");
        this._velocityVis.id = "velocityInit";
        this._velocityVis.hidden = true;
        this._active = false;

        this._game.pageElements.addEventListener("mousedown", (event) => {
            if(event.ctrlKey && event.button == 0){
                this._dragStartingPos = new Vector2(event.x, event.y);
                this.activate();
            }
        });

        this._game.pageElements.addEventListener("mouseup", (event) => {
            if(this._active && event.button == 0) {
                this.deactivate();
            }
        });

        this._game.pageElements.addEventListener("mousemove", (event) => {
            if(this._active) {
                let mousePos = new Vector2(event.x, event.y);
                this._vel = this._dragStartingPos.minus(mousePos);
                let dotProd = Vector2.right.dotProduct(this._vel);
                let angle = Math.acos(dotProd/(this._vel.magnitude));
                angle *= Math.sign(this._vel.y);

                this._velocityVis.style.width = this._vel.magnitude+"px";
                this._velocityVis.style.transform = 'rotate('+angle+'rad)';
                this._velocityVis.style.transform += 'translate(-100%,-100%)';
            }
        });
    }

    get velocityVis() {
        return this._velocityVis;
    }

    activate(){
        this._active = true;
        this._velocityVis.hidden = false;
        this._vel = Vector2.null;

        this._velocityVis.style.width = "5px";
        this._velocityVis.style.height = "1px";
        this._velocityVis.style.left = this._dragStartingPos.x + "px";
        this._velocityVis.style.top = this._dragStartingPos.y + "px";
    }

    deactivate(){
        this._active = false;
        this._velocityVis.hidden = true;
        
        let vel = this._vel.kProd(-this._game.zoom);
        vel = vel.kDivide(1000000);
        if(this._game.isFollowing)
        {
            vel = vel.add(this._game.followedVel());
        }
        this._game.createPageElement(this._brushBar.mass, this._brushBar.radius, vel, this._game.screenToRealWorld(this._dragStartingPos));
    }
}