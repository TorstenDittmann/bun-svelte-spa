<script>
	import { api } from "@lib/api";
	import ErrorMessage from "@lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "@lib/components/LoadingSpinner.svelte";
	import { goto } from "@router";
	import { route } from "bun-svelte-spa/runtime";

	let userId = $state("");
	let user = $state(null);
	let posts = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let searchTerm = $state("");
	let sortBy = $state("id");
	let sortDirection = $state("desc");

	let filteredPosts = $derived(() => {
		if (!searchTerm.trim()) return posts;
		const query = searchTerm.toLowerCase();
		return posts.filter(post =>
			post.title.toLowerCase().includes(query)
			|| post.body.toLowerCase().includes(query)
		);
	});

	let sortedPosts = $derived(() => {
		if (!filteredPosts) return [];
		return [...filteredPosts].sort((a, b) => {
			let aValue = sortBy === "title"
				? a.title.toLowerCase()
				: a.id;
			let bValue = sortBy === "title"
				? b.title.toLowerCase()
				: b.id;

			if (sortDirection === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});
	});

	$effect(() => {
		const newUserId = $route.params.id;

		if (!newUserId) {
			error = "Invalid user ID";
			loading = false;
			return;
		}

		if (newUserId !== userId) {
			userId = newUserId;
			loadUserPosts();
		}
	});

	async function loadUserPosts() {
		try {
			loading = true;
			error = null;

			const [userData, postsData] = await Promise.all([
				api.getUser(parseInt(userId)),
				api.getUserPosts(parseInt(userId)),
			]);

			user = userData;
			posts = postsData;
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load user posts";
		} finally {
			loading = false;
		}
	}

	function handleSort(key) {
		if (sortBy === key) {
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		} else {
			sortBy = key;
			sortDirection = "asc";
		}
	}

	function handleViewPost(postId) {
		goto(`/posts/${postId}`);
	}

	function handleBackToUser() {
		goto(`/users/${userId}`);
	}

	function truncateText(text, maxLength) {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	}
</script>

<div class="user-posts-page">
	<!-- Navigation -->
	<div class="page-nav">
		<button class="back-btn" onclick={handleBackToUser}>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="m15 18-6-6 6-6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			Back to Profile
		</button>
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading user posts..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Failed to Load Posts"
			onRetry={loadUserPosts}
		/>
	{:else if user}
		<!-- Header -->
		<div class="page-header">
			<div class="user-info">
				<div class="user-avatar">
					{
						user.name.split(" ").map(n => n[0]).join(
							"",
						).toUpperCase()
					}
				</div>
				<div class="user-details">
					<h1>Posts by {user.name}</h1>
					<p class="user-meta">
						@{user.username} • {posts.length} posts
					</p>
				</div>
			</div>
		</div>

		<!-- Controls -->
		<div class="controls">
			<div class="search-container">
				<input
					bind:value={searchTerm}
					type="text"
					placeholder="Search posts..."
					class="search-input"
				/>
				<div class="search-icon">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle
							cx="11"
							cy="11"
							r="8"
							stroke="currentColor"
							stroke-width="2"
						/>
						<path
							d="m21 21-4.35-4.35"
							stroke="currentColor"
							stroke-width="2"
						/>
					</svg>
				</div>
			</div>

			<div class="sort-controls">
				<span class="control-label">Sort by:</span>
				<div class="sort-buttons">
					<button
						class="sort-btn"
						class:active={sortBy === "id"}
						onclick={() => handleSort("id")}
					>
						Date
						{#if sortBy === "id"}
							<span
								class="sort-arrow"
								class:desc={sortDirection === "desc"}
							>↑</span>
						{/if}
					</button>
					<button
						class="sort-btn"
						class:active={sortBy === "title"}
						onclick={() => handleSort("title")}
					>
						Title
						{#if sortBy === "title"}
							<span
								class="sort-arrow"
								class:desc={sortDirection === "desc"}
							>↑</span>
						{/if}
					</button>
				</div>
			</div>

			<div class="results-count">
				<span class="count-text">
					{filteredPosts.length} post{
						filteredPosts.length !== 1 ? "s" : ""
					} found
				</span>
			</div>
		</div>

		<!-- Posts List -->
		{#if sortedPosts.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📝</div>
				<h3>No posts found</h3>
				<p>
					{
						searchTerm.trim()
							? "Try adjusting your search criteria."
							: `${user.name} hasn't created any posts yet.`
					}
				</p>
				{#if searchTerm.trim()}
					<button
						class="btn btn-primary"
						onclick={() => searchTerm = ""}
					>
						Clear Search
					</button>
				{/if}
			</div>
		{:else}
			<div class="posts-list">
				{#each sortedPosts as post (post.id)}
					<article
						class="post-card"
						onclick={() => handleViewPost(post.id)}
					>
						<div class="post-header">
							<div class="post-meta">
								<span class="post-id">#{post.id}</span>
								<span class="post-date">Post {post.id}</span>
							</div>
						</div>

						<div class="post-content">
							<h2 class="post-title">{post.title}</h2>
							<p class="post-body">
								{truncateText(post.body, 200)}
							</p>
						</div>

						<div class="post-footer">
							<span class="read-more">Read full post →</span>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
.user-posts-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: var(--spacing-md);
}

.page-nav {
	margin-bottom: var(--spacing-lg);
}

.back-btn {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	background: none;
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	padding: var(--spacing-sm) var(--spacing-md);
	color: var(--color-text-secondary);
	cursor: pointer;
	transition: all 0.2s ease;
}

.back-btn:hover {
	background: var(--color-bg-secondary);
	border-color: var(--color-border-hover);
	color: var(--color-text-primary);
}

.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 400px;
}

/* Page Header */
.page-header {
	margin-bottom: var(--spacing-xl);
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	padding: var(--spacing-xl);
}

.user-info {
	display: flex;
	align-items: center;
	gap: var(--spacing-lg);
}

.user-avatar {
	width: 80px;
	height: 80px;
	background: linear-gradient(
		135deg,
		var(--color-primary),
		var(--color-secondary)
	);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: 700;
	font-size: var(--font-size-xl);
	flex-shrink: 0;
}

.user-details h1 {
	font-size: var(--font-size-2xl);
	font-weight: 700;
	margin-bottom: var(--spacing-xs);
	color: var(--color-text-primary);
}

.user-meta {
	font-size: var(--font-size-base);
	color: var(--color-text-secondary);
	margin: 0;
}

/* Controls */
.controls {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: var(--spacing-lg);
	margin-bottom: var(--spacing-xl);
	padding: var(--spacing-md);
	background: var(--color-bg-secondary);
	border-radius: var(--radius-lg);
	flex-wrap: wrap;
}

.search-container {
	position: relative;
	max-width: 300px;
	flex: 1;
}

.search-input {
	width: 100%;
	padding: var(--spacing-sm) var(--spacing-xl) var(--spacing-sm)
		var(--spacing-md);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	background: var(--color-bg-primary);
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
}

.search-input:focus {
	outline: none;
	border-color: var(--color-primary);
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
	position: absolute;
	right: var(--spacing-md);
	top: 50%;
	transform: translateY(-50%);
	color: var(--color-text-muted);
	pointer-events: none;
}

.sort-controls {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
}

.control-label {
	font-size: var(--font-size-sm);
	font-weight: 500;
	color: var(--color-text-secondary);
}

.sort-buttons {
	display: flex;
	gap: var(--spacing-xs);
}

.sort-btn {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	padding: var(--spacing-xs) var(--spacing-sm);
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: all 0.2s ease;
}

.sort-btn:hover {
	background: var(--color-bg-secondary);
	border-color: var(--color-border-hover);
	color: var(--color-text-primary);
}

.sort-btn.active {
	background: var(--color-primary);
	border-color: var(--color-primary);
	color: white;
}

.sort-arrow {
	font-size: var(--font-size-xs);
	transition: transform 0.2s ease;
}

.sort-arrow.desc {
	transform: rotate(180deg);
}

.results-count {
	margin-left: auto;
}

.count-text {
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
	font-weight: 500;
}

/* Posts List */
.posts-list {
	display: grid;
	gap: var(--spacing-lg);
}

.post-card {
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	padding: var(--spacing-lg);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.post-card:hover {
	transform: translateY(-2px);
	box-shadow: var(--shadow-md);
	border-color: var(--color-border-hover);
}

.post-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.post-meta {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
}

.post-id {
	font-size: var(--font-size-xs);
	color: var(--color-text-muted);
	font-weight: 500;
}

.post-date {
	font-size: var(--font-size-xs);
	color: var(--color-text-muted);
}

.post-content {
	flex: 1;
}

.post-title {
	font-size: var(--font-size-xl);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-sm);
	line-height: 1.3;
}

.post-body {
	font-size: var(--font-size-base);
	color: var(--color-text-secondary);
	line-height: 1.6;
	margin: 0;
}

.post-footer {
	display: flex;
	justify-content: flex-end;
}

.read-more {
	font-size: var(--font-size-sm);
	color: var(--color-primary);
	font-weight: 500;
}

/* Empty State */
.empty-state {
	text-align: center;
	padding: var(--spacing-2xl);
	background: var(--color-bg-secondary);
	border-radius: var(--radius-lg);
	margin: var(--spacing-xl) 0;
}

.empty-icon {
	font-size: 4rem;
	margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
	font-size: var(--font-size-xl);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-sm);
}

.empty-state p {
	font-size: var(--font-size-base);
	color: var(--color-text-secondary);
	margin-bottom: var(--spacing-lg);
	max-width: 400px;
	margin-left: auto;
	margin-right: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
	.user-info {
		flex-direction: column;
		text-align: center;
		gap: var(--spacing-md);
	}

	.user-avatar {
		width: 60px;
		height: 60px;
		font-size: var(--font-size-lg);
	}

	.user-details h1 {
		font-size: var(--font-size-xl);
	}

	.controls {
		flex-direction: column;
		align-items: stretch;
		gap: var(--spacing-md);
	}

	.search-container {
		max-width: none;
	}

	.sort-controls {
		justify-content: center;
	}

	.results-count {
		margin-left: 0;
		text-align: center;
	}
}

@media (max-width: 480px) {
	.user-posts-page {
		padding: var(--spacing-sm);
	}

	.page-header {
		padding: var(--spacing-lg);
	}

	.controls {
		padding: var(--spacing-sm);
	}

	.sort-buttons {
		flex-direction: column;
		align-items: stretch;
	}

	.sort-btn {
		justify-content: center;
	}

	.post-title {
		font-size: var(--font-size-lg);
	}
}
</style>
