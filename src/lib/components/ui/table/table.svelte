<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let { class: className, children, ...rest } = $props();
</script>

<div class="relative w-full overflow-auto">
	<table class={cn("w-full caption-bottom text-sm", className)} {...rest}>
		{@render children?.()}
	</table>
</div>
