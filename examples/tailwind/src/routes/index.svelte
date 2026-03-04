<script>
	import Counter from "@lib/counter.svelte";
	import { goto } from "@router";
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold text-gray-900">Tailwind Example</h1>
	<p class="text-gray-600">
		This example demonstrates Tailwind CSS working with svelte+bun.
	</p>
	<Counter />
	<button
		class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
		onclick={() => goto("/about")}
	>
		Go to About
	</button>
</div>
