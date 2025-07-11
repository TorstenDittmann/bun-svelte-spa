import { serve } from "bun";
import app from "./app/app.html";

const server = serve({
	routes: {
		"/": app,
	},
	development: true,
});

console.log(`Listening on ${server.url}`);
