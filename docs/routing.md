# Routing

Learn how to set up and use the type-safe router in your Svelte Bun application.

## Overview

The framework includes a powerful type-safe router built on radix3 with reactive state management. It supports:

- Type-safe route definitions
- Dynamic route parameters
- Lazy-loaded route components
- Route matching and resolution

## Defining Routes

Create a `src/router.ts` file to define your routes:

```typescript
import About from "@routes/about.svelte";
import Home from "@routes/home.svelte";
import User from "@routes/user.svelte";
import { create_router } from "bun-svelte-spa/runtime";

export const router = create_router([
	{ path: "/", component: Home },
	{ path: "/about", component: About },
	{ path: "/user/:id", component: User },
]);

export const {
	routes,
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

## Real-World Route Examples

### E-commerce Routes

```typescript
export const router = create_router([
	// Public pages
	{ path: "/", component: () => import("@routes/home.svelte") },
	{
		path: "/products",
		component: () => import("@routes/products/index.svelte"),
	},
	{
		path: "/products/:id",
		component: () => import("@routes/products/[id].svelte"),
	},
	{
		path: "/categories/:slug",
		component: () => import("@routes/categories/[slug].svelte"),
	},

	// Cart & Checkout
	{ path: "/cart", component: () => import("@routes/cart.svelte") },
	{ path: "/checkout", component: () => import("@routes/checkout.svelte") },
	{
		path: "/checkout/success",
		component: () => import("@routes/checkout/success.svelte"),
	},

	// Account
	{
		path: "/account",
		component: () => import("@routes/account/index.svelte"),
	},
	{
		path: "/account/orders",
		component: () => import("@routes/account/orders.svelte"),
	},
	{
		path: "/account/orders/:id",
		component: () => import("@routes/account/orders/[id].svelte"),
	},
]);
```

### Blog Routes

```typescript
export const router = create_router([
	{ path: "/", component: () => import("@routes/home.svelte") },
	{ path: "/blog", component: () => import("@routes/blog/index.svelte") },
	{
		path: "/blog/:slug",
		component: () => import("@routes/blog/[slug].svelte"),
	},
	{
		path: "/blog/category/:category",
		component: () => import("@routes/blog/category/[category].svelte"),
	},
	{
		path: "/blog/tag/:tag",
		component: () => import("@routes/blog/tag/[tag].svelte"),
	},
	{
		path: "/blog/:slug/edit",
		component: () => import("@routes/blog/[slug]/edit.svelte"),
	},
]);
```

### Admin Dashboard Routes

```typescript
export const router = create_router([
	{ path: "/admin", component: () => import("@routes/admin/index.svelte") },
	{
		path: "/admin/users",
		component: () => import("@routes/admin/users.svelte"),
	},
	{
		path: "/admin/users/:id",
		component: () => import("@routes/admin/users/[id].svelte"),
	},
	{
		path: "/admin/users/:id/edit",
		component: () => import("@routes/admin/users/[id]/edit.svelte"),
	},
	{
		path: "/admin/products",
		component: () => import("@routes/admin/products.svelte"),
	},
	{
		path: "/admin/products/new",
		component: () => import("@routes/admin/products/new.svelte"),
	},
	{
		path: "/admin/products/:id",
		component: () => import("@routes/admin/products/[id].svelte"),
	},
	{
		path: "/admin/settings",
		component: () => import("@routes/admin/settings.svelte"),
	},
]);
```

## Route Types

### Static Routes

Static routes match exact paths:

```typescript
{ path: "/", component: Home }
{ path: "/about", component: About }
{ path: "/contact", component: Contact }
```

### Dynamic Routes

Dynamic routes use `:param` syntax for parameters:

```typescript
// Single parameter
{ path: "/user/:id", component: User }

// Multiple parameters
{ path: "/posts/:postId/comments/:commentId", component: CommentDetail }

// Optional-like patterns (handled by routing logic)
{ path: "/blog/:year/:month/:slug", component: BlogPost }
```

### Nested Routes

Nested routes are supported:

```typescript
{ path: "/admin/users/:id", component: UserDetail }
{ path: "/admin/users/:id/posts", component: UserPosts }
{ path: "/admin/users/:id/settings", component: UserSettings }
```

## Lazy Loading

Load route components on demand using dynamic imports for better performance:

```typescript
export const router = create_router([
	{
		path: "/",
		component: () => import("@routes/home.svelte"),
	},
	{
		path: "/about",
		component: () => import("@routes/about.svelte"),
	},
	{
		path: "/user/:id",
		component: () => import("@routes/user.svelte"),
	},
]);
```

This automatically handles code splitting. Each route is loaded only when visited, reducing initial bundle size.

## Using the Router

### Router Component

Add the Router component to your app:

```svelte
<script lang="ts">
	import NotFound from "@routes/not-found.svelte";
	import { Router } from "bun-svelte-spa/runtime";
	import { router } from "./router";
</script>

<Router {router} fallback={NotFound} />
```

The `fallback` prop displays when no route matches. Create a `NotFound.svelte` component:

```svelte
<svelte:head>
	<title>Page Not Found</title>
</svelte:head>

<div class="not-found">
	<h1>404</h1>
	<p>The page you're looking for doesn't exist.</p>
	<button onclick={() => goto("/")}>Go Home</button>
</div>

<style>
	.not-found {
		text-align: center;
		padding: 4rem 1rem;
	}

	h1 {
		font-size: 6rem;
		margin: 0;
		color: var(--color-primary);
	}

	p {
		font-size: 1.25rem;
		margin: 1rem 0 2rem;
		color: var(--color-text-secondary);
	}
</style>
```

### Accessing Route Data

Access current route information anywhere in your app:

```svelte
<script lang="ts">
	import { current } from "@router";
</script>

<div class="debug-info">
	<p>Current path: {$current.path}</p>
	<p>Route pattern: {$current.route?.path}</p>
	<p>Parameters: {JSON.stringify($current.params)}</p>
</div>
```

## Route Parameters

### Extracting Parameters

Extract parameters from the current route in a user detail page:

```svelte
<script lang="ts">
	import { userQuery } from "@lib/queries";
	import { current } from "@router";

	let userId = $derived(parseInt($current.params.id));
	let isUserRoute = $derived($current.route?.path === "/user/:id");

	const user = userQuery(userId);
</script>

{#if isUserRoute}
	{#if $user.isLoading}
		<p>Loading user...</p>
	{:else if $user.isError}
		<p>Error loading user: {$user.error.message}</p>
	{:else}
		<h1>{$user.data.name}</h1>
		<p>Email: {$user.data.email}</p>
	{/if}
{/if}
```

### Type-Safe Parameters

The router provides full TypeScript support for parameters:

```typescript
// TypeScript knows that "/user/:id" requires an "id" parameter
goto("/user/:id", { id: "123" });

// Error: Missing required parameter "id"
goto("/user/:id");

// TypeScript infers the parameter type
const userId: string = $current.params.id;

// Multiple parameters
goto("/posts/:postId/comments/:commentId", {
	postId: "1",
	commentId: "5",
});
```

## Route Resolution

Generate URLs programmatically with type safety:

```typescript
import { resolve } from "@router";

// Resolve static routes
const homeUrl = resolve("/"); // "/"
const aboutUrl = resolve("/about"); // "/about"

// Resolve dynamic routes with parameters
const userUrl = resolve("/user/:id", { id: "123" }); // "/user/123"
const commentUrl = resolve("/posts/:postId/comments/:commentId", {
	postId: "1",
	commentId: "5",
}); // "/posts/1/comments/5"
```

Use resolved URLs in links:

```svelte
<script>
	import { resolve } from "@router";
	import { goto } from "@router";

	const products = [
		{ id: 1, name: "Laptop" },
		{ id: 2, name: "Phone" },
		{ id: 3, name: "Tablet" },
	];
</script>

<h1>Products</h1>
<ul>
	{#each products as product}
		<li>
			<a href={resolve("/products/:id", { id: product.id })}>
				{product.name}
			</a>
			<button onclick={() => goto("/products/:id", { id: product.id })}>
				View
			</button>
		</li>
	{/each}
</ul>
```

## Active Route Detection

Check if a route is currently active in a navigation component:

```svelte
<script>
	import { isActive, resolve } from "@router";

	const navItems = [
		{ path: "/", label: "Home" },
		{ path: "/about", label: "About" },
		{ path: "/users", label: "Users" },
		{ path: "/admin", label: "Admin" },
	];
</script>

<nav class="main-nav">
	<ul>
		{#each navItems as item}
			<li>
				<a
					href={resolve(item.path)}
					class:active={isActive(item.path)}
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.main-nav a {
		padding: 0.5rem 1rem;
		color: var(--color-text-primary);
		text-decoration: none;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}

	.main-nav a:hover {
		background-color: var(--color-bg-secondary);
	}

	.main-nav a.active {
		background-color: var(--color-primary);
		color: white;
	}
</style>
```

Use `{ exact: false }` to match parent routes:

```svelte
<script>
	import { isActive } from "@router";
</script>

<nav>
	<a href="/" class:active={isActive("/", { exact: true })}>Home</a>
	<a href="/admin" class:active={isActive("/admin", { exact: false })}>
		Admin
	</a>
</nav>

<!-- /admin/users will highlight the Admin link with exact: false -->
```

## Route Configuration Options

### Route Props

Pass static props to route components:

```typescript
{
  path: "/dashboard",
  component: Dashboard,
  props: { layout: "admin", theme: "dark" }
}
```

Access these in your component:

```svelte
<script>
	export let layout;
	export let theme;
</script>

<div class="dashboard" class:dark={theme === "dark"}>
	<p>Layout: {layout}</p>
	<p>Theme: {theme}</p>
</div>
```

## Best Practices

1. **Organize routes** in a central `router.ts` file
2. **Use lazy loading** for better performance and code splitting
3. **Leverage TypeScript** for type safety and better DX
4. **Create typed helpers** for common route patterns
5. **Keep routes flat** when possible for better maintainability
6. **Use descriptive route paths** that reflect your application structure
7. **Implement a 404 page** for unmatched routes
