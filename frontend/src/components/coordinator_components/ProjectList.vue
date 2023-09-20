<template>
  <SuccessModal id="deleted_project" :message="'The project was deleted!'" />
  <div id="project-list">
    <div class="ui container">
      <Loader
        v-if="loading || $store.state.loaders.projectLoader"
        :data="'Updating projects list...'"
      />
      <Error v-else-if="error" :errorData="error" />
      <div v-else>
        <div v-if="!isThereProjectToEdit.exists">
          <div class="projects-header" style="position: sticky; top: 0; z-index: 10;">
            <BackButton :selectedPage="'projects-list'" @click="$emit('hideDetails')"/>
            <div class="ui search">
              <div class="ui icon input">
                <input
                  class="prompt"
                  v-model="searchFilter"
                  type="text"
                  placeholder="Find campaign"
                />
                <i class="search icon" v-if="!searchFilter"></i>
                <i
                  class="times icon"
                  style="cursor: pointer"
                  v-else
                  @click="clearSearchFilter"
                ></i>
              </div>
            </div>
          </div>
          <div
            class="ui fluid card"
            v-for="project in projectsList"
            :key="project"
          >
            <ProjectCards
              :projectName="project.campaign_name"
              :projectId="project.campaign_id"
              :startingHours="project.starting_hours"
              :endingHours="project.ending_hours"
              :owners="project.owners"
              :coordinators="project.coordinators"
              :users="project.users"
              :statuses="project.statuses"
              @deleteProject="deleteProject"
            />
          </div>
        </div>
        <form class="ui form" v-else>
          <EditProject
            :projectName="isThereProjectToEdit.project.name"
            :projectId="isThereProjectToEdit.project.projectId"
            :startingHours="isThereProjectToEdit.project.startingHours"
            :endingHours="isThereProjectToEdit.project.endingHours"
            :coordinators="isThereProjectToEdit.project.coordinators"
            :users="isThereProjectToEdit.project.users"
            :statuses="isThereProjectToEdit.project.statuses"
          />
        </form>
      </div>
      <div
        class="ui warning centered aligned message"
        v-if="projectsList.length == 0"
      >
        <div class="content">
          <div class="header">Whoops! {{ projectCode }}</div>
          <p>No projects found!</p>
          <p v-if="searchFilter.length > 0">
            Make sure you're using a correct project name!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectCards from "./ProjectCards.vue";
import EditProject from "./EditProject.vue";
import Loader from "../../models/Loader.vue";
import BackButton from "../../models/BackButton.vue";
import Error from "../../models/Error.vue";
import SuccessModal from "../../models/modals/SuccessModal.vue";

import axios from "axios";
import config from "../../config";

export default {
  mounted() {
    $(".ui.accordion").accordion();
    this.$store.state.controlPanel = true;
  },
  updated() {
    $(".ui.accordion").accordion();
    this.$store.state.controlPanel = true;
  },
  props: ["projectCode"],
  emits: ["hideDetails"],
  data() {
    return {
      loading: false,
      error: "",
      searchFilter: "",
    };
  },
  components: {
    ProjectCards,
    EditProject,
    Loader,
    Error,
    SuccessModal,
    BackButton,
  },
  computed: {
    projects() {
      return this.$store.getters.groupedProjects;
    },
    projectsList() {
      let fixedProjectList = [];
      const fullList = this.$store.state.projects.list;
      for (const client of fullList) {
        for (const project of client.projects) {
          if (project.project_code == this.projectCode) {
            fixedProjectList = project.campaigns
          }
        }
      }
      let returnList;
      if (!this.searchFilter) {
        returnList = fixedProjectList;
      } else {
        returnList = fixedProjectList.filter((el) =>
          el.campaign_name.toLowerCase().includes(this.searchFilter.toLowerCase())
        );
      }
      return returnList;
    },
    isThereProjectToEdit() {
      return this.$store.state.projectToEdit;
    },
  },
  methods: {
    clearSearchFilter() {
      this.searchFilter = "";
    },
    async deleteProject(val) {
      this.$store.commit("getDataFromStorage");
      this.loading = true;
      await axios
        .post(
          `${config.apiBaseUrl}/delete_project`,
          { project: val },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${this.$store.state.loggedUserData.token}`,
            },
          }
        )
        .catch((error) => {
          this.error = error.response.data.message;
        });

      await this.$store.dispatch(
        "getProjects",
        this.$store.state.loggedUserData.login
      );
      this.loading = false;
      $("#deleted_project")
        .modal({
          class: "mini inverted",
        })
        .modal("show");
    },
  },
};
</script>

<style scoped>
.projects-header {
  background-color: #3D698E;
  height: 5em !important;
  display: flex;
  align-items: center;
  padding: 10px;
  justify-content: space-between;
}
#project-list {
  margin-top: 0;
  height: calc(100vh - 74px);
  overflow: auto;
}

.ui.icon.input > i.icon:not(.link) {
  pointer-events: all !important;
}
</style>
