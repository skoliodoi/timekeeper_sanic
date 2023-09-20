const { Duration } = require("luxon");
// const { DateTime } = require("luxon");

export default {
  clearStorage() {
    // localStorage.clear()
    sessionStorage.clear()
  },

  getDataFromStorage(state) {
    state.loggedUserData.token = sessionStorage.getItem('token');
  },





  // timeCounter(state) {
  //   let timeNow = DateTime.now();
  //   let duration = timeNow.diff(state.timeStart, [
  //     "hours",
  //     "minutes",
  //     "seconds",
  //   ]);
  //   state.timeDifference.hours = duration.values.hours;
  //   state.timeDifference.minutes = duration.values.minutes;
  //   state.timeDifference.seconds = Math.floor(duration.values.seconds);
  // },
  calculateTotalSegmentTime(state, payload) {
    const choiceOptions = state.workStage.choiceOptions;
    const allWorkCases = state.timeTable.filter(value => value.workStage == choiceOptions[1]);
    const allBreakCases = state.timeTable.filter(value => value.workStage == choiceOptions[2]);
    const allExtraBreakCases = state.timeTable.filter(value => value.workStage == choiceOptions[3]);
    // let additionalTime = payload.timeToAdd;
    let tableToCheck = [];
    let tableToUpdate = [];
    // let durationToRecalculate;

    switch (payload.workStage) {
      case "Total":
        tableToCheck = state.timeTable;
        tableToUpdate = state.scriptDuration;
        // durationToRecalculate = state.scriptDuration.total;
        break;
      case choiceOptions[1]:
        tableToCheck = allWorkCases;
        tableToUpdate = state.workTime.totalDuration;
        // durationToRecalculate = state.workTime.totalDuration.total;
        break;
      case choiceOptions[2]:
        tableToCheck = allBreakCases;
        tableToUpdate = state.breakTime.totalDuration;
        // durationToRecalculate = state.breakTime.totalDuration.total;
        break;
      case choiceOptions[3]:
        tableToCheck = allExtraBreakCases;
        tableToUpdate = state.extraBreakTime.totalDuration;
        // durationToRecalculate = state.extraBreakTime.totalDuration.total;
        break;
    }
    let totalTime = 0;
    for (const each of tableToCheck) {
      totalTime += parseInt(each.workStageDuration);

    }


    // let totalTime = !payload.recalculate ? 0 : durationToRecalculate;
    // if (!payload.recalculate) {
    //   for (const each of tableToCheck) {
    //     totalTime += each.stageDuration;
    //   }
    // } else {
    //   totalTime += additionalTime;
    // }

    tableToUpdate.total = totalTime;
    let dur = Duration.fromObject({ milliseconds: tableToUpdate.total }).shiftTo(
      "hours",
      "minutes",
      "seconds",
    );



    if (dur.seconds < 10) {
      tableToUpdate.seconds = `0${Math.floor(dur.seconds)}`;
    } else {
      tableToUpdate.seconds = `${Math.floor(dur.seconds)}`;
    }

    if (dur.minutes < 10) {
      tableToUpdate.minutes = `0${Math.floor(dur.minutes)}`;
    } else {
      tableToUpdate.minutes = `${Math.floor(dur.minutes)}`;
    }

    if (dur.hours < 10) {
      tableToUpdate.hours = `0${Math.floor(dur.hours)}`;
    } else {
      tableToUpdate.hours = `${Math.floor(dur.hours)}`;
    }

  },



  addTime(state, payload) {
    let durationDivided = Duration.fromObject({
      milliseconds: payload.duration,
    }).shiftTo("hours", "minutes", "seconds");
    state.addedTimeTable.push({
      project: payload.project,
      duration: payload.duration,
      displayStageDuration: {
        hours: durationDivided.hours,
        minutes: durationDivided.minutes,
        seconds: durationDivided.seconds
      },
      stage: payload.workStage,
      reason: payload.reason
    });
  },
}