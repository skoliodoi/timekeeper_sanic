<template>
	<div class="ui mini inverted modal">
		<div class="centered header">
			<h1>Oops!</h1>
		</div>
		<div class="centered content">
			<p>{{ message }}</p>
		</div>
		<div class="center aligned actions">
			<div
				class="ui negative left labeled icon button"
				@click="$emit('clearFile')"
			>
				I understand
				<i class="times icon"></i>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		emits: ["clearFile"],
		props: ["message"],
		computed: {
			showLogins() {
				return this.takenLogins.length > 0 ? true : false;
			},
		},
	};
</script>

<style>
</style>