<script lang="ts">
	import { api } from "@lib/api";
	import type { Post } from "@lib/api";
	import ErrorMessage from "@lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "@lib/components/LoadingSpinner.svelte";
	import SearchBar from "@lib/components/SearchBar.svelte";
	import { filteredPosts, posts, searchQuery } from "@lib/stores";
	import { goto } from "@router";
	import { onMount } from "svelte";

	let loading = $state(true);
	let error = $state<string | null>(null);
	let viewMode = $state<"grid" | "list">("list");
	let sortBy = $state<"title" | "id" | "userId">("id");
	let sortDirection = $state<"asc" | "desc">("desc");
	let searchTerm = $state("");
	let currentPage = $state(1);
	let postsPerPage = $state(12);

	const displayPosts = $derived(
		sortPosts($filteredPosts, sortBy, sortDirection),
	);
	const paginatedPosts = $derived(paginate(
		displayPosts,
		currentPage,
		postsPerPage,
	));
	const totalPages = $derived(
		Math.ceil(displayPosts.length / postsPerPage),
	);

	onMount(async () => {
		try {
			posts.setLoading();
			const postsData = await api.getPosts();
			posts.setData(postsData);
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load posts";
			posts.setError({ message: error });
		} finally {
			loading = false;
		}
	});

	function sortPosts(
		postsList: Post[],
		sortKey: string,
		direction: string,
	): Post[] {
		if (!postsList) return [];

		const sorted = [...postsList].sort((a, b) => {
			let aValue: string | number;
			let bValue: string | number;

			switch (sortKey) {
				case "title":
					aValue = a.title.toLowerCase();
					bValue = b.title.toLowerCase();
					break;
				case "id":
					aValue = a.id;
					bValue = b.id;
					break;
				case "userId":
					aValue = a.userId;
					bValue = b.userId;
					break;
				default:
					aValue = a.id;
					bValue = b.id;
			}

			if (direction === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return sorted;
	}

	function paginate(
		items: Post[],
		page: number,
		perPage: number,
	): Post[] {
		const start = (page - 1) * perPage;
		const end = start + perPage;
		return items.slice(start, end);
	}

	function handleSort(key: typeof sortBy) {
		if (sortBy === key) {
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		} else {
			sortBy = key;
			sortDirection = "asc";
		}
		currentPage = 1; // Reset to first page when sorting
	}

	function handlePageChange(page: number) {
		currentPage = page;
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function handleViewPost(postId: number) {
		goto("/posts/:id", { id: postId.toString() });
	}

	function handleViewUser(userId: number) {
		goto("/users/:id", { id: userId.toString() });
	}

	function handleRetry() {
		window.location.reload();
	}

	function truncateText(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	}
</script>

<div class="posts-page">
	<div class="page-header">
		<div class="header-content">
			<h1>Posts</h1>
			<p>Browse and search through blog posts</p>
		</div>

		<div class="header-actions">
			<SearchBar
				bind:value={searchTerm}
				placeholder="Search posts by title or content..."
			/>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading posts..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Failed to Load Posts"
			onRetry={handleRetry}
		/>
	{:else}
		<!-- Controls -->
		<div class="controls">
			<div class="view-controls">
				<span class="control-label">View:</span>
				<div class="view-toggle">
					<button
						class="view-btn"
						class:active={viewMode === "grid"}
						onclick={() => viewMode = "grid"}
						aria-label="Grid view"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								x="3"
								y="3"
								width="7"
								height="7"
								stroke="currentColor"
								stroke-width="2"
								fill="none"
							/>
							<rect
								x="14"
								y="3"
								width="7"
								height="7"
								stroke="currentColor"
								stroke-width="2"
								fill="none"
							/>
							<rect
								x="14"
								y="14"
								width="7"
								height="7"
								stroke="currentColor"
								stroke-width="2"
								fill="none"
							/>
							<rect
								x="3"
								y="14"
								width="7"
								height="7"
								stroke="currentColor"
								stroke-width="2"
								fill="none"
							/>
						</svg>
					</button>
					<button
						class="view-btn"
						class:active={viewMode === "list"}
						onclick={() => viewMode = "list"}
						aria-label="List view"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<line
								x1="8"
								y1="6"
								x2="21"
								y2="6"
								stroke="currentColor"
								stroke-width="2"
							/>
							<line
								x1="8"
								y1="12"
								x2="21"
								y2="12"
								stroke="currentColor"
								stroke-width="2"
							/>
							<line
								x1="8"
								y1="18"
								x2="21"
								y2="18"
								stroke="currentColor"
								stroke-width="2"
							/>
							<line
								x1="3"
								y1="6"
								x2="3.01"
								y2="6"
								stroke="currentColor"
								stroke-width="2"
							/>
							<line
								x1="3"
								y1="12"
								x2="3.01"
								y2="12"
								stroke="currentColor"
								stroke-width="2"
							/>
							<line
								x1="3"
								y1="18"
								x2="3.01"
								y2="18"
								stroke="currentColor"
								stroke-width="2"
							/>
						</svg>
					</button>
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
						ID
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
					<button
						class="sort-btn"
						class:active={sortBy === "userId"}
						onclick={() => handleSort("userId")}
					>
						Author
						{#if sortBy === "userId"}
							<span
								class="sort-arrow"
								class:desc={sortDirection === "desc"}
							>↑</span>
						{/if}
					</button>
				</div>
			</div>

			<div class="results-info">
				<span class="count-text">
					{displayPosts.length} post{
						displayPosts.length !== 1 ? "s" : ""
					} found
				</span>
				<span class="page-info">
					Page {currentPage} of {totalPages}
				</span>
			</div>
		</div>

		<!-- Posts List/Grid -->
		{#if displayPosts.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📝</div>
				<h3>No posts found</h3>
				<p>
					Try adjusting your search criteria or clear the search to
					see all posts.
				</p>
				<button
					class="btn btn-primary"
					onclick={() => searchQuery.set("")}
				>
					Clear Search
				</button>
			</div>
		{:else}
			<div
				class="posts-container"
				class:grid-view={viewMode === "grid"}
				class:list-view={viewMode === "list"}
			>
				{#each paginatedPosts as post (post.id)}
					<a
						href="/posts/{post.id}"
						class="post-item"
					>
						<div class="post-header">
							<div class="post-meta">
								<span class="post-id">#{post.id}</span>
								<button
									class="post-author"
									onclick={(e) => {
										e.stopPropagation();
										handleViewUser(post.userId);
									}}
								>
									User {post.userId}
								</button>
							</div>
						</div>

						<div class="post-content">
							<h2 class="post-title">{post.title}</h2>
							<p class="post-body">
								{
									viewMode === "grid"
										? truncateText(post.body, 120)
										: truncateText(
											post.body,
											200,
										)
								}
							</p>
						</div>

						<div class="post-footer">
							<span class="read-more">Read more →</span>
						</div>
					</a>
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="pagination">
					<button
						class="pagination-btn"
						disabled={currentPage === 1}
						onclick={() => handlePageChange(currentPage - 1)}
					>
						← Previous
					</button>

					<div class="pagination-numbers">
						{#each Array(totalPages) as _, index}
							{@const pageNum = index + 1}
							{#if 				pageNum === 1 || pageNum === totalPages
					|| (pageNum >= currentPage - 2
						&& pageNum <= currentPage + 2)}
								<button
									class="pagination-number"
									class:active={pageNum === currentPage}
									onclick={() => handlePageChange(pageNum)}
								>
									{pageNum}
								</button>
							{:else if 				pageNum === currentPage - 3
					|| pageNum === currentPage + 3}
								<span class="pagination-ellipsis">...</span>
							{/if}
						{/each}
					</div>

					<button
						class="pagination-btn"
						disabled={currentPage === totalPages}
						onclick={() => handlePageChange(currentPage + 1)}
					>
						Next →
					</button>
				</div>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.posts-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--spacing-md);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-2xl);
	}

	.header-content h1 {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		margin-bottom: var(--spacing-sm);
		color: var(--color-text-primary);
	}

	.header-content p {
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.header-actions {
		flex-shrink: 0;
		min-width: 300px;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
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

	.view-controls,
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

	.view-toggle {
		display: flex;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.view-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: var(--color-bg-primary);
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-btn:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
	}

	.view-btn.active {
		background: var(--color-primary);
		color: white;
	}

	.sort-buttons {
		display: flex;
		gap: var(--spacing-xs);
		flex-wrap: wrap;
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

	.results-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--spacing-xs);
	}

	.count-text,
	.page-info {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	/* Posts Container */
	.posts-container {
		display: grid;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}

	.posts-container.grid-view {
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	}

	.posts-container.list-view {
		grid-template-columns: 1fr;
		gap: var(--spacing-md);
	}

	.post-item {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		text-decoration: none;
		color: inherit;
	}

	.post-item:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-border-hover);
		text-decoration: none;
		color: inherit;
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

	.post-author {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-xs);
		color: var(--color-primary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.post-author:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-border-hover);
	}

	.post-content {
		flex: 1;
	}

	.post-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
		line-height: 1.3;
	}

	.list-view .post-title {
		font-size: var(--font-size-xl);
	}

	.post-body {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin: 0;
	}

	.list-view .post-body {
		font-size: var(--font-size-base);
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

	/* Pagination */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-xl);
	}

	.pagination-btn {
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.pagination-btn:hover:not(:disabled) {
		background: var(--color-bg-secondary);
		border-color: var(--color-border-hover);
		color: var(--color-text-primary);
	}

	.pagination-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pagination-numbers {
		display: flex;
		gap: var(--spacing-xs);
	}

	.pagination-number {
		width: 40px;
		height: 40px;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pagination-number:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-border-hover);
		color: var(--color-text-primary);
	}

	.pagination-number.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: white;
	}

	.pagination-ellipsis {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: stretch;
		}

		.header-actions {
			min-width: auto;
		}

		.controls {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-md);
		}

		.view-controls,
		.sort-controls {
			justify-content: center;
		}

		.results-info {
			align-items: center;
		}

		.posts-container.grid-view {
			grid-template-columns: 1fr;
		}

		.sort-buttons {
			justify-content: center;
		}

		.pagination {
			flex-wrap: wrap;
		}

		.pagination-numbers {
			order: -1;
		}
	}

	@media (max-width: 480px) {
		.posts-page {
			padding: var(--spacing-sm);
		}

		.page-header {
			gap: var(--spacing-md);
		}

		.header-content h1 {
			font-size: var(--font-size-2xl);
		}

		.header-content p {
			font-size: var(--font-size-base);
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

		.pagination-numbers {
			gap: var(--spacing-xs);
		}

		.pagination-number {
			width: 36px;
			height: 36px;
		}
	}
</style>
