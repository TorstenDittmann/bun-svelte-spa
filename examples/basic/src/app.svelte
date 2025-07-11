<script lang="ts">
	import { Router } from "svelte-bun-framework/runtime";
	import routes from "./routes";
</script>

<header>
	<nav>
		<a href="/">svelte+bun</a>
		<menu>
			<li><a href="/" aria-current="page">Link</a></li>
			<li><a href="/about">Link</a></li>
		</menu>
	</nav>
</header>

<main>
	<Router {routes} />
</main>
