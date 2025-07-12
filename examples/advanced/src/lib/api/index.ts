// API utilities for data fetching

export interface User {
	id: number;
	name: string;
	email: string;
	username: string;
	phone: string;
	website: string;
	company: {
		name: string;
		catchPhrase: string;
		bs: string;
	};
	address: {
		street: string;
		suite: string;
		city: string;
		zipcode: string;
		geo: {
			lat: string;
			lng: string;
		};
	};
}

export interface Post {
	id: number;
	userId: number;
	title: string;
	body: string;
}

export interface Comment {
	id: number;
	postId: number;
	name: string;
	email: string;
	body: string;
}

export interface Album {
	id: number;
	userId: number;
	title: string;
}

export interface Photo {
	id: number;
	albumId: number;
	title: string;
	url: string;
	thumbnailUrl: string;
}

export interface ApiError {
	message: string;
	status?: number;
}

class ApiClient {
	private baseUrl = "https://jsonplaceholder.typicode.com";

	private async request<T>(endpoint: string): Promise<T> {
		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`API request failed: ${error.message}`);
			}
			throw new Error("Unknown API error occurred");
		}
	}

	// Users
	async getUsers(): Promise<User[]> {
		return this.request<User[]>("/users");
	}

	async getUser(id: number): Promise<User> {
		return this.request<User>(`/users/${id}`);
	}

	async getUserPosts(userId: number): Promise<Post[]> {
		return this.request<Post[]>(`/users/${userId}/posts`);
	}

	async getUserAlbums(userId: number): Promise<Album[]> {
		return this.request<Album[]>(`/users/${userId}/albums`);
	}

	// Posts
	async getPosts(): Promise<Post[]> {
		return this.request<Post[]>("/posts");
	}

	async getPost(id: number): Promise<Post> {
		return this.request<Post>(`/posts/${id}`);
	}

	async getPostComments(postId: number): Promise<Comment[]> {
		return this.request<Comment[]>(`/posts/${postId}/comments`);
	}

	// Albums
	async getAlbums(): Promise<Album[]> {
		return this.request<Album[]>("/albums");
	}

	async getAlbum(id: number): Promise<Album> {
		return this.request<Album>(`/albums/${id}`);
	}

	async getAlbumPhotos(albumId: number): Promise<Photo[]> {
		return this.request<Photo[]>(`/albums/${albumId}/photos`);
	}
}

// Create a singleton instance
export const api = new ApiClient();

// Helper function to simulate loading delay for demo purposes
export function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Generic async data loader with error handling
export async function loadData<T>(
	loader: () => Promise<T>,
	options: { simulateDelay?: number } = {},
): Promise<{ data: T | null; error: ApiError | null; loading: boolean }> {
	try {
		if (options.simulateDelay) {
			await delay(options.simulateDelay);
		}

		const data = await loader();
		return { data, error: null, loading: false };
	} catch (error) {
		const apiError: ApiError = {
			message: error instanceof Error ? error.message : "Unknown error occurred",
			status: undefined,
		};
		return { data: null, error: apiError, loading: false };
	}
}
