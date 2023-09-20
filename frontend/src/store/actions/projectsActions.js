import axios from "axios";
import config from "../../config";

export default {
  async addProject(context, payload) {
    // let generateId = await context.dispatch("generateId", 5);
    // let projectId = (
    //   payload.project.replace(/\s/g, "").toLowerCase() + generateId
    // ).toString();
    context.commit("getDataFromStorage");
    // const dane = new FormData();
    // dane.append("campaign_id", projectId);
    // dane.append("campaign_name", payload.project);
    // dane.append("starting_hours", payload.startTime);
    // dane.append("ending_hours", payload.endTime);
    // dane.append("ending_hours", payload.endTime);
    // dane.append("edited_by", context.state.loggedUserData.login);
    // for (var i = 0; i < payload.owners.length; i++) {
    //   dane.append("owners[]", payload.owners[i]);
    // }

    // for (var j = 0; j < payload.coordinators.length; j++) {
    //   dane.append("coordinators[]", payload.coordinators[j]);
    // }

    // for (var k = 0; k < payload.users.length; k++) {
    //   dane.append("users[]", payload.users[k]);
    // }

    const dane = {
      project: payload.project,
      // campaign_id: projectId,
      campaign_name: payload.campaign,
      starting_hours: payload.startTime,
      ending_hours: payload.endTime,
      logout_buffer: parseInt(payload.buffer),
      add_ghosts: payload.ghosts,
      // owners: payload.owners,
      coordinators: payload.coordinators,
      users: payload.users,
      statuses: payload.statuses,
      edited_by: context.state.loggedUserData.login,
    };

    return axios
      .post(`${config.apiBaseUrl}/create_project`, dane, {
        headers: {
          // "content-type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Bearer ${context.state.loggedUserData.token}`,
        },
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  },

  async getProjects(context, payload) {
    context.state.loaders.projectLoader = true;
    context.commit("getDataFromStorage");
    context.state.loadingText = "Getting available projects...";
    return axios
      .get(`${config.apiBaseUrl}/get_projects/${payload}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${context.state.loggedUserData.token}`,
        },
        // params: {
        //   user: payload
        // }
      })
      .then((response) => {
        context.state.projects.list = [];
        const parsedData = JSON.parse(response.data.projects);
        context.state.projects.list = parsedData;
        for (const each of parsedData) {
          for (const project of each.projects) {
            for (const owner of project.owners) {
              const ownersArr = context.state.projects.owners;
              const ownersIndex = ownersArr.findIndex(object => object.login === owner.login);
              if (ownersIndex === -1) {
                ownersArr.push(owner);
              } 
            }
            for (const campaign of project.campaigns) {
              for (const user of campaign.users) {
                const arr = context.state.projects.allUsers;
                const usersArr = context.state.projects.users;
                const index = arr.findIndex(object => object.login === user.login);
                if (index === -1) {
                  arr.push(user);
                }
                const usersIndex = usersArr.findIndex(object => object.login === user.login);
                if (usersIndex === -1) {
                  usersArr.push(user);
                }
              }
              for (const coordinator of campaign.coordinators) {
                const arr = context.state.projects.allUsers
                const coordinatorsArr = context.state.projects.coordinators;
                const index = arr.findIndex(object => object.login === coordinator.login);
                if (index === -1) {
                  arr.push(coordinator);
                }
                const coordinatorsIndex = coordinatorsArr.findIndex(object => object.login === coordinator.login);
                if (coordinatorsIndex === -1) {
                  coordinatorsArr.push(coordinator);
                }
              }
              // for (const coordinator of campaign.coordinators) {
              //   if (!context.state.projects.allUsers.includes(coordinator)){
              //       context.state.projects.allUsers.push(coordinator)
              //   }
              // }
            }
          }
        }
        // context.state.projects.fullList = parsedData;
        if (response.data.statuses) {
          context.state.projects.statuses = JSON.parse(response.data.statuses);
        }

        // context.state.projects.allUsers = response.data.users;
        // context.state.projects.list = response.data.projectsToSelect;
        // context.state.projects.listForEditing = response.data.edit_projects;
        // context.state.projects.projectsAndUsers = response.data.projectsAndUsers;
        context.state.loaders.projectLoader = false;
        // console.log(context.state.projects.test)
      });
    // .catch((error) => {
    //   if (error.response) {
    //     // The request was made and the server responded with a status code
    //     // that falls out of the range of 2xx
    //     let errorData = {
    //       connectionError: true,
    //       errorData: error.response.data.message
    //     }
    //     return errorData
    //   } else if (error.request) {
    //     // The request was made but no response was received
    //     // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    //     // http.ClientRequest in node.js
    //     console.log(error.request);
    //   } else {
    //     // Something happened in setting up the request that triggered an Error
    //     console.log("Error", error.message);
    //   }
    //   console.log(error.config);
    // });
  },
};
