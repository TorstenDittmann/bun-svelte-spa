# Svelte Bun SPA Starter Template

A starter template for building Single Page Applications with Svelte 5 and Bun.

## What's Included

- Svelte 5 with TypeScript
- Client-side routing with type safety
- Development server with hot reload
- Production build configuration
- CSS styling setup

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Development

The development server runs on `http://localhost:1337` with automatic reload when files change.

```bash
bun run dev
```

## Building

Create an optimized production build:

```bash
bun run build
```

Output files are generated in the `dist/` directory.

## Project Structure

```
src/
├── index.html          # HTML entry point
├── app.ts             # Application entry
├── app.svelte         # Root component
├── router.ts          # Route definitions
├── app.css           # Global styles
├── routes/           # Page components
│   ├── index.svelte  # Home page
│   └── about.svelte  # About page
└── lib/              # Shared components
    └── counter.svelte
```

## Adding Routes

Edit `src/router.ts` to add new routes:

```typescript
import About from "@routes/about.svelte";
import Index from "@routes/index.svelte";
import NewPage from "@routes/new-page.svelte";
import {
	create_goto,
	create_resolver,
	create_routes,
} from "bun-svelte-spa/runtime";

export const routes = create_routes([
	{ path: "/", component: Index },
	{ path: "/about", component: About },
	{ path: "/new-page", component: NewPage },
]);

export const goto = create_goto(routes);
export const resolve = create_resolver(routes);
```

## Navigation

Use the type-safe `goto` function for navigation:

```typescript
import { goto } from "@router";

// Navigate to a route
goto("/about");
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

## Path Aliases

The template includes convenient path aliases in `tsconfig.json`:

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

These allow for cleaner imports:

```typescript
// Instead of relative paths
import About from "../../routes/about.svelte";

// Use aliases
import About from "@routes/about.svelte";
```

## Configuration

### TypeScript

TypeScript configuration is in `tsconfig.json`. The setup includes:

- Svelte type definitions
- Module resolution for `.svelte` files
- Strict type checking
- Path aliases for clean imports

### Bun

Bun configuration is in `bunfig.toml` with preloads for Svelte plugin support.

## Requirements

- Bun runtime
- Svelte 5.0+
- TypeScript 5+

## License

MIT
