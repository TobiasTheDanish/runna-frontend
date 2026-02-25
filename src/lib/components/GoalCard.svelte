<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { GoalProgress } from '$lib/api/client';
	import { Trash2 } from 'lucide-svelte';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { startOfDay } from 'date-fns';

	let { goal, onDelete = () => {} } = $props<{
		goal: GoalProgress;
		onDelete?: (id: number) => void;
	}>();

	let startDate = $derived(new Date(goal.start_date));
	let endDate = $derived(new Date(goal.end_date));
	let formattedStartDate = $derived(startDate.toLocaleDateString());
	let formattedEndDate = $derived(endDate.toLocaleDateString());

	let isCompleted = $derived(goal.status === 'Completed');
	let isUpcoming = $derived(new Date(goal.start_date) > new Date() && !isCompleted);

	let statusColor = $derived(
		goal.status === 'On Track' || goal.status === 'Ahead' || goal.status === 'Completed'
			? 'bg-green-500'
			: 'bg-red-500'
	);

	let targetToday = $derived.by(() => {
		const totalMs = endDate.getTime() - startDate.getTime();
		if (totalMs <= 0) return goal.target_distance;

		const t = today(getLocalTimeZone());
		const startOfToday = startOfDay(t.toDate(getLocalTimeZone()));

		const progress = Math.max(
			0,
			Math.min(1, (startOfToday.getTime() - startDate.getTime()) / totalMs)
		);
		return goal.target_distance * progress;
	});

	let diff = $derived(goal.current_distance - targetToday);

	let requiredWeeklyRate = $derived.by(() => {
		const remainingDistance = Math.max(0, goal.target_distance - goal.current_distance);
		const now = new Date();
		const msPerWeek = 1000 * 60 * 60 * 24 * 7;
		const remainingMs = Math.max(0, endDate.getTime() - now.getTime());
		const remainingWeeks = remainingMs / msPerWeek;

		if (remainingWeeks <= 0) return remainingDistance > 0 ? Infinity : 0;
		return remainingDistance / remainingWeeks;
	});

	let daysRemaining = $derived.by(() => {
		const now = new Date();
		const diffMs = endDate.getTime() - now.getTime();
		return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
	});

	const fmt = (n: number) =>
		Math.abs(n).toLocaleString(undefined, {
			minimumFractionDigits: 1,
			maximumFractionDigits: 2
		});
</script>

<Card.Root class="w-full">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title>Goal: {goal.target_distance} km</Card.Title>
				<Card.Description>{formattedStartDate} - {formattedEndDate}</Card.Description>
			</div>
			<div class="flex items-center gap-2">
				<span class={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColor}`}>
					{goal.status}
				</span>
				{#if goal.id}
					<Button variant="ghost" size="icon" onclick={(e) => {
                        e.stopPropagation();
                        onDelete(goal.id!);
                    }}>
						<Trash2 class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="grid grid-cols-2 gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
					>{isUpcoming ? 'Target' : 'Progress'}</span
				>
				<span class="text-lg font-bold">
					{#if isUpcoming}
						{goal.target_distance} km
					{:else}
						{fmt(goal.current_distance)}
						<span class="text-sm font-normal text-muted-foreground">/ {goal.target_distance} km</span>
					{/if}
				</span>
			</div>

			{#if !isUpcoming}
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
						>Status</span
					>
					<span
						class={`text-lg font-bold ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}
					>
						{diff > 0 ? '+' : diff < 0 ? '-' : ''}{fmt(diff)}
						<span class="text-sm font-normal text-muted-foreground">km</span>
					</span>
				</div>
			{/if}

			{#if !isCompleted}
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
						>Required Pace</span
					>
					<span class="text-lg font-bold">
						{requiredWeeklyRate === Infinity ? '∞' : fmt(requiredWeeklyRate)}
						<span class="text-sm font-normal text-muted-foreground">km/wk</span>
					</span>
				</div>

				{#if !isUpcoming}
					<div class="flex flex-col gap-1">
						<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>Time Left</span
						>
						<span class="text-lg font-bold">
							{daysRemaining}
							<span class="text-sm font-normal text-muted-foreground">days</span>
						</span>
					</div>
				{/if}
			{/if}
		</div>
        
		{#if !isUpcoming && !isCompleted}
			<div class="mt-4 w-full bg-secondary h-2 rounded-full overflow-hidden">
				<div 
					class="bg-primary h-full transition-all" 
					style="width: {Math.min(100, goal.progress_percentage)}%"
				></div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
