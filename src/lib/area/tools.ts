import type {Point2D} from "$lib/area/shape.svelte";
import type {Tool, ToolContext, ToolDescriptor} from "$lib/area/tool.svelte";

const DRAG_THRESHOLD = 5;
const POINT_SELECTION_RADIUS = 5;

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
                selection.shape?.points.push({
                    x: event.offsetX,
                    y: event.offsetY,
                });
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
                for (const point of selection.shape?.points ?? []) {
                    const hit = {
                        x: event.offsetX,
                        y: event.offsetY,
                    };

                    if (didHit(point, hit)) {
                        movingPoint = point;
                        // TODO: shouldn't move unselected point
                        selection.selectPoint(point);
                    }
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
            start: ({
                event,
            }: ToolContext): void => {
                start = {
                    x: event.offsetX,
                    y: event.offsetY,
                };
            },
            update({
                event,
                renderer,
            }: ToolContext) {
                const x = event.offsetX;
                const y = event.offsetY;

                if (!isDragging) {
                    if (Math.abs(x - start.x) > DRAG_THRESHOLD || Math.abs(y - start.y)
                        > DRAG_THRESHOLD) {
                        isDragging = true;
                    }
                }

                if (isDragging && renderer) {
                    const w = x - start.x;
                    const h = y - start.y;

                    renderer.redraw();
                    renderer.drawSelectionBox(start.x, start.y, w, h);
                }
            },
            end({
                event,
                selection,
                renderer,
            }: ToolContext) {
                const end = {
                    x: event.offsetX,
                    y: event.offsetY,
                };

                selection.point = null;

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
