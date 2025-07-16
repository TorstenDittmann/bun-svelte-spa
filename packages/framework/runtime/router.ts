export type Route = {
	path: string;
	component: import("svelte").Component;
	props?: Record<string, unknown>;
};

type ExtractPaths<T extends readonly Route[]> = T[number]["path"];

type ExtractParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
	? { [K in Param]: string } & ExtractParams<`/${Rest}`>
	: T extends `${infer _Start}:${infer Param}` ? { [K in Param]: string }
	: {};

type HasParams<T extends string> = T extends `${string}:${string}` ? true : false;

export function create_routes<const T extends readonly Route[]>(routes: T) {
	return routes;
}

export function create_goto<T extends readonly Route[]>(routes: T) {
	return <P extends ExtractPaths<T>>(
		path: P,
		...args: HasParams<P> extends true ? ExtractParams<P> extends Record<string, never> ? [params?: never]
			: [params: ExtractParams<P>]
			: [params?: never]
	) => {
		const params = args[0];
		const finalPath = params ? interpolatePath(path, params) : path;
		window.history.pushState({}, "", finalPath);
		window.dispatchEvent(new Event("goto"));
	};
}

export function create_resolver<T extends readonly Route[]>(routes: T) {
	return <P extends ExtractPaths<T>>(
		path: P,
		...args: HasParams<P> extends true ? ExtractParams<P> extends Record<string, never> ? [params?: never]
			: [params: ExtractParams<P>]
			: [params?: never]
	) => {
		const params = args[0];
		return params ? interpolatePath(path, params) : path;
	};
}

function interpolatePath(path: string, params: Record<string, string>): string {
	return path.replace(/:([^/]+)/g, (_, paramName) => {
		const value = params[paramName];
		if (value === undefined) {
			throw new Error(`Missing parameter: ${paramName}`);
		}
		return value;
	});
}
