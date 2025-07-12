<script lang="ts">
	import { Router } from "svelte-bun-framework/runtime";
	import { routes } from "./router";
</script>

<div class="min-h-screen bg-white">
	<main>
		<Router {routes} />
	</main>
</div>
