import type { BunPlugin } from "bun";

const build_cache = new Map<string, string>();

export const svelte_plugin: BunPlugin = {
	name: "svelte loader",
	async setup(build) {
		const { compile } = await import("svelte/compiler");
		build.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
			const cached = build_cache.get(path);
			if (cached) {
				return {
					contents: cached,
					loader: "js",
				};
			}

			const file = await Bun.file(path).text();
			const contents = compile(file, {
				filename: path,
				generate: "client",
			}).js.code;

			build_cache.set(path, contents);

			return {
				contents,
				loader: "js",
			};
		});
	},
	target: "bun",
};
