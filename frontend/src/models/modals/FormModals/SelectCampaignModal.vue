<template>
  <select
    class="ui fluid search selection dropdown"
    name="campaign"
    id="campaign"
    v-model="$store.state.selectForTimeAddition.project"
  >
    <option value="">Campaign</option>
    <option
      v-for="campaign in campaigns"
      :key="campaign.campaign_id"
      :value="campaign.campaign_id"
    >
      {{ campaign.campaign_name }}
    </option>
  </select>
</template>

<script>
export default {
  props: ['campaigns']
};
</script>

<style>
</style>