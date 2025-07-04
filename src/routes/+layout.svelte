<script lang="ts">
    import "../app.css";

    let {children} = $props();
</script>

<nav>
    <a href="/">Home</a>
</nav>

<main class="mx-auto container">
    {@render children()}
</main>
