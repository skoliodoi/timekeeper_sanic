<template>
  <div id="submenu">
    <div class="ui raised segments">
      <div class="ui segment" style="background: #533e85; color: whitesmoke">
        <p v-if="userName">{{ userName }}'s summary:</p>
        <p v-else>My summary:</p>
      </div>
      <!-- <div class="ui segment">
						<p>Selected user:</p>
						<p></p>
						<p class="ui small text" style="padding-top:0">{{ userLogin }}</p>
					</div> -->
      <div class="ui segment">
        <p>Selected time period:</p>
        <p>{{ selectedPeriod }}</p>
      </div>
      <div class="ui segment">
        <p>Total duration:</p>
        <p>
          {{ totalDuration.hours }}:{{ totalDuration.minutes }}:{{
            totalDuration.seconds
          }}
        </p>
      </div>
      <div class="ui segment">
        <p>Total work duration:</p>
        <p>
          {{ totalWorkDuration.hours }}:{{ totalWorkDuration.minutes }}:{{
            totalWorkDuration.seconds
          }}
        </p>
      </div>
      <div class="ui segment">
        <p>Total break duration:</p>
        <p>
          {{ totalBreakDuration.hours }}:{{ totalBreakDuration.minutes }}:{{
            totalBreakDuration.seconds
          }}
        </p>
      </div>
      <div class="ui segment">
        <p>Total additional time-off duration:</p>
        <p>
          {{ totalExtraBreakDuration.hours }}:{{
            totalExtraBreakDuration.minutes
          }}:{{ totalExtraBreakDuration.seconds }}
        </p>
      </div>
      <div class="ui segment">
        <button
          class="ui fluid violet button"
          @click="sortHistory"
          v-if="!sorted"
        >
          Sort chronologically
        </button>
        <button
          v-else
          class="ui fluid violet button"
          @click="sortHistory"
        >
          Sort by project
        </button>
      </div>
      <div class="ui segment">
        <button class="ui button" @click="backToDateSelectionHandler">
          Choose another date
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    "userName",
    "selectedPeriod",
    "totalDuration",
    "totalWorkDuration",
    "totalBreakDuration",
    "totalExtraBreakDuration",
    "sorted",
  ],
  emits: ["chooseAnotherDate", "sortWorkHistory"],
  methods: {
    backToDateSelectionHandler() {
      this.$emit("chooseAnotherDate");
    },
    sortHistory() {
      let newSort = !this.sorted
      this.$emit("sortWorkHistory", newSort);
    },
  },
};
</script>

<style scoped>
.ui.segment {
  font-weight: 500;
}

.ui.ui.segment button {
  width: 100%;
}

#submenu {
  width: 100%;
  height: calc(100vh - 74px);
  padding-bottom: 0;
  margin-top: 0;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ui.grid {
  margin-top: -1rem;
  margin-bottom: -1rem;
  margin-left: -1rem;
  margin-right: 0;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>