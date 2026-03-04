<script lang="ts">
	let count = $state(0);
</script>

<div class="inline-flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
	<button
		class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
		onclick={() => count--}
	>
		-
	</button>
	<span class="text-lg font-semibold tabular-nums w-12 text-center">{count}</span>
	<button
		class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
		onclick={() => count++}
	>
		+
	</button>
</div>
