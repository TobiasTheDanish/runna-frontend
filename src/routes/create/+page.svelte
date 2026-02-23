<script lang="ts">
	import { createSession } from "$lib/api/client";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
	} from "$lib/components/ui/card";
	import {
		Popover,
		PopoverContent,
		PopoverTrigger,
	} from "$lib/components/ui/popover";
	import { Calendar } from "$lib/components/ui/calendar";
	import {
		CalendarDate,
		today,
		getLocalTimeZone,
	} from "@internationalized/date";
	import { cn } from "$lib/utils/cn";

	let selectedDate = $state<CalendarDate>(today(getLocalTimeZone()));
	let distance = $state("");
	let durationHours = $state("");
	let durationMinutes = $state("");
	let durationSeconds = $state("");
	let notes = $state("");
	let loading = $state(false);
	let error = $state("");
	let open = $state(false);

	function formatDisplayDate(date: CalendarDate): string {
		return new Date(date.year, date.month - 1, date.day).toLocaleDateString(
			"en-US",
			{
				year: "numeric",
				month: "short",
				day: "numeric",
			},
		);
	}

	async function handleSubmit() {
		error = "";

		let distanceNum = parseFloat(distance);
		if (isNaN(distanceNum) || distanceNum <= 0) {
			error = "Please enter a valid distance";
			return;
		}

		distanceNum = Math.round(distanceNum * 100) / 100;

		const hours = parseInt(durationHours || "0");
		const mins = parseInt(durationMinutes || "0");
		const secs = parseInt(durationSeconds || "0");
		const totalSeconds = hours * 3600 + mins * 60 + secs;

		if (totalSeconds <= 0) {
			error = "Please enter a valid duration";
			return;
		}

		loading = true;

		try {
			const dateObj = new Date(
				selectedDate.year,
				selectedDate.month - 1,
				selectedDate.day,
			);
			await createSession({
				date: dateObj.toISOString(),
				distance: distanceNum,
				duration: totalSeconds,
				notes: notes,
			});
			goto("/");
		} catch (e) {
			error = e instanceof Error ? e.message : "Failed to create session";
			loading = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl py-10">
	<Card>
		<CardHeader>
			<CardTitle class="text-2xl">Create Running Session</CardTitle>
		</CardHeader>
		<CardContent>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				class="space-y-6"
			>
				<div class="space-y-2">
					<Label>Date</Label>
					<Popover bind:open>
						<PopoverTrigger
							class={cn(
								"inline-flex w-64 justify-start text-left font-normal items-center rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
								!selectedDate && "text-muted-foreground",
							)}
						>
							{selectedDate ? formatDisplayDate(selectedDate) : "Pick a date"}
						</PopoverTrigger>
						<PopoverContent class="w-auto p-0" align="start">
							<Calendar
								weekStartsOn={1}
								bind:value={selectedDate}
								type="single"
							/>
						</PopoverContent>
					</Popover>
				</div>

				<div class="space-y-2">
					<Label for="distance">Distance</Label>
					<div class="relative w-[120px]">
						<Input
							type="number"
							id="distance"
							bind:value={distance}
							step="0.01"
							min="0"
							required
							placeholder="0.00"
							class="pr-12"
						/>
						<span
							class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
							>km</span
						>
					</div>
				</div>

				<div class="space-y-2">
					<Label>Duration</Label>
					<div class="flex items-center gap-2">
						<div class="relative w-[75px]">
							<Input
								type="number"
								bind:value={durationHours}
								min="0"
								placeholder="00"
								class="pr-10 text-center text-lg"
							/>
							<span
								class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
								>hr</span
							>
						</div>
						<span class="text-xl font-bold text-muted-foreground">:</span>
						<div class="relative w-[75px]">
							<Input
								type="number"
								bind:value={durationMinutes}
								min="0"
								max="59"
								placeholder="00"
								class="pr-10 text-center text-lg"
							/>
							<span
								class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
								>min</span
							>
						</div>
						<span class="text-xl font-bold text-muted-foreground">:</span>
						<div class="relative w-[75px]">
							<Input
								type="number"
								bind:value={durationSeconds}
								min="0"
								max="59"
								placeholder="00"
								class="pr-10 text-center text-lg"
							/>
							<span
								class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
								>sec</span
							>
						</div>
					</div>
					<p class="text-[0.8rem] text-muted-foreground">
						Enter your run duration in HH:MM:SS format
					</p>
				</div>

				<div class="space-y-2">
					<Label for="notes">Notes (optional)</Label>
					<Textarea
						id="notes"
						bind:value={notes}
						rows={4}
						placeholder="How did the run feel?"
					/>
				</div>

				{#if error}
					<div
						class="rounded-md bg-destructive/15 p-4 text-sm text-destructive"
					>
						{error}
					</div>
				{/if}

				<div class="flex justify-end gap-3 pt-4">
					<Button
						type="button"
						variant="secondary"
						onclick={() => goto("/")}
						disabled={loading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? "Creating..." : "Create Session"}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>

<style>
	/* Hide number input arrows */
	:global(input[type="number"]::-webkit-inner-spin-button),
	:global(input[type="number"]::-webkit-outer-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}
	:global(input[type="number"]) {
		appearance: textfield;
		-moz-appearance: textfield;
	}
</style>
