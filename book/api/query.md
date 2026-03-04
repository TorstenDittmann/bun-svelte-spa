# Query API

All exports are available from `bun-svelte-spa/runtime`.

## `createQuery(options)`

Create a reactive query that fetches and caches data.

```typescript
import { createQuery } from "bun-svelte-spa/runtime";

const query = createQuery<User[]>({
	key: ["users"],
	fn: async () => {
		const res = await fetch("/api/users");
		return res.json();
	},
});
```

### Options

```typescript
type QueryOptions<T> = {
	key: QueryKey | ((params: any) => QueryKey);
	fn: (params?: any) => Promise<T>;
	staleTime?: number;
	enabled?: boolean | (() => boolean);
	refetchOnWindowFocus?: boolean;
	refetchInterval?: number;
	onSuccess?: (data: T) => void;
	onError?: (error: Error) => void;
};

type QueryKey = (string | number | Record<string, unknown>)[];
```

| Option                 | Default  | Description                                                   |
| ---------------------- | -------- | ------------------------------------------------------------- |
| `key`                  | required | Cache key array. Queries with the same key share cached data. |
| `fn`                   | required | Async function that fetches the data.                         |
| `staleTime`            | `0`      | Milliseconds before cached data is considered stale.          |
| `enabled`              | `true`   | Boolean or function. Query won't execute when `false`.        |
| `refetchOnWindowFocus` | `true`   | Refetch stale data when the browser tab regains focus.        |
| `refetchInterval`      | —        | Poll at this interval (milliseconds).                         |
| `onSuccess`            | —        | Callback when fetch succeeds.                                 |
| `onError`              | —        | Callback when fetch fails.                                    |

### Return value

```typescript
type QueryState<T> = {
	data: T | undefined;
	error: Error | null;
	status: "pending" | "success" | "error";
	isLoading: boolean;
	isFetching: boolean;
	isSuccess: boolean;
	isError: boolean;
	refetch: () => void;
};
```

All properties are reactive (Svelte 5 runes).

## `createMutation(options)`

Create a mutation for modifying server data.

```typescript
import { createMutation } from "bun-svelte-spa/runtime";

const mutation = createMutation({
	fn: async (data) => {
		const res = await fetch("/api/users", {
			method: "POST",
			body: JSON.stringify(data),
		});
		return res.json();
	},
	onSuccess: ({ data }) => {
		invalidateQueries(["users"]);
	},
	onError: ({ error }) => {
		console.error(error);
	},
});
```

### Options

```typescript
type MutationOptions<TData, TVariables> = {
	fn: (variables: TVariables) => Promise<TData>;
	onSuccess?: (context: { data: TData; variables: TVariables }) => void;
	onError?: (context: { error: Error; variables: TVariables }) => void;
};
```

### Return value

| Property            | Type                | Description          |
| ------------------- | ------------------- | -------------------- |
| `mutate(variables)` | `(vars: T) => void` | Trigger the mutation |
| `isLoading`         | `boolean`           | Mutation in progress |
| `data`              | `T \| undefined`    | Result data          |
| `error`             | `Error \| null`     | Error if failed      |

## `invalidateQueries(key)`

Invalidate cached queries, causing them to refetch.

```typescript
import { invalidateQueries } from "bun-svelte-spa/runtime";

invalidateQueries(["users"]); // All queries starting with ["users"]
invalidateQueries(["users", 42]); // Specific user query
```

Matching is prefix-based: `["users"]` invalidates `["users"]`, `["users", 1]`, `["users", "list"]`, etc.

## `queryCache`

Direct access to the internal query cache. Useful for debugging or advanced cache manipulation.

```typescript
import { queryCache } from "bun-svelte-spa/runtime";
```
