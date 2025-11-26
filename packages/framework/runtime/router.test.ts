import { beforeEach, describe, expect, it } from "bun:test";
import { get } from "svelte/store";
import { create_router, RouterInstance } from "./router.ts";

// Mock Svelte components for testing
const MockRoute = {} as any;

describe("Router with radix3 integration", () => {
	const routes = [
		{
			path: "/",
			component: MockRoute,
		},
		{
			path: "/about",
			component: MockRoute,
		},
		{
			path: "/user/:id",
			component: MockRoute,
		},
		{
			path: "/user/:id/posts",
			component: MockRoute,
		},
	] as const;

	let router: RouterInstance<typeof routes>;

	beforeEach(() => {
		router = create_router(routes);
	});

	describe("route matching", () => {
		it("should match exact static routes", () => {
			const result = router.match("/");
			expect(result.route).toBe(routes[0]);
			expect(result.params).toEqual({});
		});

		it("should match static routes with trailing paths", () => {
			const result = router.match("/about");
			expect(result.route).toBe(routes[1]);
			expect(result.params).toEqual({});
		});

		it("should match routes with single parameter", () => {
			const result = router.match("/user/123");
			expect(result.route).toEqual(routes[2]);
			expect(result.params).toEqual({ id: "123" });
		});

		it("should match routes with multiple segments and parameter", () => {
			const result = router.match("/user/456/posts");
			expect(result.route).toEqual(routes[3]);
			expect(result.params).toEqual({ id: "456" });
		});

		it("should return null for non-matching routes", () => {
			const result = router.match("/nonexistent");
			expect(result.route).toBe(null);
			expect(result.params).toEqual({});
		});

		it("should handle parameters with special characters", () => {
			const result = router.match("/user/user-123_test/posts");
			expect(result.route).toEqual(routes[3]);
			expect(result.params).toEqual({ id: "user-123_test" });
		});
	});

	describe("path resolution", () => {
		it("should resolve static paths", () => {
			const path = router.resolve("/");
			expect(path).toBe("/");
		});

		it("should resolve paths with parameters", () => {
			const path = router.resolve("/user/:id", { id: "123" });
			expect(path).toBe("/user/123");
		});

		it("should resolve nested paths with parameters", () => {
			const path = router.resolve("/user/:id/posts", { id: "456" });
			expect(path).toBe("/user/456/posts");
		});

		it("should throw error for missing parameters", () => {
			expect(() => {
				// @ts-expect-error - intentionally missing required parameter
				router.resolve("/user/:id");
			}).toThrow("Missing parameters for path: /user/:id");
		});
	});

	describe("navigation and store", () => {
		// Mock window objects for navigation tests
		let mockPushState: any;
		let mockReplaceState: any;

		beforeEach(() => {
			mockPushState = { called: false, args: null };
			mockReplaceState = { called: false, args: null };
			global.window = {
				location: { pathname: "/test" },
				history: {
					pushState: (...args: any[]) => {
						mockPushState.called = true;
						mockPushState.args = args;
					},
					replaceState: (...args: any[]) => {
						mockReplaceState.called = true;
						mockReplaceState.args = args;
					},
				},
			} as any;
		});

		it("should have a current store", () => {
			const currentStore = router.current;
			expect(currentStore).toBeDefined();

			// Initial state should be set
			const initialState = get(currentStore);
			expect(initialState).toEqual({
				route: null,
				params: {},
				path: "",
			});
		});

		it("should update current store when updateRoute is called", () => {
			global.window.location.pathname = "/user/123";

			router.updateRoute();

			const state = get(router.current);
			expect(state.route).toEqual(routes[2]); // user route
			expect(state.params).toEqual({ id: "123" });
			expect(state.path).toBe("/user/123");
		});

		it("should navigate and update route", () => {
			router.navigate("/user/456");

			expect(mockPushState.called).toBe(true);
			expect(mockPushState.args).toEqual([{}, "", "/user/456"]);
		});

		it("should replace history when navigate called with replace=true", () => {
			router.navigate("/about", true);

			expect(mockReplaceState.called).toBe(true);
			expect(mockReplaceState.args).toEqual([{}, "", "/about"]);
		});
	});

	describe("destructuring pattern", () => {
		it("should work with destructuring pattern", () => {
			const { routes: testRoutes, resolve } = create_router(routes);

			// Test routes property
			expect(testRoutes).toBe(routes);
			expect(testRoutes.length).toBe(4);

			// Test resolve function works when destructured
			const path1 = resolve("/");
			const path2 = resolve("/about");
			const path3 = resolve("/user/:id", { id: "123" });
			const path4 = resolve("/user/:id/posts", { id: "123" });

			expect(path1).toBe("/");
			expect(path2).toBe("/about");
			expect(path3).toBe("/user/123");
			expect(path4).toBe("/user/123/posts");
		});
	});

	describe("router instance", () => {
		it("should maintain routes property", () => {
			expect(router.routes).toBe(routes);
			expect(router.routes.length).toBe(4);
		});
	});
});
