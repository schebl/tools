import {Ruler, RulerDrawable, SelectionStore, Shape, ShapeDrawable} from "$lib/area/figures";
import {type ToolContext, ToolManager} from "$lib/area/tool";
import type {Drawable} from "$lib/area/ui";
import {Renderer} from "$lib/area/ui";

export class Editor {
    public totalArea = $derived(this.shapesArea());
    public readonly tools: ToolManager;
    public readonly selection: SelectionStore;
    public ruler = $state<Ruler | null>(null);
    private _canvas: HTMLCanvasElement | null = null;
    private _renderer: Renderer | null = null;
    private _running: boolean = false;
    private _rafID: number | null = null;

    public constructor() {
        this.tools = new ToolManager();
        this.selection = new SelectionStore();
    }

    private _shapes = $state<Shape[]>([]);

    public get shapes(): Shape[] {
        return this._shapes;
    }

    private get drawables(): Drawable[] {
        const shapes = this.shapes.map(s => new ShapeDrawable(s));
        const ruler = this.ruler ? [new RulerDrawable(this.ruler)] : [];
        return [...shapes, ...ruler];
    }

    public addShape(shape: Shape): void {
        this._shapes.push(shape);
        this.selection.selectShape(shape);
    }

    public removeShape(shape: Shape): void {
        this._shapes = this._shapes.filter(s => s.id !== shape.id);
        this.selection.selectShape(null);
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

    private shapesArea(): number {
        return this.shapes.map(s => s.area)
            .reduce((sum, area) => sum + area, 0);
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

        this._canvas.addEventListener("pointerdown", this.tools.handleEvent(this.createContext()));
        this._canvas.addEventListener("pointermove", this.tools.handleEvent(this.createContext()));
        this._canvas.addEventListener("pointerup", this.tools.handleEvent(this.createContext()));
    }

    private detachEventListeners() {
        if (!this._canvas) {
            return;
        }

        this._canvas.removeEventListener(
            "pointerdown",
            this.tools.handleEvent(this.createContext()),
        );
        this._canvas.removeEventListener(
            "pointermove",
            this.tools.handleEvent(this.createContext()),
        );
        this._canvas.removeEventListener(
            "pointerup",
            this.tools.handleEvent(this.createContext()),
        );
    }

    private createContext(): ToolContext {
        return {
            addShape: (shape) => this.addShape(shape),
            ruler: this.ruler,
            setRuler: (ruler: Ruler) => {
                this.ruler = ruler;
            },
            selection: this.selection,
        };
    }
}
