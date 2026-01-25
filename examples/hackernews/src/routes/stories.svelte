<script lang="ts">
	import Pagination from "../components/Pagination.svelte";
	import Spinner from "../components/Spinner.svelte";
	import StoryItem from "../components/StoryItem.svelte";
	import type { StoryType } from "../lib/api";
	import { storiesQuery } from "../lib/queries.svelte";
	import { router, setQueryParams } from "../router";

	interface Props {
		type: StoryType;
	}

	let { type }: Props = $props();

	const page = $derived(
		parseInt(router.queryParams.get("p") || "1", 10),
	);
	const stories = $derived(storiesQuery(type, page));

	const titles: Record<StoryType, string> = {
		top: "Top Stories",
		new: "New Stories",
		best: "Best Stories",
		ask: "Ask HN",
		show: "Show HN",
		job: "Jobs",
	};

	function handlePageChange(newPage: number) {
		setQueryParams({
			p: newPage === 1 ? null : newPage.toString(),
		});
	}
</script>

<section class="stories">
	<h1>{titles[type]}</h1>

	{#if stories.isLoading}
		<div class="loading">
			<Spinner />
		</div>
	{:else if stories.error}
		<div class="error">
			<p>Failed to load stories</p>
			<button onclick={() => stories.refetch()}>Try Again</button>
		</div>
	{:else if stories.data}
		<ol class="list" start={(page - 1) * 30 + 1}>
			{#each stories.data.items as item, i (item.id)}
				<li>
					<StoryItem {item} rank={(page - 1) * 30 + i + 1} />
				</li>
			{/each}
		</ol>

		<Pagination
			{page}
			total={stories.data.total}
			perPage={30}
			onPageChange={handlePageChange}
		/>
	{/if}
</section>

<style>
	.stories {
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
	}

	h1 {
		font-size: 1.25rem;
		color: #ff6600;
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #ff6600;
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.list li {
		border-bottom: 1px solid #f0f0f0;
	}

	.list li:last-child {
		border-bottom: none;
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: 3rem;
	}

	.error {
		text-align: center;
		padding: 2rem;
		color: #828282;
	}

	.error button {
		margin-top: 1rem;
		background: #ff6600;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		cursor: pointer;
		border-radius: 3px;
	}

	.error button:hover {
		background: #e65c00;
	}
</style>
