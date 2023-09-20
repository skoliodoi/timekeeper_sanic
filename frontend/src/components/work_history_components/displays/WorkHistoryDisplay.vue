<template>
	<UserDisplay
		v-if="displayValue == 'user'"
		:user="user"
		@anotherDate="anotherDate"
		@returnDate="returnDateHandler"
	/>
	<ProjectDisplay
		@checkDifferentDate="anotherDate"
		:propsDate="$store.state.workHistoryModule.projectReturnDetails.returnDate"
		v-else
	/>
</template>

<script>
	import ProjectDisplay from "./ProjectDisplay.vue";
	import UserDisplay from "./SingleUserDisplay.vue";
	export default {
		props: ["display", "user"],
		emits: ["anotherDate"],
		components: {
			ProjectDisplay,
			UserDisplay,
		},
		data() {
			return {
				returnedDate: null,
			};
		},
		computed: {
			displayValue() {
				return this.$store.state.workHistoryModule.displayValue;
			},
		},
		methods: {
			anotherDate() {
				this.$emit("anotherDate");
			},
			returnDateHandler(val) {
				if (this.$store.state.workHistoryModule.detailsFromProjectView) {
					this.$store.state.workHistoryModule.displayValue = "project";
				} else {
					this.$store.state.workHistoryModule.showDetails = false;
				}
				this.returnedDate = val;
			},
		},
	};
</script>

<style>
</style>