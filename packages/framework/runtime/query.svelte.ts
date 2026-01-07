export type QueryKey = readonly unknown[];

export type QueryStatus = "pending" | "success" | "error";

export type QueryState<T> = {
	data: T | undefined;
	error: Error | null;
	status: QueryStatus;
	isLoading: boolean;
	isFetching: boolean;
	isSuccess: boolean;
	isError: boolean;
};

export type QueryOptions<T, TParams = void> = {
	key: QueryKey | ((params: TParams) => QueryKey);
	fn: (params: TParams) => Promise<T>;
	params?: () => TParams;
	staleTime?: number;
	enabled?: boolean | (() => boolean);
	refetchOnWindowFocus?: boolean;
	refetchInterval?: number;
	onSuccess?: (data: T) => void;
	onError?: (error: Error) => void;
};

export type MutationOptions<TData, TVariables> = {
	fn: (variables: TVariables) => Promise<TData>;
	onSuccess?: (result: { data: TData; variables: TVariables }) => void;
	onError?: (result: { error: Error; variables: TVariables }) => void;
	onSettled?: (result: { data: TData | undefined; error: Error | null; variables: TVariables }) => void;
};

type CacheEntry<T> = {
	data: T;
	timestamp: number;
	subscribers: Set<() => void>;
};

class QueryCache {
	private cache = new Map<string, CacheEntry<unknown>>();

	private serializeKey(key: QueryKey): string {
		return JSON.stringify(key);
	}

	get<T>(key: QueryKey): CacheEntry<T> | undefined {
		return this.cache.get(this.serializeKey(key)) as CacheEntry<T> | undefined;
	}

	set<T>(key: QueryKey, data: T): void {
		const serialized = this.serializeKey(key);
		const existing = this.cache.get(serialized);
		this.cache.set(serialized, {
			data,
			timestamp: Date.now(),
			subscribers: existing?.subscribers ?? new Set(),
		});
	}

	subscribe(key: QueryKey, callback: () => void): () => void {
		const serialized = this.serializeKey(key);
		let entry = this.cache.get(serialized);
		if (!entry) {
			entry = { data: undefined, timestamp: 0, subscribers: new Set() };
			this.cache.set(serialized, entry);
		}
		entry.subscribers.add(callback);
		return () => entry.subscribers.delete(callback);
	}

	unsubscribe(key: QueryKey, callback: () => void): void {
		const serialized = this.serializeKey(key);
		const entry = this.cache.get(serialized);
		if (entry) {
			entry.subscribers.delete(callback);
		}
	}

	invalidate(key: QueryKey): void {
		const serialized = this.serializeKey(key);
		const entry = this.cache.get(serialized);
		if (entry) {
			entry.timestamp = 0;
			entry.subscribers.forEach((cb) => cb());
		}
	}

	invalidateMatching(partialKey: QueryKey): void {
		const prefix = JSON.stringify(partialKey).slice(0, -1);
		for (const [serialized, entry] of this.cache.entries()) {
			if (serialized.startsWith(prefix)) {
				entry.timestamp = 0;
				entry.subscribers.forEach((cb) => cb());
			}
		}
	}

	isStale<T>(key: QueryKey, staleTime: number): boolean {
		const entry = this.get<T>(key);
		if (!entry) return true;
		return Date.now() - entry.timestamp > staleTime;
	}

	clear(): void {
		this.cache.clear();
	}
}

export const queryCache = new QueryCache();

export class Query<T, TParams = void> {
	#keyOrFn: QueryKey | ((params: TParams) => QueryKey);
	#fn: (params: TParams) => Promise<T>;
	#paramsFn?: () => TParams;
	#staleTime: number;
	#enabledOrFn: boolean | (() => boolean);
	#onSuccess?: (data: T) => void;
	#onError?: (error: Error) => void;
	#isManualRefetch = false;
	#currentKey: QueryKey;
	#cacheCallback: () => void;

	data: T | undefined = $state(undefined);
	error: Error | null = $state(null);
	status: QueryStatus = $state("pending");

	readonly isLoading = $derived(this.status === "pending" && this.data === undefined);
	readonly isFetching = $derived(this.status === "pending");
	readonly isSuccess = $derived(this.status === "success");
	readonly isError = $derived(this.status === "error");

	constructor(options: QueryOptions<T, TParams>) {
		this.#keyOrFn = options.key;
		this.#fn = options.fn;
		this.#paramsFn = options.params;
		this.#staleTime = options.staleTime ?? 0;
		this.#enabledOrFn = options.enabled ?? true;
		this.#onSuccess = options.onSuccess;
		this.#onError = options.onError;

		// Compute initial key
		this.#currentKey = this.#computeKey();

		// Cache callback for subscription management
		this.#cacheCallback = () => {
			if (!this.#isManualRefetch) {
				this.#fetch();
			}
		};

		// Subscribe to cache invalidations for current key
		queryCache.subscribe(this.#currentKey, this.#cacheCallback);

		// Initial fetch if enabled
		if (this.#isEnabled()) {
			this.#fetch();
		}

		// Set up reactive effect for params changes
		$effect(() => {
			const newKey = this.#computeKey();
			const keyChanged = JSON.stringify(newKey) !== JSON.stringify(this.#currentKey);

			if (keyChanged) {
				// Unsubscribe from old key, subscribe to new key
				queryCache.unsubscribe(this.#currentKey, this.#cacheCallback);
				this.#currentKey = newKey;
				queryCache.subscribe(this.#currentKey, this.#cacheCallback);

				// Refetch with new params if enabled
				if (this.#isEnabled()) {
					this.#fetch();
				}
			}
		});

		// Watch enabled state changes
		$effect(() => {
			const enabled = this.#isEnabled();
			if (enabled && this.data === undefined && this.status !== "pending") {
				this.#fetch();
			}
		});

		// Refetch on window focus
		const refetchOnWindowFocus = options.refetchOnWindowFocus ?? true;
		if (typeof window !== "undefined" && refetchOnWindowFocus) {
			window.addEventListener("focus", () => {
				if (this.#isEnabled() && queryCache.isStale<T>(this.#currentKey, this.#staleTime)) {
					this.#fetch();
				}
			});
		}

		// Refetch interval
		const refetchInterval = options.refetchInterval;
		if (refetchInterval && refetchInterval > 0) {
			setInterval(() => {
				if (this.#isEnabled()) {
					this.#fetch();
				}
			}, refetchInterval);
		}
	}

	#computeKey(): QueryKey {
		if (typeof this.#keyOrFn === "function") {
			const params = this.#paramsFn ? this.#paramsFn() : (undefined as TParams);
			return this.#keyOrFn(params);
		}
		return this.#keyOrFn;
	}

	#isEnabled(): boolean {
		if (typeof this.#enabledOrFn === "function") {
			return this.#enabledOrFn();
		}
		return this.#enabledOrFn;
	}

	get key(): QueryKey {
		return this.#currentKey;
	}

	async #fetch(): Promise<void> {
		if (!this.#isEnabled()) {
			return;
		}

		const key = this.#currentKey;
		const cached = queryCache.get<T>(key);

		if (cached?.data !== undefined && !queryCache.isStale<T>(key, this.#staleTime)) {
			this.data = cached.data;
			this.error = null;
			this.status = "success";
			return;
		}

		this.status = "pending";

		try {
			const params = this.#paramsFn ? this.#paramsFn() : (undefined as TParams);
			const data = await this.#fn(params);
			queryCache.set(key, data);
			this.data = data;
			this.error = null;
			this.status = "success";
			this.#onSuccess?.(data);
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			this.error = error;
			this.status = "error";
			this.#onError?.(error);
		}
	}

	async refetch(): Promise<void> {
		this.#isManualRefetch = true;
		queryCache.invalidate(this.#currentKey);
		await this.#fetch();
		this.#isManualRefetch = false;
	}

	invalidate(): void {
		queryCache.invalidate(this.#currentKey);
	}
}

export class Mutation<TData, TVariables = void> {
	#fn: (variables: TVariables) => Promise<TData>;
	#onSuccess?: (result: { data: TData; variables: TVariables }) => void;
	#onError?: (result: { error: Error; variables: TVariables }) => void;
	#onSettled?: (result: { data: TData | undefined; error: Error | null; variables: TVariables }) => void;

	data: TData | undefined = $state(undefined);
	error: Error | null = $state(null);
	status: QueryStatus = $state("pending");

	#isPending = $state(false);
	readonly isLoading = $derived(this.#isPending);
	readonly isSuccess = $derived(this.status === "success");
	readonly isError = $derived(this.status === "error");

	constructor(options: MutationOptions<TData, TVariables>) {
		this.#fn = options.fn;
		this.#onSuccess = options.onSuccess;
		this.#onError = options.onError;
		this.#onSettled = options.onSettled;
	}

	async mutateAsync(variables: TVariables): Promise<TData> {
		this.#isPending = true;
		this.data = undefined;
		this.error = null;
		this.status = "pending";

		try {
			const data = await this.#fn(variables);
			this.data = data;
			this.error = null;
			this.status = "success";
			this.#isPending = false;
			this.#onSuccess?.({ data, variables });
			this.#onSettled?.({ data, error: null, variables });
			return data;
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			this.data = undefined;
			this.error = error;
			this.status = "error";
			this.#isPending = false;
			this.#onError?.({ error, variables });
			this.#onSettled?.({ data: undefined, error, variables });
			throw error;
		}
	}

	async mutate(variables: TVariables): Promise<TData | undefined> {
		try {
			return await this.mutateAsync(variables);
		} catch {
			return undefined;
		}
	}

	reset(): void {
		this.data = undefined;
		this.error = null;
		this.status = "pending";
		this.#isPending = false;
	}
}

export function createQuery<T, TParams = void>(options: QueryOptions<T, TParams>): Query<T, TParams> {
	return new Query(options);
}

export function createMutation<TData, TVariables = void>(
	options: MutationOptions<TData, TVariables>,
): Mutation<TData, TVariables> {
	return new Mutation(options);
}

export function invalidateQueries(key: QueryKey): void {
	queryCache.invalidateMatching(key);
}
