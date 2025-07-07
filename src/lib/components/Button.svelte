<script lang="ts">
    let {
        children,
        ...rest
    } = $props();
</script>

<button {...rest} class="rounded-sm border px-1 border-border">
    {@render children()}
</button>
