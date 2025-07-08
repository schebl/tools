export interface Point2D {
    x: number;
    y: number;
}

export class Shape {
    public points = $state<Point2D[]>([]);
}

export class SelectionStore {
    public point: Point2D | null = $state(null);
    public shape: Shape | null = $state(null);

    public selectPoint(point: Point2D | null): void {
        this.point = point;
    }

    public selectShape(shape: Shape | null): void {
        this.shape = shape;
        this.point = null;
    }
}