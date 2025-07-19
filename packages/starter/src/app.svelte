<script lang="ts">
	import { routes } from "@router";
	import { Router } from "bun-svelte-spa/runtime";
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
