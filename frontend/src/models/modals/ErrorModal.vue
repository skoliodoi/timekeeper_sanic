<template>
  <div class="ui mini inverted modal">
    <div class="centered header">Error!</div>
    <div class="centered content">
      <p>{{ message }}</p>
    </div>
    <div class="center aligned actions">
      <div
        class="ui negative right labeled icon button"
        @click="$emit('errorAction', false)"
      >
        {{ retryOption ? "Cancel" : "Ok " }}
        <i class="icon" :class="{ 'times': retryOption, checkmark: !retryOption }"></i>
      </div>
      <div
        v-show="retryOption"
        class="ui positive right labeled icon button"
        @click="$emit('errorAction', true)"
      >
        Try again!
        <i class="refresh icon"></i>
      </div>
    </div>
    <div class="ui inverted segment" style="margin: 0">
      <div class="ui inverted accordion">
        <div class="title" style="text-align: center">
          <i class="dropdown icon"></i>
          See error details:
        </div>
        <div
          class="content"
          style="display: flex; flex-direction: row; justify-content: center"
        >
          <p class="transition hidden" style="text-align: center">{{ errorDetails }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["message", "errorDetails", "retryOption"],
  emits: ["errorAction"],
  mounted() {
    $(".ui.accordion").accordion();
  },
  updated() {
    $(".ui.accordion").accordion();
  },
};
</script>

<style>
</style>