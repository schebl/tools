<script lang="ts">
    import {Editor} from "$lib/area/Editor.svelte";
    import {
        addPointTool,
        createEllipseTool,
        createRectTool,
        controlManipulatorTool,
        pointManipulatorTool,
        setRulerTool,
    } from "$lib/area/tool";
    import {onMount} from "svelte";

    const editor = new Editor();
    editor.tools.register(createRectTool, createEllipseTool, setRulerTool);
    editor.tools.register(addPointTool, pointManipulatorTool, controlManipulatorTool);

    let realUnitsInRuler = $state(1);
    let scale = $derived(realUnitsInRuler / (editor.ruler?.length ?? 1));
    let totalArea = $derived(editor.totalArea * scale ** 2);

    let canvas: HTMLCanvasElement;

    onMount(() => {
        editor.init(canvas);

        return () => {
            editor.destroy();
        };
    });
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

        <div>
            <p>Ruler</p>

            Units <input bind:value={realUnitsInRuler} class="border border-border" type="number">
        </div>
    </div>

    <div class="flex flex-col gap-1">
        <p>Shapes</p>

        <div>
            {#each editor.shapes as shape, i}
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
        bind:this={canvas} class="h-full rounded-sm border border-border" height="400" width="400"
    ></canvas>

    <div class="flex flex-col gap-1">
        <p>Tools</p>

        <div>
            {#each editor.tools.getApplicable(editor.selection) as tool (tool.id)}
                <div>
                    <label for="tool-{tool.id}">{tool.label}</label>

                    <input
                        onclick={() => {editor.tools.activate(tool.id, editor.selection)}}
                        id="tool-{tool.id}"
                        type="radio"
                        name="tool"
                        checked={editor.tools.isActive(tool.id)}
                    >
                </div>
            {/each}
        </div>
    </div>
</div>
