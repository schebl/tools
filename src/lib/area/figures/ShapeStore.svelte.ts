import {Shape} from ".";

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
