# Data Fetching

The framework includes a query and mutation system with automatic caching, invalidation, and reactive state. Import everything from `bun-svelte-spa/runtime`.

## Queries

### Basic query

```html
<script lang="ts">
  import { createQuery } from "bun-svelte-spa/runtime";

  interface User {
    id: number;
    name: string;
    email: string;
  }

  const users = createQuery<User[]>({
    key: ["users"],
    fn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 60000,
  });
</script>

{#if users.isLoading}
  <p>Loading...</p>
{:else if users.isError}
  <p>Error: {users.error.message}</p>
  <button onclick={() => users.refetch()}>Retry</button>
{:else}
  <ul>
    {#each users.data as user}
      <li>{user.name} — {user.email}</li>
    {/each}
  </ul>
{/if}
```

### Query state

Every query exposes reactive state:

| Property     | Type                                | Description                                 |
| ------------ | ----------------------------------- | ------------------------------------------- |
| `data`       | `T \| undefined`                    | The resolved data                           |
| `error`      | `Error \| null`                     | The error, if any                           |
| `status`     | `"pending" \| "success" \| "error"` | Current status                              |
| `isLoading`  | `boolean`                           | First fetch in progress                     |
| `isFetching` | `boolean`                           | Any fetch in progress (including refetches) |
| `isSuccess`  | `boolean`                           | Data loaded successfully                    |
| `isError`    | `boolean`                           | Fetch resulted in an error                  |

### Cache keys

Cache keys are arrays. Queries with the same key share cached data:

```typescript
createQuery({ key: ["users"], fn: fetchUsers });
createQuery({ key: ["users", userId], fn: () => fetchUser(userId) });
createQuery({
	key: ["users", "filtered", { role, status }],
	fn: () => fetchFiltered({ role, status }),
});
```

### Stale time

Control how long cached data is considered fresh:

```typescript
// Refetch after 5 seconds
createQuery({ key: ["prices"], fn: fetchPrices, staleTime: 5000 });

// Cache for 1 hour
createQuery({ key: ["profile", id], fn: fetchProfile, staleTime: 3600000 });
```

### Conditional execution

Disable a query until a condition is met:

```typescript
const posts = createQuery({
	key: ["user-posts", userId],
	fn: () => fetchUserPosts(userId),
	enabled: () => userId !== null,
});
```

### Background refetching

```typescript
createQuery({
	key: ["messages"],
	fn: fetchMessages,
	refetchOnWindowFocus: true, // Refetch when tab regains focus
	refetchInterval: 60000, // Poll every minute
});
```

### Callbacks

```typescript
createQuery({
	key: ["users"],
	fn: fetchUsers,
	onSuccess: (data) => console.log("Loaded", data.length, "users"),
	onError: (error) => console.error("Failed:", error),
});
```

## Mutations

### Basic mutation

```typescript
import { createMutation, invalidateQueries } from "bun-svelte-spa/runtime";

const createUser = createMutation({
	fn: async (userData) => {
		const res = await fetch("/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(userData),
		});
		return res.json();
	},
	onSuccess: () => {
		invalidateQueries(["users"]);
	},
});
```

Trigger it:

```html
<button
  onclick={() => createUser.mutate({ name: "Alice", email: "alice@example.com" })}
  disabled={createUser.isLoading}
>
  {createUser.isLoading ? "Creating..." : "Create User"}
</button>
```

### CRUD pattern

```typescript
import { createMutation, invalidateQueries } from "bun-svelte-spa/runtime";

const create = createMutation({
	fn: (data) =>
		fetch("/api/items", { method: "POST", body: JSON.stringify(data) })
			.then(r => r.json()),
	onSuccess: () => invalidateQueries(["items"]),
});

const update = createMutation({
	fn: ({ id, data }) =>
		fetch(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(data) })
			.then(r => r.json()),
	onSuccess: () => invalidateQueries(["items"]),
});

const remove = createMutation({
	fn: (id) => fetch(`/api/items/${id}`, { method: "DELETE" }),
	onSuccess: () => invalidateQueries(["items"]),
});
```

## Cache invalidation

Invalidate cached queries to trigger refetches:

```typescript
import { invalidateQueries } from "bun-svelte-spa/runtime";

// Invalidate a specific query
invalidateQueries(["users", 42]);

// Invalidate all queries starting with "users"
invalidateQueries(["users"]);
```

Key matching is prefix-based: invalidating `["users"]` also invalidates `["users", 1]`, `["users", "list"]`, etc.

## Dependent queries

Run queries in sequence by using `enabled`:

```html
<script>
  import { createQuery } from "bun-svelte-spa/runtime";

  const user = createQuery({
    key: ["user", userId],
    fn: () => fetchUser(userId),
  });

  const posts = createQuery({
    key: ["user-posts", userId],
    fn: () => fetchUserPosts(userId),
    enabled: () => user.isSuccess,
  });
</script>

{#if user.isSuccess}
  <h1>{user.data.name}</h1>
  {#if posts.isSuccess}
    {#each posts.data as post}
      <p>{post.title}</p>
    {/each}
  {/if}
{/if}
```

## Organizing queries

Keep query definitions in dedicated modules:

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

export function invalidateUsers() {
	invalidateQueries(["users"]);
}
```
