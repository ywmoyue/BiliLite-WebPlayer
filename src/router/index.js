import { createRouter, createWebHistory } from 'vue-router'
import ShakaPlayerView from '@/views/ShakaPlayerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/index.html',
      query: { view: 'ShakaPlayerView' },
      component: ShakaPlayerView
    }
  ],
})

export default router
