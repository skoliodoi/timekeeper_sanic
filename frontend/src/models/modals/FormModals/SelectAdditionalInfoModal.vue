<template>
  <select
    name="additional_info"
    id="additional_info"
    class="ui fluid dropdown"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option value="">Additional information</option>
    <option v-for="each in wycofanie" :key="each">
      {{ each }}
    </option>
  </select>
</template>

<script>
export default {
  props: ["selectedProjectProps"],
  computed: {
    wycofanie() {
      let defaultStatuses = [...this.$store.state.extraBreak.details];
      const dbStatuses = this.$store.state.projects.statuses;
      let selectedProject = this.$store.state.selectForTimeAddition.project ? this.$store.state.selectForTimeAddition.project : this.selectedProjectProps;
      for (const project in dbStatuses) {
        if (project == selectedProject) {
          for (const status of dbStatuses[project]) {
            defaultStatuses.unshift(status);
          }
        }
      }
      return defaultStatuses;
    },
  },
};
</script>

<style>
</style>