import { beforeEach, describe, expect, it } from "bun:test";
import { createMutation, createQuery, invalidateQueries, queryCache } from "./query.svelte.ts";

describe("query", () => {
	beforeEach(() => {
		queryCache.clear();
	});

	describe("createQuery", () => {
		it("should start in loading state", () => {
			const query = createQuery({
				key: ["test"],
				fn: () => Promise.resolve("data"),
			});

			expect(query.status).toBe("pending");
			expect(query.data).toBe(undefined);
		});

		it("should fetch data and update state on success", async () => {
			const query = createQuery({
				key: ["test"],
				fn: () => Promise.resolve("test data"),
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(query.data).toBe("test data");
			expect(query.status).toBe("success");
			expect(query.isSuccess).toBe(true);
		});

		it("should handle errors", async () => {
			const query = createQuery({
				key: ["error-test"],
				fn: () => Promise.reject(new Error("fetch failed")),
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(query.error?.message).toBe("fetch failed");
			expect(query.isError).toBe(true);
			expect(query.status).toBe("error");
		});

		it("should call onSuccess callback", async () => {
			let successData: string | undefined;

			createQuery({
				key: ["success-callback"],
				fn: () => Promise.resolve("callback data"),
				onSuccess: (data) => {
					successData = data;
				},
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(successData).toBe("callback data");
		});

		it("should call onError callback", async () => {
			let errorMessage: string | undefined;

			createQuery({
				key: ["error-callback"],
				fn: () => Promise.reject(new Error("error callback test")),
				onError: (error) => {
					errorMessage = error.message;
				},
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(errorMessage).toBe("error callback test");
		});

		it("should use cached data when not stale", async () => {
			let fetchCount = 0;

			const fn = () => {
				fetchCount++;
				return Promise.resolve(`data ${fetchCount}`);
			};

			const query1 = createQuery({
				key: ["cached"],
				fn,
				staleTime: 10000,
			});

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(query1.data).toBe("data 1");

			// Create another query with same key
			const query2 = createQuery({
				key: ["cached"],
				fn,
				staleTime: 10000,
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			// Should use cached data
			expect(query2.data).toBe("data 1");
			expect(fetchCount).toBe(1);
		});

		it("should refetch when invalidated", async () => {
			let fetchCount = 0;

			const query = createQuery({
				key: ["invalidate-test"],
				fn: () => {
					fetchCount++;
					return Promise.resolve(`data ${fetchCount}`);
				},
				staleTime: 10000,
			});

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(query.data).toBe("data 1");

			query.invalidate();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(query.data).toBe("data 2");
			expect(fetchCount).toBe(2);
		});

		it("should refetch when refetch is called", async () => {
			let fetchCount = 0;

			const query = createQuery({
				key: ["refetch-test"],
				fn: () => {
					fetchCount++;
					return Promise.resolve(`data ${fetchCount}`);
				},
			});

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(query.data).toBe("data 1");

			await query.refetch();

			expect(query.data).toBe("data 2");
			expect(fetchCount).toBe(2);
		});

		it("should not fetch when enabled is false", async () => {
			let fetchCount = 0;

			const query = createQuery({
				key: ["disabled"],
				fn: () => {
					fetchCount++;
					return Promise.resolve("data");
				},
				enabled: false,
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(fetchCount).toBe(0);
			expect(query.data).toBe(undefined);
		});

		it("should use static params", async () => {
			let receivedParams: number | undefined;

			const query = createQuery({
				key: ["static-params"],
				fn: (id: number) => {
					receivedParams = id;
					return Promise.resolve(`user-${id}`);
				},
				params: () => 123,
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(receivedParams).toBe(123);
			expect(query.data).toBe("user-123");
		});

		it("should generate dynamic key from params", async () => {
			let fetchCount = 0;

			const query = createQuery({
				key: (id: number) => ["user", id],
				fn: (id: number) => {
					fetchCount++;
					return Promise.resolve(`user-${id}`);
				},
				params: () => 1,
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(fetchCount).toBe(1);
			expect(query.data).toBe("user-1");
		});
	});

	describe("createMutation", () => {
		it("should start in idle state", () => {
			const mutation = createMutation({
				fn: (data: string) => Promise.resolve(data),
			});

			expect(mutation.isLoading).toBe(false);
			expect(mutation.status).toBe("pending");
		});

		it("should update state during mutation", async () => {
			const mutation = createMutation({
				fn: async (data: string) => {
					await new Promise((resolve) => setTimeout(resolve, 10));
					return data.toUpperCase();
				},
			});

			const promise = mutation.mutate("test");

			expect(mutation.status).toBe("pending");

			await promise;

			expect(mutation.isLoading).toBe(false);
			expect(mutation.data).toBe("TEST");
			expect(mutation.isSuccess).toBe(true);
		});

		it("should handle mutation errors", async () => {
			const mutation = createMutation({
				fn: () => Promise.reject(new Error("mutation failed")),
			});

			await mutation.mutate(undefined);

			expect(mutation.error?.message).toBe("mutation failed");
			expect(mutation.isError).toBe(true);
		});

		it("should call onSuccess callback", async () => {
			let successData: string | undefined;
			let successVariables: string | undefined;

			const mutation = createMutation({
				fn: (data: string) => Promise.resolve(data.toUpperCase()),
				onSuccess: (data, variables) => {
					successData = data;
					successVariables = variables;
				},
			});

			await mutation.mutate("test");

			expect(successData).toBe("TEST");
			expect(successVariables).toBe("test");
		});

		it("should call onError callback", async () => {
			let errorMessage: string | undefined;
			let errorVariables: string | undefined;

			const mutation = createMutation({
				fn: () => Promise.reject(new Error("error test")),
				onError: (error, variables) => {
					errorMessage = error.message;
					errorVariables = variables;
				},
			});

			await mutation.mutate("test");

			expect(errorMessage).toBe("error test");
			expect(errorVariables).toBe("test");
		});

		it("should call onSettled callback on success", async () => {
			let settledData: string | undefined;
			let settledError: Error | null = new Error("not called");

			const mutation = createMutation({
				fn: (data: string) => Promise.resolve(data),
				onSettled: (data, error) => {
					settledData = data;
					settledError = error;
				},
			});

			await mutation.mutate("test");

			expect(settledData).toBe("test");
			expect(settledError).toBe(null);
		});

		it("should call onSettled callback on error", async () => {
			let settledData: string | undefined;
			let settledError: Error | null = null;

			const mutation = createMutation<string, string>({
				fn: () => Promise.reject(new Error("settled error")),
				onSettled: (data, error) => {
					settledData = data;
					settledError = error;
				},
			});

			await mutation.mutate("test");

			expect(settledData).toBe(undefined);
			expect(settledError?.message).toBe("settled error");
		});

		it("should reset mutation state", async () => {
			const mutation = createMutation({
				fn: (data: string) => Promise.resolve(data),
			});

			await mutation.mutate("test");
			expect(mutation.data).toBe("test");

			mutation.reset();

			expect(mutation.data).toBe(undefined);
			expect(mutation.status).toBe("pending");
		});

		it("mutateAsync should throw on error", async () => {
			const mutation = createMutation({
				fn: () => Promise.reject(new Error("async error")),
			});

			let thrownError: Error | undefined;
			try {
				await mutation.mutateAsync(undefined);
			} catch (err) {
				thrownError = err as Error;
			}

			expect(thrownError?.message).toBe("async error");
		});
	});

	describe("invalidateQueries", () => {
		it("should invalidate queries matching key prefix", async () => {
			let fetchCount1 = 0;
			let fetchCount2 = 0;
			let fetchCount3 = 0;

			createQuery({
				key: ["users", "list"],
				fn: () => {
					fetchCount1++;
					return Promise.resolve(`users ${fetchCount1}`);
				},
				staleTime: 10000,
			});

			createQuery({
				key: ["users", "detail", "1"],
				fn: () => {
					fetchCount2++;
					return Promise.resolve(`user ${fetchCount2}`);
				},
				staleTime: 10000,
			});

			createQuery({
				key: ["posts"],
				fn: () => {
					fetchCount3++;
					return Promise.resolve(`posts ${fetchCount3}`);
				},
				staleTime: 10000,
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(fetchCount1).toBe(1);
			expect(fetchCount2).toBe(1);
			expect(fetchCount3).toBe(1);

			// Invalidate all "users" queries
			invalidateQueries(["users"]);

			await new Promise((resolve) => setTimeout(resolve, 10));

			// Users queries should refetch
			expect(fetchCount1).toBe(2);
			expect(fetchCount2).toBe(2);
			// Posts query should not refetch
			expect(fetchCount3).toBe(1);
		});
	});

	describe("queryCache", () => {
		it("should store and retrieve cached data", () => {
			queryCache.set(["test-cache"], "cached value");

			const entry = queryCache.get(["test-cache"]);
			expect(entry?.data).toBe("cached value");
		});

		it("should check if data is stale", async () => {
			queryCache.set(["stale-test"], "data");

			expect(queryCache.isStale(["stale-test"], 10000)).toBe(false);

			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(queryCache.isStale(["stale-test"], 10)).toBe(true);
		});

		it("should clear all cached data", () => {
			queryCache.set(["clear-1"], "data1");
			queryCache.set(["clear-2"], "data2");

			queryCache.clear();

			expect(queryCache.get(["clear-1"])).toBe(undefined);
			expect(queryCache.get(["clear-2"])).toBe(undefined);
		});
	});
});
