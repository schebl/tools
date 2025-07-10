<script lang="ts">
    import {Renderer} from "$lib/area/renderer";
    import {SelectionStore, Shape} from "$lib/area/shape.svelte";
    import {type ToolContext, ToolManager} from "$lib/area/tool.svelte";
    import {addPointTool, createRectTool, movePointTool, selectPointTool} from "$lib/area/tools";
    import type {Attachment} from "svelte/attachments";

    const shapes = $state<Shape[]>([]);
    const selection = new SelectionStore();

    const toolManager = new ToolManager();
    toolManager.register(createRectTool);
    toolManager.register(addPointTool, movePointTool, selectPointTool);

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

<div class="flex gap-2">
    <div>
        <p>Shapes</p>

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

    <canvas {@attach canvasAttachment} class="rounded-sm border border-border"></canvas>

    <div>
        <p>Tools</p>

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
