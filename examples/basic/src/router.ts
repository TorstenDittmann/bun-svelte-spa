import { create_router } from "bun-svelte-spa/runtime";
import { routes } from "./routes";

export const router = create_router(routes);

export const {
	goto,
	resolve,
	current,
	beforeNavigate,
	afterNavigate,
	queryParams,
	setQueryParams,
	isActive,
} = router;
