<script lang="ts">
	import { goto } from "$app/navigation";
	import type { Session } from "$lib/api/client";
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableHead,
		TableCell,
	} from "$lib/components/ui/table";
	import { Button } from "./ui/button";
	import { ChevronLeft, ChevronRight } from "lucide-svelte";

	const { sessions }: { sessions: Session[] } = $props();
	const pageSize = 10;
	let page = $state(1);
	const pageCount = $derived.by(() =>
		Math.max(1, Math.ceil(sessions.length / pageSize)),
	);

	let pageSessions = $derived.by(() =>
		sessions.slice(
			Math.max(0, (page - 1) * pageSize),
			Math.min(sessions.length, page * pageSize),
		),
	);

	let canNextPage = $derived.by(() => page < pageCount);
	let canPrevPage = $derived.by(() => 1 < page);

	function nextPage() {
		if (canNextPage) {
			page += 1;
		}
	}
	function prevPage() {
		if (canPrevPage) {
			page -= 1;
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
</script>

<div class="rounded-lg border bg-card text-card-foreground shadow-sm">
	<div class="p-6 w-full flex items-center justify-between">
		<div class="flex flex-col space-y-1.5">
			<h3 class="font-semibold leading-none tracking-tight">
				Contributing Sessions
			</h3>
			<p class="text-sm text-muted-foreground">
				Sessions that count towards this goal.
			</p>
		</div>
		<div class="grid grid-cols-2 gap-x-4 gap-y-1 items-center justify-center">
			<p class="col-span-2 text-sm text-muted-foreground text-center">
				Page: {page} of {pageCount}
			</p>
			<Button
				variant="outline"
				size="icon"
				onclick={() => prevPage()}
				disabled={!canPrevPage}
			>
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onclick={() => nextPage()}
				disabled={!canNextPage}
			>
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>
	</div>
	<div class="p-6 pt-0">
		{#if !sessions || pageSessions.length === 0}
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
					{#each pageSessions as session}
						<TableRow
							class="cursor-pointer hover:bg-muted/50"
							onclick={() => goto(`/edit/${session.id}`)}
						>
							<TableCell>
								<div class="flex items-center gap-2">
									{formatDate(session.date)}
									{#if session.source === "strava"}
										<svg
											class="w-4 h-4 text-orange-500"
											fill="currentColor"
											viewBox="0 0 384 512"
											title="Synced from Strava"
										>
											<path
												d="M158.4 0L7 292h113.2L158.4 0zM154.8 512L306.2 220H193l-38.2 292z"
											/>
										</svg>
									{/if}
								</div>
							</TableCell>
							<TableCell>{session.distance.toFixed(2)} km</TableCell>
							<TableCell>{formatDuration(session.duration)}</TableCell>
							<TableCell
								>{calculatePace(session.distance, session.duration)}</TableCell
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
