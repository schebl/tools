export class Point2D {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = $state(x);
        this.y = $state(y);
    }

    public distanceToLine(start: Point2D, end: Point2D): number {
        const vectorToPoint = new Point2D(this.x - start.x, this.y - start.y);
        const lineVector = new Point2D(end.x - start.x, end.y - start.y);

        const dotProduct = vectorToPoint.x * lineVector.x + vectorToPoint.y * lineVector.y;
        const lineLenSquared = lineVector.x ** 2 + lineVector.y ** 2;

        let projection = -1;
        if (lineLenSquared !== 0) {
            projection = dotProduct / lineLenSquared;
        }

        let closest = new Point2D(0, 0);
        if (projection < 0) {
            closest.x = start.x;
            closest.y = start.y;
        } else if (projection > 1) {
            closest.x = end.x;
            closest.y = end.y;
        } else {
            closest.x = start.x + projection * lineVector.x;
            closest.y = start.y + projection * lineVector.y;
        }

        const dx = this.x - closest.x;
        const dy = this.y - closest.y;

        return Math.hypot(dx, dy);
    }
}

export class Shape {
    public points = $state<Point2D[]>([]);

    public addPoint(point: Point2D): void {
        this.points.push(point);
    }

    public insertAt(index: number, point: Point2D): void {
        this.points.splice(index, 0, point);
    }

    public hasPoint(point: Point2D): boolean {
        return !!this.points.find(p => p === point);
    }
}

export class SelectionStore {
    public point: Point2D | null = $state(null);
    public shape: Shape | null = $state(null);

    /**
     * Selects given point. Point must be one of points of currently selected shape. Passing null
     * will remove point selection.
     */
    public selectPoint(point: Point2D | null): void {
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