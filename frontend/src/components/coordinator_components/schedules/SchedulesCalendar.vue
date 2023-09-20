<template>
  <div
    v-if="calendarType == 'date'"
    class="ui calendar"
    id="day-calendar"
  ></div>
  <div v-else class="ui calendar" id="month-calendar"></div>
</template>

<script>
export default {
  props: ["calendarType"],
  emits: [],
  mounted() {
    $("#day-calendar").calendar({
      type: `date`,
    });
  },
  updated() {
    $("#day-calendar").calendar({
      type: `date`,
    });
    $("#month-calendar").calendar({
      type: `month`,
    });
  },
};
</script>
