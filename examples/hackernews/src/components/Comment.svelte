<script lang="ts">
	import type { HNItem } from "../lib/api";
	import { timeAgo } from "../lib/api";
	import { resolve } from "../router";

	interface CommentWithChildren extends HNItem {
		children?: CommentWithChildren[];
	}

	interface Props {
		comment: CommentWithChildren;
		depth?: number;
	}

	let { comment, depth = 0 }: Props = $props();

	let collapsed = $state(false);

	const userUrl = $derived(
		comment.by ? resolve("/user/:id", { id: comment.by }) : "",
	);
</script>

<div class="comment" style="--depth: {depth}">
	<div class="header">
		<button class="toggle" onclick={() => (collapsed = !collapsed)}>
			[{collapsed ? "+" : "-"}]
		</button>
		{#if comment.by}
			<a href={userUrl} class="user">{comment.by}</a>
		{/if}
		<span class="time">{timeAgo(comment.time)}</span>
	</div>

	{#if !collapsed}
		<div class="body">
			{#if comment.text}
				{@html comment.text}
			{/if}
		</div>

		{#if comment.children?.length}
			<div class="replies">
				{#each comment.children as child (child.id)}
					<svelte:self comment={child} depth={depth + 1} />
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.comment {
		margin-left: calc(var(--depth) * 1.5rem);
		padding: 0.5rem 0;
		border-left: 2px solid transparent;
	}

	.comment:hover {
		border-left-color: #ff6600;
	}

	.header {
		font-size: 0.8rem;
		color: #828282;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.toggle {
		background: none;
		border: none;
		color: #828282;
		cursor: pointer;
		font-family: monospace;
		padding: 0;
		font-size: 0.75rem;
	}

	.toggle:hover {
		color: #ff6600;
	}

	.user {
		color: #828282;
		text-decoration: none;
		font-weight: 500;
	}

	.user:hover {
		text-decoration: underline;
	}

	.time {
		color: #999;
	}

	.body {
		font-size: 0.9rem;
		line-height: 1.5;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.body :global(a) {
		color: #000;
		word-break: break-all;
	}

	.body :global(pre) {
		overflow-x: auto;
		background: #f6f6f0;
		padding: 0.5rem;
		font-size: 0.85rem;
	}

	.body :global(code) {
		font-family: monospace;
	}

	.body :global(p) {
		margin: 0.5rem 0;
	}

	.replies {
		margin-top: 0.5rem;
	}
</style>
