<template>
  <!-- <div v-if="loadingPage">
		<Loader :data="'Downloading projects...'" />
	</div>
	<Error v-else-if="error" :errorData="error" /> -->

  <div class="ui container">
    <div class="ui grid" id="user-container">
      <div class="ui middle aligned row">
        <div class="column">
          <div
            class="ui fluid card"
            :class="{
              'double blue loading': $store.state.loaders.addUserLoader,
            }"
          >
            <div class="content add-user-header">
              <div class="left floated header add-user-header-left">
                Add new user
              </div>
              <div class="add-user-header-right" v-if="addManually">
                <button
                  type="button"
                  class="ui primary button"
                  @click="addManually = false"
                >
                  Add many users
                </button>
              </div>
              <div class="add-user-header-right" v-else>
                <button
                  type="button"
                  class="ui primary button"
                  @click="addManually = true"
                >
                  Add user manually
                </button>
              </div>
            </div>
            <UploadUserManually v-if="addManually" />
            <UploadUsersFromFile @uploadStatus="manualRegistration" v-else />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UploadUserManually from "./UploadUserManually.vue";
import UploadUsersFromFile from "./UploadUsersFromFile.vue";

export default {
  mounted() {
    $("#user_form").form({
      fields: {
        name: "empty",
        last_name: "empty",
        moccarz_id: "empty",
        login: "empty",
        // project: "empty",
        password: ["minLength[8]", "empty"],
        confirm_password: "match[password]",
      },
    });
    $("#multiple_select").dropdown();
    $("#campaign").dropdown();
    $("#file-projects").dropdown();
    $(`#coordinator_checkbox`).checkbox();
    $(".mini.inverted.modal").modal();
  },
  updated() {
    $("#multiple_select").dropdown();
    $("#campaign").dropdown();
  },
  data() {
    return {
      addManually: true,
      // loadingRegister: false,
      // modalMessage: "",
    };
  },
  components: {
    UploadUserManually,
    UploadUsersFromFile,
  },
  methods: {
    manualRegistration(data) {
      this.addManually = data.changeToManual;
    },
  },
};
</script>

<style scoped>
#user-container {
  height: calc(100vh - 74px);
}
.add-user-header {
  background: #3d698e !important;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
}

.add-user-header-left {
  display: flex !important;
  justify-content: start !important;
  color: whitesmoke !important;
  flex: 1 !important;
}

.add-user-header-right {
  display: flex;
  justify-content: flex-end;
  flex: 1;
}
</style>
