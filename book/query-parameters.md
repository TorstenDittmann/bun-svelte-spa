# Query Parameters

## Reading query params

Access URL query parameters reactively with `queryParams`:

```html
<script>
  import { queryParams } from "./router";

  let search = $derived(queryParams.get("q") || "");
  let page = $derived(parseInt(queryParams.get("page") || "1"));
</script>

<p>Search: {search}</p>
<p>Page: {page}</p>
```

### Available methods

```typescript
import { queryParams } from "./router";

queryParams.get("q"); // Single value or null
queryParams.getAll("tag"); // All values for a key
queryParams.has("filter"); // Check existence
queryParams.entries(); // Iterator of [key, value] pairs
queryParams.toString(); // Serialized query string
```

## Setting query params

Update query parameters with `setQueryParams`. Set a value to `null` to remove it:

```typescript
import { setQueryParams } from "./router";

// Set params
setQueryParams({ q: "svelte", page: "1" });

// Remove a param
setQueryParams({ q: null });

// Array values
setQueryParams({ tags: ["svelte", "bun"] });

// Replace history entry instead of pushing
setQueryParams({ page: "2" }, { replace: true });
```

## Example: search with filters

```html
<script>
  import { queryParams, setQueryParams } from "./router";

  let search = $derived(queryParams.get("q") || "");
  let category = $derived(queryParams.get("category") || "");

  function applySearch(value: string) {
    setQueryParams({ q: value || null, page: null });
  }

  function applyCategory(value: string) {
    setQueryParams({ category: value || null, page: null });
  }
</script>

<input
  type="text"
  value={search}
  oninput={(e) => applySearch(e.currentTarget.value)}
  placeholder="Search..."
/>

<select value={category} onchange={(e) => applyCategory(e.currentTarget.value)}>
  <option value="">All</option>
  <option value="electronics">Electronics</option>
  <option value="clothing">Clothing</option>
</select>
```

## Example: pagination

```html
<script>
  import { queryParams, setQueryParams } from "./router";

  let page = $derived(parseInt(queryParams.get("page") || "1"));

  function goToPage(p: number) {
    setQueryParams({ page: String(p) }, { replace: true });
  }
</script>

<div>
  <button disabled={page === 1} onclick={() => goToPage(page - 1)}>Previous</button>
  <span>Page {page}</span>
  <button onclick={() => goToPage(page + 1)}>Next</button>
</div>
```
