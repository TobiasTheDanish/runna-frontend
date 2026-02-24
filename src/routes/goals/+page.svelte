<script lang="ts">
	import { onMount } from 'svelte';
	import { getGoals, deleteGoal, type GoalProgress } from '$lib/api/client';
	import { Button } from '$lib/components/ui/button';
	import GoalCard from '$lib/components/GoalCard.svelte';
	import { goto } from '$app/navigation';

	let goals = $state<GoalProgress[]>([]);
	let loading = $state(true);
	let error = $state('');

	async function loadGoals() {
		loading = true;
		error = '';
		try {
			goals = await getGoals();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load goals';
		} finally {
			loading = false;
		}
	}

	async function handleDelete(id: number) {
		if (!confirm('Are you sure you want to delete this goal?')) return;
		try {
			await deleteGoal(id);
			await loadGoals();
		} catch (e) {
			alert('Failed to delete goal');
		}
	}

	onMount(() => {
		loadGoals();
	});
</script>

<div class="container mx-auto max-w-4xl py-10 space-y-8">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">Goals</h1>
		<Button onclick={() => goto('/goals/create')}>Create Goal</Button>
	</div>

	{#if error}
		<div class="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-8 text-muted-foreground">Loading goals...</div>
	{:else if goals.length === 0}
		<div class="text-center py-12 text-muted-foreground">
			No goals set. Create one to stay motivated!
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			{#each goals as goal (goal.id)}
				<div
					onclick={() => goto(`/goals/${goal.id}`)}
					class="cursor-pointer transition-transform hover:scale-[1.02]"
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && goto(`/goals/${goal.id}`)}
				>
					<GoalCard {goal} onDelete={handleDelete} />
				</div>
			{/each}
		</div>
	{/if}
</div>
