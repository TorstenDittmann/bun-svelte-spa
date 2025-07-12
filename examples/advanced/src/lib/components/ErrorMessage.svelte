<script lang="ts">
	export let error: { message: string; status?: number } | null =
		null;
	export let title: string = "Something went wrong";
	export let showRetry: boolean = true;
	export let retryText: string = "Try again";
	export let onRetry: (() => void) | undefined = undefined;

	function handleRetry() {
		if (onRetry) {
			onRetry();
		}
	}
</script>

{#if error}
	<div class="error-container">
		<div class="error-icon">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="2"
				/>
				<line
					x1="15"
					y1="9"
					x2="9"
					y2="15"
					stroke="currentColor"
					stroke-width="2"
				/>
				<line
					x1="9"
					y1="9"
					x2="15"
					y2="15"
					stroke="currentColor"
					stroke-width="2"
				/>
			</svg>
		</div>

		<div class="error-content">
			<h3 class="error-title">{title}</h3>
			<p class="error-message">{error.message}</p>

			{#if error.status}
				<span class="error-status badge badge-error">
					Status: {error.status}
				</span>
			{/if}

			{#if showRetry && onRetry}
				<button
					class="btn btn-secondary btn-sm"
					onclick={handleRetry}
				>
					{retryText}
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
.error-container {
	display: flex;
	align-items: flex-start;
	gap: var(--spacing-md);
	padding: var(--spacing-lg);
	background: rgba(239, 68, 68, 0.05);
	border: 1px solid rgba(239, 68, 68, 0.2);
	border-radius: var(--radius-lg);
	margin: var(--spacing-md) 0;
}

.error-icon {
	color: var(--color-error);
	flex-shrink: 0;
	margin-top: var(--spacing-xs);
}

.error-content {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-sm);
	flex: 1;
}

.error-title {
	margin: 0;
	font-size: var(--font-size-lg);
	font-weight: 600;
	color: var(--color-error);
}

.error-message {
	margin: 0;
	color: var(--color-text-secondary);
	line-height: 1.5;
}

.error-status {
	align-self: flex-start;
}
</style>
