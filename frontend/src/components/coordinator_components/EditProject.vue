<template>
  <SuccessModal
    id="edit_project"
    :message="'Your project was successfuly edited!'"
  />
  <div class="ui fluid card" :class="{ 'double blue loading': loading }">
    <div class="content" style="background: #3d698e; color: whitesmoke">
      <h1 class="ui header" style="color: whitesmoke">
        {{ projectName }}
      </h1>
    </div>
    <div class="content">
      <div class="ui equal width grid">
        <div class="column" v-if="!showChangeTime">
          <div class="item">
            <h2 class="ui header">Project's start hour: {{ startingHours }}</h2>
          </div>
        </div>
        <div class="column" v-if="!showChangeTime">
          <div class="item">
            <h2 class="ui header">Project's end hour: {{ endingHours }}</h2>
          </div>
        </div>
        <div class="ui row" v-else>
          <div class="column">
            <div class="field">
              <label style="text-align: left">New starting hours</label>
              <div class="ui calendar" id="project_range_start">
                <div class="ui input left icon">
                  <i class="calendar icon"></i>
                  <input type="text" placeholder="Start" />
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label style="text-align: left">New ending hours</label>
              <div class="ui calendar" id="project_range_end">
                <div class="ui input left icon">
                  <i class="calendar icon"></i>
                  <input type="text" placeholder="End" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ui row">
          <div class="column" v-if="!showChangeTime">
            <button class="ui button" @click.prevent="editTime">
              Change hours
            </button>
          </div>
          <div class="column" v-else>
            <button class="ui button" @click.prevent="cancelEditTime">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="center aligned description" style="margin-bottom: 10px">
        <h5 class="ui header">Campaign statuses</h5>
      </div>
      <div class="ui labels restricted-size" v-if="!showEditStatuses">
        <div
          class="ui coordinators-label label"
          :class="{ 'right icon': showEditCoordinators }"
          v-for="each in statuses"
          :key="each"
        >
          {{ each }}
        </div>
      </div>
      <div class="ui form" v-else>
        <div class="field">
          <select
            id="status_dropdown"
            class="ui fluid search dropdown"
            multiple=""
            v-model="selectedStatuses"
          >
            <option v-for="each in statuses" :value="each" :key="each">
              {{ each }}
            </option>
          </select>
        </div>

        <div class="field" style="max-height: 200px; overflow: auto">
          <div class="field addition-button-container">
            <label style=""></label>
            <button type="button" class="ui mini button" @click="rowCount += 1">
              Add more statuses
            </button>
          </div>
          <div
            v-for="row of Array(rowCount).keys()"
            :key="row"
            id="statuses_data"
          >
            <div class="three fields" style="width: 100%">
              <div class="field">
                <div class="ui focus input">
                  <input
                    class="statusInput"
                    type="text"
                    placeholder="Status"
                    :name="rowCount"
                  />
                </div>
              </div>
              <div class="field">
                <div class="ui focus input">
                  <input
                    class="statusInput"
                    type="text"
                    placeholder="Status"
                    :name="rowCount"
                  />
                </div>
              </div>
              <div class="field">
                <div class="ui focus input">
                  <input
                    class="statusInput"
                    type="text"
                    placeholder="Status"
                    :name="rowCount"
                  />
                </div>
              </div>
              <button
                type="button"
                class="circular ui icon button"
                @click="rowCount -= 1"
                :class="{ disabled: row == 0 }"
              >
                <i class="times icon"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top: 10px;">
        <button
          class="ui button"
          v-if="!showEditStatuses"
          @click.prevent="editStatuses"
        >
          Edit statuses
        </button>
        <button class="ui button" v-else @click.prevent="cancelEditStatuses">
          Cancel
        </button>
      </div>
    </div>
    <div class="extra content">
      <div class="content">
        <div class="ui equal width grid">
          <div class="left aligned column">
            <div class="center aligned description" style="margin-bottom: 6px">
              <h5 class="ui header">Coordinators</h5>
            </div>
            <div class="ui labels restricted-size" v-if="!showEditCoordinators">
              <div
                class="ui coordinators-label label"
                :class="{ 'right icon': showEditCoordinators }"
                v-for="each in coordinators"
                :key="each"
              >
                {{ each.full_name }} ({{ each.login }})
              </div>
            </div>
            <div v-else>
              <select
                id="coordinators_dropdown"
                class="ui fluid search dropdown"
                multiple=""
                v-model="selectedCoordinators"
              >
                <option
                  v-for="each in sortedUsers.coordinators"
                  :value="each.login"
                  :key="each.login"
                >
                  <strong>{{ each.full_name }}</strong> ({{ each.login }})
                </option>
              </select>
            </div>
          </div>
          <div class="left aligned column">
            <div class="center aligned description" style="margin-bottom: 6px">
              <h5 class="ui header">Users</h5>
            </div>
            <div class="ui labels restricted-size" style="" v-if="!showEditUsers">
              <div
                class="ui basic users-label label"
                v-for="each in users"
                :key="each"
              >
                {{ each.full_name }} ({{ each.login }})
              </div>
            </div>
            <div v-else>
              <select
                id="users_dropdown"
                class="ui fluid search dropdown"
                multiple=""
                v-model="selectedUsers"
              >
                <option
                  v-for="each in sortedUsers.users"
                  :value="each.login"
                  :key="each.login"
                >
                  <strong>{{ each.full_name }}</strong> ({{ each.login }})
                </option>
              </select>
            </div>
          </div>
          <div class="ui row">
            <div class="column">
              <button
                class="ui button"
                v-if="!showEditCoordinators && isAdmin"
                @click="editCoordinators"
              >
                Edit coordinators
              </button>
              <button
                class="ui button"
                v-if="showEditCoordinators && isAdmin"
                @click="cancelEditCoordinators"
              >
                Cancel
              </button>
            </div>
            <div class="column">
              <button
                class="ui button"
                v-if="!showEditUsers && isAdmin"
                @click="editUsers"
              >
                Edit users
              </button>
              <button
                class="ui button"
                v-if="showEditUsers && isAdmin"
                @click="cancelEditUsers"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ui bottom attached two buttons">
      <div class="ui whatsapp button" @click="updateProject">
        <i class="recycle icon"></i>
        Save changes
      </div>
      <div class="ui grey button" @click="cancelEditForAll">
        <i class="cancel icon"></i>
        Cancel
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "../../config";
import SuccessModal from "../../models/modals/SuccessModal.vue";
import { mapGetters } from "vuex";

const { DateTime } = require("luxon");

export default {
  mounted() {
    this.initEdit();
    this.getData();
    this.$store.state.controlPanel = true;
  },
  components: {
    SuccessModal,
  },
  updated() {
    // $("#coordinators_dropdown").dropdown();
    this.$store.state.controlPanel = true;
    $("#status_dropdown").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
    $("#coordinators_dropdown").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
    $("#users_dropdown").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
    $("#project_range_start").calendar({
      type: "time",
      ampm: false,
      endCalendar: $("#project_range_end"),
    });
    $("#project_range_end").calendar({
      type: "time",
      startCalendar: $("#project_range_start"),
      onChange: this.getTime,
      ampm: false,
    });
  },
  props: [
    "projectName",
    "projectId",
    "startingHours",
    "endingHours",
    "coordinators",
    "users",
    "statuses",
  ],
  data() {
    return {
      sortedUsers: {
        users: [],
        coordinators: [],
      },
      loading: false,
      rowCount: 1,
      showEditCoordinators: false,
      showEditUsers: false,
      showEditStatuses: false,
      showChangeTime: false,
      selectedCoordinators: [],
      selectedUsers: [],
      selectedStatuses: [],
      coordinatorsFromServer: [],
      editedStartTime: "",
      editedEndTime: "",
    };
  },
  computed: {
    ...mapGetters(["isAdmin", "sortUsers"]),
  },
  methods: {
    async getData() {
      this.loading = true;
      await axios
        .get(`${config.apiBaseUrl}/get_project_creation_data`)
        .then((res) => {
          const parsedRes = JSON.parse(res.data);
          this.sortedUsers.users = parsedRes.users.users;
          this.sortedUsers.coordinators = parsedRes.users.coordinators;
        });
      this.loading = false;
    },
    getAllInputs() {
      const form = document.getElementsByClassName("statusInput");
      let valueTable = [];
      for (const each of form) {
        valueTable.push(each.value);
      }
      let filteredValueTable = valueTable.filter((el) => el != "");
      return filteredValueTable;
    },
    getTime() {
      let startTime = $("#project_range_start").calendar("get date");
      let endTime = $("#project_range_end").calendar("get date");

      this.editedStartTime = DateTime.fromISO(
        new Date(startTime).toISOString()
      ).toFormat("T");

      this.editedEndTime = DateTime.fromISO(
        new Date(endTime).toISOString()
      ).toFormat("T");

      // this.projectEndTime = calendarDate;
    },
    initEdit() {
      for (const each in this.coordinators) {
        this.selectedCoordinators.push(this.coordinators[each].login);
      }
      for (const each in this.users) {
        this.selectedUsers.push(this.users[each].login);
      }
      for (const each in this.statuses) {
        this.selectedStatuses.push(this.statuses[each]);
      }
    },
    editCoordinators() {
      this.showEditCoordinators = true;
    },
    cancelEditCoordinators() {
      this.showEditCoordinators = false;
      this.selectedCoordinators = [];
      for (const each in this.coordinators) {
        this.selectedCoordinators.push(this.coordinators[each].login);
      }
    },
    editUsers() {
      this.showEditUsers = true;
    },
    cancelEditUsers() {
      this.showEditUsers = false;
      this.selectedUsers = [];
      for (const each in this.users) {
        this.selectedUsers.push(this.users[each].login);
      }
    },
    editStatuses() {
      this.showEditStatuses = true;
    },
    cancelEditStatuses() {
      this.showEditStatuses = false;
      this.selectedStatuses = [];
      this.rowCount = 1;
      for (const each in this.statuses) {
        this.selectedStatuses.push(this.statuses[each]);
      }
    },
    editTime() {
      this.showChangeTime = true;
    },
    cancelEditTime() {
      this.showChangeTime = false;
      this.editedStartTime = "";
      this.editedEndTime = "";
    },
    cancelEditForAll() {
      this.$store.state.projectToEdit.exists = false;
      this.$store.state.selectedPage = "projects-list";
      this.cancelEditCoordinators();
      this.cancelEditUsers();
      this.cancelEditTime();
    },
    async updateProject() {
      this.loading = true;
      this.$store.commit("getDataFromStorage");
      let coordinatorsLoginsFromServer = [];
      let selectedCoordinatorsLogins = [];

      for (const data in this.coordinators) {
        coordinatorsLoginsFromServer.push(this.coordinators[data].login);
      }

      for (const data of this.selectedCoordinators) {
        selectedCoordinatorsLogins.push(data);
      }

      let deletedCoordinators = coordinatorsLoginsFromServer.filter(
        (el) => selectedCoordinatorsLogins.indexOf(el) === -1
      );

      let usersLoginsFromServer = [];
      let selectedUsersLogins = [];

      for (const data in this.users) {
        usersLoginsFromServer.push(this.users[data].login);
      }

      for (const data of this.selectedUsers) {
        selectedUsersLogins.push(data);
      }

      let deletedUsers = usersLoginsFromServer.filter(
        (el) => selectedUsersLogins.indexOf(el) === -1
      );

      let statusesFromServer = [];
      let selectedStatusesTable = [];

      for (const status of this.statuses) {
        statusesFromServer.push(status);
      }
     
      selectedStatusesTable = [...this.getAllInputs(), ...this.selectedStatuses]
      console.log(selectedStatusesTable)
      let deletedStatuses = statusesFromServer.filter(
        (el) => selectedStatusesTable.indexOf(el) === -1
      );

      await axios.post(
        `${config.apiBaseUrl}/update_project`,
        {
          campaign_id: this.projectId,
          coordinators: selectedCoordinatorsLogins,
          deleted_coordinators: deletedCoordinators,
          users: selectedUsersLogins,
          deleted_users: deletedUsers,
          statuses: selectedStatusesTable,
          deleted_statuses: deletedStatuses,
          new_starting_hours: this.editedStartTime,
          new_ending_hours: this.editedEndTime,
          ghosts: false,
          edited_by: this.$store.state.loggedUserData.login
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${this.$store.state.loggedUserData.token}`,
          },
        }
      );
      await this.$store.dispatch(
        "getProjects",
        this.$store.state.loggedUserData.login
      );
      this.loading = false;
      $("#edit_project")
        .modal({
          class: "mini inverted",
        })
        .modal("show");
      this.cancelEditForAll();
    },
  },
};
</script>

<style scoped>

.restricted-size {
  max-height: 100px !important; 
  overflow-y: auto !important; 
}

.project-label,
.coordinators-label {
  background-color: #304d8a;
  color: whitesmoke;
}
.users-label {
  border: 1px solid #304d8a !important;
  color: #304d8a !important;
}

.addition-button-container {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 4px !important;
}

.addition-button-container > label {
  margin-bottom: 0 !important;
  margin-right: 5px !important;
}
</style>
