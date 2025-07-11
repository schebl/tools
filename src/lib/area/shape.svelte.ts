export class Vector {
    public dx: number;
    public dy: number;

    public constructor(dx: number, dy: number) {
        this.dx = $state(dx);
        this.dy = $state(dy);
    }
}

export class Point2D {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = $state(x);
        this.y = $state(y);
    }

    public addVector(vector: Vector): Point2D {
        return new Point2D(this.x + vector.dx, this.y + vector.dy);
    }

    public vectorTo(point: Point2D): Vector {
        return new Vector(point.x - this.x, point.y - this.y);
    }

    public distanceToPoint(point: Point2D): number {
        const vec = this.vectorTo(point);
        return Math.hypot(vec.dx, vec.dy);
    }

    public distanceToBezierLine(start: BezierPoint, end: BezierPoint): number {
        const steps = 1000;

        let minDistSquare = Infinity;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
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
        const handleOutPoint = this.anchor.addVector(this.handleOut);
        return new Point2D(handleOutPoint.x, handleOutPoint.y);
    }

    public handleInPoint(): Point2D {
        let handleInPoint = this.anchor.addVector(this.handleIn);
        return new Point2D(handleInPoint.x, handleInPoint.y);
    }
}

export class Shape {
    public points = $state<BezierPoint[]>([]);

    public addPoint(point: BezierPoint): void {
        this.points.push(point);
    }

    public insertAt(index: number, point: BezierPoint): void {
        this.points.splice(index, 0, point);
    }

    public hasPoint(point: BezierPoint): boolean {
        return !!this.points.find(p => p === point);
    }
}

export class SelectionStore {
    public point: BezierPoint | null = $state(null);
    public shape: Shape | null = $state(null);

    /**
     * Selects given point. Point must be one of points of currently selected shape. Passing null
     * will remove point selection.
     */
    public selectPoint(point: BezierPoint | null): void {
        if (point && this.shape?.hasPoint(point)) {
            this.point = point;
            return;
        }
        this.point = null;
    }

    public selectShape(shape: Shape | null): void {
        this.shape = shape;
        this.point = null;
    }
}