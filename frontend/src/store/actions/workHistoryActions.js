import axios from "axios";
import config from "../../config";

axios.defaults.baseURL = `${config.apiBaseUrl}`;

const { DateTime } = require("luxon");

export default {
  refreshHistory(context) {
    const homeState = context.state;
    let dt = DateTime.local().toFormat("yyyy-MM-dd");
    if (homeState.lastLoginDate < dt) {
      context.dispatch("getCurrentHistory");
      homeState.lastLoginDate = dt;
    }
  },

  async getCurrentHistory(context) {
    const homeState = context.state;
    let currentDate = DateTime.now().toFormat("yyyy-MM-dd");
    await context.dispatch("calculateDurations", {
      startDate: currentDate,
      endDate: currentDate,
      login: homeState.loggedUserData.login,
    });
    context.state.timeDifference.total.hours =
      context.state.scriptDuration.hours;
    context.state.timeDifference.total.minutes =
      context.state.scriptDuration.minutes;
    context.state.timeDifference.total.seconds =
      context.state.scriptDuration.seconds;

    context.state.timeDifference.work.hours =
      context.state.workTime.totalDuration.hours;
    context.state.timeDifference.work.minutes =
      context.state.workTime.totalDuration.minutes;
    context.state.timeDifference.work.seconds =
      context.state.workTime.totalDuration.seconds;

    context.state.timeDifference.break.hours =
      context.state.breakTime.totalDuration.hours;
    context.state.timeDifference.break.minutes =
      context.state.breakTime.totalDuration.minutes;
    context.state.timeDifference.break.seconds =
      context.state.breakTime.totalDuration.seconds;

    context.state.timeDifference.other.hours =
      context.state.extraBreakTime.totalDuration.hours;
    context.state.timeDifference.other.minutes =
      context.state.extraBreakTime.totalDuration.minutes;
    context.state.timeDifference.other.seconds =
      context.state.extraBreakTime.totalDuration.seconds;
  },

  async getWorkHistoryByProject(context) {
    context.commit("getDataFromStorage");
    return axios
      .post(
        "/get_project_history",
        {
          get_all: context.state.checkHistory.selectAll,
          user_id: context.state.loggedUserData.login,
          start_date: context.state.timeFromCalendar.start,
          end_date: context.state.timeFromCalendar.end,
          selected_projects: context.state.checkHistory.projects,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${context.state.loggedUserData.token}`,
          },
        }
      )
      .then((res) => {
        const parsedHistory = JSON.parse(res.data.project_history);
        if (parsedHistory.length > 0) {
          context.state.historyByProject = [...parsedHistory];
          context.state.showHistory = true;
        } else {
          context.state.showHistory = false;
        }
      });
  },

  async getWorkHistory(context, payload) {
    let homeState = context.state;
    let userId;
    payload.login
      ? (userId = payload.login)
      : (userId = homeState.loggedUserData.login);
    context.commit("getDataFromStorage");
    homeState.timeTable = [];
    return axios
      .post(
        "/get_work_history",
        {
          user_id: userId,
          start_date: payload.startDate,
          end_date: payload.endDate,
          check_current: payload.checkCurrentHistory,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${homeState.loggedUserData.token}`,
          },
        }
      )
      .then((res) => {
        homeState.existingHistoryDuration = 0;
        if (res.data.work_history_for_today.length > 0) {
          for (const each of JSON.parse(res.data.work_history_for_today)) {
            homeState.existingHistoryDuration += parseInt(
              each.work_stage_duration
            );
          }
          homeState.existingHistory = true;
        }
        let allRecords = JSON.parse(res.data.work_history);
        if (allRecords.length > 0) {
          let currentId = 0;
          for (const each in allRecords) {
            context.dispatch("saveToTimeTable", {
              id: (currentId += 1),
              workStageId: allRecords[each].work_stage_id,
              login: allRecords[each].user_id,
              koordynator: allRecords[each].koordynator,
              workStageStarted: allRecords[each].work_stage_started,
              workStageEnded: allRecords[each].work_stage_ended,
              workStageDuration: allRecords[each].work_stage_duration,
              workStage: allRecords[each].work_stage,
              projectName: allRecords[each].project_name,
              projectCode: allRecords[each].project_code,
              campaignName: allRecords[each].campaign_name,
              campaignId: allRecords[each].campaign_id,
              additionalInfo: allRecords[each].work_stage_additional_info,
              comments: allRecords[each].comments,
              autoLogout: allRecords[each].auto_logout,
              updated: allRecords[each].update_case,
            });
          }

          homeState.showHistory = true;
        } else {
          homeState.showHistory = false;
          homeState.workHistoryModule.showInfoModal = true;
        }
        homeState.objectToEdit.exists = false;
      })
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          context.state.errors.workHistoryError.connectionError = true;
          context.state.errors.workHistoryError.connectionErrorData =
            error.response.data.message;
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          context.state.errors.workHistoryError.connectionError = true;
          console.log(context.state.errors.workHistoryError.connectionError);
          context.state.errors.workHistoryError.connectionErrorData =
            error.request.data.message;
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
        console.log(context.state.errors.workHistoryError.connectionError);
      });
  },

  async calculateDurations(context, payload) {
    context.state.loaders.workHistoryLoader = true;
    const workStageOptions = context.state.workStage.choiceOptions;
    // let dt = DateTime.now().toFormat('yyyy-MM-dd');
    await context.dispatch("getWorkHistory", {
      startDate: payload.startDate,
      endDate: payload.endDate,
      login: payload.login,
    });
    context.dispatch("calculateTotalSegmentTime", { workStage: "Total" });
    for (const stage in workStageOptions) {
      context.dispatch("calculateTotalSegmentTime", {
        workStage: workStageOptions[stage],
      });
    }
    context.state.loaders.workHistoryLoader = false;
  },

  async updateWorkHistory(context, payload) {
    context.commit("getDataFromStorage");
    // let workId;
    // !payload.workStageId ? workId = await context.dispatch('generateId', 75) : workId = payload.workStageId;
    return axios.post(
      `${config.apiBaseUrl}/update_work_history`,
      {
        user_id: payload.userId,
        editedBy: context.state.loggedUserData.login,
        selected_date: payload.dateSelector,
        recordsToDelete: payload.recordsToDelete,
        recordsToCreate: payload.recordsToCreate,
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${context.state.loggedUserData.token}`,
        },
      }
    );
  },

  async deleteWorkHistory(context, payload) {
    const projectView = payload.projectView;
    context.state.loaders.workHistoryLoader = true;
    context.commit("getDataFromStorage");
    return axios
      .post(
        `${config.apiBaseUrl}/delete_time`,
        {
          work_stage_id: payload.id,
          editedBy: context.state.loggedUserData.login,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${context.state.loggedUserData.token}`,
          },
        }
      )
      .then(() => {
        context.state.loaders.deletingTimeLoader = false;
        context.state.workHistoryModule.detailsFromProjectView = projectView;
      });
  },
};
