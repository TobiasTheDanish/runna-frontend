<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let { class: className, children, ...rest } = $props();
</script>

<thead class={cn("[&_tr]:border-b", className)} {...rest}>
	{@render children?.()}
</thead>
