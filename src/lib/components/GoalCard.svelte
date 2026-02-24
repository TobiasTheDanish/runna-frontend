<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { GoalProgress } from '$lib/api/client';
	import { Trash2 } from 'lucide-svelte';
	import GoalChart from './GoalChart.svelte';

	let { goal, onDelete = () => {} } = $props();

	let statusColor = $derived(
		goal.status === 'On Track' || goal.status === 'Ahead' || goal.status === 'Completed'
			? 'bg-green-500'
			: 'bg-red-500'
	);

	let startDate = $derived(new Date(goal.start_date).toLocaleDateString());
	let endDate = $derived(new Date(goal.end_date).toLocaleDateString());
</script>

<Card.Root class="w-full">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title>Goal: {goal.target_distance} km</Card.Title>
				<Card.Description>{startDate} - {endDate}</Card.Description>
			</div>
			<div class="flex items-center gap-2">
				<span class={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColor}`}>
					{goal.status}
				</span>
				{#if goal.id}
					<Button variant="ghost" size="icon" onclick={() => onDelete(goal.id!)}>
						<Trash2 class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			<div class="flex justify-between text-sm">
				<span>Progress</span>
				<span>{goal.current_distance} / {goal.target_distance} km</span>
			</div>
			
			<!-- Replaced progress bar with GoalChart -->
			<div class="pt-2">
				<GoalChart {goal} height={100} />
			</div>

			<div class="text-xs text-muted-foreground text-right">
				{goal.progress_percentage}%
			</div>
		</div>
	</Card.Content>
</Card.Root>
