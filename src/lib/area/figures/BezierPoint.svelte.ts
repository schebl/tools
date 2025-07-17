import {Point2D, Vector} from "$lib/area/geometry";

export class BezierPoint {
    public anchor: Point2D;

    public constructor(position: Point2D, handleIn: Vector, handleOut: Vector) {
        this.anchor = $state(position);
        this._handleIn = $state(handleIn);
        this._handleOut = $state(handleOut);
    }

    private _handleOut: Vector;

    public get handleOut(): Point2D {
        const handleOutPoint = this.anchor.add(this._handleOut);
        return new Point2D(handleOutPoint.x, handleOutPoint.y);
    }

    public set handleOut(point: Point2D) {
        this._handleOut = this.anchor.vectorTo(point);
    }

    private _handleIn: Vector;

    public get handleIn(): Point2D {
        const handleInPoint = this.anchor.add(this._handleIn);
        return new Point2D(handleInPoint.x, handleInPoint.y);
    }

    public set handleIn(point: Point2D) {
        this._handleIn = this.anchor.vectorTo(point);
    }

    public static fromXY(x: number, y: number): BezierPoint {
        return new BezierPoint(new Point2D(x, y), new Vector(0, 0), new Vector(0, 0));
    }

    public static fromPoint(point: Point2D): BezierPoint {
        return this.fromXY(point.x, point.y);
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
        const bezier = bezierPointAt(t, lineStart, lineEnd);

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

        const bezier = bezierPointAt(t, start, end);
        const d = bezierDerivativeAt(t, start, end);

        area += (bezier.x * d.y - bezier.y * d.x) * dt;
    }

    return area / 2;
}

export function bezierLineLength(
    start: BezierPoint,
    end: BezierPoint,
    steps: number = 1000,
): number {
    let length = 0;

    const dt = 1 / steps;
    for (let step = 0; step < steps; step++) {
        const t = step * dt;

        const d = bezierDerivativeAt(t, start, end);

        length += Math.hypot(d.x, d.y) * dt;
    }

    return length;
}

export function bezierPointAt(t: number, start: BezierPoint, end: BezierPoint): Point2D {
    const u = 1 - t;
    const tt = t ** 2;
    const uu = u ** 2;
    const ttt = t ** 3;
    const uuu = u ** 3;

    return new Point2D(
        uuu * start.anchor.x + 3 * uu * t * start.handleOut.x + 3 * u * tt
        * end.handleIn.x + ttt * end.anchor.x,
        uuu * start.anchor.y + 3 * uu * t * start.handleOut.y + 3 * u * tt
        * end.handleIn.y + ttt * end.anchor.y,
    );
}

export function bezierDerivativeAt(t: number, start: BezierPoint, end: BezierPoint): Point2D {
    const u = 1 - t;
    const tt = t ** 2;
    const uu = u ** 2;

    return new Point2D(
        -3 * uu * start.anchor.x + 3 * (uu - 2 * u * t) * start.handleOut.x + 3
        * (2 * u * t - tt) * end.handleIn.x + 3 * tt * end.anchor.x,
        -3 * uu * start.anchor.y + 3 * (uu - 2 * u * t) * start.handleOut.y + 3
        * (2 * u * t - tt) * end.handleIn.y + 3 * tt * end.anchor.y,
    );
}
