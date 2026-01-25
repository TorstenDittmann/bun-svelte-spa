<script lang="ts">
	import Comment from "../components/Comment.svelte";
	import Spinner from "../components/Spinner.svelte";
	import { getDomain, timeAgo } from "../lib/api";
	import { itemQuery } from "../lib/queries.svelte";
	import { resolve, router } from "../router";

	const id = $derived(parseInt(router.current.params.id || "0", 10));
	const item = $derived(itemQuery(id));

	const domain = $derived(getDomain(item.data?.url));
	const userUrl = $derived(
		item.data?.by ? resolve("/user/:id", { id: item.data.by }) : "",
	);
</script>

<article class="item-page">
	{#if item.isLoading}
		<div class="loading">
			<Spinner size="large" />
		</div>
	{:else if item.error}
		<div class="error">
			<p>Failed to load item</p>
			<button onclick={() => item.refetch()}>Try Again</button>
		</div>
	{:else if item.data}
		<header>
			<h1>
				{#if item.data.url}
					<a href={item.data.url} target="_blank" rel="noopener">
						{item.data.title}
					</a>
					<span class="domain">({domain})</span>
				{:else}
					{item.data.title}
				{/if}
			</h1>

			<div class="meta">
				{#if item.data.score !== undefined}
					<span>{item.data.score} points</span>
				{/if}
				{#if item.data.by}
					<span>
						by <a href={userUrl} class="user">{item.data.by}</a>
					</span>
				{/if}
				<span>{timeAgo(item.data.time)}</span>
				{#if item.data.descendants !== undefined}
					<span>{item.data.descendants} comments</span>
				{/if}
			</div>
		</header>

		{#if item.data.text}
			<div class="text">
				{@html item.data.text}
			</div>
		{/if}

		{#if item.data.children?.length}
			<section class="comments">
				<h2>Comments</h2>
				{#each item.data.children as comment (comment.id)}
					<Comment {comment} />
				{/each}
			</section>
		{:else if item.data.descendants === 0}
			<p class="no-comments">No comments yet.</p>
		{/if}
	{/if}
</article>

<style>
	.item-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
	}

	header {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e0e0e0;
	}

	h1 {
		font-size: 1.25rem;
		font-weight: normal;
		margin: 0 0 0.5rem 0;
		line-height: 1.4;
	}

	h1 a {
		color: #000;
		text-decoration: none;
	}

	h1 a:hover {
		text-decoration: underline;
	}

	.domain {
		color: #828282;
		font-size: 0.85rem;
		margin-left: 0.25rem;
	}

	.meta {
		font-size: 0.8rem;
		color: #828282;
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.user {
		color: #828282;
		text-decoration: none;
	}

	.user:hover {
		text-decoration: underline;
	}

	.text {
		background: #f6f6f0;
		padding: 1rem;
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
		line-height: 1.6;
		border-radius: 4px;
	}

	.text :global(a) {
		color: #000;
		word-break: break-all;
	}

	.text :global(p) {
		margin: 0.5rem 0;
	}

	.comments h2 {
		font-size: 1rem;
		color: #ff6600;
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #ff6600;
	}

	.no-comments {
		color: #828282;
		text-align: center;
		padding: 2rem;
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
</style>
