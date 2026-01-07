export { default as Router } from "./router.svelte";
export type {
	AfterNavigateCallback,
	BeforeNavigateCallback,
	Navigation,
	NavigationType,
	QueryParams,
	Route,
	RouteState,
} from "./router.ts";
export { create_router, RouterInstance } from "./router.ts";
