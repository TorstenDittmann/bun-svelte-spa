import { createRouter, type RadixRouter } from "radix3";
import { derived, type Readable, type Writable, writable } from "svelte/store";

export type Route = {
	path: string;
	component:
		| import("svelte").Component
		| (() => Promise<{ default: import("svelte").Component }>);
	props?: Record<string, unknown>;
};

export type RouteState = {
	route: Route | null;
	params: Record<string, string>;
	path: string;
};

export type NavigationType = "goto" | "popstate" | "link";

export type Navigation = {
	from: RouteState;
	to: RouteState;
	type: NavigationType;
};

export type BeforeNavigateCallback = (
	navigation: Navigation & { cancel: () => void },
) => void | Promise<void>;

export type AfterNavigateCallback = (navigation: Navigation) => void;

type ExtractPaths<T extends readonly Route[]> = T[number]["path"];

type ExtractParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
	? { [K in Param]: string } & ExtractParams<`/${Rest}`>
	: T extends `${infer _Start}:${infer Param}` ? { [K in Param]: string }
	: {};

type HasParams<T extends string> = T extends `${string}:${string}` ? true : false;

export type QueryParams = {
	get: (key: string) => string | null;
	getAll: (key: string) => string[];
	has: (key: string) => boolean;
	entries: () => IterableIterator<[string, string]>;
	toString: () => string;
};

export class RouterInstance<T extends readonly Route[]> {
	private radix_router: RadixRouter<Route>;
	private before_navigate_callbacks: Set<BeforeNavigateCallback> = new Set();
	private after_navigate_callbacks: Set<AfterNavigateCallback> = new Set();
	private navigation_type: NavigationType = "goto";
	readonly routes: T;
	readonly current: Writable<RouteState>;
	readonly queryParams: Readable<QueryParams>;

	constructor(routes: T) {
		this.routes = routes;
		this.radix_router = createRouter<Route>();
		this.current = writable<RouteState>({
			route: null,
			params: {},
			path: "",
		});

		// Derive query params from current route
		this.queryParams = derived(this.current, () => this.createQueryParams());

		// Add all routes to the radix3 router
		for (const route of routes) {
			// radix3 supports :param syntax natively
			this.radix_router.insert(route.path, route);
		}

		// Bind methods for destructuring
		this.goto = this.goto.bind(this);
		this.resolve = this.resolve.bind(this);
		this.match = this.match.bind(this);
		this.navigate = this.navigate.bind(this);
		this.updateRoute = this.updateRoute.bind(this);
		this.beforeNavigate = this.beforeNavigate.bind(this);
		this.afterNavigate = this.afterNavigate.bind(this);
		this.isActive = this.isActive.bind(this);
		this.setQueryParams = this.setQueryParams.bind(this);
	}

	beforeNavigate(callback: BeforeNavigateCallback): () => void {
		this.before_navigate_callbacks.add(callback);
		return () => this.before_navigate_callbacks.delete(callback);
	}

	afterNavigate(callback: AfterNavigateCallback): () => void {
		this.after_navigate_callbacks.add(callback);
		return () => this.after_navigate_callbacks.delete(callback);
	}

	match(pathname: string): { route: Route | null; params: Record<string, string> } {
		const match = this.radix_router.lookup(pathname);
		if (!match) {
			return { route: null, params: {} };
		}

		// Extract parameters from the matched route
		const params: Record<string, string> = {};
		if (match.params) {
			// radix3 returns params as an object
			Object.assign(params, match.params);
		}

		// Return the original route data without the params that radix3 may have added
		const originalRoute = this.routes.find(
			(r) => r.path === match.path && r.component === match.component,
		);

		return { route: originalRoute || match, params };
	}

	goto<P extends ExtractPaths<T>>(
		path: P,
		...args: HasParams<P> extends true ? ExtractParams<P> extends Record<string, never> ? [params?: never]
			: [params: ExtractParams<P>]
			: [params?: never]
	) {
		const params = args[0];
		const final_path = params ? this.interpolate_path(path, params) : path;
		this.navigate(final_path);
	}

	resolve<P extends ExtractPaths<T>>(
		path: P,
		...args: HasParams<P> extends true ? ExtractParams<P> extends Record<string, never> ? [params?: never]
			: [params: ExtractParams<P>]
			: [params?: never]
	): string {
		const params = args[0];
		if (params) {
			return this.interpolate_path(path, params);
		}

		// Check if path has parameters but none were provided
		if (path.includes(":")) {
			throw new Error(`Missing parameters for path: ${path}`);
		}

		return path;
	}

	async navigate(path: string, replace = false, type: NavigationType = "goto") {
		this.navigation_type = type;

		const from = this.get_current_state();
		const { route: to_route, params: to_params } = this.match(path);
		const to: RouteState = { route: to_route, params: to_params, path };

		// Run beforeNavigate callbacks
		let cancelled = false;
		const cancel = () => {
			cancelled = true;
		};

		for (const callback of this.before_navigate_callbacks) {
			await callback({ from, to, type: this.navigation_type, cancel });
			if (cancelled) return;
		}

		if (replace) {
			window.history.replaceState({}, "", path);
		} else {
			window.history.pushState({}, "", path);
		}

		await this.updateRoute();
	}

	async updateRoute(type?: NavigationType) {
		if (type) this.navigation_type = type;

		const from = this.get_current_state();
		const pathname = window.location.pathname;
		const { route: matched_route, params: route_params } = this.match(pathname);

		if (matched_route && matched_route.component) {
			const component = matched_route.component as unknown;
			// Check if it's a dynamic import (function with no args)
			// Svelte 5 components have 2 args (anchor, props)
			if (typeof component === "function" && component.length === 0) {
				try {
					const module = await component();
					matched_route.component = module.default;
				} catch (error) {
					console.error("Failed to load route component:", error);
				}
			}
		}

		const to: RouteState = {
			route: matched_route,
			params: route_params,
			path: pathname,
		};

		this.current.set(to);

		// Run afterNavigate callbacks
		for (const callback of this.after_navigate_callbacks) {
			callback({ from, to, type: this.navigation_type });
		}
	}

	private get_current_state(): RouteState {
		let state: RouteState = { route: null, params: {}, path: "" };
		this.current.subscribe((s: RouteState) => {
			state = s;
		})();
		return state;
	}

	private interpolate_path(path: string, params: Record<string, string>): string {
		return path.replace(/:([^/]+)/g, (_, param_name) => {
			const value = params[param_name];
			if (value === undefined) {
				throw new Error(`Missing parameter: ${param_name}`);
			}
			return value;
		});
	}

	private createQueryParams(): QueryParams {
		const searchParams = new URLSearchParams(window.location.search);
		return {
			get: (key: string) => searchParams.get(key),
			getAll: (key: string) => searchParams.getAll(key),
			has: (key: string) => searchParams.has(key),
			entries: () => searchParams.entries(),
			toString: () => searchParams.toString(),
		};
	}

	setQueryParams(
		params: Record<string, string | string[] | null>,
		options: { replace?: boolean } = {},
	) {
		const searchParams = new URLSearchParams(window.location.search);

		for (const [key, value] of Object.entries(params)) {
			if (value === null) {
				searchParams.delete(key);
			} else if (Array.isArray(value)) {
				searchParams.delete(key);
				for (const v of value) {
					searchParams.append(key, v);
				}
			} else {
				searchParams.set(key, value);
			}
		}

		const search = searchParams.toString();
		const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;

		if (options.replace) {
			window.history.replaceState({}, "", newUrl);
		} else {
			window.history.pushState({}, "", newUrl);
		}

		// Trigger update to refresh queryParams store
		this.current.update((state) => ({ ...state }));
	}

	isActive(path: string, options: { exact?: boolean } = {}): boolean {
		const currentPath = this.get_current_state().path;
		if (options.exact) {
			return currentPath === path;
		}
		return currentPath === path || currentPath.startsWith(`${path}/`);
	}
}

export function create_router<const T extends readonly Route[]>(routes: T): RouterInstance<T> {
	return new RouterInstance(routes);
}
