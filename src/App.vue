<script setup lang="ts">
import Graph from "@/components/Graph.vue";
</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#00b96b',
        colorBgBase:'whitesmoke',
        borderRadius: 0,
      },
    }"
  >
    <Graph />
  </a-config-provider>
</template>

<style scoped></style>
