<template>
  <div
    :class="{ 'ui container': hasAccess }"
    style="display: flex; justify-content: center"
  >
    <form class="ui form" id="check_history_form" style="width: 75%">
      <div
        class="ui centered fluid card"
        :class="{ 'user-search': !hasAccess }"
      >
        <div class="content" style="background: #3d698e">
          <div class="ui grid">
            <div class="four wide left aligned column">
              <BackButton
                :selectedPage="hasAccess ? 'control-panel' : 'counter'"
              />
            </div>
            <div
              class="seven wide middle aligned column"
              :class="{ 'twelve wide left aligned': !hasAccess }"
            >
              <h1 class="ui header" style="color: whitesmoke">
                Check work history
              </h1>
            </div>
            <div class="five wide right aligned column" v-if="hasAccess">
              <div class="ui buttons">
                <button
                  class="ui inverted button"
                  :class="{ active: searchFilter == 'project' }"
                  @click.prevent="searchHandler('project')"
                >
                  By campaign
                </button>
                <div class="or"></div>
                <button
                  class="ui inverted button"
                  :class="{ active: searchFilter == 'user' }"
                  @click.prevent="searchHandler('user')"
                >
                  By user
                </button>
              </div>
            </div>
          </div>

          <div style=""></div>
        </div>
        <div class="content">
          <Calendar />
          <SearchFilter
            :selection="selectionList"
            :errorData="errorData.error"
          />
        </div>

        <div class="ui center aligned negative message" v-if="errorData.error">
          <p>You need to choose a{{ errorData.errorText }}!</p>
        </div>
        <div
          class="ui bottom instagram attached submit button"
          @click="checkHistory"
        >
          <i class="calendar alternate icon"></i>
          Check {{ searchFilter }} history
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Calendar from "./WorkHistoryCalendar.vue";
import SearchFilter from "./WorkHistoryFilter.vue";
import BackButton from "../../models/BackButton.vue";

import { mapGetters } from "vuex";
export default {
  components: { Calendar, SearchFilter, BackButton },
  data() {
    return {
      searchFilter: "user",
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
    $("#user_dropdown").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
    $("#project_dropdown").dropdown(
      {
      fullTextSearch: "exact",
      match: "both",
    }
    );
    $(".ui.checkbox").checkbox();
  },
  updated() {
    $("#user_dropdown").dropdown({
      fullTextSearch: "exact",
      match: "both",
    });
    $("#project_dropdown").dropdown(
      {
      fullTextSearch: "exact",
      match: "both",
    }
    );
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
      "usersForHistory"
    ]),
    // coordinator() {
    // 	if (this.accessLevel == "koordynator") {
    // 		return true;
    // 	} else {
    // 		return false;
    // 	}
    // },
    selectionList() {
      let selectionValue;
      if (this.searchFilter == "user") {
        selectionValue = this.$store.state.projects.allUsers;
        // if (this.accessLevel == "projectOwner" || this.accessLevel == "admin") {
        //   selectionValue = this.usersForHistory;
        // } else if (this.accessLevel == "koordynator") {
        //   const selectionList = [];
        //   for (const each of this.sortUsers.users) {
        //     selectionList.push(each);
        //   }
        //   for (const each of this.sortUsers.coordinators) {
        //     selectionList.push(each);
        //   }
        //   selectionValue = selectionList;
        // }
        return {
          selectionRefresher: "",
          selection: selectionValue,
          selectionLabel: "Choose user name",
          projectSelection: false,
        };
      } else {
        return {
          selectionRefresher: "",
          selection: this.$store.getters.filterProjects,
          selectionLabel: "Choose a campaign",
          projectSelection: true,
        };
      }
    },
  },
  methods: {
    assignFilter(val) {
      this.selectedUser = val;
    },
    searchHandler(val) {
      this.errorData.error = false;
      this.searchFilter = val;
      if (val == "user") {
        this.$store.state.checkHistory.projects = [];
      }
    },
    async checkHistory() {
      if (this.searchFilter == "user" || !this.hasAccess) {
        this.checkHistoryByUser();
      } else {
        this.checkHistoryByProject();
      }
    },
    async checkHistoryByProject() {
      if (this.selectionList.selection.length == 1) {
        this.$store.state.checkHistory.projects.push(
          this.selectionList.selection[0].campaignId
        );
      }
      if (
        (!this.$store.state.timeFromCalendar.start ||
          !this.$store.state.timeFromCalendar.end) &&
        this.$store.state.checkHistory.projects <= 0 &&
        !this.$store.state.checkHistory.selectAll
      ) {
        this.errorData.errorText = " date and a project";
        this.errorData.error = true;
        return;
      } else if (
        !this.$store.state.timeFromCalendar.start ||
        !this.$store.state.timeFromCalendar.end
      ) {
        this.errorData.errorText = " date";
        this.errorData.error = true;
        return;
      } else if (
        this.$store.state.checkHistory.projects <= 0 &&
        !this.$store.state.checkHistory.selectAll
      ) {
        this.errorData.errorText = " project";
        this.errorData.error = true;
        return;
      } else {
        this.errorData.error = false;
        this.$emit("calendarAction", {
          showCalendar: false,
          user: "",
        });
        this.$store.state.loaders.workHistoryLoader = true;

        await this.$store.dispatch("getWorkHistoryByProject");
        this.$store.state.workHistoryModule.displayValue = "project";
        this.$store.state.loaders.workHistoryLoader = false;
      }
    },
    checkHistoryByUser() {
      this.hasAccess
        ? (this.userLogin = this.$store.state.checkHistory.user)
        : (this.userLogin = this.$store.state.loggedUserData.login);
      if (
        (!this.$store.state.timeFromCalendar.start ||
          !this.$store.state.timeFromCalendar.end) &&
        !this.userLogin
      ) {
        this.errorData.errorText = " date and user";
        this.errorData.error = true;
        return;
      } else if (
        !this.$store.state.timeFromCalendar.start ||
        !this.$store.state.timeFromCalendar.end
      ) {
        this.errorData.errorText = " date";
        this.errorData.error = true;
        return;
      } else if (!this.userLogin) {
        this.errorData.errorText = "n user";
        this.errorData.error = true;
        return;
      } else {
        let userName;
        if (
          this.hasUpperAccess ||
          (this.accessLevel == "koordynator" &&
            this.$store.state.checkHistory.user !=
              this.$store.state.loggedUserData.login)
        ) {
          let findUserByLogin = this.selectionList.selection.find(
            (element) => element.login == this.userLogin
          );
          userName = `${findUserByLogin.full_name}`;
        } else {
          userName = `${this.$store.state.loggedUserData.name} ${this.$store.state.loggedUserData.lastName}`;
        }
        this.errorData.error = false;
        this.$emit("calendarAction", {
          showCalendar: false,
          user: userName,
        });
        this.$store.state.historyByProject = "";
        this.$store.state.workHistoryModule.displayValue = "user";
        this.$store.state.workHistoryModule.userLogin = this.userLogin;
        this.$store.state.selectForTimeAddition.user = this.userLogin;
        this.$store.state.workHistoryModule.displayUserName = userName;
        this.$store.dispatch("calculateDurations", {
          login: this.userLogin,
          startDate: this.$store.state.timeFromCalendar.start,
          endDate: this.$store.state.timeFromCalendar.end,
        });
      }
    },
  },
};
</script>

<style scoped>
.user-search {
  width: 50% !important;
}
</style>
