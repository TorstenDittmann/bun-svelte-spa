import { build } from "bun-svelte-spa";
import tailwind from "bun-plugin-tailwind";

await build({
	outdir: "./dist",
	plugins: [tailwind],
});
