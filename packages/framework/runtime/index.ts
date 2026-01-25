export { default as Router } from "./router.svelte";
export type {
	AfterNavigateCallback,
	BeforeNavigateCallback,
	Navigation,
	NavigationType,
	QueryParams,
	Route,
	RouteState,
} from "./router.svelte.ts";
export { create_router, RouterInstance } from "./router.svelte.ts";

export type { MutationOptions, QueryKey, QueryOptions, QueryState, QueryStatus } from "./query.svelte.ts";
export { createMutation, createQuery, invalidateQueries, Mutation, Query, queryCache } from "./query.svelte.ts";
