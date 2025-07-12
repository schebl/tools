import type {Drawable} from "$lib/area/canvas";
import {canvasConfig} from "$lib/area/canvas";
import {Point2D} from "$lib/area/geometry";
import type {Shape} from ".";
import {BezierPoint, SelectionStore} from ".";

export class ShapeDrawable implements Drawable {
    private readonly shape: Shape;

    public constructor(shape: Shape) {
        this.shape = shape;
    }

    public draw(ctx: CanvasRenderingContext2D, selection: SelectionStore) {
        if (selection.isSelected(this.shape)) {
            ctx.strokeStyle = canvasConfig.SELECTED_STYLE;
            ctx.fillStyle = canvasConfig.SELECTED_STYLE;
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
            this.drawPointControl(ctx, point.anchor, canvasConfig.POINT_SIZE);
            return;
        }

        this.drawPointControl(ctx, point.anchor, canvasConfig.SELECTED_POINT_SIZE);
        this.drawPointControl(ctx, point.handleInPoint(), canvasConfig.SELECTED_POINT_SIZE);
        this.drawPointControl(ctx, point.handleOutPoint(), canvasConfig.SELECTED_POINT_SIZE);

        ctx.lineTo(point.handleInPoint().x, point.handleInPoint().y);
        ctx.moveTo(point.anchor.x, point.anchor.y);
        ctx.lineTo(point.handleOutPoint().x, point.handleOutPoint().y);
        ctx.moveTo(point.anchor.x, point.anchor.y);
    }

    private drawPointControl(ctx: CanvasRenderingContext2D, point: Point2D, size: number) {
        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
    }
}
