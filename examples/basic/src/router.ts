import About from "@routes/about.svelte";
import Index from "@routes/index.svelte";
import User from "@routes/user.svelte";
import { create_router } from "bun-svelte-spa/runtime";

export const router = create_router([
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

export const { routes, goto, resolve, current } = router;
