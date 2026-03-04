import { hydrate, mount } from "svelte";
import App from "./app.svelte";

const target = document.querySelector("#root")!;
const hasPrerenderedContent = target.innerHTML.trim().length > 0;

if (hasPrerenderedContent) {
	hydrate(App, { target });
} else {
	mount(App, { target });
}
