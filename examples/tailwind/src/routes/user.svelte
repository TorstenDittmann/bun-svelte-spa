<script lang="ts">
	import { current } from "@router";
</script>

<div class="space-y-4">
	<h1 class="text-3xl font-bold text-gray-900">User Profile</h1>
	<div class="rounded-lg bg-white p-6 shadow-sm">
		<p class="text-gray-600">
			User ID: <span class="font-mono font-semibold text-indigo-600">{
				current.params.id
			}</span>
		</p>
	</div>
</div>
