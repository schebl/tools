import {BezierPoint, distanceToBezierLine, SelectionStore} from "$lib/area/figures";
import {Point2D} from "$lib/area/geometry";
import {canvasConfig, Renderer} from "$lib/area/ui";
import type {Tool, ToolContext, ToolDescriptor} from ".";

const DRAG_THRESHOLD = 5;
const POINT_SELECTION_RADIUS = canvasConfig.POINT_SIZE;
const ADD_POINT_RADIUS = 10;

export const addPointTool: ToolDescriptor = {
    id: "add-point",
    label: "Add point",

    isApplicable(selection: SelectionStore): boolean {
        return !!selection.shape;
    },

    create(ctx: ToolContext): Tool {
        return new class implements Tool {
            public start(click: Point2D) {
                if (!ctx.selection.shape) {
                    return;
                }

                for (let i = 0; i < ctx.selection.shape.points.length; i++) {
                    const nextI = (i + 1) % ctx.selection.shape.points.length;

                    const current = ctx.selection.shape.points[i];
                    const next = ctx.selection.shape.points[nextI];

                    if (distanceToBezierLine(click, current, next) < ADD_POINT_RADIUS) {
                        const point = BezierPoint.fromPoint(click);

                        ctx.selection.shape.insertAt(nextI, point);
                        ctx.selection.selectPoint(point);
                        break;
                    }
                }
            }

            public update(_: Point2D) {
            }

            public end(_: Point2D) {
            }
        };
    },
};

export const controlManipulatorTool: ToolDescriptor = {
    id: "control-manipulator",
    label: "Control point manipulator",

    isApplicable(selection: SelectionStore): boolean {
        return !!selection.shape && !!selection.point;
    },

    create(ctx: ToolContext): Tool {
        return new class implements Tool {
            private moving: "handleIn" | "handleOut" | null = null;

            public start(click: Point2D) {
                if (!ctx.selection.point) {
                    return;
                }

                if (click.distanceTo(ctx.selection.point.handleIn) <= POINT_SELECTION_RADIUS) {
                    this.moving = "handleIn";
                    return;
                }
                if (click.distanceTo(ctx.selection.point.handleOut) <= POINT_SELECTION_RADIUS) {
                    this.moving = "handleOut";
                    return;
                }

                // Reset controls
                if (click.distanceTo(ctx.selection.point.anchor) <= POINT_SELECTION_RADIUS) {
                    ctx.selection.point.handleIn = ctx.selection.point.anchor;
                    ctx.selection.point.handleOut = ctx.selection.point.anchor;
                }
            }

            public update(click: Point2D) {
                if (!this.moving || !ctx.selection.point) {
                    return;
                }

                ctx.selection.point[this.moving] = click;
            }

            public end(_: Point2D) {
            }
        };
    },
};

export const pointManipulatorTool: ToolDescriptor = {
    id: "point-manipulator",
    label: "Point manipulator",

    isApplicable(selection: SelectionStore): boolean {
        return !!selection.shape;
    },

    create(ctx: ToolContext): Tool {
        return new class implements Tool {
            private movingPoint: BezierPoint | null = null;

            private selectionStart: Point2D | null = null;
            private selectionEnd: Point2D | null = null;
            private isDragging = false;

            private mode: "move" | "select" = "move";

            public renderOverlay(renderer: Renderer) {
                if (!this.isDragging || !this.selectionStart || !this.selectionEnd) {
                    return;
                }

                const w = this.selectionEnd.x - this.selectionStart.x;
                const h = this.selectionEnd.y - this.selectionStart.y;

                renderer.drawSelectionBox(this.selectionStart.x, this.selectionStart.y, w, h);
            }

            public start(click: Point2D) {
                if (ctx.selection.point && ctx.selection.point.anchor.distanceTo(click)
                    <= POINT_SELECTION_RADIUS) {
                    this.movingPoint = ctx.selection.point;
                    return;
                }

                this.selectionStart = click;
                this.mode = "select";
            }

            public update(click: Point2D) {
                if (this.mode === "move" && this.movingPoint) {
                    this.movingPoint.anchor = click;
                    return;
                }

                if (this.mode === "select" && this.selectionStart) {
                    if (!this.isDragging) {
                        if (Math.abs(click.x - this.selectionStart.x) > DRAG_THRESHOLD || Math.abs(
                            click.y - this.selectionStart.y) > DRAG_THRESHOLD) {
                            this.isDragging = true;
                        }
                    }

                    if (this.isDragging) {
                        this.selectionEnd = click;
                    }
                }
            }

            public end(click: Point2D) {
                if (this.mode === "select" && this.selectionStart) {
                    if (!this.isDragging) {
                        for (const point of ctx.selection.shape?.points ?? []) {
                            if (point.anchor.distanceTo(click) <= POINT_SELECTION_RADIUS) {
                                ctx.selection.selectPoint(point);
                                return;
                            }
                        }
                    }

                    if (this.isDragging) {
                        const x0 = Math.min(this.selectionStart.x, click.x);
                        const y0 = Math.min(this.selectionStart.y, click.y);
                        const x1 = Math.max(this.selectionStart.x, click.x);
                        const y1 = Math.max(this.selectionStart.y, click.y);

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
                        return;
                    }

                    ctx.selection.selectPoint(null);
                }
            }
        };
    },
};
