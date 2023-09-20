<template>
  <ConfirmModal
    id="delete_project_modal"
    :firstParagraph="'delete this project'"
    :secondParagraph="'You won\'t be able to undo this!'"
  />
  <div
    class="content"
    style="background: #3d698e; color: whitesmoke; display: flex; "
  >
    <h1 class="ui header" style="color: whitesmoke; flex: 3">
      {{ projectName }}
    </h1>
    <div>
      <div class="ui small basic inverted icon buttons">
        <button
          class="ui button"
          data-tooltip="Edit project"
          data-inverted=""
          data-position="left center"
          @click="edit(projectId)"
        >
          <i class="pencil alternate icon"></i>
        </button>
        <button
          class="ui button"
          data-tooltip="Delete project"
          @click="deleteProject(projectId, $emit)"
          data-inverted=""
          data-position="left center"
          v-if="isAdmin"
        >
          <i class="trash alternate icon"></i>
        </button>
      </div>
    </div>
  </div>
  <div class="content">
    <div class="ui equal width grid">
      <div class="column">
        <div class="item">
          <h2 class="ui header">Project's start hour: {{ startingHours }}</h2>
        </div>
      </div>
      <div class="column">
        <div class="item">
          <h2 class="ui header">Project's end hour: {{ endingHours }}</h2>
        </div>
      </div>
    </div>
  </div>
  <div class="extra content">
    <div v-if="statuses.length > 0">
      <div class="ui styled fluid accordion">
        <div class="title">
          <i class="dropdown icon"></i>
          See campaign statuses
        </div>

        <div class="content">
          <div class="ui labels restricted-size">
            <div
              class="ui coordinators-label label"
              v-for="each in statuses"
              :key="each"
            >
              {{ each }}
            </div>
          </div>
          
        </div>
      </div>
    </div>
    <div>
      <div class="ui styled fluid accordion">
        <div class="title">
          <i class="dropdown icon"></i>
          See users and coordinators
        </div>
        <div class="content" >
          <div class="ui equal width grid">
            <div class="left aligned column" >
              <div
                class="center aligned description"
                style="margin-bottom: 6px"
              >
                <h5 class="ui header">Coordinators</h5>
              </div>
              <div class="ui labels restricted-size">
                <div
                  class="ui coordinators-label label"
                  :class="{ 'right icon': showEditCoordinators }"
                  v-for="each in coordinators"
                  :key="each"
                >
                  {{ each.full_name }} ({{ each.login }})
                </div>
              </div>
            </div>
            <div class="left aligned column">
              <div
                class="center aligned description"
                style="margin-bottom: 6px"
              >
                <h5 class="ui header">Users</h5>
              </div>
              <div class="ui labels restricted-size">
                <div
                  class="ui basic users-label label"
                  v-for="each in users"
                  :key="each"
                >
                  {{ each.full_name }} ({{ each.login }})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ConfirmModal from "../../models/modals/ConfirmModal.vue";
import { mapGetters } from "vuex";

export default {
  mounted() {
    this.$store.state.controlPanel = true;
    $("#delete_project_modal").modal();
  },
  updated() {
    this.$store.state.controlPanel = true;
      // $("#coordinators_dropdown").dropdown();
    $("#coordinators_dropdown").dropdown();
    $("#status_dropdown").dropdown();
  },
  components: {
    ConfirmModal,
  },
  emits: ["deleteProject"],
  props: [
    "projectName",
    "projectId",
    "startingHours",
    "endingHours",
    "owners",
    "coordinators",
    "users",
    "statuses",
  ],
  data() {
    return {
      rowCount: 1,
      loading: false,
      showEditCoordinators: false,
      showEditUsers: false,
      showEditStarTime: false,
      showEditEndTime: false,
      selectedCoordinators: [],
      coordinatorsFromServer: [],
      selectedStatuses: [],
    };
  },
  computed: {
    ...mapGetters(["hasUpperAccess", "isAdmin"]),
  },
  methods: {
    addStatuses() {
      this.initStatusEdit();
    },
    initStatusEdit() {
      for (const each of this.statuses) {
        console.log(each);
        this.selectedStatuses.push(each);
      }
      console.log(this.selectedStatuses);
    },
    deleteProject(val, method) {
      $("#delete_project_modal")
        .modal({
          class: "tiny inverted",
          closable: false,
          onApprove: async function () {
            method("deleteProject", val);
          },
        })
        .modal("show");
    },
    editCoordinators() {
      this.showEditCoordinators = true;
      for (const each in this.coordinators) {
        this.selectedCoordinators.push(this.coordinators[each].login);
      }
    },
    edit(val) {
      for (const client of this.$store.state.projects.list) {
        for (const project of client.projects) {
          for (const campaign of project.campaigns) {
            if (campaign.campaign_id == val) {
              this.$store.state.projectToEdit.exists = true;
              this.$store.state.projectToEdit.project = {
                name: campaign.campaign_name,
                projectId: campaign.campaign_id,
                startingHours: campaign.starting_hours,
                endingHours: campaign.ending_hours,
                users: campaign.users,
                coordinators: campaign.coordinators,
                statuses: campaign.statuses
              };
            }
          }
        }
      }
    },
    cancelEditCoordinators() {
      this.showEditCoordinators = false;
      this.selectedCoordinators = [];
    },
    cancelEditForAll() {
      this.cancelEditCoordinators();
      this.showEditUsers = false;
      this.selectedUsers = [];
    },
  },
};
</script>

<style scoped>
.restricted-size {
  max-height: 100px !important; 
  overflow-y: auto !important; 
}

.project-label,
.coordinators-label {
  background-color: #304d8a;
  color: whitesmoke;
}

.ui.label.visible:not(.dropdown), .ui.labels.visible .label {
  display: block !important;
}
.users-label {
  border: 1px solid #304d8a !important;
  color: #304d8a !important;
}
</style>
