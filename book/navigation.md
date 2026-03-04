# Navigation

## Programmatic navigation

Use `goto` to navigate between routes:

```typescript
import { goto } from "./router";

// Static route
goto("/about");

// Dynamic route with parameters
goto("/user/:id", { id: "123" });

// Multiple parameters
goto("/posts/:postId/comments/:commentId", {
  postId: "1",
  commentId: "5",
});
```

TypeScript ensures you provide the correct parameters for each route.

### In components

```html
<script>
  import { goto } from "./router";
</script>

<button onclick={() => goto("/about")}>Go to About</button>
<button onclick={() => goto("/user/:id", { id: "42" })}>View User</button>
```

## Link navigation

Standard `<a>` tags are intercepted by the Router component for SPA navigation. No special link component needed:

```html
<script>
  import { resolve, isActive } from "./router";
</script>

<nav>
  <a href={resolve("/")} class:active={isActive("/", { exact: true })}>Home</a>
  <a href={resolve("/about")} class:active={isActive("/about")}>About</a>
</nav>
```

## Navigation guards

### Before navigation

Run logic before a route change. Call `cancel()` to prevent the navigation:

```typescript
import { beforeNavigate } from "./router";

const unsubscribe = beforeNavigate(({ to, from, type, cancel }) => {
  if (!isAuthenticated && to.path.startsWith("/admin")) {
    cancel();
    goto("/login");
  }
});
```

### After navigation

Run logic after a route change completes:

```typescript
import { afterNavigate } from "./router";

const unsubscribe = afterNavigate(({ to, from, type }) => {
  // Track page views
  analytics.track("pageview", { path: to.path });

  // Scroll to top
  window.scrollTo(0, 0);
});
```

### Cleanup

Both hooks return an unsubscribe function. Clean up in `onDestroy`:

```html
<script>
  import { onDestroy } from "svelte";
  import { beforeNavigate } from "./router";

  const unsubscribe = beforeNavigate(({ cancel }) => {
    if (hasUnsavedChanges) {
      if (!confirm("You have unsaved changes. Leave?")) {
        cancel();
      }
    }
  });

  onDestroy(unsubscribe);
</script>
```

## Navigation types

The `type` field in navigation callbacks tells you how the navigation was triggered:

| Type | Trigger |
|------|---------|
| `"goto"` | Programmatic `goto()` call |
| `"popstate"` | Browser back/forward button |
| `"link"` | Clicking an `<a>` tag |

```typescript
afterNavigate(({ type }) => {
  // Only scroll to top for non-history navigations
  if (type !== "popstate") {
    window.scrollTo(0, 0);
  }
});
```

## Replace state

Navigate without adding a history entry using `router.navigate()` with the `replace` flag:

```typescript
import { router } from "./router";

// Replace current history entry
await router.navigate("/modal/123", true);

// Return without adding history
await router.navigate("/", true);
```
