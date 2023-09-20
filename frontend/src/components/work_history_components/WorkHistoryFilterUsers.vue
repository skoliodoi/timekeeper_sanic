<template>
  <div class="sixteen wide field">
    <label style="text-align: left">{{ label }}</label>
    <select
      id="user_dropdown"
      class="ui fluid search dropdown"
      :class="{
        error: errorDisplay,
      }"
      name="user"
      v-model="$store.state.checkHistory.user"
    >
      <option v-if="coordinator" :value="$store.state.loggedUserData.login">
        Check my history
      </option>
      <option
        v-for="each in selectionData"
        :key="each.login"
        :value="each.login"
      >
        <div>
          {{ each.full_name }} {{ each.lastName }}
          <strong>({{ each.login }})</strong>
        </div>
      </option>
    </select>
  </div>
</template>

<script>
export default {
  props: ["label", "selectionData", "errorDisplay"],
  beforeUnmount() {
    this.$store.state.checkHistory.user = "";
  },
  computed: {
    accessLevel() {
      return this.$store.getters.accessLevel;
    },
    coordinator() {
      if (this.accessLevel == "koordynator") {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>

<style></style>
