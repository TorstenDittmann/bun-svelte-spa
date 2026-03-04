<script lang="ts">
	import { router } from "./router";
</script>

{#if router.current.route}
	{@const Component = router.current.route.component}
	<Component />
{:else}
	<p>Not found</p>
{/if}
