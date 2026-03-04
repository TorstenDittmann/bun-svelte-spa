# Getting Started

## Installation

Create a new project from the starter template:

```bash
bunx giget gh:torstendittmann/bun-svelte-spa/packages/starter my-app
cd my-app
bun install
```

## Development

Start the dev server with hot reload:

```bash
bun run dev
```

This starts a Bun HTTP server at `http://localhost:1337`. TypeScript and Svelte files are processed on the fly — no build step needed.

## Production build

Build optimized output for deployment:

```bash
bun run build
```

This produces a `dist/` directory with:

- `index.html` — the SPA entry point
- `200.html` — SPA fallback for hosting platforms (e.g. Netlify, Surge)
- `404.html` — fallback for unmatched routes
- `_chunks/` — code-split JavaScript bundles
- `_assets/` — hashed static assets

## Project files

A starter project has this structure:

```
my-app/
├── src/
│   ├── index.html      # HTML entry point
│   ├── app.ts          # Mounts the Svelte app
│   ├── app.svelte      # Root component with Router
│   ├── router.ts       # Route definitions
│   └── routes/
│       ├── index.svelte
│       └── about.svelte
├── dev.ts              # Dev server script
├── build.ts            # Build script
└── package.json
```

### `dev.ts`

```typescript
import { dev } from "bun-svelte-spa";
import entrypoint from "./src/index.html";

dev({ entrypoint });
```

### `build.ts`

```typescript
import { build } from "bun-svelte-spa";

await build({ outdir: "./dist" });
```

### `src/app.ts`

```typescript
import { mount } from "svelte";
import App from "./app.svelte";

mount(App, { target: document.getElementById("root")! });
```

### `src/router.ts`

```typescript
import About from "@routes/about.svelte";
import Index from "@routes/index.svelte";
import { create_router } from "bun-svelte-spa/runtime";

export const router = create_router([
	{ path: "/", component: Index },
	{ path: "/about", component: About },
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

### `src/app.svelte`

```html
<script lang="ts">
  import { Router } from "bun-svelte-spa/runtime";
  import { router } from "./router";
</script>

<Router {router} />
```

## Next steps

- [Routing](routing.md) — define routes with type-safe parameters
- [Navigation](navigation.md) — navigate programmatically and use guards
- [Data Fetching](data-fetching.md) — fetch, cache, and mutate data
- [Static Rendering](static-rendering.md) — pre-render routes at build time
