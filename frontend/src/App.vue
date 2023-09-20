<template>
	<div>
		<router-view> </router-view>
	</div>
</template>

<script>
	export default {
		name: "App",
		components: {},
		computed: {
			showPage() {
				return this.$store.state.showPage;
			},
		},
	};
</script>

<style>
	#app {
		font-family: 'Roboto', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
	}
	body {
		background: #AEC6CF;
	}
</style>
