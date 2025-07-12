<script lang="ts">
	import { onMount } from "svelte";
	import { api } from "../lib/api";
	import type { Album, Post, User } from "../lib/api";
	import ErrorMessage from "../lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "../lib/components/LoadingSpinner.svelte";
	import SearchBar from "../lib/components/SearchBar.svelte";
	import UserCard from "../lib/components/UserCard.svelte";
	import { debouncedSearch, searchQuery } from "../lib/stores";
	import { goto } from "../router";

	let loading = false;
	let error: string | null = null;
	let searchTerm = "";
	let activeTab: "all" | "users" | "posts" | "albums" = "all";

	let allUsers: User[] = [];
	let allPosts: Post[] = [];
	let allAlbums: Album[] = [];

	let filteredUsers: User[] = [];
	let filteredPosts: Post[] = [];
	let filteredAlbums: Album[] = [];

	$: {
		if (searchTerm.trim()) {
			filterResults(searchTerm);
		} else {
			clearResults();
		}
	}

	$: totalResults = filteredUsers.length + filteredPosts.length
		+ filteredAlbums.length;

	onMount(async () => {
		try {
			loading = true;
			// Load all data for searching
			const [usersData, postsData, albumsData] = await Promise
				.all([
					api.getUsers(),
					api.getPosts(),
					api.getAlbums(),
				]);

			allUsers = usersData;
			allPosts = postsData;
			allAlbums = albumsData;
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load search data";
		} finally {
			loading = false;
		}
	});

	function filterResults(query: string) {
		const lowercaseQuery = query.toLowerCase();

		// Filter users
		filteredUsers = allUsers.filter(user =>
			user.name.toLowerCase().includes(lowercaseQuery)
			|| user.username.toLowerCase().includes(lowercaseQuery)
			|| user.email.toLowerCase().includes(lowercaseQuery)
			|| user.company.name.toLowerCase().includes(lowercaseQuery)
		);

		// Filter posts
		filteredPosts = allPosts.filter(post =>
			post.title.toLowerCase().includes(lowercaseQuery)
			|| post.body.toLowerCase().includes(lowercaseQuery)
		);

		// Filter albums
		filteredAlbums = allAlbums.filter(album =>
			album.title.toLowerCase().includes(lowercaseQuery)
		);
	}

	function clearResults() {
		filteredUsers = [];
		filteredPosts = [];
		filteredAlbums = [];
	}

	function handleSearch(query: string) {
		searchTerm = query;
		debouncedSearch(query);
	}

	function handleViewUser(userId: number) {
		goto(`/users/${userId}`);
	}

	function handleViewPost(postId: number) {
		goto(`/posts/${postId}`);
	}

	function handleViewAlbum(albumId: number) {
		goto(`/albums/${albumId}`);
	}

	function truncateText(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	}

	function highlightText(text: string, query: string): string {
		if (!query.trim()) return text;

		const regex = new RegExp(`(${query})`, "gi");
		return text.replace(regex, "<mark>$1</mark>");
	}
</script>

<div class="search-page">
	<div class="page-header">
		<div class="header-content">
			<h1>Search</h1>
			<p>Find users, posts, and albums across the platform</p>
		</div>
	</div>

	<!-- Search Bar -->
	<div class="search-section">
		<div class="search-container">
			<SearchBar
				bind:value={searchTerm}
				placeholder="Search for users, posts, or albums..."
			/>
		</div>

		{#if searchTerm.trim()}
			<div class="search-info">
				<span class="search-query">Results for "{searchTerm}"</span>
				<span class="search-count">{totalResults} results found</span>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading search data..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Search Error"
			onRetry={() => window.location.reload()}
		/>
	{:else if searchTerm.trim()}
		<!-- Search Results -->
		<div class="search-results">
			<!-- Tabs -->
			<div class="search-tabs">
				<button
					class="search-tab"
					class:active={activeTab === "all"}
					onclick={() => activeTab = "all"}
				>
					All ({totalResults})
				</button>
				<button
					class="search-tab"
					class:active={activeTab === "users"}
					onclick={() => activeTab = "users"}
				>
					Users ({filteredUsers.length})
				</button>
				<button
					class="search-tab"
					class:active={activeTab === "posts"}
					onclick={() => activeTab = "posts"}
				>
					Posts ({filteredPosts.length})
				</button>
				<button
					class="search-tab"
					class:active={activeTab === "albums"}
					onclick={() => activeTab = "albums"}
				>
					Albums ({filteredAlbums.length})
				</button>
			</div>

			<!-- Results Content -->
			<div class="results-content">
				{#if totalResults === 0}
					<div class="no-results">
						<div class="no-results-icon">🔍</div>
						<h3>No results found</h3>
						<p>
							Try searching with different keywords or check your
							spelling.
						</p>
					</div>
				{:else}
					<!-- All Results -->
					{#if activeTab === "all"}
						<div class="all-results">
							<!-- Users Section -->
							{#if filteredUsers.length > 0}
								<section class="results-section">
									<div class="section-header">
										<h2>
											Users ({
												filteredUsers
													.length
											})
										</h2>
										<button
											class="view-all-btn"
											onclick={() =>
												activeTab = "users"}
										>
											View All
										</button>
									</div>
									<div class="users-grid">
										{#each 							filteredUsers.slice(
								0,
								3,
							) as
											user
											(user.id)
										}
											<div
												onclick={() =>
													handleViewUser(
														user.id,
													)}
											>
												<UserCard
													{user}
													compact={true}
													showActions={false}
												/>
											</div>
										{/each}
									</div>
								</section>
							{/if}

							<!-- Posts Section -->
							{#if filteredPosts.length > 0}
								<section class="results-section">
									<div class="section-header">
										<h2>
											Posts ({
												filteredPosts
													.length
											})
										</h2>
										<button
											class="view-all-btn"
											onclick={() =>
												activeTab = "posts"}
										>
											View All
										</button>
									</div>
									<div class="posts-list">
										{#each 							filteredPosts.slice(
								0,
								5,
							) as
											post
											(post.id)
										}
											<div
												class="post-result"
												onclick={() =>
													handleViewPost(
														post.id,
													)}
											>
												<h3 class="post-title">
													{@html 									highlightText(
										post.title,
										searchTerm,
									)}
												</h3>
												<p class="post-body">
													{@html 									highlightText(
										truncateText(
											post.body,
											150,
										),
										searchTerm,
									)}
												</p>
												<div class="post-meta">
													<span class="post-id">#{
															post
																.id
														}</span>
													<span
														class="post-author"
													>User {
															post
																.userId
														}</span>
												</div>
											</div>
										{/each}
									</div>
								</section>
							{/if}

							<!-- Albums Section -->
							{#if filteredAlbums.length > 0}
								<section class="results-section">
									<div class="section-header">
										<h2>
											Albums ({
												filteredAlbums
													.length
											})
										</h2>
										<button
											class="view-all-btn"
											onclick={() =>
												activeTab = "albums"}
										>
											View All
										</button>
									</div>
									<div class="albums-grid">
										{#each 							filteredAlbums.slice(
								0,
								6,
							) as
											album
											(album.id)
										}
											<div
												class="album-result"
												onclick={() =>
													handleViewAlbum(
														album.id,
													)}
											>
												<div class="album-icon">📁</div>
												<h3 class="album-title">
													{@html 									highlightText(
										album
											.title,
										searchTerm,
									)}
												</h3>
												<div class="album-meta">
													<span class="album-id">#{
															album
																.id
														}</span>
													<span
														class="album-user"
													>User {
															album
																.userId
														}</span>
												</div>
											</div>
										{/each}
									</div>
								</section>
							{/if}
						</div>

						<!-- Users Only -->
					{:else if activeTab === "users"}
						<div class="users-results">
							<div class="users-grid">
								{#each filteredUsers as user (user.id)}
									<div onclick={() => handleViewUser(user.id)}>
										<UserCard
											{user}
											compact={false}
											showActions={false}
										/>
									</div>
								{/each}
							</div>
						</div>

						<!-- Posts Only -->
					{:else if activeTab === "posts"}
						<div class="posts-results">
							<div class="posts-list">
								{#each filteredPosts as post (post.id)}
									<div
										class="post-result"
										onclick={() => handleViewPost(post.id)}
									>
										<h3 class="post-title">
											{@html 								highlightText(
									post.title,
									searchTerm,
								)}
										</h3>
										<p class="post-body">
											{@html 								highlightText(
									post.body,
									searchTerm,
								)}
										</p>
										<div class="post-meta">
											<span class="post-id">#{
													post.id
												}</span>
											<span class="post-author">User {
													post
														.userId
												}</span>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- Albums Only -->
					{:else if activeTab === "albums"}
						<div class="albums-results">
							<div class="albums-grid">
								{#each filteredAlbums as album (album.id)}
									<div
										class="album-result"
										onclick={() => handleViewAlbum(album.id)}
									>
										<div class="album-icon">📁</div>
										<h3 class="album-title">
											{@html 								highlightText(
									album.title,
									searchTerm,
								)}
										</h3>
										<div class="album-meta">
											<span class="album-id">#{
													album.id
												}</span>
											<span class="album-user">User {
													album
														.userId
												}</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{:else}
		<!-- Search Suggestions -->
		<div class="search-suggestions">
			<div class="suggestions-content">
				<div class="suggestion-icon">🔍</div>
				<h2>Start searching</h2>
				<p>Enter keywords to search across users, posts, and albums</p>

				<div class="search-tips">
					<h3>Search Tips:</h3>
					<ul>
						<li>Search for user names, usernames, or companies</li>
						<li>Find posts by title or content</li>
						<li>Look for albums by title</li>
						<li>Use partial matches for broader results</li>
					</ul>
				</div>

				<div class="quick-actions">
					<h3>Quick Access:</h3>
					<div class="quick-buttons">
						<button
							class="quick-btn"
							onclick={() => goto("/users")}
						>
							👥 Browse Users
						</button>
						<button
							class="quick-btn"
							onclick={() => goto("/posts")}
						>
							📝 Browse Posts
						</button>
						<button
							class="quick-btn"
							onclick={() => goto("/albums")}
						>
							📁 Browse Albums
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
.search-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: var(--spacing-md);
}

.page-header {
	text-align: center;
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

/* Search Section */
.search-section {
	margin-bottom: var(--spacing-2xl);
}

.search-container {
	max-width: 600px;
	margin: 0 auto;
	margin-bottom: var(--spacing-lg);
}

.search-info {
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}

.search-query {
	font-size: var(--font-size-lg);
	font-weight: 600;
	color: var(--color-text-primary);
}

.search-count {
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
}

.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 400px;
}

/* Search Results */
.search-results {
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	overflow: hidden;
}

.search-tabs {
	display: flex;
	border-bottom: 1px solid var(--color-border);
	background: var(--color-bg-secondary);
}

.search-tab {
	flex: 1;
	background: none;
	border: none;
	padding: var(--spacing-md) var(--spacing-lg);
	color: var(--color-text-secondary);
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border-bottom: 2px solid transparent;
}

.search-tab:hover {
	color: var(--color-text-primary);
	background: var(--color-bg-primary);
}

.search-tab.active {
	color: var(--color-primary);
	background: var(--color-bg-primary);
	border-bottom-color: var(--color-primary);
}

.results-content {
	padding: var(--spacing-lg);
}

/* Results Sections */
.results-section {
	margin-bottom: var(--spacing-2xl);
}

.results-section:last-child {
	margin-bottom: 0;
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

.view-all-btn {
	background: none;
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	padding: var(--spacing-xs) var(--spacing-sm);
	color: var(--color-primary);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: all 0.2s ease;
}

.view-all-btn:hover {
	background: var(--color-bg-secondary);
	border-color: var(--color-border-hover);
}

/* Users Grid */
.users-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: var(--spacing-lg);
}

/* Posts List */
.posts-list {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.post-result {
	background: var(--color-bg-secondary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	padding: var(--spacing-md);
	cursor: pointer;
	transition: all 0.2s ease;
}

.post-result:hover {
	background: var(--color-bg-primary);
	border-color: var(--color-border-hover);
	transform: translateY(-1px);
	box-shadow: var(--shadow-sm);
}

.post-title {
	font-size: var(--font-size-base);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-sm);
	line-height: 1.3;
}

.post-body {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	line-height: 1.5;
	margin-bottom: var(--spacing-sm);
}

.post-meta {
	display: flex;
	gap: var(--spacing-sm);
	font-size: var(--font-size-xs);
	color: var(--color-text-muted);
}

/* Albums Grid */
.albums-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: var(--spacing-lg);
}

.album-result {
	background: var(--color-bg-secondary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	padding: var(--spacing-lg);
	text-align: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.album-result:hover {
	background: var(--color-bg-primary);
	border-color: var(--color-border-hover);
	transform: translateY(-2px);
	box-shadow: var(--shadow-md);
}

.album-icon {
	font-size: 2.5rem;
	margin-bottom: var(--spacing-md);
}

.album-title {
	font-size: var(--font-size-base);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-sm);
	line-height: 1.3;
}

.album-meta {
	display: flex;
	justify-content: center;
	gap: var(--spacing-sm);
	font-size: var(--font-size-xs);
	color: var(--color-text-muted);
}

/* Search Highlighting */
:global(mark) {
	background: rgba(255, 235, 59, 0.3);
	color: inherit;
	padding: 0 2px;
	border-radius: 2px;
}

/* No Results */
.no-results {
	text-align: center;
	padding: var(--spacing-2xl);
}

.no-results-icon {
	font-size: 4rem;
	margin-bottom: var(--spacing-lg);
}

.no-results h3 {
	font-size: var(--font-size-xl);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-sm);
}

.no-results p {
	color: var(--color-text-secondary);
	margin: 0;
}

/* Search Suggestions */
.search-suggestions {
	background: var(--color-bg-secondary);
	border-radius: var(--radius-lg);
	padding: var(--spacing-2xl);
	text-align: center;
}

.suggestions-content {
	max-width: 600px;
	margin: 0 auto;
}

.suggestion-icon {
	font-size: 4rem;
	margin-bottom: var(--spacing-lg);
}

.suggestions-content h2 {
	font-size: var(--font-size-2xl);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-sm);
}

.suggestions-content > p {
	font-size: var(--font-size-lg);
	color: var(--color-text-secondary);
	margin-bottom: var(--spacing-2xl);
}

.search-tips,
.quick-actions {
	text-align: left;
	margin-bottom: var(--spacing-xl);
}

.search-tips h3,
.quick-actions h3 {
	font-size: var(--font-size-lg);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-md);
}

.search-tips ul {
	list-style: none;
	padding: 0;
}

.search-tips li {
	padding: var(--spacing-xs) 0;
	color: var(--color-text-secondary);
	position: relative;
	padding-left: var(--spacing-lg);
}

.search-tips li::before {
	content: "•";
	color: var(--color-primary);
	position: absolute;
	left: 0;
}

.quick-buttons {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: var(--spacing-md);
}

.quick-btn {
	padding: var(--spacing-md);
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	color: var(--color-text-secondary);
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: center;
}

.quick-btn:hover {
	background: var(--color-primary);
	border-color: var(--color-primary);
	color: white;
	transform: translateY(-2px);
	box-shadow: var(--shadow-md);
}

/* Responsive Design */
@media (max-width: 768px) {
	.search-tabs {
		flex-wrap: wrap;
	}

	.search-tab {
		flex: 1;
		min-width: 120px;
	}

	.section-header {
		flex-direction: column;
		align-items: stretch;
		gap: var(--spacing-sm);
	}

	.users-grid,
	.albums-grid {
		grid-template-columns: 1fr;
	}

	.quick-buttons {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 480px) {
	.search-page {
		padding: var(--spacing-sm);
	}

	.header-content h1 {
		font-size: var(--font-size-2xl);
	}

	.search-info {
		align-items: center;
	}
}
</style>
