<script lang="ts">
	import { routes } from "@router";
	import { Router } from "bun-svelte-spa/runtime";
</script>

<header>
	<nav>
		<a href="/">svelte+bun</a>
		<menu>
			<li><a href="/">Index</a></li>
			<li><a href="/about">About</a></li>
			<li><a href="/user/123">User</a></li>
			<li><a href="/404">404</a></li>
		</menu>
	</nav>
</header>

<main>
	<Router {routes} />
</main>
