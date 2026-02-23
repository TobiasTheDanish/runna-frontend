<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { buttonVariants } from './index.js';
	import { cn } from '$lib/utils/cn';
	import type { VariantProps } from 'class-variance-authority';

	type Props = ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & {
		class?: string;
	};

	let {
		class: className = undefined,
		variant = 'default',
		size = 'default',
		children,
		...rest
	}: Props = $props();
</script>

<ButtonPrimitive.Root
	class={cn(buttonVariants({ variant, size, className }))}
	{...rest}
>
	{@render children?.()}
</ButtonPrimitive.Root>
