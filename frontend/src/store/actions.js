// import axios from "axios";
// import config from '../config';
import router from '../router';
import counterActions from "./actions/counterActions";
import overarchingHistoryActions from "./actions/overarchingHistoryActions";
import projectsActions from "./actions/projectsActions";
import schedulesActions from './actions/schedulesActions';
import serverActions from "./actions/serverActions";
import usersActions from "./actions/usersActions";
import workHistoryActions from "./actions/workHistoryActions";

const { Duration } = require("luxon");


export default {

  logout(context) {
    // context.commit("getDataFromStorage")
    context.commit("clearStorage");
    context.state.projects.selected = "";
    router.push({ name: "auth" });
    router.go()
    // if (payload) {
    //   axios.post(
    //     `${config.apiBaseUrl}/logout`,
    //     {
    //       token: context.state.loggedUserData.token,
    //     },
    //     {
    //       headers: {
    //         Accept: "application/json",
    //         Authorization: `Bearer ${context.state.loggedUserData.token}`,
    //       },
    //     }
    //   );
    // }
  },

  generateId(_, payload) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < payload; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  },

  parseJwt(_, payload) {
    var base64Url = payload.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  },


  calculateTotalSegmentTime(context, payload) {
    const choiceOptions = context.state.workStage.choiceOptions;
    const allWorkCases = context.state.timeTable.filter(value => value.workStage == choiceOptions[1]);
    const allBreakCases = context.state.timeTable.filter(value => value.workStage == choiceOptions[2]);
    const allExtraBreakCases = context.state.timeTable.filter(value => value.workStage == choiceOptions[3]);
    let tableToCheck = [];
    let tableToUpdate = [];


    switch (payload.workStage) {
      case "Total":
        tableToCheck = context.state.timeTable;
        tableToUpdate = context.state.scriptDuration;
        break;
      case choiceOptions[1]:
        tableToCheck = allWorkCases;
        tableToUpdate = context.state.workTime.totalDuration;
        break;
      case choiceOptions[2]:
        tableToCheck = allBreakCases;
        tableToUpdate = context.state.breakTime.totalDuration;
        break;
      case choiceOptions[3]:
        tableToCheck = allExtraBreakCases;
        tableToUpdate = context.state.extraBreakTime.totalDuration;
        break;
    }
    let totalTime = 0;
    for (const each of tableToCheck) {
      totalTime += parseInt(each.workStageDuration);

    }
    tableToUpdate.total = totalTime;
    context.dispatch('durationDisplayHandler', { duration: tableToUpdate.total, timeToDisplay: tableToUpdate })

  },

  durationDisplayHandler(_, payload) {
    let dur = Duration.fromObject({ milliseconds: payload.duration }).shiftTo(
      "hours",
      "minutes",
      "seconds",
    );



    if (dur.seconds < 10) {
      payload.timeToDisplay.seconds = `0${Math.floor(dur.seconds)}`;
    } else {
      payload.timeToDisplay.seconds = `${Math.floor(dur.seconds)}`;
    }

    if (dur.minutes < 10) {
      payload.timeToDisplay.minutes = `0${Math.floor(dur.minutes)}`;
    } else {
      payload.timeToDisplay.minutes = `${Math.floor(dur.minutes)}`;
    }

    if (dur.hours < 10) {
      payload.timeToDisplay.hours = `0${Math.floor(dur.hours)}`;
    } else {
      payload.timeToDisplay.hours = `${Math.floor(dur.hours)}`;
    }
  },

  /*************************Overarching History Actions*************************/

  ...overarchingHistoryActions,

  /*************************Counter Actions*************************/

  ...counterActions,

  /*************************Server Actions*************************/

  ...serverActions,


  /*************************Work History Actions*************************/

  ...workHistoryActions,

  /*************************Projects Actions*************************/

  ...projectsActions,

  /*************************Users Actions*************************/

  ...usersActions,

  /*************************Schedules Actions*************************/

  ...schedulesActions

}


