<script lang="ts">
	import type { HNItem } from "../lib/api";
	import { getDomain, timeAgo } from "../lib/api";
	import { resolve } from "../router";

	interface Props {
		item: HNItem;
		rank?: number;
	}

	let { item, rank }: Props = $props();

	const domain = $derived(getDomain(item.url));
	const itemUrl = $derived(
		resolve("/item/:id", { id: item.id.toString() }),
	);
	const userUrl = $derived(
		item.by ? resolve("/user/:id", { id: item.by }) : "",
	);
</script>

<article class="story">
	{#if rank}
		<span class="rank">{rank}.</span>
	{/if}
	<div class="content">
		<h2>
			{#if item.url}
				<a href={item.url} class="title" target="_blank" rel="noopener">
					{item.title}
				</a>
				<span class="domain">({domain})</span>
			{:else}
				<a href={itemUrl} class="title">{item.title}</a>
			{/if}
		</h2>
		<div class="meta">
			{#if item.score !== undefined}
				<span>{item.score} points</span>
			{/if}
			{#if item.by}
				<span>
					by <a href={userUrl} class="user">{item.by}</a>
				</span>
			{/if}
			<span>{timeAgo(item.time)}</span>
			{#if item.descendants !== undefined}
				<a href={itemUrl} class="comments">
					{item.descendants} comment{
						item.descendants === 1 ? "" : "s"
					}
				</a>
			{/if}
		</div>
	</div>
</article>

<style>
	.story {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.5rem 0;
	}

	.rank {
		color: #828282;
		min-width: 1.5rem;
		text-align: right;
		font-size: 0.9rem;
	}

	.content {
		flex: 1;
	}

	h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: normal;
		line-height: 1.4;
	}

	.title {
		color: #000;
		text-decoration: none;
	}

	.title:visited {
		color: #828282;
	}

	.title:hover {
		text-decoration: underline;
	}

	.domain {
		color: #828282;
		font-size: 0.8rem;
		margin-left: 0.25rem;
	}

	.meta {
		font-size: 0.75rem;
		color: #828282;
		margin-top: 0.25rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.user,
	.comments {
		color: #828282;
		text-decoration: none;
	}

	.user:hover,
	.comments:hover {
		text-decoration: underline;
	}
</style>
