<template>
  <UploadUsersFromFileModal
    @downloadPasswords="downloadFile"
    :takenLogins="existingLogins"
    id="users-added"
  />
  <UploadUsersFromFileErrorModal
    @clearFile="clearFile"
    :message="errorMsg"
    id="users-failed"
  />
  <form class="ui form" id="file_form">
    <div class="content" style="padding: 20px">
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
        <div class="field" style="flex: 5">
          <label style="text-align: left">Assign campaigns</label>
          <select
            class="ui fluid search dropdown"
            name="campaign"
            multiple=""
            id="file-campaign"
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
      </div>
      <div class="field">
        <div class="ui file action input">
          <label for="tkFileInput" class="ui facebook button">
            <i class="file icon"></i>
            Choose file
          </label>
          <input id="tkFileInput" type="file" @change="handleFile" />
        </div>
      </div>
    </div>
    <div class="extra content">
      <div class="ui error message"></div>
    </div>
    <div class="ui bottom attached two buttons">
      <div class="ui facebook button" @click="uploadFile">
        <i class="add user icon"></i>
        Add Users
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
import UploadUsersFromFileModal from "../../models/modals/UploadUsersFromFileModal.vue";
import UploadUsersFromFileErrorModal from "../../models/modals/UploadUsersFromFileErrorModal.vue";
import { mapGetters } from "vuex";

export default {
  components: { UploadUsersFromFileModal, UploadUsersFromFileErrorModal },
  emits: ["uploadStatus"],
  mounted() {
    $("#file-campaign").dropdown();
  },
  data() {
    return {
      file: "",
      assignableCampaigns: [],
      selectedProjects: [],
      selectedCampaigns: [],
      downloadUrl: "",
      existingLogins: [],
      errorMsg: "",
    };
  },
  computed: {
    ...mapGetters(["selectableProjects"]),
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
          $("#file-campaign").dropdown("remove selected", campaign.id);
        }
      }
      $("#file-campaign").dropdown("refresh");
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
    clearFile() {
      this.file = "";
      const inputVal = document.getElementById("tkFileInput");
      inputVal.value = "";
      this.selectedProjects = [];
      this.$emit("uploadStatus", {
        changeToManual: true,
      });
      this.$store.state.loaders.addUserLoader = false;
    },
    cancelEdit() {
      this.$store.state.selectedPage = "control-panel";
    },
    deleteData() {
      axios.post(`${config.apiBaseUrl}/delete_data`, {
        fileName: this.downloadUrl,
      });
      this.clearFile();
    },
    handleFile(event) {
      this.file = event.target.files[0];
    },
    uploadFile() {
      // this.$emit("uploadStatus", { loadingRegister: true });
      this.$store.state.loaders.addUserLoader = true;
      let formData = new FormData();
      formData.append("file", this.file);
      if (this.selectedProjects.length > 0) {
        for (const each of this.selectedProjects) {
          formData.append("projects", each);
        }
        for (const each of this.selectedCampaigns) {
          formData.append("campaigns", each);
        }
      } else {
        formData.append("projects", "");
        formData.append("campaigns", "");
      }

      formData.append("who_added", this.$store.state.loggedUserData.login);
      axios
        .post(`${config.apiBaseUrl}/multiregister`, formData, {
          headers: {
            Accept: "application/json",
            ContentType: "multipart/form-data",
            responseType: "blob",
          },
        })
        .then(async (response) => {
          this.downloadUrl = response.data.file_address;
          this.existingLogins = response.data.existing_logins;
          await this.$store.dispatch(
            "getProjects",
            this.$store.state.loggedUserData.login
          );
          $("#users-added")
            .modal({
              closable: false,
            })
            .modal("show");
        })
        .catch((error) => {
          this.errorMsg = error.response.data;
          $("#users-failed")
            .modal({
              closable: false,
            })
            .modal("show");
        });
    },
    async downloadFile() {
      await axios
        .get(`${config.apiBaseUrl}/dl_file/${this.downloadUrl}`, {
          responseType: "blob",
        })
        .then((response) => {
          const fileURL = window.URL.createObjectURL(new Blob([response.data]));
          // create "a" HTML element with href to file & click
          const fileLink = document.createElement("a");
          fileLink.href = fileURL;
          fileLink.setAttribute("download", this.downloadUrl);
          document.body.appendChild(fileLink);
          fileLink.click();
        });
      this.deleteData();
    },
  },
};
</script>

<style></style>
