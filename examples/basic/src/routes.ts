import type { Route } from "bun-svelte-spa/runtime";

export const routes = [
	{
		path: "/",
		component: () => import("./routes/index.svelte"),
		static: true,
	},
	{
		path: "/about",
		component: () => import("./routes/about.svelte"),
		static: true,
	},
	{
		path: "/user/:id",
		component: () => import("./routes/user.svelte"),
	},
] as const satisfies readonly Route[];
