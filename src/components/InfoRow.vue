<template>
  <div class="info-container">
    <div class="info-title">{{ title }}：</div>
    <slot v-if="$slots.default"></slot>
    <div v-else>{{ value }}</div>
    <div v-if="suffix">{{ suffix }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
  value: {
    type: String,
  },
  suffix: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.info-container {
  display: flex;
  justify-content: start;
  align-items: center;
  margin-right: 5px;
}
.info-title {
  margin-right: 5px;
}
</style>
