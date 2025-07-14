import {BezierPoint, distanceToBezierLine, SelectionStore} from "$lib/area/figures";
import {Point2D, Vector} from "$lib/area/geometry";
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

export const moveAnchorTool: ToolDescriptor = {
    id: "move-anchor",
    label: "Move anchor",

    isApplicable(selection: SelectionStore): boolean {
        return !!selection.shape && !!selection.point;
    },

    create(ctx: ToolContext): Tool {
        return new class implements Tool {
            private movingAnchor: Point2D | null = null;

            public start(click: Point2D) {
                if (ctx.selection.point
                    && ctx.selection.point.anchor.distanceTo(click)
                    <= POINT_SELECTION_RADIUS) {
                    this.movingAnchor = ctx.selection.point.anchor;
                }
            }

            public update(click: Point2D) {
                if (!this.movingAnchor) {
                    return;
                }

                this.movingAnchor.x = click.x;
                this.movingAnchor.y = click.y;
            }

            public end(_: Point2D) {
            }
        };
    },
};

export const moveControlTool: ToolDescriptor = {
    id: "move-control",
    label: "Move control",

    isApplicable(selection: SelectionStore): boolean {
        return !!selection.shape && !!selection.point;
    },

    create(ctx: ToolContext): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;
            private movingControl: Vector | null = null;
            private oldControl: Vector | null = null;

            public start(click: Point2D) {
                if (!ctx.selection.point) {
                    return;
                }

                this.startPoint = click;

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

            public update(click: Point2D) {
                if (!this.startPoint || !this.movingControl || !this.oldControl) {
                    return;
                }

                const clickOffset = this.startPoint.vectorTo(click).add(this.oldControl);

                this.movingControl.dx = clickOffset.dx;
                this.movingControl.dy = clickOffset.dy;
            }

            public end(_: Point2D) {
            }
        };
    },
};

export const selectPointTool: ToolDescriptor = {
    id: "select-point",
    label: "Select point",

    isApplicable(selection: SelectionStore): boolean {
        return !!selection.shape;
    },

    create(ctx: ToolContext): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;
            private endPoint: Point2D | null = null;
            private isDragging = false;

            public renderOverlay(renderer: Renderer) {
                if (!this.isDragging || !this.startPoint || !this.endPoint) {
                    return;
                }

                const w = this.endPoint.x - this.startPoint.x;
                const h = this.endPoint.y - this.startPoint.y;

                renderer.drawSelectionBox(this.startPoint.x, this.startPoint.y, w, h);
            }

            public start(click: Point2D) {
                this.startPoint = click;
            }

            public update(click: Point2D) {
                if (!this.startPoint) {
                    return;
                }

                if (!this.isDragging) {
                    if (Math.abs(click.x - this.startPoint.x) > DRAG_THRESHOLD
                        || Math.abs(click.y - this.startPoint.y) > DRAG_THRESHOLD) {
                        this.isDragging = true;
                    }
                }

                if (this.isDragging) {
                    this.endPoint = click;
                }
            }

            public end(click: Point2D) {
                if (!this.startPoint) {
                    return;
                }

                ctx.selection.selectPoint(null);

                if (!this.isDragging) {
                    for (const point of ctx.selection.shape?.points ?? []) {
                        if (point.anchor.distanceTo(click) <= POINT_SELECTION_RADIUS) {
                            ctx.selection.selectPoint(point);
                            break;
                        }
                    }
                }

                if (this.isDragging) {
                    const x0 = Math.min(this.startPoint.x, click.x);
                    const y0 = Math.min(this.startPoint.y, click.y);
                    const x1 = Math.max(this.startPoint.x, click.x);
                    const y1 = Math.max(this.startPoint.y, click.y);

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
            }
        };
    },
};
