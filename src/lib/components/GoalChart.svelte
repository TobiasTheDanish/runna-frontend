<script lang="ts">
	import { cn } from "$lib/utils/cn";
	import { LineChart } from "layerchart";
	import type { GoalProgress } from "$lib/api/client";
	import { ChartContainer, ChartTooltip, type ChartConfig } from "./ui/chart";
	import { getLocalTimeZone, today } from "@internationalized/date";
	import { startOfDay, isAfter, isBefore } from "date-fns";

	let {
		goal,
		height = 200,
		className = "",
	}: {
		goal: GoalProgress;
		height?: number;
		className?: string;
	} = $props();

	// Prepare Data
	let startDate = $derived(new Date(goal.start_date));
	let endDate = $derived(new Date(goal.end_date));

	let chartData = $derived.by(() => {
		const sessions = (goal.sessions ?? []).map((s) => ({
			...s,
			dateStr: s.date,
			date: new Date(s.date),
		}));

		const totalMs = endDate.getTime() - startDate.getTime();
		let actualAcc = 0;
		const points: { date: Date; target: number; actual: number | undefined }[] =
			sessions
				.sort((a, b) => a.date.getTime() - b.date.getTime())
				.map((s) => {
					const date = new Date(s.date);
					const targetProgress = Math.max(
						0,
						Math.min(1, (date.getTime() - startDate.getTime()) / totalMs),
					);

					actualAcc += s.distance;

					return {
						date,
						target: goal.target_distance * targetProgress,
						actual: actualAcc,
					};
				});

		const t = today(getLocalTimeZone());
		const startOfToday = startOfDay(t.toDate(getLocalTimeZone()));

		if (points.length > 0 && isAfter(startOfToday, points.at(-1)!.date)) {
			const targetProgressToday = Math.max(
				0,
				Math.min(1, (startOfToday.getTime() - startDate.getTime()) / totalMs),
			);

			points.push({
				date: startOfToday,
				target: goal.target_distance * targetProgressToday,
				actual: actualAcc,
			});
		} else if (
			points.length == 0 &&
			isBefore(startOfToday, new Date(goal.start_date))
		) {
			points.push({
				date: new Date(goal.start_date),
				target: 0,
				actual: 0,
			});
		}

		return points;
	});

	let statusColor = $derived(goal.status === "Behind" ? "#ef4444" : "#22c55e");
	const chartConfig = $derived.by(
		() =>
			({
				actual: {
					label: "Total",
					color: statusColor,
				},
				target: {
					label: "Target",
					color: "var(--muted-foreground)",
				},
			}) satisfies ChartConfig,
	);
</script>

<div class={cn("w-full flex flex-col select-none", className)}>
	<ChartContainer
		class="w-full relative"
		style="height: {height}px"
		config={chartConfig}
	>
		<LineChart
			data={chartData}
			x="date"
			series={[
				{
					key: "actual",
					color: chartConfig.actual.color,
					label: chartConfig.actual.label,
				},
				{
					key: "target",
					color: chartConfig.target.color,
					label: chartConfig.target.label,
				},
			]}
			padding={{ top: 20, bottom: 20, left: 48, right: 20 }}
			props={{
				yAxis: {
					format: (v: number) => `${v} km`,
				},
				xAxis: {
					format: (d: Date) =>
						d.toLocaleString(undefined, {
							month: "short",
							day: "numeric",
						}),
				},
			}}
		>
			{#snippet tooltip()}
				<ChartTooltip
					labelFormatter={(d: Date) =>
						d.toLocaleString(undefined, {
							year: "2-digit",
							month: "short",
							day: "numeric",
						})}
					valueFormatter={(v: number) =>
						`${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} km`}
				/>
			{/snippet}
		</LineChart>
	</ChartContainer>
</div>
