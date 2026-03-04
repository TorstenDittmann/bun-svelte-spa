# Static Rendering

Pre-render routes at build time to generate static HTML files. This improves initial load performance and enables SEO for your SPA.

## Marking routes as static

Add `static: true` to any route:

```typescript
export const router = create_router([
	{ path: "/", component: Home, static: true },
	{ path: "/about", component: About, static: true },
	{ path: "/dashboard", component: Dashboard }, // client-only
]);
```

## Dynamic static routes

For routes with parameters, provide a `staticParams` function that returns all parameter combinations to pre-render:

```typescript
export const router = create_router([
	{
		path: "/blog/:slug",
		component: BlogPost,
		static: true,
		staticParams: async () => {
			const posts = await fetchAllPosts();
			return posts.map(post => ({ slug: post.slug }));
		},
	},
	{
		path: "/user/:id",
		component: User,
		static: true,
		staticParams: () => [
			{ id: "1" },
			{ id: "2" },
			{ id: "3" },
		],
	},
]);
```

`staticParams` can be sync or async, allowing you to fetch data from APIs, databases, or the filesystem at build time.

## Build configuration

Pass your routes to `build()` so the framework knows which routes to pre-render:

```typescript
// build.ts
import { build } from "bun-svelte-spa";
import { router } from "./src/router";

await build({
	outdir: "./dist",
	routes: router.routes,
});
```

## How it works

1. **Collection** — the build walks all routes and collects those with `static: true`
2. **Parameter expansion** — for dynamic routes, `staticParams()` is called to generate all concrete paths
3. **SSR compilation** — route components are compiled with the Svelte SSR plugin via `Bun.build()`
4. **Rendering** — each component is rendered to HTML using `svelte/server`'s `render()` function
5. **Injection** — the rendered HTML is injected into the `#root` element of your `index.html` template
6. **Asset rewriting** — relative asset paths (`./app.js`) are rewritten to root-relative (`/app.js`) so they work from subdirectories
7. **Output** — each route gets its own `index.html` file (e.g. `/about/index.html`)

## Output structure

Given routes `/`, `/about`, and `/blog/hello-world`:

```
dist/
├── index.html             # Pre-rendered /
├── about/
│   └── index.html         # Pre-rendered /about
├── blog/
│   └── hello-world/
│       └── index.html     # Pre-rendered /blog/hello-world
├── 200.html               # SPA fallback
├── 404.html
├── _chunks/
└── _assets/
```

Static pages include the full SPA bundle, so the app hydrates and becomes interactive after the initial static HTML loads.

## Layout support

If a static route has parent layout components (via nested routes), they are rendered as wrappers around the page content:

```typescript
export const router = create_router([
	{
		path: "/docs",
		component: DocsLayout,
		children: [
			{ path: "/intro", component: Intro, static: true },
			{ path: "/guide", component: Guide, static: true },
		],
	},
]);
```

Both `/docs/intro` and `/docs/guide` will be rendered inside `DocsLayout`.
