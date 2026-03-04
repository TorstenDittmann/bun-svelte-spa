import { create_router } from "bun-svelte-spa/runtime";

export const router = create_router([
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
		static: false,
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
