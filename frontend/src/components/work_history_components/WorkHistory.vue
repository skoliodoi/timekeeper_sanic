<template>
	<div class="ui grid" id="history_container" v-if="showCalendar">
		<div class="ui middle aligned row">
			<div class="column">
				<WorkHistorySearch @calendarAction="workDisplayHandler" />
			</div>
		</div>
	</div>

	<Loader v-else-if="loadingPage" :data="'Fetching history...'" />
	<Error
		v-else-if="$store.state.errors.workHistoryError.connectionError"
		:errorData="err.connectionErrorData"
	/>
	<WorkHistoryDisplay
		v-else-if="$store.state.showHistory"
		:display="displayValue"
		:user="checkUserName"
		@anotherDate="chooseAnotherDate"
	/>
	<NoAccess v-else @anotherDate="chooseAnotherDate" />
</template>

<script>
	import Error from "../../models/Error.vue";
	import NoAccess from "../../models/NoAccess.vue";
	import Loader from "../../models/Loader.vue";
	import WorkHistorySearch from "./WorkHistorySearch.vue";
	import WorkHistoryDisplay from "./displays/WorkHistoryDisplay.vue";
	import { mapGetters } from "vuex";

	// const { DateTime } = require("luxon");
	export default {
		data() {
			return {
				displayValue: "user",
				// checked: false,
				// errorData: { error: false, errorText: "" },
				// selectedUser: "",
				userLogin: "",
				userName: "",
				showCalendar: true,
				// showSelectUser: true,
			};
		},
		mounted() {
			// $(".ui.dropdown").dropdown();
			// $(".ui.checkbox").checkbox();
			this.$store.state.loaders.workHistoryLoader = false;
			this.$store.state.errors.workHistoryError.connectionError = false;
			this.$store.state.workHistoryModule.detailsFromProjectView = false;
			this.$store.state.controlPanel = false;
			this.$store.state.workHistoryModule.showDetails = false;
			// this.$store.state.historyByProject = "";
			window.onresize = () => {
				this.windowWidth = window.innerWidth;
			};
		},
		updated() {
			this.$store.state.controlPanel = false;
			this.$store.state.workHistoryModule.detailsFromProjectView = false;
			this.$store.state.workHistoryModule.showDetails = false;
		},
		beforeUnmount() {
			this.$store.dispatch("getCurrentHistory");
			this.chooseAnotherDate();
		},
		components: {
			WorkHistorySearch,
			WorkHistoryDisplay,
			NoAccess,
			Error,
			Loader,
			// TimeCards,
			// UpdateOrAddTime,
		},
		computed: {
			...mapGetters([
				"workAndBrakeState",
				"showSeconds",
				"showMinutes",
				"showHours",
				"hasAccess",
				"hasUpperAccess",
				"sortUsers",
				"accessLevel",
			]),
			loadingPage() {
				return this.$store.state.loaders.workHistoryLoader;
			},

			deletingTime() {
				return this.$store.state.loaders.deletingTimeLoader;
			},
			checkUserName() {
				return this.userName;
			},
			err() {
				return this.$store.state.errors.workHistoryError;
			},
			accessLevel() {
				return this.$store.state.loggedUserData.accessLevel;
			},
			// userList() {
			//   if (this.accessLevel == "projectOwner" || this.accessLevel == "admin") {
			//     return this.sortUsers.allUsers;
			//   } else if (this.accessLevel == "koordynator") {
			//     return this.sortUsers.users;
			//   } else {
			//     return null;
			//   }
			// },
		},

		methods: {
			chooseAnotherDate() {
				this.showCalendar = true;
				this.selectedUser = "";
				this.checked = false;
				this.showSelectUser = true;
				this.$store.state.timeFromCalendar.start = "";
				this.$store.state.timeFromCalendar.end = "";
				this.$store.state.checkHistory.projects = [];
				this.$store.state.workHistoryModule.userLogin = "";
				this.$store.state.workHistoryModule.displayUserName = "";
				this.$store.state.workHistoryModule.projectReturnDetails = {};
				this.$store.state.checkHistory.selectAll = false;
			},
			workDisplayHandler(data) {
				this.showCalendar = data.showCalendar;
				this.userName = data.user;
				this.displayValue = data.display;
			},
		},
	};
</script>

<style scoped>
	#history_container {
		height: calc(100vh - 60px);
	}

	#time-cards {
		height: calc(100vh - 60px);
		width: 100%;
		overflow: auto;
	}

	#menu {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-bottom: 0;
	}

	.ui.grid {
		margin-top: -1rem;
		margin-bottom: -1rem;
		margin-left: -1rem;
		margin-right: 0;
	}

	/* width */
	::-webkit-scrollbar {
		width: 10px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
		background: #888;
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>