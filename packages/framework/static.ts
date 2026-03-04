import { SveltePlugin } from "bun-plugin-svelte";
import { rm } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import type { Route } from "./runtime/router.svelte.ts";

type ComponentOrLoader = Route["component"];

export type StaticRoute = {
	path: string;
	component: ComponentOrLoader;
	params: Record<string, string>;
	parents?: ComponentOrLoader[];
};

function interpolatePath(path: string, params: Record<string, string>): string {
	return path.replace(/:([^/]+)/g, (_, name) => {
		const value = params[name];
		if (value === undefined) throw new Error(`Missing param: ${name}`);
		return value;
	});
}

function joinPaths(base: string, path: string): string {
	if (path === "/") return base || "/";
	const combined = `${base}/${path}`.replace(/\/+/g, "/");
	return combined || "/";
}

async function walkRoutes(
	routes: readonly Route[],
	basePath = "",
	parents: ComponentOrLoader[] = [],
): Promise<StaticRoute[]> {
	const result: StaticRoute[] = [];

	for (const route of routes) {
		const fullPath = joinPaths(basePath, route.path);

		if (route.children) {
			const childParents = [...parents, route.component];
			result.push(...(await walkRoutes(route.children, fullPath, childParents)));
			continue;
		}

		if (!route.static) continue;

		const hasDynamicParams = fullPath.includes(":");

		if (hasDynamicParams) {
			if (!route.staticParams) {
				throw new Error(
					`Route "${fullPath}" has dynamic params but no staticParams function`,
				);
			}
			const paramSets = await route.staticParams();
			for (const params of paramSets) {
				const entry: StaticRoute = {
					path: interpolatePath(fullPath, params),
					component: route.component,
					params,
				};
				if (parents.length > 0) entry.parents = parents;
				result.push(entry);
			}
		} else {
			const entry: StaticRoute = {
				path: fullPath,
				component: route.component,
				params: {},
			};
			if (parents.length > 0) entry.parents = parents;
			result.push(entry);
		}
	}

	return result;
}

export async function collectStaticRoutes(routes: readonly Route[]): Promise<StaticRoute[]> {
	return walkRoutes(routes);
}

/**
 * Inject rendered HTML into the index.html template.
 * Uses Bun's HTMLRewriter for robust HTML transformation.
 */
export function injectIntoTemplate(
	template: string,
	bodyHtml: string,
	headHtml: string,
): string {
	const rewriter = new HTMLRewriter()
		// Rewrite relative asset paths to root-relative so they work from subdirectories
		.on("script[src], link[href]", {
			element(el) {
				for (const attr of ["src", "href"] as const) {
					const value = el.getAttribute(attr);
					if (value?.startsWith("./")) {
						el.setAttribute(attr, value.slice(1));
					}
				}
			},
		})
		// Inject body content into #root
		.on("#root", {
			element(el) {
				el.setInnerContent(bodyHtml, { html: true });
			},
		})
		// Inject head content before </head>
		.on("head", {
			element(el) {
				if (headHtml) {
					el.append(headHtml, { html: true });
				}
			},
		});

	return rewriter.transform(template);
}

/**
 * Resolve a component to its file path.
 * For lazy-loaded components, we extract the path from the import() expression.
 * For direct imports, the component is already compiled — but in the build script
 * context, .svelte files aren't compiled, so we need to handle the string case.
 */
function getComponentPath(component: ComponentOrLoader): string | null {
	if (typeof component === "string") {
		// Bun returns the file path as a string when importing .svelte without a plugin
		return component;
	}
	return null;
}

/**
 * Generate static HTML files for all static routes.
 * Compiles components for SSR using Bun.build with the Svelte plugin,
 * then renders each to HTML and injects into the template.
 */
export async function generateStaticFiles(
	staticRoutes: StaticRoute[],
	outdir: string,
): Promise<{ paths: string[] }> {
	if (staticRoutes.length === 0) return { paths: [] };

	// Read the template
	const templatePath = `${outdir}/index.html`;
	const template = await Bun.file(templatePath).text();

	// Collect unique component file paths that need SSR compilation
	const componentPathMap = new Map<string, string>(); // filePath -> ssrOutputPath
	const entrypoints: string[] = [];

	for (const route of staticRoutes) {
		let componentPath: string | null = null;

		// Try to resolve the component to a file path
		if (typeof route.component === "function" && route.component.length === 0) {
			// Lazy loader — call it to get the module (which in Bun without a plugin returns the path)
			try {
				const mod = await (route.component as () => Promise<any>)();
				if (typeof mod === "string") {
					componentPath = mod;
				} else if (mod?.default && typeof mod.default === "string") {
					componentPath = mod.default;
				} else if (mod?.default) {
					// Already a compiled component — shouldn't happen in build context
					componentPath = null;
				}
			} catch {
				// If import fails, try to get path from string representation
				componentPath = getComponentPath(route.component);
			}
		} else {
			componentPath = getComponentPath(route.component);
		}

		if (componentPath && !componentPathMap.has(componentPath)) {
			componentPathMap.set(componentPath, "");
			entrypoints.push(resolvePath(componentPath));
		}
	}

	// Build SSR bundle for all components
	const ssrOutdir = resolvePath(`${outdir}/.ssr-temp`);
	let ssrOutputMap = new Map<string, string>();

	if (entrypoints.length > 0) {
		const result = await Bun.build({
			entrypoints,
			outdir: ssrOutdir,
			target: "bun",
			plugins: [SveltePlugin()],
			splitting: false,
		});

		if (!result.success) {
			console.error("SSR build failed:");
			for (const log of result.logs) {
				console.error(log);
			}
			throw new Error("SSR build failed");
		}

		// Map entrypoint paths to their output paths
		for (const output of result.outputs) {
			if (output.kind === "entry-point") {
				const entryPath = entrypoints.find((ep) =>
					output.path.includes(ep.split("/").pop()!.replace(".svelte", ""))
				);
				if (entryPath) {
					ssrOutputMap.set(entryPath, output.path);
				}
			}
		}
	}

	const { render } = await import("svelte/server");
	const generatedPaths: string[] = [];

	for (const route of staticRoutes) {
		// Resolve the component to its SSR-compiled version
		let component: any;

		let componentPath: string | null = null;
		if (typeof route.component === "function" && route.component.length === 0) {
			try {
				const mod = await (route.component as () => Promise<any>)();
				if (typeof mod === "string") {
					componentPath = resolvePath(mod);
				} else if (mod?.default && typeof mod.default === "string") {
					componentPath = resolvePath(mod.default);
				}
			} catch {
				// ignore
			}
		} else if (typeof route.component === "string") {
			componentPath = resolvePath(route.component as string);
		}

		if (componentPath && ssrOutputMap.has(componentPath)) {
			const ssrPath = ssrOutputMap.get(componentPath)!;
			const ssrMod = await import(ssrPath);
			component = ssrMod.default;
		} else {
			// Fallback: component might already be compiled
			component = route.component;
		}

		// Use Svelte's render() to produce HTML
		const { body, head } = render(component, {
			props: { params: route.params },
		});

		const html = injectIntoTemplate(template, body, head);

		// Write to disk
		const filePath = route.path === "/"
			? `${outdir}/index.html`
			: `${outdir}${route.path}/index.html`;

		await Bun.write(filePath, html);
		generatedPaths.push(route.path);
	}

	// Clean up SSR temp files
	try {
		await rm(ssrOutdir, { recursive: true, force: true });
	} catch {
		// Ignore cleanup errors
	}

	return { paths: generatedPaths };
}
