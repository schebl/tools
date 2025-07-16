<script lang="ts">
    import type {Snippet} from "svelte";
    import type {HTMLAttributes} from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        heading?: string;
        class?: string;
        children: Snippet;
    }

    const {
        heading,
        class: className = "",
        children,
        ...others
    }: Props = $props();
</script>

<div {...others} class={`flex flex-col gap-1 border border-border rounded-md p-2 ${className}`}>
    {#if heading}
        <h4 class="text-lg">{heading}</h4>
    {/if}

    <div class="flex-1 flex overflow-auto">
        {@render children()}
    </div>
</div>
