<template>
	<div class="ui active very light dimmer">
		<div class="ui active fast medium white double text loader" style="color: whitesmoke">{{ data }}</div>
	</div>
</template>

<script>
	export default {
		props: ["data"],
	};
</script>

<style>
</style>