import { create_routes } from "bun-svelte-spa/runtime";
import Index from "./routes/index.svelte";

export const routes = create_routes([
	{
		path: "/",
		component: Index,
	},
]);
