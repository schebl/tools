import {Point2D} from "$lib/area/geometry";
import type {Drawable} from "$lib/area/ui";
import {canvasConfig} from "$lib/area/ui";
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

        this.shape.lines.forEach((line, i) => {
            if (i === 0) {
                ctx.moveTo(line.start.anchor.x, line.start.anchor.y);
            }

            this.drawPoint(ctx, selection, line.start);
            ctx.bezierCurveTo(
                line.start.handleOut.x,
                line.start.handleOut.y,
                line.end.handleIn.x,
                line.end.handleIn.y,
                line.end.anchor.x,
                line.end.anchor.y,
            );
        });

        if (!this.shape.closed) {
            this.drawPoint(ctx, selection, this.shape.points[1]);
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
