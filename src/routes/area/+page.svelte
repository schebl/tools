<script lang="ts">
    import {Editor} from "$lib/area/Editor";
    import {
        addPointTool,
        createEllipseTool,
        createRectTool,
        moveAnchorTool,
        moveControlTool,
        selectPointTool,
    } from "$lib/area/tool";
    import type {Attachment} from "svelte/attachments";

    const editor = new Editor();
    editor.toolManager.register(createRectTool, createEllipseTool);
    editor.toolManager.register(addPointTool, selectPointTool);
    editor.toolManager.register(moveAnchorTool, moveControlTool);

    let totalArea = $state(0);

    const canvasAttachment: Attachment<HTMLCanvasElement> = (canvas) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to get canvas drawing context");
        }
        editor.initRenderer(ctx);

        const handlePointerDown = (event: PointerEvent) => {
            editor.toolManager.handleEvent(event, editor.toolCtx);
        };

        const canvasEvents: (keyof HTMLElementEventMap)[] = [
            "pointerdown", "pointermove", "pointerup",
        ];
        canvasEvents.forEach((e) => {
            canvas.addEventListener(e, handlePointerDown);
        });

        $effect(() => {
            editor.renderer?.redraw(editor.selection);
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
        <div>
            <p>Total area</p>

            <p>{totalArea}</p>
        </div>

        <button onclick={() => {totalArea = editor.totalArea}}>
            Calculate
        </button>
    </div>

    <div class="flex flex-col gap-1">
        <p>Shapes</p>

        <div>
            {#each editor.shapes.all() as shape, i}
                <div>
                    <label for="selection-shape-{i}">Shape {i + 1}</label>

                    <input
                        onclick={() => {editor.selection.selectShape(shape)}}
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
            {#each editor.toolManager.getApplicable(editor.toolCtx) as tool (tool.id)}
                <div>
                    <label for="tool-{tool.id}">{tool.label}</label>

                    <input
                        onclick={() => {editor.toolManager.activate(tool.id, editor.toolCtx)}}
                        id="tool-{tool.id}"
                        type="radio"
                        name="tool"
                        checked={editor.toolManager.isActive(tool.id)}
                    >
                </div>
            {/each}
        </div>
    </div>
</div>
