<template>
  <select
    class="ui fluid dropdown"
    @change="$emit('update:modelValue', $event.target.value)"
    name="workstage"
    id="workstage"
  >
    <option value="">Work stage</option>
    <option v-for="each in workstage" :key="each">
      {{ each }}
    </option>
  </select>
</template>

<script>
export default {
  computed: {
    workstage() {
      return this.$store.state.workStage.choiceOptions;
    },
  },
};
</script>

<style>
</style>