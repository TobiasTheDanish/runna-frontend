<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";
	import { getStravaStatus, disconnectStrava } from "$lib/api/client";
	import type { StravaConnectionStatus } from "$lib/api/client";

	let status = $state<StravaConnectionStatus | null>(null);
	let isLoading = $state(true);
	let isDisconnecting = $state(false);

	async function loadStatus() {
		try {
			status = await getStravaStatus();
		} catch (err) {
			console.error("Failed to load Strava status:", err);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadStatus();
	});

	async function handleDisconnect() {
		if (!confirm("Are you sure you want to disconnect from Strava?")) {
			return;
		}

		isDisconnecting = true;
		try {
			await disconnectStrava();
			await loadStatus();
		} catch (err) {
			console.error("Failed to disconnect:", err);
			alert("Failed to disconnect from Strava");
		} finally {
			isDisconnecting = false;
		}
	}

	function formatDate(dateStr?: string): string {
		if (!dateStr) return "N/A";
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}
</script>

<div class="container mx-auto p-4 max-w-4xl">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Integrations</h1>
		<p class="text-muted-foreground">
			Connect external services to sync your activities
		</p>
	</div>

	<div class="space-y-4">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<svg
							class="w-8 h-8"
							fill="currentColor"
							viewBox="0 0 384 512"
						>
							<path
								d="M158.4 0L7 292h113.2L158.4 0zM154.8 512L306.2 220H193l-38.2 292z"
							/>
						</svg>
						<div>
							<CardTitle>Strava</CardTitle>
							<CardDescription>
								Automatically sync your running activities
							</CardDescription>
						</div>
					</div>
					{#if !isLoading && status?.connected}
						<span
							class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
						>
							Connected
						</span>
					{/if}
				</div>
			</CardHeader>
			<CardContent>
				{#if isLoading}
					<p class="text-muted-foreground">Loading...</p>
				{:else if status?.connected}
					<div class="space-y-4">
						<div class="space-y-2">
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Athlete ID:</span>
								<span class="font-medium">{status.strava_athlete_id}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Connected:</span>
								<span class="font-medium"
									>{formatDate(status.connected_at)}</span
								>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Last Sync:</span>
								<span class="font-medium">{formatDate(status.last_sync)}</span>
							</div>
						</div>

						<div class="pt-4 border-t">
							<Button
								variant="destructive"
								onclick={handleDisconnect}
								disabled={isDisconnecting}
							>
								{isDisconnecting ? "Disconnecting..." : "Disconnect"}
							</Button>
						</div>
					</div>
				{:else}
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground">
							Connect your Strava account to automatically sync your running
							activities.
						</p>
						<Button onclick={() => goto("/strava/connect")}>
							<svg
								class="w-4 h-4 mr-2"
								fill="currentColor"
								viewBox="0 0 384 512"
							>
								<path
									d="M158.4 0L7 292h113.2L158.4 0zM154.8 512L306.2 220H193l-38.2 292z"
								/>
							</svg>
							Connect to Strava
						</Button>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
