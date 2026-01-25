import { beforeEach, describe, expect, it } from "bun:test";
import type { Component } from "svelte";
import { get } from "svelte/store";
import { create_router, RouterInstance } from "./router.ts";

// Mock Svelte components for testing
const MockRoute = {} as Component;
const MockLayout = {} as Component;
const MockDashboardIndex = {} as Component;
const MockDashboardSettings = {} as Component;
const MockAdminLayout = {} as Component;
const MockReportsLayout = {} as Component;
const MockReportsIndex = {} as Component;

describe("router", () => {
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
			expect(result.route?.path).toBe("/");
			expect(result.route?.component).toBe(MockRoute);
			expect(result.route?.parents).toEqual([]);
			expect(result.params).toEqual({});
		});

		it("should match static routes with trailing paths", () => {
			const result = router.match("/about");
			expect(result.route?.path).toBe("/about");
			expect(result.route?.component).toBe(MockRoute);
			expect(result.route?.parents).toEqual([]);
			expect(result.params).toEqual({});
		});

		it("should match routes with single parameter", () => {
			const result = router.match("/user/123");
			expect(result.route?.path).toBe("/user/:id");
			expect(result.route?.component).toBe(MockRoute);
			expect(result.route?.parents).toEqual([]);
			expect(result.params).toEqual({ id: "123" });
		});

		it("should match routes with multiple segments and parameter", () => {
			const result = router.match("/user/456/posts");
			expect(result.route?.path).toBe("/user/:id/posts");
			expect(result.route?.component).toBe(MockRoute);
			expect(result.route?.parents).toEqual([]);
			expect(result.params).toEqual({ id: "456" });
		});

		it("should return null for non-matching routes", () => {
			const result = router.match("/nonexistent");
			expect(result.route).toBe(null);
			expect(result.params).toEqual({});
		});

		it("should handle parameters with special characters", () => {
			const result = router.match("/user/user-123_test/posts");
			expect(result.route?.path).toBe("/user/:id/posts");
			expect(result.route?.component).toBe(MockRoute);
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

		it("should update current store when updateRoute is called", async () => {
			global.window.location.pathname = "/user/123";

			await router.updateRoute();

			const state = get(router.current);
			expect(state.route?.path).toBe("/user/:id");
			expect(state.route?.component).toBe(MockRoute);
			expect(state.route?.parents).toEqual([]);
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

	describe("query params", () => {
		beforeEach(() => {
			global.window = {
				location: {
					pathname: "/test",
					search: "?search=foo&page=2&tags=a&tags=b",
				},
				history: {
					pushState: () => {},
					replaceState: () => {},
				},
			} as any;
		});

		it("should have a queryParams store", () => {
			expect(router.queryParams).toBeDefined();
		});

		it("should get single query param value", () => {
			const params = get(router.queryParams);
			expect(params.get("search")).toBe("foo");
			expect(params.get("page")).toBe("2");
		});

		it("should return null for missing query param", () => {
			const params = get(router.queryParams);
			expect(params.get("nonexistent")).toBe(null);
		});

		it("should get all values for repeated query param", () => {
			const params = get(router.queryParams);
			expect(params.getAll("tags")).toEqual(["a", "b"]);
		});

		it("should check if query param exists", () => {
			const params = get(router.queryParams);
			expect(params.has("search")).toBe(true);
			expect(params.has("nonexistent")).toBe(false);
		});

		it("should convert to string", () => {
			const params = get(router.queryParams);
			expect(params.toString()).toBe("search=foo&page=2&tags=a&tags=b");
		});
	});

	describe("setQueryParams", () => {
		let mockPushState: { called: boolean; args: any[] | null };
		let mockReplaceState: { called: boolean; args: any[] | null };
		let currentSearch: string;

		beforeEach(() => {
			currentSearch = "";
			mockPushState = { called: false, args: null };
			mockReplaceState = { called: false, args: null };
			global.window = {
				location: {
					pathname: "/test",
					get search() {
						return currentSearch;
					},
				},
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

		it("should set a single query param", () => {
			router.setQueryParams({ search: "bar" });

			expect(mockPushState.called).toBe(true);
			expect(mockPushState.args?.[2]).toBe("/test?search=bar");
		});

		it("should set multiple query params", () => {
			router.setQueryParams({ search: "bar", page: "1" });

			expect(mockPushState.called).toBe(true);
			expect(mockPushState.args?.[2]).toBe("/test?search=bar&page=1");
		});

		it("should remove query param when value is null", () => {
			currentSearch = "?search=foo&page=2";
			router.setQueryParams({ search: null });

			expect(mockPushState.args?.[2]).toBe("/test?page=2");
		});

		it("should set array values for query param", () => {
			router.setQueryParams({ tags: ["a", "b", "c"] });

			expect(mockPushState.args?.[2]).toBe("/test?tags=a&tags=b&tags=c");
		});

		it("should use replaceState when replace option is true", () => {
			router.setQueryParams({ search: "bar" }, { replace: true });

			expect(mockReplaceState.called).toBe(true);
			expect(mockPushState.called).toBe(false);
		});

		it("should remove query string from URL when all params are cleared", () => {
			currentSearch = "?search=foo";
			router.setQueryParams({ search: null });

			expect(mockPushState.args?.[2]).toBe("/test");
		});
	});

	describe("isActive", () => {
		beforeEach(async () => {
			global.window = {
				location: {
					pathname: "/users/123",
					search: "",
				},
				history: {
					pushState: () => {},
					replaceState: () => {},
				},
			} as any;
			await router.updateRoute();
		});

		it("should return true for exact match", async () => {
			global.window.location.pathname = "/about";
			await router.updateRoute();

			expect(router.isActive("/about")).toBe(true);
			expect(router.isActive("/about", { exact: true })).toBe(true);
		});

		it("should return true for prefix match without exact option", async () => {
			global.window.location.pathname = "/user/123";
			await router.updateRoute();

			expect(router.isActive("/user")).toBe(true);
		});

		it("should return false for prefix match with exact option", async () => {
			global.window.location.pathname = "/user/123";
			await router.updateRoute();

			expect(router.isActive("/user", { exact: true })).toBe(false);
		});

		it("should return false for non-matching path", async () => {
			global.window.location.pathname = "/about";
			await router.updateRoute();

			expect(router.isActive("/users")).toBe(false);
		});

		it("should handle root path correctly", async () => {
			global.window.location.pathname = "/";
			await router.updateRoute();

			expect(router.isActive("/")).toBe(true);
			expect(router.isActive("/", { exact: true })).toBe(true);
		});
	});

	describe("navigation events", () => {
		let mockPushState: { called: boolean; args: any[] | null };

		beforeEach(() => {
			mockPushState = { called: false, args: null };
			global.window = {
				location: {
					pathname: "/",
					search: "",
				},
				history: {
					pushState: (...args: any[]) => {
						mockPushState.called = true;
						mockPushState.args = args;
						global.window.location.pathname = args[2] as string;
					},
					replaceState: () => {},
				},
			} as any;
			router.updateRoute();
		});

		it("should call beforeNavigate callback before navigation", async () => {
			const calls: any[] = [];

			router.beforeNavigate(({ from, to, type }) => {
				calls.push({ from: from.path, to: to.path, type });
			});

			await router.navigate("/about");

			expect(calls.length).toBe(1);
			expect(calls[0]).toEqual({ from: "/", to: "/about", type: "goto" });
		});

		it("should cancel navigation when cancel is called", async () => {
			router.beforeNavigate(({ cancel }) => {
				cancel();
			});

			await router.navigate("/about");

			expect(mockPushState.called).toBe(false);
			expect(get(router.current).path).toBe("/");
		});

		it("should call afterNavigate callback after navigation", async () => {
			const calls: any[] = [];

			router.afterNavigate(({ from, to, type }) => {
				calls.push({ from: from.path, to: to.path, type });
			});

			await router.navigate("/about");

			expect(calls.length).toBe(1);
			expect(calls[0]).toEqual({ from: "/", to: "/about", type: "goto" });
		});

		it("should return unsubscribe function for beforeNavigate", async () => {
			let callCount = 0;

			const unsubscribe = router.beforeNavigate(() => {
				callCount++;
			});

			await router.navigate("/about");
			expect(callCount).toBe(1);

			unsubscribe();

			await router.navigate("/");
			expect(callCount).toBe(1); // Should not increment
		});

		it("should return unsubscribe function for afterNavigate", async () => {
			let callCount = 0;

			const unsubscribe = router.afterNavigate(() => {
				callCount++;
			});

			await router.navigate("/about");
			expect(callCount).toBe(1);

			unsubscribe();

			await router.navigate("/");
			expect(callCount).toBe(1); // Should not increment
		});

		it("should pass correct navigation type", async () => {
			const types: string[] = [];

			router.afterNavigate(({ type }) => {
				types.push(type);
			});

			await router.navigate("/about", false, "link");
			await router.navigate("/", false, "popstate");
			await router.navigate("/about", false, "goto");

			expect(types).toEqual(["link", "popstate", "goto"]);
		});
	});
});

describe("nested routes", () => {
	const nestedRoutes = [
		{ path: "/", component: MockRoute },
		{
			path: "/dashboard",
			component: MockLayout,
			children: [
				{ path: "/", component: MockDashboardIndex },
				{ path: "/settings", component: MockDashboardSettings },
			],
		},
		{
			path: "/admin",
			component: MockAdminLayout,
			children: [
				{
					path: "/reports",
					component: MockReportsLayout,
					children: [{ path: "/", component: MockReportsIndex }],
				},
			],
		},
	] as const;

	let router: RouterInstance<typeof nestedRoutes>;

	beforeEach(() => {
		router = create_router(nestedRoutes);
	});

	describe("route flattening", () => {
		it("should flatten nested routes correctly", () => {
			// /dashboard -> /dashboard/ with Layout as parent
			const dashboardIndex = router.match("/dashboard");
			expect(dashboardIndex.route?.path).toBe("/dashboard");
			expect(dashboardIndex.route?.component).toBe(MockDashboardIndex);
			expect(dashboardIndex.route?.parents).toEqual([MockLayout]);
		});

		it("should flatten nested settings route", () => {
			const settings = router.match("/dashboard/settings");
			expect(settings.route?.path).toBe("/dashboard/settings");
			expect(settings.route?.component).toBe(MockDashboardSettings);
			expect(settings.route?.parents).toEqual([MockLayout]);
		});

		it("should handle deeply nested routes", () => {
			const reportsIndex = router.match("/admin/reports");
			expect(reportsIndex.route?.path).toBe("/admin/reports");
			expect(reportsIndex.route?.component).toBe(MockReportsIndex);
			expect(reportsIndex.route?.parents).toEqual([MockAdminLayout, MockReportsLayout]);
		});

		it("should still match root route without parents", () => {
			const root = router.match("/");
			expect(root.route?.path).toBe("/");
			expect(root.route?.component).toBe(MockRoute);
			expect(root.route?.parents).toEqual([]);
		});
	});

	describe("resolved routes with parents", () => {
		let mockPushState: { called: boolean; args: any[] | null };

		beforeEach(() => {
			mockPushState = { called: false, args: null };
			global.window = {
				location: { pathname: "/dashboard", search: "" },
				history: {
					pushState: (...args: any[]) => {
						mockPushState.called = true;
						mockPushState.args = args;
						global.window.location.pathname = args[2] as string;
					},
					replaceState: () => {},
				},
			} as any;
		});

		it("should resolve parent components when updateRoute is called", async () => {
			await router.updateRoute();

			const state = get(router.current);
			expect(state.route?.path).toBe("/dashboard");
			expect(state.route?.component).toBe(MockDashboardIndex);
			expect(state.route?.parents).toEqual([MockLayout]);
		});

		it("should resolve deeply nested parent components", async () => {
			global.window.location.pathname = "/admin/reports";
			await router.updateRoute();

			const state = get(router.current);
			expect(state.route?.path).toBe("/admin/reports");
			expect(state.route?.component).toBe(MockReportsIndex);
			expect(state.route?.parents).toEqual([MockAdminLayout, MockReportsLayout]);
		});
	});
});
