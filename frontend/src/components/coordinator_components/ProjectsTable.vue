<template>
  <!-- <div v-for="client in $store.state.projects.list" :key="client">
    {{ client.client  }}:
    <div>Length: {{ client.projects.length }}</div>
    <div v-for="each in client.projects" :key="each.project_code">{{ each }}

    
    
    </div>

  </div> -->
<div id="table-container">
  <table class="ui celled scrolling structured table" id="main-table">
    <thead style="position: sticky; top: 0">
      <tr >
        <th id="button-header">
          <BackButton :selectedPage="'control-panel'" />
        </th>
        <th id="table-header" class="center aligned">
          <h2 class="ui header">Projects list</h2>
        </th>
      </tr>
      <tr class="center aligned">
        <th id="client-header">Client</th>
        <th id="projects-header">Projects</th>
      </tr>
    </thead>
    <tbody>
      <tr class="center aligned" v-for="client in $store.state.projects.list" :key="client">
        <td><h4 class="ui header">{{ client.client }}</h4></td>
        <table
          class="ui selectable celled structured six column short scrolling table"
          style="margin-top: 0"
        >
          <thead>
            <tr class="center aligned">
              <th>Name</th>
              <th>Owners</th>
              <th>Number of campaigns</th>
              <th>Number of users</th>
              <th>Number of coordinators</th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="center aligned"
              v-for="project in client.projects"
              :key="project.project_code"
              @click="showProjectDetails(project.project_code)"
            >
              <td>{{ project.name }}</td>
              <td>
                <div
                  v-for="each in checkOwners(project.owners)"
                  :key="each.login"
                >
                  {{ each }}
                </div>
              </td>
              <td>{{ project.campaigns.length }}</td>
              <td>{{ checkUsers(project.campaigns) }}</td>
              <td>{{ checkCoordinators(project.campaigns) }}</td>
            </tr>
          </tbody>
        </table>
      </tr>
    </tbody>
  </table>
</div>
</template>
<script>
import BackButton from '../../models/BackButton.vue';
export default {
  components: {
    BackButton
  },
  emits: ['showDetails'],
  methods: {
    showProjectDetails(val) {
      this.$emit('showDetails', val)
    },
    checkUsers(val) {
      const usersTable = [];
      for (const each of val) {
        for (const user of each.users) {
          if (!usersTable.includes(user.login)) {
            usersTable.push(user.login);
          }
        }
      }
      return usersTable.length;
    },
    checkCoordinators(val) {
      const coordinatorsTable = [];
      for (const each of val) {
        for (const user of each.coordinators) {
          if (!coordinatorsTable.includes(user.login)) {
            coordinatorsTable.push(user.login);
          }
        }
      }
      return coordinatorsTable.length;
    },
    checkOwners(val) {
      const ownersTable = [];
      for (const each of val) {
        if (!ownersTable.includes(each.full_name)) {
          ownersTable.push(each.full_name);
        }
      }
      return ownersTable;
    },
  },
};
</script>
<style scoped>
  table {
    margin-top: 0 !important;
  }

  #table-container {
    height: calc(100vh - 60px) !important;
    overflow-y: scroll !important;
  }


  #button-header,
  #table-header,
  #client-header,
  #projects-header,
  #table-header > h2 {
    background-color: #3D698E !important;
    color: whitesmoke !important
  }

  #button-header {
    border-right: none !important;
  }

  #table-header {
    border-left: none !important;
  }
</style>
