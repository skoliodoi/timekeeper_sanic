<template>
  <div class="ui form">
    <div
      :class="{
        'two fields': showProjectButton,
      }"
    >
      <div class="field" v-if="showProjectButton">
        <label style="text-align: left">Choose project</label>
        <select
          class="ui selection dropdown"
          v-model="selectedProject"
          @change="assignCampaigns(selectedProject)"
        >
          <option value="">Project</option>
          <option
            v-for="each in selectableProjects"
            :key="each"
            :value="each.code"
          >
            {{ each.name }}
          </option>
        </select>
      </div>
      <div class="field">
        <label style="text-align: left">Choose campaign</label>
        <select
          class="ui selection dropdown"
          v-model="selectedProject"
          @change="selectProject"
        >
          <option value="">Campaign</option>
          <option
            v-for="each in selectableCampaigns"
            :key="each"
            :value="each.campaign_id"
          >
            {{ each.campaign_name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
const { DateTime } = require("luxon");
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      selectedProject: "",
      selectableCampaigns: [],
    };
  },
  mounted() {
    $(".ui.dropdown").dropdown();
    this.checkProjects();
  },
  computed: {
    ...mapGetters(["selectableProjects"]),
    state() {
      return this.$store.state;
    },
    showProjectButton() {
      return this.$store.state.counterElements.showProjectSelection ||
        (this.$store.state.counterElements.changeProjectByButton &&
          !this.$store.state.counterElements.changeCampaignByButton)
        ? true
        : false;
    },
  },

  methods: {
    checkProjects() {
      if (this.$store.state.counterElements.changeCampaignByButton) {
        const codeToAssign = this.$store.state.projects.selectedProjectCode
          ? this.$store.state.projects.selectedProjectCode
          : this.$store.state.counterElements.currentProjectCode;
        this.assignCampaigns(
          codeToAssign
        );
      }

      const projectLength = this.selectableProjects.length;
      if (projectLength == 1) {
        const [project] = this.selectableProjects;
        this.$store.state.counterElements.oneProject = true;
        this.$store.state.projects.selected = project.name;
        this.$store.state.projects.selectedProjectCode = project.code;
        this.selectedProject = project.code;
        const checkCampaigns = this.assignCampaigns(project.code);
        if (checkCampaigns == 1) {
          const [campaign] = this.selectableCampaigns;
          this.checkCampaignHours(campaign);
          this.$store.state.projects.selectedCampaign = campaign;
          this.$store.state.counterElements.showSelection = false;
          this.$store.state.counterElements.oneCampaign = true;
          this.$store.state.counterElements.showSelected = true;
          this.$store.state.counterElements.showButtons = true;
        } else {
          this.$store.state.counterElements.showProjectSelection = false;
        }
      }
    },
    assignCampaigns(projectVal) {
      for (const client of this.$store.state.projects.list) {
        for (const project of client.projects) {
          if (project.project_code == projectVal) {
            this.selectableCampaigns = project.campaigns;
          }
        }
      }
      return this.selectableCampaigns.length;
    },
    checkCampaignHours(campaign){
      const dt = DateTime.now();
      const selectedProjectEndingHours = DateTime.fromSQL(
        campaign.ending_hours
      );
      const isProjectEndingNextDay = campaign.ending_next_day;
      if (!isProjectEndingNextDay && selectedProjectEndingHours < dt) {
        this.$store.state.workTimePassed = true;
      } else {
        this.$store.state.workTimePassed = false;
      }
    },
    selectProject() {
      // let dt = DateTime.now();
      let chosenCampaign;
      let chosenProject;
      let chosenProjectCode;
      for (const client of this.state.projects.list) {
        for (const project of client.projects) {
          for (const campaign of project.campaigns) {
            if (campaign.campaign_id == this.selectedProject) {
              chosenProject = project.name;
              chosenProjectCode = project.project_code;
              chosenCampaign = campaign;
            }
          }
        }
      }

      this.checkCampaignHours(chosenCampaign);
      // let selectedProjectEndingHours = DateTime.fromSQL(
      //   chosenCampaign.ending_hours
      // );
      // let isProjectEndingNextDay = chosenCampaign.ending_next_day;

      // if (!isProjectEndingNextDay && selectedProjectEndingHours < dt) {
      //   this.$store.state.workTimePassed = true;
      // } else {
      //   this.$store.state.workTimePassed = false;
      // }
      this.$store.state.campaignChange = true;
      this.$store.state.showCounterDetails = true;
      this.$store.state.projects.selected = chosenProject;
      this.$store.state.projects.selectedProjectCode = chosenProjectCode;
      this.$store.state.projects.selectedCampaign = chosenCampaign;
      this.$store.state.counterElements.showSelected = true;
      this.$store.state.counterElements.showButtons = true;
    },
  },
};
</script>

<style></style>
