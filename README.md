# Svelte Bun Monorepo

A monorepo containing a simple Svelte framework for Bun and example applications.

## Structure

```
├── packages/
│   └── svelte-bun-framework/    # The core library
├── examples/
│   └── basic/                   # Basic example application
├── build.ts                     # Root build script
└── README.md                    # This file
```

## Getting Started

### Installation

```bash
bun install
```

This will install dependencies for all packages in the workspace.

### Building

```bash
# Build all packages
bun run build

# Build with watch mode
bun run dev
```

### Working with Packages

#### Library (`packages/svelte-bun-framework`)

The core Svelte framework for Bun. See the [library README](./packages/svelte-bun-framework/README.md) for detailed usage.

#### Examples (`examples/`)

Sample applications demonstrating the framework usage.

```bash
# Build the basic example
cd examples/basic
bun run build

# Run in development mode
bun run dev

# Serve the example (hot reload)
bun run serve
```

## Workspace Commands

```bash
# Install all dependencies
bun install

# Clean all build outputs
bun run clean

# Build all packages
bun run build

# Development mode (watch)
bun run dev
```

## Package Dependencies

The example applications depend on the library using workspace references:

```json
{
	"dependencies": {
		"svelte-bun-framework": "workspace:*"
	}
}
```

## Development

This monorepo uses Bun workspaces to manage packages and examples. The library in `packages/` contains the core framework, while `examples/` contains sample applications demonstrating usage. Each can be developed independently while sharing dependencies and maintaining consistent tooling.

## License

MIT
