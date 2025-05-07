import { createRouter, createWebHistory } from 'vue-router'
import ShakaPlayerView from '@/views/ShakaPlayerView.vue'
import MpegtsPlayerView from '@/views/MpegtsPlayerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/index.html',
      query: { view: 'ShakaPlayerView' },
      component: ShakaPlayerView
    },
    {
      path: '/index.html',
      query: { view: 'MpegtsPlayerView' },
      component: MpegtsPlayerView
    }
  ],
})

export default router
