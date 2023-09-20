<template>
	<WorkHistoryHeader
		v-if="!isThereObjectToEdit.exists"
		:date="detailData.date"
		:totalTime="detailData.totalTime"
		:totalWork="detailData.workTime"
		:totalBreak="detailData.breakTime"
		:totalOther="detailData.otherTime"
		@returnDate="$emit('returnDate', detailData.date)"
	/>
	<div style="display: flex; justify-content: space-between">
		<div
			class="column project-container"
			:class="{
				'thirteen wide': checkWidth,
				'fourteen wide': !checkWidth,
				'sixteen wide': $store.state.workHistoryModule.hideUserSidebar,
				'extra-padding': $store.state.workHistoryModule.hideUserSidebar,
			}"
			id="time-cards"
		>
			<div>
				<div v-if="!isThereObjectToEdit.exists">
					<div
						class="ui fluid card"
						v-for="each in filterDetailData"
						:key="each"
					>
						<TimeCards
							:id="each.id"
							:login="each.login"
							:workStageId="each.workStageId"
              :projectName="each.projectName"
							:campaignName="each.campaignName"
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
							:currentArray="detailData.details"
							:autoLoggedOut="each.autoLogout"
							:updated="each.updated"
						/>
					</div>
				</div>

				<UpdateOrAddTime
					v-else
					:userId="$store.state.workHistoryModule.userLogin"
					:workStageId="isThereObjectToEdit.object.workStageId"
					:projectName="isThereObjectToEdit.object.projectName"
					:projectCode="isThereObjectToEdit.object.projectCode"
					:campaignName="isThereObjectToEdit.object.campaignName"
					:campaignId="isThereObjectToEdit.object.campaignId"
					:workStage="isThereObjectToEdit.object.workStage"
					:startDate="isThereObjectToEdit.object.startDate"
					:endDate="isThereObjectToEdit.object.endDate"
					:additionalInfo="isThereObjectToEdit.object.additionalInfo"
					:comments="isThereObjectToEdit.object.comments"
					:update="true"
				/>
			</div>
		</div>
	</div>
</template>

<script>
	import TimeCards from "../TimeCards.vue";
	import UpdateOrAddTime from "../../coordinator_components/UpdateOrAddTime.vue";
	import WorkHistoryHeader from "../WorkHistoryHeader.vue";

	import { mapGetters } from "vuex";

	export default {
		props: ["user", "detailData"],
		emits: ["anotherDate", "returnDate"],
		components: {
			TimeCards,
			UpdateOrAddTime,
			WorkHistoryHeader,
		},
		data() {
			return {
				windowWidth: window.innerWidth,
				sortChronologically: true,
			};
		},
		computed: {
			...mapGetters(["workAndBrakeState"]),
			checkWidth() {
				if (this.windowWidth < 1550) {
					return true;
				} else {
					return false;
				}
			},
			isThereObjectToEdit() {
				return this.$store.state.objectToEdit;
			},
			filterDetailData() {
				const detailTable = [];
				for (const each in this.workAndBrakeState) {
					let iterator = this.workAndBrakeState[each];
					if (iterator.displayDate == this.detailData.date) {
						detailTable.push(iterator);
					}
				}
				return detailTable;
			},
			showChronologicalOrder() {
				return this.sortChronologically;
			},
		},
	};
</script>

<style scoped>
	#menu {
		flex: 0.4;
	}

	#time-cards {
		flex: 2;
	}

	.extra-padding {
		padding: 0 14px;
	}

	.project-container {
		height: calc(100vh - 174px);
		overflow: auto;
	}
</style>