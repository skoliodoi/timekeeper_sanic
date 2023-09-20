<template>
  <div class="row">
    <div class="full width column">
      <div class="ui form">
        <div class="field">
          <select class="ui dropdown" id="change-campaign">
            <option></option>
            <option>A</option>
            <option>B</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  mounted() {
    $("#change-campaign").dropdown();
  },
  data() {},
};
</script>
