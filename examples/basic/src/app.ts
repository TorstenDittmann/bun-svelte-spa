import { mount } from "svelte";
import App from "./app.svelte";

mount(App, {
	target: document.querySelector("#root")!,
});
