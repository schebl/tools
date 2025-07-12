import type {Drawable} from "$lib/area/canvas";
import {Renderer} from "$lib/area/canvas";
import {SelectionStore, ShapeDrawable, ShapeStore} from "$lib/area/figures";
import type {BaseToolContext} from "$lib/area/tool";
import {ToolManager} from "$lib/area/tool";

export class Editor {
    public renderer: Renderer | null = null;
    public shapes: ShapeStore = new ShapeStore();
    public toolManager: ToolManager = new ToolManager();
    public selection: SelectionStore = new SelectionStore();

    public get totalArea(): number {
        return this.shapes.all().map(s => s.area()).reduce((sum, area) => sum + area, 0);
    }

    public get toolCtx(): BaseToolContext {
        return {
            shapes: this.shapes.all(),
            selection: this.selection,
            renderer: this.renderer,
        };
    }

    private get drawables(): Drawable[] {
        return this.shapes.all().map(s => new ShapeDrawable(s));
    }

    public initRenderer(ctx: CanvasRenderingContext2D): void {
        this.renderer = new Renderer(ctx, this.drawables);
    }
}
