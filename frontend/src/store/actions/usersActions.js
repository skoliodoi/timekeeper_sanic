import axios from "axios";
import config from "../../config";
// import router from "../../router";

export default {
  checkUserData(context, payload) {
    // const serverData = JSON.parse(payload)
    // if (serverData.admin) {
    //   context.state.loggedUserData.accessLevel = "admin";
    //   context.state.selectedPage = 'control-panel';
    // } else if (serverData.project_owner) {
    //   context.state.loggedUserData.accessLevel = "projectOwner";
    //   context.state.selectedPage = 'control-panel';
    // } else if (serverData.koordynator) {
    //   context.state.loggedUserData.accessLevel = "koordynator";
    //   context.state.selectedPage = 'counter';
    // } else {
    //   context.state.loggedUserData.accessLevel = "user";
    //   context.state.selectedPage = 'counter';
    // }
    context.state.loggedUserData.accessLevel = payload.access_level;
    context.state.selectedPage = payload.start_page;
    context.state.loggedUserData.login = payload.login;
    context.state.loggedUserData.name = payload.name;
    context.state.loggedUserData.lastName = payload.last_name;
  },
  async login(context, payload) {
    await axios
      .post(`${config.apiBaseUrl}/login`, {
        login: payload.login,
        password: payload.password,
      })
      .then((response) => {
        // sessionStorage.setItem("user", response.data.user);
        context.state.loadingText = "Getting user data...";
        sessionStorage.setItem("token", response.data);
        // const newToken = sessionStorage.getItem('token')
        // console.log(newToken)
        // const checkToken = () => {
        //   if (newToken) {
        //     router.push({ name: "main-page" });
        //   } else {
        //     console.log('Nunya')
        //     setTimeout(checkToken, 100);
        //   }
        // };
        // setTimeout(checkToken, 100);
        // if (config.token) {
        //   this.$router.push({ name: "main-page" });
        // } else {
        //   sessionStorage.setItem("token", response.data);
        //   router.push({ name: "main-page" });
        // }
        // store.state.loggedUserData.coordinator =
        // 	response.data.user.koordynator == 1 ? true : false;
        // store.state.loggedUserData.login = response.data.user.login;
      });
    // .catch((error) => {
    //   console.log(error.response.status);
    //   if (error.response.status == 401) {
    //     console.log(error.response.data.message)
    //   }

    //   this.error = true;
    //   return error
    // });
  },
  async getUserData(context) {
    context.state.loadingText = "Getting user data...";
    const myToken = sessionStorage.getItem("token");
    const parsedToken = await context.dispatch("parseJwt", myToken);
    // await axios.post(`${config.apiBaseUrl}/user_data`, {
    //   data: context.state.loggedUserData.token,
    //   // data: 'test',
    // }, {
    //   headers: {
    //     Accept: 'application/json',
    //     Authorization: `Bearer ${context.state.loggedUserData.token}`
    //   }
    // }
    // ).then(response => {
    //   // context.state.loggedUserData.coordinator = response.data.koordynator == 1 ? true : false;
    //   // if (response.data.admin == 1) {
    //   //   context.state.loggedUserData.accessLevel = "admin";
    //   //   context.state.selectedPage = 'control-panel';
    //   // } else if (response.data.project_owner == 1) {
    //   //   context.state.loggedUserData.accessLevel = "projectOwner";
    //   //   context.state.selectedPage = 'control-panel';
    //   // } else if (response.data.koordynator == 1) {
    //   //   context.state.loggedUserData.accessLevel = "koordynator";
    //   //   context.state.selectedPage = 'counter';
    //   // } else {
    //   //   context.state.loggedUserData.accessLevel = "user";
    //   //   context.state.selectedPage = 'counter';
    //   // }
    //   // context.state.loggedUserData.login = response.data.login;
    //   // context.state.loggedUserData.name = response.data.name;
    //   // context.state.loggedUserData.lastName = response.data.last_name;
    //   context.commit("checkUserData", response.data)
    // })
    // setInterval(function () { context.dispatch('checkToken') }, 5000);
    context.dispatch("checkUserData", parsedToken);
    const userLogin = context.state.loggedUserData.login;
    await context.dispatch("getProjects", userLogin);
  },

  async resetPass(context, payload) {
    let pass = context.state.passChange;
    pass.loading = true;
    context.commit("getDataFromStorage");
    await axios.post(
      `${config.apiBaseUrl}/reset_password`,
      {
        login: payload,
        password: pass.newPass,
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${context.state.loggedUserData.token}`,
        },
      }
    );
    pass.error = false;
    pass.errorText = "";
    pass.newPass = "";
    pass.confirmNewPass = "";
    pass.loading = false;

    $("body").toast({
      class: "center aligned green",
      position: "bottom attached",
      message: "The password was successfully changed!",
    });
  },

  async changeData(context) {
    const dataPayload = context.state.dataChange;
    context.commit("getDataFromStorage");
    await axios.post(
      `${config.apiBaseUrl}/change_user_data`,
      {
        old_login: dataPayload.oldLogin,
        new_login: dataPayload.newLogin,
        name: dataPayload.name,
        last_name: dataPayload.lastName,
        edited_by: context.state.loggedUserData.login
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${context.state.loggedUserData.token}`,
        },
      }
    );
    dataPayload.oldLogin = "";
    dataPayload.newLogin = "";
    dataPayload.name = "";
    dataPayload.last_name = "";

    $("body").toast({
      class: "center aligned green",
      position: "bottom attached",
      message: "The user data was successfully changed!",
    });
  },

  async deleteOrPromoteUser(context, payload) {
    context.commit("getDataFromStorage");
    // let postAction = payload.action == 'promote' ? 'promote_user' : 'delete_user';
    let postAction;
    let activate = null;
    let position = null;
    if (payload.action == "promote") {
      postAction = "user_promotion";
      position = payload.position;
      activate = true;
    } else if (payload.action == "demote") {
      postAction = "user_promotion";
      position = payload.position;
    } else if (payload.action == "activate") {
      postAction = "user_activation";
      activate = true;
    } else if (payload.action == "deactivate") {
      postAction = "user_activation";
    } else if (payload.action == "delete") {
      postAction = "delete_user";
    }
    await axios.post(
      `${config.apiBaseUrl}/${postAction}`,
      {
        login: payload.login,
        activate,
        position,
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${context.state.loggedUserData.token}`,
        },
      }
    );
    await context.dispatch("getProjects", context.state.loggedUserData.login);
  },

  async getWorkStatus(context) {
    context.state.loaders.workStateLoader = true;
    context.commit("getDataFromStorage");
    return axios
      .get(
        `${config.apiBaseUrl}/get_work_status/${context.state.loggedUserData.login}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${context.state.loggedUserData.token}`,
          },
          // params: {
          //   user: payload
          // }
        }
      )
      .then((response) => {
        const workStageFilters = [];
        const additionalInfoFilters = [];
        context.state.users.working = JSON.parse(response.data.working_users);
        for (const status of context.state.users.working) {
          if (status.work_stage == 'Other' && !additionalInfoFilters.includes(status.work_stage_additional_info)) {
            additionalInfoFilters.push(status.work_stage_additional_info)
          } else if (status.work_stage != 'Other' && !workStageFilters.includes(status.work_stage)) {
            workStageFilters.push(status.work_stage)
          }
        }
        console.log(workStageFilters)
        if (workStageFilters.includes("Work", 1) ) {
          const workIndex = workStageFilters.indexOf("Work")
          const element = workStageFilters.splice(workIndex, 1)[0];
          workStageFilters.splice(0, 0, element)
        }
        context.state.workStage.filters = workStageFilters.concat(additionalInfoFilters);
        context.state.users.notWorking = JSON.parse(
          response.data.not_working_users
        );
        context.state.loaders.workStateLoader = false;
      });
  },
};
