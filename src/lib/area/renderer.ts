import {BezierPoint, Point2D, SelectionStore, type Shape} from "$lib/area/shape.svelte";

const POINT_SIZE = 4;
const SELECTED_POINT_SIZE = 6;

const SELECTED_STYLE = "#ad2a4d";
const DEFAULT_STYLE = "#0a0a0a";

const LINE_DASH = [8, 4];

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private selection: SelectionStore;
    private readonly shapes: Shape[];

    public constructor(ctx: CanvasRenderingContext2D, selection: SelectionStore, shapes: Shape[]) {
        this.ctx = ctx;
        this.selection = selection;
        this.shapes = shapes;

        this.ctx.strokeStyle = DEFAULT_STYLE;
        this.ctx.fillStyle = DEFAULT_STYLE;
    }

    public redraw() {
        const canvas = this.ctx.canvas;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const shape of this.shapes) {
            this.drawShape(shape);
        }
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

    private drawShape(shape: Shape) {
        this.ctx.save();

        const isShapeSelected = this.selection.shape === shape;
        if (isShapeSelected) {
            this.ctx.strokeStyle = SELECTED_STYLE;
            this.ctx.fillStyle = SELECTED_STYLE;
        }

        this.ctx.beginPath();

        for (let i = 0; i < shape.points.length; i++) {
            const current = shape.points[i];
            const next = shape.points[(i + 1) % shape.points.length];

            if (i === 0) {
                this.ctx.moveTo(current.anchor.x, current.anchor.y);
            }

            this.drawPoint(current, isShapeSelected);
            this.ctx.bezierCurveTo(
                current.handleOut.x,
                current.handleOut.y,
                next.handleIn.x,
                next.handleIn.y,
                next.anchor.x,
                next.anchor.y,
            );
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    private drawPoint(point: BezierPoint, isParentSelected: boolean) {
        if (isParentSelected) {
            if (this.selection.point === point) {
                this.ctx.fillRect(
                    point.anchor.x - SELECTED_POINT_SIZE / 2,
                    point.anchor.y - SELECTED_POINT_SIZE / 2,
                    SELECTED_POINT_SIZE,
                    SELECTED_POINT_SIZE,
                );

                this.ctx.lineTo(point.handleIn.x, point.handleIn.y);
                this.ctx.fillRect(
                    point.handleIn.x - SELECTED_POINT_SIZE / 2,
                    point.handleIn.y - SELECTED_POINT_SIZE / 2,
                    SELECTED_POINT_SIZE,
                    SELECTED_POINT_SIZE,
                );

                this.ctx.moveTo(point.anchor.x, point.anchor.y);

                this.ctx.lineTo(point.handleOut.x, point.handleOut.y);
                this.ctx.fillRect(
                    point.handleOut.x - SELECTED_POINT_SIZE / 2,
                    point.handleOut.y - SELECTED_POINT_SIZE / 2,
                    SELECTED_POINT_SIZE,
                    SELECTED_POINT_SIZE,
                );

                this.ctx.moveTo(point.anchor.x, point.anchor.y);

                return;
            }

            this.ctx.fillRect(
                point.anchor.x - POINT_SIZE / 2,
                point.anchor.y - POINT_SIZE / 2,
                POINT_SIZE,
                POINT_SIZE,
            );
        }
    }
}