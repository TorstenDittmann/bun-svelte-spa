import { build } from "bun";
import svelte_plugin from "./plugins/svelte.ts";

await build({
	entrypoints: ["./app/index.html"],
	outdir: "./dist",
	minify: true,
	plugins: [svelte_plugin],
});
