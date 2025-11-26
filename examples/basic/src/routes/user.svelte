<script>
	import { current } from "@router";
</script>

<h1>user</h1>

<p>User ID: {$current.params.id}</p>
<p>Current path: {$current.path}</p>
