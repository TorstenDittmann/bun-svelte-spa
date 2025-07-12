<script>
	import { api } from "../lib/api";
	import ErrorMessage from "../lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "../lib/components/LoadingSpinner.svelte";
	import { goto } from "../router";

	let postId = $state(0);
	let post = $state(null);
	let comments = $state([]);
	let user = $state(null);
	let loading = $state(true);
	let error = $state(null);
	let showComments = $state(true);

	$effect(() => {
		const pathSegments = window.location.pathname.split("/");
		const idIndex = pathSegments.indexOf("posts") + 1;
		postId = parseInt(pathSegments[idIndex]);

		if (isNaN(postId)) {
			error = "Invalid post ID";
			loading = false;
			return;
		}

		loadPostData();
	});

	async function loadPostData() {
		try {
			loading = true;
			error = null;

			const [postData, commentsData] = await Promise.all([
				api.getPost(postId),
				api.getPostComments(postId),
			]);

			post = postData;
			comments = commentsData;

			// Load user data
			const userData = await api.getUser(postData.userId);
			user = userData;
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load post";
		} finally {
			loading = false;
		}
	}

	function handleBackToPosts() {
		goto("/posts");
	}

	function handleViewUser() {
		if (user) {
			goto(`/users/${user.id}`);
		}
	}

	function handleViewUserPosts() {
		if (user) {
			goto(`/users/${user.id}/posts`);
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

	function formatDate(timestamp) {
		// Since we don't have real dates, we'll simulate based on ID
		const baseDate = new Date("2024-01-01");
		const daysOffset = postId * 2;
		const postDate = new Date(
			baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000,
		);
		return postDate.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}
</script>

<div class="post-detail-page">
	<!-- Navigation -->
	<div class="page-nav">
		<button class="back-btn" onclick={handleBackToPosts}>
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
			Back to Posts
		</button>
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading post..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Failed to Load Post"
			onRetry={loadPostData}
		/>
	{:else if post && user}
		<article class="post-article">
			<!-- Post Header -->
			<header class="post-header">
				<div class="post-meta">
					<span class="post-id">#{post.id}</span>
					<span class="post-date">{formatDate(post.id)}</span>
				</div>

				<h1 class="post-title">{post.title}</h1>

				<!-- Author Info -->
				<div class="author-info">
					<div class="author-avatar" onclick={handleViewUser}>
						{getInitials(user.name)}
					</div>
					<div class="author-details">
						<button class="author-name" onclick={handleViewUser}>
							{user.name}
						</button>
						<p class="author-username">@{user.username}</p>
						<p class="author-company">{user.company.name}</p>
					</div>
					<div class="author-actions">
						<button
							class="btn btn-secondary btn-sm"
							onclick={handleViewUser}
						>
							View Profile
						</button>
						<button
							class="btn btn-secondary btn-sm"
							onclick={handleViewUserPosts}
						>
							More Posts
						</button>
					</div>
				</div>
			</header>

			<!-- Post Content -->
			<div class="post-content">
				<div class="post-body">
					{post.body}
				</div>
			</div>

			<!-- Post Stats -->
			<div class="post-stats">
				<div class="stat-item">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
							stroke="currentColor"
							stroke-width="2"
							fill="none"
						/>
					</svg>
					<span>{
							Math.floor(Math.random() * 50)
								+ 10
						} likes</span>
				</div>
				<div class="stat-item">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"
							stroke="currentColor"
							stroke-width="2"
							fill="none"
						/>
					</svg>
					<span>{comments.length} comments</span>
				</div>
				<div class="stat-item">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
							stroke="currentColor"
							stroke-width="2"
						/>
						<polyline
							points="16,6 12,2 8,6"
							stroke="currentColor"
							stroke-width="2"
						/>
						<line
							x1="12"
							y1="2"
							x2="12"
							y2="15"
							stroke="currentColor"
							stroke-width="2"
						/>
					</svg>
					<span>Share</span>
				</div>
			</div>
		</article>

		<!-- Comments Section -->
		<section class="comments-section">
			<div class="comments-header">
				<h2>Comments ({comments.length})</h2>
				<button
					class="toggle-comments"
					onclick={() => showComments = !showComments}
				>
					{showComments ? "Hide" : "Show"} Comments
				</button>
			</div>

			{#if showComments}
				{#if comments.length === 0}
					<div class="no-comments">
						<div class="no-comments-icon">💬</div>
						<h3>No comments yet</h3>
						<p>Be the first to share your thoughts on this post.</p>
					</div>
				{:else}
					<div class="comments-list">
						{#each comments as comment (comment.id)}
							<div class="comment-item">
								<div class="comment-avatar">
									{getInitials(comment.name)}
								</div>
								<div class="comment-content">
									<div class="comment-header">
										<h4 class="comment-author">
											{comment.name}
										</h4>
										<span class="comment-email">{
											comment.email
										}</span>
									</div>
									<p class="comment-body">{comment.body}</p>
									<div class="comment-actions">
										<button class="comment-action">
											<svg
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
													stroke="currentColor"
													stroke-width="2"
													fill="none"
												/>
											</svg>
											Like
										</button>
										<button class="comment-action">
											<svg
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"
													stroke="currentColor"
													stroke-width="2"
													fill="none"
												/>
											</svg>
											Reply
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</section>

		<!-- Related Posts -->
		<aside class="related-section">
			<h2>More from {user.name}</h2>
			<div class="related-actions">
				<button class="btn btn-primary" onclick={handleViewUserPosts}>
					View All Posts by {user.name}
				</button>
				<button class="btn btn-secondary" onclick={handleViewUser}>
					View {user.name}'s Profile
				</button>
			</div>
		</aside>
	{/if}
</div>

<style>
.post-detail-page {
	max-width: 800px;
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

/* Post Article */
.post-article {
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	overflow: hidden;
	margin-bottom: var(--spacing-xl);
}

.post-header {
	padding: var(--spacing-xl);
	border-bottom: 1px solid var(--color-border);
}

.post-meta {
	display: flex;
	gap: var(--spacing-sm);
	margin-bottom: var(--spacing-md);
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
}

.post-id {
	font-weight: 500;
}

.post-title {
	font-size: var(--font-size-3xl);
	font-weight: 700;
	color: var(--color-text-primary);
	line-height: 1.2;
	margin-bottom: var(--spacing-xl);
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
	cursor: pointer;
	transition: transform 0.2s ease;
}

.author-avatar:hover {
	transform: scale(1.05);
}

.author-details {
	flex: 1;
}

.author-name {
	background: none;
	border: none;
	font-size: var(--font-size-lg);
	font-weight: 600;
	color: var(--color-primary);
	cursor: pointer;
	margin-bottom: var(--spacing-xs);
	padding: 0;
}

.author-name:hover {
	text-decoration: underline;
}

.author-username {
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
	margin: 0 0 var(--spacing-xs) 0;
}

.author-company {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	margin: 0;
}

.author-actions {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}

.post-content {
	padding: var(--spacing-xl);
}

.post-body {
	font-size: var(--font-size-lg);
	line-height: 1.7;
	color: var(--color-text-secondary);
	text-align: justify;
}

.post-stats {
	display: flex;
	justify-content: space-around;
	padding: var(--spacing-lg);
	border-top: 1px solid var(--color-border);
	background: var(--color-bg-secondary);
}

.stat-item {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	color: var(--color-text-muted);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: color 0.2s ease;
}

.stat-item:hover {
	color: var(--color-primary);
}

/* Comments Section */
.comments-section {
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	overflow: hidden;
	margin-bottom: var(--spacing-xl);
}

.comments-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: var(--spacing-lg);
	border-bottom: 1px solid var(--color-border);
	background: var(--color-bg-secondary);
}

.comments-header h2 {
	font-size: var(--font-size-xl);
	font-weight: 600;
	color: var(--color-text-primary);
	margin: 0;
}

.toggle-comments {
	background: none;
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	padding: var(--spacing-xs) var(--spacing-sm);
	color: var(--color-primary);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: all 0.2s ease;
}

.toggle-comments:hover {
	background: var(--color-bg-primary);
	border-color: var(--color-border-hover);
}

.no-comments {
	text-align: center;
	padding: var(--spacing-2xl);
}

.no-comments-icon {
	font-size: 3rem;
	margin-bottom: var(--spacing-lg);
}

.no-comments h3 {
	font-size: var(--font-size-lg);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-sm);
}

.no-comments p {
	color: var(--color-text-secondary);
	margin: 0;
}

.comments-list {
	padding: var(--spacing-lg);
}

.comment-item {
	display: flex;
	gap: var(--spacing-md);
	padding: var(--spacing-lg) 0;
	border-bottom: 1px solid var(--color-border);
}

.comment-item:last-child {
	border-bottom: none;
}

.comment-avatar {
	width: 40px;
	height: 40px;
	background: linear-gradient(
		135deg,
		var(--color-secondary),
		var(--color-accent)
	);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: 600;
	font-size: var(--font-size-sm);
	flex-shrink: 0;
}

.comment-content {
	flex: 1;
}

.comment-header {
	margin-bottom: var(--spacing-sm);
}

.comment-author {
	font-size: var(--font-size-base);
	font-weight: 600;
	color: var(--color-text-primary);
	margin: 0 0 var(--spacing-xs) 0;
}

.comment-email {
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
}

.comment-body {
	font-size: var(--font-size-base);
	line-height: 1.6;
	color: var(--color-text-secondary);
	margin-bottom: var(--spacing-md);
}

.comment-actions {
	display: flex;
	gap: var(--spacing-md);
}

.comment-action {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	background: none;
	border: none;
	color: var(--color-text-muted);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: color 0.2s ease;
}

.comment-action:hover {
	color: var(--color-primary);
}

/* Related Section */
.related-section {
	background: var(--color-bg-secondary);
	border-radius: var(--radius-lg);
	padding: var(--spacing-xl);
	text-align: center;
}

.related-section h2 {
	font-size: var(--font-size-xl);
	font-weight: 600;
	color: var(--color-text-primary);
	margin-bottom: var(--spacing-lg);
}

.related-actions {
	display: flex;
	justify-content: center;
	gap: var(--spacing-md);
	flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 768px) {
	.post-title {
		font-size: var(--font-size-2xl);
	}

	.author-info {
		flex-direction: column;
		text-align: center;
		gap: var(--spacing-sm);
	}

	.author-actions {
		flex-direction: row;
		justify-content: center;
	}

	.post-stats {
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.comments-header {
		flex-direction: column;
		gap: var(--spacing-sm);
		align-items: stretch;
	}

	.comment-item {
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.related-actions {
		flex-direction: column;
		align-items: center;
	}
}

@media (max-width: 480px) {
	.post-detail-page {
		padding: var(--spacing-sm);
	}

	.post-header,
	.post-content {
		padding: var(--spacing-lg);
	}

	.post-title {
		font-size: var(--font-size-xl);
	}

	.post-body {
		font-size: var(--font-size-base);
	}

	.author-avatar {
		width: 50px;
		height: 50px;
		font-size: var(--font-size-base);
	}
}
</style>
