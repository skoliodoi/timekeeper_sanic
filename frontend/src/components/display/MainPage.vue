<template>
	<div v-if="loading">
		<Loader :data="loadingText" />
	</div>
	<!-- <Error v-else-if="error" :errorData="error" /> -->
	<ErrorModal
		v-else-if="error"
		id="main-page-error"
		:message="'There seems to be something wrong!'"
		:errorDetails="error"
	/>
	<div v-else>
		<Navbar />
		<Counter v-if="selectedPage == 'counter'" />
		<WorkHistory v-if="selectedPage == 'work-history'" />
		<UpdateOrAddTime v-if="selectedPage == 'update-time'" />
		<AddUser v-if="selectedPage == 'add-user'" />
		<AddCampaign v-if="selectedPage == 'add-project'" />
		<ProjectsSummaryView v-if="selectedPage == 'projects-list'" />
		<UsersList v-if="selectedPage == 'users-list'" />
		<ControlPanel v-if="selectedPage == 'control-panel'" />
		<Reports v-if="selectedPage == 'reports'" />
		<Schedules v-if="selectedPage == 'schedules'" />
	</div>
</template>

<script>
	import Loader from "../../models/Loader.vue";
	// import Error from "../../models/Error.vue";
	import Navbar from "../../models/Navbar.vue";
	import Counter from "../Counter.vue";
	import WorkHistory from "../work_history_components/WorkHistory.vue";
	import UpdateOrAddTime from "../coordinator_components/UpdateOrAddTime.vue";
	import AddCampaign from "../coordinator_components/AddCampaign.vue";
	import ProjectsSummaryView from "../coordinator_components/ProjectsSummaryView.vue";
	import UsersList from "../coordinator_components/UsersList.vue";
	import AddUser from "../coordinator_components/AddUser.vue";
	import ControlPanel from "../coordinator_components/ControlPanel.vue";
	import Reports from "../coordinator_components/Reports.vue";
	import ErrorModal from "../../models/modals/ErrorModal.vue";
  import Schedules from "../coordinator_components/schedules/SchedulesMain.vue"

	export default {
		components: {
			Navbar,
			Counter,
			// Error,
			Loader,
			WorkHistory,
			UpdateOrAddTime,
			AddCampaign,
			ProjectsSummaryView,
			UsersList,
			AddUser,
			ControlPanel,
			Reports,
			ErrorModal,
      Schedules
		},
		mounted() {
      // this.$store.state.projects.selectedProjectCode = "";
			this.loadPage();
			if (this.error) {
				this.showError();
			}
		},
		updated() {
      // this.$store.state.projects.selectedProjectCode = "";
			this.checkExit();
			if (this.error) {
				this.showError();
			}
		},
		data() {
			return {
				loading: false,
				error: false,
				checkData: false,
			};
		},
		methods: {
			showError() {
				$("#main-page-error")
					.modal({
						class: "mini inverted",
						closable: false,
					})
					.modal("show");
			},
			checkExit() {
				window.addEventListener("beforeunload", (event) => {
					if (!this.$store.state.safeToLeave) {
						event.preventDefault();
						event.returnValue = "";
					}
				});
			},
			async loadPage() {
				this.loading = true;
				// let checkData = false;
				// const update = async () => {
				// 	if (!checkData) {
				// 		checkData = true;
				// 		await this.$store.dispatch("checkToken");
				// 		checkData = false;
				// 	}
				// };
				// setInterval(() => {
				// 	update();
				// }, 5000);

				try {
					await this.$store.dispatch("getCurrentTimer");
				} catch (error) {
					this.error = error;
				}
				this.loading = false;
			},
		},
		computed: {
			loadingText() {
				return this.$store.state.loadingText;
			},
			selectedPage() {
				return this.$store.state.selectedPage;
			},
		},
	};
</script>

<style>
</style>