import { build } from "svelte-bun-framework";

await build({
	entrypoints: ["./src/index.html"],
	outdir: "./dist",
	minify: true,
});
