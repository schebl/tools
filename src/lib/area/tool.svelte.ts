import type {Renderer} from "$lib/area/renderer";
import {SelectionStore} from "$lib/area/shape.svelte";

export interface ToolContext {
    selection: SelectionStore;
    event: PointerEvent;
    renderer: Renderer | null;
}

export interface Tool {
    start(ctx: ToolContext): void;
    update(ctx: ToolContext): void;
    end(ctx: ToolContext): void;
}

export interface ToolDescriptor {
    readonly id: string;
    readonly label: string;
    isApplicable(ctx: Omit<ToolContext, "event">): boolean;
    create(): Tool;
}

export class ToolManager {
    private descriptors = $state<ToolDescriptor[]>([]);
    private activeDescriptor = $state<ToolDescriptor | null>(null);
    private activeTool = $state<Tool | null>(null);

    public register(...tools: ToolDescriptor[]): void {
        for (const tool of tools) {
            this.descriptors.push(tool);
        }
    }

    public activate(toolID: string, ctx: Omit<ToolContext, "event">): void {
        const descriptor = this.descriptors.find(d => d.id === toolID);
        if (descriptor && descriptor.isApplicable(ctx)) {
            this.activeDescriptor = descriptor;
            this.activeTool = null;
        }
    }

    public isActive(toolID: string): boolean {
        return !!this.activeDescriptor && this.activeDescriptor.id === toolID;
    }

    public getApplicable(ctx: Omit<ToolContext, "event">): ToolDescriptor[] {
        return this.descriptors.filter(d => d.isApplicable(ctx));
    }

    public handleEvent(event: PointerEvent, baseCtx: Omit<ToolContext, "event">): void {
        if (!this.activeDescriptor) {
            return;
        }
        if (!this.activeDescriptor.isApplicable(baseCtx)) {
            this.activeDescriptor = null;
            this.activeTool = null;
            return;
        }

        const ctx = {
            ...baseCtx,
            event: event,
        };

        if (event.type === "pointerdown") {
            this.activeTool = this.activeDescriptor.create();
            this.activeTool.start(ctx);
        } else if (event.type === "pointermove" && this.activeTool?.update) {
            this.activeTool.update(ctx);
        } else if (event.type === "pointerup" && this.activeTool) {
            this.activeTool.end(ctx);
            this.activeTool = null;
        }
    }
}
