<script lang="ts">
	import Spinner from "../components/Spinner.svelte";
	import StoryItem from "../components/StoryItem.svelte";
	import {
		userQuery,
		userSubmissionsQuery,
	} from "../lib/queries.svelte";
	import { router } from "../router";

	const userId = $derived(router.current.params.id || "");
	const user = $derived(userQuery(userId));
	const submissions = $derived(userSubmissionsQuery(userId));

	function formatDate(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}
</script>

<div class="user-page">
	{#if user.isLoading}
		<div class="loading">
			<Spinner size="large" />
		</div>
	{:else if user.error || !user.data}
		<div class="error">
			<p>User not found</p>
		</div>
	{:else}
		<header class="profile">
			<h1>{user.data.id}</h1>
			<dl class="stats">
				<div>
					<dt>Karma</dt>
					<dd>{user.data.karma.toLocaleString()}</dd>
				</div>
				<div>
					<dt>Member since</dt>
					<dd>{formatDate(user.data.created)}</dd>
				</div>
			</dl>

			{#if user.data.about}
				<div class="about">
					{@html user.data.about}
				</div>
			{/if}
		</header>

		<section class="submissions">
			<h2>Submissions</h2>

			{#if submissions.isLoading}
				<div class="loading">
					<Spinner />
				</div>
			{:else if submissions.data?.length}
				<ul class="list">
					{#each submissions.data as item (item.id)}
						<li>
							<StoryItem {item} />
						</li>
					{/each}
				</ul>
			{:else}
				<p class="empty">No submissions yet.</p>
			{/if}
		</section>
	{/if}
</div>

<style>
	.user-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
	}

	.profile {
		background: #f6f6f0;
		padding: 1.5rem;
		border-radius: 4px;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 1.5rem;
		color: #ff6600;
		margin: 0 0 1rem 0;
	}

	.stats {
		display: flex;
		gap: 2rem;
		margin: 0 0 1rem 0;
	}

	.stats div {
		display: flex;
		flex-direction: column;
	}

	.stats dt {
		font-size: 0.75rem;
		color: #828282;
		text-transform: uppercase;
	}

	.stats dd {
		font-size: 1.25rem;
		font-weight: 500;
		margin: 0;
	}

	.about {
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.about :global(a) {
		color: #ff6600;
	}

	.submissions h2 {
		font-size: 1rem;
		color: #ff6600;
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #ff6600;
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

	.empty {
		color: #828282;
		text-align: center;
		padding: 2rem;
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: 2rem;
	}

	.error {
		text-align: center;
		padding: 3rem;
		color: #828282;
	}
</style>
