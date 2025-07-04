<script lang="ts">
    let text = $state("");
    let render = $derived.by(() => {
        return text.split("").map((char) => {
            return escapeHTML(char);
        }).join("");
    });

    function escapeHTML(unsafe: string) {
        return unsafe.replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#039;");
    }
</script>

<div style="display: flex; gap: 1rem">
    <textarea bind:value={text} class="border" style="resize: vertical"></textarea>

    <pre class="border">{@html render}</pre>
</div>
