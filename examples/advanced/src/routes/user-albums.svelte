<script>
	import { api } from "@lib/api";
	import ErrorMessage from "@lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "@lib/components/LoadingSpinner.svelte";
	import { current, resolve } from "@router";

	let userId = $state("");
	let user = $state(null);
	let albums = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let searchTerm = $state("");
	let sortBy = $state("title");
	let sortDirection = $state("asc");

	let filteredAlbums = $derived(() => {
		if (!searchTerm.trim()) return albums;
		const query = searchTerm.toLowerCase();
		return albums.filter(album =>
			album.title.toLowerCase().includes(query)
		);
	});

	let sortedAlbums = $derived(() => {
		if (!filteredAlbums) return [];
		return [...filteredAlbums].sort((a, b) => {
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
		const newUserId = $current.params.id;

		if (!newUserId) {
			error = "Invalid user ID";
			loading = false;
			return;
		}

		if (newUserId !== userId) {
			userId = newUserId;
			loadUserAlbums();
		}
	});

	async function loadUserAlbums() {
		try {
			loading = true;
			error = null;

			const [userData, albumsData] = await Promise.all([
				api.getUser(parseInt(userId)),
				api.getUserAlbums(parseInt(userId)),
			]);

			user = userData;
			albums = albumsData;
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load user albums";
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

	function getInitials(name) {
		return name
			.split(" ")
			.map(word => word[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div class="user-albums-page">
	<!-- Navigation -->
	<div class="page-nav">
		<a href={resolve("/users/:id", { id: userId })} class="back-btn">
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
		</a>
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading user albums..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Failed to Load Albums"
			onRetry={loadUserAlbums}
		/>
	{:else if user}
		<!-- Header -->
		<div class="page-header">
			<div class="user-info">
				<div class="user-avatar">
					{getInitials(user.name)}
				</div>
				<div class="user-details">
					<h1>Albums by {user.name}</h1>
					<p class="user-meta">
						@{user.username} • {albums.length} albums
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
					placeholder="Search albums..."
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
					{filteredAlbums.length} album{
						filteredAlbums.length !== 1 ? "s" : ""
					} found
				</span>
			</div>
		</div>

		<!-- Albums Grid -->
		{#if sortedAlbums.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📁</div>
				<h3>No albums found</h3>
				<p>
					{
						searchTerm.trim()
							? "Try adjusting your search criteria."
							: `${user.name} hasn't created any albums yet.`
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
			<div class="albums-grid">
				{#each sortedAlbums as album (album.id)}
					<a
						href={resolve("/albums/:id", { id: album.id.toString() })}
						class="album-card"
					>
						<div class="album-cover">
							<div class="album-icon">📁</div>
							<div class="album-overlay">
								<span class="view-album-text">
									View Photos
								</span>
							</div>
						</div>

						<div class="album-info">
							<h3 class="album-title">{album.title}</h3>
							<div class="album-meta">
								<span class="album-id">#{album.id}</span>
								<span class="album-photos">50 photos</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		<!-- User Actions -->
		<div class="user-actions">
			<h2>More from {user.name}</h2>
			<div class="actions-grid">
				<a
					href={resolve("/users/:id", { id: userId })}
					class="action-card"
				>
					<div class="action-icon">👤</div>
					<div class="action-content">
						<h3>View Profile</h3>
						<p>See {user.name}'s complete profile</p>
					</div>
				</a>

				<a
					href={resolve("/users/:id/posts", { id: userId })}
					class="action-card"
				>
					<div class="action-icon">📝</div>
					<div class="action-content">
						<h3>View Posts</h3>
						<p>Read posts by {user.name}</p>
					</div>
				</a>

				<a href={resolve("/albums")} class="action-card">
					<div class="action-icon">📁</div>
					<div class="action-content">
						<h3>All Albums</h3>
						<p>Browse all photo albums</p>
					</div>
				</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.user-albums-page {
		max-width: 1200px;
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
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--spacing-sm) var(--spacing-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.back-btn:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-border-hover);
		color: var(--color-text-primary);
		text-decoration: none;
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

	/* Albums Grid */
	.albums-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-2xl);
	}

	.album-card {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s ease;
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.album-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--color-border-hover);
		text-decoration: none;
		color: inherit;
	}

	.album-cover {
		position: relative;
		aspect-ratio: 4/3;
		background: linear-gradient(
			135deg,
			var(--color-bg-secondary),
			var(--color-bg-tertiary)
		);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.album-icon {
		font-size: 4rem;
		opacity: 0.3;
		transition: all 0.2s ease;
	}

	.album-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.album-card:hover .album-overlay {
		opacity: 1;
	}

	.view-album-text {
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-md);
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition: all 0.2s ease;
		display: inline-block;
	}

	.album-card:hover .view-album-text {
		background: var(--color-primary-dark);
		transform: scale(1.05);
	}

	.album-info {
		padding: var(--spacing-md);
	}

	.album-title {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
		line-height: 1.3;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.album-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
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

	/* User Actions */
	.user-actions {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		text-align: center;
	}

	.user-actions h2 {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-lg);
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-md);
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		text-decoration: none;
		color: inherit;
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

		.albums-grid {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
			gap: var(--spacing-md);
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}

		.action-card {
			flex-direction: column;
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.user-albums-page {
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

		.albums-grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		}

		.user-actions {
			padding: var(--spacing-lg);
		}
	}
</style>
