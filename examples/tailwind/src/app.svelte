<script lang="ts">
	import { router } from "@router";
	import { Router } from "bun-svelte-spa/runtime";
</script>

<div class="min-h-screen flex flex-col">
	<header class="bg-white shadow-sm">
		<nav class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
			<a href="/" class="text-lg font-bold text-indigo-600">svelte+bun+tailwind</a>
			<ul class="flex gap-4">
				<li><a href="/" class="text-gray-600 hover:text-indigo-600 transition-colors">Index</a></li>
				<li><a href="/about" class="text-gray-600 hover:text-indigo-600 transition-colors">About</a></li>
				<li><a href="/user/123" class="text-gray-600 hover:text-indigo-600 transition-colors">User</a></li>
				<li><a href="/404" class="text-gray-600 hover:text-indigo-600 transition-colors">404</a></li>
			</ul>
		</nav>
	</header>

	<main class="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
		<Router {router} />
	</main>
</div>
