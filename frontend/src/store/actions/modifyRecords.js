const { DateTime } = require("luxon");
export default {
  // modifyRecords(
  //   context, payload,
  //   startDate,
  //   endDate,
  //   login,
  //   project,
  //   workStage,
  //   additionalInfo,
  //   comments
  // )
  modifyRecords(context, payload) {
    const tables = context.state.updateTables;
    // let recordWithTheSameStartTime = tables.existingRecords.find(
    //   (element) => element.workStageEnded == payload.startDate
    // );
    // let recordWithTheSameEndTime = tables.existingRecords.find(
    //   (element) => element.workStageStarted == payload.endDate
    // );
    if (tables.recordsToModify.length > 0) {
      // let sameRecord = tables.recordsToModify.find(
      // 	(element) => element.workStageEnded == payload.endDate
      // );
      for (const each of tables.recordsToModify) {
        if (payload.startDate == each.workStageStarted) {
          if (payload.endDate > each.workStageEnded) {
            let recordEndingLater = tables.recordsToModify.find(
              (element) => element.workStageEnded > payload.endDate
            );
            if (recordEndingLater) {
              context.dispatch("pushToSend", {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 1.1",
              });
              context.dispatch("pushToSend", {
                login: payload.login,
                project: recordEndingLater.projectIdNumber,
                start: DateTime.fromSQL(payload.endDate),
                end: DateTime.fromISO(
                  new Date(recordEndingLater.workStageEnded).toISOString()
                ),
                workStage: recordEndingLater.workStageFromHistory,
                additionalInfo: recordEndingLater.additionalInformation,
                comments: recordEndingLater.commentsFromHistory,
                workCase: "Case 1.2",
              });
            } else {
              context.dispatch("pushToSend", {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 1.3",
              });
            }
          } else if (payload.endDate < each.workStageEnded) {
            if (payload.update) {
              context.dispatch("pushToSend", {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 1.4",
              });
            } else {
              context.dispatch("pushToSend", {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 1.5",
              });
              context.dispatch("pushToSend", {
                login: payload.login,
                project: each.projectIdNumber,
                start: DateTime.fromSQL(payload.endDate),
                end: DateTime.fromISO(
                  new Date(each.workStageEnded).toISOString()
                ),
                workStage: each.workStageFromHistory,
                additionalInfo: each.additionalInformation,
                comments: each.commentsFromHistory,
                workCase: "Case 1.6",
              });
            }
          } else {
            context.dispatch("pushToSend", {
              login: payload.login,
              project: payload.project,
              start: DateTime.fromSQL(payload.startDate),
              end: DateTime.fromSQL(payload.endDate),
              workStage: payload.workStage,
              additionalInfo: payload.additionalInfo,
              comments: payload.comments,
              workCase: "Case 1.7",
            });
            // context.dispatch("pushToSend", {
            //   login: payload.login,
            //   project: each.projectIdNumber,
            //   start: DateTime.fromSQL(payload.endDate),
            //   end: DateTime.fromISO(
            //     new Date(each.workStageEnded).toISOString()
            //   ),
            //   workStage: each.workStageFromHistory,
            //   additionalInfo: each.additionalInformation,
            //   comments: each.commentsFromHistory,
            //   workCase: "Case 1.6",
            // });
          }
          return;
        } else if (payload.startDate > each.workStageStarted) {
          // let currentRecord = tables.recordsToModify.find(
          //   (element) => element.workStageStarted < payload.startDate
          // );
          if (payload.endDate < each.workStageEnded) {
            if (payload.update) {
              context.dispatch("pushToSend", {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 2.1",
              });
            } else {
              context.dispatch("pushToSend", {
                login: each.login,
                project: each.projectIdNumber,
                start: DateTime.fromISO(
                  new Date(each.workStageStarted).toISOString()
                ),
                end: DateTime.fromSQL(payload.startDate),
                workStage: each.workStageFromHistory,
                additionalInfo: each.additionalInformation,
                comments: each.commentsFromHistory,
                workCase: "Case 2.2",
              });
              context.dispatch("pushToSend", {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 2.3",
              });
              context.dispatch("pushToSend", {
                login: each.login,
                project: each.projectIdNumber,
                start: DateTime.fromSQL(payload.endDate),
                end: DateTime.fromISO(
                  new Date(each.workStageEnded).toISOString()
                ),
                workStage: each.workStageFromHistory,
                additionalInfo: each.additionalInformation,
                comments: each.commentsFromHistory,
                workCase: "Case 2.4",
              });
            }
          } else if (payload.endDate > each.workStageEnded) {
            let recordEndingLater = tables.recordsToModify.find(
              (element) => element.workStageEnded > payload.endDate
            );

            if (recordEndingLater) {
              if (payload.update) {
                context.dispatch("pushToSend", {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 2.5",
                });
                context.dispatch("pushToSend", {
                  login: recordEndingLater.login,
                  project: recordEndingLater.projectIdNumber,
                  start: DateTime.fromSQL(payload.endDate),
                  end: DateTime.fromISO(
                    new Date(recordEndingLater.workStageEnded).toISOString()
                  ),
                  workStage: recordEndingLater.workStageFromHistory,
                  additionalInfo: recordEndingLater.additionalInformation,
                  comments: recordEndingLater.commentsFromHistory,
                  workCase: "Case 2.6",
                });
              } else {
                context.dispatch("pushToSend", {
                  login: payload.login,
                  project: each.projectIdNumber,
                  start: DateTime.fromISO(
                    new Date(each.workStageStarted).toISOString()
                  ),
                  end: DateTime.fromSQL(payload.startDate),
                  workStage: each.workStageFromHistory,
                  additionalInfo: each.additionalInformation,
                  comments: each.commentsFromHistory,
                  workCase: "Case 2.7",
                });
                context.dispatch("pushToSend", {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 2.8",
                });
                context.dispatch("pushToSend", {
                  login: recordEndingLater.login,
                  project: recordEndingLater.projectIdNumber,
                  start: DateTime.fromSQL(payload.endDate),
                  end: DateTime.fromISO(
                    new Date(recordEndingLater.workStageEnded).toISOString()
                  ),
                  workStage: recordEndingLater.workStageFromHistory,
                  additionalInfo: recordEndingLater.additionalInformation,
                  comments: recordEndingLater.commentsFromHistory,
                  workCase: "Case 2.9",
                });
              }
            } else {
              context.dispatch("pushToSend", {
                login: payload.login,
                project: each.projectIdNumber,
                start: DateTime.fromISO(
                  new Date(each.workStageStarted).toISOString()
                ),
                end: DateTime.fromSQL(payload.startDate),
                workStage: each.workStageFromHistory,
                additionalInfo: each.additionalInformation,
                comments: each.commentsFromHistory,
                workCase: "Case 2.10",
              });
              context.dispatch("pushToSend", {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 2.11",
              });
            }
          } else {
            context.dispatch("pushToSend", {
              login: payload.login,
              project: each.projectIdNumber,
              start: DateTime.fromISO(
                new Date(each.workStageStarted).toISOString()
              ),
              end: DateTime.fromSQL(payload.startDate),
              workStage: each.workStageFromHistory,
              additionalInfo: each.additionalInformation,
              comments: each.commentsFromHistory,
              workCase: "Case 2.12",
            });
            context.dispatch("pushToSend", {
              login: payload.login,
              project: payload.project,
              start: DateTime.fromSQL(payload.startDate),
              end: DateTime.fromSQL(payload.endDate),
              workStage: payload.workStage,
              additionalInfo: payload.additionalInfo,
              comments: payload.comments,
              workCase: "Case 2.13",
            });
          }
          return;
        } else {
          if (payload.endDate < each.workStageEnded) {
            let recordEndingLater = tables.recordsToModify.find(
              (element) => element.workStageEnded > payload.endDate
            );
            if (recordEndingLater) {
              context.dispatch("pushToSend", {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 3.1",
              });
              context.dispatch("pushToSend", {
                login: recordEndingLater.login,
                project: recordEndingLater.projectIdNumber,
                start: DateTime.fromSQL(payload.endDate),
                end: DateTime.fromISO(
                  new Date(recordEndingLater.workStageEnded).toISOString()
                ),
                workStage: recordEndingLater.workStageFromHistory,
                additionalInfo: recordEndingLater.additionalInformation,
                comments: recordEndingLater.commentsFromHistory,
                workCase: "Case 3.2",
              });
            } else {
              context.dispatch("pushToSend", {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 3.3",
              });
            }
          } else {
            context.dispatch("pushToSend", {
              login: payload.login,
              project: payload.project,
              start: DateTime.fromSQL(payload.startDate),
              end: DateTime.fromSQL(payload.endDate),
              workStage: payload.workStage,
              additionalInfo: payload.additionalInfo,
              comments: payload.comments,
              workCase: "Case 3.4",
            });
          }
          return;
        }
      }
    } else {
      context.dispatch("pushToSend", {
        login: payload.login,
        project: payload.project,
        start: DateTime.fromSQL(payload.startDate),
        end: DateTime.fromSQL(payload.endDate),
        workStage: payload.workStage,
        additionalInfo: payload.additionalInfo,
        comments: payload.comments,
        workCase: "Case 0",
      });
      // context.dispatch("calculateWorkStages", {
      //   start: payload.startDate,
      //   end: payload.endDate,
      //   recordWithTheSameStartTime,
      //   recordWithTheSameEndTime,
      //   workStage: payload.workStage,
      //   additionalInfo: payload.additionalInfo,
      //   login: payload.login,
      //   project: payload.project,
      //   comments: payload.comments,
      // });
      // this.calculateWorkStagesTime(
      //   payload.startDate,
      //   payload.endDate,
      //   recordWithTheSameStartTime,
      //   recordWithTheSameEndTime,
      //   payload.workStage,
      //   payload.additionalInfo,
      //   payload.login,
      //   payload.project,
      //   payload.comments
      // );
    }
  },
};
