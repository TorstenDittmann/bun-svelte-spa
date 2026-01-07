# Navigation

Learn how to navigate between routes in your Svelte Bun application.

## Programmatic Navigation

### Basic Navigation

Navigate between routes using the `goto` function:

```typescript
import { goto } from "@router";

// Navigate to a route
goto("/about");

// Navigate with parameters
goto("/user/:id", { id: "123" });
```

### Navigation in Components

Use `goto` in Svelte components:

```svelte
<script>
	import { goto } from "@router";

	function navigateToProfile() {
		goto("/user/:id", { id: userId });
	}
</script>

<button onclick={() => goto("/about")}>
	Go to About
</button>

<button onclick={navigateToProfile}>
	View Profile
</button>
```

### Type-Safe Navigation

TypeScript ensures you provide required parameters:

```typescript
// Type-safe navigation with parameters
goto("/user/:id", { id: "123" }); // OK

// Error: Missing required parameter "id"
goto("/user/:id");

// TypeScript infers parameter types
goto("/posts/:postId/comments/:commentId", {
	postId: "1",
	commentId: "5",
});
```

## Navigation Guards

### Authentication Guard

Protect routes that require authentication:

```typescript
import { beforeNavigate } from "@router";

let isAuthenticated = false;

beforeNavigate(({ to, cancel }) => {
	// Redirect to login if not authenticated
	if (!isAuthenticated && to.path.startsWith("/admin")) {
		cancel();
		goto("/login", { redirect: to.path });
	}
});
```

Complete authentication example:

```typescript
import { authStore } from "@lib/stores";
import { afterNavigate, beforeNavigate } from "@router";

beforeNavigate(({ to, cancel }) => {
	const publicRoutes = ["/", "/about", "/login", "/register"];
	const isPublicRoute = publicRoutes.some(route => to.path.startsWith(route));

	if (!authStore.isAuthenticated && !isPublicRoute) {
		cancel();
		goto("/login", { redirect: to.path });
	}
});

afterNavigate(({ from, to }) => {
	// Update last visited page
	if (to.path !== "/login") {
		localStorage.setItem("lastPath", to.path);
	}
});
```

### Unsaved Changes Guard

Prevent navigation when there are unsaved changes:

```svelte
<script>
	import { beforeNavigate, onDestroy } from "@router";
	import { goto } from "@router";

	let formData = { name: "", email: "" };
	let hasUnsavedChanges = false;

	function handleChange() {
		hasUnsavedChanges = true;
	}

	const unsubscribe = beforeNavigate(({ cancel }) => {
		if (hasUnsavedChanges) {
			const confirmed = confirm(
				"You have unsaved changes. Continue?",
			);
			if (!confirmed) {
				cancel();
			}
		}
	});

	onDestroy(unsubscribe);

	async function handleSave() {
		await saveFormData(formData);
		hasUnsavedChanges = false;
		goto("/dashboard");
	}
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		handleSave();
	}}
>
	<input
		type="text"
		bind:value={formData.name}
		oninput={handleChange}
		placeholder="Name"
	/>
	<input
		type="email"
		bind:value={formData.email}
		oninput={handleChange}
		placeholder="Email"
	/>
	<button type="submit">Save</button>
</form>
```

### Role-Based Access Control

Control access based on user roles:

```typescript
import { userStore } from "@lib/stores";
import { beforeNavigate } from "@router";

beforeNavigate(({ to, cancel }) => {
	const routePermissions = {
		"/admin": ["admin"],
		"/admin/users": ["admin"],
		"/admin/settings": ["admin", "moderator"],
		"/dashboard": ["user", "admin", "moderator"],
	};

	const requiredRole = routePermissions[to.path];

	if (requiredRole && !requiredRole.includes(userStore.role)) {
		cancel();
		goto("/unauthorized");
	}
});
```

### After Navigation Hook

Run code after navigation completes:

```typescript
import { afterNavigate } from "@router";

afterNavigate(({ from, to, type }) => {
	// Track page views
	analytics.track("pageview", {
		path: to.path,
		from: from.path,
		type: type,
	});

	// Scroll to top
	window.scrollTo(0, 0);

	// Update document title
	document.title = getPageTitle(to.path);

	// Focus management
	if (type !== "popstate") {
		document.querySelector("main")?.focus();
	}
});

function getPageTitle(path: string): string {
	const titles: Record<string, string> = {
		"/": "Home - My App",
		"/about": "About Us - My App",
		"/users": "Users - My App",
	};
	return titles[path] || "My App";
}
```

### Cleaning Up Guards

Both hooks return cleanup functions:

```typescript
const unsubscribe = beforeNavigate(({ cancel }) => {
	if (hasUnsavedChanges) {
		cancel();
	}
});

// Clean up when component unmounts
onDestroy(unsubscribe);
```

## Navigation Types

The framework tracks different navigation types:

```typescript
type NavigationType = "goto" | "popstate" | "link";
```

- `goto` - Programmatic navigation via `goto()`
- `popstate` - Browser back/forward button
- `link` - Clicking on anchor links

Access the navigation type in guards:

```typescript
beforeNavigate(({ type, to }) => {
	if (type === "popstate") {
		console.log("User used browser back/forward");
	}

	if (type === "link") {
		analytics.track("link_click", { path: to.path });
	}
});

afterNavigate(({ type }) => {
	// Only scroll to top for programmatic navigation
	if (type !== "popstate") {
		window.scrollTo(0, 0);
	}
});
```

## Query Parameters

### Accessing Query Params

Access query parameters reactively in a search page:

```svelte
<script>
	import { searchQuery } from "@lib/queries";
	import { queryParams } from "@router";

	let searchTerm = $derived($queryParams.get("q") || "");
	let page = $derived(parseInt($queryParams.get("page") || "1"));
	let sort = $derived($queryParams.get("sort") || "relevance");

	const results = searchQuery(searchTerm, page, sort);
</script>

<div class="search-controls">
	<input
		type="text"
		value={searchTerm}
		placeholder="Search..."
		readonly
	/>

	<select value={sort}>
		<option value="relevance">Relevance</option>
		<option value="date-asc">Oldest</option>
		<option value="date-desc">Newest</option>
	</select>
</div>

<p>Page {page}</p>
```

### Query Params Methods

```typescript
// Get a single value
const search = queryParams.get("q");

// Get all values for a key (multi-select)
const tags = queryParams.getAll("tag");

// Check if a key exists
const hasFilter = queryParams.has("filter");

// Get all entries
for (const [key, value] of queryParams.entries()) {
	console.log(key, value);
}

// Get as string
const queryString = queryParams.toString();
```

### Setting Query Params

Update query parameters for filtering and sorting:

```svelte
<script>
	import { queryParams, setQueryParams } from "@router";

	let filters = {
		category: "",
		minPrice: 0,
		maxPrice: 1000,
		tags: [],
	};

	function applyFilters() {
		setQueryParams({
			category: filters.category || null,
			minPrice: filters.minPrice > 0 ? filters.minPrice : null,
			maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : null,
			tags: filters.tags.length > 0 ? filters.tags : null,
		});
	}

	function clearFilters() {
		setQueryParams({
			category: null,
			minPrice: null,
			maxPrice: null,
			tags: null,
		});
		filters = {
			category: "",
			minPrice: 0,
			maxPrice: 1000,
			tags: [],
		};
	}
</script>

<div class="filters">
	<label>
		Category:
		<select bind:value={filters.category}>
			<option value="">All</option>
			<option value="electronics">Electronics</option>
			<option value="clothing">Clothing</option>
		</select>
	</label>

	<label>
		Price Range: ${filters.minPrice} - ${filters.maxPrice}
		<input type="range" bind:value={filters.minPrice} min="0" max="500" />
		<input
			type="range"
			bind:value={filters.maxPrice}
			min="500"
			max="2000"
		/>
	</label>

	<button onclick={applyFilters}>Apply Filters</button>
	<button onclick={clearFilters}>Clear</button>
</div>

<style>
	.filters {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-bg-secondary);
		border-radius: 0.5rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
</style>
```

### Pagination with Query Params

```svelte
<script>
  import { setQueryParams, queryParams } from "@router";

  let currentPage = $derived(parseInt($queryParams.get("page") || "1"));
  let itemsPerPage = $derived(parseInt($queryParams.get("per_page") || "20"));

  function goToPage(page: number) {
    setQueryParams({ page: String(page) }, { replace: true });
  }

  function changeItemsPerPage(count: number) {
    setQueryParams({ per_page: String(count), page: "1" });
  }
</script>

<div class="pagination">
  <button disabled={currentPage === 1} onclick={() => goToPage(currentPage - 1)}>
    Previous
  </button>

  <span>Page {currentPage}</span>

  <button onclick={() => goToPage(currentPage + 1)}>
    Next
  </button>

  <select value={itemsPerPage} onchange={(e) => changeItemsPerPage(parseInt(e.target.value))}>
    <option value="10">10 per page</option>
    <option value="20">20 per page</option>
    <option value="50">50 per page</option>
  </select>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
  }
</style>
```

## Link Navigation

### Navigation Component

Create a reusable navigation component:

```svelte
<script lang="ts">
	import { isActive, resolve } from "@router";

	const navItems = [
		{ path: "/", label: "Home", icon: "home" },
		{ path: "/products", label: "Products", icon: "shopping" },
		{ path: "/about", label: "About", icon: "info" },
		{ path: "/contact", label: "Contact", icon: "mail" },
	];
</script>

<nav class="main-nav">
	<ul>
		{#each navItems as item}
			<li>
				<a
					href={resolve(item.path)}
					class:active={isActive(item.path)}
					aria-current={isActive(item.path) ? "page" : undefined}
				>
					<span class="icon">{item.icon}</span>
					<span class="label">{item.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.main-nav {
		background: var(--color-bg-primary);
		border-bottom: 1px solid var(--color-border);
	}

	.main-nav ul {
		display: flex;
		list-style: none;
		gap: 0.5rem;
		margin: 0;
		padding: 0 1rem;
	}

	.main-nav a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		text-decoration: none;
		color: var(--color-text-secondary);
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.main-nav a:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
	}

	.main-nav a.active {
		background: var(--color-primary);
		color: white;
	}

	.icon {
		font-size: 1.25rem;
	}
</style>
```

### Active Links with Subroutes

```svelte
<script>
	import { isActive, resolve } from "@router";

	const navItems = [
		{ path: "/", label: "Home", exact: true },
		{ path: "/blog", label: "Blog", exact: false },
		{ path: "/admin", label: "Admin", exact: false },
	];
</script>

<nav>
	{#each navItems as item}
		<a
			href={resolve(item.path)}
			class:active={isActive(item.path, { exact: item.exact })}
		>
			{item.label}
		</a>
	{/each}
</nav>

<!-- /blog, /blog/post-1, /blog/category/tech will all highlight Blog -->
```

## Browser History

### Back and Forward Navigation

```svelte
<script>
	import { afterNavigate } from "@router";

	let canGoBack = $state(false);

	afterNavigate(() => {
		canGoBack = window.history.length > 1;
	});

	function goBack() {
		window.history.back();
	}

	function goForward() {
		window.history.forward();
	}
</script>

<div class="history-nav">
	<button disabled={!canGoBack} onclick={goBack}>
		← Back
	</button>
	<button onclick={goForward}>
		Forward →
	</button>
</div>
```

### Replace State for Temporary Views

```typescript
import { router } from "@router";

// Navigate to modal without adding history entry
async function openModal(itemId: string) {
	await router.navigate(`/modal/${itemId}`, true);
}

// Return without leaving history
async function closeModal() {
	await router.navigate("/", true);
}
```

## Advanced Patterns

### Form Submission with Redirect

```svelte
<script>
  import { goto } from "@router";
  import { createMutation } from "bun-svelte-spa/runtime";

  const mutation = createMutation({
    fn: async (formData) => {
      const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      return response.json();
    },
    onSuccess: ({ data }) => {
      goto(`/users/${data.id}`);
    },
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate(Object.fromEntries(formData));
  }
</script>

<form onsubmit={handleSubmit}>
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <button type="submit" disabled={$mutation.isLoading}>
    {$mutation.isLoading ? "Creating..." : "Create User"}
  </button>
</form>
```

### Animated Page Transitions

```svelte
<script>
	import { afterNavigate, beforeNavigate } from "@router";
	import { fade, slide } from "svelte/transition";

	let navigating = false;
	let transitionDirection = "forward";

	beforeNavigate(({ from, to }) => {
		navigating = true;
		transitionDirection = to.path > from.path
			? "forward"
			: "backward";
	});

	afterNavigate(() => {
		navigating = false;
	});
</script>

{#if navigating}
	<div
		class="page-transition"
		transition:fade={{ duration: 200 }}
		transition:slide={{
			duration: 300,
			direction: transitionDirection === "forward" ? 1 : -1,
		}}
	>
		Loading...
	</div>
{/if}

<slot />

<style>
	.page-transition {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-primary);
		z-index: 1000;
	}
</style>
```

## Best Practices

1. **Use type-safe `goto`** for programmatic navigation
2. **Leverage guards** for authentication, authorization, and form validation
3. **Use `resolve`** for links to ensure URL consistency
4. **Handle query params** reactively with `queryParams`
5. **Clean up guards** in component `onDestroy`
6. **Use `replace: true`** for temporary UI states (modals, filters)
7. **Track navigation** in analytics for insights
