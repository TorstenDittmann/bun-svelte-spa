# Get Started

A quick start guide to building Single Page Applications with Svelte 5 and Bun.

## Installation

### New Project from Template

Create a new project from the starter template:

```bash
# Create a new project
bunx giget gh:torstendittmann/bun-svelte-spa/packages/starter my-app
cd my-app

# Install dependencies and start developing
bun install
bun run dev
```

## Available Commands

The starter template includes these scripts:

```bash
# Start development server with hot reload
bun run dev

# Build for production
bun run build

# Format code
bun run format

# Lint code
bun run lint

# Fix linting issues
bun run lint:fix
```

- **Type-safe routing** with TypeScript support
- **Hot reload** in development mode
- **Production builds** with Svelte compilation
- **Query management** with caching and invalidation
- **Route parameters** with automatic extraction
- **Query parameters** with reactive stores
- **Navigation guards** with before/after hooks

## Requirements

- Bun runtime
- Svelte 5.0+
- TypeScript 5+

## Next Steps

- Learn about [Routing](./routing.md)
- Explore [Navigation](./navigation.md)
- Understand [Queries](./queries.md)
