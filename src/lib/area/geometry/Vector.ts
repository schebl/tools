export class Vector {
    public dx: number;
    public dy: number;

    public constructor(dx: number, dy: number) {
        this.dx = dx;
        this.dy = dy;
    }

    public add(vector: Vector): Vector {
        return new Vector(this.dx + vector.dx, this.dy + vector.dy);
    }

    public distance(): number {
        return Math.hypot(this.dx, this.dy);
    }
}
