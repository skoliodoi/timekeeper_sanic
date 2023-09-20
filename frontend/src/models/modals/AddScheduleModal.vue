<template>
	<div class="ui inverted modal" id="add-schedule-modal">
		<div class="center aligned header">Attention!</div>
		<div class="center aligned content">
			<p>There is already a schedule present for that project and time period.</p>
			<p>Continuing will replace that schedule.</p>
			<p>Are you sure you want to continue?</p>
		</div>
		<div class="center aligned actions">
			<div class="ui negative left labeled icon button">
				<i class="times icon"></i>
				I changed my mind
			</div>
			<div class="ui positive right labeled icon button" @click="$emit('confirmAction')">
				I'm sure!
				<i class="checkmark icon"></i>
			</div>
		</div>
	</div>
</template>

<script>
</script>

<style>
</style>