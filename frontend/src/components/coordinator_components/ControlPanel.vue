<template>
  <div class="ui equal width stackable grid" style="margin-top: 0">
    <div class="thirteen wide column" style="padding: 0; margin: 0">
      <Sidebar
        v-if="this.$store.state.showLoggedIn"
        :dataToDisplay="loggedUsers.workingUsers"
      />
      <Sidebar v-else :dataToDisplay="loggedUsers.notWorkingUsers" />
    </div>
    <div
      class="three wide column"
      style="padding: 0; margin: 0"
      id="coordinator_container"
    >
      <div
        class="ui centered card"
        style="background-color: transparent; box-shadow: none"
        v-if="!selectedPage"
      >
        <div class="content">
          <button
            class="ui twitter labeled icon button"
            @click="goTo('update-time')"
          >
            <i class="ui user clock icon"></i>
            Add time to the user
          </button>
        </div>
        <div class="content control" v-if="isAdmin">
          <button
            class="ui telegram labeled icon button"
            @click="goTo('add-user')"
          >
            <i class="ui user plus icon"></i>
            Add a new user
          </button>
        </div>
        <div class="content">
          <button
            class="ui linkedin labeled icon button"
            @click="goTo('users-list')"
          >
            <i class="ui users icon"></i>
            List of all users
          </button>
        </div>
        <div class="content" v-if="isAdmin">
          <button
            class="ui instagram labeled icon button"
            @click="goTo('add-project')"
          >
            <i class="ui folder plus icon"></i>
            Add a new project
          </button>
        </div>
        <div class="content">
          <button
            class="ui vk labeled icon button"
            @click="goTo('projects-list')"
          >
            <i class="ui list icon"></i>
            List of all projects
          </button>
        </div>
        <div class="content">
          <button
            class="ui facebook labeled icon button"
            @click="goTo('reports')"
          >
            <i class="ui inverted table icon"></i>
            Reports
          </button>
        </div>

        <div class="content">
          <button
            class="ui google plus labeled icon button"
            @click="goTo('schedules')"
          >
            <i class="ui users icon"></i>
            Schedules
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../../models/Sidebar.vue";
import { mapGetters } from "vuex";
export default {
  components: {
    Sidebar,
  },
  mounted() {
    this.$store.state.projectToEdit.exists = false;
    this.$store.state.workHistoryModule.detailsFromProjectView = false;
  },
  data() {
    return {
      selectedPage: "",
      password: "",
    };
  },
  computed: {
    isAdmin() {
      return this.$store.state.loggedUserData.accessLevel == "admin";
    },
    ...mapGetters(["hasUpperAccess", "accessLevel", "isAdmin"]),
    loggedUsers() {
      // let workingUsers = this.sortUsers.allUsers.filter(
      //   (element) => element.workStage != null
      // );
      let workingUsers = this.$store.state.users.working;
      // let notWorkingUsers = this.sortUsers.allUsers.filter(
      //   (element) => element.workStage == null
      // );
      let notWorkingUsers = this.$store.state.users.notWorking;
      return { workingUsers, notWorkingUsers };
    },
  },
  methods: {
    goTo(val) {
      this.$store.state.selectedPage = val;
      // this.activePage = val;
    },
  },
};
</script>

<style scoped>
#coordinator_container {
  height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
}
.ui.button {
  width: 220px;
}
</style>
