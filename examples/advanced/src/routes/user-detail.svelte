<script lang="ts">
	import { onMount } from "svelte";
	import { api } from "../lib/api";
	import type { Album, Post, User } from "../lib/api";
	import ErrorMessage from "../lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "../lib/components/LoadingSpinner.svelte";
	import { currentUser, userAlbums, userPosts } from "../lib/stores";
	import { goto } from "../router";

	// Get user ID from URL
	let userId: number;
	let loading = true;
	let error: string | null = null;
	let activeTab: "profile" | "posts" | "albums" = "profile";
	let user: User | null = null;
	let posts: Post[] = [];
	let albums: Album[] = [];

	onMount(() => {
		// Extract user ID from URL
		const pathSegments = window.location.pathname.split("/");
		const idIndex = pathSegments.indexOf("users") + 1;
		userId = parseInt(pathSegments[idIndex]);

		if (isNaN(userId)) {
			error = "Invalid user ID";
			loading = false;
			return;
		}

		loadUserData();
	});

	async function loadUserData() {
		try {
			loading = true;
			error = null;

			// Load user profile
			const userData = await api.getUser(userId);
			user = userData;
			currentUser.setData(userData);

			// Load user's posts and albums in parallel
			const [postsData, albumsData] = await Promise.all([
				api.getUserPosts(userId),
				api.getUserAlbums(userId),
			]);

			posts = postsData;
			albums = albumsData;
			userPosts.setData(postsData);
			userAlbums.setData(albumsData);
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load user data";
		} finally {
			loading = false;
		}
	}

	function handleViewPosts() {
		goto(`/users/${userId}/posts`);
	}

	function handleViewAlbums() {
		goto(`/users/${userId}/albums`);
	}

	function handleViewPost(postId: number) {
		goto(`/posts/${postId}`);
	}

	function handleViewAlbum(albumId: number) {
		goto(`/albums/${albumId}`);
	}

	function handleBackToUsers() {
		goto("/users");
	}

	function getInitials(name: string): string {
		return name
			.split(" ")
			.map(word => word.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div class="user-detail-page">
	<!-- Navigation -->
	<div class="page-nav">
		<button class="back-btn" onclick={handleBackToUsers}>
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
			Back to Users
		</button>
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading user profile..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Failed to Load User Profile"
			onRetry={loadUserData}
		/>
	{:else if user}
		<!-- User Header -->
		<div class="user-header">
			<div class="user-avatar-large">
				{getInitials(user.name)}
			</div>
			<div class="user-info">
				<h1 class="user-name">{user.name}</h1>
				<p class="user-username">@{user.username}</p>
				<p class="user-email">{user.email}</p>
				<div class="user-stats">
					<span class="stat">
						<strong>{posts.length}</strong> posts
					</span>
					<span class="stat">
						<strong>{albums.length}</strong> albums
					</span>
				</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="tabs">
			<button
				class="tab"
				class:active={activeTab === "profile"}
				onclick={() => activeTab = "profile"}
			>
				Profile
			</button>
			<button
				class="tab"
				class:active={activeTab === "posts"}
				onclick={() => activeTab = "posts"}
			>
				Posts ({posts.length})
			</button>
			<button
				class="tab"
				class:active={activeTab === "albums"}
				onclick={() => activeTab = "albums"}
			>
				Albums ({albums.length})
			</button>
		</div>

		<!-- Tab Content -->
		<div class="tab-content">
			{#if activeTab === "profile"}
				<div class="profile-content">
					<!-- Contact Information -->
					<div class="info-section">
						<h2>Contact Information</h2>
						<div class="info-grid">
							<div class="info-item">
								<span class="info-label">Email:</span>
								<a
									href="mailto:{user.email}"
									class="info-value email-link"
								>{user.email}</a>
							</div>
							<div class="info-item">
								<span class="info-label">Phone:</span>
								<a
									href="tel:{user.phone}"
									class="info-value phone-link"
								>{user.phone}</a>
							</div>
							<div class="info-item">
								<span class="info-label">Website:</span>
								<a
									href="http://{user.website}"
									target="_blank"
									rel="noopener noreferrer"
									class="info-value website-link"
								>
									{user.website}
								</a>
							</div>
						</div>
					</div>

					<!-- Address -->
					<div class="info-section">
						<h2>Address</h2>
						<div class="address-info">
							<p class="address-line">
								{user.address.street}, {user.address.suite}
							</p>
							<p class="address-line">
								{user.address.city}, {user.address.zipcode}
							</p>
							<div class="geo-info">
								<span>📍 {
										user.address.geo
											.lat
									}, {
										user.address.geo
											.lng
									}</span>
							</div>
						</div>
					</div>

					<!-- Company -->
					<div class="info-section">
						<h2>Company</h2>
						<div class="company-info">
							<h3 class="company-name">{user.company.name}</h3>
							<p class="company-catchphrase">
								"{user.company.catchPhrase}"
							</p>
							<p class="company-bs">{user.company.bs}</p>
						</div>
					</div>
				</div>
			{:else if activeTab === "posts"}
				<div class="posts-content">
					<div class="section-header">
						<h2>Posts by {user.name}</h2>
						<button
							class="btn btn-primary btn-sm"
							onclick={handleViewPosts}
						>
							View All Posts
						</button>
					</div>

					{#if posts.length === 0}
						<div class="empty-state">
							<div class="empty-icon">📝</div>
							<h3>No posts yet</h3>
							<p>This user hasn't created any posts.</p>
						</div>
					{:else}
						<div class="posts-grid">
							{#each posts.slice(0, 6) as post (post.id)}
								<div
									class="post-card"
									onclick={() => handleViewPost(post.id)}
								>
									<h3 class="post-title">{post.title}</h3>
									<p class="post-body">
										{post.body.slice(0, 150)}...
									</p>
									<div class="post-meta">
										<span class="post-id">#{post.id}</span>
									</div>
								</div>
							{/each}
						</div>
						{#if posts.length > 6}
							<div class="show-more">
								<button
									class="btn btn-secondary"
									onclick={handleViewPosts}
								>
									View All {posts.length} Posts
								</button>
							</div>
						{/if}
					{/if}
				</div>
			{:else if activeTab === "albums"}
				<div class="albums-content">
					<div class="section-header">
						<h2>Albums by {user.name}</h2>
						<button
							class="btn btn-primary btn-sm"
							onclick={handleViewAlbums}
						>
							View All Albums
						</button>
					</div>

					{#if albums.length === 0}
						<div class="empty-state">
							<div class="empty-icon">📁</div>
							<h3>No albums yet</h3>
							<p>This user hasn't created any albums.</p>
						</div>
					{:else}
						<div class="albums-grid">
							{#each albums.slice(0, 6) as album (album.id)}
								<div
									class="album-card"
									onclick={() => handleViewAlbum(album.id)}
								>
									<div class="album-icon">📁</div>
									<h3 class="album-title">{album.title}</h3>
									<div class="album-meta">
										<span class="album-id">#{
												album.id
											}</span>
									</div>
								</div>
							{/each}
						</div>
						{#if albums.length > 6}
							<div class="show-more">
								<button
									class="btn btn-secondary"
									onclick={handleViewAlbums}
								>
									View All {albums.length} Albums
								</button>
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
.user-detail-page {
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

/* User Header */
.user-header {
	display: flex;
	align-items: center;
	gap: var(--spacing-xl);
	padding: var(--spacing-xl);
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	margin-bottom: var(--spacing-xl);
}

.user-avatar-large {
	width: 120px;
	height: 120px;
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
	font-size: 2.5rem;
	flex-shrink: 0;
}

.user-info {
	flex: 1;
}

.user-name {
	font-size: var(--font-size-3xl);
	font-weight: 700;
	margin-bottom: var(--spacing-xs);
	color: var(--color-text-primary);
}

.user-username {
	font-size: var(--font-size-lg);
	color: var(--color-text-muted);
	font-weight: 500;
	margin-bottom: var(--spacing-xs);
}

.user-email {
	font-size: var(--font-size-base);
	color: var(--color-text-secondary);
	margin-bottom: var(--spacing-md);
}

.user-stats {
	display: flex;
	gap: var(--spacing-lg);
}

.stat {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}

.stat strong {
	color: var(--color-text-primary);
}

/* Tabs */
.tabs {
	display: flex;
	border-bottom: 1px solid var(--color-border);
	margin-bottom: var(--spacing-xl);
}

.tab {
	background: none;
	border: none;
	padding: var(--spacing-md) var(--spacing-lg);
	color: var(--color-text-secondary);
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border-bottom: 2px solid transparent;
}

.tab:hover {
	color: var(--color-text-primary);
	background: var(--color-bg-secondary);
}

.tab.active {
	color: var(--color-primary);
	border-bottom-color: var(--color-primary);
}

/* Tab Content */
.tab-content {
	min-height: 400px;
}

/* Profile Content */
.profile-content {
	display: grid;
	gap: var(--spacing-xl);
}

.info-section {
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	padding: var(--spacing-lg);
}

.info-section h2 {
	font-size: var(--font-size-xl);
	font-weight: 600;
	margin-bottom: var(--spacing-lg);
	color: var(--color-text-primary);
}

.info-grid {
	display: grid;
	gap: var(--spacing-md);
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: var(--spacing-sm) 0;
	border-bottom: 1px solid var(--color-border);
}

.info-item:last-child {
	border-bottom: none;
}

.info-label {
	font-weight: 500;
	color: var(--color-text-muted);
}

.info-value {
	color: var(--color-text-secondary);
}

.email-link,
.phone-link,
.website-link {
	color: var(--color-primary);
	text-decoration: none;
}

.email-link:hover,
.phone-link:hover,
.website-link:hover {
	text-decoration: underline;
}

.address-info {
	line-height: 1.6;
}

.address-line {
	margin-bottom: var(--spacing-xs);
	color: var(--color-text-secondary);
}

.geo-info {
	margin-top: var(--spacing-sm);
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
}

.company-info {
	text-align: center;
}

.company-name {
	font-size: var(--font-size-xl);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-sm);
}

.company-catchphrase {
	font-size: var(--font-size-lg);
	color: var(--color-text-secondary);
	font-style: italic;
	margin-bottom: var(--spacing-sm);
}

.company-bs {
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
	text-transform: capitalize;
}

/* Posts Content */
.posts-content,
.albums-content {
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

.posts-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: var(--spacing-lg);
	margin-bottom: var(--spacing-lg);
}

.post-card {
	background: var(--color-bg-secondary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	padding: var(--spacing-md);
	cursor: pointer;
	transition: all 0.2s ease;
}

.post-card:hover {
	transform: translateY(-2px);
	box-shadow: var(--shadow-md);
	border-color: var(--color-border-hover);
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
	font-size: var(--font-size-xs);
	color: var(--color-text-muted);
}

.albums-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: var(--spacing-lg);
	margin-bottom: var(--spacing-lg);
}

.album-card {
	background: var(--color-bg-secondary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	padding: var(--spacing-lg);
	text-align: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.album-card:hover {
	transform: translateY(-2px);
	box-shadow: var(--shadow-md);
	border-color: var(--color-border-hover);
}

.album-icon {
	font-size: 3rem;
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
	font-size: var(--font-size-xs);
	color: var(--color-text-muted);
}

.empty-state {
	text-align: center;
	padding: var(--spacing-2xl);
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

.show-more {
	text-align: center;
	margin-top: var(--spacing-lg);
}

/* Responsive Design */
@media (max-width: 768px) {
	.user-header {
		flex-direction: column;
		text-align: center;
		gap: var(--spacing-lg);
	}

	.user-avatar-large {
		width: 100px;
		height: 100px;
		font-size: 2rem;
	}

	.user-name {
		font-size: var(--font-size-2xl);
	}

	.tabs {
		flex-wrap: wrap;
	}

	.tab {
		flex: 1;
		min-width: 120px;
	}

	.section-header {
		flex-direction: column;
		align-items: stretch;
		gap: var(--spacing-sm);
	}

	.posts-grid,
	.albums-grid {
		grid-template-columns: 1fr;
	}

	.info-item {
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-xs);
	}
}
</style>
