<script>
	import { route } from "bun-svelte-spa/runtime";
</script>

<h1>user</h1>

<p>User ID: {$route.params.id}</p>
<p>Current path: {$route.path}</p>
