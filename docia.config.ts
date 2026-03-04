import { defineConfig } from "docia";

export default defineConfig({
	srcDir: "book",
	outDir: "dist",
	site: {
		title: "bun-svelte-spa",
		description: "A lightweight SPA framework for Svelte 5 and Bun.",
		language: "en",
	},
});
