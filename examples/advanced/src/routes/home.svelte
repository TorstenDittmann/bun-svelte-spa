<script lang="ts">
	import { api } from "@lib/api";
	import LoadingSpinner from "@lib/components/LoadingSpinner.svelte";
	import { stats } from "@lib/stores";
	import { goto } from "@router";

	import { onMount } from "svelte";

	const featuresData = [
		{
			title: "Modern Routing",
			description:
				"Advanced client-side routing with dynamic parameters and nested routes",
			icon: "🛣️",
			link: "/users",
		},
		{
			title: "Data Loading",
			description:
				"Efficient data fetching with loading states and error handling",
			icon: "📊",
			link: "/posts",
		},
		{
			title: "State Management",
			description:
				"Reactive stores for global state and real-time updates",
			icon: "🔄",
			link: "/dashboard",
		},
		{
			title: "Styled Components",
			description:
				"Beautiful UI components with CSS custom properties and dark mode",
			icon: "🎨",
			link: "/albums",
		},
		{
			title: "Search & Filter",
			description:
				"Powerful search functionality across different data types",
			icon: "🔍",
			link: "/search",
		},
	];

	let loading = $state(false);
	let statsLoaded = $state(false);

	onMount(async () => {
		// Load initial stats data if not already loaded
		if (!statsLoaded) {
			loading = true;
			try {
				// Load some basic data for stats
				await Promise.all([
					api.getUsers(),
					api.getPosts(),
					api.getAlbums(),
				]);
				statsLoaded = true;
			} catch (error) {
				console.error("Failed to load stats:", error);
			} finally {
				loading = false;
			}
		}
	});

	function handleFeatureClick(link: string) {
		if (
			link === "/users" || link === "/posts"
			|| link === "/dashboard" || link === "/albums"
			|| link === "/search"
		) {
			goto(link);
		}
	}
</script>

<div class="home-page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1 class="hero-title">
				Advanced Svelte + Bun
				<span class="hero-highlight">Example</span>
			</h1>
			<p class="hero-description">
				A comprehensive example showcasing modern web development with
				Svelte and Bun. Features routing, data loading, state
				management, and beautiful UI components.
			</p>
			<div class="hero-actions">
				<button
					onclick={() => goto("/dashboard")}
					class="btn btn-primary btn-lg"
				>
					Explore Dashboard
				</button>
				<button
					onclick={() => goto("/users")}
					class="btn btn-secondary btn-lg"
				>
					Browse Users
				</button>
			</div>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="stats">
		{#if loading}
			<div class="stats-loading">
				<LoadingSpinner size="lg" text="Loading stats..." />
			</div>
		{:else}
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-number">{$stats.totalUsers}</div>
					<div class="stat-label">Users</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">{$stats.totalPosts}</div>
					<div class="stat-label">Posts</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">{$stats.totalAlbums}</div>
					<div class="stat-label">Albums</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">{$stats.totalPhotos}</div>
					<div class="stat-label">Photos</div>
				</div>
			</div>
		{/if}
	</section>

	<!-- Features Section -->
	<section class="features">
		<div class="section-header">
			<h2>Features & Capabilities</h2>
			<p>
				Explore the various features demonstrated in this advanced
				example
			</p>
		</div>

		<div class="features-grid">
			{#each featuresData as feature}
				<div
					class="feature-card"
					onclick={() => handleFeatureClick(feature.link)}
				>
					<div class="feature-icon">{feature.icon}</div>
					<h3 class="feature-title">{feature.title}</h3>
					<p class="feature-description">{feature.description}</p>
					<div class="feature-arrow">
						<svg
							width="16"
							height="16"
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
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Technology Section -->
	<section class="technology">
		<div class="section-header">
			<h2>Built With Modern Technologies</h2>
			<p>This example leverages cutting-edge tools and frameworks</p>
		</div>

		<div class="tech-grid">
			<div class="tech-item">
				<div class="tech-logo">⚡</div>
				<h4>Bun</h4>
				<p>Fast JavaScript runtime and bundler</p>
			</div>
			<div class="tech-item">
				<div class="tech-logo">🔥</div>
				<h4>Svelte 5</h4>
				<p>Modern reactive framework with runes</p>
			</div>
			<div class="tech-item">
				<div class="tech-logo">🎨</div>
				<h4>CSS Custom Properties</h4>
				<p>Modern styling with theme support</p>
			</div>
			<div class="tech-item">
				<div class="tech-logo">📡</div>
				<h4>REST API</h4>
				<p>JSONPlaceholder for demo data</p>
			</div>
		</div>
	</section>
</div>

<style>
.home-page {
	min-height: 100vh;
}

/* Hero Section */
.hero {
	text-align: center;
	padding: var(--spacing-2xl) 0;
	min-height: 60vh;
	display: flex;
	align-items: center;
	justify-content: center;
}

.hero-content {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);
}

.hero-title {
	font-size: var(--font-size-4xl);
	font-weight: 700;
	line-height: 1.1;
	margin: 0;
}

.hero-highlight {
	background: linear-gradient(
		135deg,
		var(--color-primary),
		var(--color-secondary)
	);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.hero-description {
	font-size: var(--font-size-lg);
	color: var(--color-text-secondary);
	line-height: 1.6;
	margin: 0;
}

.hero-actions {
	display: flex;
	gap: var(--spacing-md);
	flex-wrap: wrap;
	justify-content: center;
}

/* Stats Section */
.stats {
	padding: var(--spacing-2xl) 0;
	background: var(--color-bg-secondary);
	border-radius: var(--radius-xl);
	margin: var(--spacing-2xl) 0;
}

.stats-loading {
	display: flex;
	justify-content: center;
	padding: var(--spacing-2xl);
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: var(--spacing-lg);
}

.stat-card {
	text-align: center;
	padding: var(--spacing-lg);
}

.stat-number {
	font-size: var(--font-size-3xl);
	font-weight: 700;
	color: var(--color-primary);
	margin-bottom: var(--spacing-xs);
}

.stat-label {
	font-size: var(--font-size-lg);
	color: var(--color-text-secondary);
	font-weight: 500;
}

/* Features Section */
.features {
	padding: var(--spacing-2xl) 0;
}

.section-header {
	text-align: center;
	margin-bottom: var(--spacing-2xl);
}

.section-header h2 {
	font-size: var(--font-size-3xl);
	font-weight: 700;
	margin-bottom: var(--spacing-md);
}

.section-header p {
	font-size: var(--font-size-lg);
	color: var(--color-text-secondary);
}

.features-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: var(--spacing-lg);
}

.feature-card {
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	padding: var(--spacing-lg);
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
	overflow: hidden;
}

.feature-card:hover {
	transform: translateY(-4px);
	box-shadow: var(--shadow-lg);
	border-color: var(--color-primary);
}

.feature-icon {
	font-size: 2.5rem;
	margin-bottom: var(--spacing-md);
}

.feature-title {
	font-size: var(--font-size-xl);
	font-weight: 600;
	margin-bottom: var(--spacing-sm);
	color: var(--color-text-primary);
}

.feature-description {
	color: var(--color-text-secondary);
	line-height: 1.5;
	margin-bottom: var(--spacing-md);
}

.feature-arrow {
	position: absolute;
	top: var(--spacing-lg);
	right: var(--spacing-lg);
	color: var(--color-text-muted);
	transition: all 0.2s ease;
}

.feature-card:hover .feature-arrow {
	color: var(--color-primary);
	transform: translateX(4px);
}

/* Technology Section */
.technology {
	padding: var(--spacing-2xl) 0;
	background: var(--color-bg-secondary);
	border-radius: var(--radius-xl);
	margin-top: var(--spacing-2xl);
}

.tech-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: var(--spacing-lg);
}

.tech-item {
	text-align: center;
	padding: var(--spacing-lg);
}

.tech-logo {
	font-size: 3rem;
	margin-bottom: var(--spacing-md);
}

.tech-item h4 {
	font-size: var(--font-size-lg);
	font-weight: 600;
	margin-bottom: var(--spacing-sm);
	color: var(--color-text-primary);
}

.tech-item p {
	color: var(--color-text-secondary);
	margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
	.hero-title {
		font-size: var(--font-size-3xl);
	}

	.hero-actions {
		justify-content: center;
	}

	.features-grid,
	.tech-grid {
		grid-template-columns: 1fr;
	}

	.stats-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 480px) {
	.hero-actions {
		flex-direction: column;
		align-items: center;
	}

	.stats-grid {
		grid-template-columns: 1fr;
	}
}
</style>
