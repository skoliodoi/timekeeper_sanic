<template>
  <div>
    <!-- <Navbar /> -->
    <ErrorModal
      id="counter-error"
      @errorAction="errorHandler"
      :message="'Due to an error, your submition could not be uploaded to the server. Please reload the page and try again.'"
      :errorDetails="this.$store.state.errors.counterError.errorData"
    />
    <div class="ui equal width doubling stackable grid">
      <div
        class="twelve wide column"
        id="counter_container"
        style="display: flex; flex-direction: column"
      >
        <div
          class="ui fluid card"
          id="table-card"
          :class="{
            'double fast loading blue': stopCounterLoader || historyLoader,
          }"
        >
          <div class="content" style="padding: 0">
            <CounterTable />
          </div>
        </div>
        <!-- <div
          class="ui fluid card"
          :class="{
            'double fast loading blue': stopCounterLoader || historyLoader,
          }"
        >
          <div class="content" style="background: #3d698e">
            <div class="ui stackable grid">
              <div class="six wide column" v-if="$store.state.counter.started">
                <h1 class="ui header" style="color: whitesmoke">
                  Current work stage:
                </h1>
                <h1 class="ui header" style="color: whitesmoke; margin-top: 0">
                  <b>{{ showCurrentHours }}</b
                  >:<b>{{ showCurrentMinutes }}</b
                  >:<b>{{ showCurrentSeconds }}</b>
                </h1>
              </div>
              <div
                class="nine wide middle aligned column"
                :class="{ 'sixteen wide': !this.$store.state.counter.started }"
                style="display: flex"
              >
                <h1
                  class="ui massive header"
                  style="font-size: xxx-large; color: whitesmoke"
                >
                  Total workday: <b>{{ showTotalHours }}</b
                  >:<b>{{ showTotalMinutes }}</b
                  >:<b>{{ showTotalSeconds }}</b>
                </h1>
              </div>
              <div
                class="one wide top aligned column"
                v-if="$store.state.counter.started"
              >
                <div v-if="$store.state.dataUpload.ongoing">
                  <i
                    class="right floated large inverted notched circle loading icon"
                  ></i>
                </div>
                <div v-else>
                  <i
                    v-if="$store.state.dataUpload.successful"
                    class="right floated large colored cloud upload alternate icon"
                    style="color: #16ab39"
                  ></i>
                  <i
                    v-else
                    class="right floated large colored exclamation icon"
                    style="color: #db2828"
                  ></i>
                </div>
              </div>
            </div>
          </div>
          <div
            class="content"
            v-if="$store.state.counterElements.showSelection"
          >
            <div class="column">
              <SelectProject />
            </div>
          </div>
          <div class="content" v-else>
            <div class="ui equal width grid">
              <div class="column" v-if="$store.state.counter.started">
                <h3 class="ui header">Work started at:</h3>
                <h4 class="ui header" style="padding-top: 0; margin-top: 0">
                  {{ workStart.toFormat("T") }}
                </h4>
              </div>

              <div
                class="middle aligned column"
                v-if="$store.state.counterElements.showSelected"
              >
                <div class="description">
                  <h1 class="ui header">
                    Selected project:
                    {{ this.$store.getters.showProjectName.project }}
                  </h1>
                  <h1 class="ui header">
                    Selected campaign:
                    {{ this.$store.getters.showProjectName.campaign }}
                  </h1>
                </div>
              </div>
              <div
                class="middle aligned column"
                v-if="$store.state.counter.started"
              >
                <h3 class="ui header">Current Stage: {{ currentWorkStage }}</h3>
                <h4
                  v-if="extraBreakInfo"
                  class="ui header"
                  style="padding-top: 0; margin-top: 0"
                >
                  {{ extraBreakInfo }}
                </h4>
              </div>
            </div>
          </div>
          <div class="content">
            <div class="ui equal width stackable grid">
              <div class="column">
                <div class="ui secondary inverted green segment">
                  <h3 class="ui header">Total work time:</h3>
                  <h4 class="ui header" style="padding-top: 0; margin-top: 0">
                    <b>{{ showWorkHours }}</b
                    >:<b>{{ showWorkMinutes }}</b
                    >:<b>{{ showWorkSeconds }}</b>
                  </h4>
                </div>
              </div>
              <div class="column">
                <div class="ui secondary inverted yellow segment">
                  <h3 class="ui header">Total break time:</h3>
                  <h4 class="ui header" style="padding-top: 0; margin-top: 0">
                    <b>{{ showBreakHours }}</b
                    >:<b>{{ showBreakMinutes }}</b
                    >:<b>{{ showBreakSeconds }}</b>
                  </h4>
                </div>
              </div>
              <div class="column">
                <div class="ui secondary inverted violet segment">
                  <h3 class="ui header">Total other time:</h3>
                  <h4 class="ui header" style="padding-top: 0; margin-top: 0">
                    <b>{{ showOtherHours }}</b
                    >:<b>{{ showOtherMinutes }}</b
                    >:<b>{{ showOtherSeconds }}</b>
                  </h4>
                </div>
              </div>
            </div>
          </div>

          <TimerButtons
            @changeProject="confirmChangeProjectHandler"
            v-if="$store.state.counterElements.showButtons"
          />

          <div class="extra content" v-if="extra.state">
            <ExtraBreak />
          </div>
          <div class="extra content" v-if="showConfirmChangeProject">
            <div class="ui form">
              <div class="field">
                <h5 class="ui header">
                  Are you sure? You're current session will be stopped.
                </h5>
                <div class="ui buttons">
                  <button
                    class="ui basic primary tertiary button"
                    @click="changeProject"
                  >
                    Yes, I want to change the project
                  </button>
                  <button
                    class="ui basic tertiary button"
                    @click="showConfirmChangeProject = false"
                  >
                    No, let's keep going
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </div>
      <div class="column">
        <div id="logged_users">
          <div class="ui raised segment" id="logged_users_header">
            <div style="flex: 1">{{ historyLoaderText }}</div>
            <div
              v-if="historyLoader"
              class="ui inverted loading icon button"
              id="logged_users_loader"
            ></div>
          </div>
          <div v-if="workAndBrakeState.length > 0">
            <div
              style="display: flex; flex-direction: column;"
              class="ui segment"
              :class="{
                'logged-working': each.workStage === 'Work',
                'logged-break': each.workStage === 'Break',
                'logged-other': each.workStage === 'Other',
              }"
              v-for="each in workAndBrakeState"
              :key="each"
            >
              <div v-if="each.workStage != 'Other'">
                <span class="ui small text" style="float: right">{{
                  each.workStage
                }}</span>
              </div>
              <div v-else>
                <span class="ui small text" style="float: right">{{
                  each.additionalInfo
                }}</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <div>Project: {{ each.projectName }}</div>
                <div>Started: {{ each.startTime }}</div>
              </div>

              <div style="display: flex; justify-content: space-between">
                <div>Campaign: {{ each.campaignName }}</div>
                <div>Stopped: {{ each.stopTime }}</div>
              </div>
              <div>
                Length: {{ each.displayStageDuration.hours }}:{{
                  each.displayStageDuration.minutes
                }}:{{ each.displayStageDuration.seconds }}
              </div>
            </div>
          </div>
          <div v-else>
            <div class="ui tertiary inverted red segment">
              <span class="ui normal text"
                >There is currently no work history for today!</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
// const { Duration } = require("luxon");
// const { DateTime } = require("luxon");

// import Navbar from "../models/Navbar.vue";
// import SelectProject from "./SelectProject.vue";
// import TimeDisplay from "./display/TimeDisplay.vue";
// import TimerButtons from "./display/TimerButtons.vue";
// import ExtraBreak from "./ExtraBreak.vue";
import ErrorModal from "../models/modals/ErrorModal.vue";
import CounterTable from "./CounterTable.vue";

export default {
  data() {
    return {
      showConfirmChangeProject: false,
      loading: true,
      error: false,
    };
  },
  components: {
    // SelectProject,
    // Navbar,
    // TimeDisplay,
    // TimerButtons,
    // ExtraBreak,
    ErrorModal,
    CounterTable,
  },
  created() {
    this.$watch("checkErrors", (newError) => {
      if (newError) {
        $("#counter-error")
          .modal({
            class: "mini inverted",
            closable: false,
          })
          .modal("show");
      }
    });
  },
  // mounted() {
  //   this.$store.state.controlPanel = false;
  //   if (this.checkErrors) {
  //     $("#counter-error")
  //       .modal({
  //         class: "mini inverted",
  //         closable: false,
  //       })
  //       .modal("show");
  //   }
  // },
  // updated() {
  //   this.$store.state.controlPanel = false;
  //   if (this.checkErrors) {
  //     $("#counter-error")
  //       .modal({
  //         class: "mini inverted",
  //         closable: false,
  //       })
  //       .modal("show");
  //   }
  // },
  methods: {
    // async loadPage() {
    // 	this.loading = true;
    // 	try {
    // 		await this.$store.dispatch("getCurrentTimer");
    // 	} catch (error) {
    // 		this.error = error;
    // 	}
    // 	this.loading = false;
    // },
    errorHandler(value) {
      if (value) {
        // console.log("Retry");
        // this.$store.dispatch("counterHandler", {
        //   workStage: "Work",
        //   additionalInfo: "Test",
        // });
      } else {
        location.reload();
        // console.log("Give up!");
      }
      // this.$store.state.errors.counterError.connectionError = false;
    },
    changeProject() {
      this.showConfirmChangeProject = false;
      this.$store.dispatch("stopCounter");
    },
    confirmChangeProjectHandler() {
      this.showConfirmChangeProject = true;
    },
  },
  computed: {
    ...mapGetters([
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
    checkErrors() {
      if (this.$store.state.errors.counterError.connectionError) {
        return true;
      } else {
        return false;
      }
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
    stopCounterLoader() {
      return this.$store.state.loaders.stopCounterLoader;
    },
    historyLoader() {
      return this.$store.state.loaders.workHistoryLoader;
    },
    historyLoaderText() {
      if (this.historyLoader) {
        return "Fetching your history for today...";
      } else {
        return "Your work history for today:";
      }
    },
  },
};
</script>

<style scoped>
@media screen {
}

#counter_container {
  height: calc(100vh - 60px);
  margin-left: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
}

#table-card {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none;
}

#logged_users {
  max-height: calc(100vh - 74px);
  margin-right: 14px;
  overflow: auto;
}

#logged_users_loader {
  box-shadow: none;
}

#logged_users_header {
  background: #3b5998;
  color: whitesmoke;
  font-weight: 700;
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
}

.ui.segment.logged-working {
  background: #16ab39;
  color: whitesmoke;
  font-weight: 600;
}

.ui.segment.logged-break {
  background: #fbbd08;
  color: whitesmoke;
  font-weight: 600;
}

.ui.segment.logged-other {
  background: #a333c8;
  color: whitesmoke;
  font-weight: 600;
}

@media only screen and (max-width: 768px) {
  /* For tablets: */
  #counter_container {
    height: auto;
  }
  #logged_users {
    height: auto;
    margin-right: auto;
  }
}
</style>
