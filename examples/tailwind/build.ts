import tailwind from "bun-plugin-tailwind";
import { build } from "bun-svelte-spa";

await build({
	outdir: "./dist",
	plugins: [tailwind],
});
