<script lang="ts">
	import { Router } from "bun-svelte-spa/runtime";
	import { isActive, router } from "./router";

	const navItems = [
		{ path: "/", label: "top" },
		{ path: "/new", label: "new" },
		{ path: "/best", label: "best" },
		{ path: "/ask", label: "ask" },
		{ path: "/show", label: "show" },
		{ path: "/jobs", label: "jobs" },
	];
</script>

<div class="app">
	<header>
		<nav>
			<a href="/" class="logo">
				<span class="logo-icon">Y</span>
				<span class="logo-text">Hacker News</span>
			</a>

			<ul class="nav-links">
				{#each navItems as item}
					<li>
						<a
							href={item.path}
							class:active={isActive(item.path, {
								exact: true,
							})}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</header>

	<main>
		<Router {router} />
	</main>

	<footer>
		<p>
			Built with <a
				href="https://github.com/TorstenDittmann/bun-svelte-spa"
				target="_blank"
			>bun-svelte-spa</a>
			&middot;
			<a href="https://news.ycombinator.com" target="_blank"
			>Original HN</a>
		</p>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family: Verdana, Geneva, sans-serif;
		font-size: 14px;
		background: #f6f6ef;
		color: #000;
		line-height: 1.4;
	}

	:global(a) {
		color: inherit;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		background: #ff6600;
		padding: 0.5rem 1rem;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	nav {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		font-weight: bold;
	}

	.logo-icon {
		background: white;
		color: #ff6600;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid white;
		font-size: 0.9rem;
	}

	.logo-text {
		color: black;
		font-size: 0.9rem;
	}

	.nav-links {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 0.75rem;
	}

	.nav-links a {
		color: black;
		text-decoration: none;
		font-size: 0.85rem;
	}

	.nav-links a:hover {
		text-decoration: underline;
	}

	.nav-links a.active {
		color: white;
	}

	main {
		flex: 1;
		background: white;
	}

	footer {
		background: #ff6600;
		padding: 1rem;
		text-align: center;
		font-size: 0.8rem;
	}

	footer a {
		color: black;
	}

	@media (max-width: 600px) {
		.logo-text {
			display: none;
		}

		.nav-links {
			gap: 0.5rem;
			flex-wrap: wrap;
		}
	}
</style>
