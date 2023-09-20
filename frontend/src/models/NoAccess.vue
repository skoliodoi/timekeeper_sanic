<template>
	<div id="no-access" class="ui centered warning message card">
		<div class="content">
			<div class="header">No work data for this date</div>
			<p>Please try a different date</p>
		</div>
		<div class="ui bottom attached brown button" @click="$emit('anotherDate')">Okay</div>
	</div>
</template>

<script>
	export default {
		emits: ["anotherDate"],
	};
</script>

<style scoped>
	#no-access {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-51%, -50%);
	}
</style>