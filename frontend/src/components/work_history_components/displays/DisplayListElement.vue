<template>
	<div class="ui raised segment" style="height: ">
		<div class="ui three column stackable grid">
			<div
				class="two wide left aligned column"
				style="
					display: flex;
					flex-direction: column;
					justify-content: space-around;
				"
			>
				<!-- <span class="ui large text"
					><strong>{{ koordynator }}</strong></span
				>
				<span class="ui large text"
					><strong>{{ hasUpperAccess }}</strong></span
				> -->
				<div>
					<span v-if="projectView" class="ui large text"
						><strong>{{ userName }}</strong></span
					>

					<span v-else class="ui large text"
						><strong>{{ dateData }}</strong></span
					>
				</div>
				<div>
					<span v-if="projectView" class="ui medium text">({{ login }})</span>
				</div>
			</div>
			<div
				id="buttons"
				class="two wide left aligned column function-buttons"
				:class="{ 'supervisor-view': !canIEdit }"
			>
				<div class="button-box">
					<button
						id="details-button"
						class="ui labeled icon facebook button"
						@click="showDetails(dateData)"
					>
						<i class="ui search icon"></i> See details
					</button>
				</div>
				<div class="button-box" v-if="canIEdit">
					<button
						id="add-time-button"
						v-if="!showAddTime"
						class="ui labeled icon whatsapp button"
						@click="showAddTime = true"
					>
						<i class="ui plus icon"></i>
						Add time
					</button>
					<button
						v-else
						id="cancel-add-time-button"
						class="ui labeled icon primary button"
						@click="cancelAddTime"
					>
						<i class="ui times icon"></i>
						Cancel
					</button>
				</div>
			</div>
			<div class="twelve wide centered column">
				<div style="display: flex; justify-content: space-around">
					<div class="ui label">
						<strong>Start:</strong>
						{{ startAndEnd.start }}
						<strong>End:</strong>
						{{ startAndEnd.end }}
					</div>
	
					<div class="ui label">
						<strong>Total workday:</strong>
						{{ totalTime.hours }}:{{ totalTime.minutes }}:{{
							totalTime.seconds
						}}
					</div>
					<div class="ui work label">
						<strong>Total work:</strong>
						{{ workTime.hours }}:{{ workTime.minutes }}:{{ workTime.seconds }}
					</div>
					<div class="ui break label">
						<strong>Total break:</strong>
						{{ breakTime.hours }}:{{ breakTime.minutes }}:{{
							breakTime.seconds
						}}
					</div>
					<div class="ui other label">
						<strong>Total other:</strong>
						{{ otherTime.hours }}:{{ otherTime.minutes }}:{{
							otherTime.seconds
						}}
					</div>
				</div>

				<WorkHistoryProgressBar
					style="margin-top: 5px"
					:dataForGoogle="googleData"
				/>
				<div style="display: flex; justify-content: space-around"></div>
			</div>
		</div>
		<QuickAddTime
			:dateForUpdate="dateData"
			:login="login"
			:projectId="campaignId"
			:addProject="!projectView"
			v-if="showAddTime"
			@close="showAddTime = false"
		/>
	</div>
</template>

<script>
	import WorkHistoryProgressBar from "../WorkHistoryProgressBar.vue";
	import QuickAddTime from "../../coordinator_components/QuickAddTime.vue";

	import { mapGetters } from "vuex";
	const { DateTime } = require("luxon");

	export default {
		props: [
			"googleData",
			"login",
			"koordynator",
			"dateData",
			"userName",
			"workTime",
			"breakTime",
			"otherTime",
			"totalTime",
			"campaignId",
			"projectView",
		],
		emits: ["showDetails"],
		data() {
			return {
				showAddTime: false,
			};
		},
		components: { WorkHistoryProgressBar, QuickAddTime },
		computed: {
			...mapGetters(["accessLevel", "hasUpperAccess"]),
			canIEdit() {
				return (!this.koordynator && this.accessLevel == "koordynator") ||
					this.hasUpperAccess
					? true
					: false;
			},
			startAndEnd() {
				const arr = Object.values(this.googleData);
				const start = DateTime.fromSQL(arr[0].work_stage_started).toFormat(
					"HH:mm:ss"
				);
				const end = DateTime.fromSQL(arr.slice(-1)[0].work_stage_ended).toFormat(
					"HH:mm:ss"
				);
				return {
					start,
					end,
				};
				// return this.googleData.map((item) => {
				// 	return {
				// 		start: item.start,
				// 		end: item.end,
				// 	};
				// });
			},
		},
		methods: {
			cancelAddTime() {
				this.showAddTime = false;
				this.$store.state.selectForTimeAddition.project = "";
			},
			showDetails(data) {
				const dataCarrier = this.$store.state.workHistoryModule.dataDetails;
				dataCarrier["date"] = data;
				dataCarrier["workTime"] = this.workTime;
				dataCarrier["breakTime"] = this.breakTime;
				dataCarrier["otherTime"] = this.otherTime;
				dataCarrier["totalTime"] = this.totalTime;
				if (this.projectView) {
					this.$store.state.workHistoryModule.projectDataDetails =
						this.googleData;
					this.$store.state.workHistoryModule.detailsFromProjectView = true;
					this.$store.state.workHistoryModule.projectReturnDetails.returnData =
						this.dateData;
					this.$store.state.workHistoryModule.projectReturnDetails.returnProject =
						this.projectId;
					this.$store.state.timeTable = [];
					let currentId = 0;
					const userDataFromProject =
						this.$store.state.workHistoryModule.projectDataDetails;
					for (const each in userDataFromProject) {
						const iterator = userDataFromProject[each];
            console.log(iterator)
						this.$store.state.workHistoryModule.selectedProject =
							iterator.campaign_id;
						this.$store.state.workHistoryModule.userLogin = iterator.user_id;
						this.$store.dispatch("saveToTimeTable", {
							id: (currentId += 1),
							workStageId: iterator.work_stage_id, // 1
							login: iterator.user_id, // 2
							workStageStarted: iterator.work_stage_started, // 3
							workStageEnded: iterator.work_stage_ended, //4
							workStageDuration: iterator.work_stage_duration, // 5
							workStage: iterator.work_stage, //6
							campaignName: iterator.campaign_name, // 7
							campaignId: iterator.campaign_id, // 7
							projectName: iterator.project_name, // 7
							projectCode: iterator.project_code, // 8
							additionalInfo: iterator.work_stage_additional_info, //9
							comments: iterator.comments, //10
							autoLogout: iterator.auto_logout, //1
							// updated: iterator.update_case,
							updated: null,
						});
					}
					const dataCarrier = this.$store.state.workHistoryModule.dataDetails;
					let detailTable = [];
					for (const each in this.$store.getters.workAndBrakeState) {
						let iterator = this.$store.getters.workAndBrakeState[each];
						if (iterator.displayDate == data) {
							detailTable.push(iterator);
						}
					}
					dataCarrier["details"] = detailTable;
					this.$store.state.workHistoryModule.showDetails = true;
				}
				this.$store.state.workHistoryModule.displayValue = "user";
				this.$store.state.workHistoryModule.displayUserName = this.userName;
				this.$store.state.workHistoryModule.allowedToEdit = this.canIEdit;
				this.$emit("showDetails", data);
			},
		},
	};
</script>

<style scoped>
	.ui.work.label {
		background: #22913c;
		color: white;
	}
	.ui.break.label {
		background: #f6ce58;
		color: #000;
	}
	.ui.other.label {
		background: #864c99;
		color: white;
	}
	#buttons {
		display: flex;
		flex-direction: column !important;
		justify-content: space-around;
		width: 100%;
	}

	#buttons button {
		width: 75% !important;
	}
	.two.wide.left.aligned.column.function-buttons {
		padding: 14px 0;
		display: flex;
		align-items: center;
	}

	.button-box {
		width: 100%;
	}

	.supervisor-view {
		justify-content: center !important;
	}

	@media screen and (max-width: 1536px) {
		#buttons button {
			width: 100% !important;
		}
	}
</style>