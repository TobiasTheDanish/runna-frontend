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
	import { getStravaStatus } from "$lib/api/client";

	const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || "";
	const REDIRECT_URI = `${window.location.origin}/strava/callback`;
	const STRAVA_AUTHORIZE_URL = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=activity:read`;

	let isConnected = $state(false);
	let isLoading = $state(true);

	onMount(async () => {
		try {
			const status = await getStravaStatus();
			isConnected = status.connected;
			
			// If already connected, redirect to settings
			if (isConnected) {
				goto("/settings/integrations");
			}
		} catch (err) {
			console.error("Failed to check Strava status:", err);
		} finally {
			isLoading = false;
		}
	});

	function connectToStrava() {
		window.location.href = STRAVA_AUTHORIZE_URL;
	}
</script>

<div class="container mx-auto p-4 max-w-2xl">
	<Card>
		<CardHeader>
			<CardTitle>Connect to Strava</CardTitle>
			<CardDescription>
				Automatically sync your running activities from Strava to Runna
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if isLoading}
				<p class="text-muted-foreground">Checking connection status...</p>
			{:else}
				<div class="space-y-4">
					<div class="space-y-2">
						<h3 class="font-semibold">What you get:</h3>
						<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
							<li>Automatic syncing of your running activities</li>
							<li>Real-time updates when you create, update, or delete activities</li>
							<li>All your runs in one place</li>
							<li>Track your goals with Strava activities</li>
						</ul>
					</div>

					<div class="space-y-2">
						<h3 class="font-semibold">Permissions requested:</h3>
						<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
							<li>Read your public activity data</li>
						</ul>
					</div>

					<Button onclick={connectToStrava} class="w-full" size="lg">
						<svg
							class="w-5 h-5 mr-2"
							fill="currentColor"
							viewBox="0 0 384 512"
						>
							<path
								d="M158.4 0L7 292h113.2L158.4 0zM154.8 512L306.2 220H193l-38.2 292z"
							/>
						</svg>
						Connect with Strava
					</Button>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
