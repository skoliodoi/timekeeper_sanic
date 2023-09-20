<template>
	<div class="ui inverted segment history-header">
		<div class="button-column">
			<button class="ui inverted button" @click="returnHandler">Go back</button>
		</div>
		<div class="ui big grey inverted basic label user-summary-column">
			<div>{{ $store.state.workHistoryModule.displayUserName }}</div>
			<div>{{ date }}</div>
		</div>
		<div class="time-figures-column">
			<div class="label-row">
				<div class="ui large grey inverted basic label">
					Total duration: {{ totalTime.hours }}:{{ totalTime.minutes }}:{{
						totalTime.seconds
					}}
				</div>
				<div class="ui large grey inverted basic label">
					Total work duration: {{ totalWork.hours }}:{{ totalWork.minutes }}:{{
						totalWork.seconds
					}}
				</div>
				<div class="ui large grey inverted basic label">
					Total break duration: {{ totalBreak.hours }}:{{
						totalBreak.minutes
					}}:{{ totalBreak.seconds }}
				</div>
				<div class="ui large grey inverted basic label">
					Total additional time-off duration:
					{{ totalOther.hours }}:{{ totalOther.minutes }}:{{
						totalOther.seconds
					}}
				</div>
			</div>
		</div>
	</div>
	<!-- <div class="ui info message">
		<div class="ui stackable grid">
			<div class="two wide column">
				<div class="ui facebook button" @click="returnHandler">Return</div>
			</div>
			<div class="six wide centered column">
				<h1 class="ui header">
					{{ $store.state.workHistoryModule.displayUserName }}
				</h1>
			</div>
			<div class="two wide centered column">
				<h1 class="ui header">
					{{ date }}
				</h1>
			</div>
			<div class="six wide column">
				<h2 class="ui header">
					Total workday duration:
					{{ totalTime.hours }}:{{ totalTime.minutes }}:{{ totalTime.seconds }}
				</h2>
			</div>
		</div>
		<div class="ui divider"></div>
		<div class="ui stackable grid">
			<div class="ui equal width row" style="font-weight: 500">
				<div class="column">
					<div>
						Total work duration:
						{{ totalWork.hours }}:{{ totalWork.minutes }}:{{
							totalWork.seconds
						}}
					</div>
				</div>
				<div class="column">
					<div>
						Total break duration:
						{{ totalBreak.hours }}:{{ totalBreak.minutes }}:{{
							totalBreak.seconds
						}}
					</div>
				</div>
				<div class="column">
					<div>
						Total additional time-off duration:
						{{ totalOther.hours }}:{{ totalOther.minutes }}:{{
							totalOther.seconds
						}}
					</div>
				</div>
			</div>
		</div>
		<div class="ui divider"></div>
	</div> -->
</template>

<script>
	// import QuickAddTime from "../../coordinator_components/QuickAddTime.vue";
	export default {
		props: ["date", "totalTime", "totalWork", "totalBreak", "totalOther"],
		emits: ["returnDate"],
		components: {
			// QuickAddTime,
		},
		methods: {
			returnHandler() {
				this.$emit("returnDate", this.date);
				if (this.$store.state.workHistoryModule.detailsFromProjectView) {
					this.$store.state.workHistoryModule.projectReturnDetails.returnDate =
						this.date;
				}
			},
		},
		computed: {
			showReturnButton() {
				return this.$store.state.workHistoryModule.showReturnButton;
			},
		},
	};
</script>

<style scoped>
	.ui.inverted.segment.history-header {
		margin: 0 0 14px 0;
		display: flex;
		align-items: center;
		background: #3D698E;
    margin: 0;
	}
	.ui.grey.inverted.basic.label {
		background-color: transparent !important;
	}
	.label-row {
		display: flex;
		justify-content: space-around;
		padding: 5px;
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
</style>