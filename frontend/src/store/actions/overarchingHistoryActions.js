import axios from "axios";
import config from "../../config";

import modifyRecords from "./modifyRecords";

const { DateTime } = require("luxon");

export default {
  ...modifyRecords,
  async initTimeUpdate(context, payload) {
    // this.loader = true;
    let dt = DateTime.fromISO(new Date(payload.date).toISOString()).toFormat(
      "yyyy-MM-dd"
    );
    context.commit("getDataFromStorage");
    await axios
      .post(
        `${config.apiBaseUrl}/get_work_history`,
        {
          user_id: payload.user,
          start_date: dt,
          end_date: dt,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${context.state.loggedUserData.token}`,
          },
        }
      )
      .then((res) => {
        class Records {
          constructor(id, login, projectId, start, end, stage, info, comments) {
            (this.workStageIdNumber = id),
              (this.login = login),
              (this.projectIdNumber = projectId),
              (this.workStageStarted = start),
              (this.workStageEnded = end),
              (this.workStageFromHistory = stage),
              (this.additionalInformation = info);
            this.commentsFromHistory = comments;
          }
        }
        for (const each of JSON.parse(res.data.work_history)) {
          context.state.updateTables.existingRecords.push(
            new Records(
              each.work_stage_id,
              each.user_id,
              each.campaign_id,
              each.work_stage_started,
              each.work_stage_ended,
              each.work_stage,
              each.work_stage_additional_info,
              each.comments
            )
          );
        }
        // this.loader = false;
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
          context.state.errors.workHistoryError.errorData = `Request error - the request was made but no response was received :(`;
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
          context.state.errors.workHistoryError.connectionError = true;
          context.state.errors.workHistoryError.errorData = `${error.message}`;
        }
      });
    context.dispatch("checkTime", {
      startTime: payload.startTime,
      endTime: payload.endTime,
    });
    context.dispatch("modifyRecords", {
      startDate: payload.startTime,
      endDate: payload.endTime,
      login: payload.login,
      project: payload.project,
      workStage: payload.workStage,
      additionalInfo: payload.additionalInfo,
      comments: payload.comments,
      update: payload.update,
    });

    // modifyRecords(
    //   startDate,
    //   endDate,
    //   login,
    //   project,
    //   workStage,
    //   additionalInfo,
    //   comments
    // )
    // this.modifyRecords(
    //   startTimeToModify,
    //   endTimeToModify,
    //   data.userData,
    //   data.projectData,
    //   data.workStageData,
    //   data.additionalInfoData,
    //   data.commentsData
    // );
    // checkTime(startTimeToModify, endTimeToModify)
  },
  checkTime(context, payload) {
    for (const each of context.state.updateTables.existingRecords) {
      if (payload.endTime <= each.workStageEnded) {
        let temporaryTable = [];
        temporaryTable.push(each);
        for (const each of temporaryTable) {
          if (
            (payload.startTime >= each.workStageStarted &&
              payload.startTime < each.workStageEnded) ||
            payload.endTime > each.workStageStarted
          ) {
            context.state.updateTables.recordsToModify.push(each);
          }
        }
      } else if (payload.endTime >= each.workStageEnded) {
        let temporaryTable = [];
        temporaryTable.push(each);
        for (const each of temporaryTable) {
          if (each.workStageStarted > payload.startTime) {
            context.state.updateTables.recordsToDelete.push(
              each.workStageIdNumber
            );
          }

          if (
            payload.startTime >= each.workStageStarted &&
            payload.startTime < each.workStageEnded
          ) {
            context.state.updateTables.recordsToModify.push(each);
          }
        }
      }
    }
  },
  async pushToSend(context, payload) {
    // let newId = "";
    // let characters =
    //   "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // let charactersLength = characters.length;
    // for (var i = 0; i < 75; i++) {
    //   newId += characters.charAt(
    //     Math.floor(Math.random() * charactersLength)
    //   );
    // }
    let workStageId = await context.dispatch("generateId", 75);
    const fixDate = (date) => date ? DateTime.fromISO(date).toFormat("yyyy-MM-dd T:ss") : null
    context.state.updateTables.recordsToSend.push({
      login: payload.login,
      project: payload.project,
      workStageStarted: fixDate(payload.start),
      workStageEnded: fixDate(payload.end),
      // workStageId: newId,
      workStageId,
      workStage: payload.workStage,
      additionalInfo: payload.additionalInfo,
      comments: payload.comments,
      duration: payload.end.diff(payload.start).values.milliseconds,
      workCase: payload.workCase,
      editedBy: context.state.loggedUserData.login,
    });
  },

  // calculateWorkStages(context, payload) {
  //   const tables = context.state.updateTables;
  //   if (payload.recordWithTheSameStartTime && payload.recordWithTheSameEndTime) {
  //     if (
  //       payload.recordWithTheSameStartTime.workStageFromHistory == payload.workStage &&
  //       payload.recordWithTheSameEndTime.workStageFromHistory == payload.workStage
  //     ) {
  //       context.dispatch('pushToSend', {
  //         login: payload.login,
  //         project: payload.project,
  //         start: DateTime.fromISO(
  //           new Date(
  //             payload.recordWithTheSameStartTime.workStageStarted
  //           ).toISOString()
  //         ),
  //         end: DateTime.fromISO(
  //           new Date(payload.recordWithTheSameEndTime.workStageEnded).toISOString()
  //         ),
  //         workStage: payload.workStage,
  //         additionalInfo: payload.additionalInfo,
  //         comments: payload.comments,
  //         workCase: "Case 4.1.1"
  //       })
  //       // this.pushToSend(
  //       //   login:payload.login,
  //       //   project:payload.project,
  //       //   start:DateTime.fromISO(
  //       //     new Date(
  //       //       payload.recordWithTheSameStartTime.workStageStarted
  //       //     ).toISOString()
  //       //   ),
  //       //   end: DateTime.fromISO(
  //       //     new Date(payload.recordWithTheSameEndTime.workStageEnded).toISOString()
  //       //   ),
  //       //   workStage:payload.workStage,
  //       //   additionalInfo:payload.additionalInfo,
  //       //   comments:payload.comments,
  //       //   workCase:"Case 4.1.1"
  //       // );
  //       tables.recordsToDelete.push(
  //         payload.recordWithTheSameStartTime.workStageIdNumber
  //       );
  //       tables.recordsToDelete.push(payload.recordWithTheSameEndTime.workStageIdNumber);
  //     } else if (
  //       payload.recordWithTheSameStartTime.workStageFromHistory == payload.workStage
  //     ) {
  //       context.dispatch('pushToSend', {
  //         login: payload.login,
  //         project: payload.project,
  //         start: DateTime.fromISO(
  //           new Date(
  //             payload.recordWithTheSameStartTime.workStageStarted
  //           ).toISOString()
  //         ),
  //         end: DateTime.fromSQL(payload.end),
  //         workStage: payload.workStage,
  //         additionalInfo: payload.additionalInfo,
  //         comments: payload.comments,
  //         workCase: "Case 4.1.2"
  //       })
  //       // this.pushToSend(
  //       //   payload.login,
  //       //   project,
  //       //   DateTime.fromISO(
  //       //     new Date(
  //       //       payload.recordWithTheSameStartTime.workStageStarted
  //       //     ).toISOString()
  //       //   ),
  //       //   DateTime.fromSQL(end),
  //       //   workStage,
  //       //   additionalInfo,
  //       //   comments,
  //       //   "Case 4.1.2"
  //       // );
  //       tables.recordsToDelete.push(
  //         payload.recordWithTheSameStartTime.workStageIdNumber
  //       );
  //     } else if (payload.recordWithTheSameEndTime.workStageFromHistory == payload.workStage) {
  //       context.dispatch('pushToSend', {
  //         login: payload.login,
  //         project: payload.project,
  //         start: DateTime.fromSQL(payload.start),
  //         end: DateTime.fromISO(
  //           new Date(payload.recordWithTheSameEndTime.workStageEnded).toISOString()
  //         ),
  //         workStage: payload.workStage,
  //         additionalInfo: payload.additionalInfo,
  //         comments: payload.comments,
  //         workCase: "Case 4.1.3"
  //       })
  //       // this.pushToSend(
  //       //   payload.login,
  //       //   project,
  //       //   DateTime.fromSQL(start),
  //       //   DateTime.fromISO(
  //       //     new Date(payload.recordWithTheSameEndTime.workStageEnded).toISOString()
  //       //   ),
  //       //   workStage,
  //       //   additionalInfo,
  //       //   comments,
  //       //   "Case 4.1.3"
  //       // );
  //       tables.recordsToDelete.push(payload.recordWithTheSameEndTime.workStageIdNumber);
  //     } else {
  //       context.dispatch('pushToSend', {
  //         login: payload.login,
  //         project: payload.project,
  //         start: DateTime.fromSQL(payload.start),
  //         end: DateTime.fromSQL(payload.end),
  //         workStage: payload.workStage,
  //         additionalInfo: payload.additionalInfo,
  //         comments: payload.comments,
  //         workCase: "Case 4.1.4"
  //       })
  //       // this.pushToSend(
  //       //   payload.login,
  //       //   project,
  //       //   DateTime.fromSQL(start),
  //       //   DateTime.fromSQL(end),
  //       //   workStage,
  //       //   additionalInfo,
  //       //   comments,
  //       //   "Case 4.1.4"
  //       // );
  //     }
  //   } else if (payload.recordWithTheSameStartTime) {
  //     if (payload.recordWithTheSameStartTime.workStageFromHistory == payload.workStage) {
  //       context.dispatch('pushToSend', {
  //         login: payload.login,
  //         project: payload.project,
  //         start: DateTime.fromISO(
  //           new Date(
  //             payload.recordWithTheSameStartTime.workStageStarted
  //           ).toISOString()
  //         ),
  //         end: DateTime.fromSQL(payload.end),
  //         workStage: payload.workStage,
  //         additionalInfo: payload.additionalInfo,
  //         comments: payload.comments,
  //         workCase: "Case 4.2.1"
  //       })
  //       // this.pushToSend(
  //       //   payload.login,
  //       //   project,
  //       //   DateTime.fromISO(
  //       //     new Date(
  //       //       payload.recordWithTheSameStartTime.workStageStarted
  //       //     ).toISOString()
  //       //   ),
  //       //   DateTime.fromSQL(end),
  //       //   workStage,
  //       //   additionalInfo,
  //       //   comments,
  //       //   "Case 4.2.1"
  //       // );
  //       // if (currentRecord) {
  //       // 	this.pushToSend(
  //       // 		end,
  //       // 		currentRecord.workStageEnded,
  //       // 		"New id 177",
  //       // 		currentRecord.workStage
  //       // 	);
  //       // }
  //       tables.recordsToDelete.push(
  //         payload.recordWithTheSameStartTime.workStageIdNumber
  //       );
  //     } else {
  //       context.dispatch('pushToSend', {
  //         login: payload.login,
  //         project: payload.project,
  //         start: DateTime.fromSQL(payload.start),
  //         end: DateTime.fromSQL(payload.end),
  //         workStage: payload.workStage,
  //         additionalInfo: payload.additionalInfo,
  //         comments: payload.comments,
  //         workCase: "Case 4.2.2"
  //       })
  //       // this.pushToSend(
  //       //   payload.login,
  //       //   project,
  //       //   DateTime.fromSQL(start),
  //       //   DateTime.fromSQL(end),
  //       //   workStage,
  //       //   additionalInfo,
  //       //   comments,
  //       //   "Case 4.2.2"
  //       // );
  //     }
  //   } else if (payload.recordWithTheSameEndTime) {
  //     if (payload.recordWithTheSameEndTime.workStageFromHistory == payload.workStage) {
  //       context.dispatch('pushToSend', {
  //         login: payload.login,
  //         project: payload.project,
  //         start: DateTime.fromSQL(payload.start),
  //         end: DateTime.fromISO(
  //           new Date(payload.recordWithTheSameEndTime.workStageEnded).toISOString()
  //         ),
  //         workStage: payload.workStage,
  //         additionalInfo: payload.additionalInfo,
  //         comments: payload.comments,
  //         workCase: "Case 4.3.1"
  //       })
  //       // this.pushToSend(
  //       //   payload.login,
  //       //   project,
  //       //   DateTime.fromSQL(start),
  //       //   DateTime.fromISO(
  //       //     new Date(payload.recordWithTheSameEndTime.workStageEnded).toISOString()
  //       //   ),
  //       //   workStage,
  //       //   additionalInfo,
  //       //   comments,
  //       //   "Case 4.3.1"
  //       // );
  //       tables.recordsToDelete.push(payload.recordWithTheSameEndTime.workStageIdNumber);
  //     } else {
  //       context.dispatch('pushToSend', {
  //         login: payload.login,
  //         project: payload.project,
  //         start: DateTime.fromSQL(payload.start),
  //         end: DateTime.fromSQL(payload.end),
  //         workStage: payload.workStage,
  //         additionalInfo: payload.additionalInfo,
  //         comments: payload.comments,
  //         workCase: "Case 4.3.2"
  //       })
  //       // this.pushToSend(
  //       //   payload.login,
  //       //   project,
  //       //   DateTime.fromSQL(start),
  //       //   DateTime.fromSQL(end),
  //       //   workStage,
  //       //   additionalInfo,
  //       //   comments,
  //       //   "Case 4.3.2"
  //       // );
  //     }
  //   } else {
  //     context.dispatch('pushToSend', {
  //       login: payload.login,
  //       project: payload.project,
  //       start: DateTime.fromSQL(payload.start),
  //       end: DateTime.fromSQL(payload.end),
  //       workStage: payload.workStage,
  //       additionalInfo: payload.additionalInfo,
  //       comments: payload.comments,
  //       workCase: "Case 0"
  //     })
  //     // this.pushToSend(
  //     //   payload.login,
  //     //   project,
  //     //   DateTime.fromSQL(start),
  //     //   DateTime.fromSQL(end),
  //     //   workStage,
  //     //   additionalInfo,
  //     //   comments,
  //     //   "Case 0"
  //     // );
  //   }
  // },
};
