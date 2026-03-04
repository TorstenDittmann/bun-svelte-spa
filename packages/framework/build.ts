import { type BuildConfig, type BuildOutput } from "bun";
import { SveltePlugin } from "bun-plugin-svelte";
import type { Route } from "./runtime/router.svelte.ts";
import { collectStaticRoutes, generateStaticFiles } from "./static";

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(2)}s`;
}

function printBuildOutput(output: BuildOutput, outdir: string, duration: number): void {
	const outputs = output.outputs;

	// Group by type
	const entries: typeof outputs = [];
	const chunks: typeof outputs = [];
	const assets: typeof outputs = [];

	for (const file of outputs) {
		if (file.path.includes("/_chunks/")) {
			chunks.push(file);
		} else if (file.path.includes("/_assets/")) {
			assets.push(file);
		} else {
			entries.push(file);
		}
	}

	// Calculate total size
	let totalSize = 0;
	for (const file of outputs) {
		totalSize += file.size;
	}

	console.log();
	console.log(`\x1b[1m\x1b[32mBuild completed\x1b[0m in ${formatDuration(duration)}`);
	console.log();
	console.log(`\x1b[2m${outdir}/\x1b[0m`);

	// Print entries
	for (const file of entries) {
		const relativePath = file.path.replace(process.cwd() + "/" + outdir + "/", "");
		console.log(`  \x1b[36m${relativePath}\x1b[0m  ${formatBytes(file.size)}`);
	}

	// Print chunks
	if (chunks.length > 0) {
		for (const file of chunks) {
			const relativePath = file.path.replace(process.cwd() + "/" + outdir + "/", "");
			console.log(`  \x1b[33m${relativePath}\x1b[0m  ${formatBytes(file.size)}`);
		}
	}

	// Print assets
	if (assets.length > 0) {
		for (const file of assets) {
			const relativePath = file.path.replace(process.cwd() + "/" + outdir + "/", "");
			console.log(`  \x1b[35m${relativePath}\x1b[0m  ${formatBytes(file.size)}`);
		}
	}

	console.log();
	console.log(`\x1b[2mTotal: ${formatBytes(totalSize)} (${outputs.length} files)\x1b[0m`);
	console.log();
}

function printBuildErrors(output: BuildOutput): void {
	console.log();
	console.log(`\x1b[1m\x1b[31mBuild failed\x1b[0m`);
	console.log();
	for (const log of output.logs) {
		console.error(log);
	}
	console.log();
}

export type FrameworkBuildOptions = Partial<BuildConfig> & {
	/** Route definitions — needed only if any routes use `static: true` */
	routes?: readonly Route[];
};

export async function build(options: FrameworkBuildOptions) {
	const { routes, ...buildConfig } = options;
	const start = performance.now();

	const svelte_plugin = SveltePlugin();
	const plugins = buildConfig.plugins ? [svelte_plugin, ...buildConfig.plugins] : [svelte_plugin];

	const outdir = (buildConfig.outdir ?? "./dist").replace(/^\.\//, "");

	const build_output = await Bun.build({
		entrypoints: ["./src/index.html"],
		outdir,
		minify: true,
		target: "browser",
		splitting: true,
		naming: {
			entry: "[dir]/[name].[ext]",
			chunk: "_chunks/[name]-[hash].[ext]",
			asset: "_assets/[name]-[hash].[ext]",
		},
		...buildConfig,
		plugins,
	});

	const duration = Math.round(performance.now() - start);

	if (!build_output.success) {
		printBuildErrors(build_output);
		return build_output;
	}

	const index_html = Bun.file(`./${outdir}/index.html`);
	await Promise.all([
		Bun.write(`./${outdir}/200.html`, index_html),
		Bun.write(`./${outdir}/404.html`, index_html),
	]);

	// Static rendering phase
	if (routes) {
		const staticRoutes = await collectStaticRoutes(routes);
		if (staticRoutes.length > 0) {
			const staticStart = performance.now();
			const { paths } = await generateStaticFiles(staticRoutes, outdir);
			const staticDuration = Math.round(performance.now() - staticStart);

			if (paths.length > 0) {
				console.log();
				console.log(
					`\x1b[1m\x1b[32mStatic rendering\x1b[0m ${paths.length} page(s) in ${formatDuration(staticDuration)}`,
				);
				for (const p of paths) {
					console.log(`  \x1b[36m${p}\x1b[0m → ${p === "/" ? "index.html" : `${p.slice(1)}/index.html`}`);
				}
			}
		}
	}

	printBuildOutput(build_output, outdir, duration);

	return build_output;
}
