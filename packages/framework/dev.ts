import { type HTMLBundle, serve } from "bun";

export function dev(config: { entrypoint: HTMLBundle; port?: number }) {
	const server = serve({
		routes: {
			"/*": config.entrypoint,
		},
		development: true,
		port: config.port ?? 1337,
	});

	console.log(`Listening on ${server.url}`);
}
