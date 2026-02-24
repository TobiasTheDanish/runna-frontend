<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { GoalProgress } from '$lib/api/client';
	import { getLocalTimeZone, today } from "@internationalized/date";
	import { startOfDay } from "date-fns";

	let { goal } = $props<{ goal: GoalProgress }>();

    let startDate = $derived(new Date(goal.start_date));
	let endDate = $derived(new Date(goal.end_date));

	let targetToday = $derived.by(() => {
		const totalMs = endDate.getTime() - startDate.getTime();
        // Avoid division by zero
        if (totalMs <= 0) return goal.target_distance;

		const t = today(getLocalTimeZone());
		const startOfToday = startOfDay(t.toDate(getLocalTimeZone()));

		const progress = Math.max(
			0,
			Math.min(1, (startOfToday.getTime() - startDate.getTime()) / totalMs),
		);
		return goal.target_distance * progress;
	});

    let diff = $derived(goal.current_distance - targetToday);
    let diffStatus = $derived(diff >= 0 ? "Ahead" : "Behind");

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
    
    // Format helper
    const fmt = (n: number) => Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
</script>

<Card.Root>
    <Card.Header class="pb-2">
        <Card.Title class="text-lg font-semibold tracking-tight">Summary</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="grid grid-cols-2 gap-y-8 gap-x-6 md:grid-cols-3">
            <div class="flex flex-col gap-1">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Target</span>
                <span class="text-2xl font-bold">{fmt(goal.target_distance)} km</span>
            </div>
            
            <div class="flex flex-col gap-1">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Today</span>
                <span class="text-2xl font-bold">{fmt(targetToday)} km</span>
            </div>

            <div class="flex flex-col gap-1">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Distance</span>
                <span class="text-2xl font-bold">{fmt(goal.current_distance)} km</span>
            </div>

            <div class="flex flex-col gap-1">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                <div class="flex items-baseline gap-2">
                    <span class={`text-2xl font-bold ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {diff > 0 ? '+' : diff < 0 ? '-' : ''}{fmt(diff)} km
                    </span>
                    <span class={`text-xs font-medium ${diff >= 0 ? 'text-green-500' : 'text-red-500'} uppercase`}>
                        {diffStatus}
                    </span>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Required Pace</span>
                <span class="text-2xl font-bold">
                    {requiredWeeklyRate === Infinity ? '∞' : fmt(requiredWeeklyRate)} <span class="text-sm font-normal text-muted-foreground">km/wk</span>
                </span>
            </div>

            <div class="flex flex-col gap-1">
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Remaining</span>
                <span class="text-2xl font-bold">
                    {daysRemaining} <span class="text-sm font-normal text-muted-foreground">days</span>
                </span>
            </div>
        </div>
    </Card.Content>
</Card.Root>
