import axios from "axios";
import config from "../../config";

export default {
  async downloadSchedules(context, payload) {
    context.state.loaders.scheduleLoader = true;
    // console.log(`Selected date is ${payload}! NIE ZAPOMNIJ ODKOMENTOWAĆ!`);
    context.commit("getDataFromStorage");
    return axios
      .post(`${config.apiBaseUrl}/download_schedule`, {
        // date: "2023-04-03",
        // project: "0298/001/RZE",
        date: payload,
        project: context.state.schedules.selectedProjectCode,
      })
      .then((res) => {
        const parsedData = JSON.parse(res.data);
        context.state.schedules.found = true;
        context.state.schedules.list = parsedData;

        context.state.loaders.scheduleLoader = false;
      });
  },
  async uploadSchedule(context, payload) {
    context.state.loaders.scheduleLoader = true;
    context.commit("getDataFromStorage");
    let formData = new FormData();
    formData.append("file", payload.file);
    formData.append("correction", payload.correction);
    formData.append("project", context.state.schedules.selectedProjectCode);
    formData.append("edited_by", context.state.loggedUserData.login);
    return axios
      .post(`${config.apiBaseUrl}/upload_schedule`, formData, {
        headers: {
          Accept: "application/json",
          ContentType: "multipart/form-data",
          Authorization: `Bearer ${context.state.loggedUserData.token}`,
        },
      })
      .then((res) => {
        return {
          message: res.data,
          successful: true
        }
      })
      .catch((err) => {
        if (err.response.status == 409) {
          return {
            message: 'Hurr durr',
            successful: false
          }
        }
      });
  },
};
