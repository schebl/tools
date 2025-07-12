import type {Renderer} from "$lib/area/canvas";
import type {SelectionStore, Shape} from "$lib/area/figures";
import {Point2D} from "$lib/area/geometry";

export interface ToolContext {
    shapes: Shape[];
    selection: SelectionStore;
    renderer: Renderer | null;
    event: PointerEvent;
    click: Point2D;
}

export type BaseToolContext = Omit<ToolContext, "event" | "click">

/**
 * Represents lifecycle of canvas tool.
 */
export interface Tool {
    start(ctx: ToolContext): void;
    update(ctx: ToolContext): void;
    end(ctx: ToolContext): void;
}

export interface ToolDescriptor {
    readonly id: string;
    readonly label: string;
    isApplicable(ctx: BaseToolContext): boolean;
    create(): Tool;
}

export class ToolManager {
    private descriptors = $state<ToolDescriptor[]>([]);
    private activeDescriptor = $state<ToolDescriptor | null>(null);
    private activeTool = $state<Tool | null>(null);

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
    public activate(toolID: string, ctx: BaseToolContext): void {
        const descriptor = this.descriptors.find(d => d.id === toolID);
        if (descriptor && descriptor.isApplicable(ctx)) {
            this.activeDescriptor = descriptor;
            this.activeTool = null;
        }
    }

    public isActive(toolID: string): boolean {
        return !!this.activeDescriptor && this.activeDescriptor.id === toolID;
    }

    public getApplicable(ctx: BaseToolContext): ToolDescriptor[] {
        return this.descriptors.filter(d => d.isApplicable(ctx));
    }

    public handleEvent(event: PointerEvent, baseCtx: BaseToolContext): void {
        if (!this.activeDescriptor) {
            return;
        }
        if (!this.activeDescriptor.isApplicable(baseCtx)) {
            this.activeDescriptor = null;
            this.activeTool = null;
            return;
        }

        const ctx: ToolContext = {
            ...baseCtx,
            event: event,
            click: new Point2D(event.offsetX, event.offsetY),
        };

        switch (event.type) {
        case "pointerdown":
            this.activeTool = this.activeDescriptor.create();
            this.activeTool.start(ctx);
            break;
        case "pointermove":
            this.activeTool?.update(ctx);
            break;
        case "pointerup":
            this.activeTool?.end(ctx);
            this.activeTool = null;
            break;
        }
    }
}
