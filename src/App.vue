<script setup lang="ts">
import Graph from "@/components/Graph.vue";
const theme = {
  token: {
    colorPrimary: "#01948C",
  },
};
</script>

<template>
  <a-config-provider :theme="theme">
    <Graph />
  </a-config-provider>
</template>

<style scoped></style>
