<template>
  <div
    class="ui top stackable menu"
    style="border-bottom-width: 0px; border-top-width: 0px; margin-bottom: 0"
  >
    <Loader
      :data="'Please wait, changing password...'"
      v-if="$store.state.passChange.loading"
    />
    <ResetPassModal id="reset_pass" />
    <div class="borderless fitted item">
      <div class="ui image">
        <img src="../assets/timekeeper_wert.svg" alt="" style="height: 60px" />
      </div>
    </div>

    <a
      class="item"
      v-if="!hasUpperAccess"
      :class="{ active: showActivePage == 'counter' }"
      @click="goTo('counter')"
      >Counter</a
    >
    <a
      class="item"
      v-if="hasAccess"
      :class="{
        active: showActivePage == 'control-panel' || $store.state.controlPanel,
      }"
      @click="goTo('control-panel')"
      >Control Panel</a
    >
    <a
      class="item"
      :class="{ active: showActivePage == 'work-history' }"
      @click="goTo('work-history')"
      >History</a
    >


      <!-- <div class="item"><i class="coffee icon"></i><strong>3</strong></div> -->

    <div class="right menu">
      <div class="item">
        <strong>Hi, {{ $store.state.loggedUserData.name }}!</strong>
      </div>
      <div class="item">
        <button
          class="ui icon facebook labeled button"
          @click="resetPass($store)"
        >
          <i class="ui user lock icon"></i>
          Change password
        </button>
      </div>
      <div class="item">
        <button class="ui icon labeled button" @click="logout">
          <i class="ui sign out alternate icon"></i>
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// import config from ".././config.js";
// import axios from "axios";
import { mapGetters } from "vuex";
import ResetPassModal from "./modals/ResetPassModal.vue";
import Loader from "./Loader.vue";

export default {
  components: {
    ResetPassModal,
    Loader,
  },
  mounted() {
    $(".ui.dropdown").dropdown();
  },
  data() {
    return {
      activePage: "",
    };
  },
  computed: {
    ...mapGetters(["hasAccess", "hasUpperAccess"]),
    showActivePage() {
      return this.$store.state.selectedPage;
    },
  },
  methods: {
    goTo(val) {
      this.$store.state.selectedPage = val;
      this.activePage = val;
    },
    resetPass(store) {
      this.reset = true;
      $("#reset_pass")
        .modal({
          class: "mini inverted",
          closable: false,
          onApprove: function () {
            let pass = store.state.passChange;
            if (!pass.newPass || pass.newPass.length < 8) {
              pass.error = true;
              pass.errorText =
                "Password needs to be at least 8 characters long!";
              return false;
            }

            if (pass.newPass === pass.confirmNewPass) {
              store.dispatch("resetPass", store.state.loggedUserData.login);
            } else {
              pass.error = true;
              pass.errorText = "Passwords need to match!";
              return false;
            }
          },
          onDeny: () => {
            let pass = store.state.passChange;
            pass.error = false;
            pass.errorText = "";
            pass.newPass = "";
            pass.confirmNewPass = "";
          },
        })
        .modal("show");
    },
    logout() {
      this.$store.dispatch("logout", true);
    },
  },
};
</script>

<style></style>
