import type {SelectionStore} from "$lib/area/figures";
import {Point2D} from "$lib/area/geometry";
import type {Tool} from "$lib/area/tool";
import {canvasConfig} from ".";

export interface Drawable {
    draw(ctx: CanvasRenderingContext2D, selection: SelectionStore): void;
}

export class Renderer {
    private readonly ctx: CanvasRenderingContext2D;

    public constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;

        this.ctx.strokeStyle = canvasConfig.DEFAULT_STYLE;
        this.ctx.fillStyle = canvasConfig.DEFAULT_STYLE;
    }

    public redraw(
        drawables: Drawable[],
        selection: SelectionStore,
        activeTool: Tool | null = null,
    ) {
        this.clear();

        for (const drawable of drawables) {
            this.ctx.save();
            drawable.draw(this.ctx, selection);
            this.ctx.restore();
        }

        if (activeTool) {
            activeTool.renderOverlay?.(this);
        }
    }

    public drawSelectionBox(x: number, y: number, w: number, h: number) {
        this.ctx.save();
        this.ctx.setLineDash(canvasConfig.LINE_DASH);
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.restore();
    }

    public drawBox(x: number, y: number, w: number, h: number) {
        this.ctx.save();
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.restore();
    }

    public drawEllipse(x: number, y: number, w: number, h: number) {
        const center = new Point2D(x + w / 2, y + h / 2);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    private clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
