import {Point2D, Vector} from "$lib/area/geometry.svelte";
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

            public start({event}: ToolContext): void {
                this.startPoint = new Point2D(event.offsetX, event.offsetY);
            }

            public update({
                event,
                renderer,
            }: ToolContext) {
                if (!this.startPoint || !renderer) {
                    return;
                }

                const click = new Point2D(event.offsetX, event.offsetY);

                const w = click.x - this.startPoint.x;
                const h = click.y - this.startPoint.y;

                renderer.redraw();
                renderer.drawBox(this.startPoint.x, this.startPoint.y, w, h);
            }

            public end({
                shapes,
                selection,
                event,
            }: ToolContext) {
                if (!this.startPoint) {
                    return;
                }

                const click = new Point2D(event.offsetX, event.offsetY);

                const w = click.x - this.startPoint.x;
                const h = click.y - this.startPoint.y;

                const shape = new Shape();
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x, this.startPoint.y));
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x + w, this.startPoint.y));
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x + w, this.startPoint.y + h));
                shape.addPoint(BezierPoint.fromXY(this.startPoint.x, this.startPoint.y + h));

                shapes.push(shape);
                selection.selectShape(shape);
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

            public update({
                event,
                renderer,
            }: ToolContext) {
                if (!this.startPoint || !renderer) {
                    return;
                }

                const click = new Point2D(event.offsetX, event.offsetY);

                const w = click.x - this.startPoint.x;
                const h = click.y - this.startPoint.y;

                renderer.redraw();
                renderer.drawEllipse(this.startPoint.x, this.startPoint.y, w, h);
            }

            public end({
                shapes,
                selection,
                event,
            }: ToolContext) {
                if (!this.startPoint) {
                    return;
                }

                const click = new Point2D(event.offsetX, event.offsetY);

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

                shapes.push(shape);
                selection.selectShape(shape);
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
            public start({
                selection,
                event,
            }: ToolContext): void {
                if (!selection.shape) {
                    return;
                }

                const hit = BezierPoint.fromXY(event.offsetX, event.offsetY);

                for (let i = 0; i < selection.shape.points.length; i++) {
                    const nextI = (i + 1) % selection.shape.points.length;

                    const current = selection.shape.points[i];
                    const next = selection.shape.points[nextI];

                    if (hit.anchor.distanceToBezierLine(current, next) < ADD_POINT_RADIUS) {
                        selection.shape.insertAt(nextI, hit);
                        break;
                    }
                }

                selection.selectPoint(hit);
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

            public start({
                selection,
                event,
            }: ToolContext): void {
                const click = new Point2D(event.offsetX, event.offsetY);

                if (selection.point && selection.point.anchor.distanceTo(click)
                    <= POINT_SELECTION_RADIUS) {
                    this.movingAnchor = selection.point.anchor;
                }
            }

            public update({event}: ToolContext) {
                if (!this.movingAnchor) {
                    return;
                }

                this.movingAnchor.x = event.offsetX;
                this.movingAnchor.y = event.offsetY;
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

            public start({
                selection,
                event,
            }: ToolContext): void {
                if (!selection.point) {
                    return;
                }

                this.startPoint = new Point2D(event.offsetX, event.offsetY);

                if (this.startPoint.distanceTo(selection.point.handleInPoint())
                    <= POINT_SELECTION_RADIUS) {
                    this.movingControl = selection.point.handleIn;
                }
                if (this.startPoint.distanceTo(selection.point.handleOutPoint())
                    <= POINT_SELECTION_RADIUS) {
                    this.movingControl = selection.point.handleOut;
                }

                if (this.movingControl) {
                    this.oldControl = new Vector(this.movingControl.dx, this.movingControl.dy);
                }
            }

            public update({event}: ToolContext) {
                if (!this.startPoint || !this.movingControl || !this.oldControl) {
                    return;
                }

                const click = new Point2D(event.offsetX, event.offsetY);
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

            public update({
                event,
                renderer,
            }: ToolContext): void {
                if (!this.startPoint) {
                    return;
                }

                const hit = new Point2D(event.offsetX, event.offsetY);

                if (!this.isDragging) {
                    if (Math.abs(hit.x - this.startPoint.x) > DRAG_THRESHOLD || Math.abs(hit.y
                        - this.startPoint.y) > DRAG_THRESHOLD) {
                        this.isDragging = true;
                    }
                }

                if (this.isDragging && renderer) {
                    const w = hit.x - this.startPoint.x;
                    const h = hit.y - this.startPoint.y;

                    renderer.redraw();
                    renderer.drawSelectionBox(this.startPoint.x, this.startPoint.y, w, h);
                }
            }

            public end({
                event,
                selection,
                renderer,
            }: ToolContext): void {
                if (!this.startPoint) {
                    return;
                }

                const end = new Point2D(event.offsetX, event.offsetY);

                selection.selectPoint(null);

                if (!this.isDragging) {
                    for (const point of selection.shape?.points ?? []) {
                        if (point.anchor.distanceTo(end) <= POINT_SELECTION_RADIUS) {
                            selection.selectPoint(point);
                            break;
                        }
                    }
                }

                if (this.isDragging) {
                    const x0 = Math.min(this.startPoint.x, end.x);
                    const y0 = Math.min(this.startPoint.y, end.y);
                    const x1 = Math.max(this.startPoint.x, end.x);
                    const y1 = Math.max(this.startPoint.y, end.y);

                    const hits: BezierPoint[] = [];
                    for (const point of selection.shape?.points ?? []) {
                        if (point.anchor.x >= x0 && point.anchor.x <= x1 && point.anchor.y >= y0
                            && point.anchor.y <= y1) {
                            hits.push(point);
                        }
                    }

                    if (hits.length > 0) {
                        selection.selectPoint(hits[0]);
                        // TODO: multi-select
                    }
                }

                if (renderer) {
                    renderer.redraw();
                }
            }
        };
    },
};
