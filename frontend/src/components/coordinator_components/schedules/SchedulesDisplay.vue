<template>
  <div id="page-container">
    <div class="ui inverted segment history-header" id="page-header">
      <div class="button-column">
        <button class="ui inverted button" @click="returnHandler">
          Go back
        </button>
      </div>
      <div class="ui big grey inverted basic label summary-column">
        <div>Date: {{ $store.state.schedules.selectedDate }}</div>
      </div>
    </div>
    <!-- {{ $store.state.schedules.list.length }}
  {{ $store.state.schedules.list }}

  <div v-for="user in $store.state.schedules.list" :key="user.user_name">
    <div>User: {{ user.user_name }}</div>
    <div>Mocarz Id: {{ user.mocarz_id }}</div>
    <div>Scheduled shifts: {{ user.zmiany }}</div>
    <WorkHistoryProgressBar :data-for-google="user.work_history" />
  </div>
  <div
    class="ui segment"
    v-for="user in $store.state.schedules.list"
    :key="user.user_name"
  >
    <div class="ui equal width grid">
      <div class="column">
        <strong>Imię i nazwisko:</strong>
        <div>{{ user.user_name }}</div>
      </div>
      <div class="column">
        <strong>Mocarz ID:</strong>
        <div>{{ user.mocarz_id }}</div>
      </div>
    </div>
  </div> -->
    <table class="ui celled center aligned table" style="margin-top:0;">
      <thead id="main-table-head">
        <tr>
          <th class="two wide">User name</th>
          <th class="two wide">Mocarz Id</th>
          <th class="twelve wide">Scheduled shifts</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in $store.state.schedules.list" :key="user.user_name">
          <td data-label="Name">{{ user.user_name }}</td>
          <td data-label="Age">{{ user.mocarz_id }}</td>
          <table class="ui celled table" style="margin-top: 0">
            <thead>
              <tr>
                <th>Shift number</th>
                <th>Sheduled start</th>
                <th>Sheduled end</th>
                <th>Sheduled duration</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="zmiana in user.zmiany" :key="zmiana">
                <td>{{ zmiana.zmiana_nr }}</td>
                <td>{{ zmiana.zmiana_details.scheduled_start }}</td>
                <td>{{ zmiana.zmiana_details.scheduled_end }}</td>
                <td>{{ zmiana.zmiana_details.scheduled_duration }}</td>
              </tr>
            </tbody>
          </table>
          <table class="ui celled table">
            <thead>
              <tr>
                <th>Work history:</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td v-if="user.work_history.length > 0">
                  <WorkHistoryProgressBar
                    :data-for-google="user.work_history"
                  />
                </td>
                <td v-else>
                  <div class="ui info message">
                    <div class="header">
                      No history for user {{ user.user_name }} for that date!
                    </div>
                    <ul v-if="user.mocarz_id == 'N/A'" class="list">
                      <li>
                        The reason <strong>might be</strong> Mocarz ID is
                        missing from the schedule.
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import WorkHistoryProgressBar from "../../work_history_components/WorkHistoryProgressBar.vue";
export default {
  beforeUnmount() {
    this.$store.state.schedules.list = [];
    this.$store.state.schedules.selectedDate = "";
  },
  components: {
    WorkHistoryProgressBar,
  },
  methods: {
    returnHandler() {
      this.$store.state.schedules.list = [];
      this.$store.state.schedules.found = false;
    },
  },
};
</script>
<style>
#page-container {
  height: calc(100vh - 60px);
  overflow-y: auto;
  width: 100%;
}

#main-table-head {
  position: sticky;
  top: 67px;
  z-index: 100;
}

#page-header {
  position: sticky;
  top: 0;
  z-index: 100;
}
.ui.inverted.segment.history-header {
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  background: #3d698e;
  margin: 0;
}
.ui.grey.inverted.basic.label {
  background-color: transparent !important;
}

.button-column {
  flex: 0.5;
}
.summary-column {
  flex: 3;
}

.ui.label {
  display: flex;
  justify-content: space-around;
}
</style>
