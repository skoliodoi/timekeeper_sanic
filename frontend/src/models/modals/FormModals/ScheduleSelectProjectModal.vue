<template>
  <select
    class="ui fluid search selection dropdown"
    name="project"
    id="project"
    v-model="$store.state.schedules.selectedProjectCode"
  >
    <option value="">Project</option>
    <option
      v-for="project in selectableProjects"
      :key="project.code"
      :value="project.code"

    >
      {{ project.name }}
    </option>
  </select>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["user"],
  computed: {
    ...mapGetters(["selectableProjects"]),
  },
};
</script>

<style></style>
