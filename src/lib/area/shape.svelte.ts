export class Point2D {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = $state(x);
        this.y = $state(y);
    }
}

export class Shape {
    public points = $state<Point2D[]>([]);

    public addPoint(point: Point2D): void {
        this.points.push(point);
    }

    public hasPoint(point: Point2D): boolean {
        return !!this.points.find(p => p === point);
    }
}

export class SelectionStore {
    public point: Point2D | null = $state(null);
    public shape: Shape | null = $state(null);

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