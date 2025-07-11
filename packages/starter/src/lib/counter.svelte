<script>
	let counter = $state(0);

	function increment() {
		counter++;
	}
</script>

<button onclick={increment}>{counter}++</button>
