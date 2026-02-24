<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { getGoal, deleteGoal, type GoalProgress } from "$lib/api/client";
	import { Button } from "$lib/components/ui/button";
	import GoalChart from "$lib/components/GoalChart.svelte";
	import GoalSummaryCard from "$lib/components/GoalSummaryCard.svelte";
	import { goto } from "$app/navigation";
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableHead,
		TableCell,
	} from "$lib/components/ui/table";

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

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString("en-US", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	function formatDuration(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		return `${m}m ${s}s`;
	}

	function calculatePace(distance: number, seconds: number): string {
		if (distance <= 0) return "-";
		const paceSeconds = seconds / distance;
		const m = Math.floor(paceSeconds / 60);
		const s = Math.round(paceSeconds % 60);
		return `${m}'${s.toString().padStart(2, "0")}"/km`;
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

			<div class="rounded-lg border bg-card text-card-foreground shadow-sm">
				<div class="p-6 flex flex-col space-y-1.5">
					<h3 class="font-semibold leading-none tracking-tight">
						Contributing Sessions
					</h3>
					<p class="text-sm text-muted-foreground">
						Sessions that count towards this goal.
					</p>
				</div>
				<div class="p-6 pt-0">
					{#if !goal.sessions || goal.sessions.length === 0}
						<div class="text-center py-8 text-muted-foreground">
							No sessions recorded during this period yet.
						</div>
					{:else}
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Distance</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Pace</TableHead>
									<TableHead class="hidden md:table-cell">Notes</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each goal.sessions as session}
									<TableRow
										class="cursor-pointer hover:bg-muted/50"
										onclick={() => goto(`/edit/${session.id}`)}
									>
										<TableCell>{formatDate(session.date)}</TableCell>
										<TableCell>{session.distance.toFixed(2)} km</TableCell>
										<TableCell>{formatDuration(session.duration)}</TableCell>
										<TableCell
											>{calculatePace(
												session.distance,
												session.duration,
											)}</TableCell
										>
										<TableCell
											class="hidden md:table-cell text-muted-foreground truncate max-w-[200px]"
										>
											{session.notes || "-"}
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					{/if}
				</div>
			</div>

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
