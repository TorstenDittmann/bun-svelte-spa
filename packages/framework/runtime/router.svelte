<script>
	import { onMount } from "svelte";
	import { route } from "./router.js";

	/**
	 * Component props
	 * @type {{ routes: readonly import('./router').Route[], fallback?: import('svelte').Component | null }}
	 */
	let { routes = [], fallback = null } = $props();

	/**
	 * Current route state
	 * @type {import('./router').RouteState}
	 */
	let route_state = $state({ route: null, params: {}, path: "" });

	// Subscribe to route store
	$effect(() => {
		route_state = $route;
	});

	/**
	 * Matches a route path pattern against the current path
	 * @param {string} pattern - Route pattern (e.g., '/users/:id')
	 * @param {string} path - Current path (e.g., '/users/123')
	 * @returns {{match: boolean, params: Object}} Match result and extracted parameters
	 */
	function match_route(pattern, path) {
		const pattern_parts = pattern.split("/").filter(Boolean);
		const path_parts = path.split("/").filter(Boolean);

		if (pattern_parts.length !== path_parts.length) {
			return { match: false, params: {} };
		}

		const params = {};

		for (let i = 0; i < pattern_parts.length; i++) {
			const pattern_part = pattern_parts[i];
			const path_part = path_parts[i];

			if (pattern_part.startsWith(":")) {
				// Dynamic parameter
				params[pattern_part.slice(1)] = path_part;
			} else if (pattern_part !== path_part) {
				// Static part doesn't match
				return { match: false, params: {} };
			}
		}

		return { match: true, params };
	}

	/**
	 * Updates the current route based on the current path
	 */
	function update_route() {
		const pathname = window.location.pathname;

		// Find matching route
		for (const route_item of routes) {
			const { match, params: route_params } = match_route(
				route_item.path,
				pathname,
			);

			if (match) {
				route.set({
					route: route_item,
					params: route_params,
					path: pathname,
				});
				return;
			}
		}

		// No route matched, use fallback
		route.set({
			route: null,
			params: {},
			path: pathname,
		});
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
		update_route();
	}

	/**
	 * Handles click events on links to enable SPA navigation
	 * @param {Event} event - The click event
	 */
	function handle_click(event) {
		const link = event.target.closest("a");

		if (link && link.href.startsWith(window.location.origin)) {
			event.preventDefault();
			const path = link.pathname;
			navigate(path);
		}
	}

	// Initialize router on mount
	onMount(() => {
		update_route();
		window.addEventListener("goto", update_route);
		window.addEventListener("popstate", update_route);
		document.addEventListener("click", handle_click);

		return () => {
			window.removeEventListener("goto", update_route);
			window.removeEventListener("popstate", update_route);
			document.removeEventListener("click", handle_click);
		};
	});
</script>

{#if route_state.route}
	{@render 	route_state.route.component({
		params: route_state.params,
		...(route_state.route.props || {}),
	})}
{:else if fallback}
	{@render fallback({ path: route_state.path })}
{:else}
	<div>
		<h1>404 - Page Not Found</h1>
		<p>The page "{route_state.path}" could not be found.</p>
		<a href="/">Go Home</a>
	</div>
{/if}
