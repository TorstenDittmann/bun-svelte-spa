<script lang="ts">
	let {
		size = "md",
		color = "var(--color-primary)",
		text = "",
	}: {
		size?: "sm" | "md" | "lg";
		color?: string;
		text?: string;
	} = $props();

	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-6 h-6",
		lg: "w-8 h-8",
	};
</script>

<div class="loading-container">
	<div
		class="spinner {sizeClasses[size]}"
		style:border-top-color={color}
	>
	</div>
	{#if text}
		<span class="loading-text">{text}</span>
	{/if}
</div>

<style>
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing-sm);
}

.spinner {
	border: 2px solid var(--color-border);
	border-radius: 50%;
	border-top-color: var(--color-primary);
	animation: spin 1s linear infinite;
}

.w-4 {
	width: 1rem;
	height: 1rem;
}
.w-6 {
	width: 1.5rem;
	height: 1.5rem;
}
.w-8 {
	width: 2rem;
	height: 2rem;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.loading-text {
	font-size: var(--font-size-sm);
	color: var(--color-text-muted);
}
</style>
