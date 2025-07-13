import type {Drawable} from "$lib/area/canvas";
import {Renderer} from "$lib/area/canvas";
import {Ruler, RulerDrawable, SelectionStore, Shape, ShapeDrawable} from "$lib/area/figures";
import {ToolManager} from "$lib/area/tool";

export class Editor {
    public readonly tools: ToolManager;
    public readonly selection: SelectionStore;
    public ruler: Ruler | null = null;
    private readonly _shapes = $state<Shape[]>([]);
    private _canvas: HTMLCanvasElement | null = null;
    private _renderer: Renderer | null = null;
    private _running: boolean = false;
    private _rafID: number | null = null;

    public constructor() {
        this.tools = new ToolManager();
        this.selection = new SelectionStore();
    }

    public get shapes(): Shape[] {
        return this._shapes;
    }

    public get totalArea(): number {
        return this.shapes.map(s => s.area()).reduce((sum, area) => sum + area, 0);
    }

    private get drawables(): Drawable[] {
        const shapes = this.shapes.map(s => new ShapeDrawable(s));
        const ruler = this.ruler ? [new RulerDrawable(this.ruler)] : [];
        return [...shapes, ...ruler];
    }

    public addShape(shape: Shape): void {
        this._shapes.push(shape);
    }

    public init(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to get canvas drawing context");
        }

        this._canvas = canvas;
        this._renderer = new Renderer(ctx);

        this.attachEventListeners();
        this.start();
    }

    public destroy() {
        this.stop();
        this.detachEventListeners();
    }

    private start(): void {
        this._running = true;

        const loop = () => {
            if (!this._running) {
                return;
            }

            this.render();

            this._rafID = requestAnimationFrame(loop);
        };
        loop();
    }

    private render(): void {
        this._renderer?.redraw(this.drawables, this.selection, this.tools.active);
    }

    private stop(): void {
        if (!this._running) {
            return;
        }
        this._running = false;

        if (this._rafID !== null) {
            cancelAnimationFrame(this._rafID);
            this._rafID = null;
        }
    }

    private attachEventListeners() {
        if (!this._canvas) {
            return;
        }

        this._canvas.addEventListener("pointerdown", this.tools.handleEvent(this));
        window.addEventListener("pointermove", this.tools.handleEvent(this));
        window.addEventListener("pointerup", this.tools.handleEvent(this));
    }

    private detachEventListeners() {
        this._canvas?.removeEventListener("pointerdown", this.tools.handleEvent(this));
        window.removeEventListener("pointermove", this.tools.handleEvent(this));
        window.removeEventListener("pointerup", this.tools.handleEvent(this));
    }
}
