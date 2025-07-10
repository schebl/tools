export class Point2D {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = $state(x);
        this.y = $state(y);
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
        return new BezierPoint(
            new Point2D(x, y),
            new Point2D(x, y),
            new Point2D(x, y),
        );
    }

    public distanceToLine(start: BezierPoint, end: BezierPoint): number {
        const vectorToPoint = new Point2D(
            this.anchor.x - start.anchor.x,
            this.anchor.y - start.anchor.y,
        );
        const lineVector = new Point2D(
            end.anchor.x - start.anchor.x,
            end.anchor.y - start.anchor.y,
        );

        const dotProduct = vectorToPoint.x * lineVector.x + vectorToPoint.y * lineVector.y;
        const lineLenSquared = lineVector.x ** 2 + lineVector.y ** 2;

        let projection = -1;
        if (lineLenSquared !== 0) {
            projection = dotProduct / lineLenSquared;
        }

        let closest = new Point2D(0, 0);
        if (projection < 0) {
            closest.x = start.anchor.x;
            closest.y = start.anchor.y;
        } else if (projection > 1) {
            closest.x = end.anchor.x;
            closest.y = end.anchor.y;
        } else {
            closest.x = start.anchor.x + projection * lineVector.x;
            closest.y = start.anchor.y + projection * lineVector.y;
        }

        const dx = this.anchor.x - closest.x;
        const dy = this.anchor.y - closest.y;

        return Math.hypot(dx, dy);
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