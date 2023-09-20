<template>
  <SuccessModal id="create_user" :message="modalMessage" />
  <ErrorModal id="registration_error" :message="modalMessage" />
  <form class="ui form" id="user_form">
    <div class="content" style="padding: 20px">
      <div class="fields">
        <div class="seven wide field">
          <label style="text-align: left">First name</label>
          <div class="ui input focus">
            <input
              name="name"
              type="text"
              placeholder="User name"
              v-model="registerNewUser.firstName"
            />
          </div>
        </div>
        <div class="seven wide field">
          <label style="text-align: left">Last name</label>
          <div class="ui input focus">
            <input
              name="last_name"
              type="text"
              placeholder="User last name"
              v-model="registerNewUser.lastName"
            />
          </div>
        </div>
        <div class="two wide field">
          <label style="text-align: left">Moccarz Id</label>
          <div class="ui input focus">
            <input
              name="moccarz_id"
              type="text"
              placeholder="Moccarz Id"
              v-model="registerNewUser.moccarzId"
            />
          </div>
        </div>
      </div>
      <div class="three fields">
        <div class="field">
          <label style="text-align: left">Login</label>
          <div class="ui input focus">
            <input
              type="text"
              name="login"
              placeholder="Login"
              v-model="registerNewUser.login"
            />
          </div>
        </div>
        <div class="field">
          <label style="text-align: left">Password</label>
          <div class="ui input focus">
            <input
              name="password"
              type="password"
              placeholder="Password"
              v-model="registerNewUser.password"
            />
          </div>
        </div>
        <div class="field">
          <label style="text-align: left">Confirm password</label>
          <div class="ui input focus">
            <input
              name="confirm_password"
              type="password"
              placeholder="Confirm password"
              v-model="registerNewUser.confirmedPassword"
            />
          </div>
        </div>
      </div>
      <div class="two fields">
        <div class="field" style="flex: 5">
          <label style="text-align: left">Assign projects</label>
          <select
            class="ui fluid search dropdown"
            name="project"
            multiple=""
            id="multiple_select"
            v-model="selectedProjects"
            @change="assignCampaigns"
          >
            <option value="">Project</option>
            <option
              :value="each.code"
              v-for="each in selectableProjects"
              :key="each.code"
            >
              {{ each.name }}
            </option>
          </select>
        </div>
        <div class="field" style="flex: 1">
          <div class="ui toggle checkbox" id="po_checkbox">
            <input
              type="checkbox"
              name="coordinator"
              v-model="registerNewUser.projectOwner"
              @change="changeCoordinatorHandler"
            />
            <label><strong>Project owner?</strong></label>
          </div>
        </div>
      </div>
      <div class="two fields" v-if="showCampaignSelect">
        <div class="field" style="flex: 5">
          <label style="text-align: left">Assign campaigns</label>
          <select
            class="ui fluid search dropdown"
            name="campaign"
            multiple=""
            id="campaign"
            v-model="selectedCampaigns"
            @change="checkProjects"
          >
            <option value="">Campaign</option>
            <option
              :value="each.id"
              v-for="each in assignableCampaigns"
              :key="each"
            >
              {{ each.name }}
            </option>
          </select>
        </div>
        <div class="field" style="flex: 1">
          <div class="ui toggle checkbox" id="coordinator_checkbox">
            <input
              style=""
              type="checkbox"
              name="coordinator"
              v-model="registerNewUser.koordynator"
              @change="changeProjectOwnerHandler"
            />
            <label><strong>Coordinator?</strong></label>
          </div>
        </div>
      </div>
      <div class="extra content">
        <div class="ui error message"></div>
      </div>
    </div>
    <div class="ui bottom attached two buttons">
      <div
        class="ui instagram button"
        :class="{ submit: !isDataValid }"
        @click.prevent="registerUser"
      >
        <i class="add user icon"></i>
        Add User
      </div>
      <div class="ui grey button" @click="cancelEdit">
        <i class="cancel icon"></i>
        Cancel
      </div>
    </div>
  </form>
</template>

<script>
import axios from "axios";
import config from "../../config";
import SuccessModal from "../../models/modals/SuccessModal.vue";
import ErrorModal from "../../models/modals/ErrorModal.vue";
import { mapGetters } from "vuex";

export default {
  components: {
    SuccessModal,
    ErrorModal,
  },
  updated() {
    $("#campaign").dropdown();
  },
  data() {
    return {
      showCampaignSelect: true,
      success: {
        state: false,
        text: "User was added succesfully!",
      },
      modalMessage: "",
      selectedProjects: [],
      selectedCampaigns: [],
      dataValidation: false,
      loadingPage: false,
      error: "",
      assignableCampaigns: [],
      itemCount: 0,
      assignableProjects: [],
      registerNewUser: {
        firstName: "",
        lastName: "",
        login: "",
        password: "",
        confirmedPassword: "",
        moccarzId: "",
        koordynator: false,
        projectOwner: false,
      },
    };
  },
  computed: {
    ...mapGetters(["selectableProjects"]),
    isDataValid() {
      return this.dataValidation;
    },
    coordination() {
      return this.$store.state.coordinator;
    },
    campaignsToAssign() {
      return this.selectedCampaigns;
    },
    projectsToAssign() {
      let list = this.$store.state.projects.list.map((el) => ({
        name: el.name,
        code: el.project_code,
      }));
      list.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      return list;
    },
    // campaignsToAssign() {
    //   let assignableCampaigns = []
    //   for (const each of this.selectedProjects) {
    //     for (const project of this.$store.state.projects.fullList) {
    //       if (project.project_name == each)
    //         for (const detail of project.details) {
    //           assignableCampaigns.push(
    //             {
    //               id: detail.campaign_id,
    //               name: detail.campaign_name,
    //               parent_project: project.project_name
    //             }
    //           )
    //         }
    //     }
    //     //   let data = this.$store.state.projects.fullList.find((el) =>  el.project_name == each)
    //     //   data.details.forEach(e => {
    //     //     assignableCampaigns.push({id: e.campaign_id, name: e.campaign_name})
    //     //   })
    //     // for (const each of assignableCampaigns) {
    //     //   console.log(each)
    //     // }
    //   }
    //   return assignableCampaigns
    // }
    // projectsFromServer() {
    //   return this.$store.getters.filterProjects;
    // },
  },
  methods: {
    checkProjects(event) {
      const checkClass = event.explicitOriginalTarget.className;

      if (checkClass == "delete icon") {
        const getId = event.explicitOriginalTarget.parentElement.dataset.value;
        console.log(getId);
        const checkProjects = [];
        for (const each of this.selectedCampaigns) {
          for (const client of this.$store.state.projects.list) {
            for (const project of client.projects) {
              for (const campaign of project.campaigns) {
                if (campaign.campaign_id == each) {
                  checkProjects.push({
                    campaign: each,
                    project: project.project_code,
                  });
                }
              }
            }
          }
        }
        for (const selected of this.selectedProjects) {
          const presentProject = checkProjects.filter(
            (el) => el.project == selected
          );
          console.log(presentProject);
          if (presentProject.length == 0) {
            $("#multiple_select").dropdown("remove selected", selected);
          }
        }
      }

      // for (const campaign of checkProjects) {
      //   console.log(this.selectedCampaigns)
      //   if (!this.selectedCampaigns.includes(campaign.id)) {
      //     console.log("Usuwamy")
      //     // let index = this.selectedCampaigns.indexOf(campaign.id);
      //     // this.selectedCampaigns.splice(index, 1);
      //     // $("#campaign").dropdown("remove selected", campaign.id);
      //   }
      // }
    },
    assignCampaigns() {
      this.assignableCampaigns = [];
      const checkCampaigns = [];
      for (const each of this.selectedCampaigns) {
        for (const client of this.$store.state.projects.list) {
          for (const project of client.projects) {
            for (const detail of project.campaigns) {
              if (
                detail.campaign_id == each &&
                !checkCampaigns.includes(project.project_code)
              ) {
                checkCampaigns.push({
                  name: project.project_code,
                  id: detail.campaign_id,
                });
              }
            }
          }
        }
      }

      for (const campaign of checkCampaigns) {
        if (!this.selectedProjects.includes(campaign.name)) {
          let index = this.selectedCampaigns.indexOf(campaign.id);
          this.selectedCampaigns.splice(index, 1);
          $("#campaign").dropdown("remove selected", campaign.id);
        }
      }
      $("#campaign").dropdown("refresh");
      for (const each of this.selectedProjects) {
        for (const client of this.$store.state.projects.list) {
          for (const project of client.projects) {
            if (project.project_code == each) {
              project.campaigns.forEach((e) => {
                this.assignableCampaigns.push({
                  id: e.campaign_id,
                  name: e.campaign_name,
                });
              });
            }
          }
        }
      }
    },
    changeCoordinatorHandler() {
      if (this.registerNewUser.projectOwner) {
        // this.registerNewUser.koordynator = true;
        this.showCampaignSelect = false;
        this.selectedCampaigns = [];
        $("#campaign").dropdown("clear data");
      } else {
        this.showCampaignSelect = true;
      }
    },
    changeProjectOwnerHandler() {
      if (!this.registerNewUser.koordynator) {
        this.registerNewUser.projectOwner = false;
      }
    },
    refreshPage() {
      $("#multiple_select").dropdown();
      this.success.state = false;
      this.dataValidation = false;
    },
    cancelEdit() {
      this.$store.state.selectedPage = "control-panel";
    },
    async getProjects() {
      this.loadingPage = true;
      try {
        await this.$store.dispatch("getProjects");
      } catch (error) {
        this.error = error;
      }

      this.loadingPage = false;
    },

    async registerUser() {
      if ($("#user_form").form("is valid")) {
        this.dataValidation = true;
      }
      if (this.dataValidation) {
        // this.$emit("registerProcess", {

        //   loadingRegister: true,
        // });
        (this.modalMessage = ""),
          (this.$store.state.loaders.addUserLoader = true);
        // this.loadingRegister = true;
        this.$store.commit("getDataFromStorage");
        // const dane = new FormData();
        const userData = {
          name: this.registerNewUser.firstName,
          last_name: this.registerNewUser.lastName,
          login: this.registerNewUser.login,
          password: this.registerNewUser.password,
          password_confirmation: this.registerNewUser.confirmedPassword,
          koordynator: this.registerNewUser.koordynator,
          project_owner: this.registerNewUser.projectOwner,
          who_added: this.$store.state.loggedUserData.login,
          mocarz_id:
            this.registerNewUser.moccarzId != ""
              ? this.registerNewUser.moccarzId
              : null,
          projects: this.selectedProjects,
          campaigns: this.selectedCampaigns
        };
        await axios
          .post(`${config.apiBaseUrl}/register`, userData, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${this.$store.state.loggedUserData.token}`,
            },
          })
          .catch((error) => {
            console.log(error.response.data);
          })
          .then(async (response) => {
            if (!response.data.added) {
              $("#registration_error")
                .modal({
                  class: "mini inverted",
                })
                .modal("show");
              (this.modalMessage = response.data.message),
                (this.$store.state.loaders.addUserLoader = false);
            } else {
              await this.$store.dispatch(
                "getProjects",
                this.$store.state.loggedUserData.login
              );
              $("#user_form").form("reset");

              this.registerNewUser.firstName = "";
              this.registerNewUser.lastName = "";
              this.registerNewUser.login = "";
              this.registerNewUser.password = "";
              this.registerNewUser.confirmedPassword = "";
              this.registerNewUser.moccarzId = "";
              this.selectedProjects = [];
              $("#project").dropdown('clear');
              this.selectedCampaigns = [];
              $("#campaign").dropdown('clear');
              this.registerNewUser.koordynator = false;
              this.registerNewUser.projectOwner = false;
              $("#create_user")
                .modal({
                  class: "mini inverted",
                })
                .modal("show");
              this.success.state = true;
              (this.modalMessage = response.data.message),
                (this.$store.state.loaders.addUserLoader = false);
            }
          });
      }
      this.dataValidation = false;
    },
  },
};
</script>

<style>
.ui.toggle.checkbox {
  width: 100% !important;
}
</style>
