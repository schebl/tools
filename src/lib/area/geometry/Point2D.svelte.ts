import {Vector} from ".";

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
}
