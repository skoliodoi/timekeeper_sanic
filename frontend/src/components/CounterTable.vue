<template>

  <!-- <span>Selected:</span>
  <span>{{ $store.state.projects.selectedCampaign.campaign_id }}</span>
  <span>Prev campaign:</span>
  <span>{{ $store.state.counterElements.prevCampaign.campaign_id }}</span>
  <span>Are they the same?</span>
  <span>{{ disableWorkButton }}</span> -->
  <!-- Colspan: {{ workdayColspan }} -->
  <table class="ui fixed celled table" style="border: 1px solid #3d698e">
    <thead style="background-color: #3d698e">
      <tr v-if="showHeader">
        <th :colspan="topHeaderColspan" id="select-th">
          <SelectProject />
        </th>
      </tr>
      <tr rowspan="2" id="header-row">
        <th
          class="center aligned"
          v-if="
            $store.state.counter.started || (hasOneCampaign && hasOneProject)
          "
        >
          <div style="display: flex; margin-bottom: 2px">
            <div style="flex: 2; align-self: center">
              Selected project:
              {{
                $store.state.counterElements.changeCampaignByButton ||
                $store.state.counterElements.changeProjectByButton
                  ? projectName
                  : $store.getters.showProjectName.project
              }}
            </div>
            <div style="flex: 1" v-if="showProjectChangeButton">
              <button
                v-if="!$store.state.counterElements.changeProjectByButton"
                class="compact ui inverted button"
                @click="changeProject"
              >
                Change
              </button>
              <button
                v-else
                class="compact ui inverted button"
                @click="cancelChanges"
              >
                Cancel
              </button>
            </div>
            <div
              v-else
              :class="{
                'flex-zero': hasOneCampaign,
                'flex-one': !hasOneCampaign,
              }"
            ></div>
          </div>
          <div style="display: flex; margin-top: 2px">
            <div style="flex: 2; align-self: center">
              Selected campaign:
              {{
                $store.state.counterElements.changeCampaignByButton ||
                $store.state.counterElements.changeProjectByButton
                  ? campaignName
                  : $store.getters.showProjectName.campaign
              }}
            </div>
            <div style="flex: 1" v-if="!hasOneCampaign">
              <button
                v-if="!$store.state.counterElements.changeCampaignByButton"
                class="compact ui inverted button"
                @click="changeCampaigns"
              >
                Change
              </button>
              <button
                v-else
                class="compact ui inverted button"
                @click="cancelChanges"
              >
                Cancel
              </button>
            </div>
            <div
              v-else
              :class="{
                'flex-zero': hasOneCampaign,
                'flex-one': hasOneCampaign && !hasOneProject,
              }"
            ></div>
          </div>
        </th>
        <th class="center aligned" :colspan="workdayColspan">
          <h1>
            Total workday: <b>{{ showTotalHours }}</b
            >:<b>{{ showTotalMinutes }}</b
            >:<b>{{ showTotalSeconds }}</b>
          </h1>
          <div
            v-if="$store.state.counter.started"
            style="
              display: flex;
              align-items: center;
              justify-content: space-evenly;
            "
          >
            <span style="margin-right: 5px"
              >Work started at: {{ workStart.toFormat("T") }}</span
            >
            <button
              class="ui compact labeled negative icon button"
              @click="confirmStopCounter($store)"
            >
              <i class="stop icon"></i>
              Stop
            </button>
          </div>
        </th>
        <th class="center aligned" v-if="$store.state.counter.started">
          <h3 style="margin-bottom: 15px">
            Current work stage:
            {{ extraBreakInfo ? extraBreakInfo : currentWorkStage }}
          </h3>
          <h3 style="margin-top: 10px">
            Duration: <b>{{ showCurrentHours }}</b
            >:<b>{{ showCurrentMinutes }}</b
            >:<b>{{ showCurrentSeconds }}</b>
          </h3>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="work" class="center aligned" id="work-cell">
          Total work time: <b>{{ showWorkHours }}</b
          >:<b>{{ showWorkMinutes }}</b
          >:<b>{{ showWorkSeconds }}</b>
        </td>
        <td data-label="work" class="center aligned" id="break-cell">
          Total break time: <b>{{ showBreakHours }}</b
          >:<b>{{ showBreakMinutes }}</b
          >:<b>{{ showBreakSeconds }}</b>
        </td>
        <td data-label="work" class="center aligned" id="other-cell">
          Total other time: <b>{{ showOtherHours }}</b
          >:<b>{{ showOtherMinutes }}</b
          >:<b>{{ showOtherSeconds }}</b>
        </td>
      </tr>
      <tr v-if="extra.state">
        <td colspan="3" id="select-other">
          <ExtraBreak />
        </td>
      </tr>
      <tr v-if="showTimerButtons">
        <td colspan="3" class="center aligned">
          <TimerButtons :disable-work="disableWorkButton" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script>
import { mapGetters } from "vuex";
import TimerButtons from "./display/TimerButtons.vue";
import SelectProject from "./SelectProject.vue";
import ExtraBreak from "./ExtraBreak.vue";

export default {
  data() {
    return {
      showChangeButtons: false,
      prevCampaign: "",
      prevProjectName: "",
      prevProjectCode: "",
      campaignButtonText: "Change",
      projectButtonText: "Change",
      campaignName: "",
      projectName: "",
      changeCampaignByButton: false,
      selectableCampaigns: [],
      showSelectProject: false,
    };
  },
  mounted() {
    this.saveNames();
  },
  components: {
    TimerButtons,
    SelectProject,
    ExtraBreak,
  },
  methods: {
    saveNames() {
      this.campaignName = this.$store.getters.showProjectName.campaign;
      this.projectName = this.$store.getters.showProjectName.project;
    },
    changeCampaigns() {
      this.cancelExtraBreak();
      this.saveNames();
      this.$store.state.counterElements.prevCampaign = this.$store.state.projects.selectedCampaign;
      this.$store.state.counterElements.prevProjectName = this.$store.state.projects.selected;
      this.$store.state.counterElements.prevProjectCode = this.$store.state.projects.selectedProjectCode;
      this.$store.state.counterElements.showSelection = true;
      this.$store.state.counterElements.changeCampaignByButton = true;
      this.$store.state.counterElements.changeProjectByButton = false;
      this.$store.state.counterElements.showProjectSelection = false;
    },
    changeProject() {
      this.cancelExtraBreak();
      this.saveNames();
      this.$store.state.counterElements.prevCampaign = this.$store.state.projects.selectedCampaign;
      this.$store.state.counterElements.prevProjectName = this.$store.state.projects.selected;
      this.$store.state.counterElements.prevProjectCode = this.$store.state.projects.selectedProjectCode;
      this.$store.state.counterElements.showSelection = true;
      this.$store.state.counterElements.changeProjectByButton = true;
      this.$store.state.counterElements.changeCampaignByButton = false;
    },
    cancelChanges() {
      this.cancelExtraBreak();
      this.$store.state.counterElements.showSelection = false;
      this.$store.state.counterElements.changeProjectByButton = false;
      this.$store.state.counterElements.changeCampaignByButton = false;
      this.$store.state.workTimePassed = false;
      this.$store.state.projects.selectedCampaign = this.$store.state.counterElements.prevCampaign;
      if (this.$store.state.counterElements.prevProjectName) {
        this.$store.state.projects.selected = this.$store.state.counterElements.prevProjectName;
        this.$store.state.projects.selectedProjectCode = this.$store.state.counterElements.prevProjectCode;
      }
      this.$store.state.counterElements.prevCampaign = "";
      this.$store.state.counterElements.prevProjectName = "";
      this.$store.state.counterElements.prevProjectCode = "";
    },
    confirmStopCounter(val) {
      this.cancelExtraBreak();
      $("#timer_modal")
        .modal({
          class: "tiny inverted",
          closable: false,
          onApprove: async function () {
            await val.dispatch("stopCounter");
            $("body").toast({
              class: "center aligned green",
              position: "bottom attached",
              message: "Your timer was stopped!",
            });
          },
        })
        .modal("show");
    },
    cancelExtraBreak() {
      this.$store.state.extraBreak.state = false;
      this.$store.state.extraBreak.selected = "";
    },
  },
  computed: {
    ...mapGetters([
      "selectableProjects",
      "showCurrentSeconds",
      "showCurrentMinutes",
      "showCurrentHours",
      "showWorkSeconds",
      "showWorkMinutes",
      "showWorkHours",
      "showBreakSeconds",
      "showBreakMinutes",
      "showBreakHours",
      "showOtherSeconds",
      "showOtherMinutes",
      "showOtherHours",
      "showTotalSeconds",
      "showTotalMinutes",
      "showTotalHours",
      "showTimeTable",
      "showWorkTimeTable",
      "showBreakTimeTable",
      "workAndBrakeState",
    ]),
    disableWorkButton() {
      return (this.$store.state.counterElements.prevCampaign.campaign_id ===
        this.$store.state.projects.selectedCampaign.campaign_id ||
        !this.$store.state.counterElements.prevCampaign) &&
        this.$store.state.counter.started
        ? true
        : false;
    },
    showTimerButtons() {
      return this.$store.state.counterElements.showButtons;
    },
    hasOneProject() {
      return this.selectableProjects.length == 1 ? true : false;
    },
    hasOneCampaign() {
      return this.$store.state.counterElements.oneCampaign;
    },
    workdayColspan() {
      return this.$store.state.counter.started
        ? 1
        : this.hasOneCampaign && this.hasOneProject
        ? 2
        : 3;
    },
    topHeaderColspan() {
      return this.showChangeButtons ? 2 : 3;
    },
    totalWorkDuration() {
      return this.$store.state.workTime.totalDuration;
    },
    totalBreakDuration() {
      return this.$store.state.breakTime.totalDuration;
    },
    extra() {
      return this.$store.state.extraBreak;
    },
    currentWorkStage() {
      return this.$store.state.workStage.currentlySelected;
    },
    uploadStatus() {
      return this.$store.state.uploadData.successful;
    },
    workStart() {
      // return DateTime(this.$store.state.workStart).toFormat("T");
      return this.$store.state.workStart;
    },
    extraBreakInfo() {
      return this.$store.state.extraBreak.additionalInfo;
    },
    showHeader() {
      return this.$store.state.counterElements.showSelection;
    },
    showProjectChangeButton() {
      return this.selectableProjects.length > 1 ? true : false;
    },
  },
};
</script>
<style scoped>
#header-row > th {
  background-color: transparent !important;
  border: none;
  color: whitesmoke;
}
#select-th,
#select-other {
  overflow: visible !important;
  padding: 7px 13px;
}

#work-cell,
#other-cell {
  color: whitesmoke;
}

#work-cell {
  background-color: #22913c;
}

#break-cell {
  background-color: #f6ce58;
  color: rgb(18, 17, 17);
}

#other-cell {
  background-color: #864c99;
}

.flex-zero {
  flex: 0;
}
.flex-one {
  flex: 1;
}
</style>
