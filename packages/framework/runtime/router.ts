import { createRouter, type RadixRouter } from "radix3";
import { type Writable, writable } from "svelte/store";

export type Route = {
	path: string;
	component: import("svelte").Component | (() => Promise<{ default: import("svelte").Component }>);
	props?: Record<string, unknown>;
};

export type RouteState = {
	route: Route | null;
	params: Record<string, string>;
	path: string;
};

type ExtractPaths<T extends readonly Route[]> = T[number]["path"];

type ExtractParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
	? { [K in Param]: string } & ExtractParams<`/${Rest}`>
	: T extends `${infer _Start}:${infer Param}` ? { [K in Param]: string }
	: {};

type HasParams<T extends string> = T extends `${string}:${string}` ? true : false;

export class RouterInstance<T extends readonly Route[]> {
	private radix_router: RadixRouter<Route>;
	readonly routes: T;
	readonly current: Writable<RouteState>;

	constructor(routes: T) {
		this.routes = routes;
		this.radix_router = createRouter<Route>();
		this.current = writable<RouteState>({
			route: null,
			params: {},
			path: "",
		});

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
		const originalRoute = this.routes.find(r => r.path === match.path && r.component === match.component);

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

	navigate(path: string, replace = false) {
		if (replace) {
			window.history.replaceState({}, "", path);
		} else {
			window.history.pushState({}, "", path);
		}
		this.updateRoute();
	}

	async updateRoute() {
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

		this.current.set({
			route: matched_route,
			params: route_params,
			path: pathname,
		});
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
}

export function create_router<const T extends readonly Route[]>(routes: T): RouterInstance<T> {
	return new RouterInstance(routes);
}
