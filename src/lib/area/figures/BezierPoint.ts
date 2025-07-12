import {Point2D, Vector} from "$lib/area/geometry";

export class BezierPoint {
    public anchor: Point2D;
    public handleOut: Vector;
    public handleIn: Vector;

    public constructor(position: Point2D, handleIn: Vector, handleOut: Vector) {
        this.anchor = position;
        this.handleIn = handleIn;
        this.handleOut = handleOut;
    }

    public static fromXY(x: number, y: number): BezierPoint {
        return new BezierPoint(new Point2D(x, y), new Vector(0, 0), new Vector(0, 0));
    }

    public static fromPoint(point: Point2D): BezierPoint {
        return this.fromXY(point.x, point.y);
    }

    public handleOutPoint(): Point2D {
        const handleOutPoint = this.anchor.add(this.handleOut);
        return new Point2D(handleOutPoint.x, handleOutPoint.y);
    }

    public handleInPoint(): Point2D {
        const handleInPoint = this.anchor.add(this.handleIn);
        return new Point2D(handleInPoint.x, handleInPoint.y);
    }
}

export function distanceToBezierLine(
    point: Point2D,
    lineStart: BezierPoint,
    lineEnd: BezierPoint,
    steps: number = 1000,
): number {
    let minDistSquare = Infinity;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const bezier = bezierAt(t, lineStart, lineEnd);

        const vec = point.vectorTo(bezier);

        const distSquare = vec.dx ** 2 + vec.dy ** 2;
        if (distSquare < minDistSquare) {
            minDistSquare = distSquare;
        }
    }

    return Math.sqrt(minDistSquare);
}

export function bezierLineArea(start: BezierPoint, end: BezierPoint, steps: number = 1000): number {
    let area = 0;

    const dt = 1 / steps;

    for (let step = 0; step < steps; step++) {
        const t = step * dt;
        const u = 1 - t;
        const tt = t ** 2;
        const uu = u ** 2;

        const bezier = bezierAt(t, start, end);

        const dx = -3 * uu * start.anchor.x + 3 * (uu - 2 * u * t) * start.handleOutPoint().x + 3
            * (2 * u * t - tt) * end.handleInPoint().x + 3 * tt * end.anchor.x;
        const dy = -3 * uu * start.anchor.y + 3 * (uu - 2 * u * t) * start.handleOutPoint().y + 3
            * (2 * u * t - tt) * end.handleInPoint().y + 3 * tt * end.anchor.y;

        area += (bezier.x * dy - bezier.y * dx) * dt;
    }

    return area / 2;
}

export function bezierAt(t: number, start: BezierPoint, end: BezierPoint): Point2D {
    const u = 1 - t;
    const tt = t ** 2;
    const uu = u ** 2;
    const ttt = t ** 3;
    const uuu = u ** 3;

    return new Point2D(
        uuu * start.anchor.x + 3 * uu * t * start.handleOutPoint().x + 3 * u * tt
        * end.handleInPoint().x + ttt * end.anchor.x,
        uuu * start.anchor.y + 3 * uu * t * start.handleOutPoint().y + 3 * u * tt
        * end.handleInPoint().y + ttt * end.anchor.y,
    );
}
