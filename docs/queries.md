# Queries

Learn how to manage data fetching, caching, and mutations in your Svelte Bun application.

## Overview

The framework provides a powerful query management system with:

- Automatic caching and invalidation
- Reactive state with Svelte 5 runes
- Background refetching
- Loading and error states
- Mutations with callbacks

## Basic Queries

### Fetching API Data

Create a query to fetch users from an API:

```svelte
<script lang="ts">
	import { createQuery } from "bun-svelte-spa/runtime";

	interface User {
		id: number;
		name: string;
		email: string;
		avatar: string;
	}

	const usersQuery = createQuery<User[]>({
		key: ["users"],
		fn: async () => {
			const response = await fetch(
				"https://jsonplaceholder.typicode.com/users",
			);
			if (!response.ok) throw new Error("Failed to fetch users");
			return response.json();
		},
		staleTime: 60000, // Cache for 1 minute
	});
</script>

{#if usersQuery.isLoading}
	<div class="loading">
		<p>Loading users...</p>
	</div>
{:else if usersQuery.isError}
	<div class="error">
		<p>Error: {usersQuery.error.message}</p>
		<button onclick={() => usersQuery.refetch()}>Retry</button>
	</div>
{:else}
	<ul class="user-list">
		{#each usersQuery.data as user}
			<li>
				<img src={user.avatar} alt={user.name} />
				<div>
					<h3>{user.name}</h3>
					<p>{user.email}</p>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.loading, .error {
		text-align: center;
		padding: 2rem;
	}

	.error {
		color: var(--color-error);
	}

	.user-list {
		display: grid;
		gap: 1rem;
		list-style: none;
		padding: 0;
	}

	.user-list li {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-bg-secondary);
		border-radius: 0.5rem;
	}

	.user-list img {
		width: 48px;
		height: 48px;
		border-radius: 50%;
	}
</style>
```

### Query State Access

Access all query states reactively:

```svelte
<script>
	const query = createQuery({
		key: ["data"],
		fn: fetchData,
	});
</script>

<div class="query-debug">
	<h3>Query State</h3>
	<p>Status: <code>{query.status}</code></p>
	<p>Loading: <code>{query.isLoading}</code></p>
	<p>Fetching: <code>{query.isFetching}</code></p>
	<p>Success: <code>{query.isSuccess}</code></p>
	<p>Error: <code>{query.isError}</code></p>
	{#if query.data}
		<p>Data: <code>{JSON.stringify(query.data)}</code></p>
	{/if}
	{#if query.error}
		<p>Error: <code>{query.error.message}</code></p>
	{/if}
</div>
```

## Query Options

### Cache Key Strategies

Organize cache keys for better invalidation:

```typescript
// Single entity query
const userQuery = createQuery({
	key: ["users", userId],
	fn: () => fetchUser(userId),
});

// List query
const usersListQuery = createQuery({
	key: ["users"],
	fn: () => fetchUsers(),
});

// Search results query
const searchQuery = createQuery({
	key: ["search", searchTerm],
	fn: () => searchUsers(searchTerm),
});

// Complex query with multiple params
const filteredUsersQuery = createQuery({
	key: ["users", "filtered", { role, department, status }],
	fn: () => fetchFilteredUsers({ role, department, status }),
});
```

### Stale Time Configuration

Balance freshness and performance:

```typescript
// Real-time data (refetch often)
const stockPricesQuery = createQuery({
	key: ["stock-prices"],
	fn: fetchStockPrices,
	staleTime: 5000, // 5 seconds
});

// User profile (changes rarely)
const userProfileQuery = createQuery({
	key: ["user-profile", userId],
	fn: fetchUserProfile,
	staleTime: 3600000, // 1 hour
});

// Product catalog (changes periodically)
const productsQuery = createQuery({
	key: ["products"],
	fn: fetchProducts,
	staleTime: 600000, // 10 minutes
});
```

### Conditional Query Execution

Enable queries based on conditions:

```svelte
<script>
  let isAuthenticated = false;
  let userId: number | null = null;

  const userQuery = createQuery({
    key: ["user", userId],
    fn: () => fetchUser(userId!),
    enabled: isAuthenticated && userId !== null,
  });

  const adminPanelQuery = createQuery({
    key: ["admin-panel"],
    fn: fetchAdminData,
    enabled: () => userRole === "admin",
  });
</script>

{#if userQuery.isLoading}
  <p>Loading user data...</p>
 {:else if userQuery.isError}
  <p>Error loading user</p>
 {:else}
  <h1>Welcome, {userQuery.data.name}</h1>
 {/if}
```

### Background Refetching

Keep data fresh automatically:

```typescript
// Refetch on window focus
const messagesQuery = createQuery({
	key: ["messages"],
	fn: fetchMessages,
	refetchOnWindowFocus: true, // default
	staleTime: 30000, // 30 seconds
});

// Refetch at intervals
const notificationsQuery = createQuery({
	key: ["notifications"],
	fn: fetchNotifications,
	refetchInterval: 60000, // every minute
});

// Polling for real-time updates
const gameStatusQuery = createQuery({
	key: ["game-status", gameId],
	fn: () => fetchGameStatus(gameId),
	refetchInterval: 1000, // every second
});
```

### Query Callbacks

Handle lifecycle events:

```typescript
const query = createQuery({
	key: ["users"],
	fn: fetchUsers,
	onSuccess: (data) => {
		console.log("Users loaded:", data.length);
		analytics.track("users_loaded", { count: data.length });
	},
	onError: (error) => {
		console.error("Failed to load users:", error);
		toast.error("Could not load users");
	},
});
```

## Query Parameters

### Reactive Parameters

Queries automatically refetch when parameters change:

```svelte
<script>
	let page = 1;
	let limit = 20;
	let sortBy = "name";
	let sortOrder = "asc";

	const postsQuery = createQuery({
		key: ["posts", page, limit, sortBy, sortOrder],
		fn: () => fetchPosts({ page, limit, sortBy, sortOrder }),
	});
</script>

<div class="controls">
	<select bind:value={sortBy}>
		<option value="name">Sort by Name</option>
		<option value="date">Sort by Date</option>
		<option value="popularity">Sort by Popularity</option>
	</select>

	<select bind:value={sortOrder}>
		<option value="asc">Ascending</option>
		<option value="desc">Descending</option>
	</select>
</div>

<div class="pagination">
	<button disabled={page === 1} onclick={() => page--}>
		Previous
	</button>
	<span>Page {page}</span>
	<button onclick={() => page++}>Next</button>
</div>
```

### Dynamic Key Functions

Use functions to compute keys dynamically:

```svelte
<script>
	let filters = {
		category: "",
		minPrice: 0,
		maxPrice: 1000,
		search: "",
	};

	const productsQuery = createQuery({
		key: (params) => ["products", params],
		fn: (params) => searchProducts(params),
		params: () => filters,
		enabled: () =>
			Object.values(filters).some(v =>
				v !== "" && v !== 0 && v !== 1000
			),
	});

	function resetFilters() {
		filters = {
			category: "",
			minPrice: 0,
			maxPrice: 1000,
			search: "",
		};
	}
</script>

<div class="filters">
	<input
		type="text"
		bind:value={filters.search}
		placeholder="Search products..."
	/>

	<select bind:value={filters.category}>
		<option value="">All Categories</option>
		<option value="electronics">Electronics</option>
		<option value="clothing">Clothing</option>
	</select>

	<input
		type="number"
		bind:value={filters.minPrice}
		placeholder="Min Price"
	/>

	<input
		type="number"
		bind:value={filters.maxPrice}
		placeholder="Max Price"
	/>

	<button onclick={resetFilters}>Reset</button>
</div>
```

## Cache Management

### Query Invalidation

Invalidate cached queries after mutations:

```typescript
import { invalidateQueries } from "bun-svelte-spa/runtime";

// Invalidate specific query
invalidateQueries(["users"]);

// Invalidate all user-related queries
invalidateQueries(["users", userId]);

// Invalidate matching queries (partial match)
invalidateQueries(["users"]); // Matches ["users"], ["users", 1], ["users", "list"], etc.

// Invalidate all posts and comments
invalidateQueries(["posts"]);
invalidateQueries(["comments"]);
```

### Mutation with Cache Invalidation

```svelte
<script>
	import {
		createMutation,
		invalidateQueries,
	} from "bun-svelte-spa/runtime";

	const createUserMutation = createMutation({
		fn: async (userData) => {
			const response = await fetch("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(userData),
			});
			return response.json();
		},
		onSuccess: ({ data }) => {
			// Invalidate users list
			invalidateQueries(["users"]);

			// Show success message
			toast.success(`User ${data.name} created successfully!`);

			// Navigate to new user
			goto(`/users/${data.id}`);
		},
		onError: ({ error }) => {
			toast.error(`Failed to create user: ${error.message}`);
		},
	});
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		createUserMutation.mutate(Object.fromEntries(formData));
	}}
>
	<input type="text" name="name" required placeholder="Name" />
	<input type="email" name="email" required placeholder="Email" />
	<button type="submit" disabled={createUserMutation.isLoading}>
		{
			createUserMutation.isLoading
				? "Creating..."
				: "Create User"
		}
	</button>
</form>
```

## Mutations

### CRUD Operations

```typescript
// Create
const createMutation = createMutation({
	fn: async (data) => {
		const response = await fetch("/api/items", {
			method: "POST",
			body: JSON.stringify(data),
		});
		return response.json();
	},
	onSuccess: () => invalidateQueries(["items"]),
});

// Update
const updateMutation = createMutation({
	fn: async ({ id, data }) => {
		const response = await fetch(`/api/items/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
		return response.json();
	},
	onSuccess: ({ variables }) => {
		invalidateQueries(["items"]);
		invalidateQueries(["items", variables.id]);
	},
});

// Delete
const deleteMutation = createMutation({
	fn: async (id) => {
		await fetch(`/api/items/${id}`, { method: "DELETE" });
		return id;
	},
	onSuccess: () => {
		invalidateQueries(["items"]);
		toast.success("Item deleted");
	},
});
```

### Form Handling

```svelte
<script>
  import { createMutation } from "bun-svelte-spa/runtime";

  let formData = {
    title: "",
    content: "",
    tags: [] as string[],
    published: false,
  };

  const submitMutation = createMutation({
    fn: async (data) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Post created successfully!");
      goto(`/posts/${data.id}`);
    },
  });
</script>

<form onsubmit={(e) => {
  e.preventDefault();
  submitMutation.mutate(formData);
}}>
  <div class="form-group">
    <label for="title">Title</label>
    <input
      id="title"
      type="text"
      bind:value={formData.title}
      required
    />
  </div>

  <div class="form-group">
    <label for="content">Content</label>
    <textarea
      id="content"
      bind:value={formData.content}
      required
    ></textarea>
  </div>

  <div class="form-group">
    <label>
      <input
        type="checkbox"
        bind:checked={formData.published}
      />
      Published
    </label>
  </div>

  <button type="submit" disabled={submitMutation.isLoading}>
    {submitMutation.isLoading ? "Submitting..." : "Submit"}
  </button>
</form>

<style>
  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  input, textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
  }

  textarea {
    min-height: 200px;
  }
</style>
```

## Query Organization

### Query Modules

Organize queries in dedicated modules:

```typescript
// src/lib/queries/users.ts
import { createQuery, invalidateQueries } from "bun-svelte-spa/runtime";

export function usersQuery() {
	return createQuery({
		key: ["users"],
		fn: () => fetch("/api/users").then(r => r.json()),
		staleTime: 60000,
	});
}

export function userQuery(id: number) {
	return createQuery({
		key: ["users", id],
		fn: () => fetch(`/api/users/${id}`).then(r => r.json()),
		staleTime: 60000,
	});
}

export function userPostsQuery(userId: number) {
	return createQuery({
		key: ["users", userId, "posts"],
		fn: () => fetch(`/api/users/${userId}/posts`).then(r => r.json()),
		staleTime: 60000,
	});
}

export function invalidateUser(userId?: number) {
	if (userId) {
		invalidateQueries(["users", userId]);
	}
	invalidateQueries(["users"]);
}
```

### Reusable Query Hooks

Create hooks for common query patterns:

```typescript
// src/lib/hooks/usePaginatedQuery.ts
export function usePaginatedQuery<T>(
	keyPrefix: string[],
	fetchFn: (page: number, limit: number) => Promise<T[]>,
	initialLimit = 20,
) {
	let page = $state(1);
	let limit = $state(initialLimit);

	const query = createQuery({
		key: [...keyPrefix, page, limit],
		fn: () => fetchFn(page, limit),
	});

	return {
		data: $derived(query.data),
		loading: $derived(query.isLoading),
		error: $derived(query.error),
		page,
		limit,
		nextPage: () => page++,
		prevPage: () => {
			if (page > 1) page--;
		},
		setLimit: (l: number) => {
			limit = l;
			page = 1;
		},
		refetch: () => query.refetch(),
	};
}
```

## Advanced Patterns

### Dependent Queries

Run queries in sequence:

```svelte
<script>
	const userQuery = createQuery({
		key: ["user", userId],
		fn: () => fetchUser(userId),
	});

	const userPostsQuery = createQuery({
		key: ["user-posts", userId],
		fn: () => fetchUserPosts(userId),
		enabled: () => userQuery.isSuccess,
	});

	const userCommentsQuery = createQuery({
		key: ["user-comments", userId],
		fn: () => fetchUserComments(userId),
		enabled: () => userQuery.isSuccess,
	});
</script>

{#if userQuery.isSuccess}
	<h1>{userQuery.data.name}'s Content</h1>

	<section>
		<h2>Posts</h2>
		{#if userPostsQuery.isLoading}
			<p>Loading posts...</p>
		{:else if userPostsQuery.isSuccess}
			<ul>
				{#each userPostsQuery.data as post}
					<li>{post.title}</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section>
		<h2>Comments</h2>
		{#if userCommentsQuery.isLoading}
			<p>Loading comments...</p>
		{:else if userCommentsQuery.isSuccess}
			<ul>
				{#each userCommentsQuery.data as comment}
					<li>{comment.text}</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
```

### Infinite Scroll

```svelte
<script>
  let pages = $state([1]);

  const query = createQuery({
    key: ["posts", pages],
    fn: async () => {
      const results = await Promise.all(
        pages.map(p => fetchPosts(p))
      );
      return results.flat();
    },
  });

  let observer: IntersectionObserver;

  function loadMore() {
    pages = [...pages, pages.length + 1];
  }

  onMount(() => {
    const sentinel = document.querySelector("#sentinel");
    if (!sentinel) return;

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });

    observer.observe(sentinel);
  });

  onDestroy(() => {
    observer?.disconnect();
  });
</script>

<div class="posts">
  {#each query.data as post}
    <article class="post">
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </article>
  {/each}
</div>

<div id="sentinel" class="sentinel">
  {#if query.isLoading}
    <p>Loading more posts...</p>
  {/if}
</div>

<style>
  .posts {
    display: grid;
    gap: 2rem;
  }

  .sentinel {
    padding: 2rem;
    text-align: center;
    color: var(--color-text-secondary);
  }
</style>
```

## Best Practices

1. **Use descriptive cache keys** for easy invalidation
2. **Set appropriate stale times** to balance freshness and performance
3. **Organize queries** in dedicated modules
4. **Invalidate related queries** after mutations
5. **Use callbacks** for side effects and analytics
6. **Enable queries conditionally** to avoid unnecessary requests
7. **Handle errors gracefully** with user-friendly messages
8. **Consider offline support** with cache management
