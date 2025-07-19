<script lang="ts">
	import { goto, resolve } from "@router";

	let searchQuery = $state("");

	function handleGoBack() {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			goto("/");
		}
	}

	function handleSearch() {
		if (searchQuery.trim()) {
			goto("/search");
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			handleSearch();
		}
	}
</script>

<div class="not-found-page">
	<div class="not-found-content">
		<!-- 404 Illustration -->
		<div class="error-illustration">
			<div class="error-code">404</div>
			<div class="error-graphic">
				<div class="planet">
					<div class="planet-ring"></div>
					<div class="planet-surface">
						<div class="crater crater-1"></div>
						<div class="crater crater-2"></div>
						<div class="crater crater-3"></div>
					</div>
				</div>
				<div class="astronaut">
					<div class="astronaut-body">
						<div class="helmet">
							<div class="helmet-reflection"></div>
							<div class="face">
								<div class="eye eye-left"></div>
								<div class="eye eye-right"></div>
								<div class="mouth"></div>
							</div>
						</div>
						<div class="suit">
							<div class="chest-control"></div>
						</div>
						<div class="arm arm-left"></div>
						<div class="arm arm-right"></div>
						<div class="leg leg-left"></div>
						<div class="leg leg-right"></div>
					</div>
				</div>
				<div class="stars">
					<div class="star star-1"></div>
					<div class="star star-2"></div>
					<div class="star star-3"></div>
					<div class="star star-4"></div>
					<div class="star star-5"></div>
				</div>
			</div>
		</div>

		<!-- Error Message -->
		<div class="error-message">
			<h1>Oops! Page not found</h1>
			<p class="error-description">
				The page you're looking for seems to have drifted into deep
				space. It might have been moved, deleted, or you entered the
				wrong URL.
			</p>
		</div>

		<!-- Search Section -->
		<div class="search-section">
			<h2>Try searching for what you need</h2>
			<div class="search-container">
				<input
					bind:value={searchQuery}
					type="text"
					placeholder="Search for users, posts, or albums..."
					class="search-input"
					onkeydown={handleKeyDown}
				/>
				<button
					class="search-btn"
					onclick={handleSearch}
					aria-label="Search"
				>
					<svg
						width="20"
						height="20"
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
				</button>
			</div>
		</div>

		<!-- Navigation Options -->
		<div class="navigation-options">
			<h2>Or explore these options</h2>
			<div class="options-grid">
				<a href={resolve("/")} class="option-card">
					<div class="option-icon">🏠</div>
					<h3>Go Home</h3>
					<p>Return to the homepage</p>
				</a>

				<a href={resolve("/dashboard")} class="option-card">
					<div class="option-icon">📊</div>
					<h3>Dashboard</h3>
					<p>View statistics and recent activity</p>
				</a>

				<a href={resolve("/users")} class="option-card">
					<div class="option-icon">👥</div>
					<h3>Browse Users</h3>
					<p>Explore user profiles</p>
				</a>

				<a href={resolve("/posts")} class="option-card">
					<div class="option-icon">📝</div>
					<h3>Read Posts</h3>
					<p>Discover interesting content</p>
				</a>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="action-buttons">
			<a href={resolve("/")} class="btn btn-primary">
				Take Me Home
			</a>
			<button class="btn btn-secondary" onclick={handleGoBack}>
				Go Back
			</button>
		</div>
	</div>
</div>

<style>
	.not-found-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-lg);
		background: linear-gradient(
			135deg,
			var(--color-bg-primary) 0%,
			var(--color-bg-secondary) 100%
		);
	}

	.not-found-content {
		max-width: 800px;
		width: 100%;
		text-align: center;
	}

	/* Error Illustration */
	.error-illustration {
		position: relative;
		margin-bottom: var(--spacing-2xl);
	}

	.error-code {
		font-size: 8rem;
		font-weight: 900;
		color: var(--color-primary);
		opacity: 0.1;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 0;
	}

	.error-graphic {
		position: relative;
		height: 300px;
		z-index: 1;
	}

	/* Planet */
	.planet {
		position: absolute;
		right: 20%;
		top: 20%;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, #ff6b6b, #feca57);
		animation: rotate 20s linear infinite;
	}

	.planet-ring {
		position: absolute;
		top: -20px;
		left: -20px;
		right: -20px;
		bottom: -20px;
		border: 3px solid var(--color-primary);
		border-radius: 50%;
		opacity: 0.3;
		transform: rotateX(75deg);
	}

	.planet-surface {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		position: relative;
		overflow: hidden;
	}

	.crater {
		position: absolute;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.2);
	}

	.crater-1 {
		width: 20px;
		height: 20px;
		top: 30%;
		left: 40%;
	}

	.crater-2 {
		width: 15px;
		height: 15px;
		top: 60%;
		left: 20%;
	}

	.crater-3 {
		width: 12px;
		height: 12px;
		top: 70%;
		left: 60%;
	}

	/* Astronaut */
	.astronaut {
		position: absolute;
		left: 20%;
		top: 10%;
		animation: float 3s ease-in-out infinite;
	}

	.astronaut-body {
		position: relative;
		width: 80px;
		height: 120px;
	}

	.helmet {
		width: 60px;
		height: 60px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		position: relative;
		margin: 0 auto;
		border: 3px solid var(--color-border);
	}

	.helmet-reflection {
		position: absolute;
		top: 10px;
		left: 10px;
		width: 20px;
		height: 20px;
		background: rgba(255, 255, 255, 0.7);
		border-radius: 50%;
	}

	.face {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.eye {
		width: 6px;
		height: 6px;
		background: #333;
		border-radius: 50%;
		display: inline-block;
		margin: 0 2px;
	}

	.mouth {
		width: 12px;
		height: 6px;
		border: 2px solid #333;
		border-top: none;
		border-radius: 0 0 12px 12px;
		margin-top: 4px;
	}

	.suit {
		width: 50px;
		height: 50px;
		background: var(--color-bg-primary);
		border: 2px solid var(--color-border);
		border-radius: 10px;
		margin: 5px auto;
		position: relative;
	}

	.chest-control {
		width: 15px;
		height: 15px;
		background: var(--color-primary);
		border-radius: 3px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.arm {
		width: 20px;
		height: 40px;
		background: var(--color-bg-primary);
		border: 2px solid var(--color-border);
		border-radius: 10px;
		position: absolute;
		top: 65px;
	}

	.arm-left {
		left: -15px;
		transform: rotate(-20deg);
	}

	.arm-right {
		right: -15px;
		transform: rotate(20deg);
	}

	.leg {
		width: 15px;
		height: 30px;
		background: var(--color-bg-primary);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		position: absolute;
		top: 105px;
	}

	.leg-left {
		left: 20px;
	}

	.leg-right {
		right: 20px;
	}

	/* Stars */
	.stars {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.star {
		position: absolute;
		width: 4px;
		height: 4px;
		background: var(--color-primary);
		border-radius: 50%;
		animation: twinkle 2s ease-in-out infinite;
	}

	.star-1 {
		top: 20%;
		left: 10%;
		animation-delay: 0s;
	}
	.star-2 {
		top: 30%;
		right: 15%;
		animation-delay: 0.5s;
	}
	.star-3 {
		bottom: 40%;
		left: 15%;
		animation-delay: 1s;
	}
	.star-4 {
		bottom: 20%;
		right: 30%;
		animation-delay: 1.5s;
	}
	.star-5 {
		top: 60%;
		left: 50%;
		animation-delay: 2s;
	}

	/* Error Message */
	.error-message {
		margin-bottom: var(--spacing-2xl);
	}

	.error-message h1 {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-md);
	}

	.error-description {
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
		line-height: 1.6;
		max-width: 500px;
		margin: 0 auto;
	}

	/* Search Section */
	.search-section {
		margin-bottom: var(--spacing-2xl);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
	}

	.search-section h2 {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-lg);
	}

	.search-container {
		display: flex;
		max-width: 400px;
		margin: 0 auto;
		gap: var(--spacing-sm);
	}

	.search-input {
		flex: 1;
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		font-size: var(--font-size-base);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-btn {
		padding: var(--spacing-md);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.search-btn:hover {
		background: var(--color-primary-dark);
	}

	/* Navigation Options */
	.navigation-options {
		margin-bottom: var(--spacing-2xl);
	}

	.navigation-options h2 {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-lg);
	}

	.options-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}

	.option-card {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.option-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--color-primary);
		text-decoration: none;
		color: inherit;
	}

	.option-icon {
		font-size: 2.5rem;
		margin-bottom: var(--spacing-md);
	}

	.option-card h3 {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.option-card p {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Action Buttons */
	.action-buttons {
		display: flex;
		justify-content: center;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	/* Animations */
	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes twinkle {
		0%, 100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.error-code {
			font-size: 6rem;
		}

		.error-graphic {
			height: 250px;
		}

		.error-message h1 {
			font-size: var(--font-size-2xl);
		}

		.error-description {
			font-size: var(--font-size-base);
		}

		.options-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.action-buttons {
			flex-direction: column;
			align-items: center;
		}
	}

	@media (max-width: 480px) {
		.not-found-page {
			padding: var(--spacing-md);
		}

		.error-code {
			font-size: 4rem;
		}

		.error-graphic {
			height: 200px;
		}

		.planet {
			width: 80px;
			height: 80px;
		}

		.astronaut-body {
			width: 60px;
			height: 90px;
		}

		.helmet {
			width: 45px;
			height: 45px;
		}

		.suit {
			width: 40px;
			height: 40px;
		}

		.options-grid {
			grid-template-columns: 1fr;
		}

		.search-container {
			flex-direction: column;
		}
	}
</style>
