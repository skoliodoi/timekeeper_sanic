<template>
  <Loader v-if="loadingPage" :data="'Updating history...'" />
  <div
    v-else
    v-for="(topDataLayer, projectId) in filterProjects.projects"
    :key="projectId"
  >
    <div v-for="(dateDataLayer, date) in topDataLayer.campaignData" :key="date">
      <div class="project-header">
        <div class="return-button-box">
          <button class="ui inverted button" @click="differentDateHandler">
            Go back
          </button>
        </div>
        <div class="selected-period">
          <h2 class="ui header">{{ selectedPeriod }}</h2>
        </div>
        <div class="selection-box">
          <div>
            <select
              class="ui dropdown"
              id="project_select"
              v-model="selectedCampaign"
              @change="readjustDate"
            >
              <option
                v-for="each in sortUsers.projects"
                :key="each.id"
                :value="each.id"
              >
                {{ each.name }}
              </option>
            </select>
          </div>
          <div>
            <select
              class="ui dropdown"
              id="date_selection"
              v-model="selectedDate"
              @change="getDate($event)"
            >
              <option
                v-for="each in filterProjects.datesToChoose"
                :key="each"
                :value="each"
              >
                {{ each }}
              </option>
            </select>
          </div>
          <button
            class="ui facebook button"
            :class="{ disabled: checkBlockPrev }"
            @click="getPreviousDay(selectedDate)"
          >
            Previous day
          </button>
          <button
            class="ui whatsapp button"
            :class="{ disabled: checkBlockNext }"
            @click="getNextDay(selectedDate)"
          >
            Next day
          </button>
        </div>
      </div>
      <div class="user-container">
        <div v-for="(userDataLayer, user) in dateDataLayer" :key="user">
          <ProjectDisplayListElement
            :dateData="date"
            :login="userDataLayer.login"
            :koordynator="userDataLayer.koordynator"
            :userName="userDataLayer.userName"
            :workTime="userDataLayer.formattedWorkDay.workTime"
            :breakTime="userDataLayer.formattedWorkDay.breakTime"
            :otherTime="userDataLayer.formattedWorkDay.otherTime"
            :totalTime="userDataLayer.formattedWorkDay.total"
            :campaignId="selectedCampaign"
            :projectView="true"
            :googleData="userDataLayer.data"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectDisplayListElement from "./DisplayListElement.vue";
import Loader from "../../../models/Loader.vue";

export default {
  props: ["propsDate"],
  emits: ["showDetails", "checkDifferentDate"],
  components: {
    ProjectDisplayListElement,
    Loader,
  },
  mounted() {
    this.adjustProject();
    this.adjustDate();
    $("#project_select").dropdown({
      placeholder: this.sortUsers.projects[0].name,
    });
    $("#date_selection").dropdown({
      placeholder: this.filterProjects.datesToChoose[0],
    });
  },
  updated() {
    if (this.filterProjects.datesToChoose.length <= 1) {
      this.blockNext = true;
    }
    $("#project_select").dropdown({
      placeholder: this.sortUsers.projects[0].name,
    });
    $("#date_selection").dropdown({
      placeholder: this.filterProjects.datesToChoose[0],
    });
  },
  data() {
    return {
      addTime: false,
      selectedCampaign: "",
      selectedCampaignName: "",
      selectedDate: "",
      blockNext: false,
      blockPrev: true,
    };
  },
  methods: {
    getDate(val) {
      const index = this.filterProjects.datesToChoose.indexOf(val.target.value);
      if (index > 0) {
        this.blockPrev = false;
      } else {
        this.blockPrev = true;
      }
      if (index == this.filterProjects.datesToChoose.length - 1) {
        this.blockNext = true;
      } else {
        this.blockNext = false;
      }
    },
    differentDateHandler() {
      this.$emit("checkDifferentDate");
    },
    getPreviousDay(val) {
      const dates = this.filterProjects.datesToChoose;
      const index = dates.indexOf(val) - 1;

      this.blockNext = false;
      this.selectedDate = dates[index];
      $("#date_selection").val(this.selectedDate).change();
      if (index > 0) {
        this.blockPrev = false;
      } else {
        this.blockPrev = true;
      }
    },
    getNextDay(val) {
      const dates = this.filterProjects.datesToChoose;
      const index = dates.indexOf(val) + 1;
      this.selectedDate = dates[index];
      this.blockPrev = false;
      $("#date_selection").val(this.selectedDate).change();
      if (index < dates.length - 1) {
        this.blockNext = false;
      } else {
        this.blockNext = true;
      }
    },
    showQuickAddTimeHandler(id) {
      $(`#${id}`).toggle();
    },
    adjustProject() {
      if (this.$store.state.workHistoryModule.selectedCampaign) {
        this.selectedCampaign =
          this.$store.state.workHistoryModule.selectedCampaign;
      } else {
        this.selectedCampaign = this.sortUsers.projects[0].id;
      }
      this.$store.state.workHistoryModule.selectedCampaign = "";
    },
    handleButtons(date) {
      const index = this.filterProjects.datesToChoose.indexOf(date);
        if (index > 0) {
          this.blockPrev = false;
        } else {
          this.blockPrev = true;
        }
        if (index == this.filterProjects.datesToChoose.length - 1) {
          this.blockNext = true;
        } else {
          this.blockNext = false;
        }
    },
    adjustDate() {
      if (this.propsDate) {
        this.selectedDate = this.propsDate;
        this.handleButtons(this.propsDate)
      } else {
        this.selectedDate = this.filterProjects.datesToChoose[0];
        this.blockPrev = true;
        this.blockNext = false;
      }
    },
    readjustDate() {
      this.selectedDate = this.filterProjects.datesToChoose[0];
      this.handleButtons(this.filterProjects.datesToChoose[0]);
    },
  },
  computed: {
    checkBlockPrev() {
      return this.blockPrev;
    },
    checkBlockNext() {
      return this.blockNext;
    },
    displaySelectedDate() {
      return this.selectedDate;
    },
    loadingPage() {
      return this.$store.state.workHistoryModule.loadingPage;
    },
    selectedPeriod() {
      if (
        this.$store.state.timeFromCalendar.start ==
        this.$store.state.timeFromCalendar.end
      ) {
        return this.$store.state.timeFromCalendar.start;
      } else {
        return `${this.$store.state.timeFromCalendar.start} - ${this.$store.state.timeFromCalendar.end}`;
      }
    },
    sortUsers() {
      let projectTable = [];
      let projectsToSelect = {};
      let newObj = {};
      let formattedObj = {};
      formattedObj = { ...this.$store.getters.groupHistoryByProject };
      for (const project in formattedObj) {
        newObj[project] = {};
        for (const date in formattedObj[project]) {
          let dateObj = {};
          dateObj[date] = formattedObj[project];
          for (const name in formattedObj[project][date]) {
            let dataObj = {};
            dataObj = { ...formattedObj[project][date][name] };
            let [nameData] = [name];
            formattedObj[project][date][name] = {
              userName: nameData,
              data: dataObj,
            };
            let totalDuration = 0;
            let totalWorkDuration = 0;
            let totalBreakDuration = 0;
            let totalOtherDuration = 0;
            for (const history in formattedObj[project][date][name]["data"]) {
              const iterator =
                formattedObj[project][date][name]["data"][history];
              totalDuration += parseInt(iterator.work_stage_duration);
              if (
                iterator.work_stage ==
                this.$store.state.workStage.choiceOptions[1]
              ) {
                totalWorkDuration += parseInt(iterator.work_stage_duration);
              } else if (
                iterator.work_stage ==
                this.$store.state.workStage.choiceOptions[2]
              ) {
                totalBreakDuration += parseInt(iterator.work_stage_duration);
              } else {
                totalOtherDuration += parseInt(iterator.work_stage_duration);
              }

              let displayTotalWorkTime = {
                hours: 0,
                minutes: 0,
                seconds: 0,
              };
              let displayTotalBreakTime = {
                hours: 0,
                minutes: 0,
                seconds: 0,
              };
              let displayTotalOtherTime = {
                hours: 0,
                minutes: 0,
                seconds: 0,
              };
              let displayTotalTime = {
                hours: 0,
                minutes: 0,
                seconds: 0,
              };

              let displayStageTime = {
                hours: 0,
                minutes: 0,
                seconds: 0,
              };

              this.$store.dispatch("durationDisplayHandler", {
                duration: totalWorkDuration,
                timeToDisplay: displayTotalWorkTime,
              });
              this.$store.dispatch("durationDisplayHandler", {
                duration: totalBreakDuration,
                timeToDisplay: displayTotalBreakTime,
              });
              this.$store.dispatch("durationDisplayHandler", {
                duration: totalOtherDuration,
                timeToDisplay: displayTotalOtherTime,
              });
              this.$store.dispatch("durationDisplayHandler", {
                duration: totalDuration,
                timeToDisplay: displayTotalTime,
              });
              this.$store.dispatch("durationDisplayHandler", {
                duration: iterator.work_stage_duration,
                timeToDisplay: displayStageTime,
              });

              projectsToSelect = {
                name: iterator.campaign_name,
                id: iterator.campaign_id,
              };

              formattedObj[project][date][name]["workDay"] = {
                workTime: totalWorkDuration,
                breakTime: totalBreakDuration,
                otherTime: totalOtherDuration,
                total: totalDuration,
              };

              formattedObj[project][date][name]["formattedWorkDay"] = {
                workTime: displayTotalWorkTime,
                breakTime: displayTotalBreakTime,
                otherTime: displayTotalOtherTime,
                total: displayTotalTime,
              };
              formattedObj[project][date][name]["login"] = iterator.user_id;
              formattedObj[project][date][name]["koordynator"] =
                iterator.koordynator == "1" ? true : false;
              formattedObj[project][date][name]["projectId"] =
                iterator.campaign_id;
              iterator.displayStageDuration = displayStageTime;
              newObj[project]["campaignName"] = iterator.campaign_name;
            }
          }
        }
        newObj[project]["campaignData"] = { ...formattedObj[project] };
        projectTable.push(projectsToSelect);
      }

      // console.log(newObj);
      return {
        projects: projectTable,
        data: newObj,
      };
    },
    filterProjects() {
      const initialData = this.sortUsers.data;
      let datesToChoose = [];
      let returnObj = {
        returnData: {},
      };
      let campaignName = "";
      const filteredProject = Object.keys(initialData)
        .filter((key) => key == this.selectedCampaign)
        .reduce((obj, key) => {
          campaignName = initialData[key].campaignName;
          return {
            ...obj,
            [key]: initialData[key],
          };
        }, {});
      const dates = Object.values(filteredProject);

      for (const each of dates) {
        datesToChoose = Object.keys(each.campaignData).sort();
      }

      for (const each in filteredProject) {
        const initialValues = Object.values(filteredProject[each]);
        const filteredDates = Object.keys(initialValues[1])
          .filter((key) => key == this.selectedDate)
          .reduce((obj, key) => {
            return {
              ...obj,
              [key]: initialValues[1][key],
            };
          }, {});
        returnObj["returnData"]["campaignData"] = filteredDates;
        returnObj["returnData"]["campaignName"] = campaignName;
      }
      return {
        projects: returnObj,
        datesToChoose,
      };
    },
  },
};
</script>

<style scoped>
.user-container {
  height: calc(100vh - 126px);
  overflow: auto;
}
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center !important;
  margin-bottom: 0;
  background: #3D698E !important;
  height: 60px;
}

.return-button-box {
  display: flex;
  flex: 2;
  padding: 0 0.5rem;
}

.selected-period {
 
  display: flex;
  flex: 2;
  padding: 0 0.5rem;
}

.selected-period > h2 {
  color: whitesmoke !important;
}
.selection-box {
  display: flex;
  justify-content: space-around;
  flex: 2;
  padding: 0 0.5rem;
}

#buttons {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
}

#buttons button {
  width: 75% !important;
}

@media screen and (max-width: 1536px) {
  .selection-box {
    flex: 1.5;
  }
}
</style>
