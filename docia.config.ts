import { defineConfig } from "docia";

export default defineConfig({
	srcDir: "book",
	outDir: "dist",
	basePath: "/bun-svelte-spa/",
	site: {
		title: "bun-svelte-spa",
		description: "A lightweight SPA framework for Svelte 5 and Bun.",
		language: "en",
		url: "https://torstendittmann.github.io/bun-svelte-spa",
		socials: {
			github: "https://github.com/TorstenDittmann/bun-svelte-spa",
		},
		githubEditBranch: "main",
		githubEditPath: "book",
	},
});
