import {Point2D, Vector} from "$lib/area/geometry.svelte";
import {ShapeDrawable} from "$lib/area/renderer";
import {BezierPoint, Shape} from "$lib/area/shape.svelte";
import type {Tool, ToolContext, ToolDescriptor} from "$lib/area/tool.svelte";

const DRAG_THRESHOLD = 5;
const POINT_SELECTION_RADIUS = 5;
const ADD_POINT_RADIUS = 10;

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

                const click = new Point2D(ctx.event.offsetX, ctx.event.offsetY);

                const w = click.x - this.startPoint.x;
                const h = click.y - this.startPoint.y;

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
                ctx.renderer?.addDrawer(new ShapeDrawable(shape));
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
                ctx.renderer?.addDrawer(new ShapeDrawable(shape));
            }
        };
    },
};

export const addPointTool: ToolDescriptor = {
    id: "add-point",
    label: "Add point",

    isApplicable({selection}: ToolContext): boolean {
        return !!selection.shape;
    },

    create(): Tool {
        return new class implements Tool {
            public start(ctx: ToolContext): void {
                if (!ctx.selection.shape) {
                    return;
                }

                for (let i = 0; i < ctx.selection.shape.points.length; i++) {
                    const nextI = (i + 1) % ctx.selection.shape.points.length;

                    const current = ctx.selection.shape.points[i];
                    const next = ctx.selection.shape.points[nextI];

                    if (ctx.click.distanceToBezierLine(current, next) < ADD_POINT_RADIUS) {
                        const point = BezierPoint.fromPoint(ctx.click);

                        ctx.selection.shape.insertAt(nextI, point);
                        ctx.selection.selectPoint(point);
                        break;
                    }
                }
            }

            public update({}: ToolContext) {
            }

            public end({}: ToolContext) {
            }
        };
    },
};

export const moveAnchorTool: ToolDescriptor = {
    id: "move-anchor",
    label: "Move anchor",

    isApplicable({selection}: ToolContext): boolean {
        return !!selection.shape && !!selection.point;
    },

    create(): Tool {
        return new class implements Tool {
            private movingAnchor: Point2D | null = null;

            public start(ctx: ToolContext): void {
                if (ctx.selection.point && ctx.selection.point.anchor.distanceTo(ctx.click)
                    <= POINT_SELECTION_RADIUS) {
                    this.movingAnchor = ctx.selection.point.anchor;
                }
            }

            public update({click}: ToolContext) {
                if (!this.movingAnchor) {
                    return;
                }

                this.movingAnchor.x = click.x;
                this.movingAnchor.y = click.y;
            }

            public end({}: ToolContext) {
            }
        };
    },
};

export const moveControlTool: ToolDescriptor = {
    id: "move-control",
    label: "Move control",

    isApplicable({selection}: ToolContext): boolean {
        return !!selection.shape && !!selection.point;
    },

    create(): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;
            private movingControl: Vector | null = null;
            private oldControl: Vector | null = null;

            public start(ctx: ToolContext): void {
                if (!ctx.selection.point) {
                    return;
                }

                this.startPoint = ctx.click;

                if (this.startPoint.distanceTo(ctx.selection.point.handleInPoint())
                    <= POINT_SELECTION_RADIUS) {
                    this.movingControl = ctx.selection.point.handleIn;
                }
                if (this.startPoint.distanceTo(ctx.selection.point.handleOutPoint())
                    <= POINT_SELECTION_RADIUS) {
                    this.movingControl = ctx.selection.point.handleOut;
                }

                if (this.movingControl) {
                    this.oldControl = new Vector(this.movingControl.dx, this.movingControl.dy);
                }
            }

            public update({click}: ToolContext) {
                if (!this.startPoint || !this.movingControl || !this.oldControl) {
                    return;
                }

                const clickOffset = this.startPoint.vectorTo(click).add(this.oldControl);

                this.movingControl.dx = clickOffset.dx;
                this.movingControl.dy = clickOffset.dy;
            }

            public end({}: ToolContext) {
            }
        };
    },
};

export const selectPointTool: ToolDescriptor = {
    id: "select-point",
    label: "Select point",

    isApplicable({selection}: ToolContext): boolean {
        return !!selection.shape;
    },

    create(): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;
            private isDragging = false;

            public start({event}: ToolContext): void {
                this.startPoint = new Point2D(event.offsetX, event.offsetY);
            }

            public update(ctx: ToolContext): void {
                if (!this.startPoint) {
                    return;
                }

                if (!this.isDragging) {
                    if (Math.abs(ctx.click.x - this.startPoint.x) > DRAG_THRESHOLD
                        || Math.abs(ctx.click.y
                            - this.startPoint.y) > DRAG_THRESHOLD) {
                        this.isDragging = true;
                    }
                }

                if (this.isDragging && ctx.renderer) {
                    const w = ctx.click.x - this.startPoint.x;
                    const h = ctx.click.y - this.startPoint.y;

                    ctx.renderer.redraw(ctx.selection);
                    ctx.renderer.drawSelectionBox(this.startPoint.x, this.startPoint.y, w, h);
                }
            }

            public end(ctx: ToolContext): void {
                if (!this.startPoint) {
                    return;
                }

                ctx.selection.selectPoint(null);

                if (!this.isDragging) {
                    for (const point of ctx.selection.shape?.points ?? []) {
                        if (point.anchor.distanceTo(ctx.click) <= POINT_SELECTION_RADIUS) {
                            ctx.selection.selectPoint(point);
                            break;
                        }
                    }
                }

                if (this.isDragging) {
                    const x0 = Math.min(this.startPoint.x, ctx.click.x);
                    const y0 = Math.min(this.startPoint.y, ctx.click.y);
                    const x1 = Math.max(this.startPoint.x, ctx.click.x);
                    const y1 = Math.max(this.startPoint.y, ctx.click.y);

                    const hits: BezierPoint[] = [];
                    for (const point of ctx.selection.shape?.points ?? []) {
                        if (point.anchor.x >= x0 && point.anchor.x <= x1 && point.anchor.y >= y0
                            && point.anchor.y <= y1) {
                            hits.push(point);
                        }
                    }

                    if (hits.length > 0) {
                        ctx.selection.selectPoint(hits[0]);
                        // TODO: multi-select
                    }
                }

                if (ctx.renderer) {
                    ctx.renderer.redraw(ctx.selection);
                }
            }
        };
    },
};
