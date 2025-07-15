import type {Drawable} from "$lib/area/ui";
import type {Ruler} from "$lib/area/figures/Ruler.svelte.js";

export class RulerDrawable implements Drawable {
    private readonly ruler: Ruler;

    public constructor(ruler: Ruler) {
        this.ruler = ruler;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const { start, end } = this.ruler;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const length = this.ruler.length.toFixed(2);
        ctx.fillText(`${length}px`, midX + 5, midY - 5);
    }
}
