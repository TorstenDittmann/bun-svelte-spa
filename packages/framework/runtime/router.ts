import { writable } from "svelte/store";

export type Route = {
	path: string;
	component: import("svelte").Component;
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

// Single route store
export const route = writable<RouteState>({
	route: null,
	params: {},
	path: "",
});

export function create_routes<const T extends readonly Route[]>(routes: T) {
	return routes;
}

export function create_goto<T extends readonly Route[]>(_routes: T) {
	return <P extends ExtractPaths<T>>(
		path: P,
		...args: HasParams<P> extends true ? ExtractParams<P> extends Record<string, never> ? [params?: never]
			: [params: ExtractParams<P>]
			: [params?: never]
	) => {
		const params = args[0];
		const final_path = params ? interpolate_path(path, params) : path;
		window.history.pushState({}, "", final_path);
		window.dispatchEvent(new Event("goto"));
	};
}

export function create_resolver<T extends readonly Route[]>(_routes: T) {
	return <P extends ExtractPaths<T>>(
		path: P,
		...args: HasParams<P> extends true ? ExtractParams<P> extends Record<string, never> ? [params?: never]
			: [params: ExtractParams<P>]
			: [params?: never]
	) => {
		const params = args[0];
		return params ? interpolate_path(path, params) : path;
	};
}

function interpolate_path(path: string, params: Record<string, string>): string {
	return path.replace(/:([^/]+)/g, (_, param_name) => {
		const value = params[param_name];
		if (value === undefined) {
			throw new Error(`Missing parameter: ${param_name}`);
		}
		return value;
	});
}
