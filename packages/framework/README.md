# bun-svelte-spa

A lightweight Svelte SPA framework built for Bun runtime.

## Installation

```bash
bun add bun-svelte-spa
```

## Features

- Build Svelte applications with Bun's native speed
- Development server with hot reload
- Type-safe client-side router
- No build step required for development
- Production builds with automatic asset optimization

## Build API

### `build(options)`

Builds your Svelte application for production.

```typescript
import { build } from "bun-svelte-spa";

await build({
	entrypoints: ["./src/index.html"],
	outdir: "./dist",
});
```

**Options:**

- All standard Bun build options are supported
- Svelte plugin is automatically included
- Creates `200.html` and `404.html` for SPA routing

### `dev(entrypoint)`

Starts a development server with hot reload.

```typescript
import { dev } from "bun-svelte-spa";
import entrypoint from "./src/index.html";

dev(entrypoint);
```

## Runtime Router

Type-safe client-side routing for SPAs.

### Basic Setup

```typescript
import { create_goto, create_routes, Router } from "bun-svelte-spa/runtime";
import About from "./routes/about.svelte";
import Home from "./routes/home.svelte";

// Define routes
const routes = create_routes([
	{ path: "/", component: Home },
	{ path: "/about", component: About },
]);

// Create type-safe navigation
const goto = create_goto(routes);
```

### Using in Svelte

```svelte
<script>
	import { Router } from "bun-svelte-spa/runtime";
	import { goto, routes } from "./router.js";
</script>

<nav>
	<button onclick={() => goto("/")}>Home</button>
	<button onclick={() => goto("/about")}>About</button>
</nav>

<Router {routes} />
```

### Parameterized Routes

```typescript
const routes = create_routes([
	{ path: "/user/:id", component: UserProfile },
	{ path: "/post/:slug/edit", component: EditPost },
]);

const goto = create_goto(routes);

// Type-safe parameter passing
goto("/user/:id", { id: "123" });
goto("/post/:slug/edit", { slug: "hello-world" });
```

## Project Structure

```
my-app/
├── src/
│   ├── index.html
│   ├── app.ts
│   ├── app.svelte
│   ├── router.ts
│   └── routes/
│       ├── index.svelte
│       └── about.svelte
├── dev.ts
├── build.ts
└── package.json
```

## Example Files

**src/index.html:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./app.ts"></script>
</body>
</html>
```

**src/app.ts:**

```typescript
import { mount } from "svelte";
import App from "./app.svelte";

mount(App, {
	target: document.querySelector("#root")!,
});
```

**package.json scripts:**

```json
{
	"scripts": {
		"dev": "bun run dev.ts",
		"build": "bun run build.ts"
	}
}
```

## Requirements

- Bun runtime
- Svelte 5.0+

## License

MIT
