<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils/cn';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';

	type Props = {
		value?: any;
		placeholder?: DateValue;
		class?: string;
		weekdayFormat?: 'short' | 'narrow' | 'long';
		type?: 'single' | 'multiple';
		[key: string]: any;
	};

	let {
		value = $bindable(),
		placeholder = $bindable(today(getLocalTimeZone())),
		weekdayFormat = 'short',
		class: className,
		type = 'single',
		...rest
	}: Props = $props();
</script>

{#snippet gridBodySnippet({ weeks }: { weeks: any })}
	{#each weeks as dates}
		<CalendarPrimitive.GridRow class="flex w-full mt-2">
			{#each dates as date}
				<CalendarPrimitive.Cell
					{date}
					month={placeholder}
					class="relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:bg-accent"
				>
					<CalendarPrimitive.Day
						month={placeholder}
						class={cn(
							buttonVariants({ variant: 'ghost' }),
							'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
							'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground',
							'data-[today]:bg-accent data-[today]:text-accent-foreground',
							'data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50'
						)}
					>
						{date.day}
					</CalendarPrimitive.Day>
				</CalendarPrimitive.Cell>
			{/each}
		</CalendarPrimitive.GridRow>
	{/each}
{/snippet}

<CalendarPrimitive.Root
	bind:value
	bind:placeholder
	{weekdayFormat}
	class={cn('p-3', className)}
	{type}
	{...rest}
>
	<CalendarPrimitive.Header class="pt-1 relative flex items-center justify-center w-full">
		<CalendarPrimitive.Heading class="text-sm font-medium" />
		<div class="space-x-1 flex items-center">
			<CalendarPrimitive.PrevButton
				class={cn(
					buttonVariants({ variant: 'outline' }),
					'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 top-1'
				)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
			</CalendarPrimitive.PrevButton>
			<CalendarPrimitive.NextButton
				class={cn(
					buttonVariants({ variant: 'outline' }),
					'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 top-1'
				)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
			</CalendarPrimitive.NextButton>
		</div>
	</CalendarPrimitive.Header>

	<CalendarPrimitive.Grid class="w-full border-collapse space-y-1">
		<CalendarPrimitive.GridHead>
			<CalendarPrimitive.GridRow class="flex">
				{#each ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as day}
					<CalendarPrimitive.HeadCell
						class="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]"
					>
						{day}
					</CalendarPrimitive.HeadCell>
				{/each}
			</CalendarPrimitive.GridRow>
		</CalendarPrimitive.GridHead>
		<CalendarPrimitive.GridBody children={gridBodySnippet as any} />
	</CalendarPrimitive.Grid>
</CalendarPrimitive.Root>
