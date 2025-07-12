import { build } from "bun-svelte-spa";

console.log("🏗️  Starting stress test build with 5000 components...");
const startTime = Date.now();

await build({
	entrypoints: ["./src/index.html"],
	outdir: "./dist",
});

const endTime = Date.now();
const duration = (endTime - startTime) / 1000;

console.log(`✅ Build completed in ${duration.toFixed(2)}s`);
console.log(`📊 Build performance: ${(5000 / duration).toFixed(0)} components/second`);