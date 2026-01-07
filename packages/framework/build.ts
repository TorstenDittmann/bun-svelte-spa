import { type BuildConfig } from "bun";
import { SveltePlugin } from "bun-plugin-svelte";

export async function build(options: Partial<BuildConfig>) {
	const svelte_plugin = SveltePlugin();
	const plugins = options.plugins ? [svelte_plugin, ...options.plugins] : [svelte_plugin];

	const build_output = await Bun.build({
		entrypoints: ["./src/index.html"],
		outdir: "./dist",
		minify: true,
		target: "browser",
		splitting: true,
		naming: {
			entry: "[dir]/[name].[ext]",
			chunk: "_chunks/[name]-[hash].[ext]",
			asset: "_assets/[name]-[hash].[ext]",
		},
		...options,
		plugins,
	});

	const index_html = Bun.file("./dist/index.html");
	await Promise.all([
		Bun.write("./dist/200.html", index_html),
		Bun.write("./dist/404.html", index_html),
	]);

	return build_output;
}
