<template>
	<div style="height: 4rem; width: 100%;">
		<GChart
			:settings="{ packages: ['timeline'] }"
			:data="checkGoogleData"
			:options="chartOptions"
			type="Timeline"
		/>
	</div>
</template>

<script>
	import { GChart } from "vue-google-charts";
	export default {
		components: { GChart },
		props: ["dataForGoogle"],
		data() {
			return {
				chartOptions: {
					legend: "none",
					timeline: {
						showRowLabels: false,
						showBarLabels: false,
					},
				},
			};
		},
		computed: {
			workStages() {
				return this.$store.state.workStage.choiceOptions;
			},
			checkGoogleData() {
				let googleDataTable = [
					[
						{ type: "string", id: "Label" },
						{ type: "string", id: "Name" },
						{ type: "string", id: "style", role: "style" },
						{ type: "date", id: "Start" },
						{ type: "date", id: "End" },
					],
				];
				for (const each in this.dataForGoogle) {
          const record = this.dataForGoogle[each]
					const stage = record.work_stage != this.workStages[3] ? record.work_stage : record.work_stage_additional_info;
          const stageAndProject = `${record.campaign_name} - ${stage}`
					let dataTable = [
						"Start/End",
						stageAndProject,
						stage == this.workStages[1] ? "#22913c" : stage == this.workStages[2] ? "#f6ce58" : "#864c99",
						new Date(record.work_stage_started),
						new Date(record.work_stage_ended),
					];
					googleDataTable.push(dataTable);
				}
				return googleDataTable;
			},
			// setDataValue() {
			// 	const dataValue = `${Math.floor(
			// 		this.workDuration.workTime
			// 	)}, ${Math.floor(this.workDuration.breakTime)}, ${Math.floor(
			// 		this.workDuration.otherTime
			// 	)}`;
			// 	return dataValue;
			// },
			// setDataTooltip() {
			// 	const tooltip = `${this.dataForGoogle}`;
			// 	return tooltip;
			// },
		},
	};
</script>

<style scoped>

</style>