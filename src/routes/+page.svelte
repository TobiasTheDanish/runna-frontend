<script lang="ts">
	import { onMount } from "svelte";
	import { getSessions, type Session } from "$lib/api/client";
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardAction,
	} from "$lib/components/ui/card";
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableHead,
		TableCell,
	} from "$lib/components/ui/table";
	import { goto } from "$app/navigation";
	import RangeCalendar from "$lib/components/ui/range-calendar/range-calendar.svelte";
	import {
		CalendarDate,
		getLocalTimeZone,
		today,
	} from "@internationalized/date";
	import {
		Popover,
		PopoverContent,
		PopoverTrigger,
	} from "$lib/components/ui/popover";
	import type { DateRange } from "bits-ui";

	let sessions = $state<Session[]>([]);
	let loading = $state(true);
	let error = $state("");
	let selectedPeriod = $state({
		start: today(getLocalTimeZone()).subtract({ months: 1 }),
		end: today(getLocalTimeZone()),
	});
	let open = $state(false);

	async function loadSessions() {
		if (selectedPeriod.start == undefined || selectedPeriod.end == undefined) {
			return;
		}
		loading = true;
		error = "";
		try {
			let startDate = selectedPeriod.start.toString();
			let endDate = selectedPeriod.end.toString();

			sessions = await getSessions(startDate, endDate);
		} catch (e) {
			error = e instanceof Error ? e.message : "Failed to load sessions";
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadSessions();
	});

	function formatDuration(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		return `${m}m ${s}s`;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString("en-US", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	function calculatePace(distance: number, seconds: number): string {
		if (distance <= 0) return "-";
		const paceSeconds = seconds / distance;
		const m = Math.floor(paceSeconds / 60);
		const s = Math.round(paceSeconds % 60);
		return `${m}'${s.toString().padStart(2, "0")}"/km`;
	}

	function formatDateSelection(selection: DateRange): string {
		const start = selection.start?.toString();
		const end = selection.end?.toString();

		if (start && end) {
			return `${start} to ${end}`;
		} else if (end) {
			return `Until ${end}`;
		} else if (start) {
			return `From ${start}`;
		} else {
			return "Select range";
		}
	}
</script>

<div class="container mx-auto max-w-4xl py-10 space-y-8">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">Runna Sessions</h1>
		<Button onclick={() => goto("/create")}>Create Session</Button>
	</div>

	{#if error}
		<div class="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
			{error}
		</div>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>Recent Runs</CardTitle>
			<CardAction>
				<Popover bind:open>
					<PopoverTrigger class={buttonVariants({ variant: "outline" })}>
						{formatDateSelection(selectedPeriod)}
					</PopoverTrigger>
					<PopoverContent class="w-auto p-0" align="end">
						<RangeCalendar
							bind:value={selectedPeriod}
							minDays={30}
							weekStartsOn={1}
							class="rounded-lg border shadow-sm"
							maxValue={today(getLocalTimeZone())}
							minValue={new CalendarDate(2026, 1, 1)}
							preventDeselect={true}
							numberOfMonths={2}
							onValueChange={loadSessions}
						/>
					</PopoverContent>
				</Popover>
			</CardAction>
		</CardHeader>
		<CardContent>
			{#if loading}
				<div class="text-center py-8 text-muted-foreground">
					Loading sessions...
				</div>
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
							<TableHead class="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each sessions as session}
							<TableRow>
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
								<TableCell>
									<Button
										variant="ghost"
										size="icon"
										onclick={() => goto(`/edit/${session.id}`)}
										title="Edit Session"
									>
										<span class="sr-only">Edit</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="lucide lucide-pencil"
											><path
												d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
											/><path d="m15 5 4 4" /></svg
										>
									</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</CardContent>
	</Card>
</div>
