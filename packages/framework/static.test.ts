import { describe, expect, it } from "bun:test";
import type { Component } from "svelte";
import { collectStaticRoutes, injectIntoTemplate } from "./static";

const MockComponent = {} as Component;

describe("collectStaticRoutes", () => {
	it("should return empty array when no routes are static", async () => {
		const routes = [
			{ path: "/", component: MockComponent },
			{ path: "/about", component: MockComponent },
		];
		const result = await collectStaticRoutes(routes);
		expect(result).toEqual([]);
	});

	it("should collect static routes without params", async () => {
		const routes = [
			{ path: "/", component: MockComponent },
			{ path: "/about", component: MockComponent, static: true as const },
		];
		const result = await collectStaticRoutes(routes);
		expect(result).toEqual([
			{ path: "/about", component: MockComponent, params: {} },
		]);
	});

	it("should expand staticParams for dynamic routes", async () => {
		const routes = [
			{
				path: "/blog/:slug",
				component: MockComponent,
				static: true as const,
				staticParams: () => [{ slug: "hello" }, { slug: "world" }],
			},
		];
		const result = await collectStaticRoutes(routes);
		expect(result).toEqual([
			{ path: "/blog/hello", component: MockComponent, params: { slug: "hello" } },
			{ path: "/blog/world", component: MockComponent, params: { slug: "world" } },
		]);
	});

	it("should support async staticParams", async () => {
		const routes = [
			{
				path: "/post/:id",
				component: MockComponent,
				static: true as const,
				staticParams: async () => [{ id: "1" }, { id: "2" }],
			},
		];
		const result = await collectStaticRoutes(routes);
		expect(result).toEqual([
			{ path: "/post/1", component: MockComponent, params: { id: "1" } },
			{ path: "/post/2", component: MockComponent, params: { id: "2" } },
		]);
	});

	it("should throw when dynamic route lacks staticParams", async () => {
		const routes = [
			{
				path: "/blog/:slug",
				component: MockComponent,
				static: true as const,
			},
		];
		expect(collectStaticRoutes(routes)).rejects.toThrow(
			"Route \"/blog/:slug\" has dynamic params but no staticParams function",
		);
	});

	it("should collect static routes from nested children", async () => {
		const MockLayout = {} as Component;
		const routes = [
			{
				path: "/docs",
				component: MockLayout,
				children: [
					{ path: "/", component: MockComponent, static: true as const },
					{ path: "/api", component: MockComponent, static: true as const },
				],
			},
		];
		const result = await collectStaticRoutes(routes);
		expect(result).toEqual([
			{ path: "/docs", component: MockComponent, params: {}, parents: [MockLayout] },
			{ path: "/docs/api", component: MockComponent, params: {}, parents: [MockLayout] },
		]);
	});
});

describe("injectIntoTemplate", () => {
	const template = `<!DOCTYPE html>
<html>
	<head>
		<title>Test</title>
	</head>
	<body>
		<div id="root"></div>
	</body>
</html>`;

	it("should inject body HTML into #root", () => {
		const result = injectIntoTemplate(template, "<h1>Hello</h1>", "");
		expect(result).toContain("<div id=\"root\"><h1>Hello</h1></div>");
	});

	it("should inject head HTML before </head>", () => {
		const result = injectIntoTemplate(template, "", "<style>.a{}</style>");
		expect(result).toContain("<style>.a{}</style></head>");
	});

	it("should inject both body and head", () => {
		const result = injectIntoTemplate(template, "<p>Content</p>", "<meta name='x'>");
		expect(result).toContain("<div id=\"root\"><p>Content</p></div>");
		expect(result).toContain("<meta name='x'></head>");
	});

	it("should handle #root with extra attributes", () => {
		const tmpl = "<div data-layout=\"website\" id=\"root\"></div>";
		const result = injectIntoTemplate(tmpl, "<p>Hi</p>", "");
		expect(result).toContain("<div data-layout=\"website\" id=\"root\"><p>Hi</p></div>");
	});

	it("should rewrite relative asset paths to root-relative", () => {
		const tmpl =
			`<head><link rel="stylesheet" href="./_chunks/index-abc.css"><script src="./_chunks/app-def.js"></script></head><body><div id="root"></div></body>`;
		const result = injectIntoTemplate(tmpl, "<p>Hi</p>", "");
		expect(result).toContain("href=\"/_chunks/index-abc.css\"");
		expect(result).toContain("src=\"/_chunks/app-def.js\"");
	});
});
