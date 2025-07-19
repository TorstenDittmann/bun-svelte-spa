# Svelte Bun SPA

A monorepo containing a lightweight Svelte SPA framework built for Bun runtime.

## What is this?

This project provides a simple framework for building Single Page Applications with Svelte 5 and Bun. It includes:

- **Framework package** (`bun-svelte-spa`) - Core build tools and type-safe runtime router
- **Starter template** - Ready-to-use project template
- **Examples** - Sample applications demonstrating usage

## Quick Start

### New Project from Template

```bash
# Create a new project from template
bunx giget gh:torstendittmann/bun-svelte-spa/packages/starter my-app
cd my-app

# Install dependencies and start developing
bun install
bun run dev
```

### Add to Existing Project

```bash
# Install the framework
bun add bun-svelte-spa

# Add Svelte 5
bun add svelte

# Create basic files (see Framework Usage below)
```

## Packages

### `bun-svelte-spa` (Framework)

Core framework providing:

- `build()` - Production build with Svelte compilation
- `dev()` - Development server with hot reload
- Type-safe runtime router with reactive route store
- Parameter extraction and programmatic navigation

### `template` (Starter)

A starter template with:

- Svelte 5 setup
- TypeScript configuration
- Routing example
- Build and dev scripts

## Development

```bash
# Install dependencies
bun install

# Format code
bun run format

# Lint code  
bun run lint
```

## Framework Usage

```typescript
import { build, dev } from "bun-svelte-spa";

// Build for production
await build({
	outdir: "./dist",
});

// Development server
dev(entrypoint);
```

## Routing

The framework includes a powerful type-safe router with reactive state management.

### Basic Setup

```typescript
import { create_goto, create_routes, Router } from "bun-svelte-spa/runtime";

const routes = create_routes([
	{ path: "/", component: Home },
	{ path: "/about", component: About },
	{ path: "/users/:id", component: UserDetail },
]);

const goto = create_goto(routes);
```

### Router Component

```svelte
<script>
	import { routes } from "@router";
	import { Router } from "bun-svelte-spa/runtime";
</script>

<Router {routes} />
```

### Navigation

```typescript
// Type-safe navigation
goto("/about");

// Navigation with parameters
goto("/users/:id", { id: "123" });
```

### Route Store

Access current route data anywhere in your app:

```svelte
<script>
	import { route } from "bun-svelte-spa/runtime";
</script>

<!-- Reactive route information -->
<p>Current path: {$route.path}</p>
<p>Route pattern: {$route.route?.path}</p>
<p>User ID: {$route.params.id}</p>
```

### Route Parameters

Extract parameters from the current route:

```svelte
<script>
	import { route } from "bun-svelte-spa/runtime";

	// Reactively get route parameters
	let userId = $derived($route.params.id);
	let isUserRoute = $derived($route.route?.path === "/users/:id");
</script>
```

### Route Resolution

Generate URLs programmatically:

```typescript
import { create_resolver } from "bun-svelte-spa/runtime";

const resolve = create_resolver(routes);

// Resolve URLs with parameters
const userUrl = resolve("/users/:id", { id: "123" }); // "/users/123"
```

## Requirements

- Bun runtime
- Svelte 5.0+
- TypeScript 5+

## License

MIT
