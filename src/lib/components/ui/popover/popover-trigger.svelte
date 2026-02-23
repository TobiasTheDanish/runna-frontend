<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	let { class: className, children, ...rest } = $props();
</script>

<PopoverPrimitive.Trigger
	class={cn('', className)}
	{...rest}
>
	{@render children?.()}
</PopoverPrimitive.Trigger>
