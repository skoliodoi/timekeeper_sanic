<template>
	<div class="field">
		<label style="text-align: left">Assign {{ dataFromServerText }}</label>
		<select
			class="ui fluid search dropdown"
			:name="projectName"
			multiple=""
			:id="selectId"
			v-model="selectedPeople"
			@change="assignPeople(selectedPeople)"
		>
			<option value="">{{ changeDataFromServerText }}</option>
			<option :value="each.login" v-for="each in dataFromServer" :key="each">
				<strong>{{ each.full_name }}</strong> ({{ each.login }}) 
			</option>
		</select>
	</div>
</template>

<script>
	export default {
		props: ["dataFromServer", "dataFromServerText", "selectId", "projectName"],
		data() {
			return {
				selectedPeople: [],
				addAnotherPerson: false,
				// itemCount: 0,
				assignablePeople: [],
			};
		},
		computed: {
			showAddAnotherPerson() {
				return this.addAnotherPerson;
			},
			changeDataFromServerText() {
				return this.dataFromServerText[0].toUpperCase()+this.dataFromServerText.substring(1);
			},
		},
		methods: {
			assignPeople(val) {
				this.$emit("assignPeople", val);
			},
		},
	};
</script>

<style>
</style>