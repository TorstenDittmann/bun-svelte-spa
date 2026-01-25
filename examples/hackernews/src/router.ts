import { create_router } from "bun-svelte-spa/runtime";

export const router = create_router([
	{
		path: "/",
		component: () => import("@routes/stories.svelte"),
		props: { type: "top" },
	},
	{
		path: "/new",
		component: () => import("@routes/stories.svelte"),
		props: { type: "new" },
	},
	{
		path: "/best",
		component: () => import("@routes/stories.svelte"),
		props: { type: "best" },
	},
	{
		path: "/ask",
		component: () => import("@routes/stories.svelte"),
		props: { type: "ask" },
	},
	{
		path: "/show",
		component: () => import("@routes/stories.svelte"),
		props: { type: "show" },
	},
	{
		path: "/jobs",
		component: () => import("@routes/stories.svelte"),
		props: { type: "job" },
	},
	{
		path: "/item/:id",
		component: () => import("@routes/item.svelte"),
	},
	{
		path: "/user/:id",
		component: () => import("@routes/user.svelte"),
	},
]);

export const { goto, resolve, current, queryParams, setQueryParams, isActive } = router;
