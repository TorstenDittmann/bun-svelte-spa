import { mount } from "svelte";
import App from "./app.svelte";

console.log("🚀 Starting Svelte app with 5000 components...");
const startTime = Date.now();

const app = mount(App, {
	target: document.querySelector("#root")!,
});

const endTime = Date.now();
const mountTime = (endTime - startTime) / 1000;
console.log(`✅ App mounted in ${mountTime.toFixed(2)}s`);

export default app;