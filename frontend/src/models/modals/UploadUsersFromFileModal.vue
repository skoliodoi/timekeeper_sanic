<template>
	<div class="ui inverted modal" :class="{ mini: !showLogins }">
		<div class="centered header">
			<h1>Success!</h1>
			<div
				style="display: flex; flex-direction: column"
				v-if="showLogins"
			>
				<span>
					Some users were not added, because they are already in the database.
				</span>
				<span> See their logins below:</span>
			</div>
		</div>
		<div class="centered scrolling content" v-if="showLogins">
			<p v-for="login in takenLogins" :key="login">{{ login }}</p>
		</div>
		<div class="centered scrolling content" v-else>
			<p>Users added!</p>
		</div>
		<div class="center aligned actions">
			<div class="ui positive right labeled icon button" @click="$emit('downloadPasswords')">
				Great! Download password information!
				<i class="checkmark icon"></i>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
    emits: ["downloadPasswords"],
		props: ["takenLogins"],
		computed: {
			showLogins() {
				return this.takenLogins.length > 0 ? true : false;
			},
		},
	};
</script>

<style>
</style>