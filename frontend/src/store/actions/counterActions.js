import axios from "axios";
import config from "../../config";
const { DateTime } = require("luxon");

const fixDate = (date) =>
  date ? DateTime.fromISO(date).toFormat("yyyy-MM-dd T:ss") : null;

export default {
  timeCounter(context, payload) {
    let timeNow = DateTime.now();
    let autoLogout = context.state.autoLogoutTime;
    let duration = timeNow.diff(payload.timeStart, [
      "hours",
      "minutes",
      "seconds",
    ]);

    let totalDuration = timeNow.diff(payload.workStart, [
      "hours",
      "minutes",
      "seconds",
    ]);

    let otherWorkStagesTime;

    if (
      context.state.workStage.currentlySelected ==
      context.state.workStage.choiceOptions[1]
    ) {
      otherWorkStagesTime = payload.workStart
        .plus({ milliseconds: context.state.breakTime.totalDuration.total })
        .plus({
          milliseconds: context.state.extraBreakTime.totalDuration.total,
        });
      let workDuration = timeNow.diff(otherWorkStagesTime, [
        "hours",
        "minutes",
        "seconds",
      ]);
      context.state.timeDifference.work.hours = workDuration.values.hours;
      context.state.timeDifference.work.minutes = workDuration.values.minutes;
      context.state.timeDifference.work.seconds = Math.floor(
        workDuration.values.seconds
      );
    } else if (
      context.state.workStage.currentlySelected ==
      context.state.workStage.choiceOptions[2]
    ) {
      otherWorkStagesTime = payload.workStart
        .plus({ milliseconds: context.state.workTime.totalDuration.total })
        .plus({
          milliseconds: context.state.extraBreakTime.totalDuration.total,
        });
      let breakDuration = timeNow.diff(otherWorkStagesTime, [
        "hours",
        "minutes",
        "seconds",
      ]);
      context.state.timeDifference.break.hours = breakDuration.values.hours;
      context.state.timeDifference.break.minutes = breakDuration.values.minutes;
      context.state.timeDifference.break.seconds = Math.floor(
        breakDuration.values.seconds
      );
    } else {
      otherWorkStagesTime = payload.workStart
        .plus({ milliseconds: context.state.workTime.totalDuration.total })
        .plus({ milliseconds: context.state.breakTime.totalDuration.total });
      let extraBreakDuration = timeNow.diff(otherWorkStagesTime, [
        "hours",
        "minutes",
        "seconds",
      ]);
      context.state.timeDifference.other.hours =
        extraBreakDuration.values.hours;
      context.state.timeDifference.other.minutes =
        extraBreakDuration.values.minutes;
      context.state.timeDifference.other.seconds = Math.floor(
        extraBreakDuration.values.seconds
      );
    }

    context.state.timeDifference.current.hours = duration.values.hours;
    context.state.timeDifference.current.minutes = duration.values.minutes;
    context.state.timeDifference.current.seconds = Math.floor(
      duration.values.seconds
    );

    context.state.timeDifference.total.hours = totalDuration.values.hours;
    context.state.timeDifference.total.minutes = totalDuration.values.minutes;
    context.state.timeDifference.total.seconds = Math.floor(
      totalDuration.values.seconds
    );
    // if (context.state.workStage.currentlySelected == 'Break') {
    //   context.state.timeDifference.break.hours = duration.values.hours;
    //   context.state.timeDifference.break.minutes = duration.values.minutes;
    //   context.state.timeDifference.break.seconds = Math.floor(duration.values.seconds);
    // }

    if (timeNow > autoLogout) {
      // context.dispatch('stopCounter');
      clearInterval(context.state.interval);
      setTimeout(() => {
        context.dispatch("getCurrentHistory");
      }, 60000);

      context.state.workTimePassed = true;
      context.state.counter.started = false;
    } else {
      return;
    }
  },

  initCounter(context, payload) {
    const homeState = context.state;
    homeState.safeToLeave = false;
    homeState.dataUpload.initial = true;
    let dt = DateTime.local();
    homeState.workStart = dt;
    homeState.timeStart = dt;
    const theNextDay = dt.plus({ day: 1 });
    // homeState.workTime.totalDuration.total = 0;
    // homeState.breakTime.totalDuration.total = 0;
    // homeState.extraBreakTime.totalDuration.total = 0;

    // let workRestart = context.state.workStart.plus({ milliseconds: -context.state.scriptDuration.total });
    // let workStart = context.state.scriptDuration.total > 0 ? workRestart : context.state.workStart;

    // let projectData = homeState.projects;
    const campaignData = homeState.projects.selectedCampaign;
    context.dispatch("checkCampaigns", homeState.projects.selectedProjectCode);
    // console.log(campaignData)
    let startingHours = campaignData.starting_hours;
    let endingHours = campaignData.ending_hours;
    let autoLogout = campaignData.logout_buffer;
    let endingNextDay = campaignData.ending_next_day;
    let scheduledStartTime = DateTime.fromSQL(startingHours);
    let scheduledEndTime = !endingNextDay
      ? DateTime.fromSQL(endingHours)
      : DateTime.fromSQL(endingHours).plus({ days: 1 });
    let autoLogoutTime = scheduledEndTime.plus({ minutes: autoLogout });
    homeState.projects.selectedCampaignId = campaignData.campaign_id;
    homeState.projects.selectedCampaignName = campaignData.campaign_name;
    homeState.autoLogout = autoLogout;
    homeState.workStage.currentlySelected = payload.workStage;
    homeState.scheduledStartTime = DateTime.fromObject({
      year: dt.year,
      month: dt.month,
      day: dt.day,
      hour: scheduledStartTime.hour,
      minutes: scheduledStartTime.minute,
    });
    const autoLogoutDay = !endingNextDay ? dt.day : theNextDay.day;

    homeState.scheduledEndTime = DateTime.fromObject({
      year: dt.year,
      month: dt.month,
      day: autoLogoutDay,
      hour: scheduledEndTime.hour,
      minutes: scheduledEndTime.minute,
    });
    homeState.autoLogoutTime = DateTime.fromObject({
      year: dt.year,
      month: dt.month,
      day: autoLogoutDay,
      hour: autoLogoutTime.hour,
      minutes: autoLogoutTime.minute,
    });
    homeState.extraBreak.additionalInfo = payload.additionalInfo;

    if (dt >= scheduledEndTime) {
      // context.dispatch('stopCounter');
      homeState.workTimePassed = true;
      homeState.counter.started = false;
      return;
    }

    context.dispatch("startCounter", {
      timeStart: dt,
      scheduledEnd: homeState.scheduledEndTime,
    });
    context.dispatch("sendDataToServer", {
      workStageStart: dt,
      workStageEnd: null,
      duration: "",
      additionalInfo: homeState.extraBreak.additionalInfo,
      workEnd: null,
    });
    homeState.safeToLeave = true;
    homeState.dataUpload.initial = false;
  },

  startCounter(context, payload) {
    context.state.counter.started = true;
    context.state.counter.stopped = false;
    let workRestart = context.state.workStart.plus({
      milliseconds: -context.state.existingHistoryDuration,
    });
    let workStart = context.state.existingHistory
      ? workRestart
      : context.state.workStart;
    context.state.counterElements.showSelection = false;
    // let workStart = context.state.workStart;
    // context.state.timeStart = payload.timeStart;
    context.state.interval = setInterval(function () {
      context.dispatch("timeCounter", {
        timeStart: payload.timeStart,
        timeEnd: payload.scheduledEnd,
        workStart,
      });
    }, 100);
  },

  async changeCounter(context, payload) {
    const homeState = context.state;
    homeState.safeToLeave = false;
    let timeReset = DateTime.now();
    let duration = timeReset.diff(homeState.timeStart);
    let previousWorkStage = homeState.workStage.currentlySelected;
    let previousAdditionalInfo = homeState.extraBreak.additionalInfo;

    clearInterval(homeState.interval);
    const workStageOptions = context.state.workStage.choiceOptions;
    if (previousWorkStage == workStageOptions[1]) {
      homeState.workTime.totalDuration.total += duration;
    } else if (previousWorkStage == workStageOptions[2]) {
      homeState.breakTime.totalDuration.total += duration;
    } else {
      homeState.extraBreakTime.totalDuration.total += duration;
    }

    // homeState.timeDifference.work.hours = context.state.workTime.totalDuration.hours
    // homeState.timeDifference.work.minutes = context.state.workTime.totalDuration.minutes
    // homeState.timeDifference.work.seconds = context.state.workTime.totalDuration.seconds

    homeState.workStage.currentlySelected = payload.workStage;
    homeState.counterElements.changeProjectByButton = false;
    homeState.counterElements.changeCampaignByButton = false;
    context.dispatch("checkCampaigns", homeState.projects.selectedProjectCode);
    // for (const stage in workStageOptions) {
    //   context.dispatch('calculateTotalSegmentTime', { workStage: workStageOptions[stage] });
    // }

    // console.log(`Work: ${JSON.stringify(homeState.workTime.totalDuration)}`)
    // console.log(`Break: ${JSON.stringify(homeState.breakTime.totalDuration)}`)
    // let totalBreakTime = context.state.breakTime.totalDuration.total + context.state.extraBreakTime.totalDuration.total;
    // let workClicked = homeState.workStart.plus({milliseconds: totalBreakTime});
    // let totalWorkDuration = timeReset.diff(workClicked, [
    //   "hours",
    //   "minutes",
    //   "seconds",
    // ]);
    // console.log(`Total break time: ${totalBreakTime}`);
    // console.log(`Resume counter at: ${totalWorkDuration.hours}:${totalWorkDuration.minutes}:${totalWorkDuration.seconds}`);
    // console.log(`Work: ${JSON.stringify(context.state.workTime.totalDuration)}`)
    // console.log(`Break: ${JSON.stringify(context.state.breakTime.totalDuration)}`);
    // console.log(`Other: ${JSON.stringify(context.state.extraBreakTime.totalDuration)}`);

    // let startCounterValue = homeState.workStage.currentlySelected == workStageOptions[1] ? context.state.breakTime.totalDuration

    context.dispatch("startCounter", {
      timeStart: timeReset,
      scheduledEnd: homeState.scheduledEndTime,
    });

    const workId = await context.dispatch("getCurrentId");
    const prevCampaignId = homeState.campaignChange
      ? homeState.projects.selectedCampaignId
      : null;
    const prevCampaignName = homeState.campaignChange
      ? homeState.projects.selectedCampaignName
      : null;

    await context.dispatch("sendDataToServer", {
      workStageStart: homeState.timeStart,
      workStageEnd: timeReset,
      duration: duration.values.milliseconds,
      workEnd: "",
      workStage: previousWorkStage,
      additionalInfo: previousAdditionalInfo,
      workStageId: workId,
      updateTable: true,
      campaignId: prevCampaignId,
      campaignName: prevCampaignName,
    });

    homeState.extraBreak.additionalInfo = payload.additionalInfo;
    homeState.timeStart = timeReset;
    homeState.projects.selectedCampaignId =
      homeState.projects.selectedCampaign.campaign_id;
    homeState.projects.selectedCampaignName =
      homeState.projects.selectedCampaign.campaign_name;

    if (!homeState.dataUpload.successful) {
      return;
    }

    await context.dispatch("sendDataToServer", {
      workStageStart: timeReset,
      workStageEnd: null,
      duration: "",
      workEnd: null,
      additionalInfo: homeState.extraBreak.additionalInfo,
    });
    let dt = DateTime.now().toFormat("yyyy-MM-dd");
    context.dispatch("calculateDurations", {
      startDate: dt,
      endDate: dt,
      login: context.state.loggedUserData.login,
    });
    homeState.counterElements.prevCampaign = "";
    homeState.safeToLeave = true;
  },

  async stopCounter(context) {
    context.state.safeToLeave = false;
    clearInterval(context.state.interval);

    context.state.loaders.stopCounterLoader = true;
    let homeState = context.state;
    homeState.counter.started = false;
    homeState.counter.stopped = true;
    let timeStop = DateTime.now();
    let duration = timeStop.diff(context.state.timeStart);
    let dt = DateTime.fromISO(new Date(timeStop).toISOString()).toFormat(
      "yyyy-MM-dd"
    );

    const workId = await context.dispatch("getCurrentId");
    await context.dispatch("sendDataToServer", {
      workStageStart: homeState.timeStart,
      workStageEnd: timeStop,
      duration: duration.values.milliseconds,
      workEnd: timeStop,
      workStageId: workId,
      additionalInfo: homeState.extraBreak.additionalInfo,
      updateTable: true,
    });

    if (!homeState.dataUpload.successful) {
      return;
    }

    await context.dispatch("finishWork", {
      dateId: dt,
      workTimeEnded: timeStop,
    });

    await context.dispatch("calculateDurations", {
      startDate: dt,
      endDate: dt,
      login: context.state.loggedUserData.login,
    });
    context.state.workStage.currentlySelected = "";
    context.state.timeDifference.minutes = 0;
    context.state.timeDifference.seconds = 0;
    context.state.workTime.part += 1;
    context.state.timeStart = DateTime.now();
    context.state.projects.selected = "";
    context.state.workId = "";
    context.state.loaders.stopCounterLoader = false;
    context.state.counterElements.showSelected = false;
    context.state.counterElements.showProjectSelection = true;
    context.state.counterElements.showSelection = true;
    context.state.counterElements.showButtons = false;
    context.state.projects.selectedCampaignId = "";
    context.state.projects.selectedCampaignName = "";
    context.state.safeToLeave = true;
  },

  async finishWork(context, payload) {
    context.commit("getDataFromStorage");
    // context.dispatch('counterStarted', context.state.scheduledEndTime);
    return axios
      .post(
        `${config.apiBaseUrl}/finish_work`,
        {
          date_id: payload.dateId,
          user_id: context.state.loggedUserData.login,
          work_time_started: DateTime.fromISO(context.state.workStart).toFormat(
            "yyyy-MM-dd T:ss"
          ),
          work_time_ended: fixDate(payload.workTimeEnded),
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${context.state.loggedUserData.token}`,
          },
        }
      )
      .catch((err) => console.log(err));
  },

  async getCurrentTimer(context) {
    let homeState = context.state;
    context.state.lastLoginDate = DateTime.local().toFormat("yyyy-MM-dd");
    await context.dispatch("getUserData");
    await context.dispatch("getCurrentHistory");
    if (!context.getters.hasUpperAccess) {
      setInterval(function () {
        context.dispatch("refreshHistory");
      }, 1800000);
      context.state.loadingText = "Looking for your timer...";
      let token = homeState.loggedUserData.token;
      return axios
        .get(
          `${config.apiBaseUrl}/get_timer/${homeState.loggedUserData.login}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            // params: {
            //   user_id: homeState.loggedUserData.login,
            // },
          }
        )
        .then((res) => {
          let response = res.data;
          if (response.latest_record != null) {
            let latestRecord = response.latest_record;
            let dt = DateTime.fromSQL(latestRecord.work_stage_started);
            for (const client of homeState.projects.list) {
              for (const project of client.projects) {
                for (const campaign of project.campaigns) {
                  if (campaign.campaign_id == latestRecord.campaign_id) {
                    homeState.projects.selectedCampaign = campaign;
                  }
                }
              }
            }
            homeState.timeStart = dt;
            homeState.projects.selected = latestRecord.project_name;
            homeState.projects.selectedProjectCode = latestRecord.project_code;
            homeState.projects.selectedCampaignId = latestRecord.campaign_id;
            homeState.projects.selectedCampaignName =
              latestRecord.campaign_name;
            homeState.counterElements.currentProjectCode =
              latestRecord.project_code;
            context.dispatch("checkCampaigns", latestRecord.project_code);
            homeState.dataUpload.successful = true;
            homeState.workId = latestRecord.work_stage_id;
            homeState.workStart = DateTime.fromSQL(
              latestRecord.work_time_started
            );
            homeState.scheduledStartTime = DateTime.fromSQL(
              latestRecord.scheduled_start_time
            );
            homeState.scheduledEndTime = DateTime.fromSQL(
              latestRecord.scheduled_end_time
            );
            homeState.autoLogoutTime = DateTime.fromSQL(
              latestRecord.auto_logout_time
            );
            homeState.workStage.currentlySelected = latestRecord.work_stage;
            homeState.extraBreak.additionalInfo =
              latestRecord.work_stage_additional_info;
            context.dispatch("startCounter", {
              timeStart: dt,
              scheduledEnd: homeState.scheduledEndTime,
            });
            homeState.counterElements.showSelection = false;
            homeState.counterElements.showSelected = true;
            homeState.counterElements.showButtons = true;
          }
        })
        .then()
        .catch((error) => {
          console.log(error);
        });
    }

    // const response = (await req).data;
  },

  checkCampaigns(context, payload) {
    let selectableCampaigns = [];
    for (const client of context.state.projects.list) {
      for (const project of client.projects) {
        if (project.project_code == payload) {
          selectableCampaigns = project.campaigns;
        }
      }
    }
    context.state.counterElements.oneCampaign =
      selectableCampaigns.length == 1 ? true : false;
  },

  saveToTimeTable(context, payload) {
    let stageDurationFromServer;
    payload.workStageDuration == null
      ? (stageDurationFromServer = 0)
      : (stageDurationFromServer = payload.workStageDuration);
    const homeState = context.state;

    const findWorkStageId = homeState.timeTable.some(
      (el) => el.workStageId === payload.workStageId
    );

    if (!findWorkStageId && payload.workStageEnded != null) {
      homeState.timeTable.push({
        id: payload.id,
        login: payload.login,
        koordynator: payload.koordynator,
        workStageId: payload.workStageId,
        workStageStarted: payload.workStageStarted,
        workStageEnded: payload.workStageEnded,
        workStageDuration: stageDurationFromServer,
        workStage: payload.workStage,
        projectName: payload.projectName,
        projectCode: payload.projectCode,
        campaignName: payload.campaignName,
        campaignId: payload.campaignId,
        additionalInfo: payload.additionalInfo,
        comments: payload.comments,
        autoLogout: payload.autoLogout,
        updated: payload.updated,
        editable: false,
      });
    }
  },
  counterHandler(context, payload) {
    context.state.dataUpload.ongoing = true;
    if (!context.state.counter.started) {
      context.dispatch("initCounter", { workStage: payload });
    } else {
      context.state.loaders.workHistoryLoader = true;
      context.dispatch("changeCounter", { workStage: payload });
    }
  },
};
