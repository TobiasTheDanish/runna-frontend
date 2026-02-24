<script lang="ts">
	import { createGoal } from '$lib/api/client';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { Calendar } from '$lib/components/ui/calendar';
	import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils/cn';

	let targetDistance = $state('');
	
	// Initialize dates
	const now = today(getLocalTimeZone());
	let startDate = $state<CalendarDate>(now);
	let endDate = $state<CalendarDate>(now.add({ months: 1 }));

	let loading = $state(false);
	let error = $state('');
	
	let startOpen = $state(false);
	let endOpen = $state(false);

	function formatDisplayDate(date: CalendarDate): string {
		return new Date(date.year, date.month - 1, date.day).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		const dist = parseFloat(targetDistance);
		if (isNaN(dist) || dist <= 0) {
			error = 'Please enter a valid target distance';
			return;
		}

		if (!startDate || !endDate) {
			error = 'Please select both start and end dates';
			return;
		}

		// Convert to JS Date for comparison and API
		const start = new Date(startDate.year, startDate.month - 1, startDate.day);
		const end = new Date(endDate.year, endDate.month - 1, endDate.day);

		if (end <= start) {
			error = 'End date must be after start date';
			return;
		}

		loading = true;

		try {
			await createGoal({
				target_distance: dist,
				start_date: start.toISOString(),
				end_date: end.toISOString()
			});
			goto('/goals');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create goal';
			loading = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl py-10">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-2xl">Create New Goal</Card.Title>
			<Card.Description>Set a distance target for a specific time period.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit} class="space-y-6">
				<div class="space-y-2">
					<Label for="distance">Target Distance</Label>
					<div class="relative w-full">
						<Input
							type="number"
							id="distance"
							bind:value={targetDistance}
							step="0.01"
							min="0"
							required
							placeholder="e.g. 100"
							class="pr-12"
						/>
						<span
							class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
							>km</span
						>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label>Start Date</Label>
						<Popover bind:open={startOpen}>
							<PopoverTrigger
								class={cn(
									"inline-flex w-full justify-start text-left font-normal items-center rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
									!startDate && "text-muted-foreground"
								)}
							>
								{startDate ? formatDisplayDate(startDate) : "Pick a date"}
							</PopoverTrigger>
							<PopoverContent class="w-auto p-0" align="start">
								<Calendar
									weekStartsOn={1}
									bind:value={startDate}
									type="single"
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div class="space-y-2">
						<Label>End Date</Label>
						<Popover bind:open={endOpen}>
							<PopoverTrigger
								class={cn(
									"inline-flex w-full justify-start text-left font-normal items-center rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
									!endDate && "text-muted-foreground"
								)}
							>
								{endDate ? formatDisplayDate(endDate) : "Pick a date"}
							</PopoverTrigger>
							<PopoverContent class="w-auto p-0" align="start">
								<Calendar
									weekStartsOn={1}
									bind:value={endDate}
									type="single"
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				{#if error}
					<div class="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
						{error}
					</div>
				{/if}

				<div class="flex justify-end gap-3 pt-4">
					<Button
						type="button"
						variant="secondary"
						onclick={() => goto('/goals')}
						disabled={loading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? 'Creating...' : 'Create Goal'}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
