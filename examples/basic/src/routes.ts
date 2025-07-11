import type { Route } from "bun-svelte-spa/runtime";
import About from "./routes/about.svelte";
import Index from "./routes/index.svelte";

export default [
	{
		path: "/",
		component: Index,
	},
	{
		path: "/about",
		component: About,
	},
] satisfies Route[];
