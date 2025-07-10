import {Point2D, SelectionStore, type Shape} from "$lib/area/shape.svelte";

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
                this.ctx.moveTo(current.x, current.y);
            }
            this.ctx.lineTo(next.x, next.y);

            this.drawPoint(current, isShapeSelected);
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    private drawPoint(point: Point2D, isParentSelected: boolean) {
        if (isParentSelected) {
            if (this.selection.point === point) {
                this.ctx.fillRect(
                    point.x - SELECTED_POINT_SIZE / 2,
                    point.y - SELECTED_POINT_SIZE / 2,
                    SELECTED_POINT_SIZE,
                    SELECTED_POINT_SIZE,
                );
                return;
            }

            this.ctx.fillRect(
                point.x - POINT_SIZE / 2,
                point.y - POINT_SIZE / 2,
                POINT_SIZE,
                POINT_SIZE,
            );
        }
    }
}