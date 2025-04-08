import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Graph from '@/components/Graph.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/topology'
  },
  {
    path: '/topology',
    name: 'Topology',
    component: Graph,
    props: { mode: 'topology' }
  },
  {
    path: '/measure',
    name: 'Measure',
    component: Graph,
    props: { mode: 'measure' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 