<script>
	import { onMount } from "svelte";

	/**
	 * Component props
	 * @type {{ router: import('./router').RouterInstance<any>, fallback?: import('svelte').Component | null }}
	 */
	let { router, fallback = null } = $props();

	const { current } = router;

	/**
	 * Handles click events on links to enable SPA navigation
	 * @param {Event} event - The click event
	 */
	function handle_click(event) {
		const link = event.target.closest("a");

		if (link && link.href.startsWith(window.location.origin)) {
			event.preventDefault();
			const path = link.pathname;
			router.navigate(path);
		}
	}

	// Initialize router on mount
	onMount(() => {
		router.updateRoute();
		window.addEventListener("popstate", router.updateRoute);
		document.addEventListener("click", handle_click);

		return () => {
			window.removeEventListener("popstate", router.updateRoute);
			document.removeEventListener("click", handle_click);
		};
	});
</script>

{#if $current.route}
	{@render 	$current.route.component({
		params: $current.params,
		...($current.route.props || {}),
	})}
{:else if fallback}
	{@render fallback({ path: $current.path })}
{:else}
	<div>
		<h1>404 - Page Not Found</h1>
		<p>The page "{$current.path}" could not be found.</p>
		<a href="/">Go Home</a>
	</div>
{/if}
