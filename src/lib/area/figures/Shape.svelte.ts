import type {BezierPoint} from ".";
import {bezierLineArea} from ".";

const BEZIER_STEPS = 1000;

export class Shape {
    public points: BezierPoint[] = $state([]);
    public area = $derived(this.calcArea());

    public addPoint(point: BezierPoint): void {
        this.points.push(point);
    }

    public insertAt(index: number, point: BezierPoint): void {
        this.points.splice(index, 0, point);
    }

    public hasPoint(point: BezierPoint): boolean {
        return !!this.points.find(p => p === point);
    }

    public calcArea(): number {
        let area = 0;

        for (let i = 0; i < this.points.length; i++) {
            const current = this.points[i];
            const next = this.points[(i + 1) % this.points.length];

            area += bezierLineArea(current, next, BEZIER_STEPS);
        }

        return Math.abs(area);
    }
}
