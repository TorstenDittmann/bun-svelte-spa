<script lang="ts">
	interface Props {
		size?: "small" | "medium" | "large";
	}

	let { size = "medium" }: Props = $props();
</script>

<div class="spinner {size}"></div>

<style>
	.spinner {
		border: 2px solid #f3f3f3;
		border-top: 2px solid #ff6600;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.small {
		width: 16px;
		height: 16px;
	}

	.medium {
		width: 32px;
		height: 32px;
	}

	.large {
		width: 48px;
		height: 48px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
