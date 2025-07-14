import {canvasConfig, Renderer} from "$lib/area/ui";
import {BezierPoint, distanceToBezierLine, SelectionStore} from "$lib/area/figures";
import {Point2D, Vector} from "$lib/area/geometry";
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

    create(): Tool {
        return new class implements Tool {
            public start(ctx: ToolContext): void {
                if (!ctx.editor.selection.shape) {
                    return;
                }

                for (let i = 0; i < ctx.editor.selection.shape.points.length; i++) {
                    const nextI = (i + 1) % ctx.editor.selection.shape.points.length;

                    const current = ctx.editor.selection.shape.points[i];
                    const next = ctx.editor.selection.shape.points[nextI];

                    if (distanceToBezierLine(ctx.click, current, next) < ADD_POINT_RADIUS) {
                        const point = BezierPoint.fromPoint(ctx.click);

                        ctx.editor.selection.shape.insertAt(nextI, point);
                        ctx.editor.selection.selectPoint(point);
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

    isApplicable(selection: SelectionStore): boolean {
        return !!selection.shape && !!selection.point;
    },

    create(): Tool {
        return new class implements Tool {
            private movingAnchor: Point2D | null = null;

            public start(ctx: ToolContext): void {
                if (ctx.editor.selection.point
                    && ctx.editor.selection.point.anchor.distanceTo(ctx.click)
                    <= POINT_SELECTION_RADIUS) {
                    this.movingAnchor = ctx.editor.selection.point.anchor;
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

    isApplicable(selection: SelectionStore): boolean {
        return !!selection.shape && !!selection.point;
    },

    create(): Tool {
        return new class implements Tool {
            private startPoint: Point2D | null = null;
            private movingControl: Vector | null = null;
            private oldControl: Vector | null = null;

            public start(ctx: ToolContext): void {
                if (!ctx.editor.selection.point) {
                    return;
                }

                this.startPoint = ctx.click;

                if (this.startPoint.distanceTo(ctx.editor.selection.point.handleInPoint())
                    <= POINT_SELECTION_RADIUS) {
                    this.movingControl = ctx.editor.selection.point.handleIn;
                }
                if (this.startPoint.distanceTo(ctx.editor.selection.point.handleOutPoint())
                    <= POINT_SELECTION_RADIUS) {
                    this.movingControl = ctx.editor.selection.point.handleOut;
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

    isApplicable(selection: SelectionStore): boolean {
        return !!selection.shape;
    },

    create(): Tool {
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

            public start({click}: ToolContext): void {
                this.startPoint = click;
            }

            public update(ctx: ToolContext): void {
                if (!this.startPoint) {
                    return;
                }

                if (!this.isDragging) {
                    if (Math.abs(ctx.click.x - this.startPoint.x) > DRAG_THRESHOLD
                        || Math.abs(ctx.click.y - this.startPoint.y) > DRAG_THRESHOLD) {
                        this.isDragging = true;
                    }
                }

                if (this.isDragging) {
                    this.endPoint = ctx.click;
                }
            }

            public end(ctx: ToolContext): void {
                if (!this.startPoint) {
                    return;
                }

                ctx.editor.selection.selectPoint(null);

                if (!this.isDragging) {
                    for (const point of ctx.editor.selection.shape?.points ?? []) {
                        if (point.anchor.distanceTo(ctx.click) <= POINT_SELECTION_RADIUS) {
                            ctx.editor.selection.selectPoint(point);
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
                    for (const point of ctx.editor.selection.shape?.points ?? []) {
                        if (point.anchor.x >= x0 && point.anchor.x <= x1 && point.anchor.y >= y0
                            && point.anchor.y <= y1) {
                            hits.push(point);
                        }
                    }

                    if (hits.length > 0) {
                        ctx.editor.selection.selectPoint(hits[0]);
                        // TODO: multi-select
                    }
                }
            }
        };
    },
};
