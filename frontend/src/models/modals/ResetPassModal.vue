<template>
	<div class="ui mini inverted modal">
		<div class="header" v-if="user">Change {{ user }}'s password</div>
		<div class="header" v-else>Change your password</div>
		<div class="content">
			<form class="ui form" id="reset_form">
				<div class="field">
					<div class="ui input" :class="{ error: passChange.error }">
						<input
							type="password"
							name="pass"
							placeholder="New password"
							v-model="passChange.newPass"
						/>
					</div>
				</div>
				<div class="field">
					<div class="ui input" :class="{ error: passChange.error }">
						<input
							type="password"
							name="confirm_pass"
							placeholder="Confirm new password"
							v-model="passChange.confirmNewPass"
						/>
					</div>
				</div>
			</form>
			<div class="ui error message" v-if="passChange.error">
				{{ passChange.errorText }}
			</div>
		</div>
		<div class="center aligned actions">
			<div class="ui negative left labeled icon button">
				<i class="times icon"></i>
				Cancel
			</div>
			<div
				class="ui positive right labeled icon button"
				:class="{ loading: passChange.loading }"
			>
				Confirm
				<i class="checkmark icon"></i>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: ["user"],
		computed: {
			passChange() {
				return this.$store.state.passChange;
			},
		},
	};
</script>

<style>
</style>