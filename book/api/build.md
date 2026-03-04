# Build API

## `build(options)`

Run a production build. Compiles Svelte components, bundles JavaScript, hashes assets, and optionally pre-renders static routes.

```typescript
import { build } from "bun-svelte-spa";

await build({
	outdir: "./dist",
});
```

### Options

`build()` accepts all [`Bun.BuildConfig`](https://bun.sh/docs/bundler) options plus:

| Option    | Type               | Default    | Description                            |
| --------- | ------------------ | ---------- | -------------------------------------- |
| `outdir`  | `string`           | `"./dist"` | Output directory                       |
| `routes`  | `readonly Route[]` | —          | Route definitions for static rendering |
| `plugins` | `BunPlugin[]`      | —          | Additional Bun plugins (e.g. Tailwind) |

The Svelte plugin is added automatically. You don't need to include it.

### With static rendering

```typescript
import { build } from "bun-svelte-spa";
import { router } from "./src/router";

await build({
	outdir: "./dist",
	routes: router.routes,
});
```

### With additional plugins

```typescript
import tailwindcss from "@tailwindcss/bun";
import { build } from "bun-svelte-spa";

await build({
	outdir: "./dist",
	plugins: [tailwindcss()],
});
```

### Return value

Returns the `BuildOutput` from `Bun.build()`. Check `output.success` for build status.

## `dev(config)`

Start a development server with hot reload.

```typescript
import { dev } from "bun-svelte-spa";
import entrypoint from "./src/index.html";

dev({ entrypoint });
```

### Options

| Option       | Type         | Default  | Description                                   |
| ------------ | ------------ | -------- | --------------------------------------------- |
| `entrypoint` | `HTMLBundle` | required | The HTML file imported with Bun's HTML import |
| `port`       | `number`     | `1337`   | Port to listen on                             |

The dev server uses Bun's native `serve()` with `development: true` for hot reload. All routes (`/*`) serve the HTML entrypoint, letting the client-side router handle routing.

## `collectStaticRoutes(routes)`

Collect all routes marked with `static: true`, expanding dynamic routes with `staticParams`.

```typescript
import { collectStaticRoutes } from "bun-svelte-spa";

const staticRoutes = await collectStaticRoutes(router.routes);
// [{ path: "/", component: Home, params: {} }, ...]
```

## `generateStaticFiles(staticRoutes, outdir)`

Generate static HTML files for pre-collected routes.

```typescript
import { generateStaticFiles } from "bun-svelte-spa";

const { paths } = await generateStaticFiles(staticRoutes, "./dist");
// paths: ["/", "/about", "/blog/hello-world"]
```

This is called internally by `build()` when `routes` is provided. Use these lower-level functions if you need custom control over the static rendering pipeline.
