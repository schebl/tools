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
        let start: Point2D;

        return {
            start: ({event}: ToolContext): void => {
                start = new Point2D(event.offsetX, event.offsetY);
            },
            update({
                event,
                renderer,
            }: ToolContext) {
                if (!renderer) {
                    return;
                }

                const click = new Point2D(event.offsetX, event.offsetY);

                const w = click.x - start.x;
                const h = click.y - start.y;

                renderer.redraw();
                renderer.drawBox(start.x, start.y, w, h);
            },
            end({
                shapes,
                selection,
                event,
            }: ToolContext) {
                const click = new Point2D(event.offsetX, event.offsetY);

                const w = click.x - start.x;
                const h = click.y - start.y;

                const shape = new Shape();
                shape.addPoint(BezierPoint.fromXY(start.x, start.y));
                shape.addPoint(BezierPoint.fromXY(start.x + w, start.y));
                shape.addPoint(BezierPoint.fromXY(start.x + w, start.y + h));
                shape.addPoint(BezierPoint.fromXY(start.x, start.y + h));

                shapes.push(shape);
                selection.selectShape(shape);
            },
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
        let start: Point2D;

        return {
            start: ({event}: ToolContext): void => {
                start = new Point2D(event.offsetX, event.offsetY);
            },
            update({
                event,
                renderer,
            }: ToolContext) {
                if (!renderer) {
                    return;
                }

                const click = new Point2D(event.offsetX, event.offsetY);

                const w = click.x - start.x;
                const h = click.y - start.y;

                renderer.redraw();
                renderer.drawEllipse(start.x, start.y, w, h);
            },
            end({
                shapes,
                selection,
                event,
            }: ToolContext) {
                const click = new Point2D(event.offsetX, event.offsetY);

                const w = click.x - start.x;
                const h = click.y - start.y;

                const center = {
                    x: start.x + w / 2,
                    y: start.y + h / 2,
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
                addEllipseSegment(center.x, start.y, w, 0);
                addEllipseSegment(start.x + w, center.y, 0, h);
                addEllipseSegment(center.x, start.y + h, -w, 0);
                addEllipseSegment(start.x, center.y, 0, -h);

                shapes.push(shape);
                selection.selectShape(shape);
            },
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
        return {
            start: ({
                selection,
                event,
            }: ToolContext): void => {
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
            },
            update({}: ToolContext) {
            },
            end({}: ToolContext) {
            },
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
        let movingAnchor: Point2D;

        return {
            start: ({
                selection,
                event,
            }: ToolContext): void => {
                const click = new Point2D(event.offsetX, event.offsetY);

                if (selection.point && click.distanceToPoint(selection.point.anchor)
                    <= POINT_SELECTION_RADIUS) {
                    movingAnchor = selection.point.anchor;
                }
            },
            update({event}: ToolContext) {
                if (!movingAnchor) {
                    return;
                }

                movingAnchor.x = event.offsetX;
                movingAnchor.y = event.offsetY;
            },
            end({}: ToolContext) {
            },
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
        let start: Point2D;
        let movingControl: Vector;
        let oldControl: Vector;

        return {
            start: ({
                selection,
                event,
            }: ToolContext): void => {
                if (!selection.point) {
                    return;
                }

                start = new Point2D(event.offsetX, event.offsetY);

                if (start.distanceToPoint(selection.point.handleInPoint())
                    <= POINT_SELECTION_RADIUS) {
                    movingControl = selection.point.handleIn;
                }
                if (start.distanceToPoint(selection.point.handleOutPoint())
                    <= POINT_SELECTION_RADIUS) {
                    movingControl = selection.point.handleOut;
                }

                if (movingControl) {
                    oldControl = new Vector(movingControl.dx, movingControl.dy);
                }
            },
            update({event}: ToolContext) {
                if (!movingControl || !oldControl) {
                    return;
                }

                const click = new Point2D(event.offsetX, event.offsetY);
                const vec = start.vectorTo(click);

                movingControl.dx = oldControl.dx + vec.dx;
                movingControl.dy = oldControl.dy + vec.dy;
            },
            end({}: ToolContext) {
            },
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
        let start: Point2D;
        let isDragging = false;

        return {
            start: ({event}: ToolContext): void => {
                start = new Point2D(event.offsetX, event.offsetY);
            },
            update({
                event,
                renderer,
            }: ToolContext) {
                const hit = new Point2D(event.offsetX, event.offsetY);

                if (!isDragging) {
                    if (Math.abs(hit.x - start.x) > DRAG_THRESHOLD || Math.abs(hit.y - start.y)
                        > DRAG_THRESHOLD) {
                        isDragging = true;
                    }
                }

                if (isDragging && renderer) {
                    const w = hit.x - start.x;
                    const h = hit.y - start.y;

                    renderer.redraw();
                    renderer.drawSelectionBox(start.x, start.y, w, h);
                }
            },
            end({
                event,
                selection,
                renderer,
            }: ToolContext) {
                const end = new Point2D(event.offsetX, event.offsetY);

                selection.selectPoint(null);

                if (!isDragging) {
                    for (const point of selection.shape?.points ?? []) {
                        if (end.distanceToPoint(point.anchor) <= POINT_SELECTION_RADIUS) {
                            selection.selectPoint(point);
                            break;
                        }
                    }
                }

                if (isDragging) {
                    const x0 = Math.min(start.x, end.x);
                    const y0 = Math.min(start.y, end.y);
                    const x1 = Math.max(start.x, end.x);
                    const y1 = Math.max(start.y, end.y);

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
            },
        };
    },
};
