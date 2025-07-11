import {Point2D, Vector} from "$lib/area/geometry.svelte";

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