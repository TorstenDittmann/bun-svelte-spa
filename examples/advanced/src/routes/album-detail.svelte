<script>
	import { api } from "@lib/api";
	import ErrorMessage from "@lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "@lib/components/LoadingSpinner.svelte";
	import { current, goto, resolve } from "@router";

	let albumId = $state("");
	let album = $state(null);
	let photos = $state([]);
	let user = $state(null);
	let loading = $state(true);
	let error = $state(null);
	let selectedPhoto = $state(null);
	let showModal = $state(false);
	let currentPhotoIndex = $state(0);

	$effect(() => {
		const newAlbumId = $current.params.id;

		if (!newAlbumId) {
			error = "Invalid album ID";
			loading = false;
			return;
		}

		if (newAlbumId !== albumId) {
			albumId = newAlbumId;
			loadAlbumData();
		}
	});

	async function loadAlbumData() {
		try {
			loading = true;
			error = null;

			const [albumData, photosData] = await Promise.all([
				api.getAlbum(parseInt(albumId)),
				api.getAlbumPhotos(parseInt(albumId)),
			]);

			album = albumData;
			photos = photosData;

			// Load user data
			const userData = await api.getUser(albumData.userId);
			user = userData;
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load album";
		} finally {
			loading = false;
		}
	}

	function handleViewUser() {
		if (user) {
			goto(`/users/${user.id}`);
		}
	}

	function handleViewUserAlbums() {
		if (user) {
			goto(`/users/${user.id}/albums`);
		}
	}

	function handlePhotoClick(photo, index) {
		selectedPhoto = photo;
		currentPhotoIndex = index;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		selectedPhoto = null;
	}

	function navigatePhoto(direction) {
		const newIndex = currentPhotoIndex + direction;
		if (newIndex >= 0 && newIndex < photos.length) {
			currentPhotoIndex = newIndex;
			selectedPhoto = photos[newIndex];
		}
	}

	function handleKeyDown(event) {
		if (!showModal) return;

		if (event.key === "Escape") {
			closeModal();
		} else if (event.key === "ArrowLeft") {
			navigatePhoto(-1);
		} else if (event.key === "ArrowRight") {
			navigatePhoto(1);
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

<svelte:window onkeydown={handleKeyDown} />

<div class="album-detail-page">
	<!-- Navigation -->
	<div class="page-nav">
		<a href={resolve("/albums")} class="back-btn">
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
			Back to Albums
		</a>
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading album..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Failed to Load Album"
			onRetry={loadAlbumData}
		/>
	{:else if album && user}
		<!-- Album Header -->
		<div class="album-header">
			<div class="album-icon-large">📁</div>
			<div class="album-info">
				<h1 class="album-title">{album.title}</h1>
				<div class="album-meta">
					<span class="album-id">Album #{album.id}</span>
					<span class="photo-count">{photos.length} photos</span>
				</div>

				<!-- Author Info -->
				<div class="author-info">
					<a href="/users/{user.id}" class="author-avatar">
						{getInitials(user.name)}
					</a>
					<div class="author-details">
						<a href="/users/{user.id}" class="author-name">
							{user.name}
						</a>
						<p class="author-username">@{user.username}</p>
					</div>
					<div class="author-actions">
						<a
							href="/users/{user.id}"
							class="btn btn-secondary btn-sm"
						>
							View Profile
						</a>
						<a
							href="/users/{user.id}/albums"
							class="btn btn-secondary btn-sm"
						>
							View Albums
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Photos Grid -->
		{#if photos.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📷</div>
				<h3>No photos in this album</h3>
				<p>This album doesn't contain any photos yet.</p>
			</div>
		{:else}
			<div class="photos-section">
				<div class="section-header">
					<h2>Photos ({photos.length})</h2>
				</div>

				<div class="photos-grid">
					{#each photos as photo, index (photo.id)}
						<div
							class="photo-item"
							role="button"
							tabindex="0"
							onclick={() => handlePhotoClick(photo, index)}
							onkeydown={(e) =>
								e.key === "Enter" || e.key === " "
									? handlePhotoClick(photo, index)
									: null}
						>
							<img
								src={photo.thumbnailUrl}
								alt={photo.title}
								class="photo-thumbnail"
								loading="lazy"
							/>
							<div class="photo-overlay">
								<div class="photo-info">
									<h4 class="photo-title">{photo.title}</h4>
									<span class="photo-id">#{photo.id}</span>
								</div>
								<div class="photo-actions">
									<button
										class="view-btn"
										aria-label="View full size"
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="m1 1 6 6m0 0v4.5m0-4.5h4.5m11 5.5-6-6m0 0v-4.5m0 4.5h-4.5"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Album Stats -->
		<div class="album-stats">
			<div class="stat-card">
				<div class="stat-number">{photos.length}</div>
				<div class="stat-label">Total Photos</div>
			</div>
			<div class="stat-card">
				<div class="stat-number">{album.id}</div>
				<div class="stat-label">Album ID</div>
			</div>
			<div class="stat-card">
				<div class="stat-number">{user.name.split(" ").length}</div>
				<div class="stat-label">Author Names</div>
			</div>
		</div>
	{/if}
</div>

<!-- Photo Modal -->
{#if showModal && selectedPhoto}
	<div
		class="modal-overlay"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={closeModal}
		onkeydown={(e) => e.key === "Escape" ? closeModal() : null}
	>
		<div
			class="modal-content"
			role="document"
		>
			<button
				class="modal-close"
				onclick={closeModal}
				aria-label="Close modal"
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<line
						x1="18"
						y1="6"
						x2="6"
						y2="18"
						stroke="currentColor"
						stroke-width="2"
					/>
					<line
						x1="6"
						y1="6"
						x2="18"
						y2="18"
						stroke="currentColor"
						stroke-width="2"
					/>
				</svg>
			</button>

			<div class="modal-photo">
				<img
					src={selectedPhoto.url}
					alt={selectedPhoto.title}
					class="modal-image"
				/>
			</div>

			<div class="modal-info">
				<h3 class="modal-title">{selectedPhoto.title}</h3>
				<div class="modal-meta">
					<span class="modal-id">Photo #{selectedPhoto.id}</span>
					<span class="modal-position">{currentPhotoIndex + 1} of {
							photos.length
						}</span>
				</div>
			</div>

			<!-- Navigation -->
			<div class="modal-navigation">
				<button
					class="nav-btn prev"
					onclick={() => navigatePhoto(-1)}
					disabled={currentPhotoIndex === 0}
					aria-label="Previous photo"
				>
					<svg
						width="24"
						height="24"
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
				</button>

				<button
					class="nav-btn next"
					onclick={() => navigatePhoto(1)}
					disabled={currentPhotoIndex === photos.length - 1}
					aria-label="Next photo"
				>
					<svg
						width="24"
						height="24"
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
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.album-detail-page {
		max-width: 1400px;
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

	/* Album Header */
	.album-header {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		margin-bottom: var(--spacing-2xl);
		display: flex;
		align-items: center;
		gap: var(--spacing-xl);
	}

	.album-icon-large {
		font-size: 5rem;
		opacity: 0.6;
		flex-shrink: 0;
	}

	.album-info {
		flex: 1;
	}

	.album-title {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
		line-height: 1.2;
	}

	.album-meta {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
		font-size: var(--font-size-base);
		color: var(--color-text-muted);
	}

	.album-id {
		font-weight: 500;
	}

	.photo-count {
		font-weight: 500;
	}

	.author-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.author-avatar {
		width: 60px;
		height: 60px;
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
		font-weight: 600;
		font-size: var(--font-size-lg);
		flex-shrink: 0;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.author-avatar:hover {
		transform: scale(1.05);
		text-decoration: none;
		color: white;
	}

	.author-details {
		flex: 1;
	}

	.author-name {
		display: inline-block;
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-primary);
		cursor: pointer;
		margin-bottom: var(--spacing-xs);
		text-decoration: none;
	}

	.author-name:hover {
		text-decoration: underline;
		color: var(--color-primary);
	}

	.author-username {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.author-actions {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	/* Photos Section */
	.photos-section {
		margin-bottom: var(--spacing-2xl);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
	}

	.section-header h2 {
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.photos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: var(--spacing-lg);
	}

	.photo-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.photo-item:hover {
		transform: scale(1.02);
	}

	.photo-thumbnail {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.photo-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			to bottom,
			transparent 0%,
			rgba(0, 0, 0, 0.7) 100%
		);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: var(--spacing-md);
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.photo-item:hover .photo-overlay {
		opacity: 1;
	}

	.photo-info {
		margin-top: auto;
	}

	.photo-title {
		color: white;
		font-size: var(--font-size-sm);
		font-weight: 600;
		margin-bottom: var(--spacing-xs);
		line-height: 1.3;
	}

	.photo-id {
		color: rgba(255, 255, 255, 0.8);
		font-size: var(--font-size-xs);
	}

	.photo-actions {
		display: flex;
		justify-content: flex-end;
	}

	.view-btn {
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: var(--radius-sm);
		padding: var(--spacing-xs);
		color: white;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
	}

	/* Album Stats */
	.album-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--spacing-lg);
		margin-top: var(--spacing-2xl);
	}

	.stat-card {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		text-align: center;
	}

	.stat-number {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: var(--spacing-xs);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
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
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--spacing-md);
	}

	.modal-content {
		background: var(--color-bg-primary);
		border-radius: var(--radius-lg);
		max-width: 90vw;
		max-height: 90vh;
		overflow: hidden;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.modal-close {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		color: white;
		cursor: pointer;
		z-index: 1001;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s ease;
	}

	.modal-close:hover {
		background: rgba(0, 0, 0, 0.7);
	}

	.modal-photo {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		padding: var(--spacing-md);
	}

	.modal-image {
		max-width: 100%;
		max-height: 70vh;
		object-fit: contain;
	}

	.modal-info {
		padding: var(--spacing-lg);
		border-top: 1px solid var(--color-border);
	}

	.modal-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.modal-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.modal-navigation {
		position: absolute;
		top: 50%;
		left: var(--spacing-md);
		right: var(--spacing-md);
		display: flex;
		justify-content: space-between;
		pointer-events: none;
		transform: translateY(-50%);
	}

	.nav-btn {
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		color: white;
		cursor: pointer;
		pointer-events: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s ease;
	}

	.nav-btn:hover:not(:disabled) {
		background: rgba(0, 0, 0, 0.7);
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.album-header {
			flex-direction: column;
			text-align: center;
			gap: var(--spacing-lg);
		}

		.album-icon-large {
			font-size: 4rem;
		}

		.album-title {
			font-size: var(--font-size-2xl);
		}

		.author-info {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.author-actions {
			flex-direction: row;
			justify-content: center;
		}

		.section-header {
			flex-direction: column;
			gap: var(--spacing-sm);
			align-items: stretch;
		}

		.photos-grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: var(--spacing-md);
		}

		.album-stats {
			grid-template-columns: repeat(2, 1fr);
		}

		.modal-navigation {
			left: var(--spacing-sm);
			right: var(--spacing-sm);
		}

		.nav-btn {
			width: 40px;
			height: 40px;
		}
	}

	@media (max-width: 480px) {
		.album-detail-page {
			padding: var(--spacing-sm);
		}

		.album-header {
			padding: var(--spacing-lg);
		}

		.photos-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		}

		.album-stats {
			grid-template-columns: 1fr;
		}

		.modal-content {
			margin: var(--spacing-sm);
		}

		.modal-image {
			max-height: 50vh;
		}

		.modal-info {
			padding: var(--spacing-md);
		}

		.modal-meta {
			flex-direction: column;
			gap: var(--spacing-xs);
			align-items: flex-start;
		}
	}
</style>
