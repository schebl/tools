import type {BezierPoint} from ".";
import {Shape} from ".";

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

    public isSelected(shape: Shape, point: BezierPoint | null = null): boolean {
        if (!point) {
            return this.shape === shape;
        }
        return this.shape === shape && this.point === point;
    }
}
