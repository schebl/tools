import {Ruler, SelectionStore, Shape} from "$lib/area/figures";
import {Point2D} from "$lib/area/geometry";
import type {Renderer} from "$lib/area/ui";

export interface ToolContext {
    ruler: Ruler | null;
    selection: SelectionStore;
    setRuler(ruler: Ruler): void;
    addShape(shape: Shape): void;
}

/**
 * Represents lifecycle of canvas tool.
 */
export interface Tool {
    start(click: Point2D): void;
    update(click: Point2D): void;
    end(click: Point2D): void;
    renderOverlay?(renderer: Renderer): void;
}

export interface ToolDescriptor {
    readonly id: string;
    readonly label: string;
    isApplicable(selection: SelectionStore): boolean;
    create(ctx: ToolContext): Tool;
}

export class ToolManager {
    private descriptors = $state<ToolDescriptor[]>([]);
    private activeDescriptor = $state<ToolDescriptor | null>(null);
    private activeTool = $state<Tool | null>(null);

    public get active(): Tool | null {
        return this.activeTool;
    }

    /**
     * Registers given tools. Registered tools are available for activation.
     */
    public register(...tools: ToolDescriptor[]): void {
        for (const tool of tools) {
            this.descriptors.push(tool);
        }
    }

    /**
     * Marks tool as active. Active tool will be used in event handling.
     */
    public activate(toolID: string, selection: SelectionStore): void {
        const descriptor = this.descriptors.find(d => d.id === toolID);
        if (descriptor && descriptor.isApplicable(selection)) {
            this.activeDescriptor = descriptor;
            this.activeTool = null;
        }
    }

    public isActive(toolID: string): boolean {
        return !!this.activeDescriptor && this.activeDescriptor.id === toolID;
    }

    public getApplicable(selection: SelectionStore): ToolDescriptor[] {
        return this.descriptors.filter(d => d.isApplicable(selection));
    }

    public handleEvent(ctx: ToolContext) {
        return (event: PointerEvent) => {
            if (!this.activeDescriptor) {
                return;
            }
            if (!this.activeDescriptor.isApplicable(ctx.selection)) {
                this.activeDescriptor = null;
                this.activeTool = null;
                return;
            }

            const click = new Point2D(event.offsetX, event.offsetY);

            switch (event.type) {
            case "pointerdown":
                this.activeTool = this.activeDescriptor.create(ctx);
                this.activeTool.start(click);
                break;
            case "pointermove":
                this.activeTool?.update(click);
                break;
            case "pointerup":
                this.activeTool?.end(click);
                this.activeTool = null;
                break;
            }
        };
    }
}
