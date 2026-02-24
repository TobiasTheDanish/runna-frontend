<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { connectStrava } from "$lib/api/client";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";

	let status = $state<"processing" | "success" | "error">("processing");
	let errorMessage = $state("");

	onMount(async () => {
		const code = $page.url.searchParams.get("code");
		const error = $page.url.searchParams.get("error");

		if (error) {
			status = "error";
			errorMessage = "Authorization was cancelled or failed";
			return;
		}

		if (!code) {
			status = "error";
			errorMessage = "No authorization code received";
			return;
		}

		try {
			await connectStrava(code);
			status = "success";
			
			// Redirect to settings page after 2 seconds
			setTimeout(() => {
				goto("/settings/integrations");
			}, 2000);
		} catch (err) {
			status = "error";
			errorMessage =
				err instanceof Error ? err.message : "Failed to connect to Strava";
		}
	});
</script>

<div class="container mx-auto p-4 max-w-2xl">
	<Card>
		<CardHeader>
			<CardTitle>
				{#if status === "processing"}
					Connecting to Strava...
				{:else if status === "success"}
					Successfully Connected!
				{:else}
					Connection Failed
				{/if}
			</CardTitle>
			<CardDescription>
				{#if status === "processing"}
					Please wait while we connect your Strava account
				{:else if status === "success"}
					Your Strava account has been connected successfully. Redirecting...
				{:else}
					There was a problem connecting your Strava account
				{/if}
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if status === "processing"}
				<div class="flex items-center justify-center p-8">
					<div
						class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
					></div>
				</div>
			{:else if status === "error"}
				<div class="space-y-4">
					<p class="text-destructive">{errorMessage}</p>
					<a
						href="/strava/connect"
						class="inline-block text-primary hover:underline"
					>
						Try again
					</a>
				</div>
			{:else}
				<div class="flex items-center justify-center p-8">
					<svg
						class="w-16 h-16 text-green-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
