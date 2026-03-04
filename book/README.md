# bun-svelte-spa

A lightweight SPA framework for [Svelte 5](https://svelte.dev) and [Bun](https://bun.sh).

Build type-safe single page applications with zero configuration, instant dev server startup, and production builds powered by Bun's native bundler.

## Features

- **Type-safe routing** — route parameters are inferred from path patterns, catching errors at compile time
- **Instant dev server** — no build step in development; Bun runs TypeScript directly
- **Optimized production builds** — automatic code splitting, minification, and asset hashing via `Bun.build()`
- **Static rendering** — pre-render routes at build time for SEO and faster initial loads
- **Data fetching** — built-in query and mutation system with caching, invalidation, and reactive state
- **Lazy loading** — route components are code-split automatically with dynamic imports
- **Navigation guards** — before/after hooks for authentication, analytics, and unsaved changes protection
- **Svelte 5 runes** — fully reactive state using `$state` and `$derived`

## Quick start

```bash
bunx giget gh:torstendittmann/bun-svelte-spa/packages/starter my-app
cd my-app
bun install
bun run dev
```

Your app is running at `http://localhost:1337`.

## Requirements

- [Bun](https://bun.sh) runtime
- [Svelte](https://svelte.dev) 5.44.0+
- TypeScript 5+
