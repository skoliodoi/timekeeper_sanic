<template>
  <SuccessModal id="time_modal" :message="'You added time to the user!'" />
  <ConfirmModal
    @confirmAction="approveUpdate"
    id="update_time_modal"
    :firstParagraph="'do this?'"
    :secondParagraph="'There is already work history existing in the selected time period and it will be deleted!'"
  />
  <div class="ui container">
    <div class="ui grid" id="add-time-container">
      <div class="ui middle aligned row">
        <div class="column">
          <form class="ui form" id="time_form">
            <div
              class="ui fluid card"
              :class="{ 'primary double loading': loader }"
            >
              <div class="content" style="background: #3d698e">
                <div class="left floated header" style="color: whitesmoke">
                  Add Time
                </div>
              </div>
              <div class="content">
                <div
                  class="two fields"
                  :class="{ 'three fields': !propsData.workStageId }"
                >
                  <div class="field">
                    <label style="text-align: left">Project</label>
                    <div
                      class="ui action input"
                      v-if="propsData.projectName && !changeable.changeProject"
                    >
                      <input
                        type="text"
                        disabled
                        v-model="propsData.projectName"
                      />
                      <button
                        class="ui icon button"
                        @click.prevent="changeProjects"
                      >
                        <i class="pencil alternate icon"></i>
                      </button>
                    </div>
                    <div v-else>
                      <SelectProjectModal
                        :user="userId"
                        @change="updateProjects($event.target.value)"
                      />
                    </div>
                  </div>
                  <div class="field">
                    <label style="text-align: left">Campaign</label>
                    <div
                      class="ui action input"
                      v-if="propsData.projectName && !changeable.changeCampaign"
                    >
                      <input
                        type="text"
                        disabled
                        v-model="propsData.campaignName"
                      />
                      <button
                        class="ui icon button"
                        @click.prevent="changeCampaigns"
                      >
                        <i class="pencil alternate icon"></i>
                      </button>
                    </div>
                    <div v-else>
                      <SelectCampaignModal
                        :campaigns="selectableCampaigns"
                        @change="updateUsers($event.target.value)"
                      />
                    </div>
                  </div>
                  <div class="field" v-if="!propsData.workStageId">
                    <label style="text-align: left">User</label>
                    <select
                      class="ui fluid search selection dropdown"
                      id="users"
                      name="users"
                      v-model="selected.user"
                    >
                      <option value="">Choose project first</option>
                      <option
                        v-for="each in $store.state.users.list"
                        :value="each.login"
                        :key="each.login"
                      >
                        {{ each.full_name }}
                        <strong>({{ each.login }})</strong>
                      </option>
                    </select>
                  </div>
                </div>
                <div class="field">
                  <div class="three fields">
                    <div class="field">
                      <label style="text-align: left">Work stage</label>
                      <div
                        class="ui action input"
                        v-if="
                          propsData.selectedWorkStage &&
                          !changeable.changeWorkStage
                        "
                      >
                        <input
                          type="text"
                          disabled
                          v-model="propsData.selectedWorkStage"
                        />
                        <button
                          class="ui icon button"
                          @click.prevent="changeable.changeWorkStage = true"
                        >
                          <i class="pencil alternate icon"></i>
                        </button>
                      </div>
                      <div v-else>
                        <SelectWorkstageModal
                          v-model="selected.workStage"
                          @change="workStageHandler(selected.workStage)"
                        />
                      </div>
                    </div>

                    <TimeSelectionModals
                      :update="propsData.update"
                      :start="propsData.startDate"
                      :end="propsData.endDate"
                      @emitDates="getDates"
                    />
                  </div>
                </div>
                <div
                  class="field"
                  v-if="
                    propsData.additionalInfo &&
                    !changeable.changeAdditionalInfo &&
                    !selected.workStage
                  "
                >
                  <label style="text-align: left">Additional information</label>
                  <div class="ui action input focus">
                    <input
                      disabled
                      type="text"
                      v-model="propsData.additionalInfo"
                    />
                    <button
                      class="ui icon button"
                      @click.prevent="changeable.changeAdditionalInfo = true"
                    >
                      <i class="pencil alternate icon"></i>
                    </button>
                  </div>
                </div>
                <div
                  v-else-if="
                    changeable.changeAdditionalInfo && !selected.workStage
                  "
                >
                  <div class="field">
                    <label style="text-align: left"
                      >Additional information</label
                    >
                    <SelectAdditionalInfoModal
                      :selectedProjectProps="propsData.projectId"
                      v-model="selected.wycofanieReason"
                      @click="selected.additionalInfo = ''"
                    />
                  </div>
                  <div v-if="selected.wycofanieReason == 'Other'">
                    <div class="field">
                      <label style="text-align: left">Other reason</label>
                      <div class="ui input" style="width: 100%">
                        <input
                          type="text"
                          placeholder="Give a reason"
                          v-model="selected.additionalInfo"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="field">
                  <div v-if="selected.workStage == workstage[3]">
                    <div
                      class="field"
                      :class="{
                        'two fields': selected.wycofanieReason == 'Other',
                      }"
                    >
                      <div class="field">
                        <label style="text-align: left"
                          >Additional information</label
                        >
                        <SelectAdditionalInfoModal
                          :selectedProjectProps="propsData.projectId"
                          v-model="selected.wycofanieReason"
                          @change="selected.additionalInfo = ''"
                        />
                      </div>
                      <div
                        class="field"
                        v-if="selected.wycofanieReason == 'Other'"
                      >
                        <label style="text-align: left">Other reason</label>
                        <div class="ui input" style="width: 100%">
                          <input
                            type="text"
                            name="other"
                            placeholder="Give a reason"
                            v-model="selected.additionalInfo"
                          />
                        </div>
                      </div>
                    </div>
                    <div v-if="selected.wycofanieReason == 'Other'"></div>
                  </div>
                </div>

                <div
                  class="field"
                  v-if="propsData.comments && !changeable.changeComments"
                >
                  <label style="text-align: left">Comments</label>
                  <div class="ui action input">
                    <input
                      disabled
                      type="text"
                      placeholder="Comments"
                      v-model="propsData.comments"
                    />
                    <button
                      class="ui icon button"
                      @click.prevent="changeable.changeComments = 'true'"
                    >
                      <i class="pencil alternate icon"></i>
                    </button>
                  </div>
                </div>
                <div class="field" v-else>
                  <label style="text-align: left">Add comments</label>
                  <div class="ui input focus">
                    <input
                      name="comments"
                      type="text"
                      placeholder="Add comments"
                      v-model="selected.comments"
                    />
                  </div>
                </div>
              </div>
              <div class="extra content">
                <div class="ui error message"></div>
              </div>

              <div class="ui two bottom attached buttons">
                <div
                  class="ui instagram button"
                  @click.prevent="sendData"
                  :class="{ submit: !dataValidation }"
                >
                  <i class="ui business time icon"></i>
                  Save changes
                </div>
                <div class="ui grey button" @click="cancelEdit">
                  <i class="ui cancel icon"></i>
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
import { mapGetters } from "vuex";
const { DateTime } = require("luxon");

import SuccessModal from "../../models/modals/SuccessModal.vue";
import SelectProjectModal from "../../models/modals/FormModals/SelectProjectModal.vue";
import SelectCampaignModal from "../../models/modals/FormModals/SelectCampaignModal.vue";
import SelectWorkstageModal from "../../models/modals/FormModals/SelectWorkstageModal.vue";
import SelectAdditionalInfoModal from "../../models/modals/FormModals/SelectAdditionalInfoModal.vue";
import TimeSelectionModals from "../../models/modals/FormModals/TimeSelectionModals.vue";
import ConfirmModal from "../../models/modals/ConfirmModal.vue";

export default {
  components: {
    SuccessModal,
    SelectProjectModal,
    SelectCampaignModal,
    SelectWorkstageModal,
    SelectAdditionalInfoModal,
    TimeSelectionModals,
    ConfirmModal,
  },
  props: [
    "userId",
    "workStageId",
    "projectName",
    "projectCode",
    "campaignName",
    "campaignId",
    "workStage",
    "editable",
    "startDate",
    "endDate",
    "additionalInfo",
    "comments",
    "update",
  ],
  mounted() {
    this.$store.state.controlPanel = true;
    this.initDropdown();
    $("#time_modal").modal();
    this.initForm();
  },
  updated() {
    this.$store.state.controlPanel = true;
    this.initDropdown();
    this.initForm();
    if (this.$store.state.askForUpdate) {
      $("#update_time_modal")
        .modal({
          class: "tiny inverted",
          closable: false,
        })
        .modal("show");
    }
  },
  beforeUnmount() {
    this.$store.state.users.list = [];
  },
  data() {
    return {
      selectableCampaigns: [],
      showCalendars: false,
      recordsToModify: [],
      recordsToDelete: [],
      recordsToSend: [],
      dataValidation: false,
      lockUsers: true,
      // disableEndTime: true,
      sendAdditionalInfo: this.additionalInfo,
      changeable: {
        changeProject: false,
        changeCampaign: false,
      },
      existingRecords: [],
      showAdditionalInfo: false,
      loader: false,
      selected: {
        project: "",
        user: "",
        startDate: "",
        endDate: "",
        workStage: "",
        additionalInfo: "",
        wycofanieReason: "",
        comments: "",
      },
    };
  },
  methods: {
    changeProjects() {
      this.changeable.changeProject = true
      this.changeable.changeCampaign = true;
    },
    changeCampaigns() {
      this.updateProjects(this.propsData.projectCode);
      this.changeable.changeCampaign = true;
    },
    approveUpdate() {
      this.$store.state.allowUpdate = true;
      this.$store.state.askForUpdate = false;
    },
    getDates(start, end) {
      this.selected.startDate = start;
      this.selected.endDate = end;
    },
    cancelEdit() {
      if (this.propsData.workStageId) {
        this.$store.state.objectToEdit.exists = false;
      } else {
        this.$store.state.selectedPage = "control-panel";
      }
      this.$store.state.selectForTimeAddition.project = "";
      this.$store.state.selectForTimeAddition.user = "";
    },
    clearModifyHandler() {
      for (const each of this.$store.state.updateTables.recordsToModify) {
        this.$store.state.updateTables.recordsToDelete.push(
          each.workStageIdNumber
        );
      }
    },
    async sendData() {
      if ($("#time_form").form("is valid")) {
        this.dataValidation = true;
      }

      if (this.dataValidation) {
        this.loader = true;
        let tables = this.$store.state.updateTables;
        let data = {
          userData: this.selected.user
            ? this.selected.user
            : this.propsData.userId
            ? this.propsData.userId
            : null,
          projectData: this.$store.state.selectForTimeAddition.project
            ? this.$store.state.selectForTimeAddition.project
            : this.propsData.campaignId
            ? this.propsData.campaignId
            : null,
          workStageData: this.selected.workStage
            ? this.selected.workStage
            : this.propsData.selectedWorkStage
            ? this.propsData.selectedWorkStage
            : null,
          additionalInfoData:
            this.selected.wycofanieReason &&
            this.selected.wycofanieReason != "Other"
              ? this.selected.wycofanieReason
              : this.selected.additionalInfo
              ? this.selected.additionalInfo
              : this.sendAdditionalInfo
              ? this.sendAdditionalInfo
              : null,
          /*eslint-disable */
          startDateData: this.selected.startDate
            ? this.selected.startDate
            : this.propsData.startDate
            ? new Date(
                DateTime.fromSQL(this.propsData.startDate)
                  .setLocale("pl")
                  .toISO()
              )
            : null,
          endDateData: this.selected.endDate
            ? this.selected.endDate
            : this.propsData.endDate
            ? new Date(
                DateTime.fromSQL(this.propsData.endDate).setLocale("pl").toISO()
              )
            : null,
          commentsData: this.selected.comments
            ? this.selected.comments
            : this.propsData.comments
            ? this.propsData.comments
            : null,
        };
        let startDateFormatted = DateTime.fromISO(
          new Date(data.startDateData).toISOString()
        );
        let endDateFormatted = DateTime.fromISO(
          new Date(data.endDateData).toISOString()
        );
        let startTimeToModify = startDateFormatted.toFormat("yyyy-MM-dd T:ss");
        let endTimeToModify = endDateFormatted.toFormat("yyyy-MM-dd T:ss");
        await this.$store.dispatch("initTimeUpdate", {
          user: data.userData,
          date: endDateFormatted,
          startTime: startTimeToModify,
          endTime: endTimeToModify,
          login: data.userData,
          project: data.projectData,
          workStage: data.workStageData,
          additionalInfo: data.additionalInfoData,
          comments: data.commentsData,
          update: this.propsData.update,
        });
        this.clearModifyHandler();
        let dateSelector = endDateFormatted.toFormat("yyyy-MM-dd");

        await this.$store.dispatch("updateWorkHistory", {
          userId: data.userData,
          dateSelector,
          recordsToDelete: tables.recordsToDelete,
          recordsToCreate: tables.recordsToSend,
        });

        $("#time_form").form("clear");
        this.$store.state.selectForTimeAddition.project = "";
        this.selected.user = "";
        $("#start_calendar").calendar("clear date");
        $("#end_calendar").calendar("clear date");
        $("#login").dropdown("clear");
        $("#project").dropdown("clear");
        $("#workstage").dropdown("clear");
        this.selected.workStage = "";
        this.selected.additionalInfo = "";
        this.selected.wycofanieReason = "";
        this.selected.comments = "";
        tables.existingRecords = [];
        tables.recordsToModify = [];
        tables.recordsToDelete = [];
        tables.recordsToSend = [];
        if (this.$store.state.workHistoryModule.detailsFromProjectView) {
          await this.$store.dispatch("getWorkHistoryByProject");
          this.$store.state.workHistoryModule.displayValue = "project";
          this.$store.state.workHistoryModule.projectReturnDetails.returnDate =
            dateSelector;
        }
        if (this.propsData.update) {
          await this.$store.dispatch("calculateDurations", {
            login: data.userData,
            startDate: this.$store.state.timeFromCalendar.start,
            endDate: this.$store.state.timeFromCalendar.end,
          });
        }

        this.loader = false;
        $("#time_modal")
          .modal({
            class: "mini inverted",
          })
          .modal("show");
      }
      this.dataValidation = false;
    },
    initForm() {
      $("#time_form").form({
        fields: {
          login: "empty",
          project: "empty",
          workstage: "empty",
          additional_info: "empty",
          other: "empty",
          start_time: "empty",
          end_time: "empty",
          // comments: "empty",
        },
      });
    },
    initDropdown() {
      $("#project").dropdown({
        fullTextSearch: "exact",
        match: "both",
      });
      $("#campaign").dropdown({
        fullTextSearch: "exact",
        match: "both",
      });
      $("#users").dropdown({
        fullTextSearch: "exact",
        match: "both",
      });
      $("#workstage").dropdown();
      $("#additional_info").dropdown();
    },
    workStageHandler(val) {
      this.selected.additionalInfo = "";
      this.selected.wycofanieReason = "";
      if (val != this.workstage[3]) {
        this.sendAdditionalInfo = null;
      }

      if (val == this.workstage[3]) {
        this.showAdditionalInfo = true;
      }
    },
    updateUsers(val) {
      $("#users").dropdown("clear");
      $("#workstage").dropdown("clear");
      if (!this.quickAdd) {
        let filteredCampaign = this.selectableCampaigns.filter(
          (el) => el.campaign_id == val
        );
        if (filteredCampaign.length > 0) {
          const filteredCampaignUsers = [...filteredCampaign[0].users];
          const filteredCampaignCoordinators = [
            ...filteredCampaign[0].coordinators,
          ];
          const allUsers = filteredCampaignUsers.concat(
            filteredCampaignCoordinators
          );
          this.$store.state.users.list = allUsers;
        }
      }
    },
    updateProjects(val) {
      $("#campaign").dropdown("clear");
      $("#users").dropdown("clear");
      $("#workstage").dropdown("clear");
      this.selectableCampaigns = [];
      this.$store.state.users.list = [];
      if (!this.quickAdd) {
        for (const client of this.$store.state.projects.list) {
          for (const project of client.projects) {
            if (project.project_code == val) {
              this.selectableCampaigns = project.campaigns;
            }
          }
        }
      }
    },
  },

  computed: {
    ...mapGetters(["groupUsersAndTheirProjects"]),
    accessLevel() {
      return this.$store.state.loggedUserData.accessLevel;
    },
    // userList() {
    //   if (this.accessLevel == "projectOwner" || this.accessLevel == "admin") {
    //     return this.sortUsers.allUsers;
    //   } else if (this.accessLevel == "koordynator") {
    //     return this.sortUsers.users;
    //   } else {
    //     return null;
    //   }
    // },
    coordination() {
      return this.$store.state.coordinator;
    },
    workstage() {
      return this.$store.state.workStage.choiceOptions;
    },
    wycofanie() {
      return this.$store.state.extraBreak.details;
    },
    startDateExisting() {
      return this.propsData.startDate ? true : false;
    },
    endDateExisting() {
      return this.propsData.endDate ? true : false;
    },
    sendAdditionalInfoHandler() {
      return this.sendAdditionalInfo;
    },
    isDataValid() {
      return this.dataValidation;
    },
    propsData() {
      return {
        userId: this.userId,
        workStageId: this.workStageId,
        projectName: this.projectName,
        projectCode: this.projectCode,
        campaignName: this.campaignName,
        campaignId: this.campaignId,
        selectedWorkStage: this.workStage,
        startDate: this.startDate,
        endDate: this.endDate,
        additionalInfo: this.additionalInfo,
        comments: this.comments,
        showAdditionalInfo: this.additionalInfo ? true : false,
        update: this.update,
      };
    },
  },
};
</script>

<style scoped>
#add-time-container {
  height: calc(100vh - 74px);
  overflow: auto;
}
</style>
