<template>
  <ProjectList v-if="showProjectDetails"
  :projectCode = projectCode
  @hideDetails="showProjectDetails = false"
  />
  <ProjectsTable v-else
   @showDetails = "showProjectDetailsHandler"
  />
</template>
<script>
import ProjectsTable from "./ProjectsTable.vue";
import ProjectList from "./ProjectList.vue";
export default {
  components: {
    ProjectsTable,
    ProjectList,
  },
  data() {
    return {
      showProjectDetails: false,
      projectCode: ""
    }
  },
  methods: {
    showProjectDetailsHandler(val) {
      this.projectCode = val;
      this.showProjectDetails = true;
    }
  }
};
</script>
<style></style>
