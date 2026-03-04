import { build } from "bun-svelte-spa";
import { routes } from "./src/routes";

await build({ outdir: "./dist", routes });
