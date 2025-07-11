import { build as bun_build, type BuildConfig } from "bun";
import { svelte_plugin } from "./plugin";

export async function build(options: BuildConfig) {
	const plugins = options.plugins
		? [svelte_plugin, ...options.plugins]
		: [svelte_plugin];

	return bun_build({
		entrypoints: options.entrypoints,
		outdir: options.outdir,
		minify: options.minify ?? true,
		plugins,
	});
}
