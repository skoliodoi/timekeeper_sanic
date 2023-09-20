const { Duration } = require("luxon");
const { DateTime } = require("luxon");

const _ = require("lodash");

export default {
  //getters for the timetables
  workAndBrakeState(state) {
    let formattedTimeTable;
    for (const each of state.timeTable) {
      let durationDivided = Duration.fromObject({
        milliseconds: each.workStageDuration,
      }).shiftTo("hours", "minutes", "seconds");

      each.displayStageDuration = {
        hours: durationDivided.hours,
        minutes: durationDivided.minutes,
        seconds: durationDivided.seconds,
      };

      if (each.displayStageDuration.seconds < 10) {
        each.displayStageDuration.seconds = `0${Math.floor(
          each.displayStageDuration.seconds
        )}`;
      } else {
        each.displayStageDuration.seconds = `${Math.floor(
          each.displayStageDuration.seconds
        )}`;
      }

      if (each.displayStageDuration.minutes < 10) {
        each.displayStageDuration.minutes = `0${Math.floor(
          each.displayStageDuration.minutes
        )}`;
      } else {
        each.displayStageDuration.minutes = `${Math.floor(
          each.displayStageDuration.minutes
        )}`;
      }

      if (each.displayStageDuration.hours < 10) {
        each.displayStageDuration.hours = `0${Math.floor(
          each.displayStageDuration.hours
        )}`;
      } else {
        each.displayStageDuration.hours = `${Math.floor(
          each.displayStageDuration.hours
        )}`;
      }
      each.startTime = DateTime.fromSQL(each.workStageStarted).toFormat("T");
      each.stopTime = DateTime.fromSQL(each.workStageEnded).toFormat("T");
      each.startDate = each.workStageStarted;
      // let formatStartTime = new Date(DateTime.fromSQL(each.workStageStarted).setLocale('pl').toISO());
      // each.startDateFormatted = formatStartTime;
      // console.log(formatStartTime)
      each.endDate = each.workStageEnded;
      each.displayDate = DateTime.fromSQL(each.workStageEnded).toFormat(
        "yyyy-MM-dd"
      );
    }
    formattedTimeTable = state.timeTable;
    return formattedTimeTable;
  },

  condensedProjectList(state) {
    const newList = state.projects.list.filter((value, index, self) => {
      index === self.findIndex((t) => t.campaign_id === value.campaign_id);
    });
    const newerList = _.mapValues(state.projects.list, (o) =>
      _.groupBy(o, (o) => o.campaign_id)
    );
    console.log(newerList);
    return newList;
  },

  groupHistoryByProject(state) {
    const obj = state.historyByProject;
    const groupByProjectId = _.groupBy(obj, (o) => o.campaign_id);
    const groupByDate = _.mapValues(groupByProjectId, (val) =>
      _.groupBy(val, (val) => val.full_date)
    );
    const groupByUserId = _.mapValues(groupByDate, (groupedDate) => {
      return _.mapValues(groupedDate, (date) =>
        _.groupBy(date, (d) => d.full_name)
      );
    });
    return groupByUserId;
  },

  groupUsersAndTheirProjects(state) {
    const obj = state.projects.list;
    const sortUsersAndProjects = obj.map((el) => ({
      [el.login]: {
        projects: [{ name: el.campaign_name, id: el.campaign_id }],
      },
    }));
    const reduceElements = sortUsersAndProjects.reduce((acc, el) => {
      const key = Object.keys(el)[0];
      if (acc[key]) {
        acc[key].projects.push(...el[key].projects);
      } else {
        acc[key] = el[key];
      }
      return acc;
    }, {});
    return reduceElements;
  },
  selectableProjects(state) {
    const projectsList = [];
    for (const client of state.projects.list) {
      for (const project of client.projects) {
        projectsList.push({ name: project.name, code: project.project_code });
      }
    }
    projectsList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return projectsList;
  },


  // selectableProjects(state, getters) {
  //   const projectList = [];
  //   const selectableProjects = [];
  //   const myProjects = state.projects.list;
  //   const userProjects = getters.groupUsersAndTheirProjects;
  //   for (const project of myProjects) {
  //     projectList.push(project.campaign_id);
  //   }
  //   for (const each in userProjects) {
  //     if (each == state.selectForTimeAddition.user) {
  //       for (const project of userProjects[each].projects) {
  //         if (projectList.includes(project.id)) {
  //           selectableProjects.push(project);
  //         }
  //       }
  //     }
  //   }
  //   const removeDuplicates = selectableProjects.filter(
  //     (value, index, self) =>
  //       index === self.findIndex((project) => project.id === value.id)
  //   );
  //   const filteredProjects = removeDuplicates.map((element) => {
  //     return {
  //       name: element.name,
  //       id: element.id,
  //     };
  //   });
  //   return filteredProjects;
  // },

  groupedProjects(state) {
    function groupBy(
      arr,
      name,
      id,
      start,
      finish,
      project_owner,
      koordynator,
      user_name,
      user_last_name,
      login
    ) {
      return arr.reduce(function (acc, obj) {
        let key = obj[name];
        if (!acc[key] && obj[id]) {
          acc[key] = {
            campaign_id: obj[id],
            starting_hours: obj[start],
            ending_hours: obj[finish],
            owners: [],
            coordinators: [],
            users: [],
          };
        }
        if (obj[login] && obj[id]) {
          if (obj[project_owner]) {
            acc[key].owners.push({
              name: obj[user_name],
              last_name: obj[user_last_name],
              login: obj[login],
            });
          } else if (obj[koordynator]) {
            acc[key].coordinators.push({
              name: obj[user_name],
              last_name: obj[user_last_name],
              login: obj[login],
            });
          } else {
            acc[key].users.push({
              name: obj[user_name],
              last_name: obj[user_last_name],
              login: obj[login],
            });
          }
        }

        return acc;
      }, {});
    }
    let groupedTable = groupBy(
      state.projects.list,
      "campaign_name",
      "campaign_id",
      "starting_hours",
      "ending_hours",
      "project_owner",
      "koordynator",
      "name",
      "last_name",
      "login"
    );
    return groupedTable;
  },

  //getters for the timer presenting worktime
  showCurrentSeconds(state) {
    if (state.timeDifference.current.seconds.toString().length < 2) {
      return `0${state.timeDifference.current.seconds}`;
    } else {
      return state.timeDifference.current.seconds;
    }
  },
  showCurrentMinutes(state) {
    if (state.timeDifference.current.minutes.toString().length < 2) {
      return `0${state.timeDifference.current.minutes}`;
    } else {
      return state.timeDifference.current.minutes;
    }
  },
  showCurrentHours(state) {
    if (state.timeDifference.current.hours.toString().length < 2) {
      return `0${state.timeDifference.current.hours}`;
    } else {
      return state.timeDifference.current.hours;
    }
  },
  showWorkSeconds(state) {
    if (state.timeDifference.work.seconds.toString().length < 2) {
      return `0${state.timeDifference.work.seconds}`;
    } else {
      return state.timeDifference.work.seconds;
    }
  },
  showWorkMinutes(state) {
    if (state.timeDifference.work.minutes.toString().length < 2) {
      return `0${state.timeDifference.work.minutes}`;
    } else {
      return state.timeDifference.work.minutes;
    }
  },
  showWorkHours(state) {
    if (state.timeDifference.work.hours.toString().length < 2) {
      return `0${state.timeDifference.work.hours}`;
    } else {
      return state.timeDifference.work.hours;
    }
  },
  showBreakSeconds(state) {
    if (state.timeDifference.break.seconds.toString().length < 2) {
      return `0${state.timeDifference.break.seconds}`;
    } else {
      return state.timeDifference.break.seconds;
    }
  },
  showBreakMinutes(state) {
    if (state.timeDifference.break.minutes.toString().length < 2) {
      return `0${state.timeDifference.break.minutes}`;
    } else {
      return state.timeDifference.break.minutes;
    }
  },
  showBreakHours(state) {
    if (state.timeDifference.break.hours.toString().length < 2) {
      return `0${state.timeDifference.break.hours}`;
    } else {
      return state.timeDifference.break.hours;
    }
  },
  showOtherSeconds(state) {
    if (state.timeDifference.other.seconds.toString().length < 2) {
      return `0${state.timeDifference.other.seconds}`;
    } else {
      return state.timeDifference.other.seconds;
    }
  },
  showOtherMinutes(state) {
    if (state.timeDifference.other.minutes.toString().length < 2) {
      return `0${state.timeDifference.other.minutes}`;
    } else {
      return state.timeDifference.other.minutes;
    }
  },
  showOtherHours(state) {
    if (state.timeDifference.other.hours.toString().length < 2) {
      return `0${state.timeDifference.other.hours}`;
    } else {
      return state.timeDifference.other.hours;
    }
  },
  showTotalSeconds(state) {
    if (state.timeDifference.total.seconds.toString().length < 2) {
      return `0${state.timeDifference.total.seconds}`;
    } else {
      return state.timeDifference.total.seconds;
    }
  },
  showTotalMinutes(state) {
    if (state.timeDifference.total.minutes.toString().length < 2) {
      return `0${state.timeDifference.total.minutes}`;
    } else {
      return state.timeDifference.total.minutes;
    }
  },
  showTotalHours(state) {
    if (state.timeDifference.total.hours.toString().length < 2) {
      return `0${state.timeDifference.total.hours}`;
    } else {
      return state.timeDifference.total.hours;
    }
  },
  // showTotalTest(state) {
  //   let newObj = {};
  //   for (const each in state.timeDifference) {
  //     newObj["seconds"] = state.timeDifference[each];
  //   }
  //   return newObj;
  //   // if (state.timeDifference.total.hours.toString().length < 2) {
  //   //   return `0${state.timeDifference.total.hours}`;
  //   // } else {
  //   //   return state.timeDifference.total.hours;
  //   // }
  // },

  showProjectName(state) {
    return{ 
      project: state.projects.selected,
      campaign: state.projects.selectedCampaign.campaign_name
    };
  },

  accessLevel(state) {
    return state.loggedUserData.accessLevel;
  },

  hasAccess(_, getters) {
    return getters.accessLevel == "admin" ||
      getters.accessLevel == "projectOwner" ||
      getters.accessLevel == "koordynator"
      ? true
      : false;
  },

  hasUpperAccess(_, getters) {
    return getters.accessLevel == "admin" ||
      getters.accessLevel == "projectOwner"
      ? true
      : false;
  },

  isAdmin(_, getters) {
    return getters.accessLevel == "admin" ? true : false;
  },

  filterProjects(state) {
    const clients = state.projects.list;
    const listOfProjects = [];
    for (const client of clients) {
      for (const project of client.projects) {
        for (const campaign of project.campaigns) {
          listOfProjects.push({
            campaignName: campaign.campaign_name,
            campaignId: campaign.campaign_id,
          });
        }
      }
    }
    listOfProjects.sort((a, b) => {
      const nameA = a.campaignName.toLowerCase();
      const nameB = b.campaignName.toLowerCase();
      return nameA.localeCompare(nameB);
    });
    return listOfProjects;
  },

  // filterUsers(state) {
  //   let listOfUsers = [];

  //   class Users {
  //     constructor(
  //       login,
  //       koordynator,
  //       projectOwner,
  //       name,
  //       lastName,
  //       active = true
  //       // workStage,
  //       // workStageStarted,
  //       // additionalInfo,
  //       // currentProject,
  //       // workStarted
  //     ) {
  //       this.login = login;
  //       this.koordynator = koordynator;
  //       this.projectOwner = projectOwner;
  //       this.name = name;
  //       this.lastName = lastName;
  //       this.active = active;
  //       // this.workStage = workStage;
  //       // this.workStageStarted = workStageStarted;
  //       // this.additionalInfo = additionalInfo;
  //       // (this.currentProject = currentProject),
  //       //   (this.workStarted = workStarted);
  //     }
  //   }

  //   // let sourceList = getters.isAdmin ? state.projects.allUsers : state.projects.listForEditing;
  //   let sourceList = state.projects.list;
  //   for (const each in sourceList) {
  //     let project = sourceList[each];
  //     // let workTime = project.work_time_started
  //     //   ? DateTime.fromSQL(project.work_time_started).toFormat("T")
  //     //   : null;
  //     // let stageTime = project.work_stage_started
  //     // ? DateTime.fromSQL(project.work_stage_started).toFormat("T")
  //     // : null;
  //     if (project.login) {
  //       listOfUsers.push(
  //         new Users(
  //           project.login,
  //           project.koordynator,
  //           project.project_owner,
  //           project.name,
  //           project.last_name,
  //           project.active
  //           // project.work_stage,
  //           // stageTime,
  //           // project.work_stage_additional_info,
  //           // project.current_campaign_name,
  //           // workTime
  //         )
  //       );
  //     }
  //   }
  //   listOfUsers = listOfUsers.filter(
  //     (value, index, self) =>
  //       index ===
  //       self.findIndex(
  //         (user) =>
  //           user.login === value.login &&
  //           user.login != state.loggedUserData.login
  //       )
  //   );
  //   // listOfUsers = listOfUsers.filter((user) => user.login != state.loggedUserData.login);
  //   return listOfUsers;
  // },

  // sortUsers(_, getters) {
  //   let sortedUsers = {
  //     users: [],
  //     inactiveUsers: [],
  //     coordinators: [],
  //     owners: [],
  //     allUsers: [],
  //   };
  //   for (const each in getters.filterUsers) {
  //     sortedUsers.allUsers.push(getters.filterUsers[each]);
  //     if (getters.filterUsers[each].active) {
  //       if (getters.filterUsers[each].projectOwner) {
  //         sortedUsers.owners.push(getters.filterUsers[each]);
  //       } else if (getters.filterUsers[each].koordynator) {
  //         sortedUsers.coordinators.push(getters.filterUsers[each]);
  //       } else {
  //         sortedUsers.users.push(getters.filterUsers[each]);
  //       }
  //     } else {
  //       sortedUsers.inactiveUsers.push(getters.filterUsers[each]);
  //     }
  //   }
  //   return sortedUsers;
  // },
  showDetails(state) {
    return state.workHistoryModule.showDetails;
  },

  usersForHistory(state) {
    let usersToSelect = [];
    for (const project of state.projects.list) {
      for (const campaign of project.campaigns) {
        for (const users of campaign.users) {
          usersToSelect.push(users);
        }
        for (const coordinators of campaign.coordinators) {
          usersToSelect.push(coordinators);
        }
      }
    }
    usersToSelect = usersToSelect.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.login === value.login)
    );
    return usersToSelect;
  },
};
