import {Renderer} from "$lib/area/canvas";
import {BezierPoint, Ruler, SelectionStore, Shape} from "$lib/area/figures";
import {Point2D, Vector} from "$lib/area/geometry";
import type {Tool, ToolContext, ToolDescriptor} from ".";

const ELLIPSE_CONTROL_DISTANCE = 0.55191502449;

export const setRulerTool: ToolDescriptor = {
    id: "set-ruler",
    label: "Set ruler",

    isApplicable(_: SelectionStore): boolean {
        return true;
    },

    create(): Tool {
        return new class implements Tool {
            private ruler: Ruler | null = null;

            public start(ctx: ToolContext): void {
                ctx.editor.ruler = new Ruler(
                    new Point2D(ctx.click.x, ctx.click.y),
                    new Point2D(ctx.click.x, ctx.click.y),
                );
                this.ruler = ctx.editor.ruler;
            }

            public update(ctx: ToolContext) {
                if (!this.ruler) {
                    return;
                }

                this.ruler.end = ctx.click;
            }

            public end({}: ToolContext) {
            }
        };
    },
};

export const createRectTool: ToolDescriptor = {
    id: "create-rect",
    label: "Create rectangle",

    isApplicable(_: SelectionStore): boolean {
        return true;
    },

    create(): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;
            private endPoint: Point2D | null = null;

            public renderOverlay(renderer: Renderer) {
                if (!this.startPoint || !this.endPoint) {
                    return;
                }

                const w = this.endPoint.x - this.startPoint.x;
                const h = this.endPoint.y - this.startPoint.y;

                renderer.drawBox(this.startPoint.x, this.startPoint.y, w, h);
            }

            public start({click}: ToolContext): void {
                this.startPoint = click;
            }

            public update({click}: ToolContext) {
                this.endPoint = click;
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

                ctx.editor.addShape(shape);
                ctx.editor.selection.selectShape(shape);
            }
        };
    },
};

export const createEllipseTool: ToolDescriptor = {
    id: "create-ellipse",
    label: "Create ellipse",

    isApplicable(_: SelectionStore): boolean {
        return true;
    },

    create(): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;
            private endPoint: Point2D | null = null;

            public renderOverlay(renderer: Renderer) {
                if (!this.startPoint || !this.endPoint) {
                    return;
                }

                const w = this.endPoint.x - this.startPoint.x;
                const h = this.endPoint.y - this.startPoint.y;

                renderer.drawEllipse(this.startPoint.x, this.startPoint.y, w, h);
            }

            public start({click}: ToolContext): void {
                this.startPoint = click;
            }

            public update({click}: ToolContext) {
                this.endPoint = click;
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

                ctx.editor.addShape(shape);
                ctx.editor.selection.selectShape(shape);
            }
        };
    },
};
