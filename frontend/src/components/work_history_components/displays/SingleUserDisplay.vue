<template>
	<Loader v-if="loadingPage" :data="'Updating history...'" />
	<div v-else>
		<div v-if="!showDetails">
			<WorkHistoryHeader
				:date="selectedPeriod"
				:totalTime="totalDuration"
				:totalWork="totalWorkDuration"
				:totalBreak="totalBreakDuration"
				:totalOther="totalExtraBreakDuration"
        @returnDate="chooseAnotherDate"
			/>
			<div class="project-container">
				<!-- <div class="ui inverted segment history-header">
				<div class="button-column">
					<button class="ui facebook button" @click="$emit('anotherDate')">
						Go back
					</button>
				</div>
				<div class="ui big grey inverted basic label user-summary-column">
					<div>{{ user }}'s summary</div>
					<div>{{ selectedPeriod }}</div>
				</div>
				<div class="time-figures-column">
					<div class="label-row">
						<div class="ui large grey inverted basic label">
							Total duration: {{ totalDuration.hours }}:{{
								totalDuration.minutes
							}}:{{ totalDuration.seconds }}
						</div>
						<div class="ui large grey inverted basic label">
							Total work duration: {{ totalWorkDuration.hours }}:{{
								totalWorkDuration.minutes
							}}:{{ totalWorkDuration.seconds }}
						</div>
						<div class="ui large grey inverted basic label">
							Total break duration: {{ totalBreakDuration.hours }}:{{
								totalBreakDuration.minutes
							}}:{{ totalBreakDuration.seconds }}
						</div>
						<div class="ui large grey inverted basic label">
							Total additional time-off duration:
							{{ totalExtraBreakDuration.hours }}:{{
								totalExtraBreakDuration.minutes
							}}:{{ totalExtraBreakDuration.seconds }}
						</div>
					</div>
				</div>
			</div> -->
				<div v-for="(historyData, date) in groupDataForProgressBar" :key="date">
					<DisplayUserListElement
						:dateData="date"
						:userData="groupDataForProgressBar"
						:userName="user"
						:login="$store.state.workHistoryModule.userLogin"
						:koordynator="historyData.koordynator"
						:workTime="historyData.workDay.workTime"
						:breakTime="historyData.workDay.breakTime"
						:otherTime="historyData.workDay.otherTime"
						:totalTime="historyData.workDay.total"
						:projectView="false"
						:projectId="null"
						:googleData="historyData.details"
						@showDetails="showHistoryDetails"
					/>
				</div>
			</div>
		</div>
		<DisplayDetails
			v-else
			:detailData="$store.state.workHistoryModule.dataDetails"
			@returnDate="$emit('returnDate', data)"
		/>
	</div>
</template>

<script>
	import WorkHistoryHeader from "../WorkHistoryHeader.vue";
	import DisplayUserListElement from "./DisplayListElement.vue";
	import DisplayDetails from "./DisplayDetails.vue";
	import Loader from "../../../models/Loader.vue";

	import { mapGetters } from "vuex";

	export default {
		props: ["user"],
		emits: ["anotherDate", "returnDate"],
		components: {
			DisplayUserListElement,
			DisplayDetails,
			Loader,
			WorkHistoryHeader,
		},
		data() {
			return {
				windowWidth: window.innerWidth,
				sortChronologically: true,
				userLogin: "",
			};
		},
		computed: {
			...mapGetters(["workAndBrakeState", "showDetails"]),
			showHistory() {
				return this.$store.state.showHistory;
			},
			loadingPage() {
				return this.$store.state.workHistoryModule.loadingPage;
			},
			checkWidth() {
				if (this.windowWidth < 1550) {
					return true;
				} else {
					return false;
				}
			},
			selectedPeriod() {
				if (
					this.$store.state.timeFromCalendar.start ==
					this.$store.state.timeFromCalendar.end
				) {
					return this.$store.state.timeFromCalendar.start;
				} else {
					return `${this.$store.state.timeFromCalendar.start} - ${this.$store.state.timeFromCalendar.end}`;
				}
			},

			totalDuration() {
				return this.$store.state.scriptDuration;
			},
			totalWorkDuration() {
				return this.$store.state.workTime.totalDuration;
			},
			totalBreakDuration() {
				return this.$store.state.breakTime.totalDuration;
			},
			totalExtraBreakDuration() {
				return this.$store.state.extraBreakTime.totalDuration;
			},
			// isThereObjectToEdit() {
			// 	return this.$store.state.objectToEdit;
			// },

			groupByDate() {
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

				let groupedTable = groupBy(this.workAndBrakeState, "displayDate");

				let newObj = {};

				for (const project in groupedTable) {
					let initWorkTime = 0;
					let displayWorkTime = {
						hours: 0,
						minutes: 0,
						seconds: 0,
					};
					let initBreakTime = 0;
					let displayBreakTime = {
						hours: 0,
						minutes: 0,
						seconds: 0,
					};
					let initExtraBreakTime = 0;
					let displayExtraBreakTime = {
						hours: 0,
						minutes: 0,
						seconds: 0,
					};
					let initTotalTime = 0;
					let displayTotalTime = {
						hours: 0,
						minutes: 0,
						seconds: 0,
					};
					newObj[project] = {
						data: groupedTable[project],
						totalWorkTime: {},
						totalBreakTime: 0,
						totalExtraBreakTime: 0,
						totalTime: 0,
					};
					for (const each of groupedTable[project]) {
						initTotalTime += parseInt(each.workStageDuration);
						newObj[project].totalTime = initTotalTime;
						if (each.workStage == this.$store.state.workStage.choiceOptions[1]) {
							initWorkTime += parseInt(each.workStageDuration);
							newObj[project].totalWorkTime = initWorkTime;
						} else if (
							each.workStage == this.$store.state.workStage.choiceOptions[2]
						) {
							initBreakTime += parseInt(each.workStageDuration);
							newObj[project].totalBreakTime = initBreakTime;
						} else {
							initExtraBreakTime += parseInt(each.workStageDuration);
							newObj[project].totalExtraBreakTime = initExtraBreakTime;
						}
						this.$store.dispatch("durationDisplayHandler", {
							duration: initWorkTime,
							timeToDisplay: displayWorkTime,
						});
						newObj[project].totalWorkTime = displayWorkTime;

						this.$store.dispatch("durationDisplayHandler", {
							duration: initBreakTime,
							timeToDisplay: displayBreakTime,
						});
						newObj[project].totalBreakTime = displayBreakTime;

						this.$store.dispatch("durationDisplayHandler", {
							duration: initExtraBreakTime,
							timeToDisplay: displayExtraBreakTime,
						});
						newObj[project].totalExtraBreakTime = displayExtraBreakTime;

						this.$store.dispatch("durationDisplayHandler", {
							duration: initTotalTime,
							timeToDisplay: displayTotalTime,
						});
						newObj[project].totalTime = displayTotalTime;
					}
				}
				return newObj;
			},
			groupDataForProgressBar() {
				let newObj = {};
				for (const each in this.groupByDate) {
					newObj[each] = {
						workDay: {
							workTime: this.groupByDate[each].totalWorkTime,
							breakTime: this.groupByDate[each].totalBreakTime,
							otherTime: this.groupByDate[each].totalExtraBreakTime,
							total: this.groupByDate[each].totalTime,
						},
						details: {},
					};
					for (const table in this.groupByDate[each].data) {
						const tableValue = this.groupByDate[each].data[table];
						newObj[each]["koordynator"] =
							tableValue.koordynator == "1" ? true : false;
						newObj[each]["details"][table] = {
							user_id: tableValue.login,
							work_stage_id: tableValue.workStageId,
							work_stage: tableValue.workStage,
							work_stage_additional_info: tableValue.additionalInfo,
							project_name: tableValue.projectName,
							project_code: tableValue.projectCode,
							campaign_name: tableValue.campaignName,
							campaign_id: tableValue.campaignId,
							comments: tableValue.comments,
							work_stage_started: tableValue.workStageStarted,
							work_stage_ended: tableValue.workStageEnded,
							work_stage_duration: tableValue.workStageDuration,
							auto_logout: tableValue.autoLogout,
							displayStageDuration: tableValue.displayStageDuration,
						};
					}
				}
				return newObj;
			},
			// showChronologicalOrder() {
			// 	return this.sortChronologically;
			// },
		},
		methods: {
			chooseAnotherDate() {
				this.$emit("anotherDate");
			},
			showHistoryDetails(val) {
				const dataCarrier = this.$store.state.workHistoryModule.dataDetails;
				let detailTable = [];
				for (const each in this.workAndBrakeState) {
					let iterator = this.workAndBrakeState[each];
					if (iterator.displayDate == val) {
						detailTable.push(iterator);
					}
				}
				dataCarrier["details"] = detailTable;
				this.$store.state.workHistoryModule.showDetails = true;
			},
		},
	};
</script>

<style scoped>
	/* #menu {
				flex: 0.4;
			}

			.label-row {
				display: flex;
				justify-content: space-around;
				padding: 5px;
			}

			.ui.inverted.segment.history-header {
				margin: 0 0 14px 0;
				display: flex;
				align-items: center;
				background: #6a6e72;
			}

			.ui.grey.inverted.basic.label {
				background-color: transparent !important;
			}

			.button-column {
				flex: 0.3;
			}
			.user-summary-column {
				flex: 1;
			}

			.time-figures-column {
				flex: 2.5;
			}

			#time-cards {
				flex: 2;
			}

			.extra-padding {
				padding: 0 14px;
			} */

	.project-container {
		height: calc(100vh - 174px);
		overflow: auto;
	}
</style>