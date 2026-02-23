<script lang="ts">
	import { onMount } from 'svelte';
	import { getSessions, type Session } from '$lib/api/client';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '$lib/components/ui/table';
	import { goto } from '$app/navigation';

	let sessions = $state<Session[]>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			sessions = await getSessions();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load sessions';
		} finally {
			loading = false;
		}
	});

	function formatDuration(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		return `${m}m ${s}s`;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function calculatePace(distance: number, seconds: number): string {
		if (distance <= 0) return '-';
		const paceSeconds = seconds / distance;
		const m = Math.floor(paceSeconds / 60);
		const s = Math.round(paceSeconds % 60);
		return `${m}'${s.toString().padStart(2, '0')}"/km`;
	}
</script>

<div class="container mx-auto max-w-4xl py-10 space-y-8">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">Runna Sessions</h1>
		<Button onclick={() => goto('/create')}>Create Session</Button>
	</div>

	{#if error}
		<div class="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
			{error}
		</div>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>Recent Runs</CardTitle>
		</CardHeader>
		<CardContent>
			{#if loading}
				<div class="text-center py-8 text-muted-foreground">Loading sessions...</div>
			{:else if sessions.length === 0}
				<div class="text-center py-12 text-muted-foreground">
					No sessions found. Start running!
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
						{#each sessions as session}
							<TableRow>
								<TableCell>{formatDate(session.date)}</TableCell>
								<TableCell>{session.distance.toFixed(2)} km</TableCell>
								<TableCell>{formatDuration(session.duration)}</TableCell>
								<TableCell>{calculatePace(session.distance, session.duration)}</TableCell>
								<TableCell class="hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
									{session.notes || '-'}
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</CardContent>
	</Card>
</div>
