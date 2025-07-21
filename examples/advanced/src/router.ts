import AlbumDetail from "@routes/album-detail.svelte";
import Albums from "@routes/albums.svelte";
import Dashboard from "@routes/dashboard.svelte";
import Home from "@routes/home.svelte";
import PostDetail from "@routes/post-detail.svelte";
import Posts from "@routes/posts.svelte";
import Search from "@routes/search.svelte";
import UserAlbums from "@routes/user-albums.svelte";
import UserDetail from "@routes/user-detail.svelte";
import UserPosts from "@routes/user-posts.svelte";
import Users from "@routes/users.svelte";
import { create_router } from "bun-svelte-spa/runtime";

export const router = create_router([
	{
		path: "/",
		component: Home,
	},
	{
		path: "/dashboard",
		component: Dashboard,
	},
	{
		path: "/users",
		component: Users,
	},
	{
		path: "/users/:id",
		component: UserDetail,
	},
	{
		path: "/users/:id/posts",
		component: UserPosts,
	},
	{
		path: "/users/:id/albums",
		component: UserAlbums,
	},
	{
		path: "/posts",
		component: Posts,
	},
	{
		path: "/posts/:id",
		component: PostDetail,
	},
	{
		path: "/albums",
		component: Albums,
	},
	{
		path: "/albums/:id",
		component: AlbumDetail,
	},
	{
		path: "/search",
		component: Search,
	},
]);

export const { routes, goto, resolve, current } = router;
