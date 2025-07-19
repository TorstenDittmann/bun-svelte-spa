import { create_goto, create_resolver, create_routes } from "bun-svelte-spa/runtime";
import About from "./routes/about.svelte";
import Index from "./routes/index.svelte";
import User from "./routes/user.svelte";

export const routes = create_routes([
	{
		path: "/",
		component: Index,
	},
	{
		path: "/about",
		component: About,
	},
	{
		path: "/user/:id",
		component: User,
	},
]);

export const goto = create_goto(routes);
export const resolve = create_resolver(routes);
