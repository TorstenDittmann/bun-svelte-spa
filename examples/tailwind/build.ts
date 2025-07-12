import bunPluginTailwind from "bun-plugin-tailwind";
import { build } from "bun-svelte-spa";

await build({
	entrypoints: ["./src/index.html"],
	outdir: "./dist",
	plugins: [bunPluginTailwind],
});
