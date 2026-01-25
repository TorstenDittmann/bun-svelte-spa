import { createQuery } from "bun-svelte-spa/runtime";
import { api, type HNItem, type HNUser, type StoryType } from "./api";

export function storiesQuery(type: StoryType, page: number) {
	return createQuery({
		key: ["stories", type, page],
		fn: () => api.getStories(type, page, 30),
		staleTime: 60_000,
	});
}

export function itemQuery(id: number) {
	return createQuery({
		key: ["item", id],
		fn: () => api.getItemWithComments(id, 3),
		staleTime: 30_000,
		enabled: id > 0,
	});
}

export function userQuery(id: string) {
	return createQuery<HNUser | null, string>({
		key: ["user", id],
		fn: () => api.getUser(id),
		staleTime: 60_000,
		enabled: id.length > 0,
	});
}

export function userSubmissionsQuery(userId: string) {
	return createQuery<HNItem[], string>({
		key: ["user-submissions", userId],
		fn: () => api.getUserSubmissions(userId, 30),
		staleTime: 60_000,
		enabled: userId.length > 0,
	});
}
