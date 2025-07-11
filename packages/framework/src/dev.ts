import { type HTMLBundle, serve } from "bun";

export function dev(entrypoint: HTMLBundle) {
	const server = serve({
		routes: {
			"/*": entrypoint,
		},
		development: true,
	});

	console.log(`Listening on ${server.url}`);
}
