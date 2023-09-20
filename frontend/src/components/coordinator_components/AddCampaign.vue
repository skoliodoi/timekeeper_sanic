<template>
  <SuccessModal
    id="project_modal"
    :message="'Your project was created successfully!'"
  />
  <div class="ui container">
    <div class="ui grid" id="project_container">
      <div class="ui middle aligned row">
        <div class="column">
          <form class="ui form" id="project_form">
            <div
              class="ui centered fluid card"
              :class="{ 'double loading blue ': adding }"
            >
              <div class="content" style="background: #3d698e">
                <div class="left floated header" style="color: whitesmoke">
                  Add new campaign
                </div>
              </div>
              <div class="content" style="padding: 20px">
                <div
                  class="two fields"
                >
                  <div class="field">
                    <div class="field addition-button-container">
                      <label style="text-align: left">Parent project</label>
                      <!-- <button
                        v-if="!addingProject"
                        data-tooltip="Add new project"
                        data-inverted=""
                        type="button"
                        class="circular ui mini icon button addition-button"
                        @click="addingProject = true"
                      >
                        <i class="add icon"></i>
                      </button> -->
                    </div>
                    <select
                      class="ui fluid search dropdown"
                      id="select-project"
                      v-model="selectedProject"
                    >
                      <option value="">Select parent projects</option>
                      <option
                        :value="each"
                        v-for="each in assignableProjects"
                        :key="each"
                      >
                        <strong>{{ each }}</strong>
                      </option>
                    </select>
                  </div>
                  <!-- <div
                    class="field"
                    :class="{ error: emptyInput }"
                    v-if="addingProject"
                  >
                    <div class="field addition-button-container">
                      <label style="text-align: left">Add new project</label>
                      <button
                        type="button"
                        data-tooltip="Save new project"
                        data-inverted=""
                        class="circular ui mini icon button addition-button"
                        @click="addNewProject"
                      >
                        <i class="check icon"></i>
                      </button>
                      <button
                        data-tooltip="Cancel/finish adding new project"
                        data-inverted=""
                        type="button"
                        class="circular ui mini icon button addition-button"
                        @click="finishAdding"
                      >
                        <i class="times icon"></i>
                      </button>
                    </div>
                    <div class="ui focus input">
                      <input
                        type="text"
                        placeholder="Input project name"
                        name="code"
                        v-model="newProject"
                      />
                    </div>
                  </div> -->
                  <div class="field">
                    <div class="field">
                      <label style="text-align: left">Campaign name</label>
                    </div>
                    <div class="ui focus input">
                      <input
                        type="text"
                        placeholder="Campaign name"
                        name="name"
                        v-model="campaignName"
                      />
                    </div>
                  </div>
                </div>
                <div class="three fields">
                  <div class="field">
                    <label style="text-align: left">Start time</label>
                    <div class="ui calendar" id="start_time_calendar">
                      <div class="ui input left icon">
                        <i class="time icon"></i>
                        <input
                          type="text"
                          name="start_date"
                          placeholder="Start time"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="field">
                    <label style="text-align: left">End time</label>
                    <div class="ui calendar" id="end_time_calendar">
                      <div
                        class="ui input left icon"
                        :class="{ disabled: !enableEndTime }"
                      >
                        <i class="time icon"></i>
                        <input
                          type="text"
                          name="end_date"
                          placeholder="End time"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="field">
                    <label style="text-align: left"
                      >Logout buffer (in minutes)</label
                    >
                    <div class="ui focus input">
                      <input
                        type="text"
                        placeholder="Logout buffer"
                        name="buffer"
                        v-model="logoutBuffer"
                      />
                    </div>
                  </div>
                  <div class="two wide field">
                    <label style="text-align: center">Add ghosts?</label>
                    <div class="ui checkbox">
                      <input
                        type="checkbox"
                        name="ghosts"
                        v-model="addGhosts"
                      />
                      <label></label>
                    </div>
                  </div>
                </div>
                <div class="two fields">
                  <!-- <div class="field">
                    <label style="text-align: left"
                      >Assign owners</label
                    >
                    <select
                      class="ui fluid search dropdown"
                      name="project_owner"
                      multiple=""
                      id="multiple_owner_select"
                      v-model="selectedOwners"
                      @change="assignOwners"
                    >
                      <option value="">Project owners</option>
                      <option
                        :value="each.login"
                        v-for="each in assignableOwners"
                        :key="each"
                      >
                        <strong>{{ each.full_name }}</strong> ({{ each.login }})
                      </option>
                    </select>
                  </div> -->
                  <!-- <div class="field">
                    <AssignUser
                      :dataFromServer="sortedUsers.owners"
                      :dataFromServerText="'owners'"
                      :selectId="'multiple_owner_select'"
                      :projectName="'project_owner'"
                      @assignPeople="addOwners"
                    />
                  </div> -->
                  <div class="field">
                    <AssignUser
                      :dataFromServer="sortedUsers.coordinators"
                      :dataFromServerText="'coordinators'"
                      :selectId="'multiple_coordinator_select'"
                      :projectName="'project_coordinator'"
                      @assignPeople="addCoordinators"
                    />
                  </div>

                  <div class="field">
                    <AssignUser
                      :dataFromServer="sortedUsers.users"
                      :dataFromServerText="'users'"
                      :selectId="'multiple_user_select'"
                      :projectName="'project_user'"
                      @assignPeople="addUsers"
                    />
                  </div>
                </div>
                <div class="field" style="max-height: 200px; overflow: auto">
                  <div class="field addition-button-container">
                    <label style="">Campaign statuses</label>
                    <button
                      type="button"
                      class="circular ui mini icon button addition-button"
                      @click="rowCount += 1"
                    >
                      <i class="add icon"></i>
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
              <!-- <div class="extra content">
					<div class="description">
						You will be the default coordinator for the added project. If you
						want to add another person as a coordinator please use the "Assign
						coordinators" button.
					</div>
				</div> -->
              <div class="extra content">
                <div class="ui error message"></div>
              </div>
              <div class="ui bottom attached two buttons">
                <div
                  class="ui instagram button"
                  @click="addProject"
                  :class="{ submit: !isDataValid, disabled: blockSending }"
                >
                  <i class="add icon"></i>
                  Add project
                </div>
                <div class="ui grey button" @click="cancelAdd">
                  <i class="cancel icon"></i>
                  Cancel
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "../../config";
const { DateTime } = require("luxon");

import { mapGetters } from "vuex";
import AssignUser from "./AssignUser.vue";
import SuccessModal from "../../models/modals/SuccessModal.vue";

export default {
  components: { AssignUser, SuccessModal },
  data() {
    return {
      // addingProject: false,
      emptyInput: false,
      rowCount: 1,
      dataValidation: false,
      addGhosts: false,
      // assignableOwners: [],
      assignableCoordinators: [],
      assignableUsers: [],
      addedProjects: [],
      selectedProject: "",
      // selectedOwners: [],
      enableEndTime: false,
      loading: false,
      adding: false,
      campaignName: "",
      newProject: "",
      logoutBuffer: 15,
      projectStartTime: "",
      projectEndTime: "",
      assignableProjects: [],
      sortedUsers: {
        users: [],
        coordinators: [],
        project_owners: [],
      },
    };
  },
  mounted() {
    this.getData();
    this.$store.state.controlPanel = true;
    $("#project_form").form({
      fields: {
        name: "empty",
        start_date: "empty",
        end_date: "empty",
        // project_coordinator: "empty",
        // project_user: "empty",
      },
    });
    // $("#multiple_owner_select").dropdown();
    // $("#multiple_user_select").dropdown();
    // $("#multiple_coordinator_select").dropdown();
    $("#start_time_calendar").calendar({
      type: "time",
      onChange: this.getStartTime,
      ampm: false,
    });
    $("#project_modal").modal();
    $("#multiple_owner_select").dropdown({
      fullTextSearch: "exact",
      match: "both",
    })
    $("#multiple_user_select").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
    $("#multiple_coordinator_select").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
    $("#select-project").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
  },
  updated() {
    this.$store.state.controlPanel = true;
    // $('#multiple_owner_select').dropdown()
    $("#select-project").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
  },
  beforeUnmount() {
    this.$store.dispatch("getProjects", this.$store.state.loggedUserData.login);
    this.sortedUsers = {
      users: [],
      coordinators: [],
      project_owners: [],
    };
    this.assignableProjects = [];
  },
  computed: {
    ...mapGetters(["isAdmin"]),
    // blockSending() {
    //   return this.addingProject ? true : false;
    // },
    isDataValid() {
      return this.dataValidation;
    },
    projectList() {
      let list = this.$store.state.projects.fullList.map(
        (el) => el.project_name
      );
      const list2 = list.concat(this.addedProjects);
      list2.sort((a, b) => {
        return a.localeCompare(b);
      });
      return list2;
    },
  },
  methods: {
    // assignOwners() {
    //   let ownersArray = []
    //   for (const each of this.selectedProjects) {
    //     const project = this.$store.state.projects.fullList.find(el => el.project_name == each)
    //     for (const detail of project.details) {
    //       for (const owner of detail.project_owners) {
    //         if (!ownersArray.includes(owner)) {
    //           ownersArray.push(owner.login)
    //         }
    //       }
    //     }
    //   }
    //   this.assignableOwners = [];
    //   for (const each of this.sortedUsers.owners) {
    //     if (!ownersArray.includes(each.login)) {
    //       this.assignableOwners.push(each)
    //     }
    //   }
    // },
    // addNewProject() {
    //   if (!this.newProject) {
    //     this.emptyInput = true;
    //   } else {
    //     this.addedProjects.push(this.newProject);
    //     this.selectedProjects.push(this.newProject);
    //     this.emptyInput = false;
    //     this.newProject = "";
    //   }
    // },
    // finishAdding() {
    //   this.newProject = "";
    //   this.emptyInput = false;
    //   // this.addingProject = false;
    // },
    async getData() {
      this.adding = true;
      await axios
        .get(`${config.apiBaseUrl}/get_project_creation_data`)
        .then((res) => {
          const parsedRes = JSON.parse(res.data);
          this.sortedUsers.users = parsedRes.users.users;
          this.sortedUsers.owners = parsedRes.users.project_owners;
          this.sortedUsers.coordinators = parsedRes.users.coordinators;
          this.assignableProjects = parsedRes.projects;
          this.assignableProjects.sort((a, b) => {
            return a.localeCompare(b);
          });
        });
      this.adding = false;
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
    cancelAdd() {
      this.$store.state.selectedPage = "control-panel";
    },
    addCoordinators(val) {
      this.assignableCoordinators = val;
    },
    addUsers(val) {
      this.assignableUsers = val;
    },
    getStartTime() {
      this.enableEndTime = true;
      let calendarDate = $("#start_time_calendar").calendar("get date");
      this.projectStartTime = calendarDate;
      $("#end_time_calendar").calendar({
        type: "time",
        onChange: this.getEndTime,
        ampm: false,
      });
    },
    getEndTime() {
      let calendarDate = $("#end_time_calendar").calendar("get date");
      this.projectEndTime = calendarDate;
    },
    clearFields() {
      $("#multiple_owner_select").dropdown("clear");
      $("#multiple_user_select").dropdown("clear");
      $("#multiple_coordinator_select").dropdown("clear");
    },
    async addProject() {
      if ($("#project_form").form("is valid")) {
        this.dataValidation = true;
      }

      if (this.dataValidation) {
        this.adding = true;

        // this.assignableCoordinators.push(
        // 	this.$store.state.loggedUserData.login
        // );
        const statusTable = this.getAllInputs();
        let startTime = DateTime.fromISO(
          new Date(this.projectStartTime).toISOString()
        ).toFormat("T");
        let endTime = DateTime.fromISO(
          new Date(this.projectEndTime).toISOString()
        ).toFormat("T");
        await this.$store
          .dispatch("addProject", {
            project: this.selectedProject,
            campaign: this.campaignName,
            startTime: startTime,
            endTime: endTime,
            buffer: this.logoutBuffer,
            ghosts: this.addGhosts,
            // owners: this.assignableOwners,
            coordinators: this.assignableCoordinators,
            users: this.assignableUsers,
            statuses: statusTable,
          })
          .then(() => {
      
            // this.assignableOwners = [];
            this.assignableCoordinators = [];
            this.assignableUsers = [];
            this.logoutBuffer = 15;
            this.addGhosts = false;
            this.rowCount = 1;
            this.campaignName = "";
            this.selectedProject = "";
            $("#start_time_calendar").calendar("clear date");
            $("#end_time_calendar").calendar("clear date");
            $("#project_form").form("reset");
            $("#project_form").form("clear");
            $("#multiple_owner_select").dropdown("clear");
            $("#multiple_user_select").dropdown("clear");
            $("#multiple_coordinator_select").dropdown("clear");
            $("#project_modal")
              .modal({
                class: "mini inverted",
              })
              .modal("show");
          });
        this.adding = false;
      }
      this.dataValidation = false;
    },
  },
};
</script>

<style scoped>
#project_container {
  height: calc(100vh - 74px);
}

.addition-button-container {
  display: flex !important;
  align-items: center !important;
  margin-bottom: 4px !important;
}

.addition-button-container > label {
  margin-bottom: 0 !important;
  margin-right: 5px !important;
}

.circular.ui.mini.icon.button.addition-button {
  height: 0.7rem !important;
  width: 0.7rem !important;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
