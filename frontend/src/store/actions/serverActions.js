import axios from "axios";
import config from "../../config";
const { DateTime } = require("luxon");
// axios.defaults.timeout = 5000;
const controller = new AbortController();

const fixDate = (date) =>
  date ? DateTime.fromISO(date).toFormat("yyyy-MM-dd T:ss") : null;

export default {
  async getCurrentId(context) {
    context.commit("getDataFromStorage");
    return axios
      .get(
        `${config.apiBaseUrl}/get_id/${context.state.loggedUserData.login}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${context.state.loggedUserData.token}`,
          },
          // params: {
          //   user_id: context.state.loggedUserData.login,
          // },
        }
      )
      .then((response) => {
        if (response.data.recordId) {
          return response.data.recordId;
        } else if (context.state.workId) {
          return context.state.workId;
        } else {
          return null;
        }
      });
  },

  async sendDataToServer(context, payload) {
    context.state.safeToLeave = false;
    context.state.dataUpload.ongoing = true;

    const timeout = setTimeout(() => {
      context.state.dataUpload.successful = false;
      context.state.errors.counterError.connectionError = true;
      context.state.errors.counterError.errorData =
        "Request timeout - request took to long to process.";
      controller.abort();
      clearInterval(context.state.interval);
    }, 10000);
    let updateTable = payload.updateTable ? true : false;
    let workStageId = payload.workStageId
      ? payload.workStageId
      : await context.dispatch("generateId", 75);
    context.commit("getDataFromStorage");
    let workStage = !payload.workStage
      ? context.state.workStage.currentlySelected
      : payload.workStage;
    let additionalInfo = !payload.additionalInfo
      ? null
      : payload.additionalInfo;

    const campaignId = !payload.campaignId
      ? context.state.projects.selectedCampaign.campaign_id
      : payload.campaignId;
    
    const campaignName = !payload.campaignName
      ? context.state.projects.selectedCampaign.campaign_name
      : payload.campaignName;


    await axios
      .post(
        `${config.apiBaseUrl}/post_time`,
        {
          user_id: context.state.loggedUserData.login,
          work_stage_id: workStageId,
          project_code: context.state.projects.selectedProjectCode,
          project_name: context.state.projects.selected,
          campaign_id: campaignId,
          campaign_name: campaignName,
          work_stage: workStage,
          work_stage_additional_info: additionalInfo,
          work_stage_started: fixDate(payload.workStageStart),
          work_stage_ended: fixDate(payload.workStageEnd),
          work_stage_duration: payload.duration,
          work_time_started: fixDate(context.state.workStart),
          work_time_ended: fixDate(payload.workEnd),
          scheduled_start_time: fixDate(context.state.scheduledStartTime),
          scheduled_end_time: fixDate(context.state.scheduledEndTime),
          auto_logout_time: fixDate(context.state.autoLogoutTime),
          update: updateTable,
        },
        {
          timeout: 10000,
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${context.state.loggedUserData.token}`,
          },
        }
      )
      .catch((error) => {
        clearTimeout(timeout);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // context.state.errors.counterError.connectionError = true;
          context.state.errors.counterError.errorData = `${error.response.status} - ${error.response.data.message}`;
          console.log(error.response.data);
          console.log(error.response.status);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          // console.log(error.request);
          // context.state.errors.counterError.connectionError = true;
          context.state.dataUpload.successful = false;
          context.state.errors.counterError.errorData = `Request error - the request was made but no response was received :(`;
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
          // context.state.errors.counterError.connectionError = true;
          context.state.errors.counterError.errorData = `${error.message}`;
        }
      })
      .then((response) => {
        if (!response || response.status != 200 || !response.data.added) {
          context.state.dataUpload.successful = false;
          context.state.errors.counterError.connectionError = true;
          clearInterval(context.state.interval);
        } else {
          context.state.workId = response.data.id;
          clearTimeout(timeout);
          context.state.dataUpload.successful = true;
        }
        context.state.campaignChange = false;
        context.state.dataUpload.ongoing = false;
      });
  },

  async checkToken(context) {
    context.commit("getDataFromStorage");
    await axios
      .post(
        `${config.apiBaseUrl}/check_user`,
        {
          token: context.state.loggedUserData.token,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${context.state.loggedUserData.token}`,
          },
        }
      )
      .then((response) => {
        if (response.data == "False") {
          context.dispatch("logout", false);
          clearInterval(context.state.tokenInterval);
        }
      });
  },
};
