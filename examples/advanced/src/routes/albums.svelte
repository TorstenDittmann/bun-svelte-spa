<script>
	import { api } from "../lib/api";
	import ErrorMessage from "../lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "../lib/components/LoadingSpinner.svelte";
	import { goto } from "../router";

	let loading = $state(true);
	let error = $state(null);
	let searchTerm = $state("");
	let sortBy = $state("title");
	let sortDirection = $state("asc");
	let currentPage = $state(1);
	let albumsPerPage = $state(16);

	let allAlbums = $state([]);
	let allUsers = $state([]);

	let filteredAlbums = $derived(() => {
		if (!searchTerm.trim()) return allAlbums;
		const query = searchTerm.toLowerCase();
		return allAlbums.filter(album =>
			album.title.toLowerCase().includes(query)
			|| getUserName(album.userId).toLowerCase().includes(query)
		);
	});

	let sortedAlbums = $derived(() => {
		if (!filteredAlbums) return [];
		return [...filteredAlbums].sort((a, b) => {
			let aValue = sortBy === "title"
				? a.title.toLowerCase()
				: sortBy === "user"
				? getUserName(a.userId).toLowerCase()
				: a.id;
			let bValue = sortBy === "title"
				? b.title.toLowerCase()
				: sortBy === "user"
				? getUserName(b.userId).toLowerCase()
				: b.id;

			if (sortDirection === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});
	});

	let paginatedAlbums = $derived(() => {
		const start = (currentPage - 1) * albumsPerPage;
		const end = start + albumsPerPage;
		return sortedAlbums.slice(start, end);
	});

	let totalPages = $derived(() =>
		Math.ceil(sortedAlbums.length / albumsPerPage)
	);

	$effect(() => {
		loadAlbums();
	});

	async function loadAlbums() {
		try {
			loading = true;
			error = null;

			const [albumsData, usersData] = await Promise.all([
				api.getAlbums(),
				api.getUsers(),
			]);

			allAlbums = albumsData;
			allUsers = usersData;
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load albums";
		} finally {
			loading = false;
		}
	}

	function getUserName(userId) {
		const user = allUsers.find(u => u.id === userId);
		return user ? user.name : `User ${userId}`;
	}

	function handleSort(key) {
		if (sortBy === key) {
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		} else {
			sortBy = key;
			sortDirection = "asc";
		}
		currentPage = 1;
	}

	function handlePageChange(page) {
		currentPage = page;
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function handleViewAlbum(albumId) {
		goto(`/albums/${albumId}`);
	}

	function handleViewUser(userId) {
		goto(`/users/${userId}`);
	}

	function handleRetry() {
		window.location.reload();
	}
</script>

<div class="albums-page">
	<div class="page-header">
		<div class="header-content">
			<h1>Photo Albums</h1>
			<p>Discover organized collections of photos</p>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading albums..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Failed to Load Albums"
			onRetry={handleRetry}
		/>
	{:else}
		<!-- Controls -->
		<div class="controls">
			<div class="search-container">
				<input
					bind:value={searchTerm}
					type="text"
					placeholder="Search albums by title or author..."
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
					<button
						class="sort-btn"
						class:active={sortBy === "user"}
						onclick={() => handleSort("user")}
					>
						Author
						{#if sortBy === "user"}
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
					{sortedAlbums.length} album{
						sortedAlbums.length !== 1 ? "s" : ""
					} found
				</span>
				{#if totalPages > 1}
					<span class="page-info">
						Page {currentPage} of {totalPages}
					</span>
				{/if}
			</div>
		</div>

		<!-- Albums Grid -->
		{#if sortedAlbums.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📁</div>
				<h3>No albums found</h3>
				<p>
					Try adjusting your search criteria or clear the search to
					see all albums.
				</p>
				<button class="btn btn-primary" onclick={() => searchTerm = ""}>
					Clear Search
				</button>
			</div>
		{:else}
			<div class="albums-grid">
				{#each paginatedAlbums as album (album.id)}
					<div
						class="album-card"
						onclick={() => handleViewAlbum(album.id)}
					>
						<div class="album-cover">
							<div class="album-icon">📁</div>
							<div class="album-overlay">
								<button
									class="view-photos-btn"
									onclick={(e) => {
										e.stopPropagation();
										handleViewAlbum(album.id);
									}}
								>
									View Photos
								</button>
							</div>
						</div>

						<div class="album-info">
							<h3 class="album-title">{album.title}</h3>
							<div class="album-meta">
								<span class="album-id">#{album.id}</span>
								<button
									class="album-author"
									onclick={(e) => {
										e.stopPropagation();
										handleViewUser(album.userId);
									}}
								>
									{
										getUserName(
											album.userId,
										)
									}
								</button>
							</div>
						</div>
					</div>
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
.albums-page {
	max-width: 1400px;
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

.search-container {
	position: relative;
	max-width: 400px;
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

/* Albums Grid */
.albums-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: var(--spacing-lg);
	margin-bottom: var(--spacing-xl);
}

.album-card {
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	overflow: hidden;
	cursor: pointer;
	transition: all 0.2s ease;
}

.album-card:hover {
	transform: translateY(-4px);
	box-shadow: var(--shadow-lg);
	border-color: var(--color-border-hover);
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

.view-photos-btn {
	background: var(--color-primary);
	color: white;
	border: none;
	border-radius: var(--radius-md);
	padding: var(--spacing-sm) var(--spacing-md);
	font-size: var(--font-size-sm);
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.view-photos-btn:hover {
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
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.album-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: var(--font-size-xs);
}

.album-id {
	color: var(--color-text-muted);
	font-weight: 500;
}

.album-author {
	background: none;
	border: none;
	color: var(--color-primary);
	font-size: var(--font-size-xs);
	cursor: pointer;
	padding: 0;
	transition: color 0.2s ease;
}

.album-author:hover {
	text-decoration: underline;
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

	.results-info {
		align-items: center;
	}

	.albums-grid {
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--spacing-md);
	}

	.pagination {
		flex-wrap: wrap;
	}

	.pagination-numbers {
		order: -1;
	}
}

@media (max-width: 480px) {
	.albums-page {
		padding: var(--spacing-sm);
	}

	.page-header {
		margin-bottom: var(--spacing-lg);
	}

	.header-content h1 {
		font-size: var(--font-size-2xl);
	}

	.header-content p {
		font-size: var(--font-size-base);
	}

	.albums-grid {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	}

	.pagination-numbers {
		gap: var(--spacing-xs);
	}

	.pagination-number {
		width: 36px;
		height: 36px;
	}

	.controls {
		padding: var(--spacing-sm);
	}

	.sort-buttons {
		justify-content: center;
	}
}
</style>
