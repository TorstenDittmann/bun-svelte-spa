import About from "@routes/about.svelte";
import Index from "@routes/index.svelte";
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
]);

export const {
	routes,
	goto,
	resolve,
	current,
	beforeNavigate,
	afterNavigate,
	queryParams,
	setQueryParams,
	isActive,
} = router;
