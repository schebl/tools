import type {Drawable} from "$lib/area/ui";
import {canvasConfig} from "$lib/area/ui";
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
                current.handleOut.x,
                current.handleOut.y,
                next.handleIn.x,
                next.handleIn.y,
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
        this.drawPointControl(ctx, point.handleIn, canvasConfig.SELECTED_POINT_SIZE);
        this.drawPointControl(ctx, point.handleOut, canvasConfig.SELECTED_POINT_SIZE);

        ctx.lineTo(point.handleIn.x, point.handleIn.y);
        ctx.moveTo(point.anchor.x, point.anchor.y);
        ctx.lineTo(point.handleOut.x, point.handleOut.y);
        ctx.moveTo(point.anchor.x, point.anchor.y);
    }

    private drawPointControl(ctx: CanvasRenderingContext2D, point: Point2D, size: number) {
        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
    }
}
