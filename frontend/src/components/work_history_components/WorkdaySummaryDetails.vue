<template>
	<div v-for="(value, name) in projectsTable" :key="name">
		<div class="ui compact info message">
			<div class="ui large header">{{ name }}</div>
		</div>
		<div style="margin-bottom: 10px">
			<div v-if="value.workTable">
				<div class="ui medium header">{{ workstage[1] }}</div>
				<div class="ui three stackable cards" style="padding: 0 35px">
					<div v-for="each in value.workTable" :key="each.id" class="ui card">
						<TimeCards
							:id="each.id"
							:workStageId="each.workStageId"
							:projectName="each.projectName"
							:projectId="each.projectId"
							:workStage="each.workStage"
							:additionalInfo="each.additionalInfo"
							:startTime="each.startTime"
							:stopTime="each.stopTime"
							:workDate="each.startDate"
							:hours="each.displayStageDuration.hours"
							:minutes="each.displayStageDuration.minutes"
							:seconds="each.displayStageDuration.seconds"
							:comments="each.comments"
							:autoLoggedOut="each.autoLogout"
							:currentArray="value.workTable"
						/>
					</div>
				</div>
			</div>
			<div v-if="value.breakTable">
				<div class="ui medium header">{{ workstage[2] }}</div>
				<div class="ui three stackable cards" style="padding: 0 35px">
					<div v-for="each in value.breakTable" :key="each" class="ui card">
						<TimeCards
							:id="each.id"
							:workStageId="each.workStageId"
							:projectName="each.projectName"
							:projectId="each.projectId"
							:workStage="each.workStage"
							:additionalInfo="each.additionalInfo"
							:workDate="each.startDate"
							:startTime="each.startTime"
							:stopTime="each.stopTime"
							:hours="each.displayStageDuration.hours"
							:minutes="each.displayStageDuration.minutes"
							:seconds="each.displayStageDuration.seconds"
							:comments="each.comments"
							:currentArray="value.extraBreakTable"
						/>
					</div>
				</div>
			</div>
			<div v-if="value.extraBreakTable">
				<div class="ui medium header">{{ workstage[3] }}</div>

				<div class="ui three stackable cards" style="padding: 0 35px">
					<div
						v-for="each in value.extraBreakTable"
						:key="each"
						class="ui card"
					>
						<TimeCards
							:id="each.id"
							:workStageId="each.workStageId"
							:projectName="each.projectName"
							:projectId="each.projectId"
							:workStage="each.workStage"
							:additionalInfo="each.additionalInfo"
							:workDate="each.startDate"
							:startTime="each.startTime"
							:stopTime="each.stopTime"
							:hours="each.displayStageDuration.hours"
							:minutes="each.displayStageDuration.minutes"
							:seconds="each.displayStageDuration.seconds"
							:comments="each.comments"
							:currentArray="value.extraBreakTable"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import TimeCards from "./TimeCards.vue";
	export default {
		components: {
			TimeCards,
		},
		computed: {
			projectsTable() {
				function groupBy(arr, property) {
					return arr.reduce(function (acc, obj) {
						let key = obj[property];
						if (!acc[key]) {
							acc[key] = [];
						}
						acc[key].push(obj);
						return acc;
					}, {});
				}

				let groupedTable = groupBy(
					this.$store.getters.workAndBrakeState,
					"projectName"
				);
				let newObj = {};

				for (const project in groupedTable) {
					newObj[project] = {};
					let workTable = [];
					let breakTable = [];
					let extraBreakTable = [];
					for (const each of groupedTable[project]) {
						if (each.workStage == this.$store.state.workStage.choiceOptions[1]) {
							workTable.push(each);
							newObj[project].workTable = workTable;
						} else if (
							each.workStage == this.$store.state.workStage.choiceOptions[2]
						) {
							breakTable.push(each);
							newObj[project].breakTable = breakTable;
						} else {
							extraBreakTable.push(each);
							newObj[project].extraBreakTable = extraBreakTable;
						}
					}
				}
				return newObj;
			},
			workstage() {
				return this.$store.state.workStage.choiceOptions;
			},
		},
	};
</script>

<style>
</style>