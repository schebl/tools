<script lang="ts">
    import "../app.css";

    let {children} = $props();
</script>

<nav>
    <a href="/">Home</a>

    <a href="/symbols">Symbols</a>

    <a href="/midpoint">Midpoint</a>
</nav>

<main class="mx-auto container">
    {@render children()}
</main>
