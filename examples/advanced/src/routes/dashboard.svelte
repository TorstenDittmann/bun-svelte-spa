<script lang="ts">
	import { api } from "@lib/api";
	import type { Post, User } from "@lib/api";
	import ErrorMessage from "@lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "@lib/components/LoadingSpinner.svelte";
	import UserCard from "@lib/components/UserCard.svelte";
	import { albums, posts, stats, users } from "@lib/stores";
	import { resolve } from "@router";
	import { onMount } from "svelte";

	let recentUsers = $state<User[]>([]);
	let recentPosts = $state<Post[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			// Load dashboard data
			const [usersData, postsData, albumsData] = await Promise
				.all([
					api.getUsers(),
					api.getPosts(),
					api.getAlbums(),
				]);

			users.setData(usersData);
			posts.setData(postsData);
			albums.setData(albumsData);

			// Get recent data for display
			recentUsers = usersData.slice(0, 3);
			recentPosts = postsData.slice(0, 5);
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load dashboard data";
		} finally {
			loading = false;
		}
	});
</script>

<div class="dashboard">
	<div class="dashboard-header">
		<h1>Dashboard</h1>
		<p>Overview of your application data and recent activity</p>
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading dashboard data..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Dashboard Error"
			onRetry={() => window.location.reload()}
		/>
	{:else}
		<!-- Statistics Cards -->
		<section class="stats-section">
			<h2>Statistics</h2>
			<div class="stats-grid">
				<div class="stat-card primary">
					<div class="stat-content">
						<div class="stat-number">{$stats.totalUsers}</div>
						<div class="stat-label">Total Users</div>
					</div>
					<div class="stat-icon">👥</div>
					<a href={resolve("/users")} class="stat-action">
						View All
					</a>
				</div>

				<div class="stat-card secondary">
					<div class="stat-content">
						<div class="stat-number">{$stats.totalPosts}</div>
						<div class="stat-label">Total Posts</div>
					</div>
					<div class="stat-icon">📝</div>
					<a href={resolve("/posts")} class="stat-action">
						View All
					</a>
				</div>

				<div class="stat-card accent">
					<div class="stat-content">
						<div class="stat-number">{$stats.totalAlbums}</div>
						<div class="stat-label">Total Albums</div>
					</div>
					<div class="stat-icon">📁</div>
					<a href={resolve("/albums")} class="stat-action">
						View All
					</a>
				</div>
			</div>
		</section>

		<!-- Recent Activity -->
		<div class="dashboard-content">
			<!-- Recent Users -->
			<section class="recent-section">
				<div class="section-header">
					<h2>Recent Users</h2>
					<a
						href={resolve("/users")}
						class="btn btn-secondary btn-sm"
					>
						View All Users
					</a>
				</div>

				<div class="users-grid">
					{#each recentUsers as user (user.id)}
						<UserCard {user} compact={true} />
					{/each}
				</div>
			</section>

			<!-- Recent Posts -->
			<section class="recent-section">
				<div class="section-header">
					<h2>Recent Posts</h2>
					<a
						href={resolve("/posts")}
						class="btn btn-secondary btn-sm"
					>
						View All Posts
					</a>
				</div>

				<div class="posts-list">
					{#each recentPosts as post (post.id)}
						<a
							href="/posts/{post.id}"
							class="post-item"
						>
							<div class="post-content">
								<h3 class="post-title">{post.title}</h3>
								<p class="post-body">
									{
										post.body.slice(
											0,
											120,
										)
									}...
								</p>
								<div class="post-meta">
									<span class="post-id">#{post.id}</span>
									<span class="post-user">User {
											post
												.userId
										}</span>
								</div>
							</div>
							<div class="post-arrow">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="m9 18 6-6-6-6"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
						</a>
					{/each}
				</div>
			</section>
		</div>

		<!-- Quick Actions -->
		<section class="quick-actions">
			<h2>Quick Actions</h2>
			<div class="actions-grid">
				<a href={resolve("/search")} class="action-card">
					<div class="action-icon">🔍</div>
					<div class="action-content">
						<h3>Search</h3>
						<p>Find users, posts, and albums</p>
					</div>
				</a>

				<button
					class="action-card"
					onclick={() => console.log("Feature coming soon!")}
				>
					<div class="action-icon">⚙️</div>
					<div class="action-content">
						<h3>Settings</h3>
						<p>Configure preferences</p>
					</div>
				</button>

				<button
					class="action-card"
					onclick={() =>
						console.log("Analytics feature coming soon!")}
				>
					<div class="action-icon">📊</div>
					<div class="action-content">
						<h3>Analytics</h3>
						<p>View detailed insights</p>
					</div>
				</button>
			</div>
		</section>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--spacing-md);
	}

	.dashboard-header {
		margin-bottom: var(--spacing-2xl);
		text-align: center;
	}

	.dashboard-header h1 {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		margin-bottom: var(--spacing-sm);
		color: var(--color-text-primary);
	}

	.dashboard-header p {
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
	}

	/* Statistics Section */
	.stats-section {
		margin-bottom: var(--spacing-2xl);
	}

	.stats-section h2 {
		font-size: var(--font-size-2xl);
		font-weight: 600;
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-primary);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-2xl);
	}

	.stat-card {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		position: relative;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.stat-card.primary {
		border-left: 4px solid var(--color-primary);
	}
	.stat-card.secondary {
		border-left: 4px solid var(--color-secondary);
	}
	.stat-card.accent {
		border-left: 4px solid var(--color-accent);
	}

	.stat-content {
		margin-bottom: var(--spacing-md);
	}

	.stat-number {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1;
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: 500;
		margin-top: var(--spacing-xs);
	}

	.stat-icon {
		position: absolute;
		top: var(--spacing-lg);
		right: var(--spacing-lg);
		font-size: 2rem;
		opacity: 0.3;
	}

	.stat-action {
		display: inline-block;
		background: none;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.stat-action:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-border-hover);
		color: var(--color-text-primary);
		text-decoration: none;
	}

	/* Dashboard Content */
	.dashboard-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-2xl);
		margin-bottom: var(--spacing-2xl);
	}

	.recent-section {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
	}

	.section-header h2 {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.users-grid {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	/* Posts List */
	.posts-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.post-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.post-item:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-border-hover);
	}

	.post-content {
		flex: 1;
		min-width: 0;
	}

	.post-title {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--spacing-xs) 0;
		line-height: 1.3;
	}

	.post-body {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: 0 0 var(--spacing-xs) 0;
		line-height: 1.4;
	}

	.post-meta {
		display: flex;
		gap: var(--spacing-sm);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.post-id {
		font-weight: 500;
	}

	.post-arrow {
		color: var(--color-text-muted);
		transition: all 0.2s ease;
	}

	.post-item:hover .post-arrow {
		color: var(--color-primary);
		transform: translateX(2px);
	}

	/* Quick Actions */
	.quick-actions {
		margin-bottom: var(--spacing-2xl);
	}

	.quick-actions h2 {
		font-size: var(--font-size-2xl);
		font-weight: 600;
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-primary);
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-md);
	}

	.post-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		color: inherit;
		text-align: left;
	}

	.post-item:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-border-hover);
		text-decoration: none;
		color: inherit;
	}

	.action-card {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		color: inherit;
		display: block;
		text-align: center;
	}

	.action-card:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-border-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
		text-decoration: none;
		color: inherit;
	}

	.action-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.action-content h3 {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--spacing-xs) 0;
	}

	.action-content p {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.dashboard-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}

		.action-card {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
