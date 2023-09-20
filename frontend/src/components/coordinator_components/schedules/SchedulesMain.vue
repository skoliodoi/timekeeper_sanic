<template>
  <Loader
    v-if="$store.state.loaders.scheduleLoader"
    :data="'Please wait, checking schedules...'"
  />
  <ErrorModal />
  <div id="schedules-container">
    <SchedulesSelection v-if="!$store.state.schedules.found" />
    <div v-else style="width: 100%">
      <SchedulesDisplay v-if="$store.state.schedules.list.length > 0" />
      <div
        v-else
        id="no-results-container"
        style="display: flex; justify-content: center"
      >
        <div class="ui icon error message" id="no-results-msg">
          <i class="skull crossbones icon"></i>
          <div class="content">
            <div class="header">No results found for {{ $store.state.schedules.selectedDate }}</div>
            <button style="margin-top: 15px" class="ui google plus button" @click="changeDate">Choose a different date</button>
          </div>
          <i class="skull crossbones icon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from "../../../models/Loader.vue";
import ErrorModal from "../../../models/modals/ErrorModal.vue";
import SchedulesSelection from "./SchedulesSelection.vue";
import SchedulesDisplay from "./SchedulesDisplay.vue";
export default {
  components: { SchedulesSelection, SchedulesDisplay, Loader, ErrorModal },
  data() {
    return {
      selectedProject: "",
    };
  },
  // props: ["hasAccess", "showSelected", "errorData"],
  beforeUnmount() {
    this.$store.state.schedules.found = false;
    this.$store.state.schedules.selectedDate = "";
    this.$store.state.schedules.selectedProjectCode= "";
  },
  computed: {
    // selectionList() {
    //   let selectionValue;
    //   if (this.searchFilter == "user") {
    //     selectionValue = this.$store.state.projects.allUsers;
    //     return {
    //       selectionRefresher: "",
    //       selection: selectionValue,
    //       selectionLabel: "Choose user name",
    //       projectSelection: false,
    //     };
    //   } else {
    //     return {
    //       selectionRefresher: "",
    //       selection: this.$store.getters.filterProjects,
    //       selectionLabel: "Choose a campaign",
    //       projectSelection: true,
    //     };
    //   }
    // },
  },
  methods: {
    changeDate() {
      this.$store.state.schedules.found = false;
      this.$store.state.projects.selectedProjectCode = "";
    },
    changeCalendarType($event) {
      if ($event.target.checked) {
        this.calendarType = "month";
      } else {
        this.calendarType = "date";
      }
    },
    searchHandler(val) {
      if (val == "check-schedule") {
        console.log(this.calendarType);
        this.calendarType = "date";
      }
      $("#day-calendar").calendar({
        type: `date`,
      });
      this.errorData.error = false;
      this.searchFilter = val;
    },
    // async checkHistoryByProject() {
    //   if (this.selectionList.selection.length == 1) {
    //     this.$store.state.checkHistory.projects.push(
    //       this.selectionList.selection[0].campaign_id
    //     );
    //   }
    //   if (
    //     (!this.$store.state.timeFromCalendar.start ||
    //       !this.$store.state.timeFromCalendar.end) &&
    //     this.$store.state.checkHistory.projects <= 0 &&
    //     !this.$store.state.checkHistory.selectAll
    //   ) {
    //     this.errorData.errorText = " date and a project";
    //     this.errorData.error = true;
    //     return;
    //   } else if (
    //     !this.$store.state.timeFromCalendar.start ||
    //     !this.$store.state.timeFromCalendar.end
    //   ) {
    //     this.errorData.errorText = " date";
    //     this.errorData.error = true;
    //     return;
    //   } else if (
    //     this.$store.state.checkHistory.projects <= 0 &&
    //     !this.$store.state.checkHistory.selectAll
    //   ) {
    //     this.errorData.errorText = " project";
    //     this.errorData.error = true;
    //     return;
    //   } else {
    //     this.errorData.error = false;
    //     this.$emit("calendarAction", {
    //       showCalendar: false,
    //       user: "",
    //     });
    //     this.$store.state.loaders.workHistoryLoader = true;

    //     await this.$store.dispatch("getWorkHistoryByProject");
    //     this.$store.state.workHistoryModule.displayValue = "project";
    //     this.$store.state.loaders.workHistoryLoader = false;
    //   }
    // },
  },
};
</script>

<style scoped>
.ui.placeholder.segment {
  min-height: 0;
}
#no-results-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

#no-results-msg {
  width: 40%;
}
#schedules-container {
  height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
