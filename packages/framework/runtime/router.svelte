<script>
	import { onMount } from "svelte";

	/**
	 * Component props
	 * @type {{ router: import('./router.svelte').RouterInstance<any>, fallback?: import('svelte').Component | null }}
	 */
	let { router, fallback = null } = $props();

	/**
	 * Handles click events on links to enable SPA navigation
	 * @param {Event} event - The click event
	 */
	function handle_click(event) {
		const link = event.target.closest("a");

		if (link && link.href.startsWith(window.location.origin)) {
			event.preventDefault();
			const path = link.pathname;
			router.navigate(path, false, "link");
		}
	}

	/**
	 * Handles browser back/forward navigation
	 */
	function handle_popstate() {
		router.updateRoute("popstate");
	}

	// Initialize router on mount
	onMount(() => {
		router.updateRoute();
		window.addEventListener("popstate", handle_popstate);
		document.addEventListener("click", handle_click);

		return () => {
			window.removeEventListener("popstate", handle_popstate);
			document.removeEventListener("click", handle_click);
		};
	});
</script>

{#if router.current.route}
	{#if router.current.route.parents?.length}
		{@const parents = router.current.route.parents}
		{@const Component = router.current.route.component}
		{@const routeProps = router.current.route.props || {}}
		{@const params = router.current.params}

		{#snippet renderLevel(index)}
			{#if index < parents.length}
				{@const Parent = parents[index]}
				<Parent {params}>
					{@render renderLevel(index + 1)}
				</Parent>
			{:else}
				<Component {params} {...routeProps} />
			{/if}
		{/snippet}

		{@render renderLevel(0)}
	{:else}
		{@const Component = router.current.route.component}
		<Component
			params={router.current.params}
			{...(router.current.route.props || {})}
		/>
	{/if}
{:else if fallback}
	{@const Fallback = fallback}
	<Fallback path={router.current.path} />
{:else}
	<div>
		<h1>404 - Page Not Found</h1>
		<p>The page "{router.current.path}" could not be found.</p>
		<a href="/">Go Home</a>
	</div>
{/if}
