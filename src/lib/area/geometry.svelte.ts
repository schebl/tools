import {BezierPoint} from "$lib/area/shape.svelte";

const BEZIER_STEPS = 1000;

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

    public distanceToBezierLine(start: BezierPoint, end: BezierPoint): number {
        let minDistSquare = Infinity;

        for (let i = 0; i <= BEZIER_STEPS; i++) {
            const t = i / BEZIER_STEPS;
            const bezier = this.bezierAt(t, start, end);

            const vec = this.vectorTo(bezier);

            const distSquare = vec.dx ** 2 + vec.dy ** 2;
            if (distSquare < minDistSquare) {
                minDistSquare = distSquare;
            }
        }

        return Math.sqrt(minDistSquare);
    }

    private bezierAt(t: number, start: BezierPoint, end: BezierPoint): Point2D {
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
}
