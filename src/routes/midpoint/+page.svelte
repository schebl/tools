<script lang="ts">
    import {Point3D} from "$lib/midpoint.svelte";

    let point1 = new Point3D();
    let point2 = new Point3D();

    let distance = $derived(point1.distance(point2));
    let midpoint = $derived(point1.midpoint(point2));
</script>

<div class="grid gap-4">
    <div class="flex gap-4">
        <div class="grid gap-1">
            <p>Point 1</p>

            <div>
                <label for="first-point-x">X</label>

                <input
                    bind:value={point1.x}
                    class="rounded-sm border px-1"
                    id="first-point-x"
                    type="number"
                >
            </div>

            <div>
                <label for="first-point-y">Y</label>

                <input
                    bind:value={point1.y}
                    class="rounded-sm border px-1"
                    id="first-point-y"
                    type="number"
                >
            </div>

            <div>
                <label for="first-point-z">Z</label>

                <input
                    bind:value={point1.z}
                    class="rounded-sm border px-1"
                    id="first-point-z"
                    type="number"
                >
            </div>
        </div>

        <div class="grid gap-1">
            <p>Point 2</p>

            <div>
                <label for="second-point-x">X</label>

                <input
                    bind:value={point2.x}
                    class="rounded-sm border px-1"
                    id="second-point-x"
                    type="number"
                >
            </div>

            <div>
                <label for="second-point-y">Y</label>

                <input
                    bind:value={point2.y}
                    class="rounded-sm border px-1"
                    id="second-point-y"
                    type="number"
                >
            </div>

            <div>
                <label for="second-point-z">Z</label>

                <input
                    bind:value={point2.z}
                    class="rounded-sm border px-1"
                    id="second-point-z"
                    type="number"
                >
            </div>
        </div>
    </div>

    <div class="max-w-80">
        <div class="flex justify-between gap-2">
            <p>Distance</p>

            <p>{distance}</p>
        </div>

        <div class="flex justify-between gap-2">
            <p>Midpoint</p>

            <p>({midpoint.x}, {midpoint.y}, {midpoint.z})</p>
        </div>
    </div>
</div>
