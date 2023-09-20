<template>
  <ConfirmModal
    id="timer_modal"
    :firstParagraph="'stop the timer'"
    :secondParagraph="'This will mean your work time will end.'"
  />
  <div class="content">
    <div class="ui stackable equal width grid">
      <!-- <ChangeCampaign v-if="showCampaignChange" /> -->
      <div class="row">
        <div class="column">
          <button
            v-if="!storeState.counter.started || !disableWork"
            class="ui green labeled fluid icon button"
            :class="{ disabled: endingHoursPassed }"
            @click="commitCounterActions(workStageOptions[1])"
          >
            <i class="play icon"></i>
            Start working
          </button>
          <button
            v-else
            class="ui green labeled fluid icon button"
            :class="{
              disabled:
                storeState.workStage.currentlySelected == workStageOptions[1] ||
                endingHoursPassed,
            }"
            @click="commitCounterActions(workStageOptions[1])"
          >
            <i class="sync icon"></i>
            Resume working
          </button>
        </div>
        <div class="column">
          <button
            class="ui yellow labeled fluid icon button"
            :class="{
              disabled:
                storeState.workStage.currentlySelected == workStageOptions[2] ||
                endingHoursPassed,
            }"
            @click="commitCounterActions(workStageOptions[2])"
          >
            <i class="mug hot icon"></i>
            Break
          </button>
        </div>
        <div class="column">
          <button
            class="ui purple icon fluid labeled button"
            @click="storeState.extraBreak.state = true"
            :class="{ disabled: endingHoursPassed }"
          >
            <i class="random icon"></i>
            {{ wycofanieText }}
          </button>
        </div>
        <!-- <div class="column">
          <button
            class="ui red labeled fluid icon button"
            :class="{
              disabled: !storeState.counter.started || endingHoursPassed,
            }"
            @click="confirmStopCounter($store)"
          >
            <i class="stop icon"></i>
            Stop
          </button>
        </div> -->
        <!-- <div class="column">
          <button
            class="ui instagram icon labeled fluid button"
            v-if="!showCampaignChange"
            @click="showCampaignChange = true"
          >
            <i class="angle double up icon"></i>
            Change campaign
          </button>
          <button
            v-else
            class="ui instagram icon labeled fluid button"
            @click="cancelCampaignChange"
          >
            <i class="angle double up icon"></i>
            Cancel
          </button>
        </div>
        <div class="column">
          <button
            class="ui facebook icon labeled fluid button"
            @click="changeProject"
          >
            <i class="angle double up icon"></i>
            Change project
          </button>
        </div> -->
      </div>
    </div>
  </div>
  <!-- <div class="extra content" v-if="$store.state.workId">
    <span class="ui small text"
      >Current work stage ID: {{ $store.state.workId }}</span
    >
  </div> -->
  <div class="ending-passed" v-if="endingHoursPassed">
    <div class="ui error message">
      <div class="header">Working hours for this project have ended.</div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import ConfirmModal from "../../models/modals/ConfirmModal.vue";
// import ChangeCampaign from "./ChangeCampaign.vue";
// import store from "@/store";
export default {

  data() {
    return {
      currentlySelected: "",
      showCampaignChange: false,
    };
  },
  components: {
    ConfirmModal,
    // ChangeCampaign
  },
  props: ["disableWork"],
  emits: ["changeProject"],
  methods: {
    ...mapActions([
      "initCounter",
      "resumeCounter",
      "changeCounter",
      "stopCounter",
    ]),
    cancelCampaignChange() {
      this.showCampaignChange = false;
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
    changeProject() {
      this.cancelExtraBreak();
      if (this.storeState.counter.started) {
        this.$emit("changeProject");
      } else {
        this.$store.state.projects.selected = "";
        this.$store.state.counterElements.showSelection = true;
        this.$store.state.counterElements.showButtons = false;
      }
    },
    commitCounterActions(value) {
      this.storeState.dataUpload.ongoing = true;
      // if (!this.storeState.counter.started) {
      //   this.initCounter({ workStage: value });
      // } else {
      //   this.$store.state.loaders.workHistoryLoader = true;
      //   this.changeCounter({ workStage: value });
      // }
      this.$store.dispatch("counterHandler", value);
      this.currentlySelected = value;
      this.cancelExtraBreak();
    },
    cancelExtraBreak() {
      this.$store.state.extraBreak.state = false;
      this.$store.state.extraBreak.selected = "";
    },

    async stopCounter() {
      await this.$store.dispatch("stopCounter");
      $("body").toast({
        message: "Your timer was stopped!",
      });
    },
  },
  computed: {
    storeState() {
      return this.$store.state;
    },
    endingHoursPassed() {
      return this.storeState.workTimePassed;
    },
    workStageOptions() {
      return this.storeState.workStage.choiceOptions;
    },
    wycofanieText() {
      if (
        this.storeState.workStage.currentlySelected == this.workStageOptions[3]
      ) {
        return "Change other";
      } else {
        return "Other";
      }
    },
  },
};
</script>

<style>
.ending-passed {
  margin-top: 15px;
}
</style>
