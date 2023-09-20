<template>
	<div class="ui form" v-if="hasAccess">
		<div class="fields">
			<WorkHistoryFilterProjects
				v-if="selection.projectSelection && moreThanOneProjectToChoose"
				:label="selection.selectionLabel"
				:selectionData="selection.selection"
        :errorDisplay="errorData"
			/>
			<WorkHistoryFilterUsers
				v-if="!selection.projectSelection"
				:label="selection.selectionLabel"
				:selectionData="selection.selection"
        :errorDisplay="errorData"
			/>
		</div>
	</div>
</template>

<script>
	import WorkHistoryFilterProjects from "./WorkHistoryFilterProjects.vue";
	import WorkHistoryFilterUsers from "./WorkHistoryFilterUsers.vue";
	export default {
		props: ["selection", "errorData"],
		components: {
			WorkHistoryFilterProjects,
			WorkHistoryFilterUsers,
		},
		computed: {
			hasAccess() {
				return this.$store.getters.hasAccess;
			},
      moreThanOneProjectToChoose() {
        return this.selection.selection.length == 1 ? false : true;
      },
		},
	};
</script>

<style>
</style>