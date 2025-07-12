import {Point2D} from "$lib/area/geometry.svelte";
import {BezierPoint, SelectionStore, type Shape} from "$lib/area/shape.svelte";

const POINT_SIZE = 4;
const SELECTED_POINT_SIZE = 6;

const SELECTED_STYLE = "#ad2a4d";
const DEFAULT_STYLE = "#0a0a0a";

const LINE_DASH = [8, 4];

export interface Drawable {
    draw(ctx: CanvasRenderingContext2D, selection: SelectionStore): void;
}

export class ShapeDrawable implements Drawable {
    private readonly shape: Shape;

    public constructor(shape: Shape) {
        this.shape = shape;
    }

    public draw(ctx: CanvasRenderingContext2D, selection: SelectionStore) {
        if (selection.isSelected(this.shape)) {
            ctx.strokeStyle = SELECTED_STYLE;
            ctx.fillStyle = SELECTED_STYLE;
        }

        ctx.beginPath();

        for (let i = 0; i < this.shape.points.length; i++) {
            const current = this.shape.points[i];
            const next = this.shape.points[(i + 1) % this.shape.points.length];

            if (i === 0) {
                ctx.moveTo(current.anchor.x, current.anchor.y);
            }

            this.drawPoint(ctx, selection, current);
            ctx.bezierCurveTo(
                current.handleOutPoint().x,
                current.handleOutPoint().y,
                next.handleInPoint().x,
                next.handleInPoint().y,
                next.anchor.x,
                next.anchor.y,
            );
        }

        ctx.stroke();
    }

    private drawPoint(
        ctx: CanvasRenderingContext2D,
        selection: SelectionStore,
        point: BezierPoint,
    ) {
        if (!selection.isSelected(this.shape)) {
            return;
        }

        if (!selection.isSelected(this.shape, point)) {
            this.drawPointControl(ctx, point.anchor, POINT_SIZE);
            return;
        }

        this.drawPointControl(ctx, point.anchor, SELECTED_POINT_SIZE);
        this.drawPointControl(ctx, point.handleInPoint(), SELECTED_POINT_SIZE);
        this.drawPointControl(ctx, point.handleOutPoint(), SELECTED_POINT_SIZE);

        ctx.lineTo(point.handleInPoint().x, point.handleInPoint().y);
        ctx.moveTo(point.anchor.x, point.anchor.y);
        ctx.lineTo(point.handleOutPoint().x, point.handleOutPoint().y);
        ctx.moveTo(point.anchor.x, point.anchor.y);
    }

    private drawPointControl(ctx: CanvasRenderingContext2D, point: Point2D, size: number) {
        ctx.fillRect(
            point.x - size / 2,
            point.y - size / 2,
            size,
            size,
        );
    }
}

export class Renderer {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly drawables: Drawable[];

    public constructor(ctx: CanvasRenderingContext2D, drawables: Drawable[]) {
        this.ctx = ctx;
        this.drawables = drawables;

        this.ctx.strokeStyle = DEFAULT_STYLE;
        this.ctx.fillStyle = DEFAULT_STYLE;
    }

    public redraw(selection: SelectionStore) {
        const canvas = this.ctx.canvas;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const drawable of this.drawables) {
            this.ctx.save();
            drawable.draw(this.ctx, selection);
            this.ctx.restore();
        }
    }

    public addDrawer(drawer: Drawable): void {
        this.drawables.push(drawer);
    }

    public drawSelectionBox(x: number, y: number, w: number, h: number) {
        this.ctx.save();
        this.ctx.setLineDash(LINE_DASH);
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
}
