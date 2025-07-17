<script lang="ts">
    import {Editor} from "$lib/area/Editor.svelte";
    import {
        addPointTool,
        controlManipulatorTool,
        createEllipseTool,
        CreateLineTool,
        createRectTool,
        pointManipulatorTool,
        setRulerTool,
    } from "$lib/area/tool";
    import Button from "$lib/components/Button.svelte";
    import {onDestroy, onMount} from "svelte";
    import {slide} from "svelte/transition";
    import Block from "./Block.svelte";

    let canvas: HTMLCanvasElement;
    const canvasSize = 500;

    const editor = new Editor();
    editor.tools.register(CreateLineTool, createRectTool, createEllipseTool, setRulerTool);
    editor.tools.register(addPointTool, pointManipulatorTool, controlManipulatorTool);

    onMount(() => {
        editor.init(canvas);

        return () => {
            editor.destroy();
        };
    });

    let unitName = $state("cm");
    let realUnitsInRuler = $state(1);
    let scale = $derived(realUnitsInRuler / (editor.ruler?.length ?? 1));

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

    function scaledLength(length: number, scale: number): string {
        return formatter.format(length * scale);
    }

    let backgroundImageInput: HTMLInputElement;
    let backgroundFiles = $state<FileList | null>(null);
    let backgroundURL = $derived.by(() => {
        const file = backgroundFiles?.[0] ?? null;
        if (!file) {
            return null;
        }
        return URL.createObjectURL(file);
    });

    $effect(() => {
        const url = backgroundURL;
        return () => {
            revokeURL(url);
        };
    });

    onDestroy(() => {
        revokeURL(backgroundURL);
    });

    function clearBackground() {
        backgroundFiles = new DataTransfer().files;
    }

    function revokeURL(url: string | null) {
        if (url) {
            URL.revokeObjectURL(url);
        }
    }

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
    <div class="flex flex-col gap-2 min-w-60">
        <Block class="h-2/3" heading="Shapes">
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

        <Block class="flex-1">
            {#if editor.selection.shape}
                {@const shape = editor.selection.shape}

                <div class="flex w-full max-w-full flex-col gap-2">
                    <div class="flex justify-between gap-2">
                        <input
                            type="text"
                            bind:value={shape.title}
                            class="w-full rounded-sm border border-border"
                        >
                    </div>

                    <div class="flex max-w-full justify-between gap-2">
                        <p>Area</p>

                        <p class="wrap-anywhere">{scaledArea(shape.area, scale)} {unitName}</p>
                    </div>

                    <div class="flex max-w-full justify-between gap-2">
                        <p>Length</p>

                        <p class="wrap-anywhere">{scaledLength(shape.length, scale)} {unitName}</p>
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
        class="rounded-sm border bg-contain bg-center bg-no-repeat border-border"
        height={canvasSize}
        style="height:{canvasSize + 2}px;background-image:{backgroundURL ? `url(${backgroundURL})` : ''}"
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
                    <p>Total length</p>

                    <p class="wrap-anywhere">{scaledLength(editor.totalLength, scale)} {unitName}</p>
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

                <Button onclick={clearBackground}>
                    Clear background
                </Button>
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
