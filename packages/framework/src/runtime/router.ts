export type Route = {
	path: string;
	component: import("svelte").Component;
	props?: Record<string, unknown>;
};
