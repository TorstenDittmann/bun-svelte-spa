# Router API

## `create_router(routes)`

Creates a new router instance.

```typescript
import { create_router } from "bun-svelte-spa/runtime";

const router = create_router([
	{ path: "/", component: Home },
	{ path: "/user/:id", component: User },
]);
```

**Parameters:**

- `routes` — a readonly array of `Route` objects

**Returns:** `RouterInstance<T>`

## Route

```typescript
type Route = {
	path: string;
	component: Component | (() => Promise<{ default: Component }>);
	props?: Record<string, unknown>;
	children?: readonly Route[];
	static?: boolean;
	staticParams?: () => Promise<Record<string, string>[]> | Record<
		string,
		string
	>[];
};
```

| Property       | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `path`         | URL pattern. Use `:param` for dynamic segments.              |
| `component`    | Svelte component or lazy loader returning one.               |
| `props`        | Static props passed to the component.                        |
| `children`     | Nested routes. The parent component acts as a layout.        |
| `static`       | Mark for static rendering at build time.                     |
| `staticParams` | Function returning parameter sets for dynamic static routes. |

## RouterInstance

### Properties

#### `current`

Reactive state of the current route.

```typescript
type RouteState = {
	route: ResolvedRoute | null;
	params: Record<string, string>;
	path: string;
};
```

#### `routes`

The original route definitions passed to `create_router()`.

#### `queryParams`

Reactive URL query parameters. See [Query Parameters](../query-parameters.md).

```typescript
type QueryParams = {
	get(key: string): string | null;
	getAll(key: string): string[];
	has(key: string): boolean;
	entries(): IterableIterator<[string, string]>;
	toString(): string;
};
```

### Methods

#### `goto(path, params?)`

Navigate to a route. Type-safe — TypeScript enforces correct parameters.

```typescript
router.goto("/about");
router.goto("/user/:id", { id: "123" });
```

#### `resolve(path, params?)`

Generate a URL string from a route pattern. Type-safe.

```typescript
router.resolve("/user/:id", { id: "123" }); // "/user/123"
```

Throws if a dynamic route is missing parameters.

#### `match(pathname)`

Match a pathname against registered routes.

```typescript
const { route, params } = router.match("/user/42");
// route: the matched FlattenedRoute or null
// params: { id: "42" }
```

#### `navigate(path, replace?, type?)`

Low-level navigation. Runs guards, updates history, and resolves the route.

```typescript
await router.navigate("/about"); // push state
await router.navigate("/about", true); // replace state
await router.navigate("/about", false, "link"); // set navigation type
```

#### `updateRoute(type?)`

Sync the router state with the current `window.location`. Called internally after navigation.

#### `beforeNavigate(callback)`

Register a callback that runs before each navigation. Return the unsubscribe function.

```typescript
type BeforeNavigateCallback = (
	navigation: Navigation & { cancel: () => void },
) => void | Promise<void>;
```

#### `afterNavigate(callback)`

Register a callback that runs after each navigation. Return the unsubscribe function.

```typescript
type AfterNavigateCallback = (navigation: Navigation) => void;
```

#### `setQueryParams(params, options?)`

Update URL query parameters.

```typescript
router.setQueryParams({ q: "test", page: null });
router.setQueryParams({ page: "2" }, { replace: true });
```

- Set a value to `null` to remove the parameter.
- Pass `string[]` for multi-value parameters.
- Use `{ replace: true }` to replace the history entry instead of pushing.

#### `isActive(path, options?)`

Check if a path matches the current route.

```typescript
router.isActive("/admin"); // true if on /admin or /admin/*
router.isActive("/", { exact: true }); // true only if on exactly /
```

## Router Component

```html
<Router {router} fallback={NotFound} />
```

| Prop       | Type             | Description                               |
| ---------- | ---------------- | ----------------------------------------- |
| `router`   | `RouterInstance` | The router instance                       |
| `fallback` | `Component`      | Component to render when no route matches |

The Router component:

- Initializes the route on mount
- Intercepts `<a>` tag clicks for SPA navigation
- Listens for `popstate` events (browser back/forward)
- Renders the matched component (with layout nesting)

## Types

```typescript
type NavigationType = "goto" | "popstate" | "link";

type Navigation = {
	from: RouteState;
	to: RouteState;
	type: NavigationType;
};

type ResolvedRoute = {
	path: string;
	component: Component;
	props?: Record<string, unknown>;
	parents: Component[];
};
```
