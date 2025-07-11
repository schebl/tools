import {bezierLineArea, Point2D, Vector} from "$lib/area/geometry.svelte";

const BEZIER_STEPS = 1000;

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

    public area(): number {
        let area = 0;

        console.log();
        for (let i = 0; i < this.points.length; i++) {
            const current = this.points[i];
            const next = this.points[(i + 1) % this.points.length];

            area += bezierLineArea(current, next, BEZIER_STEPS);
        }

        return Math.abs(area);
    }
}

export class ShapeStore {
    private shapes: Shape[] = $state([]);

    public all(): Shape[] {
        return this.shapes;
    }

    public add(shape: Shape): void {
        this.shapes.push(shape);
    }

    public area(): number {
        let area = 0;
        for (const shape of this.shapes) {
            area += shape.area();
        }
        return area;
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