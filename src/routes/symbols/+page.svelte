<script lang="ts">
    import {CHAR_GROUPS, type Group, type GroupKey} from "$lib/symbols";

    let text = $state("");
    let render = $derived.by(() => {
        return text.split("").map((char) => {
            const code = char.charCodeAt(0);
            if (isSelected(code)) {
                return highlightChar(code);
            } else {
                return escapeHTML(char);
            }
        }).join("");
    });
    let highlightedCount = $derived.by(() => {
        return text.split("").filter(char => isSelected(char.charCodeAt(0))).length;
    });

    function highlightChar(code: number): string {
        const hex = code.toString(16).toUpperCase().padStart(4, "0");
        return `<span class="bg-teal-200 px-0.5 rounded-xs">U+${hex}</span>`;
    }

    function escapeHTML(unsafe: string): string {
        return unsafe.replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#039;");
    }

    let checkboxState: Record<GroupKey, boolean> = $state({
        space: false,
        tabulation: false,
        lineBreaks: false,
        otherSpaces: true,
        invisible: true,
    });
    let activeGroups = $derived.by(() => {
        return (Object.entries(CHAR_GROUPS) as [GroupKey, Group][])
            .filter(([key]) => checkboxState[key])
            .flatMap(([_, group]) => group);
    });

    function isSelected(code: number): boolean {
        return activeGroups.some(([min, max]) => code >= min && code <= max);
    }

    async function clipboardWrite(s: string) {
        try {
            await navigator.clipboard.writeText(s);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }

    function replaceChars(
        s: string,
        replacement: string,
        shouldReplace: (code: number) => boolean,
    ): string {
        return s.split("").map(char => {
            if (shouldReplace(char.charCodeAt(0))) {
                return replacement;
            }
            return char;
        }).join("");
    }
</script>

<div class="flex gap-8">
    <div class="flex flex-col gap-1">
        <p>Highlighting</p>

        <div class="grid">
            <div class="flex gap-2">
                <input bind:checked={checkboxState.space} id="space" type="checkbox">

                <label for="space">Whitespace</label>
            </div>

            <div class="flex gap-2">
                <input bind:checked={checkboxState.tabulation} id="tabulation" type="checkbox">

                <label for="tabulation">Tabulation</label>
            </div>

            <div class="flex gap-2">
                <input bind:checked={checkboxState.lineBreaks} id="line-breaks" type="checkbox">

                <label for="line-breaks">Line breaks</label>
            </div>

            <div class="flex gap-2">
                <input bind:checked={checkboxState.otherSpaces} id="other-spaces" type="checkbox">

                <label for="other-spaces">Other spaces</label>
            </div>

            <div class="flex gap-2">
                <input bind:checked={checkboxState.invisible} id="invisible" type="checkbox">

                <label for="invisible">Invisible characters</label>
            </div>
        </div>
    </div>

    <div class="grid flex-1 gap-6">
        <div class="grid gap-2">
            <label for="text">Input text</label>

            <textarea
                bind:value={text}
                class="resize-y whitespace-pre-wrap break-all rounded-sm border font-mono px-0.5"
                id="text"
                rows="4"
            ></textarea>

            <div class="flex gap-2">
                <button
                    class="rounded-sm border px-1" onclick={() => {clipboardWrite(text)}}
                >
                    Copy
                </button>

                <button
                    class="rounded-sm border px-1" onclick={() => {text = ""}}
                >
                    Clear
                </button>
            </div>
        </div>

        <div class="grid gap-2">
            <p>Highlighted symbols</p>

            <div class="grid gap-2">
                <pre class="whitespace-pre-wrap break-all rounded-sm border min-h-24 px-0.5">{@html render}</pre>

                <div class="flex gap-2">
                    <div>{highlightedCount} found</div>

                    <button
                        class="rounded-sm border px-1"
                        onclick={() => {text = replaceChars(text, ' ', isSelected)}}
                    >
                        Replace with space
                    </button>

                    <button
                        class="rounded-sm border px-1"
                        onclick={() => {text = replaceChars(text, '', isSelected)}}
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
