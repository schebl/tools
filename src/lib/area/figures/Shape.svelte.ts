import {bezierLineArea, bezierLineLength, type BezierPoint} from ".";

const BEZIER_STEPS = 1000;

export class Shape {
    public readonly id;
    public title: string = $state("");

    public points = $state<BezierPoint[]>([]);
    public closed = $derived<boolean>(this.points.length > 2);
    public area = $derived(this.calcArea());
    public length = $derived(this.calcLength());

    constructor() {
        this.id = window.crypto.randomUUID();
    }

    public get lines(): { start: BezierPoint, end: BezierPoint }[] {
        const lines = [];

        let pointsLen = this.points.length;
        if (!this.closed) {
            pointsLen--;
        }
        for (let i = 0; i < pointsLen; i++) {
            const start = this.points[i];
            const end = this.points[(i + 1) % this.points.length];

            lines.push({
                start: start,
                end: end,
            });
        }

        return lines;
    }

    public addPoint(point: BezierPoint): void {
        this.points.push(point);
    }

    public insertAt(index: number, point: BezierPoint): void {
        this.points.splice(index, 0, point);
    }

    public hasPoint(point: BezierPoint): boolean {
        return !!this.points.find(p => p === point);
    }

    private calcArea(): number {
        let area = 0;

        this.lines.forEach(l => {
            area += bezierLineArea(l.start, l.end, BEZIER_STEPS);
        });

        return Math.abs(area);
    }

    private calcLength(): number {
        let length = 0;

        this.lines.forEach(l => {
            length += bezierLineLength(l.start, l.end, BEZIER_STEPS);
        });

        return Math.abs(length);
    }
}
