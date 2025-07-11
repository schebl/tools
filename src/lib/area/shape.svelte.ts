export class Point2D {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = $state(x);
        this.y = $state(y);
    }

    public distanceToPoint(point: Point2D): number {
        const dx = point.x - this.x;
        const dy = point.y - this.y;

        return Math.hypot(dx, dy);
    }

    public distanceToBezierLine(start: BezierPoint, end: BezierPoint): number {
        const steps = 1000;

        let minDistSquare = Infinity;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const bezier = this.bezierAt(t, start, end);

            const dx = this.x - bezier.x;
            const dy = this.y - bezier.y;

            const distSquare = dx ** 2 + dy ** 2;
            if (distSquare < minDistSquare) {
                minDistSquare = distSquare;
            }
        }

        console.log(minDistSquare);
        return Math.sqrt(minDistSquare);
    }

    private bezierAt(t: number, start: BezierPoint, end: BezierPoint): Point2D {
        const u = 1 - t;
        const tt = t ** 2;
        const uu = u ** 2;
        const ttt = t ** 3;
        const uuu = u ** 3;

        return new Point2D(
            uuu * start.anchor.x + 3 * uu * t * start.handleOut.x + 3 * u * tt
            * end.handleIn.x + ttt * end.anchor.x,
            uuu * start.anchor.y + 3 * uu * t * start.handleOut.y + 3 * u * tt * end.handleIn.y
            + ttt * end.anchor.y,
        );
    }
}

export class BezierPoint {
    public anchor: Point2D;
    public handleIn: Point2D;
    public handleOut: Point2D;

    public constructor(position: Point2D, handleIn: Point2D, handleOut: Point2D) {
        this.anchor = position;
        this.handleIn = handleIn;
        this.handleOut = handleOut;
    }

    public static fromXY(x: number, y: number): BezierPoint {
        return new BezierPoint(new Point2D(x, y), new Point2D(x, y), new Point2D(x, y));
    }

    public static fromPoint(point: Point2D): BezierPoint {
        return new BezierPoint(
            new Point2D(point.x, point.y),
            new Point2D(point.x, point.y),
            new Point2D(point.x, point.y),
        );
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