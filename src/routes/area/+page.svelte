<script lang="ts">
    import {Renderer} from "$lib/area/renderer";
    import {SelectionStore, Shape} from "$lib/area/shape.svelte";
    import {type ToolContext, ToolManager} from "$lib/area/tool.svelte";
    import {
        addPointTool,
        createEllipseTool,
        createRectTool,
        moveAnchorTool,
        moveControlTool,
        selectPointTool,
    } from "$lib/area/tools";
    import type {Attachment} from "svelte/attachments";

    const shapes = $state<Shape[]>([]);
    const selection = new SelectionStore();

    const toolManager = new ToolManager();
    toolManager.register(createRectTool, createEllipseTool);
    toolManager.register(addPointTool, moveAnchorTool, moveControlTool, selectPointTool);

    function getToolCtx(renderer?: Renderer): Omit<ToolContext, "event"> {
        return {
            shapes: shapes,
            selection: selection,
            renderer: renderer ?? null,
        };
    }

    const canvasAttachment: Attachment<HTMLCanvasElement> = (canvas) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to get canvas drawing context");
        }
        const renderer = new Renderer(ctx, selection, shapes);

        const handlePointerDown = (event: PointerEvent) => {
            toolManager.handleEvent(event, getToolCtx(renderer));
        };

        const canvasEvents: (keyof HTMLElementEventMap)[] = [
            "pointerdown", "pointermove", "pointerup",
        ];
        canvasEvents.forEach((e) => {
            canvas.addEventListener(e, handlePointerDown);
        });

        $effect(() => {
            renderer.redraw();
        });

        return () => {
            canvasEvents.forEach((e) => {
                canvas.removeEventListener(e, handlePointerDown);
            });
        };
    };
</script>

<svelte:head>
    <title>Area</title>
</svelte:head>

<div class="flex gap-4">
    <div class="flex flex-col gap-1">
        <p>Shapes</p>

        <div>
            {#each shapes as shape, i}
                <div>
                    <label for="selection-shape-{i}">Shape {i + 1}</label>

                    <input
                        onclick={() => {selection.selectShape(shape)}}
                        id="selection-shape-{i}"
                        type="radio"
                        name="selection"
                    >
                </div>
            {/each}
        </div>
    </div>

    <canvas
        {@attach canvasAttachment}
        class="h-full rounded-sm border border-border"
        height="400"
        width="400"
    ></canvas>

    <div class="flex flex-col gap-1">
        <p>Tools</p>

        <div>
            {#each toolManager.getApplicable(getToolCtx()) as tool}
                <div>
                    <label for="tool-{tool.id}">{tool.label}</label>

                    <input
                        onclick={() => {toolManager.activate(tool.id, getToolCtx())}}
                        id="tool-{tool.id}"
                        type="radio"
                        name="tool"
                        checked={toolManager.isActive(tool.id)}
                    >
                </div>
            {/each}
        </div>
    </div>
</div>
