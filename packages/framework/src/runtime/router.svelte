<script>
	import { onMount } from "svelte";

	/**
	 * Component props
	 * @type {{ routes: readonly import('./router').Route[], fallback?: import('svelte').Component | null }}
	 */
	let { routes = [], fallback = null } = $props();

	/**
	 * Current active route
	 * @type {import('./router').Route | null}
	 */
	let currentRoute = $state(null);

	/**
	 * Current route parameters
	 * @type {Object}
	 */
	let params = $state({});

	/**
	 * Current path
	 * @type {string}
	 */
	let currentPath = $state("");

	/**
	 * Matches a route path pattern against the current path
	 * @param {string} pattern - Route pattern (e.g., '/users/:id')
	 * @param {string} path - Current path (e.g., '/users/123')
	 * @returns {{match: boolean, params: Object}} Match result and extracted parameters
	 */
	function matchRoute(pattern, path) {
		const patternParts = pattern.split("/").filter(Boolean);
		const pathParts = path.split("/").filter(Boolean);

		if (patternParts.length !== pathParts.length) {
			return { match: false, params: {} };
		}

		const params = {};

		for (let i = 0; i < patternParts.length; i++) {
			const patternPart = patternParts[i];
			const pathPart = pathParts[i];

			if (patternPart.startsWith(":")) {
				// Dynamic parameter
				params[patternPart.slice(1)] = pathPart;
			} else if (patternPart !== pathPart) {
				// Static part doesn't match
				return { match: false, params: {} };
			}
		}

		return { match: true, params };
	}

	/**
	 * Updates the current route based on the current path
	 */
	function updateRoute() {
		currentPath = window.location.pathname;

		// Find matching route
		for (const route of routes) {
			const { match, params: routeParams } = matchRoute(
				route.path,
				currentPath,
			);

			if (match) {
				currentRoute = route;
				params = routeParams;
				return;
			}
		}

		// No route matched, use fallback
		currentRoute = null;
		params = {};
	}

	/**
	 * Navigates to a new path
	 * @param {string} path - The path to navigate to
	 * @param {boolean} [replace=false] - Whether to replace the current history entry
	 */
	function navigate(path, replace = false) {
		if (replace) {
			window.history.replaceState({}, "", path);
		} else {
			window.history.pushState({}, "", path);
		}
		updateRoute();
	}

	/**
	 * Handles click events on links to enable SPA navigation
	 * @param {Event} event - The click event
	 */
	function handleClick(event) {
		const link = event.target.closest("a");

		if (link && link.href.startsWith(window.location.origin)) {
			event.preventDefault();
			const path = link.pathname;
			navigate(path);
		}
	}

	// Initialize router on mount
	onMount(() => {
		updateRoute();
		window.addEventListener("goto", updateRoute);
		window.addEventListener("popstate", updateRoute);
		document.addEventListener("click", handleClick);

		return () => {
			window.removeEventListener("goto", updateRoute);
			window.removeEventListener("popstate", updateRoute);
			document.removeEventListener("click", handleClick);
		};
	});
</script>

{#if currentRoute}
	{@render currentRoute.component({ params, ...(currentRoute.props || {}) })}
{:else if fallback}
	{@render fallback({ path: currentPath })}
{:else}
	<div>
		<h1>404 - Page Not Found</h1>
		<p>The page "{currentPath}" could not be found.</p>
		<a href="/">Go Home</a>
	</div>
{/if}
