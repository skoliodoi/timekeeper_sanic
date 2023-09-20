<template>
	<div class="ui mini inverted modal">
		<div class="header">Success!</div>
		<div class="content">
			<p>{{ message }}</p>
		</div>
		<div class="center aligned actions">
			<div class="ui positive right labeled icon button">
				Great!
				<i class="checkmark icon"></i>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: ["message"],
	};
</script>

<style>
</style>