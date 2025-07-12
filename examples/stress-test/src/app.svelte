<script lang="ts">
	import { componentList } from './components/generated/index.js';
	
	let showAll = false;
	let displayCount = 10;
</script>

<h1>Stress Test: {componentList.length} Components</h1>

<button on:click={() => showAll = !showAll}>
	{showAll ? 'Hide' : 'Show All Components'}
</button>

{#if showAll}
	{#each componentList.slice(0, displayCount) as Component}
		<Component />
	{/each}
	
	{#if displayCount < componentList.length}
		<button on:click={() => displayCount += 100}>
			Load 100 More ({displayCount}/{componentList.length})
		</button>
	{/if}
{:else}
	<p>Click "Show All Components" to render components</p>
{/if}