<template>
  <div id="logged_users">
    <LoggedUsers :dataToDisplay="dataToDisplay" />

    <Loader v-if="$store.state.loaders.workStateLoader" />

    <!-- <div class="ui raised segment" id="logged_users_header">
      <div style="flex: 1">{{ text.display }}</div>
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

    <div v-if="dataToDisplay.length > 0">
      <div
        class="ui segment"
        style="width: 100%"
        :class="{
          'logged-working': each.workStage === 'Work',
          'logged-break': each.workStage === 'Break',
          'logged-other': each.workStage === 'Other',
          'red inverted segment': !showLoggedIn,
        }"
        v-for="each in dataToDisplay"
        :key="each"
      >
        <span class="ui small text" style="float: right">{{
          each.workStage
        }}</span>
        <div>{{ each.name }} {{ each.lastName }} ({{ each.login }})</div>
        <div v-if="showLoggedIn">
          Current project: {{ each.currentProject }}
        </div>
      </div>
    </div>
    <div v-else>
      <div class="ui tertiary inverted red segment">
        <span class="ui normal text"
          >There are no currently logged users on any of your projects!</span
        >
      </div>
    </div> -->
  </div>
</template>

<script>
import LoggedUsers from "./LoggedUsers.vue";
import Loader from "./Loader.vue";
export default {
  props: ["dataToDisplay"],
  components: { LoggedUsers, Loader },
};
</script>

<style scoped>
#logged_users {
  height: calc(100vh - 60px);
  /* margin-right: 14px; */
  font-weight: 600;
  overflow: auto;
}

/* .ui.raised.segment#logged_users_header {
  margin-bottom: 0;
  background: #533e85;
  color: whitesmoke;
  font-weight: 700;
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.logged-working {
  background: #16ab39;
  color: whitesmoke;
  font-weight: 600;
}

.logged-break {
  background: #fbbd08;
  color: whitesmoke;
  font-weight: 600;
}

.logged-other {
  background: #a333c8;
  color: whitesmoke;
  font-weight: 600;
} */
</style>