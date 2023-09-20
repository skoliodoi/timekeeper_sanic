<template>
  <AddScheduleModal />
  <SuccessModal
    id="upload-success"
    :message="'Schedule was uploaded successfully!'"
  />
  <div class="ui container" style="display: flex; justify-content: center">
    <form class="ui form" id="check_history_form" style="width: 75%">
      <div class="ui centered fluid card">
        <div class="content" style="background: #3d698e">
          <div class="ui grid">
            <div class="three wide left aligned column">
              <BackButton :selectedPage="'control-panel'" />
            </div>
            <div class="seven wide middle aligned column">
              <h1 class="ui header" style="color: whitesmoke">Schedules</h1>
            </div>
            <div class="six wide right aligned column">
              <div class="ui buttons">
                <button
                  class="ui inverted button"
                  :class="{ active: searchFilter == 'check-schedule' }"
                  @click.prevent="searchHandler('check-schedule')"
                >
                  Check schedule
                </button>
                <div class="or"></div>
                <button
                  class="ui inverted button"
                  :class="{ active: searchFilter == 'add-schedule' }"
                  @click.prevent="searchHandler('add-schedule')"
                >
                  Add schedule
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="content" v-if="searchFilter == 'add-schedule'">
          <SelectProjectModal id="schedule-project" />
          <div class="field">
            <div class="ui file action input" style="width: 100%">
              <input id="fileInput" type="file" @change="handleFile($event)" />
              <button
                for="fileInput"
                class="ui button lotr"
                @click="cancelAdding()"
                v-if="file"
              >
                <i class="times alternate icon"></i>
                Usuń
              </button>
              <label for="fileInput" class="ui facebook button">
                <i class="upload icon"></i>
                Choose file
              </label>
            </div>
          </div>
        </div>
        <div class="content" v-else>
          <SelectProjectModal id="schedule-project" />
          <SchedulesCalendar :calendarType="calendarType" />

          <!-- <div
            class="ui toggle checkbox"
            style="display: flex; justify-content: center"
          >
            <input
              type="checkbox"
              tabindex="0"
              class="hidden"
              @change="changeCalendarType"
            />
            <label>Check entire month</label>
          </div> -->
        </div>

        <div class="ui center aligned negative message" v-if="errorData.error">
          <p>You need to choose a{{ errorData.errorText }}!</p>
        </div>
        <div
          class="ui bottom instagram attached submit button"
          :class="{'disabled': blockButton}"
          @click="schedulesHandler(this)"
        >
          <i
            class="upload alternate icon"
            v-if="searchFilter == 'add-schedule'"
          ></i>
          <i class="calendar alternate icon" v-else></i>
          {{ buttonText }}
        </div>
      </div>
    </form>
  </div>
</template>

<script>
const { DateTime } = require("luxon");
import AddScheduleModal from "../../../models/modals/AddScheduleModal.vue";
import SuccessModal from "../../../models/modals/SuccessModal.vue";
import SchedulesCalendar from "./SchedulesCalendar.vue";
import BackButton from "../../../models/BackButton.vue";
import SelectProjectModal from "../../../models/modals/FormModals/SelectProjectModal.vue";
import { mapGetters } from "vuex";
export default {
  components: {
    BackButton,
    SelectProjectModal,
    SchedulesCalendar,
    AddScheduleModal,
    SuccessModal,
  },
  data() {
    return {
      file: null,
      searchFilter: "check-schedule",
      calendarType: "date",
      // checked: false,
      errorData: { error: false, errorText: "" },
      // showCalendar: true,
      selectedUser: "",
      // showSelectUser: true,
      userLogin: "",
    };
  },
  // props: ["hasAccess", "showSelected", "errorData"],
  emits: ["calendarAction"],
  mounted() {
    $("#schedule-project").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
    $(".ui.checkbox").checkbox();
  },
  updated() {
    $("#schedule-project").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
    $(".ui.checkbox").checkbox();
  },
  computed: {
    ...mapGetters([
      "workAndBrakeState",
      "showSeconds",
      "showMinutes",
      "showHours",
      "hasAccess",
      "hasUpperAccess",
      "accessLevel",
      "usersForHistory",
    ]),
    isThereAFile() {
      return this.file ? true : false;
    },
    isProjectSelected() {
      return this.$store.state.schedules.selectedProjectCode ? true : false;
    },
    blockButton() {
      return this.searchFilter == 'add-schedule' && (!this.isThereAFile || !this.isProjectSelected) ? true : false;
    },
    buttonText() {
      if (this.searchFilter == "add-schedule") {
        return "Add schedule";
      } else {
        return "Check schedules";
      }
    },
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
    async schedulesHandler(val) {
      let selectedDate;
      if (this.searchFilter == "add-schedule") {
        const response = await this.$store.dispatch("uploadSchedule", {
          file: this.file,
          correction: false,
        });
        if (!response.successful) {
          $("#add-schedule-modal")
            .modal({
              closable: false,
              async onApprove() {
                await val.$store.dispatch("uploadSchedule", {
                  file: val.file,
                  correction: true,
                });
                val.clearInputs();
                // $("#bottomfixednag").nag();
              },
              onDeny() {
                val.cancelAdding();
                val.$store.state.loaders.scheduleLoader = false;
              },
            })
            .modal("show");
        } else {
          this.clearInputs();
        }
      } else {
        if (
          this.searchFilter == "check-schedule" &&
          this.calendarType == "date"
        ) {
          selectedDate = DateTime.fromISO(
            new Date($("#day-calendar").calendar("get date")).toISOString()
          ).toFormat("yyyy-MM-dd");
          if (selectedDate == '1970-01-01') {
            selectedDate = DateTime.now().toFormat('yyyy-MM-dd')
          }
        } else {
          selectedDate = DateTime.fromISO(
            new Date($("#month-calendar").calendar("get date")).toISOString()
          ).toFormat("yyyy-MM");
        }
        this.$store.state.schedules.selectedDate = selectedDate;
        await this.$store.dispatch("downloadSchedules", selectedDate);
      }

      // axios.post(`${config.apiBaseUrl}/download_schedule`, {
      //   date: '2023-04-03',
      //   project: "0298/001/RZE",
      //   // date: selectedDate,
      //   // project: this.$store.state.projects.selectedProjectCode,
      // });
    },
    clearInputs() {
      this.cancelAdding();
      this.$store.state.schedules.selectedProjectCode = "";
      $("#schedule-project").dropdown("clear");
      this.searchFilter = "check-schedule";
      this.$store.state.loaders.scheduleLoader = false;
      $("#upload-success").modal("show");
    },
    handleFile(event) {
      this.file = event.target.files[0];
    },
    cancelAdding() {
      const inputVal = document.getElementById("fileInput");
      this.file = "";
      inputVal.value = "";

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
        this.file = null;
        this.$store.state.schedules.selectedProjectCode = "";
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
</style>
