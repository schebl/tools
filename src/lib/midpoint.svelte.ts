export class Point3D {
    public x: number;
    public y: number;
    public z: number;

    public constructor(x?: number, y?: number, z?: number) {
        this.x = $state(x ?? 0);
        this.y = $state(y ?? 0);
        this.z = $state(z ?? 0);
    }

    public distance(to: Point3D): number {
        const dx = this.x - to.x;
        const dy = this.y - to.y;
        const dz = this.z - to.z;

        return Math.hypot(dx, dy, dz);
    }

    public midpoint(other: Point3D): Point3D {
        return new Point3D(
            this.x + ((other.x - this.x) / 2),
            this.y + ((other.y - this.y) / 2),
            this.z + ((other.z - this.z) / 2),
        );
    }
}