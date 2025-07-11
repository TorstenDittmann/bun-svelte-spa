# Svelte Bun Framework

A simple and lightweight framework for building Svelte applications with Bun.

## Installation

```bash
bun add svelte-bun-framework
```

## Usage

### Basic Plugin Usage

```typescript
import { sveltePlugin } from "svelte-bun-framework";

// Use with Bun's build API
await Bun.build({
	entrypoints: ["./src/app.ts"],
	outdir: "./dist",
	plugins: [sveltePlugin],
});
```

### Using the Build Helper

```typescript
import { buildSvelte } from "svelte-bun-framework";

// Build with sensible defaults
await buildSvelte({
	entrypoints: ["./src/app.ts"],
	outdir: "./dist",
	minify: true,
});
```

### Default Import

```typescript
import sveltePlugin from "svelte-bun-framework";

// Same as importing { sveltePlugin }
await Bun.build({
	entrypoints: ["./src/app.ts"],
	outdir: "./dist",
	plugins: [sveltePlugin],
});
```

> **Note**: No build step is required! Bun runs TypeScript directly, so you can import and use the library immediately.

## API

### `sveltePlugin`

A Bun plugin that compiles `.svelte` files. Includes build caching for better performance.

### `buildSvelte(options: BuildOptions)`

A convenience function that builds your Svelte application with the plugin included.

**Options:**

- `entrypoints: string[]` - Array of entry point files
- `outdir: string` - Output directory
- `minify?: boolean` - Whether to minify the output (default: true)
- `plugins?: BunPlugin[]` - Additional plugins to include

### `clearCache()`

Clears the internal build cache.

## Example Project Structure

```
my-app/
├── src/
│   ├── app.ts
│   ├── App.svelte
│   └── components/
│       └── Counter.svelte
├── dist/
├── package.json
└── build.ts
```

**src/app.ts:**

```typescript
import { mount } from "svelte";
import App from "./App.svelte";

mount(App, {
	target: document.body,
});
```

**build.ts:**

```typescript
import { buildSvelte } from "svelte-bun-framework";

await buildSvelte({
	entrypoints: ["./src/app.ts"],
	outdir: "./dist",
});
```

## Requirements

- Bun runtime
- Svelte 5.0+

## License

MIT
