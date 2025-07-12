<script lang="ts">
	import { debouncedSearch } from "../stores";

	export let placeholder: string = "Search...";
	export let value: string = "";
	export let disabled: boolean = false;
	export let showClearButton: boolean = true;

	let inputElement: HTMLInputElement;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		debouncedSearch(value);
	}

	function handleClear() {
		value = "";
		debouncedSearch("");
		inputElement?.focus();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			handleClear();
		}
	}
</script>

<div class="search-container">
	<div class="search-input-wrapper">
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

		<input
			bind:this={inputElement}
			bind:value
			type="text"
			class="search-input"
			{placeholder}
			{disabled}
			oninput={handleInput}
			onkeydown={handleKeydown}
		/>

		{#if showClearButton && value && !disabled}
			<button
				type="button"
				class="clear-button"
				onclick={handleClear}
				aria-label="Clear search"
			>
				<svg
					width="16"
					height="16"
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
		{/if}
	</div>
</div>

<style>
.search-container {
	width: 100%;
	max-width: 400px;
}

.search-input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.search-icon {
	position: absolute;
	left: var(--spacing-md);
	color: var(--color-text-muted);
	pointer-events: none;
	z-index: 1;
}

.search-input {
	width: 100%;
	padding: var(--spacing-sm) var(--spacing-xl) var(--spacing-sm) 2.75rem;
	border: 1px solid var(--color-border);
	border-radius: var(--radius-md);
	background: var(--color-bg-primary);
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	transition: all 0.2s ease;
}

.search-input:focus {
	outline: none;
	border-color: var(--color-primary);
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	background: var(--color-bg-secondary);
}

.search-input::placeholder {
	color: var(--color-text-muted);
}

.clear-button {
	position: absolute;
	right: var(--spacing-sm);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border: none;
	background: none;
	color: var(--color-text-muted);
	cursor: pointer;
	border-radius: var(--radius-sm);
	transition: all 0.2s ease;
}

.clear-button:hover {
	color: var(--color-text-secondary);
	background: var(--color-bg-secondary);
}

.clear-button:focus {
	outline: none;
	box-shadow: 0 0 0 2px var(--color-primary);
}

@media (max-width: 768px) {
	.search-container {
		max-width: none;
	}
}
</style>
