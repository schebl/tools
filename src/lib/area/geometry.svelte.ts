import {BezierPoint} from "$lib/area/shape.svelte";

export class Vector {
    public dx: number;
    public dy: number;

    public constructor(dx: number, dy: number) {
        this.dx = $state(dx);
        this.dy = $state(dy);
    }

    public add(vector: Vector): Vector {
        return new Vector(this.dx + vector.dx, this.dy + vector.dy);
    }

    public distance(): number {
        return Math.hypot(this.dx, this.dy);
    }
}

export class Point2D {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = $state(x);
        this.y = $state(y);
    }

    public add(vector: Vector): Point2D {
        return new Point2D(this.x + vector.dx, this.y + vector.dy);
    }

    public vectorTo(point: Point2D): Vector {
        return new Vector(point.x - this.x, point.y - this.y);
    }

    public distanceTo(point: Point2D): number {
        return this.vectorTo(point).distance();
    }

    public distanceToBezierLine(
        start: BezierPoint,
        end: BezierPoint,
        steps: number = 1000,
    ): number {
        let minDistSquare = Infinity;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const bezier = bezierAt(t, start, end);

            const vec = this.vectorTo(bezier);

            const distSquare = vec.dx ** 2 + vec.dy ** 2;
            if (distSquare < minDistSquare) {
                minDistSquare = distSquare;
            }
        }

        return Math.sqrt(minDistSquare);
    }
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

function bezierAt(t: number, start: BezierPoint, end: BezierPoint): Point2D {
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
