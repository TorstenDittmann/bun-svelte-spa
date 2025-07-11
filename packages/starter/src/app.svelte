<script lang="ts">
	import { Router } from "svelte-bun-framework/runtime";
	import { routes } from "./router";
</script>

<header>
	<nav>
		<a href="/">bun-svelte-spa</a>
		<menu>
			<li><a href="/">Home</a></li>
			<li><a href="/about">About</a></li>
		</menu>
	</nav>
</header>

<main>
	<Router {routes} />
</main>
