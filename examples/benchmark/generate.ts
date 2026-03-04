// Generate 1000 svelte route files and a routes.ts
import { mkdirSync, writeFileSync } from "node:fs";

const count = 1000;
const routesDir = "./src/routes";

mkdirSync(routesDir, { recursive: true });

// Generate svelte components
for (let i = 0; i < count; i++) {
	const content = `<h1>Page ${i}</h1>\n<p>This is page number ${i} of ${count}.</p>\n`;
	writeFileSync(`${routesDir}/page-${i}.svelte`, content);
}

// Generate routes.ts
const imports = Array.from({ length: count }, (_, i) =>
	`\t{ path: "/page-${i}", component: () => import("./routes/page-${i}.svelte"), static: true },`
).join("\n");

const routesFile = `import type { Route } from "bun-svelte-spa/runtime";

export const routes = [
${imports}
] as const satisfies readonly Route[];
`;

writeFileSync("./src/routes.ts", routesFile);

console.log(`Generated ${count} route components and routes.ts`);
