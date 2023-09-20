import { createStore } from "vuex";
import rootGetters from "./getters";
import rootMutations from "./mutations";
import rootActions from "./actions";
import workHistoryModule from "./workHistoryModule/workHistoryModule";
// import data from "./testData";

const store = createStore({
  state() {
    return {
      campaignChange: false,
      counterElements: {
        prevCampaign: "",
        prevProjectName: "",
        prevProjectCode: "",
        currentProjectCode: "",
        currentProjectName: "",
        currentCampaign: "",
        changeCampaignByButton: false,
        changeProjectByButton: false,
        oneCampaign: false,
        oneProject: false,
        showButtons: false,
        showSelection: true,
        showProjectSelection: true,
        showSelected: false,
        selectableCampaigns: ""
      },
      selectForTimeAddition: {
        user: "",
        project: ""
      },
      // selectedUser: "",
      historyByProject: "",
      checkHistory: {
        user: "",
        projects: [],
        selectAll: false
      },
      dataUpload: {
        ongoing: false,
        successful: false,
        retry: false,
      },
      askForUpdate: false,
      allowUpdate: true,
      safeToLeave: true,
      updateTables: {
        existingRecords: [],
        recordsToModify: [],
        recordsToDelete: [],
        recordsToSend: [],
      },
      lastLoginDate: null,
      existingHistoryDuration: 0,
      showLoggedIn: true,
      existingHistory: false,
      passChange: {
        newPass: "",
        confirmNewPass: "",
        error: false,
        errorText: "",
        loading: false,
      },
      dataChange: {
        oldLogin: "",
        newLogin: "",
        name: "",
        lastName: "",
      },
      workTimePassed: false,
      selectedPage: "",
      controlPanel: false,
      tokenInterval: "",
      loadingText: "",
      loaders: {
        scheduleLoader: false,
        addUserLoader: false,
        projectLoader: false,
        workHistoryLoader: false,
        stopCounterLoader: false,
        workStateLoader: false
      },
      errors: {
        counterError: {
          connectionError: false,
          errorData: ""
        },
        workHistoryError: {
          connectionError: false,
          errorData: "",
        },
      },
      objectToEdit: {
        exists: false,
        object: "",
      },
      projectToEdit: {
        exists: false,
        project: "",
      },
      users: {
        list: [],
        selected: "",
        working: [],
        notWorking: []
      },
      coordinators: {
        list: [],
        selected: [],
      },
      timeFromCalendar: {
        start: "",
        end: "",
      },
      showHistory: false,
      showPage: false,
      workdayEnd: {
        hour: 0,
        minutes: 0,
      },
      loggedUserData: {
        token: "",
        login: "",
        accessLevel: "",
      },
      workId: "",
      schedules: {
        found: false,
        list: [],
        selectedDate: "",
        selectedProjectCode: "",
      },
      projects: {
        users: [],
        coordinators: [],
        owners: [],
        allUsers: [],
        fullList: [],
        list: [],
        selected: "",
        selectedCampaign: [],
        selectedCampaignId: "",
        selectedCampaignName: "",
        selectedProjectCode: "",
        statuses: {},
      },
      extraBreak: {
        state: false,
        details: ["Coaching/Training", "Meeting with the coordinator", "Other"],
        selected: "",
        additionalInfo: "",
      },
      timeTable: [],
      timeTableFromServer: [],
      addedTimeTable: [],
      timeToAdd: {
        id: 0,
        stage: "",
        duration: 0,
      },
      workStage: {
        filters: [],
        currentlySelected: "",
        choiceOptions: {
          1: "Work",
          2: "Break",
          3: "Other",
        },
      },
      workTime: {
        part: 1,
        // timeTable: [],
        totalDuration: {
          seconds: 0,
          minutes: 0,
          hours: 0,
          total: 0,
        },
      },
      breakTime: {
        part: 1,
        // timeTable: [],
        totalDuration: {
          seconds: 0,
          minutes: 0,
          hours: 0,
          total: 0,
        },
      },
      extraBreakTime: {
        part: 1,
        totalDuration: {
          seconds: 0,
          minutes: 0,
          hours: 0,
        },
      },
      workStart: "",
      scheduledWorkEnd: "",
      timeStart: "",
      timeStop: "",
      timeDisplay: "",
      timeDifference: {
        current: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
        total: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
        work: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
        break: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
        other: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
      },
      counter: {
        started: false,
        stopped: false,
      },
      interval: "",
      scriptDuration: {
        seconds: 0,
        minutes: 0,
        hours: 0,
        total: 0,
      },
    };
  },
  getters: rootGetters,
  mutations: rootMutations,
  actions: rootActions,
  modules: {
    workHistoryModule
  }
});

export default store;
