
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
    let recordWithTheSameStartTime = tables.existingRecords.find(
      (element) => element.workStageEnded == payload.startDate
    );
    let recordWithTheSameEndTime = tables.existingRecords.find(
      (element) => element.workStageStarted == payload.endDate
    );

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
              if (recordWithTheSameStartTime) {
                if (
                  recordWithTheSameStartTime.workStageFromHistory ==
                  payload.workStage &&
                  recordEndingLater.workStageFromHistory == payload.workStage
                ) {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromISO(
                      new Date(
                        recordWithTheSameStartTime.workStageStarted
                      ).toISOString()
                    ),
                    end: DateTime.fromISO(
                      new Date(recordEndingLater.workStageEnded).toISOString()
                    ),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 1.1.1"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromISO(
                  //     new Date(
                  //       recordWithTheSameStartTime.workStageStarted
                  //     ).toISOString()
                  //   ),
                  //   DateTime.fromISO(
                  //     new Date(recordEndingLater.workStageEnded).toISOString()
                  //   ),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 1.1.1"
                  // );
                } else if (
                  recordWithTheSameStartTime.workStageFromHistory == payload.workStage
                ) {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromISO(
                      new Date(
                        recordWithTheSameStartTime.workStageStarted
                      ).toISOString()
                    ),
                    end: DateTime.fromSQL(payload.endDate),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 1.1.2"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromISO(
                  //     new Date(
                  //       recordWithTheSameStartTime.workStageStarted
                  //     ).toISOString()
                  //   ),
                  //   DateTime.fromSQL(payload.endDate),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 1.1.2"
                  // );
                  context.dispatch('pushToSend', {
                    logi: payload.login,
                    project: recordEndingLater.projectIdNumber,
                    start: DateTime.fromSQL(payload.endDate),
                    end: DateTime.fromISO(
                      new Date(recordEndingLater.workStageEnded).toISOString()
                    ),
                    workStage: recordEndingLater.workStageFromHistory,
                    additionalInfo: recordEndingLater.additionalInformation,
                    comments: recordEndingLater.commentsFromHistory,
                    workCase: "Case 1.1.2.1"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   recordEndingLater.projectIdNumber,
                  //   DateTime.fromSQL(payload.endDate),
                  //   DateTime.fromISO(
                  //     new Date(recordEndingLater.workStageEnded).toISOString()
                  //   ),
                  //   recordEndingLater.workStageFromHistory,
                  //   recordEndingLater.additionalInformation,
                  //   recordEndingLater.commentsFromHistory,
                  //   "Case 1.1.2.1"
                  // );
                } else {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.startDate),
                    end: DateTime.fromSQL(payload.endDate),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 1.1.3"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.startDate),
                  //   DateTime.fromSQL(payload.endDate),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 1.1.3"
                  // );
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.endDate),
                    end: DateTime.fromISO(
                      new Date(recordEndingLater.workStageEnded).toISOString()
                    ),
                    workStage: recordEndingLater.workStageFromHistory,
                    additionalInfo: recordEndingLater.additionalInformation,
                    comments: recordEndingLater.commentsFromHistory,
                    workCase: "Case 1.1.4"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.endDate),
                  //   DateTime.fromISO(
                  //     new Date(recordEndingLater.workStageEnded).toISOString()
                  //   ),
                  //   recordEndingLater.workStageFromHistory,
                  //   recordEndingLater.additionalInformation,
                  //   recordEndingLater.commentsFromHistory,
                  //   "Case 1.1.4"
                  // );
                }
              } else {
                if (recordEndingLater.workStageFromHistory == payload.workStage) {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.startDate),
                    end: DateTime.fromISO(
                      new Date(recordEndingLater.workStageEnded).toISOString()
                    ),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 1.1.5"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.startDate),
                  //   DateTime.fromISO(
                  //     new Date(recordEndingLater.workStageEnded).toISOString()
                  //   ),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 1.1.5"
                  // );
                } else {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.startDate),
                    end: DateTime.fromSQL(payload.endDate),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 1.1.6"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.startDate),
                  //   DateTime.fromSQL(payload.endDate),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 1.1.6"
                  // );
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.endDate),
                    end: DateTime.fromISO(
                      new Date(recordEndingLater.workStageEnded).toISOString()
                    ),
                    workStage: recordEndingLater.workStageFromHistory,
                    additionalInfo: recordEndingLater.additionalInformation,
                    comments: recordEndingLater.commentsFromHistory,
                    workCase: "Case 1.1.7"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.endDate),
                  //   DateTime.fromISO(
                  //     new Date(recordEndingLater.workStageEnded).toISOString()
                  //   ),
                  //   recordEndingLater.workStageFromHistory,
                  //   recordEndingLater.additionalInformation,
                  //   recordEndingLater.commentsFromHistory,
                  //   "Case 1.1.7"
                  // );
                }
              }
            } else if (recordWithTheSameEndTime) {
              if (
                recordWithTheSameEndTime.workStageFromHistory == payload.workStage
              ) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromISO(
                    new Date(
                      recordWithTheSameEndTime.workStageEnded
                    ).toISOString()
                  ),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 1.2.1"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromISO(
                //     new Date(
                //       recordWithTheSameEndTime.workStageEnded
                //     ).toISOString()
                //   ),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 1.2.1"
                // );
                tables.recordsToDelete.push(
                  recordWithTheSameEndTime.workStageIdNumber
                );
              } else {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 1.2.2"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 1.2.2"
                // );
              }
              // tables.recordsToDelete.push(each);
            } else {
              if (recordWithTheSameStartTime) {
                if (
                  recordWithTheSameStartTime.workStageFromHistory == payload.workStage
                ) {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromISO(
                      new Date(
                        recordWithTheSameStartTime.workStageStarted
                      ).toISOString()
                    ),
                    end: DateTime.fromSQL(payload.endDate),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 1.3.1"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromISO(
                  //     new Date(
                  //       recordWithTheSameStartTime.workStageStarted
                  //     ).toISOString()
                  //   ),
                  //   DateTime.fromSQL(payload.endDate),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 1.3.1"
                  // );
                } else {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.startDate),
                    end: DateTime.fromSQL(payload.endDate),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 1.3.2"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.startDate),
                  //   DateTime.fromSQL(payload.endDate),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 1.3.2"
                  // );
                }
              } else {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 1.3.3"

                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 1.3.3"
                // );
              }
            }
          } else {
            if (recordWithTheSameEndTime && recordWithTheSameStartTime) {
              if (
                recordWithTheSameEndTime.workStageFromHistory == payload.workStage &&
                recordWithTheSameStartTime.workStageFromHistory == payload.workStage
              ) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromISO(
                    new Date(
                      recordWithTheSameStartTime.workStageStarted
                    ).toISOString()
                  ),
                  end: DateTime.fromISO(
                    new Date(
                      recordWithTheSameEndTime.workStageEnded
                    ).toISOString()
                  ),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 1.4.1"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromISO(
                //     new Date(
                //       recordWithTheSameStartTime.workStageStarted
                //     ).toISOString()
                //   ),
                //   DateTime.fromISO(
                //     new Date(
                //       recordWithTheSameEndTime.workStageEnded
                //     ).toISOString()
                //   ),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 1.4.1"
                // );
                tables.recordsToDelete.push(
                  recordWithTheSameStartTime.workStageIdNumber
                );
                tables.recordsToDelete.push(
                  recordWithTheSameEndTime.workStageIdNumber
                );
              } else if (
                recordWithTheSameStartTime.workStageFromHistory == payload.workStage
              ) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromISO(
                    new Date(
                      recordWithTheSameStartTime.workStageStarted
                    ).toISOString()
                  ),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 1.4.2"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromISO(
                //     new Date(
                //       recordWithTheSameStartTime.workStageStarted
                //     ).toISOString()
                //   ),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 1.4.2"
                // );
              } else if (
                recordWithTheSameEndTime.workStageFromHistory == payload.workStage
              ) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromISO(
                    new Date(
                      recordWithTheSameEndTime.workStageEnded
                    ).toISOString()
                  ),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 1.4.3"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromISO(
                //     new Date(
                //       recordWithTheSameEndTime.workStageEnded
                //     ).toISOString()
                //   ),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 1.4.3"
                // );
              } else {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 1.4.4"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 1.4.4"
                // );
              }
            } else if (recordWithTheSameStartTime) {
              if (
                recordWithTheSameStartTime.workStageFromHistory == payload.workStage
              ) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromISO(
                    new Date(
                      recordWithTheSameStartTime.workStageStarted
                    ).toISOString()
                  ),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 1.4.5"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromISO(
                //     new Date(
                //       recordWithTheSameStartTime.workStageStarted
                //     ).toISOString()
                //   ),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 1.4.5"
                // );
              } else {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 1.4.6"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 1.4.6"
                // );
              }
            } else {
              context.dispatch('pushToSend', {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 1.4.7"
              })
              // this.pushToSend(
              //   payload.login,
              //   project,
              //   DateTime.fromSQL(payload.startDate),
              //   DateTime.fromSQL(payload.endDate),
              //   workStage,
              //   additionalInfo,
              //   comments,
              //   "Case 1.4.7"
              // );
            }
          }
          return;
        } else if (payload.startDate > each.workStageStarted) {
          let currentRecord = tables.recordsToModify.find(
            (element) => element.workStageStarted < payload.startDate
          );
          if (payload.endDate < each.workStageEnded) {
            if (each.workStageFromHistory == payload.workStage) {
              context.dispatch('pushToSend', {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 2.1.1"
              });
              // this.pushToSend(
              //   payload.login,
              //   project,
              //   DateTime.fromSQL(payload.startDate),
              //   DateTime.fromSQL(payload.endDate),
              //   workStage,
              //   additionalInfo,
              //   comments,
              //   "Case 2.1.1"
              // );
              // tables.recordsToDelete.push(each);
            } else {
              context.dispatch('pushToSend', {
                login: each.login,
                project: each.projectIdNumber,
                start: DateTime.fromISO(
                  new Date(each.workStageStarted).toISOString()
                ),
                end: DateTime.fromSQL(payload.startDate),
                workStage: each.workStageFromHistory,
                additionalInfo: each.additionalInformation,
                comments: each.commentsFromHistory,
                workCase: "Case 2.1.2"
              })
              // this.pushToSend(
              //   each.login,
              //   each.projectIdNumber,
              //   DateTime.fromISO(
              //     new Date(each.workStageStarted).toISOString()
              //   ),
              //   DateTime.fromSQL(payload.startDate),
              //   each.workStageFromHistory,
              //   each.additionalInformation,
              //   each.commentsFromHistory,
              //   "Case 2.1.2"
              // );
              context.dispatch('pushToSend', {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 2.1.3"
              })
              // this.pushToSend(
              //   payload.login,
              //   project,
              //   DateTime.fromSQL(payload.startDate),
              //   DateTime.fromSQL(payload.endDate),
              //   workStage,
              //   additionalInfo,
              //   comments,
              //   "Case 2.1.3"
              // );
              context.dispatch('pushToSend', {
                login: each.login,
                project: each.projectIdNumber,
                start: DateTime.fromSQL(payload.endDate),
                end: DateTime.fromISO(new Date(each.workStageEnded).toISOString()),
                workStage: each.workStageFromHistory,
                additionalInfo: each.additionalInformation,
                comments: each.commentsFromHistory,
                workCase: "Case 2.1.4"
              })
              // this.pushToSend(
              //   each.login,
              //   each.projectIdNumber,
              //   DateTime.fromSQL(payload.endDate),
              //   DateTime.fromISO(new Date(each.workStageEnded).toISOString()),
              //   each.workStageFromHistory,
              //   each.additionalInformation,
              //   each.commentsFromHistory,
              //   "Case 2.1.4"
              // );
            }
          } else if (payload.endDate > each.workStageEnded) {
            let recordEndingLater = tables.recordsToModify.find(
              (element) => element.workStageEnded > payload.endDate
            );

            if (recordEndingLater) {
              if (
                currentRecord.workStageFromHistory == payload.workStage &&
                recordEndingLater.workStageFromHistory == payload.workStage
              ) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromISO(
                    new Date(currentRecord.workStageStarted).toISOString()
                  ),
                  end: DateTime.fromISO(
                    new Date(recordEndingLater.workStageEnded).toISOString()
                  ),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 2.2.1"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromISO(
                //     new Date(currentRecord.workStageStarted).toISOString()
                //   ),
                //   DateTime.fromISO(
                //     new Date(recordEndingLater.workStageEnded).toISOString()
                //   ),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 2.2.1"
                // );
              } else if (currentRecord.workStageFromHistory == payload.workStage) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromISO(
                    new Date(currentRecord.workStageStarted).toISOString()
                  ),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 2.2.2"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromISO(
                //     new Date(currentRecord.workStageStarted).toISOString()
                //   ),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 2.2.2"
                // );
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: recordEndingLater.projectIdNumber,
                  start: DateTime.fromSQL(payload.endDate),
                  end: DateTime.fromISO(
                    new Date(recordEndingLater.workStageEnded).toISOString()
                  ),
                  workStage: recordEndingLater.workStageFromHistory,
                  additionalInfo: recordEndingLater.additionalInformation,
                  comments: recordEndingLater.commentsFromHistory,
                  workCase: "Case 2.2.3"
                })
                // this.pushToSend(
                //   payload.login,
                //   recordEndingLater.projectIdNumber,
                //   DateTime.fromSQL(payload.endDate),
                //   DateTime.fromISO(
                //     new Date(recordEndingLater.workStageEnded).toISOString()
                //   ),
                //   recordEndingLater.workStageFromHistory,
                //   recordEndingLater.additionalInformation,
                //   recordEndingLater.commentsFromHistory,
                //   "Case 2.2.3"
                // );
              } else if (
                recordEndingLater.workStageFromHistory == payload.workStage
              ) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromISO(
                    new Date(currentRecord.workStageStarted).toISOString()
                  ),
                  end: DateTime.fromSQL(payload.startDate),
                  workStage: currentRecord.workStageFromHistory,
                  additionalInfo: currentRecord.additionalInformation,
                  comments: currentRecord.commentsFromHistory,
                  workCase: "Case 2.2.4"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromISO(
                //     new Date(currentRecord.workStageStarted).toISOString()
                //   ),
                //   DateTime.fromSQL(payload.startDate),
                //   currentRecord.workStageFromHistory,
                //   currentRecord.additionalInformation,
                //   currentRecord.commentsFromHistory,
                //   "Case 2.2.4"
                // );
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromISO(
                    new Date(recordEndingLater.workStageEnded).toISOString()
                  ),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 2.2.5"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromISO(
                //     new Date(recordEndingLater.workStageEnded).toISOString()
                //   ),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 2.2.5"
                // );
              } else {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromISO(
                    new Date(currentRecord.workStageStarted).toISOString()
                  ),
                  end: DateTime.fromSQL(payload.startDate),
                  workStage: currentRecord.workStageFromHistory,
                  additionalInfo: currentRecord.additionalInformation,
                  comments: currentRecord.commentsFromHistory,
                  workCase: "Case 2.2.6"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromISO(
                //     new Date(currentRecord.workStageStarted).toISOString()
                //   ),
                //   DateTime.fromSQL(payload.startDate),
                //   currentRecord.workStageFromHistory,
                //   currentRecord.additionalInformation,
                //   currentRecord.commentsFromHistory,
                //   "Case 2.2.6"
                // );
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 2.2.7"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 2.2.7"
                // );
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: recordEndingLater.projectIdNumber,
                  start: DateTime.fromSQL(payload.endDate),
                  end: DateTime.fromISO(
                    new Date(recordEndingLater.workStageEnded).toISOString()
                  ),
                  workStage: recordEndingLater.workStageFromHistory,
                  additionalInfo: recordEndingLater.additionalInformation,
                  comments: recordEndingLater.commentsFromHistory,
                  workCase: "Case 2.2.8"
                })
                // this.pushToSend(
                //   payload.login,
                //   recordEndingLater.projectIdNumber,
                //   DateTime.fromSQL(payload.endDate),
                //   DateTime.fromISO(
                //     new Date(recordEndingLater.workStageEnded).toISOString()
                //   ),
                //   recordEndingLater.workStageFromHistory,
                //   recordEndingLater.additionalInformation,
                //   recordEndingLater.commentsFromHistory,
                //   "Case 2.2.8"
                // );
              }
            } else {
              if (recordWithTheSameEndTime) {
                if (
                  recordWithTheSameEndTime.workStageFromHistory == payload.workStage
                ) {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromISO(
                      new Date(currentRecord.workStageStarted).toISOString()
                    ),
                    end: DateTime.fromSQL(payload.startDate),
                    workStage: currentRecord.workStageFromHistory,
                    additionalInfo: currentRecord.additionalInformation,
                    comments: currentRecord.commentsFromHistory,
                    workCase: "Case 2.2.9"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromISO(
                  //     new Date(currentRecord.workStageStarted).toISOString()
                  //   ),
                  //   DateTime.fromSQL(payload.startDate),
                  //   currentRecord.workStageFromHistory,
                  //   currentRecord.additionalInformation,
                  //   currentRecord.commentsFromHistory,
                  //   "Case 2.2.9"
                  // );
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.startDate),
                    end: DateTime.fromISO(
                      new Date(
                        recordWithTheSameEndTime.workStageEnded
                      ).toISOString()
                    ),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 2.2.10"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.startDate),
                  //   DateTime.fromISO(
                  //     new Date(
                  //       recordWithTheSameEndTime.workStageEnded
                  //     ).toISOString()
                  //   ),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 2.2.10"
                  // );
                } else {
                  if (currentRecord.workStageFromHistory == payload.workStage) {
                    context.dispatch('pushToSend', {
                      login: payload.login,
                      project: payload.project,
                      start: DateTime.fromISO(
                        new Date(currentRecord.workStageStarted).toISOString()
                      ),
                      end: DateTime.fromSQL(payload.endDate),
                      workStage: payload.workStage,
                      additionalInfo: payload.additionalInfo,
                      comments: payload.comments,
                      workCase: "Case 2.2.11"
                    })
                    // this.pushToSend(
                    //   payload.login,
                    //   project,
                    //   DateTime.fromISO(
                    //     new Date(currentRecord.workStageStarted).toISOString()
                    //   ),
                    //   DateTime.fromSQL(payload.endDate),
                    //   workStage,
                    //   additionalInfo,
                    //   comments,
                    //   "Case 2.2.11"
                    // );
                  } else {
                    context.dispatch('pushToSend', {
                      login: payload.login,
                      project: payload.project,
                      start: DateTime.fromISO(
                        new Date(currentRecord.workStageStarted).toISOString()
                      ),
                      end: DateTime.fromSQL(payload.startDate),
                      workStage: currentRecord.workStageFromHistory,
                      additionalInfo: currentRecord.additionalInformation,
                      comments: currentRecord.commentsFromHistory,
                      workCase: "Case 2.2.12"
                    })
                    // this.pushToSend(
                    //   payload.login,
                    //   project,
                    //   DateTime.fromISO(
                    //     new Date(currentRecord.workStageStarted).toISOString()
                    //   ),
                    //   DateTime.fromSQL(payload.startDate),
                    //   currentRecord.workStageFromHistory,
                    //   currentRecord.additionalInformation,
                    //   currentRecord.commentsFromHistory,
                    //   "Case 2.2.12"
                    // );
                    context.dispatch('pushToSend', {
                      login: payload.login,
                      project: payload.project,
                      start: DateTime.fromSQL(payload.startDate),
                      end: DateTime.fromSQL(payload.endDate),
                      workStage: payload.workStage,
                      additionalInfo: payload.additionalInfo,
                      comments: payload.comments,
                      workCase: "Case 2.2.13"
                    })
                    // this.pushToSend(
                    //   payload.login,
                    //   project,
                    //   DateTime.fromSQL(payload.startDate),
                    //   DateTime.fromSQL(payload.endDate),
                    //   workStage,
                    //   additionalInfo,
                    //   comments,
                    //   "Case 2.2.13"
                    // );
                  }
                }
              } else {
                if (currentRecord.workStageFromHistory == payload.workStage) {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromISO(
                      new Date(currentRecord.workStageStarted).toISOString()
                    ),
                    end: DateTime.fromSQL(payload.endDate),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 2.2.14"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromISO(
                  //     new Date(currentRecord.workStageStarted).toISOString()
                  //   ),
                  //   DateTime.fromSQL(payload.endDate),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 2.2.14"
                  // );
                } else {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromISO(
                      new Date(currentRecord.workStageStarted).toISOString()
                    ),
                    end: DateTime.fromSQL(payload.startDate),
                    workStage: currentRecord.workStageFromHistory,
                    additionalInfo: currentRecord.additionalInformation,
                    comments: currentRecord.commentsFromHistory,
                    workCase: "Case 2.2.15"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromISO(
                  //     new Date(currentRecord.workStageStarted).toISOString()
                  //   ),
                  //   DateTime.fromSQL(payload.startDate),
                  //   currentRecord.workStageFromHistory,
                  //   currentRecord.additionalInformation,
                  //   currentRecord.commentsFromHistory,
                  //   "Case 2.2.15"
                  // );
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.startDate),
                    end: DateTime.fromSQL(payload.endDate),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 2.2.16"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.startDate),
                  //   DateTime.fromSQL(payload.endDate),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 2.2.16"
                  // );
                }
              }
            }
          } else {
            if (recordWithTheSameEndTime) {
              if (
                recordWithTheSameEndTime.workStageFromHistory == payload.workStage
              ) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromISO(
                    new Date(currentRecord.workStageStarted).toISOString()
                  ),
                  end: DateTime.fromSQL(payload.startDate),
                  workStage: currentRecord.workStageFromHistory,
                  additionalInfo: currentRecord.additionalInformation,
                  comments: currentRecord.commentsFromHistory,
                  workCase: "Case 2.3.1"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromISO(
                //     new Date(currentRecord.workStageStarted).toISOString()
                //   ),
                //   DateTime.fromSQL(payload.startDate),
                //   currentRecord.workStageFromHistory,
                //   currentRecord.additionalInformation,
                //   currentRecord.commentsFromHistory,
                //   "Case 2.3.1"
                // );
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromISO(
                    new Date(
                      recordWithTheSameEndTime.workStageEnded
                    ).toISOString()
                  ),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 2.3.2"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromISO(
                //     new Date(
                //       recordWithTheSameEndTime.workStageEnded
                //     ).toISOString()
                //   ),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 2.3.2"
                // );
              } else {
                if (currentRecord.workStageFromHistory == payload.workStage) {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.startDate),
                    end: DateTime.fromSQL(payload.endDate),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 2.3.3"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.startDate),
                  //   DateTime.fromSQL(payload.endDate),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 2.3.3"
                  // );
                } else {
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromISO(
                      new Date(currentRecord.workStageStarted).toISOString()
                    ),
                    end: DateTime.fromSQL(payload.startDate),
                    workStage: currentRecord.workStageFromHistory,
                    additionalInfo: currentRecord.additionalInformation,
                    comments: currentRecord.commentsFromHistory,
                    workCase: "Case 2.3.4"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromISO(
                  //     new Date(currentRecord.workStageStarted).toISOString()
                  //   ),
                  //   DateTime.fromSQL(payload.startDate),
                  //   currentRecord.workStageFromHistory,
                  //   currentRecord.additionalInformation,
                  //   currentRecord.commentsFromHistory,
                  //   "Case 2.3.4"
                  // );
                  context.dispatch('pushToSend', {
                    login: payload.login,
                    project: payload.project,
                    start: DateTime.fromSQL(payload.startDate),
                    end: DateTime.fromSQL(payload.endDate),
                    workStage: payload.workStage,
                    additionalInfo: payload.additionalInfo,
                    comments: payload.comments,
                    workCase: "Case 2.3.5"
                  })
                  // this.pushToSend(
                  //   payload.login,
                  //   project,
                  //   DateTime.fromSQL(payload.startDate),
                  //   DateTime.fromSQL(payload.endDate),
                  //   workStage,
                  //   additionalInfo,
                  //   comments,
                  //   "Case 2.3.5"
                  // );
                }
              }
            } else {
              context.dispatch('pushToSend', {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromSQL(payload.endDate),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 2.3.6"
              })
              // this.pushToSend(
              //   payload.login,
              //   project,
              //   DateTime.fromSQL(payload.startDate),
              //   DateTime.fromSQL(payload.endDate),
              //   workStage,
              //   additionalInfo,
              //   comments,
              //   "Case 2.3.6"
              // );
            }
          }
          return;
        } else {
          if (payload.endDate < each.workStageEnded) {
            let recordEndingLater = tables.recordsToModify.find(
              (element) => element.workStageEnded > payload.endDate
            );
            if (recordEndingLater) {
              if (recordEndingLater.workStageFromHistory == payload.workStage) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromISO(
                    new Date(recordEndingLater.workStageEnded).toISOString()
                  ),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 3.1.1"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromISO(
                //     new Date(recordEndingLater.workStageEnded).toISOString()
                //   ),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 3.1.1"
                // );
              } else {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 3.1.2"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 3.1.2"
                // );
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: recordEndingLater.projectIdNumber,
                  start: DateTime.fromSQL(payload.endDate),
                  end: DateTime.fromISO(
                    new Date(recordEndingLater.workStageEnded).toISOString()
                  ),
                  workStage: recordEndingLater.workStageFromHistory,
                  additionalInfo: recordEndingLater.additionalInformation,
                  comments: recordEndingLater.commentsFromHistory,
                  workCase: "Case 3.1.3"
                })
                // this.pushToSend(
                //   payload.login,
                //   recordEndingLater.projectIdNumber,
                //   DateTime.fromSQL(payload.endDate),
                //   DateTime.fromISO(
                //     new Date(recordEndingLater.workStageEnded).toISOString()
                //   ),
                //   recordEndingLater.workStageFromHistory,
                //   recordEndingLater.additionalInformation,
                //   recordEndingLater.commentsFromHistory,
                //   "Case 3.1.3"
                // );
              }
            } else {
              context.dispatch('pushToSend', {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromISO(new Date(each.workStageEnded).toISOString()),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 3.1.4"
              })
              // this.pushToSend(
              //   payload.login,
              //   project,
              //   DateTime.fromSQL(payload.startDate),
              //   DateTime.fromISO(new Date(each.workStageEnded).toISOString()),
              //   workStage,
              //   additionalInfo,
              //   comments,
              //   "Case 3.1.4"
              // );
            }
          } else {
            if (recordWithTheSameEndTime) {
              if (
                recordWithTheSameEndTime.workStageFromHistory == payload.workStage
              ) {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromISO(
                    new Date(
                      recordWithTheSameEndTime.workStageEnded
                    ).toISOString()
                  ),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 3.2.1"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromISO(
                //     new Date(
                //       recordWithTheSameEndTime.workStageEnded
                //     ).toISOString()
                //   ),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 3.2.1"
                // );
                tables.recordsToDelete.push(
                  recordWithTheSameEndTime.workStageIdNumber
                );
              } else {
                context.dispatch('pushToSend', {
                  login: payload.login,
                  project: payload.project,
                  start: DateTime.fromSQL(payload.startDate),
                  end: DateTime.fromSQL(payload.endDate),
                  workStage: payload.workStage,
                  additionalInfo: payload.additionalInfo,
                  comments: payload.comments,
                  workCase: "Case 3.2.2"
                })
                // this.pushToSend(
                //   payload.login,
                //   project,
                //   DateTime.fromSQL(payload.startDate),
                //   DateTime.fromSQL(payload.endDate),
                //   workStage,
                //   additionalInfo,
                //   comments,
                //   "Case 3.2.2"
                // );
              }
            } else {
              context.dispatch('pushToSend', {
                login: payload.login,
                project: payload.project,
                start: DateTime.fromSQL(payload.startDate),
                end: DateTime.fromISO(new Date(each.workStageEnded).toISOString()),
                workStage: payload.workStage,
                additionalInfo: payload.additionalInfo,
                comments: payload.comments,
                workCase: "Case 3.3"
              })
              // this.pushToSend(
              //   payload.login,
              //   project,
              //   DateTime.fromSQL(payload.startDate),
              //   DateTime.fromISO(new Date(each.workStageEnded).toISOString()),
              //   workStage,
              //   additionalInfo,
              //   comments,
              //   "Case 3.3"
              // );
            }
          }
          return;
        }
      }
    } else {
      context.dispatch('calculateWorkStages', {
        start: payload.startDate,
        end: payload.endDate,
        recordWithTheSameStartTime,
        recordWithTheSameEndTime,
        workStage: payload.workStage,
        additionalInfo: payload.additionalInfo,
        login: payload.login,
        project: payload.project,
        comments: payload.comments
      })
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
  }
}