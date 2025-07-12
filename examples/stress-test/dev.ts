import { dev } from "bun-svelte-spa";
import entrypoint from "./src/index.html";

console.log("🚀 Starting development server for stress test with 5000 components...");
console.log("📝 Note: Initial compilation may take longer due to the large number of components");

dev(entrypoint);