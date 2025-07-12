<script>
	let counter = $state(0);

	function increment() {
		counter++;
	}
</script>

<div class="flex flex-col items-center space-y-4">
	<div class="text-center">
		<h3 class="text-lg font-medium text-gray-900 mb-2">Counter Demo</h3>
		<div class="text-3xl font-bold text-indigo-600 mb-4">{counter}</div>
	</div>
	<button
		onclick={increment}
		class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
	>
		<svg
			class="w-5 h-5 mr-2"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 6v6m0 0v6m0-6h6m-6 0H6"
			>
			</path>
		</svg>
		Increment
	</button>
</div>
