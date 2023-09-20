<template>
  <WorkdaySummary />
  <!-- <button v-if="!showAddTime" class="ui olive button" @click="showAddTime=true">AddTime</button>
  <AddTime v-if="showAddTime" /> -->
</template>

<script>
	// import ExtraBreak from '../ExtraBreak.vue';
  import WorkdaySummary from './_WorkdaySummary.vue';
  // import AddTime from '../AddTime.vue';


	export default {
    components: {
      WorkdaySummary,
      // AddTime
    },
    data() {
      return {
        showAddTime: false
      }
    }
	};
</script>

<style>

</style>