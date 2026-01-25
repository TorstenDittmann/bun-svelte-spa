import { type BuildConfig, type BuildOutput } from "bun";
import { SveltePlugin } from "bun-plugin-svelte";

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

export async function build(options: Partial<BuildConfig>) {
	const start = performance.now();

	const svelte_plugin = SveltePlugin();
	const plugins = options.plugins ? [svelte_plugin, ...options.plugins] : [svelte_plugin];

	const outdir = (options.outdir ?? "./dist").replace(/^\.\//, "");

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
		...options,
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

	printBuildOutput(build_output, outdir, duration);

	return build_output;
}
