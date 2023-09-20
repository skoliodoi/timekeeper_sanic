<template>
	<div>
		<h1>Test Page</h1>
		<button class="ui massive facebook button" @click="getData">
			Get data
		</button>
	</div>
</template>

<script>
	import axios from "axios";
  import config from "../../config";

	export default {
		methods: {
			getData() {
				console.log("Getting data...");
				axios
					.get(`${config.apiBaseUrl}/counter`)
					.then((response) => {
						console.log(response);
					})
					.catch((error) => {
						console.log(error);
					});
			},
		},
	};
</script>

<style>
</style>