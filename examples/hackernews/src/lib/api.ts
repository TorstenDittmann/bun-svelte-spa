const BASE_URL = "https://hacker-news.firebaseio.com/v0";

export interface HNItem {
	id: number;
	type: "story" | "comment" | "job" | "poll" | "pollopt";
	by?: string;
	time?: number;
	text?: string;
	dead?: boolean;
	deleted?: boolean;
	parent?: number;
	poll?: number;
	kids?: number[];
	url?: string;
	score?: number;
	title?: string;
	parts?: number[];
	descendants?: number;
}

export interface HNUser {
	id: string;
	created: number;
	karma: number;
	about?: string;
	submitted?: number[];
}

export type StoryType = "top" | "new" | "best" | "ask" | "show" | "job";

async function fetchJson<T>(url: string): Promise<T> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error: ${response.status}`);
	}
	return response.json();
}

export const api = {
	async getStoryIds(type: StoryType): Promise<number[]> {
		return fetchJson(`${BASE_URL}/${type}stories.json`);
	},

	async getItem(id: number): Promise<HNItem | null> {
		return fetchJson(`${BASE_URL}/item/${id}.json`);
	},

	async getUser(id: string): Promise<HNUser | null> {
		return fetchJson(`${BASE_URL}/user/${id}.json`);
	},

	async getStories(
		type: StoryType,
		page: number = 1,
		perPage: number = 30,
	): Promise<{ items: HNItem[]; total: number }> {
		const ids = await this.getStoryIds(type);
		const start = (page - 1) * perPage;
		const end = start + perPage;
		const pageIds = ids.slice(start, end);

		const items = await Promise.all(
			pageIds.map((id) => this.getItem(id)),
		);

		return {
			items: items.filter((item): item is HNItem => item !== null),
			total: ids.length,
		};
	},

	async getItemWithComments(
		id: number,
		depth: number = 2,
	): Promise<HNItem & { children?: HNItem[] }> {
		const item = await this.getItem(id);
		if (!item) throw new Error("Item not found");

		if (depth > 0 && item.kids?.length) {
			const children = await Promise.all(
				item.kids.slice(0, 20).map(async (kidId) => {
					try {
						return await this.getItemWithComments(kidId, depth - 1);
					} catch {
						return null;
					}
				}),
			);
			return {
				...item,
				children: children.filter((c): c is HNItem => c !== null && !c.deleted),
			};
		}

		return item;
	},

	async getUserSubmissions(
		userId: string,
		limit: number = 30,
	): Promise<HNItem[]> {
		const user = await this.getUser(userId);
		if (!user?.submitted) return [];

		const ids = user.submitted.slice(0, limit);
		const items = await Promise.all(ids.map((id) => this.getItem(id)));

		return items.filter(
			(item): item is HNItem => item !== null && !item.deleted && item.type === "story",
		);
	},
};

export function timeAgo(timestamp?: number): string {
	if (!timestamp) return "";
	const seconds = Math.floor(Date.now() / 1000 - timestamp);

	if (seconds < 60) return `${seconds}s ago`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
	if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
	return `${Math.floor(seconds / 2592000)}mo ago`;
}

export function getDomain(url?: string): string {
	if (!url) return "";
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return "";
	}
}
