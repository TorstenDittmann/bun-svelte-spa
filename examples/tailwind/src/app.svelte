<script lang="ts">
	import { Router } from "bun-svelte-spa/runtime";
	import { routes } from "./router";
</script>

<div class="min-h-screen bg-white">
	<main>
		<Router {routes} />
	</main>
</div>
