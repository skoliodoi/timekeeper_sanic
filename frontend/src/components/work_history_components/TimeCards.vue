<template>
  <ConfirmModal
    id="time_card_modal"
    :firstParagraph="'delete this timecard'"
    :secondParagraph="'You won\'t be able to undo this!'"
  />
  <div
    class="content"
    v-if="!isThereObjectToEdit"
    :class="{
      work: workStage == 'Work',
      other: workStage == 'Other',
      break: workStage == 'Break',
    }"
    style="display: flex; align-items: center"
  >
    <!-- <div style="flex: 3">
			<h3 class="ui header">{{ projectName }}</h3>
		</div>
		<div style="flex: 2">
			<h3 class="ui header">{{ selectedDate }}</h3>
		</div> -->
    <div
      class="ui equal width internally celled stackable grid time-card-header"
    >
      
      <div class="column">
        <div class="time-font">Project: {{ projectName }}</div>
        <div>
          <strong>{{ selectedDate }}</strong>
        </div>
      </div>
      <div class="column">
        <div class="time-font">Campaign: {{ campaignName }}</div>
      </div>
      <div class="column">
        <div class="time-font">Work stage:</div>
        <div v-if="!updated">
          <strong>{{ workStage }}</strong>
        </div>
        <div
          v-else
          style="display: flex; justify-content: space-between"
          data-tooltip="Edited manually"
          data-inverted=""
        >
          <i v-if="updated" class="left float circle icon"></i>
          <strong>{{ workStage }}</strong>
          <i v-if="updated" class="left float circle icon"></i>
        </div>
      </div>
      <div class="column">
        <div class="time-font">Time started:</div>
        <div>
          <strong>{{ startTime }}</strong>
        </div>
      </div>
      <div class="column">
        <div class="time-font">Time finished:</div>
        <div>
          <strong>{{ stopTime }}</strong>
        </div>
      </div>
      <div class="column">
        <div class="time-font">Total time:</div>
        <div>
          <strong>{{ hours }}:{{ minutes }}:{{ seconds }}</strong>
        </div>
      </div>
    </div>
    <div style="display: flex; justify-content: center; align-items: center">
      <div v-if="autoLoggedOut" data-tooltip="Auto logged out" data-inverted="">
        <i class="inverted hourglass end icon"></i>
      </div>
      <div
        v-if="$store.state.workHistoryModule.allowedToEdit"
        class="ui tiny basic icon buttons"
        :class="{ inverted: workStage != 'Break' }"
      >
        <button
          class="ui button"
          data-tooltip="Edit timecard"
          data-inverted=""
          @click="edit(workStageId, currentArray)"
        >
          <i class="pencil alternate icon"></i>
        </button>
        <button
          class="ui button"
          data-tooltip="Delete timecard"
          @click="
            deleteTime(
              $store,
              workStageId,
              login,
              this.$store.state.timeFromCalendar.start,
              this.$store.state.timeFromCalendar.end
            )
          "
          data-inverted=""
        >
          <i class="trash alternate icon"></i>
        </button>
      </div>
    </div>
  </div>

  <div class="content" v-if="additionalInfo">
    <div class="ui equal width grid">
      <div class="column">
        <div class="work-stage-font">Additional information:</div>
        <div>{{ additionalInfo }}</div>
      </div>
    </div>
  </div>
  <!-- <div class="content">
		<div class="equal width stretched row">
			Total time: {{ hours }}:{{ minutes }}:{{ seconds }}
		</div>
	</div> -->
  <div class="extra content" :class="{ autologout: autoLoggedOut }">
    <div v-if="!comments" class="no-comments">No comments available</div>
    <div class="ui accordion" v-else>
      <div class="title">
        <i class="dropdown icon"></i>
        See comments
      </div>
      <div class="content" style="display: flex; flex-direction: row">
        <p class="transition hidden">
          {{ comments }}
        </p>
      </div>
    </div>
  </div>

  <!-- </div> -->
</template>

<script>
import ConfirmModal from "../../models/modals/ConfirmModal.vue";
import { mapGetters } from "vuex";

const { DateTime } = require("luxon");

export default {
  components: {
    ConfirmModal,
  },
  mounted() {
    $(".ui.accordion").accordion();
  },
  data() {
    return {
      isThereObjectToEdit: false,
      editableRecord: {},
    };
  },
  props: [
    "id",
    "login",
    "workStageId",
    "projectName",
    "campaignName",
    "projectId",
    "workStage",
    "additionalInfo",
    "workDate",
    "startTime",
    "stopTime",
    "hours",
    "minutes",
    "seconds",
    "comments",
    "currentArray",
    "autoLoggedOut",
    "updated",
  ],
  computed: {
    ...mapGetters([
      "workAndBrakeState",
      "showSeconds",
      "showMinutes",
      "showHours",
      "hasAccess",
    ]),
    selectedDate() {
      return DateTime.fromSQL(this.workDate).toFormat("yyyy-MM-dd");
    },
    selfEdit() {
      return this.login == this.$store.state.loggedUserData.login
        ? true
        : false;
    },
    durationStage() {
      return this.displayStageDuration;
    },
  },
  methods: {
    edit(val, array) {
      for (const object of array) {
        if (object.workStageId == val) {
          object.editable = true;
          this.$store.state.objectToEdit.exists = true;
          this.$store.state.objectToEdit.object = object;
        }
      }
    },
    deleteTime(val, id, login, startDate, endDate) {
      $("#time_card_modal")
        .modal({
          class: "tiny inverted",
          closable: false,
          onApprove: async function () {
            await val.dispatch("deleteWorkHistory", {id, projectView: val.state.workHistoryModule.detailsFromProjectView});
            console.log(val.state.workHistoryModule.detailsFromProjectView)
            if (val.state.workHistoryModule.detailsFromProjectView) {
              await val.dispatch("getWorkHistoryByProject");
              val.state.workHistoryModule.displayValue = "project";
              val.state.workHistoryModule.projectReturnDetails.returnDate =
                this.selectedDate;
            } 
            await val.dispatch("calculateDurations", {
              startDate,
              endDate,
              login,
            });
            
            $("body").toast({
              class: "center aligned green",
              position: "bottom attached",
              message: "The timecard was deleted!",
            });
          },
        })
        .modal("show");
    },
  },
};
</script>

<style scoped>
.ui.card > .content.work {
  background: #22913c;
  color: #eee;
}
.ui.card > .content.other {
  background: #864c99;
  color: #eee;
}
.ui.card > .content.break {
  background: #f6ce58;
  color: #414141;
}

.ui.card > .content.autologout {
  background: #fea093;
}

.time-font {
  font-size: 18px;
  font-weight: bold;
}
.work-stage-font {
  font-size: 16px;
  font-weight: 500;
}

.extra.content > .ui.accordion > .content > p,
.extra.content > .ui.accordion > .title,
.no-comments {
  font-weight: 500;
}
</style>
