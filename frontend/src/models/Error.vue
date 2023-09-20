<template>
	<div
		class="ui centered card"
		style="
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-51%, -50%);
		"
	>
		<div class="ui error message">
			<i class="close icon"></i>
			<div class="header">
				<h4 class="ui huge header">Oops!</h4>
			</div>
			<p>We seem to be having some technical issues. Please try again later!</p>
			<div class="ui fluid accordion" style="text-align: left">
				<div class="title" style="color: #912d2b">
					<i class="dropdown icon"></i>
					See error details:
				</div>
				<div class="content">
					<p>
						{{ errorData }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>


<script>
	export default {
		props: ["errorData"],
		mounted() {
			$(".ui.accordion").accordion();
		},
	};
</script>