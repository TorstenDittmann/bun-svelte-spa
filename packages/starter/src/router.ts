import { create_goto, create_routes } from "bun-svelte-spa/runtime";
import About from "./routes/about.svelte";
import Index from "./routes/index.svelte";

export const routes = create_routes([
	{
		path: "/",
		component: Index,
	},
	{
		path: "/about",
		component: About,
	},
]);

export const goto = create_goto(routes);
