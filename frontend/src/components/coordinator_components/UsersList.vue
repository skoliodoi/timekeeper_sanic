<template>
  <ResetPassModal id="reset_pass" :user="user" />
  <ChangeUserDataModal id="change_data" />
  <ConfirmModal
    id="delete_or_promote_user"
    :firstParagraph="`${confirmationText} this user`"
    :secondParagraph="'You won\'t be able to undo this!'"
  />
  <Loader
    :data="`Please wait, loading users...`"
    v-if="$store.state.passChange.loading || loading"
  />
  <div class="ui container">
    <div class="users-header">
      <BackButton :selectedPage="'control-panel'" />
      <div class="ui buttons" v-if="hasUpperAccess">
        <button
          class="ui inverted button choice"
          :class="{ active: chosen == 'user' }"
          @click="setChosen('user')"
        >
          Users
        </button>
        <div class="or"></div>
        <button
          class="ui inverted button choice"
          :class="{ active: chosen == 'koordynator' }"
          @click="setChosen('koordynator')"
        >
          Coordinators
        </button>
        <div class="or" v-if="isAdmin"></div>
        <button
          v-if="isAdmin"
          class="ui inverted button choice"
          :class="{ active: chosen == 'owner' }"
          @click="setChosen('owner')"
        >
          Project Owners
        </button>
        <div class="or" v-if="isAdmin"></div>
        <button
          v-if="isAdmin"
          class="ui inverted button choice"
          :class="{ active: chosen == 'inactive' }"
          @click="setChosen('inactive')"
        >
          Inactive users
        </button>
      </div>
      <div class="ui search">
        <div class="ui icon input">
          <input
            class="prompt"
            v-model="searchFilter"
            type="text"
            placeholder="Find user"
          />
          <i class="search icon" v-if="!searchFilter"></i>
          <i
            class="times icon"
            style="cursor: pointer"
            v-else
            @click="clearSearchFilter"
          ></i>
        </div>
      </div>
    </div>
    <div id="table-container">
      <table class="ui basic striped table" style="background: whitesmoke">
        <!-- <thead>
				<tr>
					<th colspan="3">Git Repository</th>
				</tr>
			</thead> -->
        <thead
          style="
            background-color: #3d698e;
            position: sticky;
            top: 0;
            z-index: 100;
          "
        >
          <tr class="header">
            <th class="center aligned">Login</th>
            <th class="center aligned">Name</th>
            <th class="center aligned">Last name</th>
            <!-- <th class="center aligned" colspan="3">Coordinator</th> -->
            <!-- <th class="center aligned">Project owner</th> -->
            <th class="center aligned">Functions</th>
          </tr>
        </thead>
        <tbody v-if="usersDisplay.length > 0">
          <tr v-for="each in usersDisplay" :key="each.login">

            <td class="center aligned">{{ each.login }}</td>
            <td class="center aligned">{{ each.name }}</td>
            <td class="center aligned">{{ each.last_name }}</td>
            <!-- <td class="center aligned">
              <i class="large green checkmark icon" v-if="each.koordynator"></i>
              <i class="large red times icon" v-else></i>
            </td> -->
            <!-- <td class="center aligned">
              <i
                class="large green checkmark icon"
                v-if="each.projectOwner"
              ></i>
              <i class="large red times icon" v-else></i>
            </td>
            <td class="center aligned">
              <i
                class="large green checkmark icon"
                v-if="each.projectOwner"
              ></i>
              <i class="large red times icon" v-else></i>
            </td> -->
            <td class="center aligned">
              <div class="ui small basic icon buttons">
                <button
                  class="ui button"
                  data-tooltip="Promote to coordinator"
                  data-inverted=""
                  v-if="hasUpperAccess && chosen == 'user'"
                  @click="
                    initUserAction(this, each.login, 'promote', 'koordynator')
                  "
                >
                  <i class="award icon"></i>
                </button>
                <button
                  class="ui button"
                  data-tooltip="Promote to project owner"
                  data-inverted=""
                  v-if="
                    isAdmin && chosen == 'koordynator' && !each.projectOwner
                  "
                  @click="
                    initUserAction(this, each.login, 'promote', 'projectOwner')
                  "
                >
                  <i class="user tie icon"></i>
                </button>
                <button
                  class="ui button"
                  data-tooltip="Demote to coordinator"
                  data-inverted=""
                  v-if="isAdmin &&  chosen == 'owner'"
                  @click="
                    initUserAction(this, each.login, 'demote', 'koordynator')
                  "
                >
                  <i class="user graduate icon"></i>
                </button>
                <button
                  class="ui button"
                  data-tooltip="Demote to user"
                  data-inverted=""
                  v-if="
                    hasUpperAccess && chosen=='koordynator'
                  "
                  @click="initUserAction(this, each.login, 'demote', 'user')"
                >
                  <i class="user graduate icon"></i>
                </button>
                <button
                  class="ui button"
                  data-tooltip="Deactivate user"
                  data-inverted=""
                  v-if="isAdmin && chosen != 'inactive'"
                  @click="initUserAction(this, each.login, 'deactivate')"
                >
                  <i class="user lock icon"></i>
                </button>
                <button
                  class="ui button"
                  data-tooltip="Activate user"
                  data-inverted=""
                  v-if="isAdmin && chosen == 'inactive'"
                  @click="initUserAction(this, each.login, 'activate')"
                >
                  <i class="user clock icon"></i>
                </button>
                <button
                  class="ui button"
                  data-tooltip="Change user data"
                  data-inverted=""
                  v-if="isAdmin"
                  @click="changeData(each, $store, this)"
                >
                  <i class="user edit icon"></i>
                </button>
                <button
                  class="ui button"
                  data-tooltip="Reset password"
                  data-inverted=""
                  @click="resetPass(each.login, each.name, $store)"
                >
                  <i class="recycle icon"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody class="ui message" v-else>
          <tr>
            <td class="center-aligned" id="message-cell" colspan="5">
              <div class="ui warning centered aligned message">
                <div class="content">
                  <div class="header">Whoops!</div>
                  <p>No users found!</p>
                  <p v-if="searchFilter.length > 0">
                    Make sure you're using a correct login, name or last name!
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "../../config";
import { mapGetters } from "vuex";
import ResetPassModal from "../../models/modals/ResetPassModal.vue";
import ConfirmModal from "../../models/modals/ConfirmModal.vue";
import Loader from "../../models/Loader.vue";
import BackButton from "../../models/BackButton.vue";
import ChangeUserDataModal from "../../models/modals/ChangeUserDataModal.vue"

export default {
  mounted() {
    this.$store.state.controlPanel = true;
    this.getUsers();
  },
  updated() {
    this.$store.state.controlPanel = true;
  },
  components: {
    ResetPassModal,
    ChangeUserDataModal,
    ConfirmModal,
    Loader,
    BackButton,
  },
  data() {
    return {
      loading: false,
      chosen: "user",
      user: "",
      users: "",
      coordinators: "",
      owners: "",
      inactiveUsers: "",
      searchFilter: "",
      confirmationText: "",
      loadingText: "",
      deleting: false,
    };
  },

  computed: {
    ...mapGetters(["hasUpperAccess", "accessLevel", "isAdmin", "sortUsers"]),
    usersDisplay() {
      let usersList =
        this.chosen == "user" || this.accessLevel == "koordynator"
          ? this.users
          : this.chosen == "koordynator"
          ? this.coordinators
          : this.chosen == "owner"
          ? this.owners
          : this.inactiveUsers;
      let returnList;
      if (!this.searchFilter) {
        returnList = usersList;
      } else {
        returnList = usersList.filter(
          (el) =>
            el.login.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
            el.name.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
            el.last_name.toLowerCase().includes(this.searchFilter.toLowerCase())
        );
      }
      return returnList;
    },
    upperLevels() {
      let upperLevelsTable = [];
      for (const each of this.$store.state.projects.coordinators) {
        upperLevelsTable.push(each);
      }
      // for (const each in this.sortUsers.owners) {
      //   upperLevelsTable.push(this.sortUsers.owners[each]);
      // }

      return upperLevelsTable;
    },
  },
  methods: {
    getUsers() {
      this.loading = true;
      this.$store.commit("getDataFromStorage");
      axios
        .get(
          `${config.apiBaseUrl}/get_users/${this.$store.state.loggedUserData.login}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${this.$store.state.loggedUserData.token}`,
            },
          }
        )
        .then((res) => {
          const parsedData = JSON.parse(res.data);
          this.users = [...new Set(parsedData.users)];
          this.coordinators = parsedData.coordinators;
          this.owners = parsedData.owners;
          this.inactiveUsers = parsedData.inactive;
          this.loading = false;
        });
    },
    clearSearchFilter() {
      this.searchFilter = "";
    },
    setChosen(val) {
      this.chosen = val;
    },
    initUserAction(val, login, action, position) {
      this.confirmationText = action;
      $("#delete_or_promote_user")
        .modal({
          closable: false,
          class: "inverted",
          onApprove: function () {
            val.deleteOrPromoteUser(login, action, position);
          },
        })
        .modal("show");
    },
    async deleteOrPromoteUser(login, action, position) {
      let displayMessage;
      if (action == "delete") {
        this.loadingText = "deleting";
        displayMessage = "deleted";
      }
      if (action == "promote") {
        this.loadingText = "promoting";
        displayMessage = "promoted";
      }
      if (action == "demote") {
        this.loadingText = "demoting";
        displayMessage = "demoted";
      }
      if (action == "activate") {
        this.loadingText = "activating";
        displayMessage = "activated";
      }
      if (action == "deactivate") {
        this.loadingText = "deactivating";
        displayMessage = "deactivated";
      }
      this.loading = true;

      await this.$store.dispatch("deleteOrPromoteUser", {
        login,
        action,
        position,
      });

      
      this.loadingText = "";
      this.confirmationText = "";
      this.getUsers();
      $("body").toast({
        class: "center aligned green",
        position: "bottom attached",
        message: `User was ${displayMessage}!`,
      });
    },
    changeData(userData, store, val) {
      this.$store.state.dataChange.oldLogin = userData.login;
      this.$store.state.dataChange.name = userData.name;
      this.$store.state.dataChange.lastName= userData.last_name;
      $("#change_data").modal({
        onApprove: async function() {
          await store.dispatch("changeData");
          val.getUsers();
        }
      }).modal("show")
    },
    resetPass(login, name, store) {
      this.user = name;
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
              store.dispatch("resetPass", login);
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
  },
};
</script>

<style scoped>
.users-header {
  background-color: #3d698e;
  height: 5em !important;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.ui.button.choice {
  width: 150px;
}

#table-container {
  /* border: 10px solid red; */
  height: calc(100vh - 152px);
  margin-top: 10px;
  overflow: auto;
}
#message-cell {
  padding: 0;
}
.ui.basic.table > thead > tr > th {
  color: whitesmoke;
}
.ui.icon.input > i.icon:not(.link) {
  pointer-events: all !important;
}
</style>
