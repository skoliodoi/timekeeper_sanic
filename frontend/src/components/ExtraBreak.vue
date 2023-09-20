<template>
  <div class="ui form">
    <div class="two fields">
      <div class="field">
        <label style="text-align: left">Reason</label>
        <select
          class="ui selection dropdown"
          :class="{ error: extraEmpty }"
          v-model="selectedExtra"
          @change="selectExtra(selectedExtra)"
        >
          <option value="">Reason</option>
          <option v-for="each in projectStatuses" :key="each">
            {{ each }}
          </option>
        </select>
        <div class="left aligned ui negative message" v-if="extraEmpty">
          <ul class="list">
            <li>You must provide a reason!</li>
          </ul>
        </div>
        <!-- <div class="ui selection dropdown" ref="extraBreakSelector">
				<input type="hidden" name="gender" />
				<i class="dropdown icon"></i>
				<div class="default text">Powód</div>
				<div class="menu">
					<div
						class="item"
						v-for="each in extra.details"
						:key="each"
						:data-value="each"
						@click="selectExtra(each)"
					>
						{{ each }}
					</div>
				</div>
			</div> -->
      </div>
      <div class="field" style="display: flex; align-items: flex-end;">
        <div class="ui two buttons">
          <button
            class="ui primary button"
            @click="commitCounterActions(workStageOptions[3])"
          >
            Confirm
          </button>
          <button class="ui button" @click="cancelAdditionalInfo">
            Cancel
          </button>
        </div>
      </div>
    </div>
    <div class="field" v-if="showOtherInput">
      <label style="text-align: left">Additional information</label>
      <div class="ui input" :class="{ error: additionalInfoEmpty }">
        <input
          v-model="otherInput"
          type="text"
          placeholder="Additional information"
        />
      </div>
      <div class="left aligned ui negative message" v-if="additionalInfoEmpty">
        <ul class="list">
          <li>You must provide additional information!</li>
        </ul>
      </div>
    </div>

    <!-- <div class="field">
      <div class="ui two buttons">
        <button
          class="ui primary button"
          @click="commitCounterActions(workStageOptions[3])"
        >
          Confirm
        </button>
        <button class="ui button" @click="cancelAdditionalInfo">Cancel</button>
      </div>
    </div> -->
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  mounted() {
    $(".ui.dropdown").dropdown();
  },
  data() {
    return {
      selectedExtra: "",
      showOtherInput: false,
      otherInput: "",
      extraIsEmpty: false,
      additionalInfoIsEmpty: false,
    };
  },
  computed: {
    extra() {
      return this.$store.state.extraBreak;
    },
    projectStatuses() {
      let defaultStatuses = [...this.extra.details];
      const dbStatuses = this.$store.state.projects.statuses;
      let selectedProject =
        this.$store.state.projects.selectedCampaign.campaign_id;
      for (const project in dbStatuses) {
        if (project == selectedProject) {
          for (const status of dbStatuses[project]) {
            defaultStatuses.unshift(status);
          }
        }
      }
      return defaultStatuses;
    },
    workStageOptions() {
      return this.$store.state.workStage.choiceOptions;
    },
    extraEmpty() {
      return this.extraIsEmpty;
    },
    additionalInfoEmpty() {
      return this.additionalInfoIsEmpty;
    },
  },
  methods: {
    ...mapActions(["initCounter", "changeCounter"]),
    selectExtra(selectedVal) {
      if (selectedVal == "Other") {
        this.showOtherInput = true;
      } else {
        this.showOtherInput = false;
      }
      this.extra.selected = selectedVal;
    },
    cancelAdditionalInfo() {
      this.showOtherInput = false;
      this.extra.selected = "";
      this.selectedExtra = "";
      this.$store.state.extraBreak.state = false;
    },
    commitCounterActions(value) {
      if (!this.extra.selected) {
        this.extraIsEmpty = true;
        return;
      }

      if (this.showOtherInput && !this.otherInput) {
        this.additionalInfoIsEmpty = true;
        return;
      }

      if (!this.$store.state.counter.started) {
        this.initCounter({
          workStage: value,
          additionalInfo: this.commitChange(),
        });
      } else {
        this.changeCounter({
          workStage: value,
          additionalInfo: this.commitChange(),
        });
      }
      this.extra.selected = "";
      this.otherInput = "";
      this.extra.state = false;
    },
    commitChange() {
      let additionalInfoToCommit = "";
      if (this.extra.selected == "Other") {
        additionalInfoToCommit = this.otherInput;
      } else {
        additionalInfoToCommit = this.extra.selected;
      }
      return additionalInfoToCommit;
    },
  },
};
</script>

<style></style>
