import { create_router } from "bun-svelte-spa/runtime";

export const router = create_router([
	{
		path: "/",
		component: () => import("./routes/index.svelte"),
	},
	{
		path: "/about",
		component: () => import("./routes/about.svelte"),
	},
	{
		path: "/user/:id",
		component: () => import("./routes/user.svelte"),
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
