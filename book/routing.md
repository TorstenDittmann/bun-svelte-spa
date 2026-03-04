# Routing

The router is built on [radix3](https://github.com/unjs/radix3), a fast trie-based router, with full TypeScript inference for route parameters.

## Defining routes

Create a `src/router.ts` file:

```typescript
import About from "@routes/about.svelte";
import Home from "@routes/index.svelte";
import User from "@routes/user.svelte";
import { create_router } from "bun-svelte-spa/runtime";

export const router = create_router([
	{ path: "/", component: Home },
	{ path: "/about", component: About },
	{ path: "/user/:id", component: User },
]);

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
```

## Route types

### Static routes

Match exact paths:

```typescript
{ path: "/", component: Home }
{ path: "/about", component: About }
{ path: "/contact", component: Contact }
```

### Dynamic routes

Use `:param` syntax for parameters. TypeScript infers the parameter names:

```typescript
// Single parameter — goto requires { id: string }
{ path: "/user/:id", component: User }

// Multiple parameters
{ path: "/posts/:postId/comments/:commentId", component: Comment }
```

### Nested routes (layouts)

A route with `children` acts as a layout. Its component wraps all child routes:

```typescript
export const router = create_router([
	{
		path: "/admin",
		component: AdminLayout,
		children: [
			{ path: "/", component: AdminDashboard },
			{ path: "/users", component: AdminUsers },
			{ path: "/users/:id", component: AdminUserDetail },
		],
	},
]);
```

The `AdminLayout` component receives a `children` snippet that renders the matched child route.

## Lazy loading

Use dynamic imports for code splitting. Each route loads only when visited:

```typescript
export const router = create_router([
	{ path: "/", component: () => import("@routes/index.svelte") },
	{ path: "/about", component: () => import("@routes/about.svelte") },
	{ path: "/user/:id", component: () => import("@routes/user.svelte") },
]);
```

## Router component

Mount the router in your root component:

```html
<script lang="ts">
  import { Router } from "bun-svelte-spa/runtime";
  import { router } from "./router";
  import NotFound from "@routes/not-found.svelte";
</script>

<Router {router} fallback={NotFound} />
```

The `fallback` prop renders when no route matches the current URL.

## Route props

Pass static data to route components:

```typescript
{
  path: "/dashboard",
  component: Dashboard,
  props: { layout: "admin", theme: "dark" }
}
```

## Type-safe parameters

TypeScript extracts parameter types from path patterns:

```typescript
// Correct — TypeScript knows :id is required
goto("/user/:id", { id: "123" });

// Error — missing required parameter "id"
goto("/user/:id");

// Correct — multiple parameters
goto("/posts/:postId/comments/:commentId", {
	postId: "1",
	commentId: "5",
});
```

## Route resolution

Generate URLs programmatically with `resolve`:

```typescript
import { resolve } from "./router";

resolve("/"); // "/"
resolve("/user/:id", { id: "123" }); // "/user/123"
resolve("/posts/:postId/comments/:commentId", {
	postId: "1",
	commentId: "5",
}); // "/posts/1/comments/5"
```

Use resolved URLs in templates:

```html
<script>
  import { resolve } from "./router";

  const products = [
    { id: 1, name: "Laptop" },
    { id: 2, name: "Phone" },
  ];
</script>

<ul>
  {#each products as product}
    <li>
      <a href={resolve("/products/:id", { id: String(product.id) })}>
        {product.name}
      </a>
    </li>
  {/each}
</ul>
```

## Active route detection

Check if a route is active with `isActive`:

```html
<script>
  import { isActive, resolve } from "./router";
</script>

<nav>
  <a href={resolve("/")} class:active={isActive("/", { exact: true })}>Home</a>
  <a href={resolve("/about")} class:active={isActive("/about")}>About</a>
  <a href={resolve("/admin")} class:active={isActive("/admin", { exact: false })}>Admin</a>
</nav>
```

By default, `isActive` matches the exact path and any child paths. Pass `{ exact: true }` to match only the exact path.

## Accessing route data

The reactive `current` state is available anywhere:

```html
<script>
  import { current } from "./router";
</script>

<p>Path: {current.path}</p>
<p>Pattern: {current.route?.path}</p>
<p>Params: {JSON.stringify(current.params)}</p>
```

In a route component, extract parameters reactively:

```html
<script lang="ts">
  import { current } from "./router";

  let userId = $derived(current.params.id);
</script>

<h1>User {userId}</h1>
```
