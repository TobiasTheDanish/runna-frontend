<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { getGoal, deleteGoal, type GoalProgress } from "$lib/api/client";
	import { Button } from "$lib/components/ui/button";
	import GoalChart from "$lib/components/GoalChart.svelte";
	import GoalSummaryCard from "$lib/components/GoalSummaryCard.svelte";
	import { goto } from "$app/navigation";
	import GoalSessionTable from "$lib/components/GoalSessionTable.svelte";

	let goal = $state<GoalProgress | null>(null);
	let loading = $state(true);
	let error = $state("");

	async function loadGoal() {
		loading = true;
		error = "";
		try {
			const id = $page.params.id;
			if (!id) throw new Error("Goal ID is missing");
			goal = await getGoal(id);
		} catch (e) {
			error = e instanceof Error ? e.message : "Failed to load goal";
		} finally {
			loading = false;
		}
	}

	async function handleDelete(id: number) {
		if (!confirm("Are you sure you want to delete this goal?")) return;
		try {
			await deleteGoal(id);
			goto("/goals");
		} catch (e) {
			alert("Failed to delete goal");
		}
	}

	onMount(() => {
		loadGoal();
	});
</script>

<div class="container mx-auto max-w-4xl py-10 space-y-8">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">Goal Details</h1>
		<Button variant="outline" onclick={() => goto("/goals")}
			>Back to Goals</Button
		>
	</div>

	{#if error}
		<div class="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-8 text-muted-foreground">
			Loading goal details...
		</div>
	{:else if goal}
		<div class="grid gap-6">
			<GoalSummaryCard {goal} />

			<div class="grid gap-4 md:grid-cols-1">
				<div
					class="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
				>
					<div class="mb-6">
						<h3 class="font-semibold leading-none tracking-tight text-lg">
							Progress Chart
						</h3>
					</div>

					<!-- Large Chart -->
					<GoalChart {goal} height={300} />
				</div>
			</div>

			<GoalSessionTable sessions={goal.sessions ?? []} />

			<div class="flex justify-end">
				<Button variant="destructive" onclick={() => handleDelete(goal!.id!)}>
					Delete Goal
				</Button>
			</div>
		</div>
	{:else}
		<div class="text-center py-12 text-muted-foreground">Goal not found.</div>
	{/if}
</div>
