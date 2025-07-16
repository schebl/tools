<script lang="ts">
    import {Editor} from "$lib/area/Editor.svelte";
    import {
        addPointTool,
        controlManipulatorTool,
        createEllipseTool,
        createRectTool,
        pointManipulatorTool,
        setRulerTool,
    } from "$lib/area/tool";
    import Button from "$lib/components/Button.svelte";
    import {onDestroy, onMount} from "svelte";
    import {slide} from "svelte/transition";
    import Block from "./Block.svelte";

    const editor = new Editor();
    editor.tools.register(createRectTool, createEllipseTool, setRulerTool);
    editor.tools.register(addPointTool, pointManipulatorTool, controlManipulatorTool);

    let unitName = $state("cm");
    let realUnitsInRuler = $state(1);
    let scale = $derived(realUnitsInRuler / (editor.ruler?.length ?? 1));

    let canvas: HTMLCanvasElement;
    const canvasSize = 500;

    onMount(() => {
        editor.init(canvas);

        return () => {
            editor.destroy();
        };
    });

    const formatter = new Intl.NumberFormat(
        undefined,
        {
            style: "decimal",
            maximumFractionDigits: 2,
        },
    );

    function scaledArea(area: number, scale: number): string {
        return formatter.format(area * scale ** 2);
    }

    let backgroundImageInput: HTMLInputElement;
    let backgroundFiles = $state<FileList | null>(null);
    let canvasImageUrl = $derived.by(() => {
        const file = backgroundFiles?.[0] ?? null;
        if (!file) {
            return null;
        }
        return URL.createObjectURL(file);
    });

    $effect(() => {
        const url = canvasImageUrl;
        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    });

    onDestroy(() => {
        if (canvasImageUrl) {
            URL.revokeObjectURL(canvasImageUrl);
        }
    });

    function handleKeydown(callback: () => void) {
        return function (event: KeyboardEvent) {
            if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                callback();
            }
        };
    }
</script>

<svelte:head>
    <title>Area</title>
</svelte:head>

<div class="flex gap-2" style="height: {canvasSize + 2}px">
    <div class="grid grid-rows-4 gap-2 min-w-60">
        <Block class="row-span-3" heading="Shapes">
            <div
                class="w-full overflow-y-auto rounded-sm border divide-border divide-y border-border"
                role="listbox"
            >
                {#each editor.shapes as shape (shape.id)}
                    {@const
                        selected = editor.selection.shape && editor.selection.shape.id === shape.id}

                    <div
                        onclick={() => editor.selection.selectShape(shape)}
                        onkeydown={handleKeydown(() => editor.selection.selectShape(shape))}
                        role="option"
                        aria-selected={selected}
                        tabindex="0"
                        class="p-1 {selected ? 'text-primary' : ''}"
                        transition:slide
                    >
                        <p>{shape.title}</p>
                    </div>
                {/each}
            </div>
        </Block>

        <Block>
            {#if editor.selection.shape}
                {@const shape = editor.selection.shape}

                <div class="flex max-w-full w-full flex-col gap-2">
                    <div class="flex justify-between gap-2">
                        <input
                            type="text"
                            bind:value={shape.title}
                            class="w-full rounded-sm border border-border"
                        >
                    </div>

                    <div class="flex justify-between gap-2 max-w-full">
                        <p>Area</p>

                        <p class="wrap-anywhere">{scaledArea(shape.area, scale)} {unitName}</p>
                    </div>

                    <Button onclick={() => editor.removeShape(shape)}>
                        Remove
                    </Button>
                </div>
            {:else}
                <p>Nothing selected.</p>
            {/if}
        </Block>
    </div>

    <canvas
        bind:this={canvas}
        class="rounded-sm border border-border bg-no-repeat bg-contain bg-center"
        height={canvasSize}
        style="height: {canvasSize + 2}px; background-image: {canvasImageUrl ? `url(${canvasImageUrl})` : ''}"
        width={canvasSize}
    ></canvas>

    <div class="flex flex-col gap-2 max-w-60">
        <Block class="h-max">
            <div class="flex flex-col gap-2">
                <div class="flex justify-between gap-2">
                    <p>Total area</p>

                    <p class="wrap-anywhere">{scaledArea(editor.totalArea, scale)} {unitName}</p>
                </div>

                <div class="flex justify-between gap-2">
                    <label for="real-units">Ruler</label>

                    <input
                        bind:value={realUnitsInRuler}
                        class="w-full rounded-sm border border-border"
                        id="real-units"
                        min="0"
                        type="number"
                    >

                    <input
                        bind:value={unitName}
                        class="w-1/3 rounded-sm border border-border"
                        type="text"
                    >
                </div>

                <Button onclick={() => backgroundImageInput.click()}>
                    Set background
                </Button>

                <input
                    accept="image/*"
                    bind:files={backgroundFiles}
                    bind:this={backgroundImageInput}
                    class="hidden"
                    id="files"
                    type="file"
                >
            </div>
        </Block>

        <Block class="h-full" heading="Tools">
            <div
                class="w-full overflow-y-auto rounded-sm border divide-border divide-y border-border"
                role="listbox"
            >
                {#each editor.tools.getApplicable(editor.selection) as tool (tool.id)}
                    {@const active = editor.tools.isActive(tool.id)}

                    <div
                        onclick={() => editor.tools.activate(tool.id, editor.selection)}
                        onkeydown={handleKeydown(() => editor.tools.activate(tool.id, editor.selection))}
                        role="option"
                        aria-selected={active}
                        tabindex="0"
                        class="p-1 {active ? 'text-primary' : ''}"
                        transition:slide
                    >
                        <p>{tool.label}</p>
                    </div>
                {/each}
            </div>
        </Block>
    </div>
</div>
