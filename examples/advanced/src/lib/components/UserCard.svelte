<script lang="ts">
	import type { User } from "@lib/api";

	export let user: User;
	export let showActions: boolean = true;
	export let compact: boolean = false;

	function handleViewProfile() {
		// Navigate to user profile
		window.location.href = `/users/${user.id}`;
	}

	function handleViewPosts() {
		// Navigate to user posts
		window.location.href = `/users/${user.id}/posts`;
	}

	function handleViewAlbums() {
		// Navigate to user albums
		window.location.href = `/users/${user.id}/albums`;
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

<div class="user-card" class:compact>
	<div class="user-header">
		<div class="user-avatar">
			{getInitials(user.name)}
		</div>

		<div class="user-info">
			<h3 class="user-name">{user.name}</h3>
			<p class="user-username">@{user.username}</p>
			{#if !compact}
				<p class="user-email">{user.email}</p>
			{/if}
		</div>
	</div>

	{#if !compact}
		<div class="user-details">
			<div class="detail-item">
				<span class="detail-label">Company:</span>
				<span class="detail-value">{user.company.name}</span>
			</div>

			<div class="detail-item">
				<span class="detail-label">Website:</span>
				<a
					href="http://{user.website}"
					target="_blank"
					rel="noopener noreferrer"
					class="detail-link"
				>
					{user.website}
				</a>
			</div>

			<div class="detail-item">
				<span class="detail-label">Phone:</span>
				<span class="detail-value">{user.phone}</span>
			</div>

			<div class="detail-item">
				<span class="detail-label">Address:</span>
				<span class="detail-value">
					{user.address.street}, {user.address.city}
				</span>
			</div>
		</div>

		<div class="user-company">
			<h4>About Company</h4>
			<p class="company-catchphrase">"{user.company.catchPhrase}"</p>
			<p class="company-bs">{user.company.bs}</p>
		</div>
	{/if}

	{#if showActions}
		<div class="user-actions">
			<button class="btn btn-primary btn-sm" onclick={handleViewProfile}>
				View Profile
			</button>
			<button class="btn btn-secondary btn-sm" onclick={handleViewPosts}>
				Posts
			</button>
			<button class="btn btn-secondary btn-sm" onclick={handleViewAlbums}>
				Albums
			</button>
		</div>
	{/if}
</div>

<style>
.user-card {
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	padding: var(--spacing-lg);
	box-shadow: var(--shadow-sm);
	transition: all 0.2s ease;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.user-card:hover {
	box-shadow: var(--shadow-md);
	border-color: var(--color-border-hover);
}

.user-card.compact {
	padding: var(--spacing-md);
	gap: var(--spacing-sm);
}

.user-header {
	display: flex;
	align-items: center;
	gap: var(--spacing-md);
}

.user-avatar {
	width: 48px;
	height: 48px;
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
}

.compact .user-avatar {
	width: 40px;
	height: 40px;
	font-size: var(--font-size-base);
}

.user-info {
	flex: 1;
	min-width: 0;
}

.user-name {
	margin: 0 0 var(--spacing-xs) 0;
	font-size: var(--font-size-lg);
	font-weight: 600;
	color: var(--color-text-primary);
}

.compact .user-name {
	font-size: var(--font-size-base);
}

.user-username {
	margin: 0;
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
	font-weight: 500;
}

.user-email {
	margin: var(--spacing-xs) 0 0 0;
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}

.user-details {
	display: grid;
	gap: var(--spacing-sm);
	padding: var(--spacing-md) 0;
	border-top: 1px solid var(--color-border);
	border-bottom: 1px solid var(--color-border);
}

.detail-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: var(--spacing-sm);
}

.detail-label {
	font-size: var(--font-size-sm);
	font-weight: 500;
	color: var(--color-text-muted);
	flex-shrink: 0;
}

.detail-value {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	text-align: right;
	word-break: break-word;
}

.detail-link {
	font-size: var(--font-size-sm);
	color: var(--color-primary);
	text-decoration: none;
	text-align: right;
	word-break: break-all;
}

.detail-link:hover {
	text-decoration: underline;
}

.user-company {
	padding-top: var(--spacing-sm);
}

.user-company h4 {
	margin: 0 0 var(--spacing-sm) 0;
	font-size: var(--font-size-base);
	font-weight: 600;
	color: var(--color-text-primary);
}

.company-catchphrase {
	margin: 0 0 var(--spacing-xs) 0;
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	font-style: italic;
}

.company-bs {
	margin: 0;
	font-size: var(--font-size-xs);
	color: var(--color-text-muted);
	text-transform: capitalize;
}

.user-actions {
	display: flex;
	gap: var(--spacing-sm);
	flex-wrap: wrap;
}

.compact .user-actions {
	justify-content: center;
}

@media (max-width: 480px) {
	.detail-item {
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-xs);
	}

	.detail-value,
	.detail-link {
		text-align: left;
	}

	.user-actions {
		justify-content: center;
	}
}
</style>
