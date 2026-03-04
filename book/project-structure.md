# Project Structure

## Overview

A bun-svelte-spa project follows a simple convention:

```
my-app/
├── src/
│   ├── index.html        # HTML shell — the single page
│   ├── app.ts            # Entry point — mounts Svelte
│   ├── app.svelte        # Root component — renders the Router
│   ├── app.css           # Global styles (optional)
│   ├── router.ts         # Route definitions
│   ├── routes/           # Route components
│   │   ├── index.svelte
│   │   ├── about.svelte
│   │   └── user.svelte
│   └── lib/              # Shared components and utilities
│       ├── header.svelte
│       └── queries.ts
├── public/               # Static files copied as-is to dist/
├── dev.ts                # Dev server entry
├── build.ts              # Production build entry
├── tsconfig.json
└── package.json
```

## Key files

### `src/index.html`

The HTML shell that loads your app. Must include a `#root` element where Svelte mounts:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
    <script type="module" src="./app.ts"></script>
    <link rel="stylesheet" href="./app.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Bun processes this HTML file as the build entrypoint. Script and stylesheet references are resolved, bundled, and hashed automatically.

### `src/router.ts`

The central route definition file. All routes are declared here with `create_router()`, and the router instance is exported for use throughout the app:

```typescript
import { create_router } from "bun-svelte-spa/runtime";
import Home from "@routes/index.svelte";
import About from "@routes/about.svelte";

export const router = create_router([
  { path: "/", component: Home },
  { path: "/about", component: About },
]);

export const { goto, resolve, current, beforeNavigate, afterNavigate, queryParams, setQueryParams, isActive } = router;
```

Destructuring the router instance gives you importable functions that work anywhere in your app.

### `dev.ts` and `build.ts`

These are thin scripts that call the framework's `dev()` and `build()` functions. You run them with `bun run dev` and `bun run build`. They're files in your project (not CLI commands) so you can customize build options directly.

## Build output

After running `bun run build`, the `dist/` directory contains:

```
dist/
├── index.html                 # SPA entry
├── 200.html                   # SPA fallback (same as index.html)
├── 404.html                   # Not found fallback
├── app.js                     # Main bundle
├── _chunks/
│   └── chunk-a1b2c3.js        # Code-split chunks
├── _assets/
│   └── logo-d4e5f6.png        # Hashed static assets
└── about/                     # Static-rendered routes (if configured)
    └── index.html
```

The `200.html` and `404.html` files are copies of `index.html`, enabling SPA fallback behavior on hosting platforms like Netlify and Surge.
