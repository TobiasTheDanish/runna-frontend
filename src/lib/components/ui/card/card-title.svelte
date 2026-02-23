<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let { class: className = undefined, children, ...rest } = $props();
</script>

<h3 class={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...rest}>
	{@render children?.()}
</h3>
