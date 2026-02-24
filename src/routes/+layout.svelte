<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="border-b bg-background">
	<div class="container mx-auto flex h-16 items-center px-4">
		<div class="mr-8 font-bold text-xl">Runna</div>
		<div class="flex gap-6 text-sm font-medium">
			<a href="/" class="transition-colors hover:text-foreground/80 text-foreground/60">Sessions</a>
			<a href="/goals" class="transition-colors hover:text-foreground/80 text-foreground/60">Goals</a>
		</div>
	</div>
</nav>

{@render children()}
