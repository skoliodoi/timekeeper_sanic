<template>
	<div class="ui modal" id="timer_modal">
		<div class="center aligned header">Attention!</div>
		<div class="center aligned content">
			<p>Are you sure you want to {{firstParagraph}}?</p>
			<p>{{secondParagraph}}</p>
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
	export default {
    props: ['firstParagraph', 'secondParagraph'],
		emits: ['confirmAction'],
  };
</script>

<style>
</style>