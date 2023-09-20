<template>
  <div class="back-button">
    <div
      class="ui inverted button"
      @click="$store.state.selectedPage = selectedPage"
    >
      Go back
    </div>
  </div>
</template>
<script>
export default {
  props: ["selectedPage"]
}
</script>
<style>
</style>
