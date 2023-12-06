import { Universe } from "./Universe.js";
import { Vector2 } from "./Vector2.js";
import { Body } from "./Body.js"

export class Game {
    position: Vector2;
    private _running: boolean;

    private _intervalId;


    private _zoom: number; //Horizontal length/2
    private _universe: Universe;
    private _pageElements: HTMLDivElement;
    private _colorHelp: boolean;
    

    constructor(position: Vector2, _zoom: number){
        this._running = true;
        this._colorHelp = false;
        this.position = position;
        this._zoom = _zoom;
        this._universe = new Universe();
        this._pageElements = document.createElement("div");
        this._pageElements.id = "_universe";
        document.body.appendChild(this._pageElements);

        this._intervalId = this.getIntervalId();
    }

    get zoom () {
        return this._zoom;
    }

    get universe () {
        return this._universe;
    }

    get pageElements () {
        return this._pageElements;
    }

    get colorHelp () {
        return this._colorHelp;
    }

    get isRunning () {
        return this._running;
    }

    switchColorHelp() {
        this._colorHelp = !this._colorHelp;
    }

    switchRunning() {
        this._running = !this._running;
    }

    clearInterval() {
        clearInterval(this._intervalId);
    }

    setInterval() {
        this._intervalId = this.getIntervalId();   
    }

    private getIntervalId() {
        let thisGame = this;
        return setInterval(function() {thisGame.gameLoop();}, this._universe.physicsTimeStep);
    }

    pointedZoom(amount: number, mousePos: Vector2) {
        let nextZoom: number = this._zoom + amount;
        let worldPos: Vector2 = this.screenToRealWorld(mousePos);

        let v: Vector2 = worldPos.minus(worldPos.minus(this.position).kDot(nextZoom).kDivide(this._zoom));
        
        this._zoom = nextZoom;
        this.position = v;
    }

    screenToRealWorld(pos: Vector2): Vector2 {
        let x = this.position.x - this._zoom/2 + (pos.x * this._zoom/window.innerWidth);
        let yZoom = this._zoom/(window.innerWidth/window.innerHeight);
        let y = this.position.y - yZoom/2 + (pos.y * yZoom/window.innerHeight);
        return new Vector2(x, y);
    }

    screenToWorldSize(obj: Vector2): Vector2 {
        let x = obj.x*this._zoom/window.innerWidth;
        let y = obj.y*this._zoom/window.innerWidth;
        return new Vector2(x, y);
    }

    worldToScreenSize(obj: Vector2): Vector2 {
        let x = (obj.x/this._zoom)*window.innerWidth;
        let y = (obj.y/this._zoom)*window.innerWidth;
        return new Vector2(x, y);
    }

    draw(){
        this._pageElements.innerHTML = "";

        let i = 1;
        this._universe.bodies.forEach((body) => {
            let aspectRatio: number = window.innerWidth/window.innerHeight;
            let camToBody: Vector2 = this.position.minus(body.position);
            let pixelSize: Vector2 = this.screenToWorldSize(new Vector2(body.radius, body.radius));

            if(Math.abs(camToBody.x)-pixelSize.x < this._zoom/2 && Math.abs(camToBody.y)-pixelSize.y < this._zoom/2/aspectRatio){
                this.drawPageElement(body, i++);
            }
        })
    }

    drawPageElement(body: Body, id: number) {
        let p = document.createElement("div");
        p.className = "dot";
        p.id = id + "";

        let radius: number = Math.max(1, this.worldToScreenSize(new Vector2(body.radius, body.radius)).x);
        p.style.height = radius+"px";
        p.style.width = radius+"px";
        p.style.borderRadius = radius+"px";
        p.style.transform = "translate(-50%, -50%)";

        if(this._colorHelp){
            let colorRate = Math.min(((body.mass)/1000000000000)**0.1, 1);
            let colorB = colorRate * 255;
            let colorG = colorRate*255;
            p.style.backgroundColor = `rgb(255, ${colorG}, ${colorB})`;
        }

        let screenPos: Vector2 = this.screenDistance(body.position);

        p.style.left = `${screenPos.x}px`;
        p.style.top = `${screenPos.y}px`;

        this._pageElements.appendChild(p);
    }

    screenDistance(position: Vector2): Vector2 {
        let centerDist: Vector2 = position.minus(this.position).kDot(window.innerWidth).kDivide(this._zoom);
        let windowVect: Vector2 = new Vector2(innerWidth/2, innerHeight/2);

        return centerDist.add(windowVect);
    }

    createPageElement(mass: number, radius: number, velocity: Vector2, position: Vector2){
        this._universe.push(new Body(mass, radius, velocity, position));
    }

    createPageElementWithBody(body: Body) {
        this.createPageElement(body.mass, body.radius, body.velocity, body.position);
    }

    gameLoop() {
        this._universe.updateUniverse();
        this.draw();
    }
}