import type { Album, ApiError, Photo, Post, User } from "@lib/api";
import { derived, writable } from "svelte/store";

// Theme store
export const theme = writable<"light" | "dark">("light");

// Toggle theme function
export function toggleTheme() {
	theme.update((current) => (current === "light" ? "dark" : "light"));
}

// Generic loading state interface
interface LoadingState<T> {
	data: T | null;
	loading: boolean;
	error: ApiError | null;
}

// Create a generic store factory for async data
function createAsyncStore<T>(initialData: T | null = null) {
	const { subscribe, set, update } = writable<LoadingState<T>>({
		data: initialData,
		loading: false,
		error: null,
	});

	return {
		subscribe,
		setLoading: () => update((state) => ({ ...state, loading: true, error: null })),
		setData: (data: T) => set({ data, loading: false, error: null }),
		setError: (error: ApiError) => set({ data: null, loading: false, error }),
		reset: () => set({ data: initialData, loading: false, error: null }),
	};
}

// User-related stores
export const users = createAsyncStore<User[]>([]);
export const currentUser = createAsyncStore<User>();
export const userPosts = createAsyncStore<Post[]>([]);
export const userAlbums = createAsyncStore<Album[]>([]);

// Post-related stores
export const posts = createAsyncStore<Post[]>([]);
export const currentPost = createAsyncStore<Post>();
export const postComments = createAsyncStore<Comment[]>([]);

// Album-related stores
export const albums = createAsyncStore<Album[]>([]);
export const currentAlbum = createAsyncStore<Album>();
export const albumPhotos = createAsyncStore<Photo[]>([]);

// Search functionality
export const searchQuery = writable<string>("");
export const searchResults = writable<{
	users: User[];
	posts: Post[];
	albums: Album[];
}>({
	users: [],
	posts: [],
	albums: [],
});

// UI state
export const sidebarOpen = writable<boolean>(false);

// Derived stores
export const isLoading = derived(
	[users, currentUser, posts, currentPost, albums, currentAlbum],
	([usersState, userState, postsState, postState, albumsState, albumState]) =>
		usersState.loading
		|| userState.loading
		|| postsState.loading
		|| postState.loading
		|| albumsState.loading
		|| albumState.loading,
);

export const hasError = derived(
	[users, currentUser, posts, currentPost, albums, currentAlbum],
	([usersState, userState, postsState, postState, albumsState, albumState]) =>
		usersState.error
		|| userState.error
		|| postsState.error
		|| postState.error
		|| albumsState.error
		|| albumState.error,
);

// Filtered posts based on search
export const filteredPosts = derived([posts, searchQuery], ([postsState, query]) => {
	if (!postsState.data || !query.trim()) {
		return postsState.data || [];
	}

	const lowercaseQuery = query.toLowerCase();
	return postsState.data.filter(
		(post) =>
			post.title.toLowerCase().includes(lowercaseQuery)
			|| post.body.toLowerCase().includes(lowercaseQuery),
	);
});

// Filtered users based on search
export const filteredUsers = derived([users, searchQuery], ([usersState, query]) => {
	if (!usersState.data || !query.trim()) {
		return usersState.data || [];
	}

	const lowercaseQuery = query.toLowerCase();
	return usersState.data.filter(
		(user) =>
			user.name.toLowerCase().includes(lowercaseQuery)
			|| user.email.toLowerCase().includes(lowercaseQuery)
			|| user.username.toLowerCase().includes(lowercaseQuery),
	);
});

// Statistics derived store
export const stats = derived([users, posts, albums], ([usersState, postsState, albumsState]) => ({
	totalUsers: usersState.data?.length || 0,
	totalPosts: postsState.data?.length || 0,
	totalAlbums: albumsState.data?.length || 0,
	totalPhotos: 0,
}));

// Local storage persistence for theme
if (typeof window !== "undefined") {
	// Load theme from localStorage
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme === "dark" || savedTheme === "light") {
		theme.set(savedTheme);
	}

	// Save theme to localStorage when it changes
	theme.subscribe((value) => {
		localStorage.setItem("theme", value);

		// Apply theme class to document
		if (value === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	});
}

// Search debouncing
let searchTimeout: ReturnType<typeof setTimeout>;

export function debouncedSearch(query: string, delay: number = 300) {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		searchQuery.set(query);
	}, delay);
}
