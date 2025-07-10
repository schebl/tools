import {Point2D, Shape} from "$lib/area/shape.svelte";
import type {Tool, ToolContext, ToolDescriptor} from "$lib/area/tool.svelte";

const DRAG_THRESHOLD = 5;
const POINT_SELECTION_RADIUS = 5;
const ADD_POINT_RADIUS = 10;

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
                shape.addPoint(new Point2D(start.x, start.y));
                shape.addPoint(new Point2D(start.x + w, start.y));
                shape.addPoint(new Point2D(start.x + w, start.y + h));
                shape.addPoint(new Point2D(start.x, start.y + h));

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

                const hit = new Point2D(event.offsetX, event.offsetY);

                for (let i = 0; i < selection.shape.points.length; i++) {
                    const nextI = (i + 1) % selection.shape.points.length;

                    const current = selection.shape.points[i];
                    const next = selection.shape.points[nextI];

                    if (hit.distanceToLine(current, next) < ADD_POINT_RADIUS) {
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

export const movePointTool: ToolDescriptor = {
    id: "move-point",
    label: "Move point",

    isApplicable({selection}: ToolContext): boolean {
        return !!selection.shape && !!selection.point;
    },

    create(): Tool {
        let movingPoint: Point2D;

        return {
            start: ({
                selection,
                event,
            }: ToolContext): void => {
                if (selection.point && didHit(
                    selection.point,
                    new Point2D(event.offsetX, event.offsetY),
                )) {
                    movingPoint = selection.point;
                }
            },
            update({event}: ToolContext) {
                if (!movingPoint) {
                    return;
                }

                movingPoint.x = event.offsetX;
                movingPoint.y = event.offsetY;
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
                        if (didHit(point, end)) {
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

                    const hits: Point2D[] = [];
                    for (const point of selection.shape?.points ?? []) {
                        if (point.x >= x0 && point.x <= x1 && point.y >= y0 && point.y <= y1) {
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

function didHit(point: Point2D, hit: Point2D): boolean {
    const dx = point.x - hit.x;
    const dy = point.y - hit.y;

    return Math.hypot(dx, dy) <= POINT_SELECTION_RADIUS;
}
