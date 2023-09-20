<template>
  <SuccessModal
    id="quick_time_modal"
    :message="'You added time to the user!'"
  />
  <div class="ui divider"></div>
  <div class="ui form" id="quick_time">
    <div class="fields">
      <div
        class="four wide field"
        :class="{ 'twelve wide': showSelectProjects }"
      >
        <div class="two fields" :class="{ three: showSelectProjects }">
          <div class="field" :class="{ error: dataMissing }">
            <label style="text-align: left">Start date</label>
            <div class="ui calendar" id="quick-add-start">
              <div class="ui input left icon">
                <i class="calendar icon"></i>
                <input type="text" name="start_time" placeholder="Start" />
              </div>
            </div>
          </div>
          <div class="field" :class="{ error: dataMissing }">
            <label>End date</label>
            <div class="ui calendar" id="quick-add-end">
              <div class="ui input left icon">
                <i class="calendar icon"></i>
                <input type="text" name="end_time" placeholder="End" />
              </div>
            </div>
          </div>
          <div
            class="field"
            :class="{ error: dataMissing }"
            v-if="showSelectProjects"
          >
            <label>Project</label>
            <SelectProjectModal @change="quickUpdateProjects($event.target.value)" />
          </div>
          <div
            class="field"
            :class="{ error: dataMissing }"
            v-if="showSelectProjects"
          >
            <label>Campaign</label>
            <SelectCampaignModal :campaigns="selectableCampaigns"/>
          </div>
        </div>
      </div>
      <div
        class="twelve wide field"
        :class="{ 'eight wide': showSelectProjects }"
      >
        <div class="fields">
          <div class="eight wide field" :class="{'sixteen wide': !showAdditionalInfo, error: dataMissing }">
            <label style="text-align: left">Work stage</label>
            <div class="field">
              <SelectWorkstageModal v-model="selectedWorkStage" />
            </div>
          </div>
          <div
            class="eight wide field"
            :class="{ error: dataMissing }"
            v-if="showAdditionalInfo"
          >
            <label style="text-align: left">Additional information:</label>
            <div class="field">
              <SelectAdditionalInfoModal
                v-model="otherReason"
                :selectedProjectProps="projectId"
              />
            </div>
          </div>
          <div
            class="four wide field"
            :class="{ error: dataMissing }"
            v-if="showOtherReason"
          >
            <label style="text-align: left">Other reason</label>
            <div class="field">
              <input type="text" placeholder="Other reason" />
            </div>
          </div>
          <!-- <div
            class="field"
            :class="{
              'thirteen wide': !showOtherReason,
              'nine wide': showOtherReason,
              'two wide': showOtherReason && showAdditionalInfo,
            }"
          >
            <label style="text-align: left">Comments (if necessary)</label>
            <div class="field">
              <input type="text" placeholder="Comments" v-model="comments" />
            </div>
          </div> -->
        </div>
      </div>
    </div>
    <div class="field">
      <label style="text-align: left">Comments (if necessary)</label>
      <input type="text" placeholder="Comments" v-model="comments" />
    </div>
    <div v-if="dataMissing" class="ui negative message">
      <div class="header">There were some errors with your submission.</div>
      <ul class="centered list">
        <li>Make sure you have selected all necessary data.</li>
      </ul>
    </div>
    <button class="ui primary button" @click="addTimeHandler">Add time</button>
  </div>
</template>

<script>
import SuccessModal from "../../models/modals/SuccessModal.vue";
import SelectWorkstageModal from "../../models/modals/FormModals/SelectWorkstageModal.vue";
import SelectAdditionalInfoModal from "../../models/modals/FormModals/SelectAdditionalInfoModal.vue";
import SelectProjectModal from "../../models/modals/FormModals/SelectProjectModal.vue";
import SelectCampaignModal from "../../models/modals/FormModals/SelectCampaignModal.vue";

const { DateTime } = require("luxon");
export default {
  mounted() {
    $("#quick_time_modal").modal();
    this.initCalendar();
    $("#workstage").dropdown();
    $("#project").dropdown();
    $("#campaign").dropdown();
  },
  updated() {
    $("#additional_info").dropdown();
  },
  beforeUnmount() {
    this.clearCalendar();
  },
  props: ["dateForUpdate", "login", "projectId", "addProject"],
  emits: ["close"],
  components: {
    SuccessModal,
    SelectWorkstageModal,
    SelectAdditionalInfoModal,
    SelectProjectModal,
    SelectCampaignModal,
  },
  data() {
    return {
      selectedWorkStage: "",
      otherReason: "",
      comments: "",
      start: "",
      end: "",
      dataMissing: false,
      selectableCampaigns: [],
      // showAdditionalInfo: false,
      // showOtherReason: false,
    };
  },
  methods: {
    quickUpdateProjects(val) {
      $("#campaign").dropdown("clear");
      $("#users").dropdown("clear");
      $("#workstage").dropdown("clear");
      $("#additional_info").dropdown("clear");
      this.selectableCampaigns = [];
      this.$store.state.users.list = [];
      for (const client of this.$store.state.projects.list) {
        for (const project of client.projects) {
          if (project.project_code == val) {
            this.selectableCampaigns = project.campaigns;
          }
        }
      }
    },
    initCalendar() {
      $("#quick-add-start").calendar({
        type: "time",
        ampm: false,
        endCalendar: $("#quick-add-end"),
      });
      $("#quick-add-end").calendar({
        type: "time",
        ampm: false,
        onChange: this.showTime,
        startCalendar: $("#quick-add-start"),
      });
    },
    clearCalendar() {
      $("#quick-add-start").calendar("clear date");
      $("#quick-add-end").calendar("clear date");
    },
    async addTimeHandler() {
      let projectId;

      if (this.projectId) {
        projectId = this.projectId;
      } else if (this.$store.getters.filterProjects.length == 1) {
        projectId = this.$store.getters.filterProjects[0].campaignId;
      } else {
        projectId = this.$store.state.selectForTimeAddition.project;
      }
      if (!projectId || !this.selectedWorkStage || !this.start || !this.end) {
        this.dataMissing = true;
        return;
      }

      this.$store.state.workHistoryModule.loadingPage = true;
      const tables = this.$store.state.updateTables;
      const dataTest = {
        user: this.login,
        date: this.dateForUpdate,
        startTime: `${this.dateForUpdate} ${this.start}`,
        endTime: `${this.dateForUpdate} ${this.end}`,
        login: this.login,
        project: projectId,
        workStage: this.selectedWorkStage,
        additionalInfo: this.otherReason,
        comments: this.comments,
      };
      await this.$store.dispatch("initTimeUpdate", dataTest);
      this.clearModifyHandler();

      await this.$store.dispatch("updateWorkHistory", {
        userId: this.login,
        dateSelector: this.dateForUpdate,
        recordsToDelete: tables.recordsToDelete,
        recordsToCreate: tables.recordsToSend,
      });

      tables.existingRecords = [];
      tables.recordsToModify = [];
      tables.recordsToDelete = [];
      tables.recordsToSend = [];
      if (!this.addProject) {
        await this.$store.dispatch("getWorkHistoryByProject");
      } else {
        await this.$store.dispatch("calculateDurations", {
          login: this.login,
          startDate: this.$store.state.timeFromCalendar.start,
          endDate: this.$store.state.timeFromCalendar.end,
        });
      }

      this.start = "";
      this.end = "";

      this.$store.state.selectForTimeAddition.project = "";
      this.$emit("close");
      this.clearCalendar();
      this.dataMissing = false;
      this.$store.state.workHistoryModule.loadingPage = false;
      $("#quick_time_modal")
        .modal({
          class: "mini inverted",
        })
        .modal("show");
    },
    clearModifyHandler() {
      for (const each of this.$store.state.updateTables.recordsToModify) {
        this.$store.state.updateTables.recordsToDelete.push(
          each.workStageIdNumber
        );
      }
    },
    showTime() {
      let startTime = DateTime.fromISO(
        new Date($("#quick-add-start").calendar("get date")).toISOString()
      ).toFormat("T:ss");

      let endTime = DateTime.fromISO(
        new Date($("#quick-add-end").calendar("get date")).toISOString()
      ).toFormat("T:ss");

      this.start = startTime;
      this.end = endTime;
    },
  },
  computed: {
    workstage() {
      return this.$store.state.workStage.choiceOptions;
    },
    showAdditionalInfo() {
      return this.selectedWorkStage === this.workstage[3] ? true : false;
    },
    showOtherReason() {
      return this.selectedWorkStage === this.workstage[3] && this.otherReason === this.workstage[3] ? true : false;
    },
    showSelectProjects() {
      return this.$store.getters.selectableProjects.length > 1 &&
        this.addProject
        ? true
        : false;
    },
  },
};
</script>

<style scoped>
label {
  text-align: left;
}
</style>
