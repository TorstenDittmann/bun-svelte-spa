import { build } from "bun-svelte-spa";

await build({
	entrypoints: ["./src/index.html"],
	outdir: "./dist",
});
