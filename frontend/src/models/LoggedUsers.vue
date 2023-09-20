<template>
  <div class="ui raised segment" id="logged_users_header">
    <div v-if="showLoggedIn" style="flex: 0.5; margin-left: 5px">
      <div style="text-align: left;">Filter by work stage</div>
      <select
        class="ui fluid selection dropdown"
        id="workstage-filters"
        v-model="selectedWorkStageFilter"
      >
        <option>All</option>
        <option v-for="status in $store.state.workStage.filters" :key="status">
          {{ status }}
        </option>
      </select>
    </div>
    <div style="flex: 2;">{{ text.display }}</div>
    <div>
      <button
        class="ui inverted icon button"
        @click="$store.state.showLoggedIn = !$store.state.showLoggedIn"
        :data-tooltip="text.button"
        data-inverted=""
        data-position="left center"
      >
        <i
          class="icon"
          :class="{ bed: showLoggedIn, users: !showLoggedIn }"
        ></i>
      </button>
      <button
        class="ui inverted icon button"
        @click="refreshUsers"
        :data-tooltip="'Refresh users list'"
        data-inverted=""
        data-position="left center"
      >
        <i class="refresh icon"></i>
      </button>
    </div>
  </div>
  <div v-if="dataToDisplay.length > 0">
    <div
      class="ui segment"
      style="width: 100%"
      :class="{
        'logged-working': each.work_stage === 'Work',
        'logged-break': each.work_stage === 'Break',
        'logged-other': each.work_stage === 'Other',
        'not-logged': !showLoggedIn,
      }"
      v-for="each in sortNames"
      :key="each"
    >
      <div class="ui grid">
        <div
          class="three wide column"
          :class="{ 'sixteen wide': !showLoggedIn }"
        >
          <div>User:</div>
          <span class="ui grey inverted label"
            >{{ each.name }} {{ each.last_name }} ({{ each.login }})</span
          >
        </div>
        <div v-if="showLoggedIn" class="four wide column">
          <div>Current project:</div>
          <span class="ui grey inverted label">{{
            each.current_campaign_name
          }}</span>
        </div>
        <div v-if="showLoggedIn" class="three wide column">
          <div>Current work period started at:</div>
          <span class="ui grey inverted label">{{
            each.work_time_started
          }}</span>
        </div>
        <div v-if="showLoggedIn" class="six wide column">
          <div>
            <span v-if="each.work_stage != 'Other'"
              >"{{ each.work_stage }}"</span
            ><span v-else>"{{ each.work_stage_additional_info }}"</span>
            status started at:
          </div>
          <span class="ui grey inverted label">
            {{ each.work_stage_started }}
          </span>
        </div>
      </div>

      <!-- <span class="ui small text" style="float: right">{{
				each.workStage
			}}</span> -->
    </div>
  </div>
  <div v-else>
    <div class="ui tertiary inverted red segment">
      <span class="ui normal text"
        >There are no currently logged users on any of your projects!</span
      >
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.checkLoggedUsers();
    $("#workstage-filters").dropdown();
  },
  beforeUnmount() {
    clearInterval(this.intervalRunning);
  },
  data() {
    return {
      intervalRunning: null,
      selectedWorkStageFilter: "All",
    };
  },
  props: ["dataToDisplay"],
  methods: {
    checkLoggedUsers() {
      this.$store.dispatch("getWorkStatus");
      if (this.intervalRunning) return;
      const newInterval = setInterval(() => {
        this.refreshUsers();
      }, 60000);
      this.intervalRunning = newInterval;
    },
    refreshUsers() {
      this.$store.dispatch("getWorkStatus");
    },
  },
  computed: {
    filteredData() {
      let names = [...this.dataToDisplay];
      let returnList;
      if (this.selectedWorkStageFilter == "All") {
        returnList = names;
      } else if (
        this.selectedWorkStageFilter == "Work" ||
        this.selectedWorkStageFilter == "Break"
      ) {
        returnList = names.filter(
          (el) => el.work_stage == this.selectedWorkStageFilter
        );
      } else {
        returnList = names.filter(
          (el) => el.work_stage_additional_info == this.selectedWorkStageFilter
        );
      }
      return returnList;
    },
    sortNames() {
      let names = [...this.filteredData];
      names = names.sort((a, b) => {
        if (a.current_campaign_name === b.current_campaign_name) {
          return a.name > b.name ? 1 : -1;
        }
        return a.current_campaign_name > b.current_campaign_name ? 1 : -1;
      });
      // let sortedNames = names.sort((a, b) => {
      //   const nameA = a.name.toUpperCase();
      //   const nameB = b.name.toUpperCase();
      //   if (nameA < nameB) {
      //     return -1;
      //   }
      //   if (nameA > nameB) {
      //     return 1;
      //   }

      //   return 0;
      // });
      return names;
    },
    showLoggedIn() {
      return this.$store.state.showLoggedIn;
    },
    text() {
      if (this.showLoggedIn) {
        return {
          button: "Show non-active users",
          display: "Logged users:",
        };
      } else {
        return {
          button: "Show active users",
          display: "Non-active users:",
        };
      }
    },
  },
};
</script>

<style scoped>
.ui.raised.segment#logged_users_header {
  margin-bottom: 0;
  background: #3d698e;
  color: whitesmoke;
  font-weight: 700;
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logged-working {
  background: #22913c;
  color: whitesmoke;
  /* font-weight: 600; */
}

.logged-break {
  background: #f6ce58;
  color: rgb(18, 17, 17);
  /* font-weight: 600; */
}
.not-logged {
  background: #e77373;
  color: whitesmoke;
  /* font-weight: 600; */
}

.logged-other {
  background: #864c99;
  color: whitesmoke;
  /* font-weight: 600; */
}
</style>
