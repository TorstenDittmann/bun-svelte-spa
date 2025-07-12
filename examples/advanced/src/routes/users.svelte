<script lang="ts">
	import { onMount } from "svelte";
	import { api } from "../lib/api";
	import type { User } from "../lib/api";
	import ErrorMessage from "../lib/components/ErrorMessage.svelte";
	import LoadingSpinner from "../lib/components/LoadingSpinner.svelte";
	import SearchBar from "../lib/components/SearchBar.svelte";
	import UserCard from "../lib/components/UserCard.svelte";
	import { filteredUsers, searchQuery, users } from "../lib/stores";
	import { goto } from "../router";

	let loading = true;
	let error: string | null = null;
	let viewMode: "grid" | "list" = "grid";
	let sortBy: "name" | "username" | "email" | "company" = "name";
	let sortDirection: "asc" | "desc" = "asc";
	let searchTerm = "";

	$: displayUsers = sortUsers($filteredUsers, sortBy, sortDirection);

	onMount(async () => {
		try {
			users.setLoading();
			const usersData = await api.getUsers();
			users.setData(usersData);
		} catch (err) {
			error = err instanceof Error
				? err.message
				: "Failed to load users";
			users.setError({ message: error });
		} finally {
			loading = false;
		}
	});

	function sortUsers(
		usersList: User[],
		sortKey: string,
		direction: string,
	): User[] {
		if (!usersList) return [];

		const sorted = [...usersList].sort((a, b) => {
			let aValue: string;
			let bValue: string;

			switch (sortKey) {
				case "name":
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
					break;
				case "username":
					aValue = a.username.toLowerCase();
					bValue = b.username.toLowerCase();
					break;
				case "email":
					aValue = a.email.toLowerCase();
					bValue = b.email.toLowerCase();
					break;
				case "company":
					aValue = a.company.name.toLowerCase();
					bValue = b.company.name.toLowerCase();
					break;
				default:
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
			}

			if (direction === "asc") {
				return aValue.localeCompare(bValue);
			} else {
				return bValue.localeCompare(aValue);
			}
		});

		return sorted;
	}

	function handleSort(key: typeof sortBy) {
		if (sortBy === key) {
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		} else {
			sortBy = key;
			sortDirection = "asc";
		}
	}

	function handleViewUser(userId: number) {
		goto(`/users/${userId}`);
	}

	function handleRetry() {
		window.location.reload();
	}
</script>

<div class="users-page">
	<div class="page-header">
		<div class="header-content">
			<h1>Users</h1>
			<p>Browse and search through user profiles</p>
		</div>

		<div class="header-actions">
			<SearchBar
				bind:value={searchTerm}
				placeholder="Search users by name, username, or email..."
			/>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner size="lg" text="Loading users..." />
		</div>
	{:else if error}
		<ErrorMessage
			error={{ message: error }}
			title="Failed to Load Users"
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
						class:active={sortBy === "name"}
						onclick={() => handleSort("name")}
					>
						Name
						{#if sortBy === "name"}
							<span
								class="sort-arrow"
								class:desc={sortDirection === "desc"}
							>↑</span>
						{/if}
					</button>
					<button
						class="sort-btn"
						class:active={sortBy === "username"}
						onclick={() => handleSort("username")}
					>
						Username
						{#if sortBy === "username"}
							<span
								class="sort-arrow"
								class:desc={sortDirection === "desc"}
							>↑</span>
						{/if}
					</button>
					<button
						class="sort-btn"
						class:active={sortBy === "email"}
						onclick={() => handleSort("email")}
					>
						Email
						{#if sortBy === "email"}
							<span
								class="sort-arrow"
								class:desc={sortDirection === "desc"}
							>↑</span>
						{/if}
					</button>
					<button
						class="sort-btn"
						class:active={sortBy === "company"}
						onclick={() => handleSort("company")}
					>
						Company
						{#if sortBy === "company"}
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
					{displayUsers.length} user{
						displayUsers.length !== 1 ? "s" : ""
					} found
				</span>
			</div>
		</div>

		<!-- Users List/Grid -->
		{#if displayUsers.length === 0}
			<div class="empty-state">
				<div class="empty-icon">🔍</div>
				<h3>No users found</h3>
				<p>
					Try adjusting your search criteria or clear the search to
					see all users.
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
				class="users-container"
				class:grid-view={viewMode === "grid"}
				class:list-view={viewMode === "list"}
			>
				{#each displayUsers as user (user.id)}
					<div
						class="user-item"
						onclick={() => handleViewUser(user.id)}
					>
						<UserCard
							{user}
							compact={viewMode === "list"}
							showActions={false}
						/>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
.users-page {
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

.results-count {
	margin-left: auto;
}

.count-text {
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
	font-weight: 500;
}

/* Users Container */
.users-container {
	display: grid;
	gap: var(--spacing-lg);
}

.users-container.grid-view {
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.users-container.list-view {
	grid-template-columns: 1fr;
	gap: var(--spacing-md);
}

.user-item {
	cursor: pointer;
	transition: transform 0.2s ease;
}

.user-item:hover {
	transform: translateY(-2px);
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

	.results-count {
		margin-left: 0;
		text-align: center;
	}

	.users-container.grid-view {
		grid-template-columns: 1fr;
	}

	.sort-buttons {
		justify-content: center;
	}
}

@media (max-width: 480px) {
	.users-page {
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
}
</style>
