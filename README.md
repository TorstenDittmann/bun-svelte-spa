# Svelte Bun SPA _experimental_

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

### `starter` (Starter Template)

A starter template with:

- Svelte 5 setup with TypeScript
- Client-side routing with type safety
- Development server with hot reload
- Production build configuration
- Path aliases for clean imports

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
import entrypoint from "./src/index.html";
dev({ entrypoint });
```

## Routing

The framework includes a powerful type-safe router with reactive state management.

### Basic Setup

```typescript
import About from "@routes/about.svelte";
import Index from "@routes/index.svelte";
import User from "@routes/User.svelte";
import {
	create_goto,
	create_resolver,
	create_routes,
} from "bun-svelte-spa/runtime";

export const routes = create_routes([
	{ path: "/", component: Index },
	{ path: "/about", component: About },
	{ path: "/users/:id", component: User },
]);

export const goto = create_goto(routes);
export const resolve = create_resolver(routes);
```

### Router Component

```svelte
<script lang="ts">
	import { routes } from "@router";
	import { Router } from "bun-svelte-spa/runtime";
</script>

<Router {routes} />
```

### Navigation

```typescript
import { goto } from "@router";

// Type-safe navigation
goto("/about");

// Navigation with parameters
goto("/users/:id", { id: "123" });
```

Or use it in Svelte components:

```svelte
<script>
	import { goto } from "@router";
</script>

<button onclick={() => goto("/about")}>
	Go to About
</button>
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
import { resolve } from "@router";

// Resolve URLs with parameters
const userUrl = resolve("/users/:id", { id: "123" }); // "/users/123"
```

## Path Aliases

The starter template includes convenient path aliases in `tsconfig.json`:

```json
{
	"compilerOptions": {
		"paths": {
			"@lib/*": ["./src/lib/*"],
			"@routes/*": ["./src/routes/*"],
			"@router": ["./src/router.ts"]
		}
	}
}
```

## Requirements

- Bun runtime
- Svelte 5.0+
- TypeScript 5+

## License

MIT
