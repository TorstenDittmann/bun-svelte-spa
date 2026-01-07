import { create_router } from "bun-svelte-spa/runtime";

export const router = create_router([
	{
		path: "/",
		component: () => import("@routes/home.svelte"),
	},
	{
		path: "/dashboard",
		component: () => import("@routes/dashboard.svelte"),
	},
	{
		path: "/users",
		component: () => import("@routes/users.svelte"),
	},
	{
		path: "/users/:id",
		component: () => import("@routes/user-detail.svelte"),
	},
	{
		path: "/users/:id/posts",
		component: () => import("@routes/user-posts.svelte"),
	},
	{
		path: "/users/:id/albums",
		component: () => import("@routes/user-albums.svelte"),
	},
	{
		path: "/posts",
		component: () => import("@routes/posts.svelte"),
	},
	{
		path: "/posts/:id",
		component: () => import("@routes/post-detail.svelte"),
	},
	{
		path: "/albums",
		component: () => import("@routes/albums.svelte"),
	},
	{
		path: "/albums/:id",
		component: () => import("@routes/album-detail.svelte"),
	},
	{
		path: "/search",
		component: () => import("@routes/search.svelte"),
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
