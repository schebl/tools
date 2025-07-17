import {BezierPoint, Ruler, SelectionStore, Shape} from "$lib/area/figures";
import {Point2D, Vector} from "$lib/area/geometry";
import {Renderer} from "$lib/area/ui";
import type {Tool, ToolContext, ToolDescriptor} from ".";

const ELLIPSE_CONTROL_DISTANCE = 0.55191502449;

export const setRulerTool: ToolDescriptor = {
    id: "set-ruler",
    label: "Set ruler",

    isApplicable(_: SelectionStore): boolean {
        return true;
    },

    create(ctx: ToolContext): Tool {
        return new class implements Tool {
            private ruler: Ruler | null = null;

            public start(click: Point2D) {
                this.ruler = new Ruler(
                    new Point2D(click.x, click.y),
                    new Point2D(click.x, click.y),
                );
                ctx.setRuler(this.ruler);
            }

            public update(click: Point2D) {
                if (!this.ruler) {
                    return;
                }

                this.ruler.end = click;
            }

            public end(_: Point2D) {
            }
        };
    },
};

export const CreateLineTool: ToolDescriptor = {
    id: "create-line",
    label: "Create line",

    isApplicable(_: SelectionStore): boolean {
        return true;
    },

    create(ctx: ToolContext): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;
            private endPoint: Point2D | null = null;

            public renderOverlay(renderer: Renderer) {
                if (!this.startPoint || !this.endPoint) {
                    return;
                }

                renderer.drawLine(this.startPoint, this.endPoint);
            }

            public start(click: Point2D) {
                this.startPoint = click;
            }

            public update(click: Point2D) {
                this.endPoint = click;
            }

            public end(click: Point2D) {
                if (!this.startPoint) {
                    return;
                }

                const shape = new Shape();
                shape.addPoint(BezierPoint.fromPoint(this.startPoint));
                shape.addPoint(BezierPoint.fromPoint(click));

                ctx.addShape(shape);
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

    create(ctx: ToolContext): Tool {
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

            public start(click: Point2D) {
                this.startPoint = click;
            }

            public update(click: Point2D) {
                this.endPoint = click;
            }

            public end(click: Point2D) {
                if (!this.startPoint) {
                    return;
                }

                const w = click.x - this.startPoint.x;
                const h = click.y - this.startPoint.y;

                const shape = new Shape();
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x, this.startPoint.y));
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x + w, this.startPoint.y));
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x + w, this.startPoint.y + h));
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x, this.startPoint.y + h));

                ctx.addShape(shape);
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

    create(ctx: ToolContext): Tool {
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

            public start(click: Point2D) {
                this.startPoint = click;
            }

            public update(click: Point2D) {
                this.endPoint = click;
            }

            public end(click: Point2D) {
                if (!this.startPoint) {
                    return;
                }

                const w = click.x - this.startPoint.x;
                const h = click.y - this.startPoint.y;

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

                ctx.addShape(shape);
            }
        };
    },
};
