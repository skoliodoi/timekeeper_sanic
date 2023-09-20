<template>
	<div class="ui red fixed nag" id="fixednag">
		<strong style="color: whitesmoke">{{ errorMessage }}</strong>
		<i class="close icon"></i>
	</div>
	<div style="height: 100vh" class="ui centered grid">
		<div class="ui middle aligned row">
			<div
				class="column"
				style="display: flex; justify-content: center; align-items: center"
			>
				<div class="ui form">
					<div class="ui cards" style="justify-content: center">
						<div class="ui card" style="margin: 0">
							<div class="ui fluid image">
								<img src="../assets/timekeeper_square.svg" alt="" />
							</div>
						</div>
						<div class="ui card" style="margin: 0">
							<div class="content">
								<div class="field" :class="{ error }">
									<label style="text-align: left">Login</label>
									<input
										name="login"
										class="ui focus input"
										type="text"
										v-model="userData.login"
										placeholder="Enter login"
									/>
								</div>

								<div class="field" :class="{ error }">
									<label style="text-align: left">Password</label>
									<input
										name="pass"
										class="ui focus input"
										type="password"
										placeholder="Enter password"
										v-model="userData.pass"
										@keyup.enter="login"
									/>
								</div>
							</div>
							<div
								class="ui bottom attached instagram button"
								:class="{ loading, negative: error }"
								@click="login"
							>
								{{ buttonText }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	// import store from "@/store";
	// import qs from 'qs';
	// import axios from "axios";
	// import config from "../config";
	export default {
		data() {
			return {
				userData: {
					login: "",
					pass: "",
					token: "",
				},
        errorMessage: 'Dupa',
				error: false,
				loading: false,
			};
		},
		computed: {
			headerText() {
				return this.error ? "Incorrect credentials!" : "Log In";
			},
			buttonText() {
				return this.error ? "Try again!" : "Log In";
			},
		},
		methods: {
			showNag() {
				$("#fixednag").nag({ persist: true });
			},
			async login() {
				if ($(".ui.form").form("is valid")) {
					this.loading = true;
					await this.$store
						.dispatch("login", {
							login: this.userData.login,
							password: this.userData.pass,
						})
						.catch((error) => {
							console.log(error);
							if (error.response.status == 401) {
								console.log(error.response.data.message);
							}
							this.error = true;
              this.errorMessage = error.response.data.message;
							this.showNag();
						});
					this.loading = false;
					this.$router.push({ name: "main-page" });
					// const checkToken = setTimeout(()=>{
					//   if (config.token) {
					//     this.$router.push(({ name: "main-page" }))
					//   } else {
					//     checkToken();
					//   }
					// }, 1000)

					// const userLogin = this.$store.state.loggedUserData.login;
					// await this.$store.dispatch("getProjects", userLogin);

					// await axios
					// 	.post(`${config.apiBaseUrl}/login`, {
					// 		login: this.userData.login,
					// 		password: this.userData.pass,
					// 	})
					// 	.then((response) => {
					// 		sessionStorage.setItem("user", response.data.user);
					// 		sessionStorage.setItem("token", response.data.token);
					// 		// store.state.loggedUserData.coordinator =
					// 		// 	response.data.user.koordynator == 1 ? true : false;
					// 		// store.state.loggedUserData.login = response.data.user.login;
					// 		this.$router.push({ name: "main-page" });
					// 	})
					// 	.catch((error) => {
					// 		console.log(error.response.data);
					// 		this.error = true;
					// 	});
				}
			},
		},
	};
</script>

<style>
</style>