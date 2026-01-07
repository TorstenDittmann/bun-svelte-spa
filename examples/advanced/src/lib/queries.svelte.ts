import { createQuery, invalidateQueries } from "bun-svelte-spa/runtime";
import { type Album, api, type Comment, type Photo, type Post, type User } from "./api";

// Users queries
export function usersQuery() {
	return createQuery<User[]>({
		key: ["users"],
		fn: () => api.getUsers(),
		staleTime: 60000, // 1 minute
	});
}

export function userQuery(id: number) {
	return createQuery<User>({
		key: ["users", id],
		fn: () => api.getUser(id),
		staleTime: 60000,
		enabled: id > 0,
	});
}

export function userPostsQuery(userId: number) {
	return createQuery<Post[]>({
		key: ["users", userId, "posts"],
		fn: () => api.getUserPosts(userId),
		staleTime: 60000,
		enabled: userId > 0,
	});
}

export function userAlbumsQuery(userId: number) {
	return createQuery<Album[]>({
		key: ["users", userId, "albums"],
		fn: () => api.getUserAlbums(userId),
		staleTime: 60000,
		enabled: userId > 0,
	});
}

// Posts queries
export function postsQuery() {
	return createQuery<Post[]>({
		key: ["posts"],
		fn: () => api.getPosts(),
		staleTime: 60000,
	});
}

export function postQuery(id: number) {
	return createQuery<Post>({
		key: ["posts", id],
		fn: () => api.getPost(id),
		staleTime: 60000,
		enabled: id > 0,
	});
}

export function postCommentsQuery(postId: number) {
	return createQuery<Comment[]>({
		key: ["posts", postId, "comments"],
		fn: () => api.getPostComments(postId),
		staleTime: 60000,
		enabled: postId > 0,
	});
}

// Albums queries
export function albumsQuery() {
	return createQuery<Album[]>({
		key: ["albums"],
		fn: () => api.getAlbums(),
		staleTime: 60000,
	});
}

export function albumQuery(id: number) {
	return createQuery<Album>({
		key: ["albums", id],
		fn: () => api.getAlbum(id),
		staleTime: 60000,
		enabled: id > 0,
	});
}

export function albumPhotosQuery(albumId: number) {
	return createQuery<Photo[]>({
		key: ["albums", albumId, "photos"],
		fn: () => api.getAlbumPhotos(albumId),
		staleTime: 60000,
		enabled: albumId > 0,
	});
}

// Invalidation helpers
export function invalidateUsers() {
	invalidateQueries(["users"]);
}

export function invalidatePosts() {
	invalidateQueries(["posts"]);
}

export function invalidateAlbums() {
	invalidateQueries(["albums"]);
}
