<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const theme = {
  token: {
    colorPrimary: "#01948C",
  },
};

const router = useRouter();
const route = useRoute();

const menuItems = [
  { key: 'topology', label: '拓扑补全', path: '/topology' },
  { key: 'measure', label: '量测优化', path: '/measure' }
];

const handleMenuClick = (key: string) => {
  const item = menuItems.find(item => item.key === key);
  if (item) {
    router.push(item.path);
  }
};
</script>

<template>
  <a-config-provider :theme="theme">
    <div class="app-container">
      <a-menu
        mode="horizontal"
        :selectedKeys="[route.path.substring(1)]"
        @select="({ key }) => handleMenuClick(key)"
      >
        <a-menu-item v-for="item in menuItems" :key="item.key">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
      <router-view />
    </div>
  </a-config-provider>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

:deep(.ant-menu) {
  padding: 0 20px;
}
</style>
