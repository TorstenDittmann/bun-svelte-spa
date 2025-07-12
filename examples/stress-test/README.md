# Stress Test Example

This example generates 5000 Svelte components to test build performance with the Svelte Bun framework.

## Usage

1. Generate the components:

```bash
bun run generate
```

2. Build the project:

```bash
bun run build
```

3. Run in development mode:

```bash
bun run dev
```

## Scripts

- `bun run generate` - Generates 5000 Svelte components
- `bun run build` - Builds the project and measures build time
- `bun run dev` - Starts development server
- `bun run clean` - Removes generated components and build output

## Purpose

This example is designed purely for testing build performance. The UI is intentionally minimal with no styling to focus on compilation speed rather than runtime performance.

The generated components include variety in:

- Simple components
- Components with props
- Components with reactive state
- Components with events
- Components with slots

All components are generated without styling to minimize build complexity and focus on component compilation performance.
