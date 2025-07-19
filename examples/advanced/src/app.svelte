<script lang="ts">
	import { theme, toggleTheme } from "@lib/stores";
	import { goto, routes } from "@router";
	import NotFound from "@routes/not-found.svelte";
	import { Router } from "bun-svelte-spa/runtime";
</script>

<div class="app" class:dark={$theme === "dark"}>
	<!-- Navigation Header -->
	<header>
		<nav class="container">
			<div class="nav-content">
				<div class="nav-brand">
					<a href="/" class="brand-link">
						Svelte+Bun
					</a>
				</div>

				<ul class="nav-menu">
					<li>
						<a
							href="/"
							class="nav-link"
						>
							Home
						</a>
					</li>
					<li>
						<a
							href="/dashboard"
							class="nav-link"
						>
							Dashboard
						</a>
					</li>
					<li>
						<a
							href="/users"
							class="nav-link"
						>
							Users
						</a>
					</li>
					<li>
						<a
							href="/posts"
							class="nav-link"
						>
							Posts
						</a>
					</li>
					<li>
						<a
							href="/albums"
							class="nav-link"
						>
							Albums
						</a>
					</li>
					<li>
						<a
							href="/search"
							class="nav-link"
						>
							Search
						</a>
					</li>
				</ul>

				<div class="nav-actions">
					<button
						onclick={toggleTheme}
						class="theme-toggle"
						aria-label="Toggle theme"
					>
						{#if $theme === "light"}
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
									stroke="currentColor"
									stroke-width="2"
									fill="none"
								/>
							</svg>
						{:else}
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle
									cx="12"
									cy="12"
									r="5"
									stroke="currentColor"
									stroke-width="2"
									fill="none"
								/>
								<line
									x1="12"
									y1="1"
									x2="12"
									y2="3"
									stroke="currentColor"
									stroke-width="2"
								/>
								<line
									x1="12"
									y1="21"
									x2="12"
									y2="23"
									stroke="currentColor"
									stroke-width="2"
								/>
								<line
									x1="4.22"
									y1="4.22"
									x2="5.64"
									y2="5.64"
									stroke="currentColor"
									stroke-width="2"
								/>
								<line
									x1="18.36"
									y1="18.36"
									x2="19.78"
									y2="19.78"
									stroke="currentColor"
									stroke-width="2"
								/>
								<line
									x1="1"
									y1="12"
									x2="3"
									y2="12"
									stroke="currentColor"
									stroke-width="2"
								/>
								<line
									x1="21"
									y1="12"
									x2="23"
									y2="12"
									stroke="currentColor"
									stroke-width="2"
								/>
								<line
									x1="4.22"
									y1="19.78"
									x2="5.64"
									y2="18.36"
									stroke="currentColor"
									stroke-width="2"
								/>
								<line
									x1="18.36"
									y1="5.64"
									x2="19.78"
									y2="4.22"
									stroke="currentColor"
									stroke-width="2"
								/>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</nav>
	</header>

	<!-- Main Content -->
	<main class="main-content">
		<div class="container">
			<Router {routes} fallback={NotFound} />
		</div>
	</main>
</div>

<style>
	.app {
		min-height: 100vh;
		background: var(--color-bg-primary);
		transition: background-color 0.2s ease;
	}

	header {
		background: var(--color-bg-primary);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(8px);
	}

	.nav-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md) 0;
		gap: var(--spacing-lg);
	}

	.nav-brand .brand-link {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-primary);
		cursor: pointer;
		text-decoration: none;
		transition: color 0.2s ease;
		display: block;
	}

	.nav-brand .brand-link:hover {
		color: var(--color-primary-dark);
	}

	.nav-menu {
		display: flex;
		list-style: none;
		gap: var(--spacing-md);
		margin: 0;
		padding: 0;
		flex: 1;
		justify-content: center;
	}

	.nav-link {
		color: var(--color-text-secondary);
		font-weight: 500;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		display: block;
	}

	.nav-link:hover {
		color: var(--color-primary);
		background: rgba(59, 130, 246, 0.1);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-primary);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.theme-toggle:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-border-hover);
		color: var(--color-text-primary);
	}

	.main-content {
		flex: 1;
		padding: var(--spacing-xl) 0;
		min-height: calc(100vh - 80px);
	}

	@media (max-width: 768px) {
		.nav-content {
			flex-direction: column;
			gap: var(--spacing-md);
			padding: var(--spacing-sm) 0;
		}

		.nav-menu {
			gap: var(--spacing-sm);
			flex-wrap: wrap;
			justify-content: center;
		}

		.nav-link {
			padding: var(--spacing-xs) var(--spacing-sm);
			font-size: var(--font-size-sm);
		}
	}
</style>
