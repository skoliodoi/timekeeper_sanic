<template>
	<div class="fourteen wide field" v-if="!selectAllChecked">
		<label style="text-align: left">{{ label }}</label>
		<select
			id="project_dropdown"
			class="ui fluid search dropdown"
			multiple=""
			v-model="$store.state.checkHistory.projects"
		>
			<option
				v-for="each in selectionData"
				:value="each.campaignId"
				:key="each.campaignId"
			>
				{{ each.campaignName }}
			</option>
		</select>
	</div>
	<div
		class="field"
		:class="{ 'three wide': !selectAllChecked, centered: selectAllChecked }"
	>
		<div class="ui checkbox">
			<input
				type="checkbox"
				tabindex="0"
				class="hidden"
				v-model="$store.state.checkHistory.selectAll"
				@change="checkBoxHandler"
			/>
			<label>All campaigns</label>
		</div>
	</div>
</template>

<script>
	export default {
		updated() {
			$("#project_dropdown").dropdown();
		},
		// beforeUnmount() {
		// 	this.$store.state.checkHistory.projects = [];
		// },
		props: ["label", "selectionData", "errorDisplay"],
		methods: {
			checkBoxHandler() {
				if (this.$store.state.checkHistory.selectAll) {
					this.$store.state.checkHistory.projects = [];
				}
			},
		},
		computed: {
			selectAllChecked() {
				if (this.$store.state.checkHistory.selectAll) {
					return true;
				} else {
					return false;
				}
			},
		},
	};
</script>

<style>
	.centered {
		display: flex;
    justify-content: center;
    width: 100%;
	}
</style>