<script lang="ts">
	interface Props {
		page: number;
		total: number;
		perPage: number;
		onPageChange: (page: number) => void;
	}

	let { page, total, perPage, onPageChange }: Props = $props();

	const totalPages = $derived(Math.ceil(total / perPage));
	const hasPrev = $derived(page > 1);
	const hasNext = $derived(page < totalPages);
</script>

<nav class="pagination">
	<button disabled={!hasPrev} onclick={() => onPageChange(page - 1)}>
		&larr; Prev
	</button>

	<span class="info">
		Page {page} of {totalPages}
	</span>

	<button disabled={!hasNext} onclick={() => onPageChange(page + 1)}>
		Next &rarr;
	</button>
</nav>

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 1rem 0;
		border-top: 1px solid #e0e0e0;
		margin-top: 1rem;
	}

	button {
		background: #ff6600;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		cursor: pointer;
		font-size: 0.9rem;
		border-radius: 3px;
	}

	button:hover:not(:disabled) {
		background: #e65c00;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.info {
		color: #828282;
		font-size: 0.9rem;
	}
</style>
