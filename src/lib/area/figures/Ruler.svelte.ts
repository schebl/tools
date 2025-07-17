import {Point2D} from "$lib/area/geometry";

export class Ruler {
    public start: Point2D;
    public end: Point2D;
    public length = $derived(this.calcLength());

    public constructor(start: Point2D, end: Point2D) {
        this.start = $state(start);
        this.end = $state(end);
    }

    private calcLength(): number {
        const vec = this.start.vectorTo(this.end);
        return Math.hypot(vec.dx, vec.dy);
    }
}