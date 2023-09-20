<template>
  <div class="ui mini inverted modal">
    <div class="ui center aligned header">
      Change {{ dataChange.oldLogin }}'s data
    </div>
    <div class="content">
      <form class="ui form" id="reset_form">
        <div class="field">
          <label>Login:</label>
          <div class="ui input">
            <input
              type="text"
              name="pass"
              :placeholder="dataChange.oldLogin"
              v-model="dataChange.newLogin"
            />
          </div>
        </div>
        <div class="field">
          <label>Name:</label>
          <div class="ui input">
            <input
              type="text"
              name="confirm_pass"
              placeholder="Confirm new password"
              v-model="dataChange.name"
            />
          </div>
        </div>
        <div class="field">
          <label>Last name:</label>
          <div class="ui input">
            <input
              type="text"
              name="confirm_pass"
              placeholder="Confirm new password"
              v-model="dataChange.lastName"
            />
          </div>
        </div>
      </form>
      <div class="ui error message" v-if="dataChange.error">
        {{ dataChange.errorText }}
      </div>
    </div>
    <div class="center aligned actions">
      <div class="ui negative left labeled icon button">
        <i class="times icon"></i>
        Cancel
      </div>
      <div
        class="ui positive right labeled icon button"
        :class="{ loading: dataChange.loading }"
      >
        Confirm
        <i class="checkmark icon"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    dataChange() {
      return this.$store.state.dataChange;
    },
  },
};
</script>

<style scoped>
label {
  color: whitesmoke !important;
}
</style>
