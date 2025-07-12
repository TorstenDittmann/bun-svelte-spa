# Svelte Bun SPA

A monorepo containing a lightweight Svelte SPA framework built for Bun runtime.

## What is this?

This project provides a simple framework for building Single Page Applications with Svelte 5 and Bun. It includes:

- **Framework package** (`bun-svelte-spa`) - Core build tools and runtime router
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
- Runtime router with type-safe navigation

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
	entrypoints: ["./src/index.html"],
	outdir: "./dist",
});

// Development server
dev(entrypoint);
```

## Routing

```typescript
import { create_goto, create_routes, Router } from "bun-svelte-spa/runtime";

const routes = create_routes([
	{ path: "/", component: Home },
	{ path: "/about", component: About },
]);

const goto = create_goto(routes);

// Type-safe navigation
goto("/about");
```

## Requirements

- Bun runtime
- Svelte 5.0+
- TypeScript 5+

## License

MIT
