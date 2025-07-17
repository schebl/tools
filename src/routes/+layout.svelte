<script lang="ts">
    import "../app.css";
    import {base} from "$app/paths";
    import {page} from "$app/state";

    let {children} = $props();
</script>

<div class="flex">
    <aside class="sticky top-0 px-4 py-4 bg-primary text-primary-foreground h-svh">
        <nav class="-mr-4 grid gap-2">
            {#snippet route(label: string, href: string)}
                <a
                    class={(page.url.pathname === base + href ? 'rounded-l-md bg-background text-foreground' : '') + " py-1 px-12"}
                    href={base + href}
                >{label}</a>
            {/snippet}

            {@render route("Symbols", "/symbols")}

            {@render route("Midpoint", "/midpoint")}

            {@render route("Area", "/area")}
        </nav>
    </aside>

    <main class="mx-auto max-w-5xl px-4 py-8">
        {@render children()}
    </main>
</div>
