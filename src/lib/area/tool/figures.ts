import {BezierPoint, Shape, ShapeDrawable} from "$lib/area/figures";
import {Point2D, Vector} from "$lib/area/geometry";
import type {Tool, ToolContext, ToolDescriptor} from ".";

const ELLIPSE_CONTROL_DISTANCE = 0.55191502449;

export const createRectTool: ToolDescriptor = {
    id: "create-rect",
    label: "Create rectangle",

    isApplicable({}: ToolContext): boolean {
        return true;
    },

    create(): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;

            public start({click}: ToolContext): void {
                this.startPoint = click;
            }

            public update(ctx: ToolContext) {
                if (!this.startPoint || !ctx.renderer) {
                    return;
                }

                const w = ctx.click.x - this.startPoint.x;
                const h = ctx.click.y - this.startPoint.y;

                ctx.renderer.redraw(ctx.selection);
                ctx.renderer.drawBox(this.startPoint.x, this.startPoint.y, w, h);
            }

            public end(ctx: ToolContext) {
                if (!this.startPoint) {
                    return;
                }

                const w = ctx.click.x - this.startPoint.x;
                const h = ctx.click.y - this.startPoint.y;

                const shape = new Shape();
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x, this.startPoint.y));
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x + w, this.startPoint.y));
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x + w, this.startPoint.y + h));
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x, this.startPoint.y + h));

                ctx.shapes.push(shape);
                ctx.selection.selectShape(shape);
            }
        };
    },
};

export const createEllipseTool: ToolDescriptor = {
    id: "create-ellipse",
    label: "Create ellipse",

    isApplicable({}: ToolContext): boolean {
        return true;
    },

    create(): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;

            public start({event}: ToolContext): void {
                this.startPoint = new Point2D(event.offsetX, event.offsetY);
            }

            public update(ctx: ToolContext) {
                if (!this.startPoint || !ctx.renderer) {
                    return;
                }

                const w = ctx.click.x - this.startPoint.x;
                const h = ctx.click.y - this.startPoint.y;

                ctx.renderer.redraw(ctx.selection);
                ctx.renderer.drawEllipse(this.startPoint.x, this.startPoint.y, w, h);
            }

            public end(ctx: ToolContext) {
                if (!this.startPoint) {
                    return;
                }

                const w = ctx.click.x - this.startPoint.x;
                const h = ctx.click.y - this.startPoint.y;

                const center = {
                    x: this.startPoint.x + w / 2,
                    y: this.startPoint.y + h / 2,
                };

                const shape = new Shape();
                const addEllipseSegment = (
                    posX: number,
                    posY: number,
                    sizeX: number,
                    sizeY: number,
                ) => {
                    shape.addPoint(new BezierPoint(
                        new Point2D(posX, posY),
                        new Vector(
                            sizeX * -ELLIPSE_CONTROL_DISTANCE / 2,
                            sizeY * -ELLIPSE_CONTROL_DISTANCE / 2,
                        ),
                        new Vector(
                            sizeX * ELLIPSE_CONTROL_DISTANCE / 2,
                            sizeY * ELLIPSE_CONTROL_DISTANCE / 2,
                        ),
                    ));
                };
                addEllipseSegment(center.x, this.startPoint.y, w, 0);
                addEllipseSegment(this.startPoint.x + w, center.y, 0, h);
                addEllipseSegment(center.x, this.startPoint.y + h, -w, 0);
                addEllipseSegment(this.startPoint.x, center.y, 0, -h);

                ctx.shapes.push(shape);
                ctx.selection.selectShape(shape);
            }
        };
    },
};
